# MOB-V0.5-ANDROID-STANDALONE-001

## Local signed Android APK build, two-device installation and standalone verification

Revision: `1.1 — Xiaomi MIX Fold 2 primary / Samsung Galaxy S8 compatibility`

Status: `READY FOR CODEX EXECUTION AFTER BRANCH AND VERSION BASELINE ARE SET`

This is an Android implementation and physical-build task. It is not a report-
only or verification-only session. The target is a locally built, signed,
standalone APK that launches without Expo Go, Metro, EAS or Google Play.

## 1. Authority

- Owner, acceptance authority and release authority: Kraken.
- Implementer: OpenAI Codex.
- Primary physical Android target: Xiaomi MIX Fold 2 running HyperOS 3.0.8.0.
- Secondary legacy-compatibility target: Samsung Galaxy S8; Codex must read its
  actual Android release, API level and ABI from the device rather than assume
  them.
- The same signed Release APK must be tested sequentially on both devices.
- Codex may inspect the repository, use existing local Android tooling, make
  bounded Android build/configuration changes, run tests, build a signed APK,
  install it sequentially on the two authorised test devices and write the
  evidence report.
- Kraken alone may create or approve signing secrets, uninstall an existing
  physical-device app, commit, push, merge, tag, distribute or publish.

## 2. Repository and accepted source

Repository:

```text
/Users/Kraken/DAPP/acr-mobile-companion
```

Accepted UI-only source commit:

```text
808565d69a2ca6253c63bc0167b5f2cd39705818
```

Required Android branch:

```text
feature/mobile-v0.5-android
```

Kraken must create the branch from either:

1. accepted commit `808565d...`; or
2. a later Kraken-accepted version-alignment commit descended from
   `808565d...`.

Kraken must commit/push the instruction file and publish the Android branch
before execution. Kraken then supplies the full post-push commit as:

```text
SESSION_BASELINE_SHA
```

The dynamic `SESSION_BASELINE_SHA` is supplied only in the opening message. Do
not edit this file to insert it.

## 3. Baseline gates

Codex must verify before changing anything:

```bash
cd /Users/Kraken/DAPP/acr-mobile-companion

pwd
git branch --show-current
git rev-parse HEAD
git rev-parse origin/feature/mobile-v0.5-android
git rev-list --left-right --count HEAD...origin/feature/mobile-v0.5-android
git status --short --branch
git status --porcelain=v1 --untracked-files=all
git merge-base --is-ancestor 808565d69a2ca6253c63bc0167b5f2cd39705818 HEAD
```

Required:

- repository path is exact;
- branch is `feature/mobile-v0.5-android`;
- local HEAD, upstream and `SESSION_BASELINE_SHA` are identical;
- ahead/behind is `0 0`;
- working tree is completely clean;
- accepted UI commit is an ancestor.

Any mismatch ends the session with `BLOCKED_BASELINE`. Do not fetch, pull,
merge, rebase, reset, stash or otherwise repair Git state.

## 4. Objective

Build and install the accepted UI-only ACR Companion app as one locally signed
Android Release APK, first on the Xiaomi MIX Fold 2 and then on the Samsung
Galaxy S8, and prove:

1. the app launches from its icon without Metro or Expo Go;
2. all eight languages remain selectable;
3. Arabic switches immediately to RTL and back to LTR without freezing;
4. both About pages, five assessment screens and Review remain usable;
5. no iOS behaviour regresses;
6. no clinical, backend or gateway function is added in this task;
7. signing credentials and passwords never enter Git or the evidence report.

## 5. Scope

### Permitted inspection

Codex may read tracked repository files, package metadata, Gradle files, Android
manifests, app configuration, current tests and existing build evidence.

### Permitted mutations

Only when required by demonstrated Android build or runtime evidence:

- existing `android/` Gradle, manifest, resource and platform files;
- Expo app configuration fields that are authoritative for Android;
- Android-specific application files such as `*.android.ts` or
  `*.android.tsx`;
- the minimum existing shared UI files directly responsible for a reproduced
  Android-only defect;
- targeted Android verification files under `tests/`;
- `docs/MOB-V0.5-ANDROID-STANDALONE-001-Evidence-Report.md`.

### Forbidden without a new Kraken decision

- dependency installation, removal or upgrade;
- Node, Expo, React Native, Gradle, Android Gradle Plugin, Kotlin, JDK or SDK
  version upgrade;
- Expo/EAS cloud build or EAS credentials;
- Google Play submission;
- backend, mock-server or gateway changes;
- clinical logic, field definitions, validation ranges, assessment state,
  request construction, inference, attestation, Result, ontology, SWRL or
  Openllet changes;
