# MOB-V0.5.1-IOS-ANDROID-SYNC-001

Revision: `1.0`

Status: `READY FOR KRAKEN PREPARATION AND CODEX EXECUTION`

## 1. Objective

Synchronise the accepted Android and iOS ACR Companion applications at one
versioned source baseline and deliver matching standalone builds.

The completed outcome must provide:

- the accepted poster-first Welcome flow on Android and iOS;
- identical poster language mapping and three-second Welcome loop;
- the accepted clinician-facing English wording;
- one application version: `0.5.1`;
- one cross-platform build identity: `43`;
- an in-app label: `ACR Companion v0.5.1 (Build 43)`;
- a standalone iOS build on iPhone 13 with Metro stopped;
- a rebuilt standalone Android APK carrying the same version identity;
- evidence that existing About, assessment, Review, language and RTL/LTR
  behaviour remains intact.

## 2. Repository and branch preparation by Kraken

Repository:

```text
/Users/Kraken/DAPP/acr-mobile-companion
```

The new branch must be created from the latest committed and pushed
`feature/mobile-v0.5-android` branch, not from `main` and not from the older
iOS/P1P2 branch.

Required new branch:

```text
feature/mobile-v0.5.1-cross-platform-sync
```

Preparation sequence:

1. Confirm `feature/mobile-v0.5-android` is current, clean and equal to its
   origin branch.
2. Record its full HEAD as `ANDROID_ACCEPTED_SHA`.
3. Create `feature/mobile-v0.5.1-cross-platform-sync` from that exact commit in
   GitHub Desktop.
4. Save this instruction at:

```text
docs/MOB-V0.5.1-IOS-ANDROID-SYNC-001_v1.0.md
```

5. Commit and publish the new branch.
6. Record its resulting full HEAD as `SESSION_BASELINE_SHA`.
7. Do not embed either dynamic SHA into this committed document. Supply both in
   the Codex opening message in section 21.

## 3. Authority

- Sponsor, acceptance authority and release authority: Kraken.
- Implementer: OpenAI Codex in VS Code.
- Codex may inspect, edit, verify, build, install and launch within this script.
- Codex must not commit, push, merge, publish, deploy or create a branch.
- Codex must not ask for approval for each ordinary authorised command.
- Kraken performs physical-device actions, visual acceptance and final GitHub
  commit/push.

## 4. Controlling version identity

The target identity is fixed for this Loop:

| Field | Required value |
| --- | --- |
| Product name | `ACR Companion` |
| Marketing/application version | `0.5.1` |
| Android `versionName` | `0.5.1` |
| Android `versionCode` | `43` |
| iOS short version | `0.5.1` |
| iOS build number | `43` |
| In-app display | `ACR Companion v0.5.1 (Build 43)` |

The in-app label must appear unobtrusively at the bottom of the final existing
About page. It must be readable in all eight locales without adding a new
translation requirement. Do not describe ACR Platform poster version `v2.0`
as the mobile application version.

Use one canonical application-version source where the existing Expo/native
architecture permits it. The visible label must derive from existing runtime
application metadata or the canonical configuration, not from an unrelated
second manually maintained value.

Do not add a dependency merely to read the application version. If the current
installed Expo modules do not expose suitable metadata, use the smallest local
source/configuration approach and prove all platform values match.

## 5. Accepted shared functionality to preserve

- Home/Welcome and two About pages;
- Step 1, Step 2, Step 3, P1 and P2;
- Review flow using synthetic/demo inputs;
- eight locales: `en-GB`, `fr-FR`, `zh-CN`, `ar-SA`, `de-DE`, `ja-JP`,
  `ko-KR`, `ru-RU`;
- Arabic RTL and immediate return to LTR;
- Android standalone launch with embedded Hermes bundle;
- the app does not intentionally store clinical data; entries remain in memory
  only for the current assessment;
- no mobile inference, ontology, SWRL/Openllet or clinical Result logic.

The accepted English wording is:

```json
"description3": "The app does not intentionally store clinical data. Entries are held in memory for the current assessment only."
```

## 6. Poster parity requirements

Both Android and iOS must use the existing three local assets:

```text
src/assets/posters/ACR_PLATFORM_One_Page_Intro_EN_v1.1_76SWRL.png
src/assets/posters/ACR_PLATFORM_One_Page_Intro_FR_v1.1_76SWRL.png
src/assets/posters/ACR_PLATFORM_One_Page_Intro_ZH-CN_v1.1_76SWRL.png
```

| Active locale | Poster |
| --- | --- |
| `fr-FR` | French |
| `zh-CN` | Simplified Chinese |
| Other six active locales | English |
| Missing/malformed/unsupported locale | English |

