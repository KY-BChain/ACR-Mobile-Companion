const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const appConfig = JSON.parse(read('app.json'));
const expectedVersion = '0.5.1';
const expectedBuild = '43';

assert.equal(appConfig.expo.name, 'ACR Companion');
assert.equal(appConfig.expo.version, expectedVersion);
assert.equal(appConfig.expo.ios.buildNumber, expectedBuild);
assert.equal(String(appConfig.expo.android.versionCode), expectedBuild);

const android = read('android/app/build.gradle');
assert.equal(android.match(/versionName\s+"([^"]+)"/)[1], expectedVersion);
assert.equal(android.match(/versionCode\s+(\d+)/)[1], expectedBuild);

const infoPlist = read('ios/ACRCompanion/Info.plist');
const plistValue = (key) => infoPlist.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]+)</string>`))[1];
assert.equal(plistValue('CFBundleShortVersionString'), expectedVersion);
assert.equal(plistValue('CFBundleVersion'), expectedBuild);

const project = read('ios/ACRCompanion.xcodeproj/project.pbxproj');
assert.deepEqual([...project.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((match) => match[1]), [expectedVersion, expectedVersion]);
assert.deepEqual([...project.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map((match) => match[1]), [expectedBuild, expectedBuild]);

const identity = read('src/config/appIdentity.ts');
assert.match(identity, /import appConfig from '\.\.\/\.\.\/app\.json'/);
assert.match(identity, /APP_VERSION = expo\.version/);
assert.match(identity, /APP_BUILD = expo\.ios\.buildNumber/);
assert.match(identity, /APP_VERSION_LABEL = `\$\{APP_NAME\} v\$\{APP_VERSION\} \(Build \$\{APP_BUILD\}\)`/);
assert.doesNotMatch(identity, /0\.5\.1|['"]43['"]/);

const about = read('src/screens/AboutScreen.tsx');
assert.match(about, /import \{ APP_VERSION_LABEL \} from '\.\.\/config\/appIdentity'/);
assert.match(about, />\{APP_VERSION_LABEL\}<\/Text>/);
const review = read('src/screens/ReviewScreen.tsx');
assert.match(review, /buildId: MOBILE_BUILD_ID/);
assert.doesNotMatch(review, /mob-v0\.1\.0\+42/);
const result = read('src/screens/ResultScreen.tsx');
assert.match(result, /buildId: \$\{MOBILE_PROVENANCE_BUILD_ID\}/);
assert.doesNotMatch(result, /mob-v0\.1\.0 \(42\)/);

const english = JSON.parse(read('src/i18n/locales/en-GB.json'));
assert.equal(
  english.welcome.description3,
  'The app does not intentionally store clinical data. Entries are held in memory for the current assessment only.',
);

console.log('PASS version consistency: Expo, Android, iOS, active build IDs, and About label are 0.5.1 / 43');