- locale wording changes;
- iOS project/signing changes;
- app name or icon redesign;
- signing key, certificate password or secret committed anywhere in the repo;
- commit, push, merge, tag, release or distribution.

## 6. Resource constraints

The host MacBook has limited memory. Codex must:

1. run heavy Gradle, emulator and test processes sequentially;
2. use the two physical phones sequentially and do not start an Android
   emulator;
3. close the iOS simulator and keep Metro stopped for the final Release build;
4. avoid speculative clean builds and broad cache deletion;
5. never delete `~/.gradle`, the Android SDK or the project Gradle cache merely
   to retry a build;
6. report the first causal error rather than pages of secondary output.

## 7. Legal terminal states

- `READY_FOR_KRAKEN_ANDROID_TOOLCHAIN_ACTION`
- `READY_FOR_KRAKEN_ANDROID_SIGNING_ACTION`
- `READY_FOR_KRAKEN_XIAOMI_REVIEW`
- `READY_FOR_KRAKEN_GALAXY_S8_REVIEW`
- `READY_FOR_KRAKEN_TWO_DEVICE_REVIEW`
- `EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE`
- `BLOCKED_BASELINE`
- `BLOCKED_TOOLCHAIN`
- `BLOCKED_ANDROID_PROJECT`
- `BLOCKED_DEPENDENCY`
- `BLOCKED_VERSION`
- `BLOCKED_SIGNING`
- `BLOCKED_BUILD`
- `BLOCKED_DEVICE`
- `BLOCKED_RUNTIME`
- `BLOCKED_SCOPE`

# EXECUTION

## Phase A — Read and inventory

Codex must read this file completely, verify section 3, and then inventory:

```bash
node --version
npm --version
npx --no-install expo --version
java -version
/usr/libexec/java_home -V
which adb || true
adb version || true
which sdkmanager || true
echo "${ANDROID_HOME:-}"
echo "${ANDROID_SDK_ROOT:-}"
test -d android && echo ANDROID_DIRECTORY_PRESENT || echo ANDROID_DIRECTORY_ABSENT
test -x android/gradlew && echo GRADLE_WRAPPER_PRESENT || echo GRADLE_WRAPPER_ABSENT
```

Also record:

- macOS and CPU architecture;
- Android Studio presence and version if installed;
- existing Android SDK platforms and Build Tools;
- package manager and lockfile;
- Expo SDK, React Native and Hermes versions;
- whether `node_modules` is already present;
- exact `android/` tracked-file inventory;
- application ID, `minSdkVersion`, `targetSdkVersion`, `compileSdkVersion`,
  `versionName` and `versionCode` from their authoritative sources.

Do not install or update anything during this phase.

### Android-directory gate

If a valid existing `android/` project and Gradle wrapper are present, use them.

If `android/` is absent or demonstrably unusable:

1. do not run Prebuild automatically;
2. report exactly why native generation is required;
3. propose the exact local command, normally
   `npx --no-install expo prebuild --platform android --no-install` if supported
   by the pinned Expo CLI;
4. list the expected generated/modified paths;
5. stop `BLOCKED_ANDROID_PROJECT` for Kraken's explicit approval.

No cloud build is an alternative.

## Phase B — Capture the pre-edit test posture

Before any edit:

1. run `node tests/p1p2/verify.js`;
2. run `node tests/rtl/verify.js` if present;
3. run the existing locale parity check;
4. run the configured typecheck and preserve its complete output/exit code;
5. run lint only if its executable already exists;
6. run `git diff --check`;
7. record `git status --porcelain=v1 --untracked-files=all`.

Expected accepted posture from the prior iOS task:

- P1/P2 verifier exits `0`;
- RTL verifier exits `0`;
- locale parity exits `0`;
- typecheck may exit `2` with the known unchanged baseline diagnostics;
- lint may be `SKIPPED` because ESLint is absent.

Do not call an exit-2 typecheck PASS. Stop if a previously passing targeted
verification now fails.

## Phase C — Verify both physical-device targets before building

Ask Kraken to connect one phone at a time only after the static/toolchain audit
is ready. Never select a device by an assumed serial number. After each phone
is authorised, capture its facts with:

```bash
adb kill-server
adb start-server
adb devices -l
adb shell getprop ro.product.manufacturer
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.sdk
adb shell getprop ro.product.cpu.abilist
```

Omit complete device serials from the evidence report.

