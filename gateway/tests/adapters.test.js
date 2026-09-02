'use strict';

const { PlatformAdapter } = require('../src/platform-adapter');
const { SyntheticFixtureAdapter, sha256 } = require('../src/synthetic-fixture-adapter');
const { validatePlatformSuccess } = require('../src/upstream-validator');
const { mobileRequest, platformResponse, PATIENT_ID, evidence } = require('./helpers');
const { validators } = require('../src/schema');
const fs = require('fs');
const path = require('path');

const CAPTURE_ROUTE = 'https://configured.example/api/infer';
const TEST_NOW = () => Date.parse('2026-09-01T00:00:00Z');

function fixtureAdapter(fixture) {
  return new SyntheticFixtureAdapter({ fixture, approvedEvidence: evidence, approvedCaptureRoute: CAPTURE_ROUTE, now: TEST_NOW });
}

function fetchReturning(body, ok = true) {
  return jest.fn(async () => ({ ok, json: async () => body }));
}

describe('PlatformAdapter', () => {
  test.each([
    ['OPENLLET_SWRL', 'LIVE_REASONER'],
    ['JAVA_HARDCODED_FALLBACK', 'PLATFORM_FALLBACK'],
  ])('preserves exact canonical %s response in truthful %s envelope', async (mode, resultMode) => {
    const upstream = platformResponse({ mode, bayes: false });
    const fetchImpl = fetchReturning(upstream);
    const result = await new PlatformAdapter({ upstreamInferUrl: 'https://configured.example/api/infer', timeoutMs: 1000, fetchImpl }).infer(mobileRequest());
    expect(result.resultMode).toBe(resultMode);
    expect(result.reasoningMode).toBe(mode);
    expect(result.data).toEqual(upstream.data);
    expect(result.platformResponse).toEqual(upstream);
    const sent = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(sent.patientData.patientId).toBe(PATIENT_ID);
    expect(sent.bayesianEnhanced).toBe(false);
    expect(sent.analysisVersion).toBe('2.2');
  });

  test('does not use a guessed upstream default', async () => {
    await expect(new PlatformAdapter({ upstreamInferUrl: null, timeoutMs: 100, fetchImpl: jest.fn() }).infer(mobileRequest()))
      .rejects.toMatchObject({ code: 'UPSTREAM_NOT_CONFIGURED' });
  });

  test('cancels a bounded timed-out request and returns indeterminate', async () => {
    const fetchImpl = jest.fn((url, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    }));
    await expect(new PlatformAdapter({ upstreamInferUrl: 'http://127.0.0.1:8080/api/infer', timeoutMs: 10, fetchImpl }).infer(mobileRequest()))
      .rejects.toMatchObject({ code: 'UPSTREAM_TIMEOUT', outcome: 'INDETERMINATE' });
  });

  test('unavailable, HTTP failure and malformed JSON never return demo', async () => {
    const unavailable = new PlatformAdapter({ upstreamInferUrl: 'https://configured/api/infer', timeoutMs: 100, fetchImpl: jest.fn(async () => { throw new Error('offline'); }) });
    await expect(unavailable.infer(mobileRequest())).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    await expect(new PlatformAdapter({ upstreamInferUrl: 'https://configured/api/infer', timeoutMs: 100, fetchImpl: fetchReturning({}, false) }).infer(mobileRequest()))
      .rejects.toMatchObject({ code: 'UPSTREAM_HTTP_ERROR' });
    await expect(new PlatformAdapter({ upstreamInferUrl: 'https://configured/api/infer', timeoutMs: 100, fetchImpl: jest.fn(async () => ({ ok: true, json: async () => { throw new Error('bad'); } })) }).infer(mobileRequest()))
      .rejects.toMatchObject({ code: 'INVALID_UPSTREAM_RESPONSE' });
  });
});

