const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Privacy notice and in-app reviewer manual (Kraken, 17 September 2026):
// the poster's second page carries the short notice, READ DETAILS opens the
// manual at its legal section, and the in-app manual is generated from the
// documents in docs/clinical so the two can never disagree.

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const LOCALES = ['en-GB', 'fr-FR', 'de-DE', 'ru-RU', 'ar-SA', 'zh-CN', 'ko-KR', 'ja-JP'];
const legalIndex = (pages) => pages.findIndex((page) => /^15\./.test(page.title.trim()));

// ── The notice says the same six things in every language
const baseKeys = Object.keys(json('src/i18n/locales/en-GB.json').legal).sort();
assert.deepEqual(baseKeys, ['controller', 'controllerLabel', 'cookies', 'kept', 'keptLabel', 'never',
  'neverLabel', 'process', 'processLabel', 'readDetails', 'rights', 'rightsLabel', 'swipeHint',
  'title', 'why', 'whyLabel'], 'the notice keys are the GDPR elements plus the cookies line');
for (const locale of LOCALES) {
  const bundle = json(`src/i18n/locales/${locale}.json`);
  assert.deepEqual(Object.keys(bundle.legal).sort(), baseKeys, `${locale} legal keys`);
  assert.deepEqual(Object.keys(bundle.manual).sort(),
    ['englishFallback', 'goToStart', 'legalSection', 'pageIndicator', 'title'], `${locale} manual keys`);
  for (const [key, value] of Object.entries(bundle.legal)) {
    assert.ok(value.trim().length > 0, `${locale} legal:${key} is empty`);
    assert.doesNotMatch(value, /\[[^\]]*\]|TODO|TBD/, `${locale} legal:${key} still holds a placeholder`);
  }
  // Chinese and Japanese use full-width brackets; both spellings are correct.
  assert.match(bundle.legal.controller, /Cornerstone Research International Ltd\s*[（(]CRIL[）)]/, `${locale} names the controller`);
  assert.match(bundle.legal.controller, /info@acragent\.com/, `${locale} gives a contact address`);
  assert.match(bundle.legal.controller, /D04 V2P1/, `${locale} gives the registered address`);
  assert.match(bundle.legal.process, /Cloudflare/, `${locale} discloses the network recipient`);
  // The wording the app never uses again: the platform's own "ASSESSMENT BLOCKED"
  // message stays its own, so the two can no longer be confused.
  const flat = JSON.stringify(bundle);
  assert.doesNotMatch(flat, /Assessment blocked/i, `${locale} still carries the retired stop-screen wording`);
  assert.equal(bundle.failClosed.heading, undefined);
  assert.equal(bundle.failClosed.blockedTitle, undefined);
  assert.equal(bundle.errors.attestationMismatch, undefined);
}

// ── The in-app manual is the document, not a retyped copy of it
const generated = Object.fromEntries(LOCALES.map((locale) => [locale, json(`src/content/manual/${locale}.json`)]));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'acr-manual-'));
execFileSync(process.execPath, [path.join(root, 'scripts/build-manual-content.js')], { cwd: root, stdio: 'pipe' });
for (const [locale, before] of Object.entries(generated)) {
  const after = json(`src/content/manual/${locale}.json`);
  assert.deepEqual(after, before,
    `src/content/manual/${locale}.json is out of date — run node scripts/build-manual-content.js after editing the manual`);
  assert.ok(fs.existsSync(path.join(root, after.source)), `${locale} names its source document`);
  assert.ok(after.pages.length >= 15, `${locale} manual has ${after.pages.length} pages`);
  const legal = after.pages.find((page) => /(GDPR|Cookies)/i.test(page.title));
  assert.ok(legal, `${locale} manual includes the legal notice section`);
  const text = JSON.stringify(legal);
  for (const required of [/CRIL/, /info@acragent\.com/, /Cloudflare/, /30/]) {
    assert.match(text, required, `${locale} legal section is missing ${required}`);
  }
  assert.equal(after.pages.length, generated['en-GB'].pages.length,
    `${locale} manual must have the same sections as English`);
  assert.equal(legalIndex(after.pages), 14, `${locale} legal notice must be section 15`);
}
fs.rmSync(scratch, { recursive: true, force: true });

