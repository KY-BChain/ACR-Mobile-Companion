const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));

const localeFiles = fs.readdirSync(path.join(root, 'src/i18n/locales')).filter((file) => file.endsWith('.json')).sort();
assert.equal(localeFiles.length, 8);
const keyPaths = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) =>
  child && typeof child === 'object' && !Array.isArray(child) ? keyPaths(child, `${prefix}${key}.`) : [`${prefix}${key}`],
).sort();
const localeKeys = keyPaths(json('src/i18n/locales/en-GB.json')).join('|');
for (const file of localeFiles) assert.equal(keyPaths(json(`src/i18n/locales/${file}`)).join('|'), localeKeys, `${file} key parity`);

const navigator = read('src/navigation/AppNavigator.tsx');
assert.match(navigator, /name="P1"/);
assert.match(navigator, /name="P2"/);
assert.doesNotMatch(navigator, /<NavigationContainer/);

const store = read('src/store/assessmentStore.ts');
assert.match(store, /p1: initialP1/);
assert.match(store, /p2: initialP2/);
assert.match(store, /p1: initialP1,\n      p2: initialP2/);

const step3 = read('src/screens/Step3MarkersScreen.tsx');
assert.match(step3, /navigation\.navigate\('P1'\)/);
assert.match(step3, /total: 5/);
const p1 = read('src/screens/P1Screen.tsx');
const p2 = read('src/screens/P2Screen.tsx');
assert.match(p1, /isTumorSizeValid/);
assert.match(p2, /isEcogValid/);
assert.match(p2, /isLvefValid/);

const review = read('src/screens/ReviewScreen.tsx');
const requestStart = review.indexOf('const request =');
const requestEnd = review.indexOf('const response =', requestStart);
assert.ok(requestStart >= 0 && requestEnd > requestStart);
assert.doesNotMatch(review.slice(requestStart, requestEnd), /\b(?:p1|p2|tumorSize|gender|ecogScore|pdl1Status|her2Low|lvef|treatmentIntent)\b/);
assert.match(review, /review:p1Title/);
assert.match(review, /review:p2Title/);

const about = read('src/screens/AboutScreen.tsx');
assert.match(about, /total: 2/);
assert.match(about, /about:page1Title/);
assert.match(about, /about:page2Title/);
assert.match(about, /about:page3Title/);
assert.match(about, /about:page4Title/);
assert.match(about, /about:dataHandlingText/);
assert.match(about, /fontSize: 17/);
assert.match(about, /lineHeight: 25/);
assert.match(about, /fontSize: 25/);
assert.match(about, /navigation\.navigate\('Welcome'\)/);
assert.ok(!fs.existsSync(path.join(root, 'src/locales')));

console.log(`PASS P1/P2 regression evidence (${localeFiles.length} locales, request exclusion, reset, navigation, About pages)`);