describe('conditional canonical success validation', () => {
  test('accepts source-faithful Spring/Jackson unit fixture including root molecularSubtype', () => {
    const fixture = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../e2e/fixtures/canonical-platform-response-unit.json'), 'utf8'));
    const label = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../e2e/fixtures/canonical-platform-response-unit-manifest.json'), 'utf8'));
    expect(label.verificationStatus).toBe('UNIT_TEST_ONLY');
    expect(fixture.data.molecularSubtype).toBe(fixture.data.deterministic.molecularSubtype);
    expect(validatePlatformSuccess(fixture, { patientId: PATIENT_ID, bayesianEnhanced: false })).toBe(fixture);
  });

  test('allows empty rule arrays and Bayes disabled when request asked for off', () => {
    expect(validatePlatformSuccess(platformResponse({ bayes: false }), { patientId: PATIENT_ID, bayesianEnhanced: false })).toBeTruthy();
  });

  test('allows Unknown only with completeness context and warning', () => {
    const unknown = platformResponse({ subtype: 'Unknown' });
    unknown.data.dataCompleteness.warning = 'Essential classification facts are incomplete.';
    expect(validatePlatformSuccess(unknown, { patientId: PATIENT_ID, bayesianEnhanced: false })).toBeTruthy();
    unknown.data.dataCompleteness.warning = '';
    expect(() => validatePlatformSuccess(unknown, { patientId: PATIENT_ID, bayesianEnhanced: false })).toThrow(expect.objectContaining({ code: 'INVALID_UPSTREAM_RESPONSE' }));
  });

  test('rejects outer-catch partial HTTP 200 shape', () => {
    const partial = platformResponse();
    partial.data.deterministic = {};
    partial.data.bayesian = { confidence: 0, posterior: {}, uncertaintyBounds: [0, 0], enabled: false };
    delete partial.data.reasoning;
    expect(() => validatePlatformSuccess(partial, { patientId: PATIENT_ID, bayesianEnhanced: true })).toThrow(expect.objectContaining({ code: 'INVALID_UPSTREAM_RESPONSE' }));
  });

  test('rejects unknown/mismatched actual mode and missing patient correlation', () => {
    const unknownMode = platformResponse(); unknownMode.data.reasoningMode = 'SOME_ENGINE';
    expect(() => validatePlatformSuccess(unknownMode, { patientId: PATIENT_ID, bayesianEnhanced: false })).toThrow();
    const mismatch = platformResponse(); mismatch.data.deterministic.reasoningMode = 'JAVA_HARDCODED_FALLBACK';
    expect(() => validatePlatformSuccess(mismatch, { patientId: PATIENT_ID, bayesianEnhanced: false })).toThrow();
    expect(() => validatePlatformSuccess(platformResponse({ patientId: 'other' }), { patientId: PATIENT_ID, bayesianEnhanced: false })).toThrow();
  });

  test.each(['MadeUpSubtype', 'Luminal_A', ''])('rejects noncanonical public subtype %p', subtype => {
    expect(() => validatePlatformSuccess(platformResponse({ subtype }), { patientId: PATIENT_ID, bayesianEnhanced: false }))
      .toThrow(expect.objectContaining({ code: 'INVALID_UPSTREAM_RESPONSE' }));
  });

  test('rejects missing or inconsistent root Jackson convenience subtype', () => {
    const missing = platformResponse(); delete missing.data.molecularSubtype;
    expect(() => validatePlatformSuccess(missing, { patientId: PATIENT_ID, bayesianEnhanced: false })).toThrow();
    const mismatch = platformResponse(); mismatch.data.molecularSubtype = 'LuminalA';
    expect(() => validatePlatformSuccess(mismatch, { patientId: PATIENT_ID, bayesianEnhanced: false })).toThrow();
  });

  test('requested Bayes disabled is explicit fail-closed degradation', () => {
    expect(() => validatePlatformSuccess(platformResponse({ bayes: false }), { patientId: PATIENT_ID, bayesianEnhanced: true }))
      .toThrow(expect.objectContaining({ code: 'BAYESIAN_ENHANCEMENT_UNAVAILABLE' }));
  });
});

