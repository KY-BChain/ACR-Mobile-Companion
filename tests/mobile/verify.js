const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const compile = (file, localRequire = require) => {
  const code = ts.transpileModule(read(file), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
};
const guard = compile('src/api/responseGuard.ts');
const request = {
  contract: 'acr.cds.v1', requestId: '22222222-2222-4222-8222-222222222222',
  assessment: { patientId: 'mob-11111111-1111-4111-8111-111111111111', bayesianEnhanced: true },
  client: { channel: 'MOBILE', buildId: 'mob-v0.6.0+44', environment: 'EVALUATION' },
};
const expected = {
  reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1',
  logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27,
};
const attestation = { contract: 'acr.attestation.v1', verificationState: 'VERIFIED', expected, observed: expected, lastVerificationTimestamp: '2026-08-31T00:00:00Z', lastSuccessfulVerificationTimestamp: '2026-08-31T00:00:00Z' };
assert.equal(guard.parseAttestation(attestation).verificationState, 'VERIFIED');
assert.throws(() => guard.parseAttestation({ ...attestation, expected: { ...expected, queryCount: 26 } }), /baseline/i);

const data = {
  patientId: request.assessment.patientId, timestamp: '2026-08-31T00:00:01Z', molecularSubtype: 'LuminalA',
  deterministic: { molecularSubtype: 'LuminalA', riskLevel: 'LOW', treatments: ['Server treatment'], biomarkers: { ER: 'positive' }, reasoningMode: 'OPENLLET_SWRL' },
  bayesian: { confidence: 0.87, posterior: { LuminalA: 0.87 }, uncertaintyBounds: [0.8, 0.92], enabled: true },
  reasoning: { rulesFired: ['R1'], firedRules: [{ ruleId: 'R1', label: 'Server rule', provenance: 'ACR_NATIVE', status: 'FIRED' }], evidence: ['Server evidence'], trace: 'Server trace' },
  riskLevel: 'LOW', dataCompleteness: { tier: 1, missingFields: [], rulesBlocked: 0, warning: '' }, reasoningMode: 'OPENLLET_SWRL',
};
const platformResponse = { success: true, message: 'ok', data, executionTimeMs: 8, apiVersion: 'v1', timestamp: '2026-08-31T00:00:01Z' };
const live = {
  contract: 'acr.cds.v1', requestId: request.requestId, status: 'COMPLETED', completedAt: '2026-08-31T00:00:01Z', resultMode: 'LIVE_REASONER', reasoningMode: 'OPENLLET_SWRL',
  data, platformResponse, delivery: { source: 'CONFIGURED_PLATFORM', currentExecution: true, currentVerificationState: 'VERIFIED', currentPlatformEvidence: expected, capturedPlatform: null }, warnings: [],
};
assert.equal(guard.parseAssessmentResponse(live, request, 'LIVE_PLATFORM').resultMode, 'LIVE_REASONER');
const fallbackData = { ...data, reasoningMode: 'JAVA_HARDCODED_FALLBACK', deterministic: { ...data.deterministic, reasoningMode: 'JAVA_HARDCODED_FALLBACK' } };
const fallbackPlatform = { ...platformResponse, data: fallbackData };
const fallback = { ...live, resultMode: 'PLATFORM_FALLBACK', reasoningMode: 'JAVA_HARDCODED_FALLBACK', data: fallbackData, platformResponse: fallbackPlatform };
assert.equal(guard.parseAssessmentResponse(fallback, request, 'LIVE_PLATFORM').resultMode, 'PLATFORM_FALLBACK');
const captured = { response: platformResponse, reasoningMode: 'OPENLLET_SWRL', provenance: { ...expected, capturedAt: '2026-08-30T00:00:00Z', captureRoute: '/api/v1/inference/analyze' } };
const demo = { ...live, resultMode: 'LOCAL_SYNTHETIC_DEMO', reasoningMode: 'NOT_EXECUTED', platformResponse: null, delivery: { source: 'VERIFIED_SYNTHETIC_FIXTURE', currentExecution: false, currentVerificationState: 'UNAVAILABLE', currentPlatformEvidence: { reasonerVersion: null, reasoningMode: null, ontologySha256: null, logicalRuleCount: null, physicalRuleCount: null, activeRuleCount: null, loadedRuleCount: null, queryCount: null }, capturedPlatform: captured } };
assert.equal(guard.parseAssessmentResponse(demo, request, 'SYNTHETIC_DEMO').resultMode, 'LOCAL_SYNTHETIC_DEMO');
assert.throws(() => guard.parseAssessmentResponse(demo, request, 'LIVE_PLATFORM'), /synthetic/i);
assert.throws(() => guard.parseAssessmentResponse(live, request, 'SYNTHETIC_DEMO'), /live/i);
assert.throws(() => guard.parseAssessmentResponse({ ...live, requestId: '33333333-3333-4333-8333-333333333333' }, request, 'LIVE_PLATFORM'), /mismatched/i);
assert.throws(() => guard.parseAssessmentResponse({ ...live, data: { ...data, bayesian: { ...data.bayesian, enabled: false } } }, request, 'LIVE_PLATFORM'), /mismatched/i);
assert.throws(() => guard.parseAssessmentResponse({ ...demo, delivery: { ...demo.delivery, currentExecution: true } }, request, 'SYNTHETIC_DEMO'), /synthetic/i);
assert.throws(() => guard.parseAssessmentResponse({ ...live, data: { patientId: request.assessment.patientId } }, request, 'LIVE_PLATFORM'), /mismatched/i);
assert.throws(() => guard.parseAssessmentResponse({ ...live, unexpected: true }, request, 'LIVE_PLATFORM'), /mismatched/i);
assert.throws(() => guard.parseAssessmentResponse({ ...live, completedAt: 'not-a-date' }, request, 'LIVE_PLATFORM'), /mismatched/i);

const bayesOffRequest = { ...request, assessment: { ...request.assessment, bayesianEnhanced: false } };
const unknownData = {
  ...data,
  molecularSubtype: 'Unknown',
  deterministic: { ...data.deterministic, molecularSubtype: 'Unknown', riskLevel: 'NESTED-NONAUTHORITATIVE' },
  bayesian: { confidence: 0, posterior: {}, uncertaintyBounds: [0, 0], enabled: false },
  reasoning: { rulesFired: [], firedRules: [], evidence: [], trace: '' },
  riskLevel: null,
  dataCompleteness: { tier: 3, missingFields: ['stage'], rulesBlocked: 2, warning: 'Incomplete synthetic case' },
};
const bayesOffPlatform = { ...platformResponse, data: unknownData };
const bayesOff = { ...live, data: unknownData, platformResponse: bayesOffPlatform };
assert.equal(guard.parseAssessmentResponse(bayesOff, bayesOffRequest, 'LIVE_PLATFORM').data.riskLevel, null, 'root risk is authoritative even when nested risk differs');
const unknownWithoutContext = { ...unknownData, dataCompleteness: { ...unknownData.dataCompleteness, warning: '   ' } };
assert.throws(
  () => guard.parseAssessmentResponse({ ...bayesOff, data: unknownWithoutContext, platformResponse: { ...bayesOffPlatform, data: unknownWithoutContext } }, bayesOffRequest, 'LIVE_PLATFORM'),
  /mismatched/i,
  'Unknown subtype without non-empty completeness context is rejected',
);

const demoVerified = { ...demo, delivery: { ...demo.delivery, currentVerificationState: 'VERIFIED', currentPlatformEvidence: expected } };
assert.equal(guard.parseAssessmentResponse(demoVerified, request, 'SYNTHETIC_DEMO').resultMode, 'LOCAL_SYNTHETIC_DEMO', 'demo may report separately verified current baseline without claiming execution');
assert.throws(
  () => guard.parseAssessmentResponse({ ...demo, delivery: { ...demo.delivery, currentVerificationState: 'VERIFIED' } }, request, 'SYNTHETIC_DEMO'),
  /evidence/i,
  'demo VERIFIED state with null current evidence is rejected',
);
assert.throws(
  () => guard.parseAssessmentResponse({ ...demoVerified, delivery: { ...demoVerified.delivery, currentPlatformEvidence: { ...expected, queryCount: 26 } } }, request, 'SYNTHETIC_DEMO'),
  /evidence/i,
  'demo VERIFIED state with inconsistent current evidence is rejected',
);
assert.throws(
  () => guard.parseAssessmentResponse({ ...demoVerified, delivery: { ...demoVerified.delivery, currentExecution: true } }, request, 'SYNTHETIC_DEMO'),
  /synthetic/i,
  'demo cannot claim a current execution even with verified current evidence',
);
assert.throws(
  () => guard.parseAssessmentResponse({ ...demoVerified, reasoningMode: 'OPENLLET_SWRL' }, request, 'SYNTHETIC_DEMO'),
  /synthetic/i,
  'demo root provenance remains NOT_EXECUTED',
);

const unavailableEvidence = { reasonerVersion: null, reasoningMode: null, ontologySha256: null, logicalRuleCount: null, physicalRuleCount: null, activeRuleCount: null, loadedRuleCount: null, queryCount: null };
assert.equal(guard.parseAttestation({ ...attestation, verificationState: 'UNAVAILABLE', observed: unavailableEvidence, lastSuccessfulVerificationTimestamp: null }).verificationState, 'UNAVAILABLE');
assert.throws(() => guard.parseAttestation({ ...attestation, observed: { ...expected, extra: 1 } }), /invalid/i);

const calls = [];
const refreshExpiresAt = new Date(Date.now() + 86_400_000).toISOString();
const responses = [
  new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'a1', expiresIn: 3600, refreshToken: 'r1', refreshExpiresAt }), { status: 200 }),
  new Response(JSON.stringify({ contract: 'acr.error.v1', requestId: request.requestId, error: { code: 'AUTHENTICATION_REQUIRED', message: 'expired', retryable: false, outcome: 'NOT_SUBMITTED', fieldErrors: [] } }), { status: 401 }),
  new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'a2', expiresIn: 3600, refreshToken: 'r2', refreshExpiresAt }), { status: 200 }),
  new Response(JSON.stringify(live), { status: 200 }),
];
const clientModule = compile('src/api/client.ts', (name) => {
  if (name === '../config/appIdentity') return { MOBILE_BUILD_ID: 'mob-v0.6.0+44' };
  if (name === '../config/gateway') return { GATEWAY_API_BASE: 'http://192.168.1.94:3001/m/v1' };
  if (name === '../utils/uuid') return { generateDeviceBinding: () => '44444444-4444-4444-8444-444444444444', generateRequestId: () => request.requestId };
  if (name === './responseGuard') return guard;
  return require(name);
});