### C1 — Xiaomi MIX Fold 2 / HyperOS 3.0.8.0

On the Xiaomi:

1. open **Settings > About phone**;
2. tap the **OS version** or **Xiaomi HyperOS** panel seven times until the
   developer confirmation appears;
3. open **Settings > Additional settings > Developer options**;
4. enable **USB debugging** only; do not enable bootloader unlocking, OEM
   unlocking, root access or unrelated developer settings;
5. connect the phone by a data-capable USB cable;
6. select file transfer if HyperOS asks for the USB connection mode;
7. accept the RSA fingerprint prompt only for Kraken's Mac;
8. run the device-fact commands above and record the reported Android release,
   API level and ABIs;
9. disconnect the Xiaomi before connecting the Samsung.

### C2 — Samsung Galaxy S8

On the Samsung:

1. open **Settings > About phone > Software information**;
2. tap **Build number** seven times if Developer options are not enabled;
3. return to Settings and open **Developer options**;
4. enable **USB debugging** only;
5. connect the phone by a data-capable USB cable;
6. accept the RSA fingerprint prompt only for Kraken's Mac;
7. run the same device-fact commands and record the actual Android release,
   API level and ABIs.

Compare both reported API levels and ABI lists with the application's actual
`minSdkVersion` and the native-library ABIs that the planned APK will contain.

The Xiaomi is the primary delivery device. Stop `BLOCKED_DEVICE` if it is below
`minSdkVersion` or has no supported APK ABI. If only the Galaxy S8 is
incompatible, report the exact API/ABI conflict before changing anything; do
not lower `minSdkVersion`, remove an ABI or change dependencies merely to force
legacy compatibility without Kraken's separate decision.

## Phase D — Version gate

Read `docs/MOB-V0.5-VERSION-CONTROL-001.md` and report:

```text
Source commit/tag:
User-visible version:
Android versionCode:
iOS user-visible version/build retained:
```

The Android `versionCode` must be a positive integer and must not move
backwards. The user-visible version must match Kraken's accepted version plan.

If version sources conflict, stop `BLOCKED_VERSION` with exact files/values.
Do not guess a new number or silently edit generated and source files
differently.

## Phase E — Create or select the Android signing key

A standalone Release APK must be signed. Do not use the debug key as the
accepted Release identity.

### If an ACR Android signing key already exists

1. Kraken supplies only its filesystem location and alias through the local
   interactive environment.
2. Codex verifies the file exists and is outside Git.
3. Kraken enters passwords only into the local signing prompt or secure local
   environment.
4. Codex never prints, stores in the evidence report or commits a password.

### If no signing key exists

Codex stops `READY_FOR_KRAKEN_ANDROID_SIGNING_ACTION` and presents these two
local options:

#### Option 1 — Android Studio wizard

1. Open the existing `android/` project in Android Studio.
2. Select **Build > Generate Signed Bundle / APK**.
3. Select **APK**.
4. Choose **Create new** under Key store path.
5. Kraken selects a secure path outside the Git repository.
6. Kraken enters and retains the keystore password, alias and key password.
7. Use a validity of at least 25 years.
8. Back up the keystore securely, including to the external backup medium.

#### Option 2 — local `keytool`

Codex may prepare, but Kraken must interactively enter secret values:

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore /KRAKEN-CHOSEN-SECURE-PATH/acr-mobile-release.p12 \
  -alias acr-mobile-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

The literal example path must not be executed. Kraken chooses and confirms the
real path first.

### Signing configuration

Codex may add a Gradle Release signing configuration that reads property names
or environment variables, but:

- the keystore file remains outside Git;
- passwords remain in an untracked user-level location such as
  `~/.gradle/gradle.properties` or in the process environment;
- `.gitignore` is updated if any local reference could otherwise be tracked;
- no secret value appears in `git diff`, terminal transcript or evidence.

After Kraken completes the signing action, continue in the same session.

## Phase F — Build-plan declaration

Before editing, Codex prints:

```text
1. Exact Android files requiring change.
2. Exact reason for each change.
3. Version values to be used.
4. Signing-property names, with values redacted.
5. Expected APK output path.
6. Confirmation that no dependency/backend/clinical/iOS change is required.
```

If a new dependency or shared-source change is proposed, Codex must show a
direct build/runtime failure that requires it and stop for Kraken if outside
section 5.

## Phase G — Implement the minimum Android build configuration

Permitted work includes only what the inspected project actually requires, for
example:

