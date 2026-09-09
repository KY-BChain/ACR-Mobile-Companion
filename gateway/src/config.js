'use strict';

const path = require('path');

const DEFAULT_TIMEOUT_MS = 8000;
const MIN_TIMEOUT_MS = 250;
const MAX_TIMEOUT_MS = 30000;
const PINNED_EXPECTED_EVIDENCE = Object.freeze({
  reasonerVersion: 'v2.2',
  reasoningMode: 'OPENLLET_SWRL',
  ontologySha256: 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1',
  logicalRuleCount: 71,
  physicalRuleCount: 76,
  activeRuleCount: 76,
  loadedRuleCount: 76,
  queryCount: 27,
});

function isLoopbackHost(hostname) {
  return ['127.0.0.1', 'localhost', '[::1]', '::1'].includes(hostname.toLowerCase());
}

function parseUrl(value, name) {
  if (!value) return null;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute HTTP(S) URL`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS`);
  }
  if (parsed.protocol === 'http:' && !isLoopbackHost(parsed.hostname)) {
    throw new Error(`${name} may use plaintext HTTP only for an approved loopback host`);
  }
  return parsed.toString();
}

function parseEvidenceUrl(value, name, requiredPath) {
  const result = parseUrl(value, name);
  if (!result) return null;
  const parsed = new URL(result);
  if (parsed.pathname !== requiredPath || parsed.search || parsed.hash) {
    throw new Error(`${name} must identify exactly ${requiredPath}`);
  }
  return result;
}

function parseInferUrl(value, name) {
  const result = parseUrl(value, name);
  if (!result) return null;
  const parsed = new URL(result);
  if (parsed.pathname !== '/api/infer' || parsed.search || parsed.hash) {
    throw new Error(`${name} must identify exactly /api/infer`);
  }
  return result;
}

function parseSha256(value, name, { required = false } = {}) {
  if (!value && !required) return null;
  if (!/^[0-9a-f]{64}$/i.test(value || '')) throw new Error(`${name} must be a complete SHA-256 value`);
  return value.toLowerCase();
}

function parseExpectedCount(value, name, fallback) {
  if (typeof value === 'string' && !value.trim()) throw new Error(`${name} must be a non-negative integer`);
  const candidate = value == null ? fallback : Number(value);
  if (!Number.isInteger(candidate) || candidate < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return candidate;
}

function parseExpectedMode(value) {
  const mode = value == null ? 'OPENLLET_SWRL' : value;
  if (!['OPENLLET_SWRL', 'JAVA_HARDCODED_FALLBACK'].includes(mode)) {
    throw new Error('ACR_EXPECTED_REASONING_MODE is not a recognised platform reasoning mode');
  }
  return mode;
}

function loadPinnedExpectedEvidence(env) {
  const configured = {
    reasonerVersion: (() => {
      const value = env.ACR_EXPECTED_REASONER_VERSION == null ? PINNED_EXPECTED_EVIDENCE.reasonerVersion : env.ACR_EXPECTED_REASONER_VERSION;
      if (typeof value !== 'string' || !value.trim()) throw new Error('ACR_EXPECTED_REASONER_VERSION must be non-empty');
      return value;
    })(),
    reasoningMode: parseExpectedMode(env.ACR_EXPECTED_REASONING_MODE),
    ontologySha256: parseSha256(env.ACR_EXPECTED_ONTOLOGY_SHA256 == null ? PINNED_EXPECTED_EVIDENCE.ontologySha256 : env.ACR_EXPECTED_ONTOLOGY_SHA256, 'ACR_EXPECTED_ONTOLOGY_SHA256', { required: true }),
    logicalRuleCount: parseExpectedCount(env.ACR_EXPECTED_LOGICAL_RULE_COUNT, 'ACR_EXPECTED_LOGICAL_RULE_COUNT', PINNED_EXPECTED_EVIDENCE.logicalRuleCount),
    physicalRuleCount: parseExpectedCount(env.ACR_EXPECTED_PHYSICAL_RULE_COUNT, 'ACR_EXPECTED_PHYSICAL_RULE_COUNT', PINNED_EXPECTED_EVIDENCE.physicalRuleCount),
    activeRuleCount: parseExpectedCount(env.ACR_EXPECTED_ACTIVE_RULE_COUNT, 'ACR_EXPECTED_ACTIVE_RULE_COUNT', PINNED_EXPECTED_EVIDENCE.activeRuleCount),
    loadedRuleCount: parseExpectedCount(env.ACR_EXPECTED_LOADED_RULE_COUNT, 'ACR_EXPECTED_LOADED_RULE_COUNT', PINNED_EXPECTED_EVIDENCE.loadedRuleCount),
    queryCount: parseExpectedCount(env.ACR_EXPECTED_QUERY_COUNT, 'ACR_EXPECTED_QUERY_COUNT', PINNED_EXPECTED_EVIDENCE.queryCount),
  };
  for (const [field, pinned] of Object.entries(PINNED_EXPECTED_EVIDENCE)) {
    if (configured[field] !== pinned) throw new Error(`Build 44 expected evidence is pinned; ${field} cannot be overridden`);
  }
  return PINNED_EXPECTED_EVIDENCE;
}

function assertPinnedExpectedEvidence(value, name = 'expectedEvidence') {
  if (!value || Object.entries(PINNED_EXPECTED_EVIDENCE).some(([field, pinned]) => value[field] !== pinned)) {
    throw new Error(`${name} must equal the pinned Build 44 evidence baseline`);
  }
  return PINNED_EXPECTED_EVIDENCE;
}

function parseTimeout(value) {
  if (value == null || value === '') return DEFAULT_TIMEOUT_MS;
  const timeout = Number(value);
  if (!Number.isInteger(timeout) || timeout < MIN_TIMEOUT_MS || timeout > MAX_TIMEOUT_MS) {
    throw new Error(`ACR_UPSTREAM_TIMEOUT_MS must be an integer from ${MIN_TIMEOUT_MS} to ${MAX_TIMEOUT_MS}`);
  }
  return timeout;
}

function parseClientBuildId(value) {
  const buildId = value || 'mob-v0.6.5+45';
  if (!/^mob-v\d+\.\d+\.\d+\+\d+$/.test(buildId)) {
    throw new Error('ACR_EXPECTED_CLIENT_BUILD_ID must use mob-v<semver>+<build> format');
  }
  return buildId;
}

/**
 * Optional dedicated public hostname the gateway is reached through (Build 45:
 * mobile-gateway-review.acragent.com, served by the acr-mobile-review tunnel).
 * Bare hostname only — no scheme, port, path or credentials. When unset the
 * gateway accepts any Host, which is the supervised-LAN posture. When set, the
 * gateway rejects requests that did not arrive via that hostname, so a
 * misdirected or directly-addressed request cannot reach the routes.
 */
function parsePublicHostname(value) {
  if (value == null || value === '') return null;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(value)) {
    throw new Error('ACR_PUBLIC_HOSTNAME must be a bare DNS hostname without scheme, port or path');
  }
  return value.toLowerCase();
}

