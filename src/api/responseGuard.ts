import type { AssessmentRequest, AssessmentResponse, AttestationResponse, DeliveryChoice, ObservedEvidence, PlatformData, PlatformResponse } from '../types/api';

const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
const isNullableString = (value: unknown): value is string | null => value === null || isString(value);
const isNullableCount = (value: unknown): value is number | null => value === null || (Number.isInteger(value) && (value as number) >= 0);
const hasExactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
};
const isDateTime = (value: unknown): value is string => isString(value) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH = /^[0-9a-f]{64}$/i;
const SUBTYPES = new Set(['LuminalA', 'LuminalB_HER2Negative', 'LuminalB_HER2Positive', 'HER2Enriched', 'TripleNegative', 'NormalLike', 'Unknown']);
const PLATFORM_MODES = new Set(['OPENLLET_SWRL', 'JAVA_HARDCODED_FALLBACK']);
const COUNTS = ['logicalRuleCount', 'physicalRuleCount', 'activeRuleCount', 'loadedRuleCount', 'queryCount'] as const;
const BASELINE_HASH = 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1';
const matchesBaseline = (value: Record<string, unknown>): boolean => value.reasonerVersion === 'v2.2' && value.reasoningMode === 'OPENLLET_SWRL'
  && value.ontologySha256 === BASELINE_HASH && value.logicalRuleCount === 71 && value.physicalRuleCount === 76
  && value.activeRuleCount === 76 && value.loadedRuleCount === 76 && value.queryCount === 27;
const matchesCapturedBaseline = (value: Record<string, unknown>, mode: unknown): boolean => value.reasonerVersion === 'v2.2'
  && value.reasoningMode === mode && PLATFORM_MODES.has(String(mode)) && value.ontologySha256 === BASELINE_HASH
  && value.logicalRuleCount === 71 && value.physicalRuleCount === 76 && value.activeRuleCount === 76
  && value.loadedRuleCount === 76 && value.queryCount === 27;

function isObservedEvidence(value: unknown): value is ObservedEvidence {
  if (!isObject(value) || !hasExactKeys(value, ['reasonerVersion', 'reasoningMode', 'ontologySha256', ...COUNTS])
      || !isNullableString(value.reasonerVersion) || !isNullableString(value.reasoningMode)
      || !isNullableString(value.ontologySha256) || (value.ontologySha256 !== null && !HASH.test(value.ontologySha256))) return false;
  return COUNTS.every((key) => isNullableCount(value[key]));
}

function isExpectedEvidence(value: unknown): boolean {
  if (!isObject(value) || !hasExactKeys(value, ['reasonerVersion', 'reasoningMode', 'ontologySha256', ...COUNTS])
      || !isString(value.reasonerVersion) || !isString(value.reasoningMode)
      || !isString(value.ontologySha256) || !HASH.test(value.ontologySha256)) return false;
  return COUNTS.every((key) => Number.isInteger(value[key]) && (value[key] as number) >= 0);
}

export function parseAttestation(value: unknown): AttestationResponse {
  if (!isObject(value) || !hasExactKeys(value, ['contract', 'verificationState', 'expected', 'observed', 'lastVerificationTimestamp', 'lastSuccessfulVerificationTimestamp'])
      || value.contract !== 'acr.attestation.v1'
      || !['VERIFIED', 'MISMATCH', 'UNAVAILABLE'].includes(String(value.verificationState))
      || !isExpectedEvidence(value.expected) || !isObservedEvidence(value.observed)
      || !isDateTime(value.lastVerificationTimestamp)
      || !(value.lastSuccessfulVerificationTimestamp === null || isDateTime(value.lastSuccessfulVerificationTimestamp))) {
    throw new Error('Invalid attestation response.');
  }
  const expected = value.expected as unknown as Record<string, unknown>;
  if (!matchesBaseline(expected)) throw new Error('Unexpected attestation baseline.');
  if (value.verificationState === 'VERIFIED') {
    const observed = value.observed as unknown as Record<string, unknown>;
    if (!matchesBaseline(observed)) throw new Error('Verified attestation evidence is inconsistent.');
  }
  return value as unknown as AttestationResponse;
}

