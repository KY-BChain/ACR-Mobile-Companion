'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { loadConfig, parseInferUrl, parseSha256, assertPinnedExpectedEvidence } = require('./config');
const { validateAssessmentRequest } = require('./schema');
const { mapAssessmentToPlatform } = require('./mapper');
const { validatePlatformSuccess } = require('./upstream-validator');
const { createPlatformEvidenceProbe } = require('./evidence-probe');
const { EVIDENCE_FIELDS, sha256 } = require('./synthetic-fixture-adapter');
const { FIXTURE_FILES, readAtomicBytes, readAtomicJson } = require('./fixture-loader');

const AUTHORIZATION_GATE = 'AUTHORIZED_SYNTHETIC_MODE2_CAPTURE';

function evidenceMatches(actual, expected) {
  return Boolean(actual && expected && EVIDENCE_FIELDS.every(field => field === 'ontologySha256'
    ? typeof actual[field] === 'string' && actual[field].toLowerCase() === expected[field].toLowerCase()
    : actual[field] === expected[field]));
}

async function postSynthetic({ route, platformRequest, fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(route, {
      method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(platformRequest), signal: controller.signal,
    });
    if (!response || !response.ok) throw new Error('Canonical synthetic capture request failed');
    const responseText = typeof response.text === 'function'
      ? await response.text()
      : JSON.stringify(await response.json());
    return { responseText, platformResponse: JSON.parse(responseText) };
  } finally {
    clearTimeout(timer);
  }
}

