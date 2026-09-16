const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const compile = (file) => {
  const code = ts.transpileModule(read(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports, require);
  return module.exports;
};

const presentation = compile('src/screens/resultPresentation.ts');
const warning = `${presentation.BIOMARKER_ONLY_WARNING_PREFIX}\nRisk cannot be determined until staging is returned.`;
const baseResult = {
  resultMode: 'LIVE_REASONER',
  warnings: ['Gateway warning returned verbatim', 'Completeness warning returned verbatim'],
  data: {
    deterministic: {
      treatments: [warning, 'Backend treatment A', 'BIOMARKER ASSESSMENT — STAGING PENDING without exact prefix'],
    },
    dataCompleteness: { warning: 'Completeness warning returned verbatim' },
    bayesian: { enabled: true },
  },
};
const clinical = presentation.buildClinicalResultPresentation(baseResult);
assert.equal(clinical.sourceCopyKey, 'result:sourceLive');
assert.deepEqual(clinical.warnings, [warning, 'Completeness warning returned verbatim', 'Gateway warning returned verbatim']);
assert.deepEqual(clinical.treatments, ['Backend treatment A', 'BIOMARKER ASSESSMENT — STAGING PENDING without exact prefix']);
assert.equal(clinical.showBayesianSummary, true);
assert.equal(
  presentation.buildClinicalResultPresentation({ ...baseResult, resultMode: 'PLATFORM_FALLBACK' }).sourceCopyKey,
  'result:sourceFallback',
);
assert.equal(
  presentation.buildClinicalResultPresentation({ ...baseResult, resultMode: 'LOCAL_SYNTHETIC_DEMO' }).sourceCopyKey,
  'result:sourceDemo',
);
assert.equal(
  presentation.buildClinicalResultPresentation({
    ...baseResult,
    data: { ...baseResult.data, bayesian: { enabled: false } },
  }).showBayesianSummary,
  false,
);
assert.equal(presentation.formatReturnedProbability(0.8734), '87.34%');
assert.equal(presentation.formatReturnedProbability(87.34), '87.34%');
assert.equal(presentation.TECHNICAL_DETAILS_DEFAULT_EXPANDED, true);
console.log('PURE PASS exact returned-warning regrouping, three source modes, Bayes gating, percentage formatting and default-expanded details');

const screen = read('src/screens/ResultScreen.tsx');
const summaryIndex = screen.indexOf("t('result:clinicalSummary')");
const warningIndex = screen.indexOf("t('result:warningsAndContext')");
const completenessIndex = screen.indexOf("t('result:informationCompleteness')");
const treatmentIndex = screen.indexOf("t('result:treatmentOptions')");
const biomarkerIndex = screen.indexOf("t('result:biomarkerResults')");
const confidenceIndex = screen.indexOf("t('result:confidenceSummary')");
const toggleIndex = screen.indexOf('accessibilityState={{ expanded: technicalDetailsExpanded }}');
const rulesIndex = screen.indexOf("t('build44:firedRules')");
assert.ok(summaryIndex >= 0 && summaryIndex < treatmentIndex, 'clinical summary is first');
assert.ok(warningIndex > summaryIndex && warningIndex < completenessIndex, 'returned warning/context is prominent');
assert.ok(completenessIndex > warningIndex && completenessIndex < treatmentIndex, 'completeness context precedes treatment');
assert.ok(treatmentIndex < biomarkerIndex && biomarkerIndex < confidenceIndex && confidenceIndex < toggleIndex, 'clinical hierarchy precedes technical toggle');
assert.ok(toggleIndex < rulesIndex, 'reasoning rules are inside the later technical section');
assert.match(screen, /subtypeValue, toneStyle\(data\.molecularSubtype\), localText\]\}>\{data\.molecularSubtype\}/, 'hero uses guarded top-level subtype');
assert.match(screen, /const riskText = data\.riskLevel === null \? t\('common:emDash'\) : riskKey \? t\(riskKey\) : data\.riskLevel;/, 'hero uses nullable top-level safety risk, in the reader\'s language');
assert.match(screen, /toneStyle\(data\.riskLevel\)\]\}>\{riskText\}/, 'the risk colour follows the returned word, not the translation');
for (const [value, key] of [['HIGH', 'build47:riskHigh'], [' intermediate ', 'build47:riskIntermediate'], ['Low', 'build47:riskLow'], ['VERY HIGH', null], ['', null], [null, null]]) {
  assert.equal(presentation.riskLabelKey(value), key, `risk label of ${JSON.stringify(value)}`);
}
const riskLocales = { 'en-GB': 'HIGH', 'zh-CN': '高危' };
for (const [code, high] of Object.entries(riskLocales)) {
  assert.equal(JSON.parse(read(`src/i18n/locales/${code}.json`)).build47.riskHigh, high);
}
assert.match(screen, /accessibilityRole="button"/);
assert.match(screen, /setTechnicalDetailsExpanded\(\(expanded\) => !expanded\)/);