(async () => {
  const client = new clientModule.GatewayClient(async (url, options) => { calls.push({ url, options }); return responses.shift(); });
  await client.redeemInvite('secret-once');
  assert.equal(client.hasSession(), true);
  const response = await client.submit(request, 'LIVE_PLATFORM');
  assert.equal(response.resultMode, 'LIVE_REASONER');
  assert.deepEqual(calls.map((call) => call.url), [
    'http://192.168.1.94:3001/m/v1/auth/redeem', 'http://192.168.1.94:3001/m/v1/infer',
    'http://192.168.1.94:3001/m/v1/auth/refresh', 'http://192.168.1.94:3001/m/v1/infer',
  ]);
  assert.equal(JSON.parse(calls[0].options.body).clientBuildId, 'mob-v0.6.0+44');
  assert.deepEqual(JSON.parse(calls[2].options.body), { refreshToken: 'r1', deviceBinding: '44444444-4444-4444-8444-444444444444', clientBuildId: 'mob-v0.6.0+44' });
  assert.equal(calls[1].options.headers['X-Device-Binding'], '44444444-4444-4444-8444-444444444444');
  assert.equal(calls[3].options.headers.Authorization, 'Bearer a2', 'rotated access token protects retry');
  assert.equal(calls[3].options.headers['X-Request-ID'], request.requestId);
  assert.equal(calls.filter((call) => call.url.endsWith('/infer')).length, 2, 'one auth-only retry');

  const demoCalls = [];
  const demoClient = new clientModule.GatewayClient(async (url) => {
    demoCalls.push(url);
    if (url.endsWith('/auth/redeem')) return new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'da', expiresIn: 3600, refreshToken: 'dr', refreshExpiresAt }), { status: 200 });
    return new Response(JSON.stringify(demo), { status: 200 });
  });
  await demoClient.redeemInvite('demo-invite');
  await demoClient.submit(request, 'SYNTHETIC_DEMO');
  assert.deepEqual(demoCalls, ['http://192.168.1.94:3001/m/v1/auth/redeem', 'http://192.168.1.94:3001/m/v1/demo/infer']);

  const nonAuth401Calls = [];
  const nonAuth401 = new clientModule.GatewayClient(async (url) => {
    nonAuth401Calls.push(url);
    if (url.endsWith('/auth/redeem')) return new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'na', expiresIn: 3600, refreshToken: 'nr', refreshExpiresAt }), { status: 200 });
    return new Response(JSON.stringify({ contract: 'acr.error.v1', requestId: request.requestId, error: { code: 'INVITE_INVALID', message: 'not an access-expiry response', retryable: false, outcome: 'NOT_SUBMITTED', fieldErrors: [] } }), { status: 401 });
  });
  await nonAuth401.redeemInvite('valid-at-gateway');
  await assert.rejects(nonAuth401.submit(request, 'LIVE_PLATFORM'), (error) => error.code === 'INVITE_INVALID');
  assert.equal(nonAuth401Calls.length, 2, 'non-authentication 401 is not refreshed or retried');

  const reuseCalls = [];
  const reuseClient = new clientModule.GatewayClient(async (url) => {
    reuseCalls.push(url);
    if (reuseCalls.length === 1) return new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'ra', expiresIn: 3600, refreshToken: 'rr', refreshExpiresAt }), { status: 200 });
    if (url.endsWith('/infer')) return new Response(JSON.stringify({ contract: 'acr.error.v1', requestId: request.requestId, error: { code: 'AUTHENTICATION_REQUIRED', message: 'expired', retryable: false, outcome: 'NOT_SUBMITTED', fieldErrors: [] } }), { status: 401 });
    return new Response(JSON.stringify({ contract: 'acr.error.v1', requestId: request.requestId, error: { code: 'TOKEN_REUSE_DETECTED', message: 'family revoked', retryable: false, outcome: 'NOT_SUBMITTED', fieldErrors: [] } }), { status: 409 });
  });
  await reuseClient.redeemInvite('valid');
  await assert.rejects(reuseClient.submit(request, 'LIVE_PLATFORM'), (error) => error.code === 'TOKEN_REUSE_DETECTED');
  assert.equal(reuseClient.hasSession(), false, 'refresh reuse clears the complete local token family');
  assert.equal(reuseCalls.length, 3);

  const proactiveRefreshCalls = [];
  const proactiveRefreshFailure = new clientModule.GatewayClient(async (url) => {
    proactiveRefreshCalls.push(url);
    if (url.endsWith('/auth/redeem')) return new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'pa', expiresIn: 1, refreshToken: 'pr', refreshExpiresAt }), { status: 200 });
    if (url.endsWith('/auth/refresh')) throw new Error('refresh transport offline');
    throw new Error('inference must not be attempted after proactive refresh failure');
  });
  await proactiveRefreshFailure.redeemInvite('valid');
  await assert.rejects(proactiveRefreshFailure.submit(request, 'LIVE_PLATFORM'), (error) => error.code === 'SERVICE_UNAVAILABLE');
  assert.equal(proactiveRefreshFailure.hasSession(), false, 'proactive refresh transport failure clears the complete token family');
  assert.equal(proactiveRefreshCalls.filter((url) => url.endsWith('/infer')).length, 0, 'proactive refresh failure makes no inference attempt');

  const refreshParseCalls = [];
  const refreshParseFailure = new clientModule.GatewayClient(async (url) => {
    refreshParseCalls.push(url);
    if (url.endsWith('/auth/redeem')) return new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'ja', expiresIn: 1, refreshToken: 'jr', refreshExpiresAt }), { status: 200 });
    if (url.endsWith('/auth/refresh')) return new Response('{not-json', { status: 200 });
    throw new Error('inference must not be attempted after refresh parse failure');
  });
  await refreshParseFailure.redeemInvite('valid');
  await assert.rejects(refreshParseFailure.submit(request, 'LIVE_PLATFORM'), SyntaxError);
  assert.equal(refreshParseFailure.hasSession(), false, 'refresh parse failure clears the complete token family');
  assert.equal(refreshParseCalls.filter((url) => url.endsWith('/infer')).length, 0, 'refresh parse failure makes no inference attempt');

  for (const refreshFailure of [
    { name: 'timeout', respond: () => { const error = new Error('refresh timed out'); error.name = 'AbortError'; throw error; }, code: 'SERVICE_UNAVAILABLE' },
    { name: 'server', respond: () => new Response(JSON.stringify({ contract: 'acr.error.v1', requestId: request.requestId, error: { code: 'UPSTREAM_TIMEOUT', message: 'refresh unavailable', retryable: true, outcome: 'NOT_SUBMITTED', fieldErrors: [] } }), { status: 503 }), code: 'UPSTREAM_TIMEOUT' },
  ]) {
    const failureCalls = [];
    const failingClient = new clientModule.GatewayClient(async (url) => {
      failureCalls.push(url);
      if (url.endsWith('/auth/redeem')) return new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'fa', expiresIn: 1, refreshToken: 'fr', refreshExpiresAt }), { status: 200 });
      if (url.endsWith('/auth/refresh')) return refreshFailure.respond();
      throw new Error('inference must not be attempted after refresh failure');
    });
    await failingClient.redeemInvite('valid');
    await assert.rejects(failingClient.submit(request, 'LIVE_PLATFORM'), (error) => error.code === refreshFailure.code);
    assert.equal(failingClient.hasSession(), false, `${refreshFailure.name} refresh failure clears the complete token family`);
    assert.equal(failureCalls.filter((url) => url.endsWith('/infer')).length, 0, `${refreshFailure.name} refresh failure makes no inference attempt`);
  }

  const post401RefreshCalls = [];
  const post401RefreshFailure = new clientModule.GatewayClient(async (url) => {
    post401RefreshCalls.push(url);
    if (url.endsWith('/auth/redeem')) return new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'qa', expiresIn: 3600, refreshToken: 'qr', refreshExpiresAt }), { status: 200 });
    if (url.endsWith('/infer')) return new Response(JSON.stringify({ contract: 'acr.error.v1', requestId: request.requestId, error: { code: 'AUTHENTICATION_REQUIRED', message: 'expired', retryable: false, outcome: 'NOT_SUBMITTED', fieldErrors: [] } }), { status: 401 });
    throw new Error('refresh transport offline');
  });
  await post401RefreshFailure.redeemInvite('valid');
  await assert.rejects(post401RefreshFailure.submit(request, 'LIVE_PLATFORM'), (error) => error.code === 'SERVICE_UNAVAILABLE');
  assert.equal(post401RefreshFailure.hasSession(), false, 'post-401 refresh transport failure clears the complete token family');
  assert.equal(post401RefreshCalls.filter((url) => url.endsWith('/infer')).length, 1, 'refresh failure never retries inference');

  const bindingCalls = [];
  const bindingClient = new clientModule.GatewayClient(async (url) => {
    bindingCalls.push(url);
    if (url.endsWith('/auth/redeem')) return new Response(JSON.stringify({ tokenType: 'Bearer', accessToken: 'ba', expiresIn: 3600, refreshToken: 'br', refreshExpiresAt }), { status: 200 });
    return new Response(JSON.stringify({ contract: 'acr.error.v1', requestId: request.requestId, error: { code: 'DEVICE_BINDING_MISMATCH', message: 'binding mismatch', retryable: false, outcome: 'NOT_SUBMITTED', fieldErrors: [] } }), { status: 403 });
  });
  await bindingClient.redeemInvite('valid');
  await assert.rejects(bindingClient.submit(request, 'LIVE_PLATFORM'), (error) => error.code === 'DEVICE_BINDING_MISMATCH');
  assert.equal(bindingClient.hasSession(), false, 'binding mismatch clears the complete local token family');
  bindingClient.clearSession();
  assert.equal(bindingClient.hasSession(), false, 'explicit disconnect keeps no token session');

  const offlineCalls = [];
  const offline = new clientModule.GatewayClient(async () => { offlineCalls.push(1); throw new Error('offline'); });
  await assert.rejects(offline.checkLive(), (error) => error.code === 'SERVICE_UNAVAILABLE' && error.outcome === 'NOT_SUBMITTED');
  assert.equal(offlineCalls.length, 1, 'network failure is not retried');

  const gateway = read('src/config/gateway.ts');
  assert.match(gateway, /http:\/\/192\.168\.1\.94:3001/);
  assert.doesNotMatch(gateway, /api\.acragent\.com|localhost|process\.env/);
  const clientSource = read('src/api/client.ts');
  assert.doesNotMatch(clientSource, /AsyncStorage|console\.|SecureStore/);
  assert.match(read('src/screens/GatewayAccessScreen.tsx'), /secureTextEntry/);
  assert.doesNotMatch(read('src/screens/ResultScreen.tsx'), /I18nManager|molecularSubtype\.code|recommendations/);
  assert.match(read('android/app/src/main/res/xml/network_security_config.xml'), /192\.168\.1\.94/);
  console.log('PASS mobile gateway client/auth-only retry/no-network-retry, fixed route, exact attestation, three response modes, fail-closed guards and native endpoint policy');
})().catch((error) => { console.error(error); process.exitCode = 1; });
