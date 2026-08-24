# MOB-V0.5.1-IOS-ANDROID-SYNC-001 Evidence Report

Status: `EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE`

## Baseline and inputs

| Item | Evidence |
| --- | --- |
| Repository | `/Users/Kraken/DAPP/acr-mobile-companion` |
| Branch | `feature/mobile-v0.5.1-cross-platform-sync` |
| `SESSION_BASELINE_SHA` | `583e0febb2e0bcd8e87d36824453fc2df8b8007c` |
| Matching origin | Same SHA; divergence `0 0`; no fetch or pull |
| Pre-edit tree | Clean; pre-edit changed-file inventory was empty |
| `ANDROID_ACCEPTED_SHA` | `0402d979ffbb24f1478058e662b6a741bde6ffa5` |
| Ancestry | `git merge-base --is-ancestor` exit `0` |
| Operational clarification | Kraken authorised Phases B–F with `/Volumes/AndroidDev` unmounted. Phase G remains gated on mounting it. |

The three poster assets matched the accepted Android hashes before editing and
remained byte-identical after implementation:

| Poster | SHA-256 |
| --- | --- |
| English | `9f3cb6e22aba2316a19f109b22e90e50738114ee7f644647831716faae3a271d` |
| French | `0003a665a78688dd6eaf0962a00e8e50bc1469c5dff732926e419f36a6d6b896` |
| Simplified Chinese | `48ceb42d837498dc6bb00bd09e7148938c5dd574004d82a0a9b1f5477a66d437` |

Local inputs present: tracked `ios/` and `android/` projects,
`ios/ACRCompanion.xcworkspace`, Pods, node modules, local Expo and the Gradle
wrapper. Xcode 26.3 exposes iPhone 16e simulator
`0A75B040-6627-4DA6-A6D1-E9B695F32F7C` on iOS 26.3.1. Approximately 20 GiB
was free at the environment gate.

## Version and platform audit

### Before

| Surface | Pre-edit value/source |
| --- | --- |
| Expo application version | `app.json`: `0.1.0` |
| Expo iOS build | `app.json`: `42` |
| Expo Android code | `app.json`: `42` |
| Android native/package source | `android/app/build.gradle`: `0.1.0` / `42` |
| Accepted existing APK | Android evidence report: `0.1.0` / `42`; existing APK also contained `assets/index.android.bundle` |
| iOS packaged plist source | `ios/ACRCompanion/Info.plist`: `0.1.0` / `42` |
| Xcode project settings | Both configurations used `MARKETING_VERSION = 1.0` and `CURRENT_PROJECT_VERSION = 1` |
| Active source build IDs | Review `mob-v0.1.0+42`; Result provenance `mob-v0.1.0 (42)` |
| Root npm package version | `package.json` / lockfile `0.1.0`; not controlling because Expo has an explicit application version |

Archived screen copies also contain historical `0.1.0` strings but are not
registered by the active navigator. Poster artwork carries ACR Platform poster
version language; it is not application metadata and was not changed.

Before editing, Poster registration and the initial route were guarded by
`Platform.OS === 'android'`. The Welcome focus timer likewise ran only on
Android. It already used a three-second timeout, focus cleanup, modal deferral,
an `isFocused()` safeguard and `navigation.replace` in both loop directions.

Native audit: workspace and scheme are both `ACRCompanion`; bundle identifier
is `com.anonymous.acr-mobile-companion`. Release uses the existing automatic
signing configuration and Apple Development identity. No signing field,
identifier, entitlement or profile design was changed. Android Release is
`app:assembleRelease`; Hermes is enabled and the accepted low-memory settings
use a 2 GiB Gradle heap, no daemon, no parallel execution and no configure on
demand.

### Canonical decision and after-state

`app.json` is the canonical application identity. The local
`src/config/appIdentity.ts` helper imports that configuration directly; the
About label and active mobile build IDs derive from it without a dependency.
Because tracked native projects exist and Prebuild is forbidden, the required
native fields are explicitly synchronized and checked by
`tests/version/verify.js`.

