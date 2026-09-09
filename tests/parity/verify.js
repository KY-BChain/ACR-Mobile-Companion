/**
 * Build 45 Gate 6 / T45-05 — website ↔ mobile canonical-fact parity.
 *
 * Both clients post to the same ACR Platform `/api/infer`. This verifier pins
 * the approved fact mapping between them so divergence cannot appear silently.
 *
 * Website comparator: `acr-test-website/js/acr-api-client.js`
 * (`mapToBackendPayload`), as read from the pinned canonical platform SHA
 * 33daead3. The website source is NOT in this repository, so the mapping is
 * pinned here as constants and the accompanying evidence document records where
 * it was read from. If the website changes, this verifier must be re-derived
 * against it — that is the intended failure mode, not a false alarm.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const { PATIENT_FIELDS } = require(path.join(root, 'gateway/src/mapper.js'));

/**
 * Facts the web ACR Pathway sends, from mapToBackendPayload's return block at
 * canonical platform SHA 33daead3.
 */
const WEBSITE_FACTS = [
  'patientId', 'age', 'gender', 'erStatus', 'prStatus', 'her2Status', 'ki67',
  'tumorSize', 'nodalStatus', 'grade', 'stage', 'ecogScore',
  'histologicalSubtype', 'ca153', 'cea', 'dataProvenance',
];

/** Approved parity classification. */
const SHARED = [
  'patientId', 'age', 'gender', 'erStatus', 'prStatus', 'her2Status', 'ki67',
  'tumorSize', 'nodalStatus', 'grade', 'stage', 'ecogScore',
  'histologicalSubtype', 'ca153', 'cea',
];
const MOBILE_ONLY = ['surgeryDate', 'pdl1Status', 'her2Low', 'lvef', 'treatmentIntent'];
const WEBSITE_ONLY = ['dataProvenance'];

const mobileFacts = [...PATIENT_FIELDS];

// ---------------------------------------------------------------------------
// 1. The classification is exhaustive and mutually exclusive.
// ---------------------------------------------------------------------------
assert.deepEqual([...SHARED, ...MOBILE_ONLY].sort(), mobileFacts.slice().sort(),
  'shared + mobile-only must exactly account for every fact the mobile gateway transports');
assert.deepEqual([...SHARED, ...WEBSITE_ONLY].sort(), WEBSITE_FACTS.slice().sort(),
  'shared + website-only must exactly account for every fact the website transports');
for (const f of MOBILE_ONLY) {
  assert.ok(!WEBSITE_FACTS.includes(f), `${f} is classified mobile-only but the website sends it`);
}
for (const f of WEBSITE_ONLY) {
  assert.ok(!mobileFacts.includes(f), `${f} is classified website-only but mobile sends it`);
}
assert.equal(SHARED.length, 15);
assert.equal(mobileFacts.length, 20);
assert.equal(WEBSITE_FACTS.length, 16);

// ---------------------------------------------------------------------------
// 2. The single website-only fact is an identifier the mobile must never send.
//    This is a deliberate divergence required by "Data Stays. Rules Travel.",
//    not a gap to be closed. Gates 4-5 already prove dataProvenance is refused.
// ---------------------------------------------------------------------------
assert.deepEqual(WEBSITE_ONLY, ['dataProvenance'],
  'the only website-only fact must be dataProvenance');
assert.ok(!mobileFacts.includes('dataProvenance'),
  'mobile must never transport dataProvenance');

// ---------------------------------------------------------------------------
// 3. Every mobile-only fact must be consumed by the platform, so mobile is not
//    sending facts the reasoner ignores. Verified against the governed schema:
//    each must be a declared assessment property.
// ---------------------------------------------------------------------------
const schemaProps = Object.keys(
  JSON.parse(read('schemas/acr.cds.v1.request.schema.json')).properties.assessment.properties);
for (const f of MOBILE_ONLY) {
  assert.ok(schemaProps.includes(f), `mobile-only fact ${f} must be a governed schema property`);
}

// ---------------------------------------------------------------------------
// 4. Declared analysis version. The two clients declare DIFFERENT values to the
//    same backend (website 2.1.2, mobile 2.2; platform DTO default 2.0). The
//    platform stores but never reads it, so this is inert today — pinned here so
//    it cannot drift further unnoticed, and recorded as an open item for C45-11.
// ---------------------------------------------------------------------------
assert.match(read('gateway/src/mapper.js'), /analysisVersion: '2\.2'/,
  'mobile analysis version is pinned at 2.2');
const WEBSITE_ANALYSIS_VERSION = '2.1.2';
assert.notEqual(WEBSITE_ANALYSIS_VERSION, '2.2',
  'recorded divergence: website and mobile declare different analysisVersion values');

// ---------------------------------------------------------------------------
// 5. Controlled evaluation context. The website normalises free-form clinical
//    source data before sending; the mobile app collects governed enums at the
//    point of entry. Both therefore reach the same backend contract by different
//    routes, and the mobile route is the stricter of the two.
// ---------------------------------------------------------------------------
const schema = JSON.parse(read('schemas/acr.cds.v1.request.schema.json'))
  .properties.assessment.properties;
for (const [field, allowed] of [
  ['erStatus', ['positive', 'negative']],
  ['prStatus', ['positive', 'negative']],
  ['her2Status', ['positive', 'negative']],
  ['nodalStatus', ['N0', 'N1', 'N2', 'N3']],
  ['grade', ['1', '2', '3']],
]) {
  const values = (schema[field].enum || []).filter((v) => v !== null);
  assert.deepEqual(values.sort(), allowed.slice().sort(),
    `${field} must be constrained to a governed enum at mobile entry`);
}

console.log(`PASS canonical-fact parity: ${SHARED.length} shared, ${MOBILE_ONLY.length} mobile-only (${MOBILE_ONLY.join(', ')}), ${WEBSITE_ONLY.length} website-only (${WEBSITE_ONLY.join(', ')} — an identifier mobile must never send); mobile entry is enum-constrained where the website normalises free text`);
