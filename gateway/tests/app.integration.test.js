'use strict';

const request = require('supertest');
const { createApp, safeRequestId } = require('../src/app');
const { InMemoryAuthService } = require('../src/auth');
const { AttestationService } = require('../src/attestation');
const { createMetadataLogger } = require('../src/logger');
const { SyntheticFixtureAdapter, sha256 } = require('../src/synthetic-fixture-adapter');
const { validators } = require('../src/schema');
const { mobileRequest, platformResponse, evidence, REQUEST_ID, PATIENT_ID } = require('./helpers');
const crypto = require('crypto');

const INVITE_CODE = 'correct-local-invite';
const INVITE_SHA256 = crypto.createHash('sha256').update(INVITE_CODE).digest('hex');
const DEVICE = 'test-device-binding-001';
const BUILD = 'mob-v0.6.5+45';

function testApp(options = {}) {
  return createApp({
    config: {
      upstreamInferUrl: 'https://configured.example/api/infer', upstreamTimeoutMs: 1000,
      allowedOrigin: false, expectedEvidence: evidence, inviteCodeSha256: INVITE_SHA256,
      expectedClientBuildId: BUILD, evidence: {},
    },
    evidenceProbe: async () => ({ ...evidence }),
    platformAdapter: { infer: async body => ({
      contract: 'acr.cds.v1', requestId: body.requestId, status: 'COMPLETED', completedAt: new Date().toISOString(),
      resultMode: 'LIVE_REASONER', reasoningMode: 'OPENLLET_SWRL', data: platformResponse().data,
      platformResponse: platformResponse(), delivery: { source: 'CONFIGURED_PLATFORM', currentExecution: true, capturedPlatform: null }, warnings: [],
    }) },
    ...options,
  });
}

async function tokenFor(app, { inviteCode = INVITE_CODE, deviceBinding = DEVICE, clientBuildId = BUILD } = {}) {
  const response = await request(app).post('/m/v1/auth/redeem').send({ inviteCode, deviceBinding, clientBuildId });
  return response.body;
}

function protectedHeaders(agent, token, deviceBinding = DEVICE, clientBuildId = BUILD) {
  return agent.set('Authorization', `Bearer ${token}`).set('X-Device-Binding', deviceBinding).set('X-Client-Build-ID', clientBuildId);
}

function infer(agent, token, body = mobileRequest(), route = '/m/v1/infer', deviceBinding = DEVICE, clientBuildId = BUILD) {
  return protectedHeaders(agent.post(route), token, deviceBinding, clientBuildId)
    .set('X-ACR-Contract', 'acr.cds.v1').set('X-Request-ID', body.requestId).send(body);
}