| Surface | Final source value |
| --- | --- |
| Expo | `0.5.1`; iOS build `43`; Android code `43` |
| Android Gradle | `versionName "0.5.1"`; `versionCode 43` |
| iOS Info.plist | `CFBundleShortVersionString 0.5.1`; `CFBundleVersion 43` |
| Xcode project, both configurations | `MARKETING_VERSION 0.5.1`; `CURRENT_PROJECT_VERSION 43` |
| About page 2 | Metadata-derived `ACR Companion v0.5.1 (Build 43)` |
| Active Review/Result build IDs | Metadata-derived `mob-v0.5.1+43` and `mob-v0.5.1 (43)` |

## Implementation evidence

- `AppNavigator` registers Poster and selects it initially on Android and iOS,
  while unsupported platforms retain Welcome.
- `WelcomeScreen` enables the accepted focus timer on Android and iOS. Modal
  deferral, cleanup, focus checking and replacement navigation are unchanged.
- `PosterScreen`, poster locale selection, responsive contain rendering,
  safe-area sizing and vertical gesture code were not changed.
- About page 2 adds one unobtrusive metadata-derived identity label without a
  locale key or translation requirement.
- All eight locale files and the accepted English `welcome.description3` value
  are unchanged.
- No network, storage, inference, ontology, signing or identifier changes were
  made.

## Automated verification

| Command | Result |
| --- | --- |
| `node tests/poster/verify.js` | Exit `0`; eight mappings/fallbacks, assets, layout/gesture, replacement, Android+iOS boundary, timer cleanup/modal guard |
| `node tests/version/verify.js` | Exit `0`; Expo/native platforms/active source/About label exactly `0.5.1` / `43` |
| `node tests/rtl/verify.js` | Exit `0`; eight-locale direction/key parity and immediate RTL/LTR implementation invariants |
| `node tests/p1p2/verify.js` | Exit `0`; P1/P2, Review request exclusion, reset, navigation and About invariants |
| `npm run typecheck` before/after | Both exit `2` with the same 261 pre-existing diagnostics; logs byte-identical, SHA-256 `87f54a78dd544ce2008d5f696cd9243ae9d28c72532200f1940c650ec639326d` |
| Lint | Not run: script exists but no ESLint configuration is present; no dependency/configuration was installed |
| `git diff --check` | Exit `0` |

Protected-scope audit: every changed path is within section 7 of the Loop
instruction. No package/lockfile, asset, API, store, locale, signing identity,
bundle/application identifier, mock-server or ontology path changed.

## iOS simulator checklist

Simulator build and launch evidence:

- `xcodebuild -quiet -workspace .../ios/ACRCompanion.xcworkspace -scheme ACRCompanion -configuration Debug -sdk iphonesimulator -destination id=0A75B040-6627-4DA6-A6D1-E9B695F32F7C -derivedDataPath /private/tmp/mob-v051-ios-simulator build`: exit `0`.
- Product: `/private/tmp/mob-v051-ios-simulator/Build/Products/Debug-iphonesimulator/ACRCompanion.app`.
- Built plist: `CFBundleShortVersionString 0.5.1`; `CFBundleVersion 43`.
- Installed on and launched against the booted iPhone 16e / iOS 26.3.1
  simulator. No uninstall, data erase, dependency install or Prebuild occurred.
- Metro was used only for the Debug simulator review. After Kraken accepted the
  simulator checklist, Metro was stopped and `lsof` proved no listener remained
  on TCP `8081` before the physical Release build and again immediately before
  the physical launch.
- After a cold process launch with Metro live, bundling completed for 910 modules
  and a direct simulator screenshot confirmed the complete centered English
  Poster. Screenshot: `/private/tmp/mob-v051-ios-poster-ready.png`, SHA-256
  `b1650cc5001e90cd38ab1c0715d34ac52d9d15725a930fcc98299aca9d9f442b`.
- An initial app launch occurred before Metro was live and correctly showed the
  Debug no-bundle fallback. Cold-relaunching the same installed app after Metro
  was confirmed live loaded Poster; no source correction was required.