function loadConfig(env = process.env) {
  const host = env.ACR_GATEWAY_HOST || '127.0.0.1';
  if (host !== '127.0.0.1' && host !== '::1' && env.ACR_ALLOW_PRIVATE_LAN !== 'true') {
    throw new Error('Non-loopback binding requires ACR_ALLOW_PRIVATE_LAN=true');
  }
  const port = Number(env.ACR_GATEWAY_PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('ACR_GATEWAY_PORT must be an integer from 1 to 65535');
  }
  const upstreamInferUrl = parseInferUrl(env.ACR_UPSTREAM_INFER_URL, 'ACR_UPSTREAM_INFER_URL');
  const evidence = {
    statusUrl: parseEvidenceUrl(env.ACR_EVIDENCE_STATUS_URL, 'ACR_EVIDENCE_STATUS_URL', '/api/ontolator/status'),
    manifestUrl: parseEvidenceUrl(env.ACR_EVIDENCE_MANIFEST_URL, 'ACR_EVIDENCE_MANIFEST_URL', '/api/ontolator/manifest'),
    healthUrl: parseEvidenceUrl(env.ACR_EVIDENCE_HEALTH_URL, 'ACR_EVIDENCE_HEALTH_URL', '/api/infer/health'),
    ontologyPath: env.ACR_EVIDENCE_ONTOLOGY_PATH || null,
  };
  const fixtureDirectory = env.ACR_SYNTHETIC_FIXTURE_DIR || null;
  if (fixtureDirectory && !path.isAbsolute(fixtureDirectory)) {
    throw new Error('ACR_SYNTHETIC_FIXTURE_DIR must be an absolute explicitly allowlisted directory');
  }
  const evidenceValues = Object.values(evidence);
  const configuredEvidenceCount = evidenceValues.filter(Boolean).length;
  if (configuredEvidenceCount !== 0 && configuredEvidenceCount !== evidenceValues.length) {
    throw new Error('All evidence URLs and ACR_EVIDENCE_ONTOLOGY_PATH must be configured together');
  }
  if (configuredEvidenceCount === evidenceValues.length) {
    if (!upstreamInferUrl) throw new Error('Evidence probing requires ACR_UPSTREAM_INFER_URL');
    const origin = new URL(upstreamInferUrl).origin;
    if ([evidence.statusUrl, evidence.manifestUrl, evidence.healthUrl].some(url => new URL(url).origin !== origin)) {
      throw new Error('Evidence URLs must use the same verified origin as ACR_UPSTREAM_INFER_URL');
    }
    if (!path.isAbsolute(evidence.ontologyPath) || path.basename(evidence.ontologyPath) !== 'ACR_Ontology_Full_v2_2.owl') {
      throw new Error('ACR_EVIDENCE_ONTOLOGY_PATH must be an absolute canonical ontology path');
    }
  }
  return Object.freeze({
    host,
    port,
    upstreamInferUrl,
    upstreamTimeoutMs: parseTimeout(env.ACR_UPSTREAM_TIMEOUT_MS),
    allowedOrigin: env.ACR_ALLOWED_ORIGIN || false,
    publicHostname: parsePublicHostname(env.ACR_PUBLIC_HOSTNAME),
    inviteCodeSha256: parseSha256(env.ACR_INVITE_CODE_SHA256, 'ACR_INVITE_CODE_SHA256'),
    expectedClientBuildId: parseClientBuildId(env.ACR_EXPECTED_CLIENT_BUILD_ID),
    fixtureDirectory,
    evidence: Object.freeze(evidence),
    expectedEvidence: loadPinnedExpectedEvidence(env),
  });
}

module.exports = { loadConfig, parseTimeout, parseUrl, parseInferUrl, parseEvidenceUrl, parseSha256, parseExpectedCount, parseExpectedMode, parseClientBuildId, parsePublicHostname, loadPinnedExpectedEvidence, assertPinnedExpectedEvidence, PINNED_EXPECTED_EVIDENCE, isLoopbackHost, DEFAULT_TIMEOUT_MS };
