'use strict';

const crypto = require('crypto');
const { GatewayError } = require('./errors');
const { validatePlatformSuccess } = require('./upstream-validator');
const { validateAssessmentRequest } = require('./schema');
const { parseInferUrl, assertPinnedExpectedEvidence } = require('./config');

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = canonical(value[key]);
      return result;
    }, {});
  }
  return value;
}

function comparableRequest(request) {
  const copy = JSON.parse(JSON.stringify(request));
  delete copy.requestId;
  if (copy.assessment) delete copy.assessment.patientId;
  return canonical(copy);
}

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

const EVIDENCE_FIELDS = Object.freeze([
  'reasonerVersion', 'reasoningMode', 'ontologySha256', 'logicalRuleCount',
  'physicalRuleCount', 'activeRuleCount', 'loadedRuleCount', 'queryCount',
]);

function fixtureUnavailable(message = 'No verified platform-captured synthetic fixture is available.') {
  return new GatewayError('DEMO_FIXTURE_NOT_AVAILABLE', message, 404, false, 'NOT_SUBMITTED');
}

function validateFixtureEligibility(fixture, { approvedEvidence, approvedCaptureRoute, now = () => Date.now() } = {}) {
  const route = parseInferUrl(approvedCaptureRoute, 'approvedCaptureRoute');
  const provenance = fixture && fixture.manifest && fixture.manifest.provenance;
  const capturedAt = provenance && Date.parse(provenance.capturedAt);
  if (!fixture || !fixture.manifest || fixture.manifest.verificationStatus !== 'VERIFIED_PLATFORM_CAPTURE'
      || fixture.manifest.eligibleForDeliveredReplay !== true
      || fixture.manifest.syntheticOrigin !== true || fixture.manifest.captureRoute !== 'CANONICAL_CONFIGURED_UPSTREAM'
      || !provenance || typeof provenance.reasonerVersion !== 'string'
      || !['OPENLLET_SWRL', 'JAVA_HARDCODED_FALLBACK'].includes(provenance.reasoningMode)
      || !/^[0-9a-f]{64}$/i.test(provenance.ontologySha256 || '')
      || !EVIDENCE_FIELDS.slice(3).every(field => Number.isInteger(provenance[field]) && provenance[field] >= 0)
      || typeof provenance.capturedAt !== 'string' || typeof provenance.captureRoute !== 'string'
      || !Number.isFinite(capturedAt) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(provenance.capturedAt)
      || capturedAt > now() || !approvedEvidence
      || !EVIDENCE_FIELDS.every(field => field === 'ontologySha256'
        ? provenance[field].toLowerCase() === approvedEvidence[field].toLowerCase()
        : provenance[field] === approvedEvidence[field])
      || !route || provenance.captureRoute !== route
      || !fixture.request || !fixture.platformResponse) throw fixtureUnavailable();
  if (fixture.manifest.requestSha256 !== sha256(fixture.request)
      || fixture.manifest.responseSha256 !== sha256(fixture.platformResponse)) {
    throw fixtureUnavailable('The synthetic fixture failed its immutable provenance check.');
  }
  try {
    validateAssessmentRequest(fixture.request);
    validatePlatformSuccess(fixture.platformResponse, {
      patientId: fixture.request.assessment.patientId,
      bayesianEnhanced: fixture.request.assessment.bayesianEnhanced,
    });
  } catch {
    throw fixtureUnavailable('The synthetic fixture does not conform to the reviewed request/response contracts.');
  }
  if (provenance.reasoningMode !== fixture.platformResponse.data.reasoningMode) {
    throw fixtureUnavailable('The synthetic fixture has contradictory captured reasoning provenance.');
  }
  return fixture;
}

class SyntheticFixtureAdapter {
  constructor({ fixture = null, approvedEvidence = null, approvedCaptureRoute = null, now = () => Date.now() } = {}) {
    this.fixture = fixture;
    this.approvedEvidence = approvedEvidence == null ? null : assertPinnedExpectedEvidence(approvedEvidence);
    this.approvedCaptureRoute = parseInferUrl(approvedCaptureRoute, 'approvedCaptureRoute');
    this.now = now;
  }

  infer(request) {
    const fixture = this.fixture;
    validateFixtureEligibility(fixture, {
      approvedEvidence: this.approvedEvidence, approvedCaptureRoute: this.approvedCaptureRoute, now: this.now,
    });
    const provenance = fixture.manifest.provenance;
    if (JSON.stringify(comparableRequest(request)) !== JSON.stringify(comparableRequest(fixture.request))) {
      throw new GatewayError('DEMO_FIXTURE_NOT_AVAILABLE', 'No verified synthetic fixture exactly matches this assessment.', 404, false, 'NOT_SUBMITTED');
    }
    const captured = JSON.parse(JSON.stringify(fixture.platformResponse));
    return {
      contract: 'acr.cds.v1',
      requestId: request.requestId,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      resultMode: 'LOCAL_SYNTHETIC_DEMO',
      reasoningMode: 'NOT_EXECUTED',
      data: captured.data,
      platformResponse: null,
      delivery: {
        source: 'VERIFIED_SYNTHETIC_FIXTURE',
        currentExecution: false,
        capturedPlatform: {
          response: captured,
          reasoningMode: captured.data.reasoningMode,
          provenance: JSON.parse(JSON.stringify(fixture.manifest.provenance)),
        },
      },
      warnings: ['Synthetic demonstration only: no current ontology or SWRL inference was executed.'],
    };
  }
}

module.exports = { SyntheticFixtureAdapter, canonical, comparableRequest, sha256, validateFixtureEligibility, EVIDENCE_FIELDS };