| ID | Action | Expected result | Status |
| --- | --- | --- | --- |
| `IOS-SIM-01` | Cold launch | Poster is first on iOS | `KRAKEN_ACCEPTED` |
| `IOS-SIM-02` | Swipe upward | Existing Welcome appears | `KRAKEN_ACCEPTED` |
| `IOS-SIM-03` | Leave Welcome for three seconds | Poster returns without freeze | `KRAKEN_ACCEPTED` |
| `IOS-SIM-04` | Repeat three cycles | No stack growth or stale overlay | `KRAKEN_ACCEPTED` |
| `IOS-SIM-05` | Select French | French poster appears next | `KRAKEN_ACCEPTED` |
| `IOS-SIM-06` | Select Chinese | Chinese poster appears next | `KRAKEN_ACCEPTED` |
| `IOS-SIM-07` | Select the other six locales | English poster appears; UI language remains selected | `KRAKEN_ACCEPTED` |
| `IOS-SIM-08` | Arabic then English | RTL/LTR remains immediate and responsive | `KRAKEN_ACCEPTED` |
| `IOS-SIM-09` | Hold language selector open beyond three seconds | Selector is not hidden or stranded | `KRAKEN_ACCEPTED` |
| `IOS-SIM-10` | Enter About/assessment before timeout | No delayed redirect | `KRAKEN_ACCEPTED` |
| `IOS-SIM-11` | Inspect About page 2 | `ACR Companion v0.5.1 (Build 43)` is visible | `KRAKEN_ACCEPTED` |
| `IOS-SIM-12` | Check About, five assessment screens and Review | Existing functions remain intact | `KRAKEN_ACCEPTED` |

Kraken reported all twelve simulator checks reviewed and accepted before Phase
F began.

## Physical iPhone Release

Physical gate and build evidence:

- Directly cabled iPhone 13 (`iPhone14,5`) was available, paired and connected,
  booted on iOS 26.6.1 (`23G83`), unlocked, trusted and Developer Mode enabled.
  No device serial, ECID or signing credential is recorded here.
- Metro remained stopped. The Release build used the existing
  `ACRCompanion.xcworkspace`, `ACRCompanion` scheme, automatic signing and the
  connected physical-device destination. The command used `xcodebuild`,
  configuration `Release`, SDK `iphoneos`, an isolated derived-data path and
  `-allowProvisioningUpdates`; exit `0`. There was no Prebuild, dependency
  installation, cloud build, signing change or listening Metro server.
- Xcode's in-process Expo embed phase bundled 805 modules and copied nine
  assets. Hermes compiled the embedded bundle to bytecode version 96.
- Product: `/private/tmp/mob-v051-ios-release/Build/Products/Release-iphoneos/ACRCompanion.app`
  (approximately 27 MiB).
- Packaged plist: display name `ACR Companion`; bundle identifier
  `com.anonymous.acr-mobile-companion`; version `0.5.1`; build `43`; minimum iOS
  `13.4`.
- Embedded executable: 14,133,760 bytes; SHA-256
  `30d08d09784d7940228e5dc3b581d223f96fa328f97b8901e9e40858c594d57d`.
- Embedded `main.jsbundle`: 2,113,392 bytes; SHA-256
  `bfa96e061b20d187e927135633125fc71e4dd9bbcb30a08bf644a4603cc17273`.
- The packaged English, French and Simplified Chinese poster SHA-256 values
  exactly match the three accepted hashes recorded in **Baseline and inputs**.
- Signing remained the existing Apple Development/automatic-signing design.
  The embedded development profile has `get-task-allow = true` and expires
  `2026-08-26T20:37:19Z`. No signing team, certificate, entitlement or project
  signing setting was changed.
- The audited `.app` installed successfully over the existing application by
  USB; no uninstall or device-data erase occurred. A launch with Metro stopped
  succeeded, and the app is left launched for Kraken's physical review.
- The post-install device app record independently reports `ACR Companion`,
  bundle identifier `com.anonymous.acr-mobile-companion`, version `0.5.1`, build
  `43`, and identifies it as a developer app.

Repeat the twelve simulator actions on the physical iPhone:

