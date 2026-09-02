'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PlatformAdapter } = require('../../gateway/src/platform-adapter');
const { SyntheticFixtureAdapter, sha256 } = require('../../gateway/src/synthetic-fixture-adapter');

const request = {
  contract: 'acr.cds.v1', requestId: '6ad39ab4-6be6-46e8-ad97-d46748a7d671',
  assessment: {
    patientId: 'mob-3f9c1e84-77a2-4b16-9d05-2ce8a1b47f30', erStatus: 'positive', prStatus: 'positive',
    her2Status: 'negative', ki67: 0, stage: null, grade: null, histologicalSubtype: null,
    nodalStatus: 'N0', age: 52, ca153: 0, cea: 0, surgeryDate: null, bayesianEnhanced: false,
    tumorSize: 2.5, gender: 'unknown', ecogScore: 0, pdl1Status: 'not_tested', her2Low: 'negative',
    lvef: 0, treatmentIntent: 'unspecified',
  },
  client: { channel: 'MOBILE', buildId: 'mob-v0.6.0+44', environment: 'EVALUATION' },
};

function platformResponse() {
  return {
    success: true, message: 'Inference completed successfully', executionTimeMs: 9, apiVersion: '2.0', timestamp: '2026-08-31T10:00:00',
    data: {
      patientId: request.assessment.patientId, timestamp: '2026-08-31T10:00:00Z',
      molecularSubtype: 'LuminalB_HER2Negative',
      deterministic: { molecularSubtype: 'LuminalB_HER2Negative', riskLevel: null, treatments: [], biomarkers: {}, reasoningMode: 'OPENLLET_SWRL' },
      bayesian: { confidence: 0, posterior: {}, uncertaintyBounds: [0, 0], enabled: false },
      reasoning: { rulesFired: [], firedRules: [], evidence: [], trace: 'Canonical platform trace' },
      riskLevel: null,
      dataCompleteness: { tier: 2, missingFields: ['stage'], rulesBlocked: 3, warning: 'Risk suppressed for incomplete data.' },
      reasoningMode: 'OPENLLET_SWRL',
    },
  };
}

test('full five-screen request reaches configured platform adapter unchanged at the clinical fact boundary', async () => {
  let sent;
  const adapter = new PlatformAdapter({
    upstreamInferUrl: 'https://verified-route.example/api/infer', timeoutMs: 1000,
    fetchImpl: async (url, options) => { sent = JSON.parse(options.body); return { ok: true, json: async () => platformResponse() }; },
  });
  const result = await adapter.infer(request);
  assert.equal(Object.keys(sent.patientData).length, 20);
  assert.equal(sent.patientData.nodalStatus, 'N0');
  assert.equal(sent.patientData.tumorSize, 2.5);
  assert.equal(sent.patientData.her2Low, false);
  assert.equal(sent.bayesianEnhanced, false);
  assert.equal(result.resultMode, 'LIVE_REASONER');
  assert.deepEqual(result.data, platformResponse().data);
});

test('unavailable configured platform returns an error and never invokes synthetic replay', async () => {
  const adapter = new PlatformAdapter({ upstreamInferUrl: 'https://verified-route.example/api/infer', timeoutMs: 1000, fetchImpl: async () => { throw new Error('offline'); } });
  await assert.rejects(() => adapter.infer(request), error => error.code === 'SERVICE_UNAVAILABLE');
});

test('delivered Build 43 fixture is explicitly ineligible pending verified capture', () => {
  const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../fixtures/luminal-b-fixture-manifest.json'), 'utf8'));
  assert.equal(manifest.verificationStatus, 'UNIT_TEST_ONLY');
  assert.throws(() => new SyntheticFixtureAdapter({ fixture: { manifest } }).infer(request), error => error.code === 'DEMO_FIXTURE_NOT_AVAILABLE');
});

test('verified exact replay keeps current NOT_EXECUTED separate from captured Openllet mode', () => {
  const response = platformResponse();
  const manifest = {
    verificationStatus: 'VERIFIED_PLATFORM_CAPTURE', eligibleForDeliveredReplay: true, syntheticOrigin: true, captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM',
    provenance: {
      reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1',
      logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27, capturedAt: '2026-08-31T10:00:00.000Z', captureRoute: 'https://verified-route.example/api/infer',
    },
    requestSha256: sha256(request), responseSha256: sha256(response),
  };
  const result = new SyntheticFixtureAdapter({
    fixture: { request, platformResponse: response, manifest },
    approvedEvidence: { reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1', logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27 },
    approvedCaptureRoute: 'https://verified-route.example/api/infer', now: () => Date.parse('2026-09-01T00:00:00Z'),
  }).infer(request);
  assert.equal(result.reasoningMode, 'NOT_EXECUTED');
  assert.equal(result.delivery.capturedPlatform.reasoningMode, 'OPENLLET_SWRL');
  assert.deepEqual(result.delivery.capturedPlatform.response, response);
});