- align `applicationId`, `versionName` and `versionCode` with the accepted plan;
- configure Release signing via secret-free property references;
- preserve Hermes Release bundling;
- confirm launcher icon/name;
- confirm Release build embeds the JavaScript bundle and packaged assets;
- correct a directly demonstrated Android manifest or resource build defect;
- add a narrow Android-specific style/component fix only after reproduction.

Do not copy iOS signing settings or introduce Expo Go/Metro dependencies.

After the first edit run:

```bash
git status --short --untracked-files=all
git diff --stat
git diff --name-only
git diff --check
```

Stop if any secret, unapproved dependency or unrelated source appears.

## Phase H — Build the signed Release APK locally

Ensure no Metro server is listening on port 8081. Then use the existing Gradle
wrapper:

```bash
cd /Users/Kraken/DAPP/acr-mobile-companion/android
./gradlew :app:assembleRelease --stacktrace
```

Do not run `clean` on the first attempt. Do not use EAS or a remote service.

Expected APK location is normally:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Use the actual output reported by Gradle.

If the build fails:

1. identify the first causal error;
2. classify it as toolchain, dependency, signing, version, source or device;
3. provide the minimal proposed correction;
4. do not apply unrelated upgrades;
5. use at most two directly evidenced correction cycles.

## Phase I — Verify the APK before installation

For the actual APK:

1. record file size;
2. compute SHA-256;
3. verify the APK signature with the installed Android Build Tools
   `apksigner`;
4. inspect package/application ID, version name, version code, minimum SDK and
   target SDK with `apkanalyzer`, `aapt` or another installed SDK tool;
5. list the APK contents and prove the Release JavaScript bundle/assets are
   embedded;
6. verify no development-server address is required for startup;
7. verify the signing certificate without exposing private-key data.

Representative commands, adjusted to installed tool paths:

```bash
shasum -a 256 android/app/build/outputs/apk/release/app-release.apk
apksigner verify --verbose --print-certs \
  android/app/build/outputs/apk/release/app-release.apk
unzip -l android/app/build/outputs/apk/release/app-release.apk | \
  grep -E 'assets/.*(bundle|js)|libhermes|index.android'
```

Signature failure ends `BLOCKED_SIGNING`.

## Phase J — Install the same signed APK on both phones

Before each installation, confirm only the intended phone is connected and
`adb devices -l` reports it as `device`, not `unauthorised`, `offline` or
multiple devices. Recompute the APK SHA-256 before the second installation to
prove that both phones receive the identical artefact.

### J1 — Xiaomi installation

1. connect and unlock the Xiaomi;
2. accept its authorised ADB state;
3. run:

```bash
adb install -r /absolute/path/to/app-release.apk
```

4. launch using the discovered application ID and launcher activity, or ask
   Kraken to tap the ACR icon;
5. confirm the ACR icon and Home/Welcome screen appear;
6. disconnect the Xiaomi before proceeding.

### J2 — Samsung installation

1. connect and unlock the Galaxy S8;
2. confirm its authorised ADB state;
3. run the identical `adb install -r` command against the same APK;
4. launch from the ACR icon and confirm Home/Welcome appears.

For either phone, if installation reports an incompatible existing signature:

1. stop for that phone;
2. identify the package name and error;
3. explain that uninstalling deletes that app's local data;
4. ask Kraken for explicit approval;
5. do not run `adb uninstall` without an explicit `YES` naming the phone.

## Phase K — Prove standalone operation on both phones

Perform the following sequence first on the Xiaomi and then on the Samsung:

1. stop Metro and confirm port 8081 has no listener;
2. force-stop the ACR app with
   `adb shell am force-stop <application-id>`;
3. disconnect the USB cable;
4. Kraken taps the ACR icon;
5. confirm Home/Welcome appears and remains responsive;
6. force-close and relaunch once more while still disconnected.

An app that launches only with Metro, Expo Go or the USB development connection
fails this task. The devices do not need to remain in USB-debugging mode after
installation and acceptance testing is complete.

## Phase L — Two-device functional check

Use synthetic/demo values only. Kraken supplies the human visual results for
each phone; Codex must not mark an unobserved item PASS.