Required iOS behaviour must match the accepted Android flow:

1. cold launch begins on Poster;
2. one upward vertical gesture replaces Poster with Welcome;
3. Welcome returns to Poster after three continuous focused seconds;
4. the timer pauses/defers safely while the language selector is open;
5. leaving Welcome cancels the timer;
6. route replacement prevents navigation-stack growth;
7. the latest selected language controls the next poster;
8. the whole poster remains centered, undistorted and safe-area aware.

The existing Android implementation must remain functionally unchanged while
the Android-only boundary is extended to iOS.

## 7. Permitted changes

Codex may change only the minimum necessary files in:

```text
app.json or the existing canonical Expo application configuration
src/navigation/
src/screens/
src/components/
src/utils/
src/config/                         only if a version helper is necessary
src/i18n/locales/                   only if preserving an existing key/value
tests/
ios/                               version/build metadata only
android/                           version metadata only
docs/MOB-V0.5.1-IOS-ANDROID-SYNC-001-Evidence-Report.md
```

Native changes are limited to existing version/build fields required because
the tracked native projects already exist and Prebuild is forbidden. Existing
signing may be used but must not be redesigned.

## 8. Forbidden scope

Do not:

- run Expo Prebuild;
- install or upgrade packages, Pods, Expo, Gradle, Android SDK or Xcode tools;
- modify package or lockfiles unless an already-present root package version is
  proven to be a controlling application-version field;
- change application/bundle identifiers;
- change signing teams, certificates, provisioning design or keystores;
- modify API, gateway, mock-server or network behaviour;
- modify ontology, SWRL, SQWRL, Openllet, inference or clinical logic;
- modify attestation, governance or Result meaning;
- modify poster content or optimise the accepted poster files again;
- use Expo Go, EAS, TestFlight, App Store or Google Play distribution;
- commit, push, merge, tag or publish;
- delete caches, DerivedData, Pods, Gradle caches or user files automatically;
- begin the separate mock-server/API-interface task.

## 9. Phase A — Baseline and environment gate

Read this document completely. Without fetching or pulling, prove:

1. repository path is exact;
2. branch is `feature/mobile-v0.5.1-cross-platform-sync`;
3. local `HEAD` and the matching origin branch both equal
   `SESSION_BASELINE_SHA`;
4. divergence is `0 0` and the working tree is clean;
5. `ANDROID_ACCEPTED_SHA` is an ancestor of `HEAD`;
6. the three poster files exist with the accepted hashes recorded by the
   Android evidence report;
7. native `ios/` and `android/` projects, iOS workspace, Pods, node modules and
   local Expo are present;
8. Xcode exposes the installed iPhone 16e / iOS 26.3 simulator;
9. enough internal free space exists for one iOS Simulator build and one
   physical Release build;
10. `/Volumes/AndroidDev` is mounted before the later Android build gate.

Stop with `BLOCKED_BASELINE` for repository, ancestry, cleanliness or input
failure. Stop with `BLOCKED_ENVIRONMENT` for a missing accepted local toolchain
or insufficient build space. Do not repair by installing or deleting.

## 10. Phase B — Version and platform audit

Before editing, identify and report:

- every current application version/build value in Expo configuration;
- Android `versionName` and `versionCode` source and packaged values;
- iOS short-version/build-number source and packaged values;
- any conflicting hard-coded version label in source or posters;
- current `Poster` registration and initial-route platform guard;
- current Welcome timer platform guard;
- how About page 2 can read/display application metadata using installed code;
- exact iOS workspace, scheme and bundle identifier;
- existing iOS signing configuration without exposing credentials;
- existing Android Release task and low-memory configuration.

Return a compact implementation decision identifying the canonical version
source and exact metadata files to synchronise. Stop with
`BLOCKED_VERSION_DESIGN` if two controlling sources cannot be reconciled
without Prebuild, a dependency or a material native/configuration redesign.

## 11. Phase C — Implement cross-platform parity and versioning

Implement the smallest coherent change that:

1. extends Poster route registration and initial routing to Android and iOS,
   but not unsupported platforms;
2. extends the focus timer and cleanup to iOS without changing accepted Android
   behaviour;
3. preserves the vertical gesture independently of RTL/LTR;
4. sets all controlling marketing versions to `0.5.1`;
5. sets Android version code and iOS build number to `43`;
6. displays `ACR Companion v0.5.1 (Build 43)` on About page 2;
7. derives the displayed values from the selected canonical metadata source;
8. leaves all eight locale values and accepted clinical-facing wording intact;
9. preserves application/bundle identifiers and signing configuration;
10. creates no network, storage, API or inference dependency.

