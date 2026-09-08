'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('../../gateway/node_modules/supertest');
const { createApp } = require('../../gateway/src/app');
const { PersistentAuthService, initialiseAuthFiles, inviteHash, atomicWrite } = require('../t3-gateway/persistent-auth');
const { createRateLimiter } = require('../t3-gateway/rate-limit');
const { evidence, mobileRequest, platformResponse } = require('../../gateway/tests/helpers');
const { validators } = require('../../gateway/src/schema');

const BUILD = 'mob-v0.6.5+45';
const PROOF = 'install-proof-integration-001';

test('persistent Build 45 auth composes with the six-route gateway contract', async () => {
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'acr-t45-http-'));
  try {
    const storePath = path.join(directory, 'auth.json');
    const pepperPath = path.join(directory, 'pepper.bin');
    initialiseAuthFiles({ storePath, pepperPath });
    const code = `ACR45-${crypto.randomBytes(24).toString('base64url')}`;
    const salt = crypto.randomBytes(16);
    const state = JSON.parse(fs.readFileSync(storePath));
    state.invites.push({ id: crypto.randomUUID(), label: 'http-test', salt: salt.toString('hex'),
      hash: inviteHash(code, salt, fs.readFileSync(pepperPath)), createdAt: Date.now(),
      expiresAt: Date.now() + 60000, maxRedemptions: 1, redemptions: 0, revokedAt: null });
    atomicWrite(storePath, state);
    const authService = new PersistentAuthService({ storePath, pepperPath, expectedClientBuildId: BUILD });
    const app = createApp({
      config: { upstreamInferUrl: 'https://api.acragent.com/api/infer', upstreamTimeoutMs: 1000,
        allowedOrigin: false, expectedEvidence: evidence, expectedClientBuildId: BUILD, evidence: {}, fixtureDirectory: null },
      authService, evidenceProbe: async () => ({ ...evidence }),
      platformAdapter: { infer: async body => ({
        contract: 'acr.cds.v1', requestId: body.requestId, status: 'COMPLETED', completedAt: new Date().toISOString(),
        resultMode: 'LIVE_REASONER', reasoningMode: 'OPENLLET_SWRL', data: platformResponse().data,
        platformResponse: platformResponse(), delivery: { source: 'CONFIGURED_PLATFORM', currentExecution: true, capturedPlatform: null }, warnings: [],
      }) },
      preRouteMiddleware: createRateLimiter({ generalMax: 20, authMax: 3 }),
    });
    assert.deepEqual((await request(app).get('/m/v1/live')).body, { status: 'UP' });
    const issued = await request(app).post('/m/v1/auth/redeem').send({ inviteCode: code, deviceBinding: PROOF, clientBuildId: BUILD });
    assert.equal(issued.status, 200);
    const attestation = await request(app).get('/m/v1/attestation')
      .set('Authorization', `Bearer ${issued.body.accessToken}`)
      .set('X-Device-Binding', PROOF).set('X-Client-Build-ID', BUILD);
    assert.equal(attestation.status, 200);
    assert.equal(attestation.body.verificationState, 'VERIFIED');
    const denied = await request(app).get('/m/v1/attestation')
      .set('Authorization', `Bearer ${issued.body.accessToken}`)
      .set('X-Device-Binding', 'different-install-proof').set('X-Client-Build-ID', BUILD);
    assert.equal(denied.status, 403);
    assert.equal(denied.body.contract, 'acr.error.v1');

    const requestBody = mobileRequest();
    requestBody.client.buildId = BUILD;
    const sendInference = body => request(app).post('/m/v1/infer')
      .set('Authorization', `Bearer ${issued.body.accessToken}`)
      .set('X-Device-Binding', PROOF).set('X-Client-Build-ID', BUILD)
      .set('X-ACR-Contract', 'acr.cds.v1').set('X-Request-ID', body.requestId).send(body);
    const completed = await sendInference(requestBody);
    assert.equal(completed.status, 200);
    assert.equal(completed.body.resultMode, 'LIVE_REASONER');
    const mismatchedBody = mobileRequest();
    const mismatch = await sendInference(mismatchedBody);
    assert.equal(mismatch.status, 403);
    assert.equal(mismatch.body.error.code, 'CLIENT_BUILD_MISMATCH');

    await request(app).post('/m/v1/auth/refresh').send({});
    await request(app).post('/m/v1/auth/refresh').send({});
    const limited = await request(app).post('/m/v1/auth/refresh')
      .set('X-Request-ID', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa').send({});
    assert.equal(limited.status, 429);
    assert.equal(validators.error(limited.body), true);
    assert.match(limited.body.requestId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
