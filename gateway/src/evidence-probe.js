'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function validObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function fetchJson(url, { fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { method: 'GET', headers: { accept: 'application/json' }, signal: controller.signal, redirect: 'error' });
    if (!response || !response.ok) return null;
    const value = await response.json();
    return validObject(value) ? value : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function hashOntologyFile(filePath, { statImpl, createReadStreamImpl }) {
  if (!filePath || path.basename(filePath) !== 'ACR_Ontology_Full_v2_2.owl') return null;
  let stat;
  try {
    stat = await statImpl(filePath);
  } catch {
    return null;
  }
  if (!stat.isFile() || stat.size <= 0) return null;
  return new Promise(resolve => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStreamImpl(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', () => resolve(null));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function createPlatformEvidenceProbe({
  statusUrl,
  manifestUrl,
  healthUrl,
  ontologyPath,
  timeoutMs,
  fetchImpl = globalThis.fetch,
  statImpl = fs.promises.stat,
  createReadStreamImpl = fs.createReadStream,
}) {
  if (!statusUrl || !manifestUrl || !healthUrl || !ontologyPath || typeof fetchImpl !== 'function') return async () => null;
  return async function probe() {
    const [status, manifest, health, ontologySha256] = await Promise.all([
      fetchJson(statusUrl, { fetchImpl, timeoutMs }),
      fetchJson(manifestUrl, { fetchImpl, timeoutMs }),
      fetchJson(healthUrl, { fetchImpl, timeoutMs }),
      hashOntologyFile(ontologyPath, { statImpl, createReadStreamImpl }),
    ]);
    if (!status || !manifest || !health || !ontologySha256 || health.success !== true
        || status.manifestId !== manifest.manifestId
        || status.ontologyVersion !== manifest.ontologyVersion
        || !Number.isInteger(status.logicalRuleCount) || status.logicalRuleCount !== manifest.swrlLogicalCount
        || !Number.isInteger(status.physicalBlockCount)
        || status.physicalBlockCount !== manifest.swrlPhysicalCount
        || !Number.isInteger(status.queryCount)
        || status.queryCount !== manifest.sqwrlCount
        || !Number.isInteger(status.runtimeActiveBlocks)
        || status.runtimeActiveBlocks !== manifest.swrlActivePhysical
        || !Number.isInteger(status.swrlRuleCountAfterInjection)
        || !Number.isInteger(status.swrlEmbeddedRuleCount)
        || status.swrlRuleCountAfterInjection !== status.swrlEmbeddedRuleCount
        || status.swrlRuleLoadMode !== 'EMBEDDED_ONLY'
        || manifest.status !== 'active') return null;
    return {
      reasonerVersion: status.ontologyVersion,
      reasoningMode: 'OPENLLET_SWRL',
      ontologySha256,
      logicalRuleCount: status.logicalRuleCount,
      physicalRuleCount: status.physicalBlockCount,
      activeRuleCount: status.runtimeActiveBlocks,
      loadedRuleCount: status.swrlRuleCountAfterInjection,
      queryCount: status.queryCount,
    };
  };
}

module.exports = { createPlatformEvidenceProbe, fetchJson, hashOntologyFile };