function isPlatformData(value: unknown): value is PlatformData {
  if (!isObject(value) || !hasExactKeys(value, ['patientId', 'timestamp', 'molecularSubtype', 'deterministic', 'bayesian', 'reasoning', 'riskLevel', 'dataCompleteness', 'reasoningMode'])
      || !isString(value.patientId) || value.patientId.length === 0 || !isString(value.timestamp) || value.timestamp.length === 0
      || !SUBTYPES.has(String(value.molecularSubtype)) || !PLATFORM_MODES.has(String(value.reasoningMode))) return false;
  const deterministic = value.deterministic;
  if (!isObject(deterministic) || !hasExactKeys(deterministic, ['molecularSubtype', 'riskLevel', 'treatments', 'biomarkers', 'reasoningMode'])
      || deterministic.molecularSubtype !== value.molecularSubtype
      || deterministic.reasoningMode !== value.reasoningMode || !isNullableString(deterministic.riskLevel)
      || !isStringArray(deterministic.treatments) || !isObject(deterministic.biomarkers)
      || !Object.values(deterministic.biomarkers).every(isString)) return false;
  const bayesian = value.bayesian;
  if (!isObject(bayesian) || !hasExactKeys(bayesian, ['confidence', 'posterior', 'uncertaintyBounds', 'enabled'])
      || typeof bayesian.enabled !== 'boolean' || !isNumber(bayesian.confidence)
      || !isObject(bayesian.posterior) || !Object.values(bayesian.posterior).every(isNumber)
      || !Array.isArray(bayesian.uncertaintyBounds) || bayesian.uncertaintyBounds.length !== 2
      || !bayesian.uncertaintyBounds.every(isNumber)) return false;
  const reasoning = value.reasoning;
  if (!isObject(reasoning) || !hasExactKeys(reasoning, ['rulesFired', 'firedRules', 'evidence', 'trace'])
      || !isStringArray(reasoning.rulesFired) || !isStringArray(reasoning.evidence) || !isString(reasoning.trace)
      || !Array.isArray(reasoning.firedRules) || !reasoning.firedRules.every((rule) => isObject(rule) && isString(rule.ruleId)
        && hasExactKeys(rule, ['ruleId', 'label', 'provenance', 'status'])
        && isString(rule.label) && isString(rule.provenance) && rule.status === 'FIRED')) return false;
  const completeness = value.dataCompleteness;
  const validCompleteness = isObject(completeness) && hasExactKeys(completeness, ['tier', 'missingFields', 'rulesBlocked', 'warning'])
    && [1, 2, 3].includes(Number(completeness.tier))
    && isStringArray(completeness.missingFields) && Number.isInteger(completeness.rulesBlocked)
    && (completeness.rulesBlocked as number) >= 0 && isString(completeness.warning);
  return isNullableString(value.riskLevel) && validCompleteness
    && (value.molecularSubtype !== 'Unknown' || (completeness.warning as string).trim().length > 0);
}

function isPlatformResponse(value: unknown): value is PlatformResponse {
  return isObject(value) && hasExactKeys(value, ['success', 'message', 'data', 'executionTimeMs', 'apiVersion', 'timestamp'])
    && value.success === true && isString(value.message) && isPlatformData(value.data)
    && isNumber(value.executionTimeMs) && value.executionTimeMs >= 0 && isString(value.apiVersion)
    && value.apiVersion.length > 0 && isString(value.timestamp) && value.timestamp.length > 0;
}

const sameData = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right);

