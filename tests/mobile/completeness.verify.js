const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Build 47 (v0.6.6): incomplete-case flow (M1–M9), signed-in-while-offline
// (M11), synthetic demonstration case (M12) and Android release identity (A–C).

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const compile = (file, mocks = {}) => {
  const code = ts.transpileModule(read(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (name) => (name in mocks ? mocks[name] : require(name));
  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
};

const completeness = compile('src/screens/completeness.ts');
const sample = compile('src/store/sampleCase.ts');

// ── The ten fields, pinned to T1 (ReasonerService.assessDataCompleteness, platform 33daead)
assert.deepEqual(
  completeness.FULL_ASSESSMENT_FIELDS.map((field) => [field.platformName, field.tier]),
  [['erStatus', 1], ['prStatus', 1], ['her2Status', 1], ['ki67', 1], ['histologicGrade', 1],
    ['tumorSize', 1], ['nodalStatus', 1], ['age', 1], ['overallStageGroup', 2], ['ecogScore', 2]],
  'the ten-field list must match T1 exactly; re-check it whenever the platform changes',
);
const where = (name) => { const field = completeness.fullAssessmentField(name); return field && [field.route, field.screen]; };
assert.deepEqual(where('tumorSize'), ['P1', 4]);
assert.deepEqual(where('ecogScore'), ['P2', 5]);
for (const name of ['histologicGrade', 'nodalStatus', 'age', 'overallStageGroup']) assert.deepEqual(where(name), ['Step2', 2]);
for (const name of ['erStatus', 'prStatus', 'her2Status', 'ki67']) assert.deepEqual(where(name), ['Step1', 1]);
assert.equal(completeness.fullAssessmentField('aFieldFromAFutureT1'), null, 'an unknown name is shown as returned, never hidden');
assert.equal(completeness.ENTRY_SCREEN_COUNT, 5);

// ── Blank detection, return route, withheld risk
const names = (fields) => fields.map((field) => field.platformName);
assert.deepEqual(names(completeness.blankFullAssessmentFields(sample.SAMPLE_FORM, sample.BLANK_P1, sample.BLANK_P2)), ['tumorSize', 'ecogScore'],
  'the untouched sample leaves exactly tumour size and ECOG blank');
assert.deepEqual(names(completeness.blankFullAssessmentFields(sample.SAMPLE_FORM, sample.DEMO_P1, sample.DEMO_P2)), []);
const cleared = { ...sample.SAMPLE_FORM, step2: { ...sample.SAMPLE_FORM.step2, grade: null, stage: null, age: '  ' } };
assert.deepEqual(names(completeness.blankFullAssessmentFields(cleared, sample.DEMO_P1, sample.DEMO_P2)), ['histologicGrade', 'age', 'overallStageGroup']);
assert.equal(completeness.firstEntryRoute(['tumorSize']), 'P1');
assert.equal(completeness.firstEntryRoute(['ecogScore', 'overallStageGroup']), 'Step2', 'the earliest screen wins');
assert.equal(completeness.firstEntryRoute(['aFieldFromAFutureT1']), 'Step1');
assert.equal(completeness.firstEntryRoute([]), 'Step1');
assert.equal(completeness.isRiskWithheld({ riskLevel: null, dataCompleteness: { tier: 1 } }), true);
assert.equal(completeness.isRiskWithheld({ riskLevel: null, dataCompleteness: { tier: 2 } }), true);
assert.equal(completeness.isRiskWithheld({ riskLevel: null, dataCompleteness: { tier: 3 } }), false);
assert.equal(completeness.isRiskWithheld({ riskLevel: 'LOW', dataCompleteness: { tier: 3 } }), false);
console.log('PURE PASS ten T1 completeness fields pinned (tier order), field-to-screen map, blank detection, earliest return screen and withheld-risk rule');

// ── Demonstration case (M12): the reviewed Gate 1 complete fixture
assert.deepEqual(sample.DEMO_P1, { tumorSize: '22', gender: 'female' });
assert.deepEqual(sample.DEMO_P2, { ecogScore: '1', pdl1Status: 'negative', her2Low: 'positive', lvef: '60', treatmentIntent: 'adjuvant' });
const storedFixture = JSON.parse(read('e2e/fixtures/luminal-b-request.json')).assessment;
const s = sample.SAMPLE_FORM;
assert.deepEqual(
  { erStatus: s.step1.erStatus, prStatus: s.step1.prStatus, her2Status: s.step1.her2Status, ki67: Number(s.step1.ki67), stage: s.step2.stage, grade: s.step2.grade,
    histologicalSubtype: s.step2.histologicalSubtype, nodalStatus: s.step2.nodalStatus, age: Number(s.step2.age), ca153: Number(s.step3.ca153), cea: Number(s.step3.cea),
    surgeryDate: s.step3.surgeryDate, bayesianEnhanced: s.step3.bayesianEnhanced },
  Object.fromEntries(Object.entries(storedFixture).filter(([key]) => key !== 'patientId')),
  'the sample Steps 1–3 are the stored platform fixture',
);
assert.equal(sample.matchesDemoCase(sample.SAMPLE_FORM, sample.DEMO_P1, sample.DEMO_P2), true);
assert.equal(sample.matchesDemoCase(sample.SAMPLE_FORM, sample.DEMO_P1, { ...sample.DEMO_P2, lvef: '61' }), false);
assert.equal(sample.matchesDemoCase({ ...sample.SAMPLE_FORM, step1: { ...sample.SAMPLE_FORM.step1, ki67: '26' } }, sample.DEMO_P1, sample.DEMO_P2), false);
const requestBuilder = compile('src/api/requestBuilder.ts', {
  '../config/appIdentity': { MOBILE_BUILD_ID: 'mob-v0.6.6+47' },
  '../utils/provisionalValidation': compile('src/utils/provisionalValidation.ts'),
});
const demoRequest = requestBuilder.buildAssessmentRequest({
  form: sample.SAMPLE_FORM, p1: sample.DEMO_P1, p2: sample.DEMO_P2,
  patientId: 'mob-11111111-1111-4111-8111-111111111111', requestId: '22222222-2222-4222-8222-222222222222',
});
assert.deepEqual(
  { tumorSize: demoRequest.assessment.tumorSize, gender: demoRequest.assessment.gender, ecogScore: demoRequest.assessment.ecogScore,
    pdl1Status: demoRequest.assessment.pdl1Status, her2Low: demoRequest.assessment.her2Low, lvef: demoRequest.assessment.lvef,
    treatmentIntent: demoRequest.assessment.treatmentIntent },
  { tumorSize: 22, gender: 'female', ecogScore: 1, pdl1Status: 'negative', her2Low: 'positive', lvef: 60, treatmentIntent: 'adjuvant' },
);

// ── Store: demo case loading and sample tracking (M9, M12)
const storeExports = compile('src/store/assessmentStore.ts', { './sampleCase': sample });
const store = storeExports.useAssessmentStore;
assert.deepEqual(store.getState().edited, []);
store.getState().setDeliveryChoice('SYNTHETIC_DEMO');
assert.deepEqual(store.getState().p1, sample.DEMO_P1);
assert.deepEqual(store.getState().p2, sample.DEMO_P2);
store.getState().setStep2({ age: '60' });
store.getState().setStep1({ erStatus: 'positive' });
assert.deepEqual([...store.getState().edited].sort(), ['age', 'erStatus'], 'touching a value, even re-selecting it, counts as set by the clinician');
store.getState().setDeliveryChoice('LIVE_PLATFORM');
assert.deepEqual(store.getState().p1, sample.BLANK_P1);
assert.deepEqual(store.getState().p2, sample.BLANK_P2);
assert.deepEqual(store.getState().form, sample.SAMPLE_FORM);
assert.deepEqual(store.getState().edited, []);
store.getState().setStep3({ cea: '1' });
store.getState().resetCycle();
assert.deepEqual(store.getState().edited, []);
console.log('PURE PASS demonstration case = stored fixture + Gate 1 complete values, exact-match detection, request mapping, demo loading and sample tracking');

// ── Screens (static)
const result = read('src/screens/ResultScreen.tsx');
const completeMissing = result.match(/const completeMissing = \(\) => ([^\n]+)/);
assert.ok(completeMissing, 'Result screen has the Complete missing fields action');
assert.match(completeMissing[1], /navigation\.navigate\(firstEntryRoute\(completeness\.missingFields\)\)/);
assert.doesNotMatch(completeMissing[1], /reset/, 'returning to complete a case never clears the entered values');
assert.ok(result.indexOf("t('build47:notFullTitle')") < result.indexOf("t('result:warningsAndContext')"), 'the notice precedes the platform warnings');
assert.match(result, /\{list\(presentation\.warnings\)\}/, "T1's own completeness text is still shown unchanged");
const clinicalCompleteness = result.slice(result.indexOf("t('result:informationCompleteness')"), result.indexOf("t('result:treatmentOptions')"));
assert.doesNotMatch(clinicalCompleteness, /rulesBlocked/, 'the fixed rules-blocked figure is not in the clinical card (M6)');
assert.match(result, /t\('build47:rulesBlockedFixed'\)\} value=\{String\(data\.dataCompleteness\.rulesBlocked\)\}/);
assert.match(result, /muted=\{riskWithheld\}/, 'the deterministic risk is muted while the headline risk is withheld (M5)');
assert.match(result, /t\('build47:riskWithheld'/);

const review = read('src/screens/ReviewScreen.tsx');
assert.match(review, /blankFullAssessmentFields\(store\.form, store\.p1, store\.p2\)/);
assert.match(review, /onPress=\{\(\) => navigation\.navigate\(field\.route\)\}/);
assert.match(review, /disabled=\{submitting \|\| \(!store\.accessReady && !store\.walkthroughOnly\)\}/, 'blank values never block submission');
assert.match(review, /store\.deliveryChoice === 'LIVE_PLATFORM' && !store\.walkthroughOnly/, 'sample marks apply to live assessments');
assert.match(review, /matchesDemoCase\(store\.form, store\.p1, store\.p2\)/);

const step2 = read('src/screens/Step2TumourScreen.tsx');
for (const key of ['stage', 'grade', 'nodalStatus', 'age']) assert.match(step2, new RegExp(`t\\('tumour:${key}'\\)\\} optional needed />`));
assert.match(step2, /t\('tumour:histologicalSubtype'\)\} optional \/>/, 'histology does not affect the tier');
for (const file of ['src/screens/P1Screen.tsx', 'src/screens/P2Screen.tsx']) assert.match(read(file), /t\('build47:neededMarker'\)/);

const access = read('src/screens/GatewayAccessScreen.tsx');
assert.match(access, /const waitingForServer = !accessReady && !walkthroughOnly && savedAccess === 'ACTIVE';/);
assert.match(access, /\{!accessReady && !waitingForServer && savedAccess !== 'UNKNOWN' \? <ACRCard title=\{t\('gatewayAccess:inviteTitle'\)\}>/);
assert.match(access, /t\('build47:waitingForServer'\)/);
console.log('STATIC PASS return path keeps values, notice before unchanged T1 text, fixed figure moved, muted deterministic risk, Review blanks/sample/demo, markers and signed-in-offline card');

// ── Locales: identical Build 47 keys and placeholders in all eight
const localeDir = path.join(root, 'src/i18n/locales');
const locales = fs.readdirSync(localeDir).filter((file) => file.endsWith('.json')).sort();
assert.equal(locales.length, 8);
const english = JSON.parse(read('src/i18n/locales/en-GB.json')).build47;
const placeholders = (text) => (text.match(/\{\{\w+\}\}/g) || []).sort().join();
for (const file of locales) {
  const strings = JSON.parse(read(`src/i18n/locales/${file}`)).build47;
  assert.deepEqual(Object.keys(strings), Object.keys(english), `${file}: Build 47 key set`);
  for (const [key, text] of Object.entries(english)) {
    assert.ok(strings[key].trim(), `${file}: build47.${key} is visible text`);
    assert.equal(placeholders(strings[key]), placeholders(text), `${file}: build47.${key} keeps its placeholders`);
  }
}
console.log('STATIC PASS eight locales carry identical Build 47 keys and placeholders');

// ── Android release identity (A–C) and review service
const gradle = read('android/app/build.gradle');
const app = JSON.parse(read('app.json')).expo;
assert.match(gradle, /applicationId 'com\.acragent\.companion'/);
assert.equal(app.android.package, 'com.acragent.companion');
assert.match(gradle, /release \{\n\s+signingConfig signingConfigs\.release/, 'release builds use the release signing config');
assert.doesNotMatch(gradle, /release \{\n(?:[^\n]*\n){0,3}\s+signingConfig signingConfigs\.debug/, 'release never signs with the debug key');
assert.match(gradle, /throw new GradleException\("Release signing properties not found/);
assert.match(gradle, /include 'arm64-v8a', 'armeabi-v7a'/);
assert.match(gradle, /universalApk true/);
assert.doesNotMatch(gradle, /storePassword '(?!android')/, 'no release password in the repository');
const script = read('scripts/build47-review-service.sh');
assert.match(script, new RegExp(`CLIENT_BUILD_ID="mob-v${app.version.replace(/\./g, '\\.')}\\+${app.ios.buildNumber}"`));
assert.match(script, /PREVIOUS_CLIENT_BUILD_IDS="\$\{ACR_PREVIOUS_CLIENT_BUILD_IDS-mob-v0\.6\.5\+46\}"/);
assert.match(script, /fixtures\/demo-\$CLIENT_BUILD_ID/);
console.log('STATIC PASS Android app ID com.acragent.companion, fail-closed release signing, arm64/armv7 split with universal APK, Build 47 service identity');
console.log('PASS Build 47 completeness, demonstration and release-identity verifier');
