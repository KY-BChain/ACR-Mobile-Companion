'use strict';

const { assertPinnedExpectedEvidence } = require('./config');

const nullableEvidence = Object.freeze({
  reasonerVersion: null,
  reasoningMode: null,
  ontologySha256: null,
  logicalRuleCount: null,
  physicalRuleCount: null,
  activeRuleCount: null,
  loadedRuleCount: null,
  queryCount: null,
});

class AttestationService {
  constructor({ expected, evidenceProbe = async () => null, now = () => new Date().toISOString() }) {
    this.expected = assertPinnedExpectedEvidence(expected);
    this.evidenceProbe = evidenceProbe;
    this.now = now;
    this.lastSuccessfulVerificationTimestamp = null;
  }

  async assess() {
    const lastVerificationTimestamp = this.now();
    let observed = null;
    try {
      observed = await this.evidenceProbe();
    } catch {
      observed = null;
    }
    const complete = observed && Object.keys(nullableEvidence).every(key => observed[key] !== null && observed[key] !== undefined);
    const matches = complete && Object.keys(nullableEvidence).every(key => observed[key] === this.expected[key]);
    const verificationState = !complete ? 'UNAVAILABLE' : matches ? 'VERIFIED' : 'MISMATCH';
    if (verificationState === 'VERIFIED') this.lastSuccessfulVerificationTimestamp = lastVerificationTimestamp;
    return {
      contract: 'acr.attestation.v1',
      verificationState,
      expected: { ...this.expected },
      observed: complete ? { ...observed } : { ...nullableEvidence },
      lastVerificationTimestamp,
      lastSuccessfulVerificationTimestamp: this.lastSuccessfulVerificationTimestamp,
    };
  }
}

module.exports = { AttestationService, nullableEvidence };
