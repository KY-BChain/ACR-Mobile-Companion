'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { loadConfig } = require('../src/config');
const { createApp } = require('../src/app');
const { createAuthFixture } = require('./auth-helpers');
const { loadFixtureBundle, FIXTURE_FILES } = require('../src/fixture-loader');
const { startListener } = require('../src/listener');
const { SyntheticFixtureAdapter, sha256 } = require('../src/synthetic-fixture-adapter');
const { AttestationService } = require('../src/attestation');
const { captureCandidate, revalidateCandidateDirectory, AUTHORIZATION_GATE } = require('../src/capture-tool');
const { mapAssessmentToPlatform } = require('../src/mapper');
const { mobileRequest, platformResponse, evidence } = require('./helpers');

const ROUTE = 'https://api.acragent.com/api/infer';

describe('client build identity configuration', () => {
  test('defaults to the Build 46 identity and accepts an explicit valid identity', () => {
    expect(loadConfig({}).expectedClientBuildId).toBe('mob-v0.6.6+47');
    expect(loadConfig({ ACR_EXPECTED_CLIENT_BUILD_ID: 'mob-v0.6.5+45' }).expectedClientBuildId).toBe('mob-v0.6.5+45');
  });

  test.each(['0.6.5+45', 'mob-v0.6+45', 'mob-v0.6.5+forty-five'])('rejects invalid identity %s', value => {
    expect(() => loadConfig({ ACR_EXPECTED_CLIENT_BUILD_ID: value })).toThrow(/EXPECTED_CLIENT_BUILD_ID/);
  });
});

function approvedFixture(overrides = {}) {
  const fixtureRequest = mobileRequest();
  const response = platformResponse();
  const manifest = {
    verificationStatus: 'VERIFIED_PLATFORM_CAPTURE', eligibleForDeliveredReplay: true,
    syntheticOrigin: true, captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM',
    provenance: {
      ...evidence, capturedAt: '2026-01-01T00:00:00.000Z', captureRoute: ROUTE,
    },
    reviewedRequestSha256: crypto.createHash('sha256').update(JSON.stringify(fixtureRequest)).digest('hex'),
    requestSha256: sha256(fixtureRequest), responseSha256: sha256(response),
  };
  const fixture = { request: fixtureRequest, platformResponse: response, manifest };
  if (overrides.manifest) Object.assign(manifest, overrides.manifest);
  if (overrides.provenance) Object.assign(manifest.provenance, overrides.provenance);
  if (overrides.response) Object.assign(response, overrides.response);
  if (overrides.request) Object.assign(fixtureRequest, overrides.request);
  return fixture;
}

function writeFixture(directory, fixture = approvedFixture()) {
  fs.mkdirSync(directory);
  fs.writeFileSync(path.join(directory, FIXTURE_FILES.request), JSON.stringify(fixture.request));
  fs.writeFileSync(path.join(directory, FIXTURE_FILES.platformResponse), JSON.stringify(fixture.platformResponse));
  fs.writeFileSync(path.join(directory, FIXTURE_FILES.manifest), JSON.stringify(fixture.manifest));
}

function listenerConfig(fixtureDirectory, auth = null) {
  return {
    host: '127.0.0.1', port: 0, upstreamInferUrl: ROUTE, upstreamTimeoutMs: 1000,
    allowedOrigin: false, expectedClientBuildId: 'mob-v0.6.5+45',
    expectedEvidence: evidence, evidence: {}, fixtureDirectory,
    authStorePath: auth ? auth.storePath : null,
    authPepperPath: auth ? auth.pepperPath : null,
  };
}