describe('SyntheticFixtureAdapter', () => {
  test('delivered legacy/mock-authored or missing fixture cannot return CDS', () => {
    expect(() => fixtureAdapter(null).infer(mobileRequest())).toThrow(expect.objectContaining({ code: 'DEMO_FIXTURE_NOT_AVAILABLE' }));
    expect(() => fixtureAdapter({ manifest: { verificationStatus: 'UNIT_TEST_ONLY' } }).infer(mobileRequest()))
      .toThrow(expect.objectContaining({ code: 'DEMO_FIXTURE_NOT_AVAILABLE' }));
  });

  test('exact verified replay is NOT_EXECUTED while captured platform mode/data remain immutable', () => {
    const request = mobileRequest();
    const response = platformResponse();
    const manifest = { verificationStatus: 'VERIFIED_PLATFORM_CAPTURE', eligibleForDeliveredReplay: true, syntheticOrigin: true,
      captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM', provenance: {
        reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1',
        logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27, capturedAt: '2026-08-31T10:00:00.000Z', captureRoute: CAPTURE_ROUTE,
      } };
    manifest.requestSha256 = sha256(request); manifest.responseSha256 = sha256(response);
    const result = fixtureAdapter({ request, platformResponse: response, manifest }).infer(mobileRequest());
    expect(result).toEqual(expect.objectContaining({ resultMode: 'LOCAL_SYNTHETIC_DEMO', reasoningMode: 'NOT_EXECUTED' }));
    expect(result.delivery.currentExecution).toBe(false);
    expect(result.delivery.capturedPlatform.reasoningMode).toBe('OPENLLET_SWRL');
    expect(result.delivery.capturedPlatform.response).toEqual(response);
  });

  test.each([
    ['null', { stage: null }], ['zero', { ca153: 1 }], ['false', { bayesianEnhanced: true }], ['clinical edit', { nodalStatus: 'N1' }],
  ])('refuses request mismatch including %s semantics', (label, edit) => {
    const request = mobileRequest(); const response = platformResponse();
    const manifest = { verificationStatus: 'VERIFIED_PLATFORM_CAPTURE', eligibleForDeliveredReplay: true, syntheticOrigin: true, captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM', provenance: {
      reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1',
      logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27, capturedAt: '2026-08-31T10:00:00.000Z', captureRoute: CAPTURE_ROUTE,
    } };
    manifest.requestSha256 = sha256(request); manifest.responseSha256 = sha256(response);
    const adapter = fixtureAdapter({ request, platformResponse: response, manifest });
    expect(() => adapter.infer(mobileRequest(edit))).toThrow(expect.objectContaining({ code: 'DEMO_FIXTURE_NOT_AVAILABLE' }));
  });

  test('refuses fixture tampering', () => {
    const request = mobileRequest(); const response = platformResponse();
    const manifest = { verificationStatus: 'VERIFIED_PLATFORM_CAPTURE', eligibleForDeliveredReplay: true, syntheticOrigin: true, captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM', provenance: {
      reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1',
      logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27, capturedAt: '2026-08-31T10:00:00.000Z', captureRoute: CAPTURE_ROUTE,
    }, requestSha256: '0'.repeat(64), responseSha256: sha256(response) };
    expect(() => fixtureAdapter({ request, platformResponse: response, manifest }).infer(request)).toThrow();
  });

  test('refuses contradictory manifest mode even when request and captured response are correctly re-hashed', () => {
    const request = mobileRequest(); const response = platformResponse({ mode: 'JAVA_HARDCODED_FALLBACK' });
    const manifest = { verificationStatus: 'VERIFIED_PLATFORM_CAPTURE', eligibleForDeliveredReplay: true, syntheticOrigin: true, captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM', provenance: {
      reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: evidence.ontologySha256,
      logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27, capturedAt: '2026-08-31T10:00:00.000Z', captureRoute: CAPTURE_ROUTE,
    }, requestSha256: sha256(request), responseSha256: sha256(response) };
    expect(() => fixtureAdapter({ request, platformResponse: response, manifest }).infer(request))
      .toThrow(expect.objectContaining({ code: 'DEMO_FIXTURE_NOT_AVAILABLE' }));
  });

  test.each([
    ['logical rule count', { logicalRuleCount: 70 }],
    ['physical rule count', { physicalRuleCount: 75 }],
    ['active rule count', { activeRuleCount: 75 }],
    ['loaded rule count', { loadedRuleCount: 75 }],
    ['query count', { queryCount: 26 }],
    ['ontology hash', { ontologySha256: '0'.repeat(64) }],
    ['invalid time', { capturedAt: 'not-a-date' }],
    ['future time', { capturedAt: '2026-09-02T00:00:00.000Z' }],
    ['unapproved route', { captureRoute: 'https://other.example/api/infer' }],
  ])('refuses invalid captured provenance: %s', (label, override) => {
    const request = mobileRequest(); const response = platformResponse();
    const manifest = { verificationStatus: 'VERIFIED_PLATFORM_CAPTURE', eligibleForDeliveredReplay: true, syntheticOrigin: true, captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM', provenance: {
      reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: evidence.ontologySha256,
      logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27, capturedAt: '2026-08-31T10:00:00.000Z', captureRoute: CAPTURE_ROUTE, ...override,
    }, requestSha256: sha256(request), responseSha256: sha256(response) };
    expect(() => fixtureAdapter({ request, platformResponse: response, manifest }).infer(request)).toThrow();
  });
});

