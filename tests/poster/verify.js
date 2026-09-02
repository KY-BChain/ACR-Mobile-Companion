const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const localeSource = read('src/utils/posterLocale.ts');
const compiledLocale = ts.transpileModule(localeSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const localeModule = { exports: {} };
new Function('module', 'exports', 'require', compiledLocale)(
  localeModule,
  localeModule.exports,
  require,
);
const { getPosterLocale } = localeModule.exports;

const localeMatrix = new Map([
  ['en-GB', 'en'],
  ['fr-FR', 'fr'],
  ['zh-CN', 'zh-CN'],
  ['ar-SA', 'en'],
  ['de-DE', 'en'],
  ['ja-JP', 'en'],
  ['ko-KR', 'en'],
  ['ru-RU', 'en'],
]);
for (const [locale, expectedPoster] of localeMatrix) {
  assert.equal(getPosterLocale(locale), expectedPoster, `${locale} poster mapping`);
}
for (const fallback of [undefined, '', 'fr', 'FR-fr', 'zh_CN', 'es-ES', ' malformed ']) {
  assert.equal(getPosterLocale(fallback), 'en', `${String(fallback)} English fallback`);
}
console.log('PURE PASS eight-locale poster mapping and English fallback');

const poster = read('src/screens/PosterScreen.tsx');
for (const filename of [
  'ACR_PLATFORM_One_Page_Intro_EN_v1.1_76SWRL.png',
  'ACR_PLATFORM_One_Page_Intro_FR_v1.1_76SWRL.png',
  'ACR_PLATFORM_One_Page_Intro_ZH-CN_v1.1_76SWRL.png',
]) {
  assert.match(poster, new RegExp(`require\\('../assets/posters/${filename.replace('.', '\\.')}'\\)`));
  assert.ok(fs.existsSync(path.join(root, 'src/assets/posters', filename)), `${filename} exists`);
}
assert.match(poster, /resizeMode="contain"/);
assert.match(poster, /Math\.abs\(gestureState\.dy\) > Math\.abs\(gestureState\.dx\)/);
assert.match(poster, /navigation\.replace\('Welcome'\)/);
console.log('STATIC PASS local assets, responsive contain rendering, vertical gesture, route replacement');

const navigator = read('src/navigation/AppNavigator.tsx');
assert.match(navigator, /initialRouteName="GatewayAccess"/);
assert.match(navigator, /<Stack\.Screen name="Poster" component=\{PosterScreen\} \/>/);
console.log('STATIC PASS fresh-launch Gateway boundary while the inspected poster remains an available local route');

const welcome = read('src/screens/WelcomeScreen.tsx');
assert.match(welcome, /useFocusEffect/);
assert.match(welcome, /Platform\.OS === 'android' \|\| Platform\.OS === 'ios'/);
assert.match(welcome, /if \(!supportsPoster \|\| langModalVisible\)/);
assert.match(welcome, /setTimeout\(\(\) => \{/);
assert.match(welcome, /navigation\.isFocused\(\)/);
assert.match(welcome, /navigation\.replace\('Poster'\)/);
assert.match(welcome, /\}, 3000\)/);
assert.match(welcome, /clearTimeout\(posterTimer\)/);
console.log('STATIC PASS focused timer cleanup, modal safeguard, and non-Welcome redirect guard');

console.log('PASS Android/iOS poster/Welcome automated evidence');