| ID | Action | Expected result | Status |
| --- | --- | --- | --- |
| `IOS-SIM-01` (physical repeat) | Cold launch | Poster is first on iOS | `KRAKEN_ACCEPTED` |
| `IOS-SIM-02` (physical repeat) | Swipe upward | Existing Welcome appears | `KRAKEN_ACCEPTED` |
| `IOS-SIM-03` (physical repeat) | Leave Welcome for three seconds | Poster returns without freeze | `KRAKEN_ACCEPTED` |
| `IOS-SIM-04` (physical repeat) | Repeat three cycles | No stack growth or stale overlay | `KRAKEN_ACCEPTED` |
| `IOS-SIM-05` (physical repeat) | Select French | French poster appears next | `KRAKEN_ACCEPTED` |
| `IOS-SIM-06` (physical repeat) | Select Chinese | Chinese poster appears next | `KRAKEN_ACCEPTED` |
| `IOS-SIM-07` (physical repeat) | Select the other six locales | English poster appears; UI language remains selected | `KRAKEN_ACCEPTED` |
| `IOS-SIM-08` (physical repeat) | Arabic then English | RTL/LTR remains immediate and responsive | `KRAKEN_ACCEPTED` |
| `IOS-SIM-09` (physical repeat) | Hold language selector open beyond three seconds | Selector is not hidden or stranded | `KRAKEN_ACCEPTED` |
| `IOS-SIM-10` (physical repeat) | Enter About/assessment before timeout | No delayed redirect | `KRAKEN_ACCEPTED` |
| `IOS-SIM-11` (physical repeat) | Inspect About page 2 | `ACR Companion v0.5.1 (Build 43)` is visible | `KRAKEN_ACCEPTED` |
| `IOS-SIM-12` (physical repeat) | Check About, five assessment screens and Review | Existing functions remain intact | `KRAKEN_ACCEPTED` |

Then complete the physical-only checks:

| ID | Action | Expected result | Status |
| --- | --- | --- | --- |
| `IOS-PHY-13` | Launch with Metro stopped | Standalone Poster-first launch succeeds | `KRAKEN_ACCEPTED` |
| `IOS-PHY-14` | Disconnect from Mac and relaunch | App remains standalone and responsive | `KRAKEN_ACCEPTED` |
| `IOS-PHY-15` | Inspect installed-app metadata | Version `0.5.1`, build `43` | `KRAKEN_ACCEPTED` |

Kraken reported the complete physical repeat and all three physical-only checks
reviewed and accepted. Phase F is complete.

## Android synchronisation

### Release build and APK audit

- Kraken confirmed `/Volumes/AndroidDev` mounted and the Samsung S8 connected,
  unlocked and Developer Mode enabled. The mount was independently verified as
  `/dev/disk13s1`, with approximately 48 GiB free, and remained present through
  the build, audit, installation and launch below.
- Metro remained stopped; `lsof` found no TCP `8081` listener before build,
  before Samsung launch and after package audit.
- Exactly one authorised USB Android device was present: Samsung SM-G950F
  (Galaxy S8), Android 9 / API 28.
- The mandated command used the existing wrapper and exact low-memory flags:
  `caffeinate -d -i ./gradlew app:assembleRelease --no-daemon
  --max-workers=1 --no-parallel --no-configure-on-demand`. Result: exit `0`,
  `BUILD SUCCESSFUL in 4m 6s`; 849 actionable tasks (62 executed, 787
  up-to-date). The standard Gradle `preBuild` lifecycle task ran; the forbidden
  Expo Prebuild command did not run.
- The in-process Release bundling task embedded 804 modules and copied 11
  assets. It did not create a listening Metro development server.
- APK: `/Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/app-release.apk`.
- APK size: 73,442,983 bytes. SHA-256:
  `fdf3f294ccd696598797a9efe7f873afd94e5d621c45fb719a55a4fb47fe898e`.
- Packaged identity from Build Tools 34.0.0 `aapt2`: package
  `com.anonymous.acr_mobile_companion`, label `ACR Companion`, version name
  `0.5.1`, version code `43`, min SDK `23`, target/compile SDK `34`.