describe('production fixture loader and ordinary listener composition', () => {
  let root;
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'acr-fixture-')); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

  test('ordinary startListener loads an explicitly configured approved fixture and replays exact input', async () => {
    const directory = path.join(root, 'approved');
    const fixture = approvedFixture();
    writeFixture(directory, fixture);
    const auth = createAuthFixture();
    const server = startListener({ config: listenerConfig(directory, auth), evidenceProbe: async () => null });
    try {
      const issued = await request(server).post('/m/v1/auth/redeem').send({
        inviteCode: auth.issueInvite(), deviceBinding: 'operations-device', clientBuildId: 'mob-v0.6.5+45',
      });
      const replay = await request(server).post('/m/v1/demo/infer')
        .set('Authorization', `Bearer ${issued.body.accessToken}`)
        .set('X-Device-Binding', 'operations-device').set('X-Client-Build-ID', 'mob-v0.6.5+45')
        .set('X-ACR-Contract', 'acr.cds.v1').set('X-Request-ID', fixture.request.requestId)
        .send(fixture.request);
      expect(replay.status).toBe(200);
      expect(replay.body.delivery.capturedPlatform.response).toEqual(fixture.platformResponse);
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  });

  test('unconfigured loader is honest and returns no fixture', () => {
    expect(loadFixtureBundle({ directory: null, approvedEvidence: evidence, approvedCaptureRoute: ROUTE })).toBeNull();
  });

  test.each([
    ['hash tamper', fixture => { fixture.manifest.requestSha256 = '0'.repeat(64); }],
    ['count mismatch', fixture => { fixture.manifest.provenance.logicalRuleCount = 70; }],
    ['mode mismatch', fixture => { fixture.manifest.provenance.reasoningMode = 'JAVA_HARDCODED_FALLBACK'; }],
    ['future timestamp', fixture => { fixture.manifest.provenance.capturedAt = '2999-01-01T00:00:00.000Z'; }],
    ['wrong route', fixture => { fixture.manifest.provenance.captureRoute = 'https://other.example/api/infer'; }],
  ])('configured %s fixture fails closed at startup load', (label, edit) => {
    const directory = path.join(root, label.replaceAll(' ', '-'));
    const fixture = approvedFixture(); edit(fixture); writeFixture(directory, fixture);
    expect(() => loadFixtureBundle({ directory, approvedEvidence: evidence, approvedCaptureRoute: ROUTE })).toThrow(/failed closed/);
  });

  test('configured missing, malformed, extra-file and symlink artefacts fail closed', () => {
    const missing = path.join(root, 'missing'); writeFixture(missing); fs.unlinkSync(path.join(missing, FIXTURE_FILES.manifest));
    expect(() => loadFixtureBundle({ directory: missing, approvedEvidence: evidence, approvedCaptureRoute: ROUTE })).toThrow();
    const malformed = path.join(root, 'malformed'); writeFixture(malformed); fs.writeFileSync(path.join(malformed, FIXTURE_FILES.manifest), '{');
    expect(() => loadFixtureBundle({ directory: malformed, approvedEvidence: evidence, approvedCaptureRoute: ROUTE })).toThrow();
    const extra = path.join(root, 'extra'); writeFixture(extra); fs.writeFileSync(path.join(extra, 'extra.json'), '{}');
    expect(() => loadFixtureBundle({ directory: extra, approvedEvidence: evidence, approvedCaptureRoute: ROUTE })).toThrow();
    const linked = path.join(root, 'linked'); writeFixture(linked);
    const target = path.join(root, 'request-target.json'); fs.renameSync(path.join(linked, FIXTURE_FILES.request), target);
    fs.symlinkSync(target, path.join(linked, FIXTURE_FILES.request));
    expect(() => loadFixtureBundle({ directory: linked, approvedEvidence: evidence, approvedCaptureRoute: ROUTE })).toThrow();
  });
});

