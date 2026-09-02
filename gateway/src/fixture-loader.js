'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { validateFixtureEligibility } = require('./synthetic-fixture-adapter');

const FIXTURE_FILES = Object.freeze({
  request: 'mobile-request.json',
  platformResponse: 'platform-response.json',
  manifest: 'manifest.json',
});

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const member of Object.values(value)) deepFreeze(member);
  }
  return value;
}

function readAtomicBytes(filePath, fsImpl = fs) {
  const before = fsImpl.lstatSync(filePath);
  if (!before.isFile() || before.isSymbolicLink()) throw new Error('Fixture artefact must be a non-symlink regular file');
  const bytes = fsImpl.readFileSync(filePath);
  const after = fsImpl.lstatSync(filePath);
  if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
      || before.mtimeMs !== after.mtimeMs) throw new Error('Fixture artefact changed while being read');
  return bytes;
}

function readAtomicJson(filePath, fsImpl = fs) {
  return JSON.parse(readAtomicBytes(filePath, fsImpl).toString('utf8'));
}

function loadFixtureBundle({ directory, approvedEvidence, approvedCaptureRoute, now, fsImpl = fs }) {
  if (!directory) return null;
  try {
    if (!path.isAbsolute(directory)) throw new Error('Fixture directory is not absolute');
    const directoryStat = fsImpl.lstatSync(directory);
    if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink()) throw new Error('Fixture directory is not a regular directory');
    const expectedRealDirectory = path.join(fsImpl.realpathSync(path.dirname(directory)), path.basename(directory));
    if (fsImpl.realpathSync(directory) !== expectedRealDirectory) throw new Error('Fixture directory itself is a symlink');
    const expectedNames = Object.values(FIXTURE_FILES).sort();
    const actualNames = fsImpl.readdirSync(directory).sort();
    if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) throw new Error('Fixture directory must contain exactly three approved artefacts');
    const requestBytes = readAtomicBytes(path.join(directory, FIXTURE_FILES.request), fsImpl);
    const fixture = {
      request: JSON.parse(requestBytes.toString('utf8')),
      platformResponse: readAtomicJson(path.join(directory, FIXTURE_FILES.platformResponse), fsImpl),
      manifest: readAtomicJson(path.join(directory, FIXTURE_FILES.manifest), fsImpl),
    };
    const reviewedRequestSha256 = crypto.createHash('sha256').update(requestBytes).digest('hex');
    if (fixture.manifest.reviewedRequestSha256 !== reviewedRequestSha256) throw new Error('Reviewed request raw-byte hash changed');
    validateFixtureEligibility(fixture, { approvedEvidence, approvedCaptureRoute, now });
    return deepFreeze(fixture);
  } catch {
    throw new Error('Configured synthetic fixture directory failed closed verification');
  }
}

module.exports = { FIXTURE_FILES, loadFixtureBundle, readAtomicBytes, readAtomicJson, deepFreeze };