describe('app composition and HTTP contract', () => {
  test('only a UUIDv4 caller request ID is accepted for correlation', () => {
    expect(safeRequestId({ headers: { 'x-request-id': REQUEST_ID } })).toBe(REQUEST_ID);
    const generated = safeRequestId({ headers: { 'x-request-id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } });
    expect(generated).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
  test('module import exports composition without listening', () => {
    const exported = require('../src');
    expect(exported).toEqual(expect.objectContaining({ createApp: expect.any(Function), startListener: expect.any(Function) }));
    expect(exported).not.toHaveProperty('address');
  });

  test('liveness exposes no baseline or patient metadata', async () => {
    const response = await request(testApp()).get('/m/v1/live');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'UP' });
  });

  test('auth is required and valid live response passes schema', async () => {
    const app = testApp();
    expect((await infer(request(app), 'bad')).status).toBe(401);
    const issued = await tokenFor(app);
    const response = await infer(request(app), issued.accessToken);
    expect(response.status).toBe(200);
    expect(validators.response(response.body)).toBe(true);
    expect(response.body.data.patientId).toBe(PATIENT_ID);
  });

  test('header/body correlation and contract headers fail closed', async () => {
    const app = testApp(); const issued = await tokenFor(app);
    const mismatch = await protectedHeaders(request(app).post('/m/v1/infer'), issued.accessToken).set('X-ACR-Contract', 'acr.cds.v1').set('X-Request-ID', 'b720e8e5-9f65-4eb7-b2b3-36f28f3a7152').send(mobileRequest());
    expect(mismatch.status).toBe(400); expect(mismatch.body.error.code).toBe('REQUEST_ID_MISMATCH');
    const missing = await protectedHeaders(request(app).post('/m/v1/infer'), issued.accessToken).set('X-Request-ID', REQUEST_ID).send(mobileRequest());
    expect(missing.body.error.code).toBe('SCHEMA_INVALID');
    // Superseded Build 44 client identity must be rejected by the Build 45 gateway.
    const wrongBodyBuild = mobileRequest(); wrongBodyBuild.client.buildId = 'mob-v0.6.0+44';
    const buildMismatch = await infer(request(app), issued.accessToken, wrongBodyBuild);
    expect(buildMismatch.status).toBe(403); expect(buildMismatch.body.error.code).toBe('CLIENT_BUILD_MISMATCH');
  });

  test('schema error reveals no patient values', async () => {
    const app = testApp(); const issued = await tokenFor(app);
    const body = mobileRequest({ erStatus: 'SENTINEL-SECRET' });
    const response = await infer(request(app), issued.accessToken, body);
    expect(response.status).toBe(400);
    expect(JSON.stringify(response.body)).not.toContain('SENTINEL');
    expect(JSON.stringify(response.body)).not.toContain(PATIENT_ID);
    expect(validators.error(response.body)).toBe(true);
  });

  test('JSON/body-size security controls retained', async () => {
    const app = testApp();
    const malformed = await request(app).post('/m/v1/auth/redeem').set('content-type', 'application/json').send('{');
    expect(malformed.body.error.code).toBe('SCHEMA_INVALID');
    const large = await request(app).post('/m/v1/auth/redeem').send({ inviteCode: 'x'.repeat(17000), deviceBinding: 'd', clientBuildId: 'b' });
    expect(large.status).toBe(413); expect(large.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    expect((await request(app).get('/m/v1/live')).headers).toHaveProperty('x-content-type-options', 'nosniff');
  });

  test('demo route is explicit and never an automatic live fallback', async () => {
    const app = testApp({
      platformAdapter: { infer: async () => { const error = new Error('offline'); error.code = 'SERVICE_UNAVAILABLE'; error.status = 503; throw error; } },
      syntheticAdapter: { infer: () => { throw Object.assign(new Error('pending'), { code: 'DEMO_FIXTURE_NOT_AVAILABLE', status: 404 }); } },
    });
    const issued = await tokenFor(app);
    const live = await infer(request(app), issued.accessToken);
    expect(live.status).toBe(500); expect(live.body).not.toHaveProperty('data');
    const demo = await infer(request(app), issued.accessToken, mobileRequest(), '/m/v1/demo/infer');
    expect(demo.status).toBe(500); expect(demo.body).not.toHaveProperty('data');
  });

  test('verified explicit replay works while live attestation is unavailable and separates both provenances', async () => {
    const fixtureRequest = mobileRequest();
    const capturedResponse = platformResponse();
    const manifest = {
      verificationStatus: 'VERIFIED_PLATFORM_CAPTURE', eligibleForDeliveredReplay: true, syntheticOrigin: true, captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM',
      provenance: {
        reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: evidence.ontologySha256,
        logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27, capturedAt: '2026-08-31T10:00:00.000Z', captureRoute: 'https://configured.example/api/infer',
      },
      requestSha256: sha256(fixtureRequest), responseSha256: sha256(capturedResponse),
    };
    const app = testApp({
      evidenceProbe: async () => null,
      syntheticAdapter: new SyntheticFixtureAdapter({ fixture: { request: fixtureRequest, platformResponse: capturedResponse, manifest }, approvedEvidence: evidence, approvedCaptureRoute: 'https://configured.example/api/infer', now: () => Date.parse('2026-09-01T00:00:00Z') }),
    });
    const issued = await tokenFor(app);
    const live = await infer(request(app), issued.accessToken);
    expect(live.status).toBe(503);
    const demo = await infer(request(app), issued.accessToken, fixtureRequest, '/m/v1/demo/infer');
    expect(demo.status).toBe(200);
    expect(demo.body).toEqual(expect.objectContaining({ resultMode: 'LOCAL_SYNTHETIC_DEMO', reasoningMode: 'NOT_EXECUTED' }));
    expect(demo.body.delivery.currentVerificationState).toBe('UNAVAILABLE');
    expect(demo.body.delivery.currentPlatformEvidence.ontologySha256).toBeNull();
    expect(demo.body.delivery.capturedPlatform.provenance.ontologySha256).toBe(evidence.ontologySha256);
    expect(validators.response(demo.body)).toBe(true);
  });
});

describe('attestation and token lifecycle', () => {
  test('invite policy rejects missing configuration, bad invite and wrong client build', async () => {
    const unconfigured = testApp({ authService: new InMemoryAuthService() });
    expect((await request(unconfigured).post('/m/v1/auth/redeem').send({ inviteCode: INVITE_CODE, deviceBinding: DEVICE, clientBuildId: BUILD })).body.error.code)
      .toBe('INVITE_CONFIGURATION_REQUIRED');
    const app = testApp();
    expect((await request(app).post('/m/v1/auth/redeem').send({ inviteCode: 'wrong-invite', deviceBinding: DEVICE, clientBuildId: BUILD })).body.error.code)
      .toBe('INVITE_INVALID');
    expect((await request(app).post('/m/v1/auth/redeem').send({ inviteCode: INVITE_CODE, deviceBinding: DEVICE, clientBuildId: 'mob-v0.5.1+43' })).body.error.code)
      .toBe('CLIENT_BUILD_MISMATCH');
  });

  test.each(['/m/v1/attestation', '/m/v1/infer', '/m/v1/demo/infer'])('protected route %s rejects device and build mismatch', async route => {
    const app = testApp(); const issued = await tokenFor(app);
    const make = (device, build) => route.endsWith('attestation')
      ? protectedHeaders(request(app).get(route), issued.accessToken, device, build)
      : infer(request(app), issued.accessToken, mobileRequest(), route, device, build);
    expect((await make('different-device', BUILD)).body.error.code).toBe('DEVICE_BINDING_MISMATCH');
    expect((await make(DEVICE, 'mob-v0.5.1+43')).body.error.code).toBe('CLIENT_BUILD_MISMATCH');
  });

  test('refresh enforces original device and exact build binding', async () => {
    const app = testApp(); const issued = await tokenFor(app);
    const wrongDevice = await request(app).post('/m/v1/auth/refresh').send({ refreshToken: issued.refreshToken, deviceBinding: 'different-device', clientBuildId: BUILD });
    expect(wrongDevice.body.error.code).toBe('DEVICE_BINDING_MISMATCH');
    const wrongBuild = await request(app).post('/m/v1/auth/refresh').send({ refreshToken: issued.refreshToken, deviceBinding: DEVICE, clientBuildId: 'mob-v0.5.1+43' });
    expect(wrongBuild.body.error.code).toBe('CLIENT_BUILD_MISMATCH');
    const rotated = await request(app).post('/m/v1/auth/refresh').send({ refreshToken: issued.refreshToken, deviceBinding: DEVICE, clientBuildId: BUILD });
    expect(rotated.status).toBe(200);
  });

  test('UNAVAILABLE observed evidence and last-success fields are null, not copied expected', async () => {
    const app = testApp({ evidenceProbe: async () => null }); const issued = await tokenFor(app);
    const response = await protectedHeaders(request(app).get('/m/v1/attestation'), issued.accessToken);
    expect(response.body.verificationState).toBe('UNAVAILABLE');
    expect(response.body.observed).toEqual({ reasonerVersion: null, reasoningMode: null, ontologySha256: null, logicalRuleCount: null, physicalRuleCount: null, activeRuleCount: null, loadedRuleCount: null, queryCount: null });
    expect(response.body.lastSuccessfulVerificationTimestamp).toBeNull();
    expect(validators.attestation(response.body)).toBe(true);
  });

  test('mismatch blocks inference and observed remains actual', async () => {
    const observed = { ...evidence, logicalRuleCount: 70 };
    const app = testApp({ evidenceProbe: async () => observed }); const issued = await tokenFor(app);
    const attested = await protectedHeaders(request(app).get('/m/v1/attestation'), issued.accessToken);
    expect(attested.body.verificationState).toBe('MISMATCH'); expect(attested.body.observed.logicalRuleCount).toBe(70);
    const response = await infer(request(app), issued.accessToken);
    expect(response.status).toBe(503); expect(response.body.error.code).toBe('ATTESTATION_MISMATCH');
  });

  test('refresh rotates and reuse revokes the whole family', () => {
    const auth = new InMemoryAuthService({ inviteCodeSha256: INVITE_SHA256 });
    const first = auth.redeem(INVITE_CODE, DEVICE, BUILD); const second = auth.refresh(first.refreshToken, DEVICE, BUILD);
    expect(() => auth.refresh(first.refreshToken, DEVICE, BUILD)).toThrow(expect.objectContaining({ code: 'TOKEN_REUSE_DETECTED' }));
    expect(() => auth.authenticate(`Bearer ${second.accessToken}`, DEVICE, BUILD)).toThrow(expect.objectContaining({ code: 'AUTHENTICATION_REQUIRED' }));
  });

  test('last successful verification remains nullable until actual verified probe', async () => {
    let actual = null;
    const service = new AttestationService({ expected: evidence, evidenceProbe: async () => actual, now: () => '2026-08-31T10:00:00Z' });
    expect((await service.assess()).lastSuccessfulVerificationTimestamp).toBeNull();
    actual = { ...evidence };
    expect((await service.assess()).lastSuccessfulVerificationTimestamp).toBe('2026-08-31T10:00:00Z');
  });
});

test('metadata-only logging contains no body, patientId, result, or clinical sentinel', async () => {
  const events = [];
  const app = testApp({ logger: createMetadataLogger(event => events.push(event)) });
  const issued = await tokenFor(app);
  const body = mobileRequest({ gender: 'unknown', tumorSize: 98765.4321 });
  await infer(request(app), issued.accessToken, body);
  const serialised = JSON.stringify(events);
  expect(serialised).not.toContain(PATIENT_ID);
  expect(serialised).not.toContain('98765');
  expect(serialised).not.toContain('Luminal');
  expect(events.some(event => event.event === 'inference.complete')).toBe(true);
});