describe('bounded capture candidate and revalidation tooling', () => {
  test('active capture instructions enforce reviewer verdict, owner two-flag promotion and reviewer read-only recheck', () => {
    const readme = fs.readFileSync(path.resolve(__dirname, '../README.md'), 'utf8');
    expect(readme).toContain('independent reviewer performs a read-only candidate review and returns only a candidate PASS or failure');
    expect(readme).toContain('Only after candidate PASS, the parent/owner changes exactly `verificationStatus` to `VERIFIED_PLATFORM_CAPTURE` and `eligibleForDeliveredReplay` to `true`');
    expect(readme).toContain('independent reviewer then re-verifies the promoted three-file bundle read-only');
    expect(readme).toContain('--request-sha256=<reviewer-provided-64-hex-raw-file-sha256>');
    expect(readme).not.toMatch(/reviewer must .*promote/i);
  });

  test('direct noncanonical expected evidence cannot rebase attestation, capture or replay', async () => {
    const rebased = { ...evidence, logicalRuleCount: 70 };
    expect(() => new AttestationService({ expected: rebased })).toThrow(/pinned Build 44/);
    expect(() => new SyntheticFixtureAdapter({ approvedEvidence: rebased, approvedCaptureRoute: ROUTE })).toThrow(/pinned Build 44/);
    const requestStat = jest.fn(); const evidenceProbe = jest.fn(); const fetchImpl = jest.fn(); const writeCandidate = jest.fn();
    await expect(captureCandidate({
      authorization: AUTHORIZATION_GATE, syntheticRequestPath: '/explicit/reviewed.json', reviewedRequestSha256: '0'.repeat(64),
      upstreamInferUrl: ROUTE, outputDirectory: '/explicit/output', expectedEvidence: rebased,
      requestStat, evidenceProbe, fetchImpl, writeCandidate,
    })).rejects.toThrow(/pinned Build 44/);
    expect(requestStat).not.toHaveBeenCalled(); expect(evidenceProbe).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled(); expect(writeCandidate).not.toHaveBeenCalled();
  });

  test('authorised synthetic capture preserves request/response, maps only at POST boundary and self-labels pending', async () => {
    const mobile = mobileRequest(); const response = platformResponse();
    const requestBytes = Buffer.from(JSON.stringify(mobile));
    const reviewedRequestSha256 = crypto.createHash('sha256').update(requestBytes).digest('hex');
    const stableStat = { dev: 1, ino: 2, size: requestBytes.length, mtimeMs: 3, ctimeMs: 4, isFile: () => true, isSymbolicLink: () => false };
    const fetchImpl = jest.fn(async () => ({ ok: true, text: async () => JSON.stringify(response) }));
    const written = [];
    const candidate = await captureCandidate({
      authorization: AUTHORIZATION_GATE, syntheticRequestPath: '/explicit/synthetic-request.json',
      reviewedRequestSha256,
      upstreamInferUrl: ROUTE, outputDirectory: '/explicit/candidate-output', expectedEvidence: evidence,
      evidenceProbe: async () => ({ ...evidence }), fetchImpl,
      requestStat: async () => stableStat,
      readRequest: async () => requestBytes, writeCandidate: async (...args) => written.push(args),
      now: () => '2026-08-31T12:00:00.000Z',
    });
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual(mapAssessmentToPlatform(mobile));
    expect(candidate.request).toEqual(mobile);
    expect(candidate.platformResponse).toEqual(response);
    expect(candidate.manifest).toEqual(expect.objectContaining({ verificationStatus: 'PENDING_INDEPENDENT_REVIEW', eligibleForDeliveredReplay: false }));
    expect(candidate.manifest.reviewedRequestSha256).toBe(reviewedRequestSha256);
    expect(written).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(() => new SyntheticFixtureAdapter({ fixture: candidate, approvedEvidence: evidence, approvedCaptureRoute: ROUTE }).infer(mobile))
      .toThrow(expect.objectContaining({ code: 'DEMO_FIXTURE_NOT_AVAILABLE' }));
  });

  test('request mutation between raw-byte read checks causes zero evidence calls, POSTs and writes', async () => {
    const reviewed = Buffer.from(JSON.stringify(mobileRequest()));
    const swapped = Buffer.from(JSON.stringify(mobileRequest({ tumorSize: 99 })));
    const reviewedRequestSha256 = crypto.createHash('sha256').update(reviewed).digest('hex');
    const stats = [
      { dev: 1, ino: 2, size: reviewed.length, mtimeMs: 10, ctimeMs: 10, isFile: () => true, isSymbolicLink: () => false },
      { dev: 1, ino: 2, size: swapped.length, mtimeMs: 11, ctimeMs: 11, isFile: () => true, isSymbolicLink: () => false },
    ];
    const evidenceProbe = jest.fn(); const fetchImpl = jest.fn(); const writeCandidate = jest.fn();
    await expect(captureCandidate({
      authorization: AUTHORIZATION_GATE, syntheticRequestPath: '/explicit/reviewed.json', reviewedRequestSha256,
      upstreamInferUrl: ROUTE, outputDirectory: '/explicit/output', expectedEvidence: evidence,
      requestStat: async () => stats.shift(), readRequest: async () => swapped,
      evidenceProbe, fetchImpl, writeCandidate,
    })).rejects.toThrow(/changed while being read/);
    expect(evidenceProbe).not.toHaveBeenCalled(); expect(fetchImpl).not.toHaveBeenCalled(); expect(writeCandidate).not.toHaveBeenCalled();
  });

  test('wrong reviewed request SHA-256 causes zero evidence calls, POSTs and writes', async () => {
    const bytes = Buffer.from(JSON.stringify(mobileRequest()));
    const stat = { dev: 1, ino: 2, size: bytes.length, mtimeMs: 10, ctimeMs: 10, isFile: () => true, isSymbolicLink: () => false };
    const evidenceProbe = jest.fn(); const fetchImpl = jest.fn(); const writeCandidate = jest.fn();
    await expect(captureCandidate({
      authorization: AUTHORIZATION_GATE, syntheticRequestPath: '/explicit/reviewed.json', reviewedRequestSha256: '0'.repeat(64),
      upstreamInferUrl: ROUTE, outputDirectory: '/explicit/output', expectedEvidence: evidence,
      requestStat: async () => stat, readRequest: async () => bytes, evidenceProbe, fetchImpl, writeCandidate,
    })).rejects.toThrow(/SHA-256 does not match/);
    expect(evidenceProbe).not.toHaveBeenCalled(); expect(fetchImpl).not.toHaveBeenCalled(); expect(writeCandidate).not.toHaveBeenCalled();
  });

  test('missing authorisation gate performs no request read, evidence probe or network call', async () => {
    const fetchImpl = jest.fn(); const evidenceProbe = jest.fn(); const readRequest = jest.fn();
    await expect(captureCandidate({
      authorization: null, syntheticRequestPath: '/explicit/synthetic-request.json', upstreamInferUrl: ROUTE,
      outputDirectory: '/explicit/output', expectedEvidence: evidence, evidenceProbe, fetchImpl, readRequest,
    })).rejects.toThrow(/authorization gate/);
    expect(fetchImpl).not.toHaveBeenCalled(); expect(evidenceProbe).not.toHaveBeenCalled(); expect(readRequest).not.toHaveBeenCalled();
  });

  test('offline revalidation accepts an unchanged pending candidate and catches response changes', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'acr-candidate-'));
    const directory = path.join(root, 'candidate');
    try {
      const fixture = approvedFixture({ manifest: { verificationStatus: 'PENDING_INDEPENDENT_REVIEW', eligibleForDeliveredReplay: false } });
      writeFixture(directory, fixture);
      expect(revalidateCandidateDirectory({ directory, expectedEvidence: evidence, approvedCaptureRoute: ROUTE }).manifest.verificationStatus)
        .toBe('PENDING_INDEPENDENT_REVIEW');
      fixture.platformResponse.executionTimeMs = 999;
      fs.writeFileSync(path.join(directory, FIXTURE_FILES.platformResponse), JSON.stringify(fixture.platformResponse));
      expect(() => revalidateCandidateDirectory({ directory, expectedEvidence: evidence, approvedCaptureRoute: ROUTE })).toThrow(/changed/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('Build 45 dedicated gateway hostname (G3-02)', () => {
  const HOST = 'mobile-gateway-review.acragent.com';

  test('unset ACR_PUBLIC_HOSTNAME keeps the supervised-LAN posture', async () => {
    expect(loadConfig({}).publicHostname).toBeNull();
    const auth = createAuthFixture();
    const app = createApp({ config: loadConfig({}), authService: auth.service });
    const any = await request(app).get('/m/v1/live').set('Host', 'anything.example');
    expect(any.status).toBe(200);
  });

  test('configured hostname admits the approved host and refuses every other', async () => {
    const config = loadConfig({ ACR_PUBLIC_HOSTNAME: HOST });
    expect(config.publicHostname).toBe(HOST);
    const auth = createAuthFixture();
    const app = createApp({ config, authService: auth.service });

    const approved = await request(app).get('/m/v1/live').set('Host', HOST).set('X-Forwarded-Proto', 'https');
    expect(approved.status).toBe(200);

    for (const host of ['127.0.0.1:3001', 'mobile.acragent.com', 'api.acragent.com', 'evil.example']) {
      const denied = await request(app).get('/m/v1/live').set('Host', host);
      expect(denied.status).toBe(421);
      expect(denied.body.error.code).toBe('MISDIRECTED_REQUEST');
    }
  });

  test('P2: with a public hostname, only edge-forwarded https requests are processed', async () => {
    const auth = createAuthFixture();
    const app = createApp({ config: loadConfig({ ACR_PUBLIC_HOSTNAME: HOST }), authService: auth.service });
    expect((await request(app).get('/m/v1/live').set('Host', HOST).set('X-Forwarded-Proto', 'https')).status).toBe(200);
    for (const proto of ['http', null, 'ftp', 'HTTP']) {
      const req = request(app).post('/m/v1/auth/redeem').set('Host', HOST)
        .send({ inviteCode: 'ACR45-AAAAAAAA-BBBBBBBBBBBB', deviceBinding: 'p2-probe-device', clientBuildId: 'mob-v0.6.5+45' });
      if (proto) req.set('X-Forwarded-Proto', proto);
      const refused = await req;
      expect(refused.status).toBe(403);
      expect(refused.body.error.code).toBe('TLS_REQUIRED');
      expect(refused.body.error.outcome).toBe('NOT_SUBMITTED');
    }
    auth.cleanup();
  });

  test('hostname must be a bare DNS name', () => {
    for (const bad of ['https://mobile-gateway-review.acragent.com', 'mobile-gateway-review.acragent.com:443',
                       'mobile-gateway-review.acragent.com/m/v1', 'localhost', '-bad.example']) {
      expect(() => loadConfig({ ACR_PUBLIC_HOSTNAME: bad })).toThrow(/bare DNS hostname/);
    }
  });
});