| ID | Check | Expected | Xiaomi | Galaxy S8 |
| --- | --- | --- | --- | --- |
| AND-01 | Launch from icon with Metro stopped | Responsive Home | Kraken records | Kraken records |
| AND-02 | English -> Arabic | Immediate RTL; no freeze | Kraken records | Kraken records |
| AND-03 | Arabic Home and both About pages | Usable RTL presentation | Kraken records | Kraken records |
| AND-04 | Step 1, Step 2, Step 3, P1 and P2 | All five screens usable | Kraken records | Kraken records |
| AND-05 | Review | Review displays without fatal warning/error | Kraken records | Kraken records |
| AND-06 | Arabic -> English | Immediate LTR; no restart | Kraken records | Kraken records |
| AND-07 | Other six languages | Selectable and LTR | Kraken records | Kraken records |
| AND-08 | Three English/Arabic round trips | No stale modal or direction leakage | Kraken records | Kraken records |
| AND-09 | Force-close and relaunch | Direction agrees with startup locale | Kraken records | Kraken records |
| AND-10 | Cable removed and Metro absent | Standalone launch succeeds | Kraken records | Kraken records |

On the Xiaomi, additionally unfold and refold once while Home or About is open.
The app must remain responsive and must not crash; this is presentation and
continuity evidence only, not authorisation to redesign layouts in this task.

If a UI defect appears, Codex first records expected, actual, reproduction and
the exact proposed file. Only a directly demonstrated Android compatibility
defect may use a correction cycle.

## Phase M — Post-build regression and scope audit

Run:

1. targeted Android verification added by this task;
2. `node tests/p1p2/verify.js`;
3. `node tests/rtl/verify.js`;
4. locale parity;
5. the same typecheck used before edits and compare diagnostics;
6. lint only if it existed at baseline;
7. `git diff --check "$SESSION_BASELINE_SHA"`;
8. complete changed-file and secret audit.

Required repository commands:

```bash
git status --short --branch
git status --porcelain=v1 --untracked-files=all
git diff --stat "$SESSION_BASELINE_SHA"
git diff --name-status "$SESSION_BASELINE_SHA"
git diff --check "$SESSION_BASELINE_SHA"
```

Search the diff for password, store password, key password, private key,
keystore bytes, complete device serials and tokens. A secret in Git ends
`BLOCKED_SCOPE`; remove only Codex-created secret material safely and report it.

No new typecheck diagnostic attributable to the task is allowed. Existing
unchanged baseline failures remain disclosed as PARTIAL.

## Phase N — Evidence report

Create:

```text
docs/MOB-V0.5-ANDROID-STANDALONE-001-Evidence-Report.md
```

Include:

1. terminal state;
2. baseline branch/SHA/upstream/cleanliness;
3. toolchain versions and missing components;
4. Android project/prebuild decision;
5. both device models, OS/API levels and ABIs without complete serials;
6. versionName/versionCode/minSdk/targetSdk/application ID;
7. changed-file inventory and reason per file;
8. build command and exit result;
9. APK path, size and SHA-256;
10. signing verification result with secrets omitted;
11. proof the JavaScript bundle/assets are embedded;
12. installation and standalone-launch results;
13. AND-01 through AND-10 matrix for each phone, plus the Xiaomi fold/unfold
    observation;
14. automated pre/post test posture;
15. protected-scope and secret audit;
16. correction-cycle accounting;
17. residual risks and exact next proposed action;
18. final Git status.

Codex does not commit or push the evidence report or source changes.

## Required final response

Return only:

1. one legal terminal state;
2. outcome in one paragraph;
3. exact changed files;
4. test/build/install/standalone posture;
5. APK path, size and SHA-256;
6. evidence-report path;
7. blocker or next action.

Do not replace missing evidence with generic analysis.

## Opening message template

After Kraken creates and publishes the Android branch and supplies its full
clean SHA, start a new OpenAI Codex session with:

```text
MOB-V0.5-ANDROID-STANDALONE-001

Repository:
/Users/Kraken/DAPP/acr-mobile-companion

Required branch:
feature/mobile-v0.5-android

SESSION_BASELINE_SHA:

Accepted UI baseline:
808565d69a2ca6253c63bc0167b5f2cd39705818

Read this instruction completely before taking action:
docs/MOB-V0.5-ANDROID-STANDALONE-001.md

This is a local Android implementation, signed APK build, physical installation
and standalone verification task. It is not verification-only.

Confirm the clean baseline, then execute the authorised phases in order. Do not
install or upgrade tools/dependencies, run EAS/cloud build, expose signing
secrets, commit or push.
```

Paste the full session SHA on the blank line after `SESSION_BASELINE_SHA:`.

## Official references

- Expo local Release build: https://docs.expo.dev/guides/local-app-production/
- Android signing: https://developer.android.com/studio/publish/app-signing
- Android USB debugging: https://developer.android.com/studio/debug/dev-options
- Android command-line build/signing: https://developer.android.com/build/building-cmdline