describe('mobile envelope cross-field invariants', () => {
  test('platform fallback envelope is schema-valid only with current executed verified platform provenance', async () => {
    const result = await new PlatformAdapter({ upstreamInferUrl: CAPTURE_ROUTE, timeoutMs: 1000, fetchImpl: fetchReturning(platformResponse({ mode: 'JAVA_HARDCODED_FALLBACK' })) }).infer(mobileRequest());
    result.delivery.currentVerificationState = 'VERIFIED'; result.delivery.currentPlatformEvidence = { ...evidence };
    expect(result).toEqual(expect.objectContaining({ resultMode: 'PLATFORM_FALLBACK', reasoningMode: 'JAVA_HARDCODED_FALLBACK' }));
    expect(validators.response(result)).toBe(true);
    result.delivery.currentExecution = false;
    expect(validators.response(result)).toBe(false);
  });

  test.each([
    ['resultMode', 'LOCAL_SYNTHETIC_DEMO'], ['reasoningMode', 'NOT_EXECUTED'], ['platformResponse', null],
  ])('live schema rejects contradictory %s', async (field, value) => {
    const result = await new PlatformAdapter({ upstreamInferUrl: CAPTURE_ROUTE, timeoutMs: 1000, fetchImpl: fetchReturning(platformResponse()) }).infer(mobileRequest());
    result.delivery.currentVerificationState = 'VERIFIED'; result.delivery.currentPlatformEvidence = { ...evidence };
    expect(validators.response(result)).toBe(true);
    result[field] = value;
    expect(validators.response(result)).toBe(false);
  });

  test.each([
    ['resultMode', 'LIVE_REASONER'], ['reasoningMode', 'OPENLLET_SWRL'], ['platformResponse', platformResponse()],
  ])('demo schema rejects contradictory %s', (field, value) => {
    const request = mobileRequest(); const response = platformResponse();
    const manifest = { verificationStatus: 'VERIFIED_PLATFORM_CAPTURE', eligibleForDeliveredReplay: true, syntheticOrigin: true, captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM', provenance: {
      reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: evidence.ontologySha256,
      logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27, capturedAt: '2026-08-31T10:00:00.000Z', captureRoute: CAPTURE_ROUTE,
    }, requestSha256: sha256(request), responseSha256: sha256(response) };
    const result = fixtureAdapter({ request, platformResponse: response, manifest }).infer(request);
    result.delivery.currentVerificationState = 'UNAVAILABLE';
    result.delivery.currentPlatformEvidence = { reasonerVersion: null, reasoningMode: null, ontologySha256: null, logicalRuleCount: null, physicalRuleCount: null, activeRuleCount: null, loadedRuleCount: null, queryCount: null };
    expect(validators.response(result)).toBe(true);
    result[field] = value;
    expect(validators.response(result)).toBe(false);
  });
});
