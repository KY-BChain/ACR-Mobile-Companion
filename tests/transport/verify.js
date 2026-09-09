/**
 * Build 45 Gates 4–5 — five-screen transport, end to end and adversarial.
 *
 * The existing p1p2 verifier proves the request builder emits the 21 governed
 * assessment properties. This verifier carries that payload the rest of the way
 * — through AJV validation and the gateway mapper to the platform request body —
 * and proves the two Gate 4–5 STOP conditions cannot be reached:
 *
 *   (a) no field outside the governed 20 (plus patientId) is ever transported;
 *   (b) no identifying field reaches any transported payload.
 *
 * (b) matters because the platform's own PatientData model *can* hold
 * identifiers — patientEmail, addressFullText, city, postalCode, country,
 * emergencyContactName, emergencyContactPhone, facilityName, facilityAddress,
 * operatorName, dataProvenance, consentReference. "Data Stays. Rules Travel."
 * depends on the gateway never populating them, so this is proven rather than
 * assumed, including under deliberate injection.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const compile = (file, localRequire) => {
  const code = ts.transpileModule(read(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
};

const validation = compile('src/utils/provisionalValidation.ts', require);
const builder = compile('src/api/requestBuilder.ts', (name) => {
  if (name === '../config/appIdentity') return { MOBILE_BUILD_ID: 'mob-v0.6.5+45' };
  if (name === '../utils/provisionalValidation') return validation;
  return require(name);
});

const { mapAssessmentToPlatform, PATIENT_FIELDS } = require(path.join(root, 'gateway/src/mapper.js'));
const { validateAssessmentRequest } = require(path.join(root, 'gateway/src/schema.js'));

/** Identifying / administrative fields the platform model can hold. */
const IDENTIFYING_FIELDS = [
  'patientEmail', 'addressFullText', 'city', 'postalCode', 'country',
  'emergencyContactName', 'emergencyContactPhone', 'facilityName',
  'facilityAddress', 'operatorName', 'dataProvenance', 'consentReference',
];

/** A complete, realistic five-screen entry: all 20 governed values supplied. */
const completeInput = {
  patientId: 'mob-11111111-1111-4111-8111-111111111111',
  requestId: '22222222-2222-4222-8222-222222222222',
  form: {
    step1: { erStatus: 'positive', prStatus: 'positive', her2Status: 'negative', ki67: '25' },
    step2: { stage: 'II', grade: '2', histologicalSubtype: 'IDC', nodalStatus: 'N0', age: '52' },
    step3: { ca153: '40', cea: '6', surgeryDate: '2026-03-14', bayesianEnhanced: true },
  },
  p1: { tumorSize: '22', gender: 'female' },
  p2: { ecogScore: '1', pdl1Status: 'negative', her2Low: 'positive', lvef: '60', treatmentIntent: 'adjuvant' },
};

const GOVERNED_ASSESSMENT_KEYS = [
  'patientId', 'erStatus', 'prStatus', 'her2Status', 'ki67', 'stage', 'grade',
  'histologicalSubtype', 'nodalStatus', 'age', 'ca153', 'cea', 'surgeryDate',
  'bayesianEnhanced', 'tumorSize', 'gender', 'ecogScore', 'pdl1Status',
  'her2Low', 'lvef', 'treatmentIntent',
];

// ---------------------------------------------------------------------------
// 1. Five screens → request. Exactly the governed keys, nothing more.
// ---------------------------------------------------------------------------
const request = builder.buildAssessmentRequest(completeInput);
assert.deepEqual(Object.keys(request.assessment), GOVERNED_ASSESSMENT_KEYS,
  'the five input screens must transport exactly the governed assessment keys');
assert.deepEqual(Object.keys(request), ['contract', 'requestId', 'assessment', 'client'],
  'the request envelope must carry no additional top-level members');
assert.deepEqual(Object.keys(request.client), ['channel', 'buildId', 'environment'],
  'the client block must carry no additional members');

// ---------------------------------------------------------------------------
// 2. Gateway schema accepts it, and the whole payload survives the round trip.
// ---------------------------------------------------------------------------
const validated = validateAssessmentRequest(JSON.parse(JSON.stringify(request)));
assert.deepEqual(Object.keys(validated.assessment).sort(), GOVERNED_ASSESSMENT_KEYS.slice().sort(),
  'AJV validation must preserve exactly the governed assessment keys');

// ---------------------------------------------------------------------------
// 3. Mapper → platform body. Exactly the 20 transported fields plus controls.
// ---------------------------------------------------------------------------
const platformBody = mapAssessmentToPlatform(validated);
assert.deepEqual(Object.keys(platformBody).sort(), ['analysisVersion', 'bayesianEnhanced', 'patientData'],
  'the platform request body must carry only patientData plus the two controls');
assert.deepEqual(Object.keys(platformBody.patientData).sort(), [...PATIENT_FIELDS].sort(),
  'patientData must contain exactly the 20 transported fields');
assert.equal(Object.keys(platformBody.patientData).length, 20);

