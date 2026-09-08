'use strict';

const { createPlatformEvidenceProbe } = require('../src/evidence-probe');
const { AttestationService } = require('../src/attestation');
const { loadConfig } = require('../src/config');

const CANONICAL_ONTOLOGY_PATH = '/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl';
const CANONICAL_ONTOLOGY_HASH = 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1';
const EXPECTED = Object.freeze({
  reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: CANONICAL_ONTOLOGY_HASH,
  logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27,
});
const URLs = {
  statusUrl: 'https://api.example.test/api/ontolator/status',
  manifestUrl: 'https://api.example.test/api/ontolator/manifest',
  healthUrl: 'https://api.example.test/api/infer/health',
};
const status = {
  manifestId: 'MANIFEST-TEST', ontologyVersion: 'v2.2', logicalRuleCount: 71, physicalBlockCount: 76,
  runtimeActiveBlocks: 76, queryCount: 27, swrlRuleCountAfterInjection: 76,
  swrlEmbeddedRuleCount: 76, swrlRuleLoadMode: 'EMBEDDED_ONLY',
};
const manifest = {
  manifestId: 'MANIFEST-TEST', ontologyVersion: 'v2.2', swrlLogicalCount: 71, swrlPhysicalCount: 76,
  swrlActivePhysical: 76, sqwrlCount: 27, status: 'active',
};

function actualProbe({ responseOverrides = {}, fetchFailure = false } = {}) {
  const values = {
    [URLs.statusUrl]: { ...status, ...(responseOverrides.status || {}) },
    [URLs.manifestUrl]: { ...manifest, ...(responseOverrides.manifest || {}) },
    [URLs.healthUrl]: { success: true, ...(responseOverrides.health || {}) },
  };
  const fetchImpl = jest.fn(async url => {
    if (fetchFailure) throw new Error('offline');
    return { ok: true, json: async () => values[url] };
  });
  const probe = createPlatformEvidenceProbe({
    ...URLs,
    ontologyPath: CANONICAL_ONTOLOGY_PATH, timeoutMs: 1000, fetchImpl,
  });
  return { probe, fetchImpl };
}

describe('actual read-only platform evidence probe', () => {
  test('positive baseline proves 71/76/76/76/27 and the canonical local ontology asset hash', async () => {
    const values = { [URLs.statusUrl]: status, [URLs.manifestUrl]: manifest, [URLs.healthUrl]: { success: true } };
    const probe = createPlatformEvidenceProbe({
      ...URLs, ontologyPath: CANONICAL_ONTOLOGY_PATH, timeoutMs: 1000,
      fetchImpl: async url => ({ ok: true, json: async () => values[url] }),
    });
    expect(await probe()).toEqual({
      reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL', ontologySha256: CANONICAL_ONTOLOGY_HASH,
      logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27,
    });
  });

  test('VERIFIED derives only from three actual GET responses and a read ontology hash', async () => {
    const { probe, fetchImpl } = actualProbe();
    const expected = EXPECTED;
    const attestation = await new AttestationService({ expected, evidenceProbe: probe, now: () => '2026-08-31T12:00:00Z' }).assess();
    expect(attestation.verificationState).toBe('VERIFIED');
    expect(attestation.observed).toEqual(expected);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    for (const call of fetchImpl.mock.calls) expect(call[1]).toEqual(expect.objectContaining({ method: 'GET', redirect: 'error' }));
  });

  test('actual mismatch remains observed and produces MISMATCH', async () => {
    const { probe } = actualProbe({ responseOverrides: { status: { logicalRuleCount: 70 }, manifest: { swrlLogicalCount: 70 } } });
    const expected = EXPECTED;
    const attestation = await new AttestationService({ expected, evidenceProbe: probe }).assess();
    expect(attestation.verificationState).toBe('MISMATCH');
    expect(attestation.observed.logicalRuleCount).toBe(70);
  });

  test.each([
    [{ status: { manifestId: 'STALE' } }, false],
    [{ manifest: { swrlPhysicalCount: 75 } }, false],
    [{ status: { swrlEmbeddedRuleCount: 75 } }, false],
    [{ status: { swrlRuleCountAfterInjection: 75 } }, false],
    [{ health: { success: false } }, false],
    [{}, true],
  ])('inconsistent or unavailable probe returns nullable UNAVAILABLE evidence', async (responseOverrides, fetchFailure) => {
    const { probe } = actualProbe({ responseOverrides, fetchFailure });
    const expected = EXPECTED;
    const attestation = await new AttestationService({ expected, evidenceProbe: probe }).assess();
    expect(attestation.verificationState).toBe('UNAVAILABLE');
    expect(Object.values(attestation.observed)).toEqual([null, null, null, null, null, null, null, null]);
  });

  test('stale self-declared ACR_OBSERVED values are ignored and cannot configure verification', () => {
    const config = loadConfig({
      ACR_OBSERVED_REASONER_VERSION: 'v2.2', ACR_OBSERVED_REASONING_MODE: 'OPENLLET_SWRL',
      ACR_OBSERVED_ONTOLOGY_SHA256: CANONICAL_ONTOLOGY_HASH, ACR_OBSERVED_RULE_COUNT: '76', ACR_OBSERVED_QUERY_COUNT: '27',
    });
    expect(config).not.toHaveProperty('observedEvidence');
    expect(config.evidence).toEqual({ statusUrl: null, manifestUrl: null, healthUrl: null, ontologyPath: null });
  });

  test.each([
    ['logical', { status: { logicalRuleCount: 70 }, manifest: { swrlLogicalCount: 70 } }, 'logicalRuleCount', 70],
    ['physical', { status: { physicalBlockCount: 75 }, manifest: { swrlPhysicalCount: 75 } }, 'physicalRuleCount', 75],
    ['active', { status: { runtimeActiveBlocks: 75 }, manifest: { swrlActivePhysical: 75 } }, 'activeRuleCount', 75],
    ['loaded', { status: { swrlEmbeddedRuleCount: 75, swrlRuleCountAfterInjection: 75 } }, 'loadedRuleCount', 75],
  ])('internally consistent degraded %s evidence is observed as MISMATCH, never VERIFIED', async (label, responseOverrides, field, value) => {
    const { probe } = actualProbe({ responseOverrides });
    const expected = EXPECTED;
    const attestation = await new AttestationService({ expected, evidenceProbe: probe }).assess();
    expect(attestation.verificationState).toBe('MISMATCH');
    expect(attestation.observed[field]).toBe(value);
  });
});
