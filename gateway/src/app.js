'use strict';

const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { loadConfig } = require('./config');
const { GatewayError, errorEnvelope } = require('./errors');
const { createMetadataLogger } = require('./logger');
const { validateAssessmentRequest, validators } = require('./schema');
const { SqliteAuthService } = require('./auth/session-store');
const { createRateLimitMiddleware } = require('./auth/rate-limit');
const { AttestationService } = require('./attestation');
const { createPlatformEvidenceProbe } = require('./evidence-probe');
const { PlatformAdapter } = require('./platform-adapter');
const { SyntheticFixtureAdapter } = require('./synthetic-fixture-adapter');

function safeRequestId(req) {
  const candidate = req.headers['x-request-id'] || (req.body && req.body.requestId);
  return typeof candidate === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
    ? candidate : crypto.randomUUID();
}

/** The client's original scheme as reported by the edge, or 'direct' when absent. */
function forwardedScheme(req) {
  const value = String(req.headers['x-forwarded-proto'] || '').toLowerCase().split(',')[0].trim();
  return value === 'https' || value === 'http' ? value : 'direct';
}

function createApp(options = {}) {
  const config = options.config || loadConfig(options.env);
  const logger = options.logger || createMetadataLogger();
  const auth = options.authService || new SqliteAuthService({
    storePath: config.authStorePath,
    pepperPath: config.authPepperPath,
    expectedClientBuildId: config.expectedClientBuildId,
    previousClientBuildIds: config.previousClientBuildIds || [],
  });
  const evidenceProbe = options.evidenceProbe || createPlatformEvidenceProbe({
    ...(config.evidence || {}),
    timeoutMs: config.upstreamTimeoutMs,
    fetchImpl: options.fetchImpl,
    statImpl: options.statImpl,
    createReadStreamImpl: options.createReadStreamImpl,
  });
  const attestation = options.attestationService || new AttestationService({ expected: config.expectedEvidence, evidenceProbe });
  const platform = options.platformAdapter || new PlatformAdapter({
    upstreamInferUrl: config.upstreamInferUrl,
    timeoutMs: config.upstreamTimeoutMs,
    fetchImpl: options.fetchImpl,
  });
  const synthetic = options.syntheticAdapter || new SyntheticFixtureAdapter({
    fixture: options.fixture,
    approvedEvidence: config.expectedEvidence,
    approvedCaptureRoute: config.upstreamInferUrl,
  });
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.allowedOrigin, methods: ['GET', 'POST'], allowedHeaders: ['authorization', 'content-type', 'x-acr-contract', 'x-request-id', 'x-device-binding', 'x-client-build-id'] }));
  // Build 45 / G3-02: when a dedicated public hostname is configured, only
  // requests that arrived through it may reach the routes. This is enforced in
  // addition to the edge ingress rules, not instead of them, so a request that
  // reaches the loopback origin by any other path is refused. Unset by default,
  // which preserves the supervised-LAN posture used by Gates 4-9.
  if (config.publicHostname) {
    app.use((req, res, next) => {
      const host = String(req.headers.host || '').toLowerCase().split(':')[0];
      if (host !== config.publicHostname) {
        return next(new GatewayError('MISDIRECTED_REQUEST',
          'Request did not arrive through the approved gateway hostname.', 421, false, 'NOT_SUBMITTED'));
      }
      // AT-14 defence in depth (P2). The Cloudflare WAF rule blocks cleartext at
      // the edge; this refuses to PROCESS anything the edge did not forward as
      // https, so the origin stays TLS-only even if the edge rule regresses.
      // Observed live: cloudflared forwards X-Forwarded-Proto: https. A request
      // without it did not come through the edge and is refused too.
      if (forwardedScheme(req) !== 'https') {
        return next(new GatewayError('TLS_REQUIRED',
          'Only TLS requests forwarded by the approved edge are accepted.', 403, false, 'NOT_SUBMITTED'));
      }
      next();
    });
  }
  app.use(express.json({ limit: '16kb' }));
  // AUTH-08: rate limiting is applied ahead of authentication, so brute force
  // never reaches credential verification. Persisted in SQLite so a restart
  // cannot clear a lockout (AT-09 with AT-11).
  if (auth && auth.db) app.use(createRateLimitMiddleware({ db: auth.db }));
  app.use((req, res, next) => {
    const started = Date.now();
    res.on('finish', () => logger.emit('request.complete', {
      requestId: safeRequestId(req), route: req.route ? req.route.path : req.path,
      method: req.method, status: res.statusCode, durationMs: Date.now() - started,
      scheme: forwardedScheme(req),
    }));
    next();
  });
  if (options.preRouteMiddleware) {
    const middleware = Array.isArray(options.preRouteMiddleware)
      ? options.preRouteMiddleware : [options.preRouteMiddleware];
    middleware.forEach(item => app.use(item));
  }

  function authenticate(req, res, next) {
    try {
      req.authFamily = auth.authenticate(req.headers.authorization, req.headers['x-device-binding'], req.headers['x-client-build-id']);
      next();
    } catch (error) {
      next(error);
    }
  }

  function validateInferenceRequest(req) {
    if (req.headers['x-acr-contract'] !== 'acr.cds.v1') {
      throw new GatewayError('SCHEMA_INVALID', 'X-ACR-Contract must be acr.cds.v1.', 400);
    }
    const body = validateAssessmentRequest(req.body);
    // The header build was already checked against the session by
    // authenticate(); during a Build 46 changeover the body must name that same
    // build, which is the current one or a listed previous one.
    const acceptedBuilds = [config.expectedClientBuildId, ...(config.previousClientBuildIds || [])];
    if (!acceptedBuilds.includes(body.client.buildId) || body.client.buildId !== req.headers['x-client-build-id']) {
      throw new GatewayError('CLIENT_BUILD_MISMATCH', 'Request body is not authorised for this client build.', 403);
    }
    if (req.headers['x-request-id'] !== body.requestId) {
      throw new GatewayError('REQUEST_ID_MISMATCH', 'Header and body request IDs do not match.', 400);
    }
    return body;
  }

  app.get('/m/v1/live', (req, res) => res.json({ status: 'UP' }));

  app.post('/m/v1/auth/redeem', (req, res, next) => {
    try {
      const body = req.body || {};
      if (typeof body.inviteCode !== 'string' || !body.inviteCode.trim()
          || typeof body.deviceBinding !== 'string' || !body.deviceBinding.trim()
          || typeof body.clientBuildId !== 'string' || !body.clientBuildId.trim()) {
        throw new GatewayError('SCHEMA_INVALID', 'inviteCode, deviceBinding and clientBuildId are required.', 400);
      }
      res.json(auth.redeem(body.inviteCode, body.deviceBinding, body.clientBuildId));
    } catch (error) { next(error); }
  });

  app.post('/m/v1/auth/refresh', (req, res, next) => {
    try {
      if (!req.body || typeof req.body.refreshToken !== 'string' || typeof req.body.deviceBinding !== 'string' || typeof req.body.clientBuildId !== 'string') {
        throw new GatewayError('SCHEMA_INVALID', 'refreshToken, deviceBinding and clientBuildId are required.', 400);
      }
      res.json(auth.refresh(req.body.refreshToken, req.body.deviceBinding, req.body.clientBuildId));
    } catch (error) { next(error); }
  });

  app.get('/m/v1/attestation', authenticate, async (req, res, next) => {
    try {
      const result = await attestation.assess();
      if (!validators.attestation(result)) throw new Error('Internal attestation schema violation');
      res.json(result);
    } catch (error) { next(error); }
  });

  async function inferenceHandler(adapter, requireLiveAttestation, req, res, next) {
    try {
      const body = validateInferenceRequest(req);
      const verification = await attestation.assess();
      if (requireLiveAttestation && verification.verificationState !== 'VERIFIED') {
        const code = verification.verificationState === 'MISMATCH' ? 'ATTESTATION_MISMATCH' : 'ATTESTATION_UNAVAILABLE';
        throw new GatewayError(code, 'The connected reasoner baseline could not be verified.', 503, true);
      }
      const result = await adapter.infer(body);
      result.delivery = {
        ...result.delivery,
        currentVerificationState: verification.verificationState,
        currentPlatformEvidence: verification.observed,
      };
      if (!validators.response(result)) throw new GatewayError('INVALID_UPSTREAM_RESPONSE', 'Gateway response failed its contract.', 500, false, 'FAILED');
      logger.emit('inference.complete', { requestId: body.requestId, resultMode: result.resultMode, reasoningMode: result.reasoningMode, status: 200 });
      res.json(result);
    } catch (error) { next(error); }
  }

  app.post('/m/v1/infer', authenticate, (req, res, next) => inferenceHandler(platform, true, req, res, next));
  app.post('/m/v1/demo/infer', authenticate, (req, res, next) => inferenceHandler(synthetic, false, req, res, next));

  if (typeof options.installTestRoutes === 'function') options.installTestRoutes(app, { auth, attestation });

  app.use((error, req, res, next) => {
    void next;
    let mapped = error;
    if (error && error.type === 'entity.too.large') mapped = new GatewayError('PAYLOAD_TOO_LARGE', 'Request body exceeds 16kb.', 413);
    else if (error instanceof SyntaxError && error.status === 400) mapped = new GatewayError('SCHEMA_INVALID', 'Request body is not valid JSON.', 400);
    if (!(mapped instanceof GatewayError)) mapped = new GatewayError('SERVICE_UNAVAILABLE', 'An unexpected gateway error occurred.', 500, true);
    const requestId = safeRequestId(req);
    logger.emit('request.error', { requestId, route: req.path, method: req.method, status: mapped.status, code: mapped.code });
    res.status(mapped.status).json(errorEnvelope(mapped, requestId));
  });

  return app;
}

module.exports = { createApp, safeRequestId, forwardedScheme };