// Every offered language has its own manual; English stays the fallback for any other
const manualIndex = read('src/content/manual/index.ts');
for (const locale of LOCALES) {
  assert.ok(manualIndex.includes(`'${locale}':`), `index.ts must register the ${locale} manual`);
}
assert.match(manualIndex, /isEnglishFallback: true/, 'an unknown language falls back to English');
assert.match(read('src/screens/ManualScreen.tsx'), /manual:englishFallback/, 'the fallback is stated on screen');
assert.match(read('src/screens/ManualScreen.tsx'), /manual:pageIndicator/, 'the manual is paged like About');

// ── Poster: page two is the notice, with READ DETAILS into the manual
const poster = read('src/screens/PosterScreen.tsx');
assert.match(poster, /useState<0 \| 1>\(0\)/, 'the poster has two pages');
assert.match(poster, /<PrivacyNotice \/>/, 'page two shows the notice');
assert.match(poster, /legal:readDetails/, 'page two carries READ DETAILS');
assert.match(poster, /navigation\.navigate\('Manual', \{ section: 'legal' \}\)/, 'READ DETAILS opens the legal section');
assert.match(poster, /navigation\.replace\('Welcome'\)/, 'an upward swipe still continues to Welcome');
assert.match(poster, /Math\.abs\(gestureState\.dx\) >= SWIPE_NAVIGATION_DISTANCE/, 'sideways swipes turn the page');
// Build 48: poster and notice turn into each other on a timer until the reader
// takes over, and READ DETAILS is sized to its text rather than filling the width.
assert.match(poster, /const PAGE_TURN_MS = \d+;/, 'the two pages turn on a timer');
assert.match(poster, /showPage\(page === 0 \? 1 : 0, false\)/, 'the timer turns both ways, not only to the notice');
assert.match(poster, /if \(turnedByHand\.current\) return undefined;/, 'a swipe stops the rotation');
assert.match(poster, /turnedByHand\.current = true;\s+\/\/ reading the manual stops the rotation/,
  'opening the manual stops the rotation');
assert.match(poster, /compact\n\s+onPress=\{\(\) => \{/, 'READ DETAILS is a compact button');
// The manual can open at the legal section, so section 1 must stay reachable.
const manualScreen = read('src/screens/ManualScreen.tsx');
assert.match(manualScreen, /title=\{t\('manual:goToStart'\)\} variant="secondary" compact onPress=\{\(\) => setPage\(0\)\}/,
  'a control returns to section 1');
assert.match(manualScreen, /title=\{t\('common:back'\)\} variant="secondary" compact onPress=\{\(\) => setPage\(page - 1\)\}/,
  'a control steps to the previous section');
// Every page can be left: Close is in the footer whatever section is open.
assert.match(manualScreen, /<ACRButton title=\{t\('common:close'\)\} variant="secondary" onPress=\{\(\) => navigation\.goBack\(\)\} \/>/,
  'Close is available on every page of the manual');
const button = read('src/components/ACRButton.tsx');
assert.match(button, /compact\?: boolean;/, 'the button offers a compact size');
assert.match(button, /compact: \{\s*flex: 0,\s*alignSelf: 'center',/, 'a compact button is sized to its text');

// The notice itself carries every element, each labelled
const notice = read('src/components/PrivacyNotice.tsx');
for (const key of ['legal:title', 'legal:cookies', 'legal:controller', 'legal:process', 'legal:never',
  'legal:why', 'legal:kept', 'legal:rights']) {
  assert.ok(notice.includes(key), `the notice must show ${key}`);
}
assert.match(notice, /accessibilityLabel=\{`\$\{label\}: \$\{value\}`\}/, 'each line is announced as label and value');

// ── Reachable from About as well as from the poster
const about = read('src/screens/AboutScreen.tsx');
assert.match(about, /manual:legalSection/, 'About links to the full notice');
assert.match(about, /navigate\('Manual', \{ section: 'legal' \}\)/, 'About opens the manual at the legal section');
const navigator = read('src/navigation/AppNavigator.tsx');
assert.match(navigator, /Manual: \{ section\?: 'legal' \} \| undefined;/, 'the Manual route is typed');
assert.match(navigator, /<Stack\.Screen name="Manual" component=\{ManualScreen\} \/>/, 'the Manual screen is registered');

process.stdout.write(`PASS privacy notice and in-app manual: ${baseKeys.length} notice keys in 8 locales with controller, contact, Cloudflare and retention; ${generated['en-GB'].pages.length} manual pages in each of ${LOCALES.length} languages, generated from docs/clinical; poster page two carries the notice and READ DETAILS; retired "Assessment blocked" wording absent\n`);