// ---------------------------------------------------------------------------
// 4. No identifying field is present, by name, anywhere in the payload.
// ---------------------------------------------------------------------------
const serialised = JSON.stringify(platformBody);
for (const field of IDENTIFYING_FIELDS) {
  assert.ok(!(field in platformBody.patientData),
    `identifying field "${field}" must never be populated in a transported payload`);
  assert.ok(!new RegExp(`"${field}"`, 'i').test(serialised),
    `identifying field name "${field}" must not appear in the transported payload`);
}

// ---------------------------------------------------------------------------
// 5. No identifying VALUE shape survives, even though every governed field is
//    populated: no email, phone, postcode or free-text name.
// ---------------------------------------------------------------------------
// patientId is a synthetic, contract-validated pseudonymous UUID and is scanned
// separately; excluding it keeps the free-text scans from matching its digits.
assert.match(platformBody.patientData.patientId,
  /^mob-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{12}$|^mob-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  'patientId must be a synthetic pseudonymous UUID, never a real-world identifier');

const scannable = { ...platformBody.patientData };
delete scannable.patientId;
const scannableJson = JSON.stringify({ ...platformBody, patientData: scannable });

const valueScans = [
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, 'an email address'],
  [/\+\d[\d\s()-]{7,}\d|\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b|\(\d{3}\)\s*\d{3}[\s.-]?\d{4}/, 'a telephone-shaped number'],
  [/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/, 'a UK-postcode-shaped token'],
];
for (const [pattern, description] of valueScans) {
  assert.ok(!pattern.test(scannableJson),
    `the transported payload must not contain ${description}`);
}

// ---------------------------------------------------------------------------
// 6. Adversarial: identifying fields injected at the wire are refused by the
//    schema, and stripped by the mapper even if schema validation is bypassed.
// ---------------------------------------------------------------------------
for (const field of IDENTIFYING_FIELDS) {
  const tainted = JSON.parse(JSON.stringify(request));
  tainted.assessment[field] = 'injected-identifier';
  assert.throws(() => validateAssessmentRequest(tainted),
    (err) => err.code === 'SCHEMA_INVALID' && err.status === 400 && err.outcome === 'NOT_SUBMITTED'
      && err.fieldErrors.some((e) => /additional properties/i.test(e)),
    `AJV must refuse an assessment carrying "${field}"`);

  // Defence in depth: even unvalidated, the mapper is allow-list driven.
  const mapped = mapAssessmentToPlatform(tainted);
  assert.ok(!(field in mapped.patientData),
    `the mapper must not forward "${field}" even when validation is bypassed`);
  assert.ok(!JSON.stringify(mapped).includes('injected-identifier'),
    `no injected identifier value may survive mapping of "${field}"`);
}

// ---------------------------------------------------------------------------
// 7. Adversarial: an ungoverned clinical-looking field is equally refused.
// ---------------------------------------------------------------------------
for (const field of ['brca1Status', 'oncotypeScore', 'notes', 'hospitalId']) {
  const tainted = JSON.parse(JSON.stringify(request));
  tainted.assessment[field] = 'ungoverned';
  assert.throws(() => validateAssessmentRequest(tainted),
    (err) => err.code === 'SCHEMA_INVALID' && err.status === 400 && err.outcome === 'NOT_SUBMITTED',
    `AJV must refuse ungoverned field "${field}"`);
  assert.ok(!(field in mapAssessmentToPlatform(tainted).patientData),
    `the mapper must not forward ungoverned field "${field}"`);
}

// ---------------------------------------------------------------------------
// 8. Optional-field semantics: omitted values are transported as explicit null,
//    never dropped, so the platform sees a complete, unambiguous record.
// ---------------------------------------------------------------------------
const sparseInput = {
  patientId: completeInput.patientId,
  requestId: completeInput.requestId,
  form: {
    step1: { erStatus: 'negative', prStatus: 'negative', her2Status: 'positive', ki67: '10' },
    step2: { stage: null, grade: null, histologicalSubtype: null, nodalStatus: null, age: '' },
    step3: { ca153: '', cea: '', surgeryDate: '', bayesianEnhanced: false },
  },
  p1: { tumorSize: '', gender: '' },
  p2: { ecogScore: '', pdl1Status: '', her2Low: '', lvef: '', treatmentIntent: '' },
};
const sparsePlatform = mapAssessmentToPlatform(
  validateAssessmentRequest(builder.buildAssessmentRequest(sparseInput)));
assert.equal(Object.keys(sparsePlatform.patientData).length, 20,
  'a sparse entry must still transport all 20 fields');
const nulled = Object.entries(sparsePlatform.patientData)
  .filter(([, v]) => v === null).map(([k]) => k).sort();
assert.deepEqual(nulled,
  ['age', 'ca153', 'cea', 'ecogScore', 'gender', 'grade', 'her2Low', 'histologicalSubtype',
    'lvef', 'nodalStatus', 'pdl1Status', 'stage', 'surgeryDate', 'treatmentIntent', 'tumorSize'],
  'omitted optional fields must be transported as explicit null');
assert.equal(sparsePlatform.bayesianEnhanced, false,
  'the Bayes control flag must be transported faithfully when false');

console.log('PASS five-screen transport: 20 governed fields plus patientId reach the platform intact; 12 platform identifying fields are unpopulated, name- and value-absent, refused by schema and stripped by the allow-list mapper under injection; omitted optionals transported as explicit null');
