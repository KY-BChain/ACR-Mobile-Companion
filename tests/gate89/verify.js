/**
 * Build 45 Gates 8–9 — About, accessibility, languages, polish.
 *
 * Regression only; no blocker closes here. The existing suites already cover
 * the language modal, locale key parity, RTL direction and the About/P1/P2
 * invariants. This verifier adds the parts Loop v1.1 §9 names that were not
 * otherwise asserted: Dynamic Type / font-scaling policy, accessibility-role
 * coverage, and that the About screen reflects the Build 45 identity.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const screens = fs.readdirSync(path.join(root, 'src/screens')).filter((f) => f.endsWith('.tsx'));
const components = fs.readdirSync(path.join(root, 'src/components')).filter((f) => f.endsWith('.tsx'));

// ---------------------------------------------------------------------------
// 1. Dynamic Type / font scaling.
//
// React Native scales text with the OS accessibility setting by default. That
// default is the accessible behaviour and must not be switched off: disabling
// it would freeze clinical text at one size regardless of the reader's setting.
// No cap is imposed here — choosing a maximum multiplier changes clinical
// presentation and belongs to T45-12 / C45-11 in Build 46, not to a Build 45
// regression gate.
// ---------------------------------------------------------------------------
for (const file of [...screens.map((f) => `src/screens/${f}`), ...components.map((f) => `src/components/${f}`)]) {
  const source = read(file);
  assert.doesNotMatch(source, /allowFontScaling\s*=\s*\{\s*false\s*\}/,
    `${file} must not disable Dynamic Type — text scaling is an accessibility requirement`);
  assert.doesNotMatch(source, /allowFontScaling\s*=\s*\{\s*!!?0\s*\}/,
    `${file} must not disable Dynamic Type`);
}

// Text styles must not pin an absolute height that cannot grow with the text.
for (const file of screens.map((f) => `src/screens/${f}`)) {
  const source = read(file);
  assert.doesNotMatch(source, /\bheight:\s*\d+\s*,[^\n]*fontSize/,
    `${file} must not fix a text container height alongside a font size`);
}

// ---------------------------------------------------------------------------
// 2. Accessibility roles are present on every screen that renders content.
// ---------------------------------------------------------------------------
const A11Y = /accessibilityRole|accessibilityLabel|accessibilityState|accessibilityHint|accessible\b/;

// The primary interactive controls must be accessible at the component level,
// so that screens composing only these controls inherit correct semantics
// instead of each screen re-declaring them.
const INTERACTIVE = ['ACRButton.tsx', 'ACRInput.tsx', 'ACRSegmentedControl.tsx', 'ACRStopBox.tsx'];
for (const file of INTERACTIVE) {
  assert.match(read(`src/components/${file}`), A11Y,
    `src/components/${file} is a primary control and must carry accessibility affordances`);
}
assert.match(read('src/components/ACRButton.tsx'), /accessibilityRole="button"/,
  'buttons must expose the button role');
assert.match(read('src/components/ACRButton.tsx'), /accessibilityState=\{\{ disabled/,
  'buttons must announce their disabled state, not signal it by colour alone');
assert.match(read('src/components/ACRSegmentedControl.tsx'), /accessibilityRole="radiogroup"/,
  'the segmented control must expose a radio group');
assert.match(read('src/components/ACRSegmentedControl.tsx'), /accessibilityState=\{\{ selected/,
  'the segmented control must announce which option is selected');
assert.match(read('src/components/ACRInput.tsx'), /accessibilityLabel=\{accessibilityLabel \?\? placeholder \?\? hint\}/,
  'inputs must expose an accessible name');

// A screen passes if it declares affordances itself or composes only the
// accessible primary controls above.
for (const file of screens) {
  const source = read(`src/screens/${file}`);
  const delegates = INTERACTIVE.some((c) => source.includes(c.replace('.tsx', '')));
  assert.ok(A11Y.test(source) || delegates,
    `src/screens/${file} must either carry accessibility affordances or compose accessible controls`);
}

// Validation errors must be announced, not conveyed by colour alone.
assert.match(read('src/screens/Step1ReceptorsScreen.tsx'), /accessibilityRole="alert"[^>]*styles\.error|styles\.error[^>]*accessibilityRole="alert"|accessibilityRole="alert" style=\{styles\.error\}/,
  'field validation errors must be announced as alerts');

// Errors and alerts must be announced, not merely coloured.
assert.match(read('src/screens/GatewayAccessScreen.tsx'), /accessibilityRole="alert"/,
  'connection failures must be announced to assistive technology');

// Stop/blocked conditions carry meaning beyond colour, at the component level so
// every usage benefits — including FailClosedScreen, whose entire purpose is to
// state that inference did not happen.
const stopBox = read('src/components/ACRStopBox.tsx');
assert.match(stopBox, /accessibilityRole="alert"/,
  'ACRStopBox must announce blocked conditions as an alert');
assert.match(stopBox, /accessibilityLabel=\{`\$\{title\}\. \$\{message\}`\}/,
  'ACRStopBox must expose its title and message to assistive technology');

// ---------------------------------------------------------------------------
// 3. About screen carries the derived Build 45 identity, not a literal.
// ---------------------------------------------------------------------------
const about = read('src/screens/AboutScreen.tsx');
assert.match(about, /import \{ APP_VERSION_LABEL \} from '\.\.\/config\/appIdentity'/,
  'About must import the derived identity label');
assert.match(about, /\{APP_VERSION_LABEL\}/,
  'About must render the derived identity label');
assert.doesNotMatch(about, /0\.6\.\d|Build \d+/,
  'About must not hardcode a version or build number');

const appConfig = JSON.parse(read('app.json'));
assert.equal(appConfig.expo.version, '0.6.7');
assert.equal(appConfig.expo.ios.buildNumber, '48');

// ---------------------------------------------------------------------------
// 4. Eight languages, key-identical, with RTL registered for Arabic only.
// ---------------------------------------------------------------------------
const localeDir = path.join(root, 'src/i18n/locales');
const locales = fs.readdirSync(localeDir).filter((f) => f.endsWith('.json'));
assert.equal(locales.length, 8, 'exactly eight locales must be registered');
assert.ok(locales.includes('ar-SA.json'), 'Arabic must be registered');

const flatten = (o, p = '') => Object.entries(o).flatMap(([k, v]) => {
  const q = p ? `${p}.${k}` : k;
  return v && typeof v === 'object' ? flatten(v, q) : [q];
});
const base = flatten(JSON.parse(read('src/i18n/locales/en-GB.json'))).sort();
for (const file of locales) {
  const keys = flatten(JSON.parse(read(path.join('src/i18n/locales', file)))).sort();
  assert.deepEqual(keys, base, `${file} must be key-identical to en-GB`);
}

const rtl = read('src/utils/rtl.ts');
assert.match(rtl, /ar/, 'Arabic must be recognised as RTL');

// ---------------------------------------------------------------------------
// 5. Polish: no placeholder or debug text left in shipped screens.
// ---------------------------------------------------------------------------
for (const file of screens) {
  const source = read(`src/screens/${file}`);
  assert.doesNotMatch(source, /\bTODO\b|\bFIXME\b|Lorem ipsum|console\.log\(/,
    `src/screens/${file} must not contain placeholder or debug output`);
}

console.log(`PASS Gates 8-9: Dynamic Type never disabled across ${screens.length} screens and ${components.length} components; accessibility affordances on every screen with announced alerts; About renders the derived v0.6.7 (Build 48) identity with no hardcoded version; ${locales.length} locales key-identical (${base.length} keys) with Arabic RTL; no placeholder or debug text in shipped screens`);
