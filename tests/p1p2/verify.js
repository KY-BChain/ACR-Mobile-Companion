const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const compile = (file, localRequire) => {
  const code = ts.transpileModule(read(file), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
};
const validation = compile('src/utils/provisionalValidation.ts', require);
const builder = compile('src/api/requestBuilder.ts', (name) => {
  if (name === '../config/appIdentity') return { MOBILE_BUILD_ID: 'mob-v0.6.0+44' };
  if (name === '../utils/provisionalValidation') return validation;
  return require(name);
});

const patientId = 'mob-11111111-1111-4111-8111-111111111111';
const requestId = '22222222-2222-4222-8222-222222222222';
const input = {
  patientId, requestId,
  form: {
    step1: { erStatus: 'positive', prStatus: 'negative', her2Status: 'negative', ki67: '0' },
    step2: { stage: null, grade: null, histologicalSubtype: null, nodalStatus: 'N3', age: '' },
    step3: { ca153: '0', cea: '', surgeryDate: '', bayesianEnhanced: false },
  },
  p1: { tumorSize: '2.75', gender: 'unknown' },
  p2: { ecogScore: '0', pdl1Status: 'not_tested', her2Low: 'positive', lvef: '0', treatmentIntent: 'unspecified' },
};
const request = builder.buildAssessmentRequest(input);

const expectedFields = [
  'patientId', 'erStatus', 'prStatus', 'her2Status', 'ki67', 'stage', 'grade', 'histologicalSubtype', 'nodalStatus', 'age',
  'ca153', 'cea', 'surgeryDate', 'bayesianEnhanced', 'tumorSize', 'gender', 'ecogScore', 'pdl1Status', 'her2Low', 'lvef', 'treatmentIntent',
];
assert.deepEqual(Object.keys(request.assessment), expectedFields);
assert.equal(request.contract, 'acr.cds.v1');
assert.equal(request.requestId, requestId);
assert.deepEqual(request.client, { channel: 'MOBILE', buildId: 'mob-v0.6.0+44', environment: 'EVALUATION' });
assert.equal(request.assessment.ki67, 0, 'required zero preserved');
assert.equal(request.assessment.ca153, 0, 'optional zero preserved');
assert.equal(request.assessment.bayesianEnhanced, false, 'false preserved');
assert.equal(request.assessment.nodalStatus, 'N3', 'N0-N3 transported without collapse');
assert.equal(request.assessment.tumorSize, 2.75, 'raw positive tumour value transported without conversion');
assert.equal(request.assessment.ecogScore, 0);
assert.equal(request.assessment.lvef, 0);
assert.equal(request.assessment.her2Low, 'positive');
for (const field of ['stage', 'grade', 'histologicalSubtype', 'age', 'cea', 'surgeryDate']) assert.equal(request.assessment[field], null, `${field} blank becomes null`);
assert.throws(() => builder.buildAssessmentRequest({ ...input, patientId: 'bad' }), /invalid/i);

for (const invalidBayes of ['false', null, 0]) {
  const candidate = structuredClone(input);
  candidate.form.step3.bayesianEnhanced = invalidBayes;
  assert.throws(
    () => builder.buildAssessmentRequest(candidate),
    (error) => error instanceof builder.AssessmentValidationError && error.fieldErrors.includes('bayesianEnhanced'),
    `non-Boolean Bayes value ${JSON.stringify(invalidBayes)} is rejected at the runtime builder boundary`,
  );
}

const invalidCases = [
  ['erStatus enum', (x) => { x.form.step1.erStatus = 'unknown'; }],
  ['prStatus enum', (x) => { x.form.step1.prStatus = 'unknown'; }],
  ['her2Status enum', (x) => { x.form.step1.her2Status = 'unknown'; }],
  ['ki67 blank', (x) => { x.form.step1.ki67 = ''; }],
  ['ki67 low', (x) => { x.form.step1.ki67 = '-1'; }],
  ['ki67 high', (x) => { x.form.step1.ki67 = '101'; }],
  ['ki67 NaN', (x) => { x.form.step1.ki67 = 'NaN'; }],
  ['stage enum', (x) => { x.form.step2.stage = 'V'; }],
  ['grade enum', (x) => { x.form.step2.grade = '4'; }],
  ['histology enum', (x) => { x.form.step2.histologicalSubtype = 'OTHER'; }],
  ['nodal enum', (x) => { x.form.step2.nodalStatus = 'positive'; }],
  ['age low', (x) => { x.form.step2.age = '17'; }],
  ['age high', (x) => { x.form.step2.age = '121'; }],
  ['age decimal', (x) => { x.form.step2.age = '18.5'; }],
  ['ca153 negative', (x) => { x.form.step3.ca153 = '-1'; }],
  ['cea infinity', (x) => { x.form.step3.cea = 'Infinity'; }],
  ['date syntax', (x) => { x.form.step3.surgeryDate = '31/12/2026'; }],
  ['date reality', (x) => { x.form.step3.surgeryDate = '2026-02-29'; }],
  ['tumour zero', (x) => { x.p1.tumorSize = '0'; }],
  ['tumour infinity', (x) => { x.p1.tumorSize = 'Infinity'; }],
  ['gender enum', (x) => { x.p1.gender = 'not-a-gender'; }],
  ['ECOG low', (x) => { x.p2.ecogScore = '-1'; }],
  ['ECOG high', (x) => { x.p2.ecogScore = '5'; }],
  ['ECOG decimal', (x) => { x.p2.ecogScore = '1.5'; }],
  ['PD-L1 enum', (x) => { x.p2.pdl1Status = 'unknown'; }],
  ['HER2-low enum', (x) => { x.p2.her2Low = 'not_tested'; }],
  ['LVEF low', (x) => { x.p2.lvef = '-1'; }],
  ['LVEF high', (x) => { x.p2.lvef = '101'; }],
  ['intent enum', (x) => { x.p2.treatmentIntent = 'curative'; }],
];
for (const [name, mutate] of invalidCases) {
  const candidate = structuredClone(input);
  mutate(candidate);
  assert.throws(() => builder.buildAssessmentRequest(candidate), /invalid/i, name);
}

for (const nodalStatus of ['N0', 'N1', 'N2', 'N3']) {
  const candidate = structuredClone(input); candidate.form.step2.nodalStatus = nodalStatus;
  assert.equal(builder.buildAssessmentRequest(candidate).assessment.nodalStatus, nodalStatus);
}
const boundary = structuredClone(input);
boundary.form.step1.ki67 = '100'; boundary.form.step2.age = '18'; boundary.form.step3.surgeryDate = '2099-12-31';
boundary.p1.tumorSize = '.1'; boundary.p2.ecogScore = '4'; boundary.p2.her2Low = 'unknown'; boundary.p2.lvef = '100';
const boundaryRequest = builder.buildAssessmentRequest(boundary);
assert.equal(boundaryRequest.assessment.surgeryDate, '2099-12-31', 'valid future date travels unchanged');
assert.equal(boundaryRequest.assessment.her2Low, 'unknown', 'explicit unknown is preserved to the gateway boundary');

const localeFiles = fs.readdirSync(path.join(root, 'src/i18n/locales')).filter((file) => file.endsWith('.json')).sort();
assert.equal(localeFiles.length, 8);
const flatten = (value, prefix = '', out = new Map()) => {
  for (const [key, child] of Object.entries(value)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, keyPath, out);
    else out.set(keyPath, { type: Array.isArray(child) ? 'array' : typeof child, interpolations: typeof child === 'string' ? [...child.matchAll(/{{\s*([^},\s]+)[^}]*}}/g)].map((m) => m[1]).sort() : [] });
  }
  return out;
};
const reference = flatten(JSON.parse(read('src/i18n/locales/en-GB.json')));
for (const file of localeFiles) {
  const candidate = flatten(JSON.parse(read(`src/i18n/locales/${file}`)));
  assert.deepEqual([...candidate.keys()].sort(), [...reference.keys()].sort(), `${file} key parity`);
  for (const [key, metadata] of reference) assert.deepEqual(candidate.get(key), metadata, `${file}: ${key}`);
}

const review = read('src/screens/ReviewScreen.tsx');
for (const field of ['tumorSize', 'gender', 'ecogScore', 'pdl1Status', 'her2Low', 'lvef', 'treatmentIntent']) assert.match(review, new RegExp(`store\\.(?:p1|p2)\\.${field}`));
assert.match(read('src/i18n/locales/en-GB.json'), /Build 44 transports all P1 and P2 fields/);
console.log('PASS positive all-field request evidence: 21 assessment properties (patientId plus 20 clinical/request values), P1/P2 transported, null/zero/false/N3/raw tumour semantics, 8-locale parity');