Do not solve versioning by copying the same literal into multiple unrelated
source files unless native platform metadata requires separate fields. Tests
must prove all required platform fields agree.

## 12. Phase D — Automated verification

Using installed tooling only:

1. extend/run poster tests for both Android and iOS;
2. verify all eight poster mappings and English fallback;
3. verify timer focus cleanup, modal safeguard and stack replacement;
4. run current RTL and P1/P2 regression checks;
5. add/run a version consistency check covering Expo, Android, iOS and the
   in-app source;
6. verify the expected identity is exactly `0.5.1` / `43`;
7. run typecheck before and after and prove no new diagnostic;
8. run lint only when already installed/configured;
9. audit exact changed files and protected paths;
10. run diff/whitespace validation.

Existing diagnostics may remain only if the before/after outputs are identical.
Do not install a missing linter.

## 13. Phase E — iPhone 16e simulator gate

Launch the actual app on the installed iPhone 16e / iOS 26.3 simulator using
the existing local simulator route. Metro may be used for this simulator review
only. Do not run Prebuild.

Leave the simulator and Metro running for Kraken when the app reaches Poster.
Stop at:

```text
READY_FOR_KRAKEN_IOS_SIMULATOR_REVIEW
```

Kraken must report the simulator checklist before Codex begins the physical
iPhone Release gate.

## 14. iOS simulator checklist

| ID | Action | Expected result |
| --- | --- | --- |
| `IOS-SIM-01` | Cold launch | Poster is first on iOS |
| `IOS-SIM-02` | Swipe upward | Existing Welcome appears |
| `IOS-SIM-03` | Leave Welcome for three seconds | Poster returns without freeze |
| `IOS-SIM-04` | Repeat three cycles | No stack growth or stale overlay |
| `IOS-SIM-05` | Select French | French poster appears next |
| `IOS-SIM-06` | Select Chinese | Chinese poster appears next |
| `IOS-SIM-07` | Select the other six locales | English poster appears; UI language remains selected |
| `IOS-SIM-08` | Arabic then English | RTL/LTR remains immediate and responsive |
| `IOS-SIM-09` | Hold language selector open beyond three seconds | Selector is not hidden or stranded |
| `IOS-SIM-10` | Enter About/assessment before timeout | No delayed redirect |
| `IOS-SIM-11` | Inspect About page 2 | `ACR Companion v0.5.1 (Build 43)` is visible |
| `IOS-SIM-12` | Check About, five assessment screens and Review | Existing functions remain intact |

Unperformed items are `NOT_EVIDENCED`, never `PASS`.

## 15. Phase F — Physical iPhone 13 standalone Release

After Kraken accepts the simulator:

1. stop Metro and prove no listener remains on port `8081`;
2. connect and unlock physical iPhone 13 / iOS 26.6.1 by cable;
3. confirm trust/pairing and Developer Mode; Kraken performs any phone action;
4. use the existing Xcode workspace, scheme and signing configuration;
5. build Release locally without Prebuild, dependency installation or cloud
   service;
6. allow Xcode's in-process Expo export/embed phase; do not start a listening
   Metro development server;
7. install and launch the signed app from its normal icon;
8. verify packaged version `0.5.1`, build `43`, embedded bundle and three poster
   assets;
9. record build product path, relevant bundle/executable hashes, signing type
   and profile expiry without exposing credentials;
10. leave the phone ready for Kraken's physical review.

If Xcode requires a tracked signing/project change, stop with
`BLOCKED_IOS_SIGNING` before applying it. A temporary personal-team profile and
its expiry are acceptable; redesigning signing is not.

## 16. iPhone physical checklist

Repeat `IOS-SIM-01` through `IOS-SIM-12` on the physical iPhone, then:

| ID | Action | Expected result |
| --- | --- | --- |
| `IOS-PHY-13` | Launch with Metro stopped | Standalone Poster-first launch succeeds |
| `IOS-PHY-14` | Disconnect from Mac and relaunch | App remains standalone and responsive |
| `IOS-PHY-15` | Inspect installed-app metadata | Version `0.5.1`, build `43` |

Stop at `READY_FOR_KRAKEN_IPHONE_PHYSICAL_REVIEW` until Kraken reports results.

## 17. Phase G — Android version-synchronisation build

After iPhone acceptance, verify `/Volumes/AndroidDev` is mounted and keep Metro
stopped. Re-run the accepted low-memory Android Release build using the existing
Gradle wrapper:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion/android

caffeinate -d -i ./gradlew app:assembleRelease \
  --no-daemon \
  --max-workers=1 \
  --no-parallel \
  --no-configure-on-demand
