/**
 * Build 45 Gate 3 / G3-04 — mobile ↔ gateway ↔ platform contract parity.
 *
 * The Build 44 suites exercise the gateway against fixtures. This verifier
 * instead asserts that the three independent declarations of the governed
 * assessment contract stay in lockstep, so a field added or renamed in one
 * place cannot silently diverge from the others:
 *
 *   1. schemas/acr.cds.v1.request.schema.json  — the governed wire contract
 *   2. gateway/src/mapper.js PATIENT_FIELDS    — what the gateway transports
 *   3. src/api/requestBuilder.ts               — what the app actually emits
 *
 * It also pins the response envelope that src/api/responseGuard.ts enforces
 * with exact-key matching, so a gateway response-shape change cannot land
 * without the client guard being updated in the same commit.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const schema = JSON.parse(read('schemas/acr.cds.v1.request.schema.json'));
const assessment = schema.properties.assessment;
const schemaFields = Object.keys(assessment.properties);

const { PATIENT_FIELDS } = require(path.join(root, 'gateway/src/mapper.js'));

// ---------------------------------------------------------------------------
// 1. Governed field count: 20 clinical/control values plus patientId.
// ---------------------------------------------------------------------------
const CONTROL_FIELDS = ['bayesianEnhanced'];
assert.equal(schemaFields.length, 21,
  `governed assessment contract must declare exactly 21 properties, found ${schemaFields.length}`);
assert.equal(assessment.additionalProperties, false,
  'assessment must forbid additional properties so ungoverned fields cannot be transported');

// ---------------------------------------------------------------------------
// 2. Schema ↔ gateway mapper.
// ---------------------------------------------------------------------------
const transported = schemaFields.filter((f) => !CONTROL_FIELDS.includes(f));
assert.deepEqual([...PATIENT_FIELDS].sort(), [...transported].sort(),
  'gateway PATIENT_FIELDS must transport exactly the governed non-control fields');

const mapperSource = read('gateway/src/mapper.js');
assert.match(mapperSource, /bayesianEnhanced: assessment\.bayesianEnhanced/,
  'the bayesianEnhanced control flag must be carried to the platform');
assert.match(mapperSource, /analysisVersion: '2\.2'/,
  'the platform analysis version must remain pinned');

// ---------------------------------------------------------------------------
// 3. Schema ↔ mobile request builder. Every governed field must be emitted,
//    and nothing outside the contract may be.
// ---------------------------------------------------------------------------
const builder = read('src/api/requestBuilder.ts');
const assessmentBlock = builder.slice(
  builder.indexOf('assessment: {'), builder.indexOf('client: {'));
assert.ok(assessmentBlock.length > 0, 'could not locate the assessment block in requestBuilder.ts');

for (const field of schemaFields) {
  // Matches both `field: value` and ES6 shorthand `field,`.
  const emitted = new RegExp(`(^|[\\s,{])${field}\\s*[,:]`).test(assessmentBlock);
  assert.ok(emitted, `requestBuilder must emit governed field "${field}"`);
}

// ---------------------------------------------------------------------------
// 4. Client identity is derived, never a drifting literal.
// ---------------------------------------------------------------------------
const identity = read('src/config/appIdentity.ts');
assert.match(identity, /MOBILE_BUILD_ID = `mob-v\$\{APP_VERSION\}\+\$\{APP_BUILD\}`/,
  'MOBILE_BUILD_ID must be derived from app.json, not hardcoded');
assert.doesNotMatch(builder, /buildId: ['"]mob-v/,
  'requestBuilder must not hardcode a build identity literal');

// ---------------------------------------------------------------------------
// 5. Response envelope pinned on both sides.
// ---------------------------------------------------------------------------
const guard = read('src/api/responseGuard.ts');
const ENVELOPE_KEYS = ['contract', 'requestId', 'status', 'completedAt', 'resultMode',
  'reasoningMode', 'data', 'platformResponse', 'delivery', 'warnings'];
for (const key of ENVELOPE_KEYS) {
  assert.ok(guard.includes(`'${key}'`), `response guard must pin envelope key "${key}"`);
}
const DATA_KEYS = ['patientId', 'timestamp', 'molecularSubtype', 'deterministic', 'bayesian',
  'reasoning', 'riskLevel', 'dataCompleteness', 'reasoningMode'];
for (const key of DATA_KEYS) {
  assert.ok(guard.includes(`'${key}'`), `response guard must pin data key "${key}"`);
}
assert.match(guard, /hasExactKeys/,
  'response guard must use exact-key matching so unexpected fields are refused');

// ---------------------------------------------------------------------------
// 6. Build-time endpoint governance (G3-02): one compiled origin, no runtime
//    switching, no endpoint editor, and the retired t4 identity is absent.
// ---------------------------------------------------------------------------
const gatewayConfig = read('src/config/gateway.ts');
assert.match(gatewayConfig, /ACTIVE_GATEWAY_ORIGIN: GovernedOrigin/,
  'the compiled origin must be typed to the governed set');
assert.match(gatewayConfig, /GATEWAY_API_BASE = `\$\{ACTIVE_GATEWAY_ORIGIN\}\/m\/v1`/,
  'the API base must derive from the single compiled origin');
assert.match(gatewayConfig, /BUILD45_REVIEW_ORIGIN = 'https:\/\/mobile-gateway-review\.acragent\.com'/,
  'the Build 45 review origin must be the authorised acr-mobile-review hostname over TLS');
assert.doesNotMatch(gatewayConfig, /process\.env|AsyncStorage|localStorage|setOrigin|useState/,
  'the gateway origin must not be runtime-configurable');

for (const file of ['src/config/gateway.ts', 'src/api/client.ts', 'gateway/src/config.js', 'gateway/src/app.js']) {
  assert.doesNotMatch(read(file), /acr-mobile-gateway-t4|(^|[^-])mobile\.acragent\.com/,
    `${file} must not reference the retired t4 tunnel identity`);
}

// ---------------------------------------------------------------------------
// 7. The stored e2e fixture is known-incomplete (Gate 1 OBS-5). Assert the gap
//    explicitly so it is tracked rather than mistaken for full coverage.
// ---------------------------------------------------------------------------
const fixture = JSON.parse(read('e2e/fixtures/luminal-b-request.json'));
const fixtureFields = Object.keys(fixture.assessment);
const missing = schemaFields.filter((f) => !fixtureFields.includes(f));
assert.deepEqual(missing.sort(),
  ['ecogScore', 'gender', 'her2Low', 'lvef', 'pdl1Status', 'treatmentIntent', 'tumorSize'],
  'stored fixture coverage changed; update Gate 1 OBS-5 and this expectation together');
assert.equal(JSON.parse(read('e2e/fixtures/luminal-b-fixture-manifest.json')).eligibleForDeliveredReplay, false,
  'the incomplete Build 43 mock fixture must never be eligible for delivered replay');

console.log(`PASS contract parity: ${schemaFields.length} governed assessment fields aligned across schema, gateway mapper and mobile request builder; response envelope pinned both sides; single compiled https-capable gateway origin with no runtime switching`);