- `assets/index.android.bundle` is present, is Hermes bytecode version 96, and
  has SHA-256
  `975f75ddc7131fb26531585d69d1060be85a536a477d223ca713fe0f37b34e93`.
  Hermes native libraries are present for all four configured ABIs.
- All three poster resources are present. Their pre-package generated resource
  bytes exactly match the accepted English, French and Chinese hashes. Android
  resource optimisation shortened their APK paths and recompressed the PNG
  containers; exact decoded-pixel comparison between each packaged resource
  and its accepted input reported `0` differing pixels.
- Existing Android signing design was unchanged. `apksigner` verifies the APK
  under v1 and v2 schemes with the existing Android Debug certificate used by
  the accepted Release configuration.
- No dependency was installed, no PATH or signing configuration was changed,
  and no APK rebuild will occur between Samsung and Xiaomi.

### Samsung installation and launch

- Before replacement, the installed package was version `0.1.0`, code `42`.
- The explicit mounted-SDK ADB performed `install -r` on the audited APK and
  returned `Performing Streamed Install` / `Success`. No uninstall or device
  data erase occurred.
- After replacement, device package metadata reports version `0.5.1`, code
  `43`, min SDK `23`, target SDK `34`. The original first-install timestamp is
  unchanged, proving replacement rather than uninstall/reinstall.
- With Metro stopped, a cold launcher-category start succeeded. The app process
  is alive and `com.anonymous.acr_mobile_companion/.MainActivity` is the resumed
  activity, ready for Kraken's visual review.

| ID | Action | Expected result | Samsung status |
| --- | --- | --- | --- |
| `AND-SYNC-01` | Install/launch Release with Metro stopped | Standalone Poster-first launch succeeds | `KRAKEN_ACCEPTED` |
| `AND-SYNC-02` | Inspect About page 2 | `ACR Companion v0.5.1 (Build 43)` is visible | `KRAKEN_ACCEPTED` |
| `AND-SYNC-03` | Check packaged/installed metadata | Version `0.5.1`, code `43` | `KRAKEN_ACCEPTED` |
| `AND-SYNC-04` | Exercise Poster/Welcome loop | Accepted Android behaviour is unchanged | `KRAKEN_ACCEPTED` |
| `AND-SYNC-05` | Check eight locales and Arabic/LTR | Existing behaviour remains intact | `KRAKEN_ACCEPTED` |
| `AND-SYNC-06` | Check About, five assessment screens and Review | Existing functions remain intact | `KRAKEN_ACCEPTED` |

Kraken reported the complete Samsung checklist reviewed and accepted before
disconnecting Samsung and connecting Xiaomi.

### Actual AndroidDev dependency finding

The build used these actual external-volume inputs:

- `ANDROID_HOME` and `ANDROID_SDK_ROOT` both resolve to
  `/Volumes/AndroidDev/android-sdk`; there is no `android/local.properties`
  override.
- SDK Platform Android 14 / API 34 revision 3, Build Tools 34.0.0, NDK
  26.1.10909125 and CMake 3.22.1 reside under that SDK. The project explicitly
  selects these versions, and the build executed the native CMake task graph.
- `GRADLE_USER_HOME=/Volumes/AndroidDev/.gradle`. Wrapper Gradle 8.8 was loaded
  from the external wrapper distribution, and dependency/plugin caches were
  read from the external cache (approximately 4.8 GiB). The actual build
  single-use daemon used project-configured Temurin Java 21 with a 2 GiB heap;
  `./gradlew --status` afterward reports no Gradle daemons running.
- ADB is version 1.0.41 / platform-tools 37.0.1 and the executable used is
  `/Volumes/AndroidDev/android-sdk/platform-tools/adb`. The unchanged current
  PATH resolves only this ADB; checks of the standard local SDK/Homebrew paths
  found no alternative executable. Its dynamic dependencies are only macOS
  system libraries/frameworks.