```

Require exit `0`. Record APK path, byte size and SHA-256. Verify packaged:

- version name `0.5.1`;
- version code `43`;
- embedded Hermes bundle;
- all three posters;
- no Metro listener.

If exactly one authorised Samsung or Xiaomi device is connected, Codex may use
the explicit external-SDK ADB with `install -r`. Do not uninstall or erase app
data on signature/version failure. The same APK must be used for both devices;
do not rebuild between installations.

## 18. Android synchronisation checklist

| ID | Action | Expected result |
| --- | --- | --- |
| `AND-SYNC-01` | Install/launch Release with Metro stopped | Standalone Poster-first launch succeeds |
| `AND-SYNC-02` | Inspect About page 2 | `ACR Companion v0.5.1 (Build 43)` is visible |
| `AND-SYNC-03` | Check packaged/installed metadata | Version `0.5.1`, code `43` |
| `AND-SYNC-04` | Exercise Poster/Welcome loop | Accepted Android behaviour is unchanged |
| `AND-SYNC-05` | Check eight locales and Arabic/LTR | Existing behaviour remains intact |
| `AND-SYNC-06` | Check About, five assessment screens and Review | Existing functions remain intact |

Physical items not performed are `NOT_EVIDENCED`. A successful Android package
metadata audit is still required even if device installation is deferred.

## 19. Evidence report and correction budget

Create:

```text
docs/MOB-V0.5.1-IOS-ANDROID-SYNC-001-Evidence-Report.md
```

Record only implementation evidence:

- branch, `ANDROID_ACCEPTED_SHA`, `SESSION_BASELINE_SHA` and ancestry;
- pre-edit and final changed-file inventories;
- version audit before/after and canonical-source decision;
- exact version-related configuration/native diffs;
- cross-platform Poster/Welcome implementation diff;
- automated commands and exit results;
- typecheck/lint comparison and protected-scope audit;
- iOS simulator checklist;
- physical iPhone build, installation and checklist;
- Android APK build identity and checklist;
- artifact paths, version values and hashes;
- correction-cycle count, residual defects and next action.

Maximum: two bounded source-correction cycles for defects introduced here.
Stop before a third correction, dependency installation, Prebuild, destructive
device uninstall, signing redesign or scope expansion.

## 20. Legal terminal states

End with exactly one supported state:

- `BLOCKED_BASELINE`
- `BLOCKED_ENVIRONMENT`
- `BLOCKED_VERSION_DESIGN`
- `BLOCKED_IMPLEMENTATION`
- `READY_FOR_KRAKEN_IOS_SIMULATOR_REVIEW`
- `BLOCKED_IOS_SIGNING`
- `BLOCKED_IOS_BUILD`
- `BLOCKED_IPHONE_CONNECTION`
- `READY_FOR_KRAKEN_IPHONE_PHYSICAL_REVIEW`
- `BLOCKED_ANDROID_BUILD`
- `READY_FOR_KRAKEN_CROSS_PLATFORM_REVIEW`
- `EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE`

Only Kraken accepts, commits, pushes, tags or authorises the later mock-server/
API-interface session.

## 21. Opening message for Codex

```text
MOB-V0.5.1-IOS-ANDROID-SYNC-001

Repository:
/Users/Kraken/DAPP/acr-mobile-companion

Required branch:
feature/mobile-v0.5.1-cross-platform-sync

ANDROID_ACCEPTED_SHA:
<FULL_HEAD_OF_ACCEPTED_FEATURE_MOBILE_V0.5_ANDROID>

SESSION_BASELINE_SHA:
<FULL_HEAD_AFTER_NEW_BRANCH_AND_THIS_INSTRUCTION_ARE_COMMITTED_AND_PUSHED>

Read this instruction completely before acting:
docs/MOB-V0.5.1-IOS-ANDROID-SYNC-001_v1.0.md

Confirm SESSION_BASELINE_SHA equals local HEAD and
origin/feature/mobile-v0.5.1-cross-platform-sync with 0/0 divergence and a
clean tree. Confirm ANDROID_ACCEPTED_SHA is an ancestor of HEAD. Then execute
the complete instruction without per-command permission prompts.

Target application identity:
ACR Companion v0.5.1 (Build 43)

Synchronise the accepted Poster/Welcome feature on iOS, preserve Android,
verify the iPhone 16e / iOS 26.3 simulator, build/install the standalone Release
on physical iPhone 13 / iOS 26.6.1 with Metro stopped, then rebuild Android
Release with matching version metadata.

Do not commit, push, create a branch, install dependencies, run Prebuild,
redesign signing, uninstall existing apps, erase device data or begin
mock-server/API work.
```
