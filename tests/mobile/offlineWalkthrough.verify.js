const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const app = read('App.tsx');
assert.match(app, /useEffect\(\(\) => \{/);
// Build 44 H-SIM also ended the token family on every launch. Since P3 (G10-0,
// AUTH-03) evaluation access deliberately survives a restart via the
// Keychain/Keystore refresh token, so a launch resets the assessment cycle only
// (Gate 12 device finding: the launch-time clear locked evaluators out).
assert.doesNotMatch(app, /clearSession\(/, 'a process launch must not end evaluation access');
assert.match(app, /useAssessmentStore\.getState\(\)\.resetCycle\(\)/);

const navigator = read('src/navigation/AppNavigator.tsx');
assert.match(navigator, /initialRouteName="GatewayAccess"/);
assert.match(navigator, /<Stack\.Screen name="Poster" component=\{PosterScreen\} \/>/);

const access = read('src/screens/GatewayAccessScreen.tsx');
assert.match(access, /options=\{\['LIVE_PLATFORM', 'SYNTHETIC_DEMO'\]\}/);
assert.match(access, /title=\{t\('gatewayAccess:connect'\)\}/);
assert.match(access, /gatewayLive === 'DOWN' \? <ACRStopBox/);
assert.match(access, /deliveryChoice === 'SYNTHETIC_DEMO'/);
assert.match(access, /setWalkthroughOnly\(true\)/);
assert.match(access, /navigation\.navigate\('Step1'\)/);

const walkthroughScreens = [
  'src/screens/Step1ReceptorsScreen.tsx',
  'src/screens/Step2TumourScreen.tsx',
  'src/screens/Step3MarkersScreen.tsx',
  'src/screens/P1Screen.tsx',
  'src/screens/P2Screen.tsx',
  'src/screens/ReviewScreen.tsx',
];
for (const file of walkthroughScreens) {
  assert.match(read(file), /<WalkthroughNotice \/>/, `${file} keeps fixture-unavailable disclosure visible`);
}

const review = read('src/screens/ReviewScreen.tsx');
const walkthroughStart = review.indexOf('if (store.walkthroughOnly)');
const authenticatedStart = review.indexOf('if (!store.accessReady', walkthroughStart);
assert.ok(walkthroughStart >= 0 && authenticatedStart > walkthroughStart, 'walkthrough is handled before authentication/submission');
const walkthroughBranch = review.slice(walkthroughStart, authenticatedStart);
// Build 46 (Kraken, 13 Sept 2026): the walkthrough is for a device already
// paired with an invite code, and it keeps that saved session — Build 44/45
// ended it here and when the walkthrough started.
assert.doesNotMatch(walkthroughBranch, /clearSession\(/, 'finishing the walkthrough must keep the saved session');
const startWalkthrough = access.slice(access.indexOf('const startWalkthrough'), access.indexOf('navigation.navigate(\'Step1\');', access.indexOf('const startWalkthrough')));
assert.ok(startWalkthrough.length > 0, 'startWalkthrough exists');
assert.doesNotMatch(startWalkthrough, /clearSession\(/, 'starting the walkthrough must keep the saved session');
assert.match(access, /savedAccess === 'ACTIVE'\s*\?\s*<ACRButton title=\{t\('gatewayAccess:continueOffline'\)\}/, 'the walkthrough button needs a saved, unexpired session');
assert.match(access, /t\('gatewayAccess:walkthroughNeedsInvite'\)/, 'a device without a paired code is told why');
assert.match(walkthroughBranch, /store\.resetCycle\(\)/);
assert.match(walkthroughBranch, /DEMO_FIXTURE_NOT_AVAILABLE/);
assert.match(walkthroughBranch, /outcome: 'NOT_SUBMITTED'/);
assert.match(walkthroughBranch, /navigation\.reset/);
assert.doesNotMatch(walkthroughBranch, /buildAssessmentRequest|gatewayClient\.submit|setResult\(response\)|navigation\.navigate\('Result'\)/);
assert.match(review, /disabled=\{submitting \|\| \(!store\.accessReady && !store\.walkthroughOnly\)\}/);

const storeSource = read('src/store/assessmentStore.ts');
assert.match(storeSource, /walkthroughOnly: boolean/);
assert.match(storeSource, /resetCycle: \(\) => void/);
assert.doesNotMatch([app, access, review, storeSource].join('\n'), /AsyncStorage|SecureStore|MMKV|localStorage|persist\s*\(/);

const compiledStore = ts.transpileModule(storeSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const storeModule = { exports: {} };
// Build 47: the store imports the TypeScript sample case, compiled the same way.
const storeRequire = (name) => {
  if (name !== './sampleCase') return require(name);
  const sampleModule = { exports: {} };
  const sampleCode = ts.transpileModule(read('src/store/sampleCase.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('module', 'exports', 'require', sampleCode)(sampleModule, sampleModule.exports, require);
  return sampleModule.exports;
};
new Function('module', 'exports', 'require', compiledStore)(storeModule, storeModule.exports, storeRequire);
const store = storeModule.exports.useAssessmentStore;
store.getState().setStep1({ ki67: '99' });
store.getState().setP1({ tumorSize: '7.7' });
store.getState().setP2({ lvef: '12' });
store.getState().setSessionId('entered-session');
store.getState().setDeliveryChoice('SYNTHETIC_DEMO');
store.getState().setAccessReady(true);
store.getState().setWalkthroughOnly(true);
store.getState().setResult({ invented: 'must disappear' });
store.getState().setFailure({ code: 'TEST' });
store.getState().setAttestation({ verificationState: 'VERIFIED' });
store.getState().resetCycle();
const reset = store.getState();
assert.deepEqual(reset.form, storeModule.exports.initialForm);
assert.deepEqual(reset.p1, storeModule.exports.initialP1);
assert.deepEqual(reset.p2, storeModule.exports.initialP2);
assert.equal(reset.sessionId, '');
assert.equal(reset.deliveryChoice, 'LIVE_PLATFORM');
assert.equal(reset.gatewayLive, 'UNKNOWN');
assert.equal(reset.accessReady, false);
assert.equal(reset.walkthroughOnly, false);
assert.equal(reset.result, null);
assert.equal(reset.failure, null);
assert.equal(reset.attestation, null);

const localeDir = path.join(root, 'src/i18n/locales');
for (const file of fs.readdirSync(localeDir).filter((name) => name.endsWith('.json'))) {
  const locale = JSON.parse(read(`src/i18n/locales/${file}`));
  for (const key of ['serverAlert', 'walkthroughNotice', 'continueOffline', 'finishWalkthrough']) {
    assert.equal(typeof locale.gatewayAccess[key], 'string', `${file} has ${key}`);
    assert.ok(locale.gatewayAccess[key].trim(), `${file} ${key} is visible text`);
  }
}
assert.match(JSON.parse(read('src/i18n/locales/en-GB.json')).gatewayAccess.walkthroughNotice, /20 fields.*five screens.*nothing will be submitted.*no CDS result.*cleared/i);

console.log('PASS H-SIM offline corrections: fresh Gateway cycle, persistent connection controls, high-visibility unavailable state, five-screen result-free fixture walkthrough, and complete in-memory clearing');