Definitive finding: **building this APK requires AndroidDev for the current SDK
and Gradle setup. Installing the already-built identical APK does not require
Gradle, SDK Platform, Build Tools, NDK or CMake, but AndroidDev is still required
in this environment because it provides the only available ADB client.** Under
the explicit no-copy, no-relocation and no-PATH-change constraints, the volume
must therefore be mounted for the future Xiaomi installation. It remains
mounted for this execution.

### Xiaomi identical-APK installation

- Before the swap, the APK was rechecked at the same 73,442,983-byte size,
  SHA-256
  `fdf3f294ccd696598797a9efe7f873afd94e5d621c45fb719a55a4fb47fe898e`
  and original `2026-08-24T11:37:38+0200` build timestamp. No Gradle command or
  rebuild occurred.
- After Samsung was disconnected, exactly one authorised ADB device was
  present: Xiaomi MIX Fold 2, model `22061218C` / device `zizhan`, Android 15 /
  API 35.
- Its existing ACR package was version `0.1.0`, code `42`. The mounted-SDK ADB
  installed the exact APK above using `install -r` and returned `Performing
  Streamed Install` / `Success`; no uninstall or data erase occurred.
- Post-install device metadata reports version `0.5.1`, code `43`, with the
  original first-install timestamp preserved.
- Metro had no TCP `8081` listener. A cold launcher-category start succeeded;
  the app process is alive and Android 15 reports
  `com.anonymous.acr_mobile_companion/.MainActivity` with `mResumed=true` and
  `mStopped=false`. Xiaomi is left on the running app for Kraken's visual
  confirmation.
- AndroidDev remained mounted throughout the Xiaomi installation. The source
  APK hash was rechecked after launch and is unchanged.
- Kraken visually confirmed the standalone Poster-first screen displayed
  normally on Xiaomi and reported the checks complete. Xiaomi installation and
  launch are `KRAKEN_ACCEPTED`.

### Final audit

- Local HEAD and `origin/feature/mobile-v0.5.1-cross-platform-sync` remain
  `583e0febb2e0bcd8e87d36824453fc2df8b8007c` with divergence `0 0`.
  `ANDROID_ACCEPTED_SHA`
  `0402d979ffbb24f1478058e662b6a741bde6ffa5` remains an ancestor.
- The final changed-path inventory is exactly the 13 paths listed below. All
  are authorised by section 7; no package/lockfile, asset, locale, API, signing,
  identifier, mock-server, ontology or other protected path changed.
- Final reruns of `tests/poster/verify.js`, `tests/version/verify.js`,
  `tests/rtl/verify.js` and `tests/p1p2/verify.js` all exited `0`.
- `git diff --check` exits `0`. The pre-existing typecheck comparison and lint
  limitation remain exactly as recorded in **Automated verification**.
- The Android APK remains 73,442,983 bytes with its original
  `2026-08-24T11:37:38+0200` timestamp and SHA-256
  `fdf3f294ccd696598797a9efe7f873afd94e5d621c45fb719a55a4fb47fe898e`.
  It was not rebuilt between Samsung and Xiaomi.
- Metro remains stopped with no TCP `8081` listener. AndroidDev remains mounted
  at the end of execution. No commit, push, tag or branch creation occurred.

## Change inventory and correction budget

Current implementation inventory:

```text
android/app/build.gradle
app.json
ios/ACRCompanion.xcodeproj/project.pbxproj
ios/ACRCompanion/Info.plist
src/config/appIdentity.ts
src/navigation/AppNavigator.tsx
src/screens/AboutScreen.tsx
src/screens/ResultScreen.tsx
src/screens/ReviewScreen.tsx
src/screens/WelcomeScreen.tsx
tests/poster/verify.js
tests/version/verify.js
docs/MOB-V0.5.1-IOS-ANDROID-SYNC-001-Evidence-Report.md
```

Source-correction cycles used: `0 of 2`. Residual implementation defects:
none identified by automated verification or the Poster-first simulator
precheck. Kraken accepted the simulator, physical iPhone, Samsung Android and
Xiaomi standalone results. The identical APK was installed and launched on
Xiaomi without a rebuild. Next action: Kraken reviews this final evidence and,
if accepted, performs any desired commit/push actions outside this execution.