for (const required of [
  'result.resultMode', 'result.reasoningMode', 'result.delivery.currentExecution',
  'data.molecularSubtype', 'data.riskLevel', 'data.deterministic.riskLevel',
  'data.deterministic.treatments', 'data.deterministic.biomarkers',
  'data.reasoning.firedRules', 'data.reasoning.rulesFired', 'data.reasoning.evidence', 'data.reasoning.trace',
  'data.dataCompleteness.tier', 'data.dataCompleteness.rulesBlocked', 'data.dataCompleteness.missingFields',
  'data.dataCompleteness.warning', 'result.warnings', 'data.bayesian.enabled', 'data.bayesian.confidence',
  'data.bayesian.uncertaintyBounds', 'data.bayesian.posterior', 'result.delivery.currentVerificationState',
  'current.reasonerVersion', 'current.reasoningMode', 'current.ontologySha256', 'current.logicalRuleCount',
  'current.physicalRuleCount', 'current.activeRuleCount', 'current.loadedRuleCount', 'current.queryCount',
  'captured.reasoningMode', 'captured.provenance.capturedAt', 'captured.provenance.captureRoute',
  'captured.provenance.reasonerVersion', 'captured.provenance.ontologySha256',
]) {
  assert.ok(screen.includes(required), `technical/source field retained: ${required}`);
}

const activePresentationSource = `${screen}\n${read('src/screens/resultPresentation.ts')}`;
for (const forbidden of [
  'recommendationLevel', 'guidelineSource', 'treatmentTimeline', 'deriveSprintEAlerts',
  'calculateRisk', 'determineRisk', 'generateTreatment', 'treatment.rationale', 'treatment.priority',
]) {
  assert.ok(!activePresentationSource.includes(forbidden), `no client-authored clinical content: ${forbidden}`);
}
console.log('STATIC PASS clinical-first hierarchy, nullable safety risk, accessible toggle, retained technical fields and no client-authored inference/treatment metadata');

const localeDir = path.join(root, 'src/i18n/locales');
const localeFiles = fs.readdirSync(localeDir).filter((file) => file.endsWith('.json')).sort();
const requiredKeys = [
  'clinicalSummary', 'sourceLive', 'sourceFallback', 'sourceDemo', 'warningsAndContext', 'informationCompleteness',
  'treatmentOptions', 'biomarkerResults', 'confidenceSummary', 'classificationConfidence',
  'noBayesianEnhancement', 'technicalDetails', 'showTechnicalDetails', 'hideTechnicalDetails',
  'resultIdentity', 'resultMode', 'executionStatus', 'rootRisk', 'deterministicRisk',
];
assert.equal(localeFiles.length, 8);
for (const file of localeFiles) {
  const locale = JSON.parse(fs.readFileSync(path.join(localeDir, file), 'utf8'));
  for (const key of requiredKeys) assert.equal(typeof locale.result[key], 'string', `${file}: result.${key}`);
}
assert.match(screen, /getLocaleDirection\(language\)/);
assert.match(screen, /getTextAlign\(language\)/);
console.log('STATIC PASS eight-locale clinical-result key parity and reactive Arabic RTL wiring');

// Build 46 colour code, mirroring the ACR Platform website (positive red,
// negative green): red HIGH/positive, green LOW/negative, blue otherwise.
// Words only — a number is never judged high or low on the device.
for (const [value, tone] of [
  ['HIGH', 'high'], ['high', 'high'], [' Positive ', 'high'],
  ['LOW', 'low'], ['Negative', 'low'],
  ['INTERMEDIATE', 'other'], ['LuminalB_HER2Negative', 'other'], ['25%', 'other'], ['0.9', 'other'],
  ['highly', 'other'], ['', 'other'], [null, 'other'], [undefined, 'other'],
]) {
  assert.equal(presentation.resultValueTone(value), tone, `tone of ${JSON.stringify(value)}`);
}
const colourScreen = read('src/screens/ResultScreen.tsx');
assert.match(colourScreen, /high: ACRColors\.resultHigh, low: ACRColors\.resultLow, other: ACRColors\.resultOther/);
assert.match(colourScreen, /style=\{\[styles\.rowValue, muted \? styles\.mutedValue : toneStyle\(value\), localText\]\}/, 'every result row value is colour-coded unless muted (Build 47 M5)');
assert.match(colourScreen, /toneStyle\(data\.riskLevel\)/, 'the summary risk value is colour-coded');
assert.match(colourScreen, /toneStyle\(data\.molecularSubtype\)/);
const colourTokens = read('src/theme/colors.ts');
assert.match(colourTokens, /resultHigh: '#c53030'/);
assert.match(colourTokens, /resultLow: '#276749'/);
assert.match(colourTokens, /resultOther: '#2b6cb0'/);
console.log('PASS Build 46 result colour code: HIGH/positive red, LOW/negative green, everything else blue; returned words only, never numbers');
console.log('PASS Build 44 clinical-first Result presentation verifier');
