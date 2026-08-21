const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const rtlSource = read('src/utils/rtl.ts');
const compiledRtl = ts.transpileModule(rtlSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const rtlModule = { exports: {} };
new Function('module', 'exports', 'require', compiledRtl)(
  rtlModule,
  rtlModule.exports,
  require,
);
const { getLocaleDirection, getTextAlign, isRTL } = rtlModule.exports;

const localeMatrix = new Map([
  ['ar-SA', 'rtl'],
  ['en-GB', 'ltr'],
  ['fr-FR', 'ltr'],
  ['zh-CN', 'ltr'],
  ['de-DE', 'ltr'],
  ['ja-JP', 'ltr'],
  ['ko-KR', 'ltr'],
  ['ru-RU', 'ltr'],
]);

for (const [locale, expectedDirection] of localeMatrix) {
  assert.equal(getLocaleDirection(locale), expectedDirection, `${locale} direction`);
  assert.equal(isRTL(locale), expectedDirection === 'rtl', `${locale} RTL flag`);
  assert.equal(getTextAlign(locale), expectedDirection === 'rtl' ? 'right' : 'left');
}
assert.equal(isRTL('ar'), true, 'i18next Arabic base-language form');
assert.equal(isRTL('AR_sa'), true, 'normalised Arabic locale form');
assert.equal(isRTL(undefined), false, 'missing locale fails safely to LTR');
console.log('PURE PASS direction matrix: ar-SA RTL; seven registered locales LTR');

const config = read('src/i18n/config.ts');
const supportedCodes = [...config.matchAll(/code: '([^']+)'/g)].map((match) => match[1]);
assert.deepEqual(new Set(supportedCodes), new Set(localeMatrix.keys()));
assert.doesNotMatch(config, /expo-updates|Updates\.reloadAsync|I18nManager|forceRTL|allowRTL/);
const changeStart = config.indexOf('export const changeLanguage');
const changeEnd = config.indexOf('export default i18n', changeStart);
assert.ok(changeStart >= 0 && changeEnd > changeStart, 'active changeLanguage body found');
const changeBody = config.slice(changeStart, changeEnd);
assert.equal((changeBody.match(/i18n\.changeLanguage\(lang\)/g) || []).length, 1);
assert.match(changeBody, /await i18n\.changeLanguage\(lang\)/);
console.log('STATIC PASS language changes use one i18next call and no reload/native mutation');

const welcome = read('src/screens/WelcomeScreen.tsx');
const handlerStart = welcome.indexOf('const handleSelectLanguage');
const handlerEnd = welcome.indexOf('\n\n  return (', handlerStart);
assert.ok(handlerStart >= 0 && handlerEnd > handlerStart, 'language handler found');
const handler = welcome.slice(handlerStart, handlerEnd);
const modalDismiss = handler.indexOf('setLangModalVisible(false)');
const awaitedChange = handler.indexOf('await changeLanguage(code)');
assert.ok(modalDismiss >= 0 && awaitedChange > modalDismiss, 'modal dismisses before await');
assert.match(handler, /languageChangeInProgress\.current/);
assert.match(handler, /if \(code !== currentLang\)/);
assert.match(handler, /console\.error\('Language change failed', error\)/);
assert.doesNotMatch(handler, /reloadAsync|forceRTL|allowRTL|I18nManager/);
console.log('STATIC PASS modal ordering, duplicate guard, same-language no-op, observable error path');

assert.doesNotMatch(rtlSource, /react-native|I18nManager|forceRTL|allowRTL|reloadAsync/);
const screenLayout = read('src/components/ScreenLayout.tsx');
assert.match(screenLayout, /getLocaleDirection\(i18n\.resolvedLanguage \?\? i18n\.language\)/);
assert.match(screenLayout, /styles\.safe, \{ direction \}/);
const navigator = read('src/navigation/AppNavigator.tsx');
assert.match(navigator, /isRtl \? 'slide_from_left' : 'slide_from_right'/);
const segmented = read('src/components/ACRSegmentedControl.tsx');
assert.match(segmented, /isRtl \? styles\.borderLeft : styles\.borderRight/);
console.log('STATIC PASS reactive root, navigation, and segmented-control direction wiring');

const localeDir = path.join(root, 'src/i18n/locales');
const localeFiles = fs.readdirSync(localeDir).filter((file) => file.endsWith('.json')).sort();
assert.equal(localeFiles.length, 8);
const flatten = (value, prefix = '', output = new Map()) => {
  for (const [key, child] of Object.entries(value)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      flatten(child, keyPath, output);
    } else {
      output.set(keyPath, {
        type: Array.isArray(child) ? 'array' : typeof child,
        interpolations: typeof child === 'string'
          ? [...child.matchAll(/{{\s*([^},\s]+)[^}]*}}/g)].map((match) => match[1]).sort()
          : [],
      });
    }
  }
  return output;
};
const parsedLocales = new Map(localeFiles.map((file) => [
  file,
  flatten(JSON.parse(fs.readFileSync(path.join(localeDir, file), 'utf8'))),
]));
const reference = parsedLocales.get('en-GB.json');
for (const [file, locale] of parsedLocales) {
  assert.deepEqual(
    [...locale.keys()].sort(),
    [...reference.keys()].sort(),
    `${file} key parity`,
  );
  for (const [key, referenceValue] of reference) {
    assert.deepEqual(locale.get(key), referenceValue, `${file} type/interpolation parity at ${key}`);
  }
}
console.log('STATIC PASS locale JSON key/type/interpolation parity (8 locales)');

const p1p2 = spawnSync(process.execPath, [path.join(root, 'tests/p1p2/verify.js')], {
  cwd: root,
  encoding: 'utf8',
});
assert.equal(p1p2.status, 0, p1p2.stderr || p1p2.stdout);
console.log('STATIC PASS existing P1/P2/About invariant verifier remains green');

console.log('PASS RTL language-switch static/pure regression evidence');
console.log('LIMITATION rendered responsiveness and visual direction require simulator/device review');