export function parseAssessmentResponse(value: unknown, request: AssessmentRequest, expectedChoice: DeliveryChoice): AssessmentResponse {
  if (!isObject(value) || !hasExactKeys(value, ['contract', 'requestId', 'status', 'completedAt', 'resultMode', 'reasoningMode', 'data', 'platformResponse', 'delivery', 'warnings'])
      || value.contract !== 'acr.cds.v1' || value.status !== 'COMPLETED'
      || value.requestId !== request.requestId || !UUID.test(String(value.requestId)) || !isDateTime(value.completedAt)
      || !isPlatformData(value.data) || value.data.patientId !== request.assessment.patientId
      || value.data.bayesian.enabled !== request.assessment.bayesianEnhanced || !isStringArray(value.warnings)
      || !isObject(value.delivery) || !hasExactKeys(value.delivery, ['source', 'currentExecution', 'currentVerificationState', 'currentPlatformEvidence', 'capturedPlatform'])
      || !isObservedEvidence(value.delivery.currentPlatformEvidence)
      || !['VERIFIED', 'MISMATCH', 'UNAVAILABLE'].includes(String(value.delivery.currentVerificationState))) {
    throw new Error('Invalid or mismatched assessment response.');
  }
  const mode = value.resultMode;
  const delivery = value.delivery;
  const platformMode = value.data.reasoningMode;
  if (delivery.currentVerificationState === 'VERIFIED'
      && !matchesBaseline(delivery.currentPlatformEvidence as Record<string, unknown>)) {
    throw new Error('Verified current platform evidence is inconsistent.');
  }
  if (mode === 'LIVE_REASONER') {
    const currentEvidence = delivery.currentPlatformEvidence as Record<string, unknown>;
    if (value.reasoningMode !== 'OPENLLET_SWRL' || platformMode !== 'OPENLLET_SWRL'
        || expectedChoice !== 'LIVE_PLATFORM' || !matchesBaseline(currentEvidence)
        || delivery.source !== 'CONFIGURED_PLATFORM' || delivery.currentExecution !== true
        || delivery.currentVerificationState !== 'VERIFIED' || delivery.capturedPlatform !== null
        || !isPlatformResponse(value.platformResponse) || !sameData(value.data, value.platformResponse.data)) throw new Error('Invalid live response mode.');
  } else if (mode === 'PLATFORM_FALLBACK') {
    const currentEvidence = delivery.currentPlatformEvidence as Record<string, unknown>;
    if (value.reasoningMode !== 'JAVA_HARDCODED_FALLBACK' || platformMode !== 'JAVA_HARDCODED_FALLBACK'
        || expectedChoice !== 'LIVE_PLATFORM' || !matchesBaseline(currentEvidence)
        || delivery.source !== 'CONFIGURED_PLATFORM' || delivery.currentExecution !== true
        || delivery.currentVerificationState !== 'VERIFIED' || delivery.capturedPlatform !== null
        || !isPlatformResponse(value.platformResponse) || !sameData(value.data, value.platformResponse.data)) throw new Error('Invalid fallback response mode.');
  } else if (mode === 'LOCAL_SYNTHETIC_DEMO') {
    const captured = delivery.capturedPlatform;
    if (value.reasoningMode !== 'NOT_EXECUTED' || delivery.source !== 'VERIFIED_SYNTHETIC_FIXTURE'
        || expectedChoice !== 'SYNTHETIC_DEMO'
        || delivery.currentExecution !== false || value.platformResponse !== null || !isObject(captured)
        || !hasExactKeys(captured, ['response', 'reasoningMode', 'provenance'])
        || !isPlatformResponse(captured.response) || captured.reasoningMode !== platformMode
        || captured.response.data.reasoningMode !== platformMode || !sameData(value.data, captured.response.data)
        || !isObject(captured.provenance) || captured.provenance.reasoningMode !== platformMode
        || !hasExactKeys(captured.provenance, ['reasonerVersion', 'reasoningMode', 'ontologySha256', ...COUNTS, 'capturedAt', 'captureRoute'])
        || !matchesCapturedBaseline(captured.provenance, platformMode)
        || !isDateTime(captured.provenance.capturedAt)
        || !isString(captured.provenance.captureRoute) || captured.provenance.captureRoute.length === 0) throw new Error('Invalid synthetic replay provenance.');
  } else throw new Error('Unknown result mode.');
  return value as unknown as AssessmentResponse;
}
