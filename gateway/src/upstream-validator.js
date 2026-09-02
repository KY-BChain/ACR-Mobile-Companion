'use strict';

const { GatewayError } = require('./errors');

const MODES = Object.freeze(['OPENLLET_SWRL', 'JAVA_HARDCODED_FALLBACK']);
const CANONICAL_SUBTYPES = Object.freeze([
  'LuminalA', 'LuminalB_HER2Negative', 'LuminalB_HER2Positive',
  'HER2Enriched', 'TripleNegative', 'NormalLike', 'Unknown',
]);

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stringArray(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function invalid(detail) {
  throw new GatewayError('INVALID_UPSTREAM_RESPONSE', `The reasoner returned an invalid success response (${detail}).`, 502, false, 'FAILED');
}

function validatePlatformSuccess(response, context) {
  if (!object(response) || response.success !== true || !object(response.data)) invalid('missing success data');
  const data = response.data;
  const deterministic = data.deterministic;
  const bayesian = data.bayesian;
  const reasoning = data.reasoning;
  const completeness = data.dataCompleteness;
  if (typeof response.message !== 'string' || !finiteNumber(response.executionTimeMs)
      || typeof response.apiVersion !== 'string' || typeof response.timestamp !== 'string') invalid('outer metadata');
  if (typeof data.patientId !== 'string' || data.patientId !== context.patientId || typeof data.timestamp !== 'string') invalid('patient correlation or platform timestamp');
  if (!object(deterministic) || !CANONICAL_SUBTYPES.includes(deterministic.molecularSubtype)
      || data.molecularSubtype !== deterministic.molecularSubtype
      || !(typeof deterministic.riskLevel === 'string' || deterministic.riskLevel === null)
      || !stringArray(deterministic.treatments) || !object(deterministic.biomarkers)
      || !Object.values(deterministic.biomarkers).every(value => typeof value === 'string')) invalid('deterministic result');
  if (!MODES.includes(data.reasoningMode) || deterministic.reasoningMode !== data.reasoningMode) invalid('reasoning mode');
  if (!object(bayesian) || typeof bayesian.enabled !== 'boolean' || !finiteNumber(bayesian.confidence)
      || !object(bayesian.posterior) || !Object.values(bayesian.posterior).every(finiteNumber)
      || !Array.isArray(bayesian.uncertaintyBounds) || bayesian.uncertaintyBounds.length !== 2
      || !bayesian.uncertaintyBounds.every(finiteNumber)) invalid('Bayesian result');
  if (context.bayesianEnhanced && !bayesian.enabled) {
    throw new GatewayError('BAYESIAN_ENHANCEMENT_UNAVAILABLE', 'Bayesian enhancement was requested but the platform returned it disabled.', 502, false, 'FAILED');
  }
  if (!context.bayesianEnhanced && bayesian.enabled) invalid('Bayesian request/result mismatch');
  if (!object(reasoning) || !stringArray(reasoning.rulesFired) || !Array.isArray(reasoning.firedRules)
      || !reasoning.firedRules.every(rule => object(rule) && typeof rule.ruleId === 'string'
        && typeof rule.label === 'string' && typeof rule.provenance === 'string' && rule.status === 'FIRED')
      || !stringArray(reasoning.evidence) || typeof reasoning.trace !== 'string') invalid('reasoning trace');
  if (!object(completeness) || !Number.isInteger(completeness.tier) || completeness.tier < 1 || completeness.tier > 3
      || !stringArray(completeness.missingFields) || !Number.isInteger(completeness.rulesBlocked)
      || typeof completeness.warning !== 'string') invalid('data completeness');
  if (!(typeof data.riskLevel === 'string' || data.riskLevel === null)) invalid('top-level risk');
  if (deterministic.molecularSubtype === 'Unknown' && completeness.warning.trim() === '') invalid('Unknown subtype without completeness warning');
  return response;
}

function resultModeFor(reasoningMode) {
  if (reasoningMode === 'OPENLLET_SWRL') return 'LIVE_REASONER';
  if (reasoningMode === 'JAVA_HARDCODED_FALLBACK') return 'PLATFORM_FALLBACK';
  invalid('unknown reasoning mode');
}

module.exports = { MODES, CANONICAL_SUBTYPES, validatePlatformSuccess, resultModeFor };