async function writeCandidateAtomically(candidate, responseText, outputDirectory, requestBytes, fsPromises = fs.promises) {
  if (!path.isAbsolute(outputDirectory)) throw new Error('Output directory must be absolute');
  const parent = path.dirname(outputDirectory);
  if (!path.isAbsolute(parent)) throw new Error('Output parent must be absolute');
  const temporary = `${outputDirectory}.pending-${process.pid}-${crypto.randomUUID()}`;
  await fsPromises.mkdir(temporary, { recursive: false, mode: 0o700 });
  try {
    await fsPromises.writeFile(path.join(temporary, FIXTURE_FILES.request), requestBytes, { flag: 'wx', mode: 0o600 });
    await fsPromises.writeFile(path.join(temporary, FIXTURE_FILES.platformResponse), responseText, { flag: 'wx', mode: 0o600 });
    await fsPromises.writeFile(path.join(temporary, FIXTURE_FILES.manifest), `${JSON.stringify(candidate.manifest, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    await fsPromises.rename(temporary, outputDirectory);
  } catch (error) {
    await fsPromises.rm(temporary, { recursive: true, force: true });
    throw error;
  }
}

function unchangedRequestIdentity(before, after, byteLength) {
  if (!before || !after || !before.isFile() || !after.isFile()
      || before.isSymbolicLink() || after.isSymbolicLink()) return false;
  const required = ['dev', 'ino', 'size'];
  if (!required.every(field => before[field] !== undefined && before[field] === after[field])) return false;
  for (const field of ['mtimeMs', 'ctimeMs']) {
    if ((before[field] !== undefined || after[field] !== undefined) && before[field] !== after[field]) return false;
  }
  return before.size === byteLength;
}

async function readReviewedRequestAtomically({ syntheticRequestPath, reviewedRequestSha256, requestStat, readRequest }) {
  const expectedSha256 = parseSha256(reviewedRequestSha256, 'reviewedRequestSha256', { required: true });
  const before = await requestStat(syntheticRequestPath);
  if (!before.isFile() || before.isSymbolicLink()) throw new Error('Synthetic request must be a non-symlink regular file');
  const requestBytes = Buffer.from(await readRequest(syntheticRequestPath));
  const after = await requestStat(syntheticRequestPath);
  if (!unchangedRequestIdentity(before, after, requestBytes.length)) throw new Error('Reviewed synthetic request changed while being read');
  const actualSha256 = crypto.createHash('sha256').update(requestBytes).digest('hex');
  if (actualSha256 !== expectedSha256) throw new Error('Reviewed synthetic request SHA-256 does not match');
  return { requestBytes, expectedSha256, mobileRequest: validateAssessmentRequest(JSON.parse(requestBytes.toString('utf8'))) };
}

async function captureCandidate({
  authorization, syntheticRequestPath, reviewedRequestSha256, upstreamInferUrl, outputDirectory,
  expectedEvidence, evidenceProbe, fetchImpl = globalThis.fetch, timeoutMs = 8000,
  readRequest = file => fs.promises.readFile(file),
  requestStat = file => fs.promises.lstat(file), writeCandidate = writeCandidateAtomically,
  now = () => new Date().toISOString(),
}) {
  if (authorization !== AUTHORIZATION_GATE) throw new Error('Explicit synthetic capture authorization gate is required');
  if (!path.isAbsolute(syntheticRequestPath || '')) throw new Error('Synthetic request path must be explicit and absolute');
  if (!path.isAbsolute(outputDirectory || '')) throw new Error('Output directory must be explicit and absolute');
  const route = parseInferUrl(upstreamInferUrl, 'upstreamInferUrl');
  if (!route) throw new Error('Canonical upstream inference route is required');
  expectedEvidence = assertPinnedExpectedEvidence(expectedEvidence);
  const { requestBytes, expectedSha256, mobileRequest } = await readReviewedRequestAtomically({
    syntheticRequestPath, reviewedRequestSha256, requestStat, readRequest,
  });
  const platformRequest = mapAssessmentToPlatform(mobileRequest);
  const preflightEvidence = await evidenceProbe();
  if (!evidenceMatches(preflightEvidence, expectedEvidence)) throw new Error('Actual platform evidence does not match the approved capture baseline');
  const { responseText, platformResponse } = await postSynthetic({ route, platformRequest, fetchImpl, timeoutMs });
  validatePlatformSuccess(platformResponse, {
    patientId: mobileRequest.assessment.patientId,
    bayesianEnhanced: mobileRequest.assessment.bayesianEnhanced,
  });
  const actualEvidence = await evidenceProbe();
  if (!evidenceMatches(actualEvidence, expectedEvidence)) throw new Error('Actual platform evidence does not match the approved capture baseline');
  if (!EVIDENCE_FIELDS.every(field => actualEvidence[field] === preflightEvidence[field])) throw new Error('Platform evidence changed during capture');
  if (platformResponse.data.reasoningMode !== actualEvidence.reasoningMode) throw new Error('Captured response mode contradicts actual platform evidence');
  const capturedAt = now();
  if (!Number.isFinite(Date.parse(capturedAt))) throw new Error('Capture clock did not provide an actual timestamp');
  const manifest = {
    verificationStatus: 'PENDING_INDEPENDENT_REVIEW', eligibleForDeliveredReplay: false,
    syntheticOrigin: true, captureRoute: 'CANONICAL_CONFIGURED_UPSTREAM',
    provenance: { ...actualEvidence, reasoningMode: platformResponse.data.reasoningMode, capturedAt, captureRoute: route },
    reviewedRequestSha256: expectedSha256,
    requestSha256: sha256(mobileRequest), responseSha256: sha256(platformResponse),
  };
  const candidate = { request: mobileRequest, platformResponse, manifest };
  await writeCandidate(candidate, responseText, outputDirectory, requestBytes);
  return candidate;
}

function revalidateCandidateDirectory({ directory, expectedEvidence, approvedCaptureRoute, fsImpl = fs, now = () => Date.now() }) {
  const route = parseInferUrl(approvedCaptureRoute, 'approvedCaptureRoute');
  const names = fsImpl.readdirSync(directory).sort();
  if (JSON.stringify(names) !== JSON.stringify(Object.values(FIXTURE_FILES).sort())) throw new Error('Candidate artefact set changed');
  const requestBytes = readAtomicBytes(path.join(directory, FIXTURE_FILES.request), fsImpl);
  const candidate = {
    request: JSON.parse(requestBytes.toString('utf8')),
    platformResponse: readAtomicJson(path.join(directory, FIXTURE_FILES.platformResponse), fsImpl),
    manifest: readAtomicJson(path.join(directory, FIXTURE_FILES.manifest), fsImpl),
  };
  const reviewedRequestSha256 = crypto.createHash('sha256').update(requestBytes).digest('hex');
  const capturedAt = candidate.manifest && candidate.manifest.provenance && Date.parse(candidate.manifest.provenance.capturedAt);
  if (candidate.manifest.verificationStatus !== 'PENDING_INDEPENDENT_REVIEW'
      || candidate.manifest.eligibleForDeliveredReplay !== false
      || candidate.manifest.syntheticOrigin !== true
      || candidate.manifest.captureRoute !== 'CANONICAL_CONFIGURED_UPSTREAM'
      || candidate.manifest.requestSha256 !== sha256(candidate.request)
      || candidate.manifest.reviewedRequestSha256 !== reviewedRequestSha256
      || candidate.manifest.responseSha256 !== sha256(candidate.platformResponse)
      || candidate.manifest.provenance.captureRoute !== route
      || !Number.isFinite(capturedAt) || capturedAt > now()
      || !evidenceMatches(candidate.manifest.provenance, expectedEvidence)) throw new Error('Candidate provenance changed');
  validateAssessmentRequest(candidate.request);
  validatePlatformSuccess(candidate.platformResponse, {
    patientId: candidate.request.assessment.patientId,
    bayesianEnhanced: candidate.request.assessment.bayesianEnhanced,
  });
  if (candidate.manifest.provenance.reasoningMode !== candidate.platformResponse.data.reasoningMode) throw new Error('Candidate mode changed');
  return candidate;
}

function argumentValue(args, name) {
  const prefix = `${name}=`;
  const member = args.find(value => value.startsWith(prefix));
  return member ? member.slice(prefix.length) : null;
}

async function runCli(args = process.argv.slice(2), env = process.env) {
  const upstreamInferUrl = argumentValue(args, '--upstream');
  const config = loadConfig({ ...env, ACR_UPSTREAM_INFER_URL: upstreamInferUrl });
  const evidenceProbe = createPlatformEvidenceProbe({ ...config.evidence, timeoutMs: config.upstreamTimeoutMs });
  await captureCandidate({
    authorization: args.includes('--authorize-synthetic-capture') ? AUTHORIZATION_GATE : null,
    syntheticRequestPath: argumentValue(args, '--request'), upstreamInferUrl,
    reviewedRequestSha256: argumentValue(args, '--request-sha256'),
    outputDirectory: argumentValue(args, '--output'), expectedEvidence: config.expectedEvidence,
    evidenceProbe, timeoutMs: config.upstreamTimeoutMs,
  });
  process.stdout.write('Synthetic capture candidate written as PENDING_INDEPENDENT_REVIEW.\n');
}

if (require.main === module) runCli().catch(error => {
  process.stderr.write(`Synthetic capture failed: ${error.message}\n`);
  process.exitCode = 1;
});

module.exports = {
  AUTHORIZATION_GATE, evidenceMatches, postSynthetic, captureCandidate,
  unchangedRequestIdentity, readReviewedRequestAtomically,
  writeCandidateAtomically, revalidateCandidateDirectory, runCli,
};
