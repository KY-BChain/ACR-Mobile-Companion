const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const appConfig = JSON.parse(read('app.json'));
const expectedVersion = '0.6.5';
const expectedBuild = '45';

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
assert.match(review, /buildAssessmentRequest/);
assert.doesNotMatch(review, /mob-v0\.1\.0\+42/);

const requestBuilder = read('src/api/requestBuilder.ts');
assert.match(requestBuilder, /MOBILE_BUILD_ID/);
assert.match(requestBuilder, /Build identity is not a valid gateway client identity/);
assert.doesNotMatch(requestBuilder, /MOBILE_BUILD_ID !== ['"]mob-v/);

assert.match(infoPlist, /<key>NSAllowsArbitraryLoads<\/key>\s*<false\/>/);
assert.doesNotMatch(infoPlist, /NSAllowsLocalNetworking/, 'Build 45 has no iOS local-network cleartext exception');
assert.doesNotMatch(infoPlist, /NSLocalNetworkUsageDescription/, 'Build 45 does not request local-network access');
const mainManifest = read('android/app/src/main/AndroidManifest.xml');
assert.match(mainManifest, /android:usesCleartextTraffic="false"/);
assert.match(mainManifest, /android:networkSecurityConfig="@xml\/network_security_config"/);
const debugManifest = read('android/app/src/debug/AndroidManifest.xml');
assert.doesNotMatch(debugManifest, /usesCleartextTraffic="true"/);
const networkConfig = read('android/app/src/main/res/xml/network_security_config.xml');
assert.match(networkConfig, /base-config cleartextTrafficPermitted="false"/);
assert.doesNotMatch(networkConfig, /cleartextTrafficPermitted="true"/, 'Build 45 has no Android cleartext exception for any domain');
assert.doesNotMatch(networkConfig, /192\.168\.1\.94/, 'the retired Build 44 LAN host is gone');

const english = JSON.parse(read('src/i18n/locales/en-GB.json'));
assert.equal(
  english.welcome.description3,
  'The app does not intentionally store clinical data. Entries are held in memory for the current assessment only.',
);

const gatewayConfig = read('src/config/gateway.ts');
assert.match(gatewayConfig, /ACTIVE_GATEWAY_ORIGIN: GovernedOrigin = BUILD45_REVIEW_ORIGIN/, 'the compiled origin is the Build 45 review hostname');
assert.doesNotMatch(gatewayConfig, /http:\/\//, 'no cleartext origin is compiled into the app');
console.log('PASS version/native consistency: Expo, Android, iOS and derived gateway build ID are 0.6.5 / 45; one compiled https origin and no cleartext exception on either platform');
