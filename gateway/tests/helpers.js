'use strict';

const REQUEST_ID = '6ad39ab4-6be6-46e8-ad97-d46748a7d671';
const PATIENT_ID = 'mob-3f9c1e84-77a2-4b16-9d05-2ce8a1b47f30';
const HASH = 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1';

function mobileRequest(overrides = {}) {
  return {
    contract: 'acr.cds.v1',
    requestId: REQUEST_ID,
    assessment: {
      patientId: PATIENT_ID,
      erStatus: 'positive', prStatus: 'positive', her2Status: 'negative', ki67: 0,
      stage: 'II', grade: '2', histologicalSubtype: 'IDC', nodalStatus: 'N0', age: 52,
      ca153: 0, cea: 0, surgeryDate: '2026-03-14', bayesianEnhanced: false,
      tumorSize: 2.5, gender: 'unknown', ecogScore: 0, pdl1Status: 'not_tested',
      her2Low: 'negative', lvef: 0, treatmentIntent: 'unspecified',
      ...overrides,
    },
    client: { channel: 'MOBILE', buildId: 'mob-v0.6.5+45', environment: 'EVALUATION' },
  };
}

function platformResponse({ mode = 'OPENLLET_SWRL', bayes = false, subtype = 'LuminalB_HER2Negative', patientId = PATIENT_ID } = {}) {
  return {
    success: true,
    message: 'Inference completed successfully',
    data: {
      patientId,
      timestamp: '2026-08-31T10:00:00Z',
      molecularSubtype: subtype,
      deterministic: {
        molecularSubtype: subtype,
        riskLevel: 'INTERMEDIATE',
        treatments: ['Platform treatment'],
        biomarkers: { ER: 'positive', Ki67: '0.0%' },
        reasoningMode: mode,
      },
      bayesian: {
        confidence: bayes ? 0.6001915864330829 : 0,
        posterior: bayes ? { LuminalB_HER2Negative: 0.6001915864330829 } : {},
        uncertaintyBounds: bayes ? [0.5, 0.7] : [0, 0],
        enabled: bayes,
      },
      reasoning: {
        rulesFired: [],
        firedRules: [],
        evidence: ['ER: positive'],
        trace: 'Platform trace',
      },
      riskLevel: 'INTERMEDIATE',
      dataCompleteness: { tier: 3, missingFields: [], rulesBlocked: 0, warning: '' },
      reasoningMode: mode,
    },
    executionTimeMs: 12,
    apiVersion: '2.0',
    timestamp: '2026-08-31T10:00:00',
  };
}

const evidence = Object.freeze({
  reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: HASH,
  logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27,
});

module.exports = { REQUEST_ID, PATIENT_ID, HASH, mobileRequest, platformResponse, evidence };
