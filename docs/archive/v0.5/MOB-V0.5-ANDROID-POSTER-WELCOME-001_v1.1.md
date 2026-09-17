# MOB-V0.5-ANDROID-POSTER-WELCOME-001

Revision: `1.1`

Supersedes: `Revision 1.0 for execution`

Status: `READY FOR CODEX EXECUTION`

## 1. Control frame

- Sponsor, acceptance authority and release authority: Kraken.
- Implementer: OpenAI Codex in VS Code.
- Repository: `/Users/Kraken/DAPP/acr-mobile-companion`.
- Required branch: `feature/mobile-v0.5-android`.
- Controlling revision: `SESSION_BASELINE_SHA` supplied in Kraken's opening
  message after this v1.1 document is committed and pushed.
- Accepted Android ancestor:
  `e5fa5e7ff3d1873728c6e5531faf142ef63a503e`.
- Codex may inspect, implement, verify, build, install and launch the Android
  Release application within this script.
- Codex must not commit, push, merge, publish, deploy or create a branch.
- Codex must not request permission for each ordinary authorised command.

## 2. Objective

Add an Android-only poster screen immediately before the existing
`WelcomeScreen`, then produce one standalone Release APK and install that exact
APK sequentially on:

1. Samsung Galaxy S8; and
2. Xiaomi MIX Fold 2.

Metro must not be started. The Release APK must contain its JavaScript/Hermes
bundle and all three poster assets.

## 3. Required behaviour

1. Cold launch from the Android application icon displays the poster first.
2. An upward swipe/scroll displays the existing `WelcomeScreen`.
3. If Welcome remains focused for three continuous seconds, return to poster.
4. Poster remains until another upward swipe/scroll.
5. Repeating the loop must not grow duplicate routes, freeze the UI or leak
   RTL/LTR direction.
6. Navigating from Welcome to About, assessment or Review cancels the timer.
7. An open language selector must not be stranded or hidden by the timer.
8. iOS launch and Welcome behaviour must remain unchanged.

## 4. Poster assets and language mapping

Required exact files:

```text
src/assets/posters/ACR_PLATFORM_One_Page_Intro_EN_v1.1_76SWRL.png
src/assets/posters/ACR_PLATFORM_One_Page_Intro_FR_v1.1_76SWRL.png
src/assets/posters/ACR_PLATFORM_One_Page_Intro_ZH-CN_v1.1_76SWRL.png
```

| Active locale | Poster |
| --- | --- |
| `fr-FR` | French |
| `zh-CN` | Chinese |
| `en-GB`, `ar-SA`, `de-DE`, `ja-JP`, `ko-KR`, `ru-RU` | English |
| Missing, malformed or unsupported locale | English |

Use static local asset references. Do not download posters or construct runtime
filesystem paths.

## 5. Accepted English wording

The controlling `src/i18n/locales/en-GB.json` value is:

```json
"description3": "The app does not intentionally store clinical data. Entries are held in memory for the current assessment only."
```

Preserve this clinician-facing wording. Translation review of the other seven
locale values is outside this task.

## 6. Asset investigation and authority

Before source edits, record for each PNG:

- exact filename and path;
- file type and whether it opens correctly;
- pixel dimensions and byte size;
- SHA-256;
- visible language/content confirmation.

Codex may optimise a runtime PNG without another approval only if a material
package-size, decode-memory or rendering reason is demonstrated. Any change
must preserve the complete wording, language, logos, meaning and aspect ratio.
Do not crop, redraw, regenerate, translate or use an online service. Use only
installed local tools and record before/after evidence. Approximately 2 MB by
itself is not a defect.

## 7. Permitted files

Minimum necessary changes are permitted in:

```text
src/navigation/
src/screens/
src/components/
src/utils/
src/assets/posters/
tests/
android/gradle.properties
docs/MOB-V0.5-ANDROID-POSTER-WELCOME-001-Evidence-Report.md
```

`android/gradle.properties` is authorised only for the exact low-memory
normalisation in section 11. No other tracked file under `android/` may change.

## 8. Forbidden scope

Do not modify:

- `ios/`;
- any tracked Android file other than `android/gradle.properties`;
- package or lockfiles;
- Expo/application configuration;
- API, gateway, mock-server or network code;
- ontology, SWRL, SQWRL, Openllet, inference or clinical logic;
- attestation, governance or Result logic;
- About wording or assessment/Review meaning;
- application icon or splash assets.

Do not run Prebuild, Expo Go, EAS, a cloud build, Google Play, a dependency
installation or an online image processor. Do not begin mock-server/API work.

## 9. Phase A — Baseline gate

Read this entire document first. Without fetching or pulling, prove:

1. repository, branch and working directory are exact;
2. local `HEAD` equals `SESSION_BASELINE_SHA`;
3. `origin/feature/mobile-v0.5-android` equals `SESSION_BASELINE_SHA`;
4. ahead/behind is `0 0` and the working tree is clean;
5. accepted Android ancestor
   `e5fa5e7ff3d1873728c6e5531faf142ef63a503e` is an ancestor of `HEAD`;
6. all three PNGs exist at the required paths;
7. `/Volumes/AndroidDev` is mounted;
8. these existing paths are available without installation:

```text
/Volumes/AndroidDev/android-sdk/
/Volumes/AndroidDev/android-sdk/platform-tools/adb
/Volumes/AndroidDev/.gradle/
./node_modules/.bin/expo
./android/gradlew
```

9. `ANDROID_HOME`, `ANDROID_SDK_ROOT`, `GRADLE_USER_HOME`, Java and ADB resolve
   to the accepted local/external environment;
10. Samsung is connected by USB, unlocked, USB debugging enabled and shown as
    exactly one `device` rather than `offline` or `unauthorized`.

Stop with `BLOCKED_BASELINE` for a baseline, cleanliness, dependency, mount or
asset failure. Stop with `BLOCKED_S8_CONNECTION` only for the physical Samsung
connection; do not alter repository state to fix it.

## 10. Phase B — Investigation and implementation

Inspect only the relevant current navigation, Welcome focus lifecycle, language
selector, RTL containment, asset convention and tests. Record a short decision
covering:

- Android-only route boundary;
- poster component and responsive rendering;
- upward gesture;
- timer cleanup and language-modal safeguard;
- locale-to-static-asset mapping;
- asset optimisation decision.

Then implement the smallest coherent change with these invariants:

- Android cold launch starts on poster; iOS does not;
- poster is complete, undistorted and responsive on S8 and folded/unfolded
  Xiaomi widths;
- vertical gesture is independent of RTL/LTR;
- timer exists only while Welcome is focused and is cancelled on blur/unmount;
- no delayed callback can redirect another route;
- newly selected language controls the next poster immediately;
- no network is required for poster rendering;
- all current About, five assessment screens, Review and Arabic/LTR behaviour
  remain intact.

## 11. Phase C — Low-memory Gradle configuration

Inspect `android/gradle.properties` before editing. The effective project
configuration must contain exactly one active assignment for each of these
properties:

```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=false
org.gradle.daemon=false
org.gradle.configureondemand=false
```

Rules:

- if these exact effective values already exist once, do not edit the file;
- if a property is duplicated, normalise it to one assignment;
- if one is absent or different, apply the smallest edit to reach the block;
- do not append a second block;
- do not create `gradle.properties.backup` inside the repository;
- do not alter signing, SDK, repository, architecture or application settings;
- show the exact diff if the file changes.

The accepted Git baseline provides recovery; no in-repository backup copy is
needed.

## 12. Phase D — Automated verification

Using existing tooling only:

1. test the eight-locale poster mapping and English fallback;
2. verify the feature is Android-only;
3. verify timer cleanup and no redirect from a non-Welcome route where the
   existing test framework permits;
4. run existing RTL, locale and P1/P2 regression checks;
5. run configured typecheck before/after and prove no new diagnostic;
6. run lint only if already installed/configured;
7. audit exact changed files and protected scope;
8. confirm no package, lockfile, config, iOS, API, inference, attestation,
   governance or Result file changed;
9. run diff/whitespace validation.

Existing diagnostics may remain only when proved identical to the pre-edit
baseline. Do not install a missing linter.

## 13. Phase E — Metro-off low-memory Release build

Metro is not required for this Release build. Production JavaScript/Hermes and
static assets are embedded during compilation.

Before building:

1. identify any listener on Metro port `8081`;
2. stop it only if it is Expo/Metro;
3. stop lingering Gradle daemons using the project wrapper first;
4. kill a remaining Gradle process only after confirming it is not an active
   intentional build;
5. retain `/Volumes/AndroidDev` throughout both installations.

Use the local Expo binary and the proven Release route without dependency
installation:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion

caffeinate -d -i ./node_modules/.bin/expo run:android \
  --variant release \
  --no-bundler \
  --no-install \
  --device generic
```

First confirm that the installed local Expo CLI documents/supports
`--no-bundler`, `--no-install` and `--device generic`. If `--device generic` is
not supported for Android by this pinned local CLI, use the existing Gradle
wrapper build-only fallback instead of targeting a phone during compilation:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion/android

caffeinate -d -i ./gradlew app:assembleRelease \
  --no-daemon \
  --max-workers=1 \
  --no-parallel \
  --no-configure-on-demand
```

Do not run both build routes after one succeeds. Record which route was used,
full exit result and relevant bundling output.

After success, record:

```text
/Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/app-release.apk
```

Record APK byte size and SHA-256, prove all three posters were bundled, and
prove no process is listening on Metro port `8081`.

## 14. Phase F — Install on Samsung Galaxy S8

Use the exact APK built in Phase E. Resolve ADB explicitly from the mounted SDK:

```text
/Volumes/AndroidDev/android-sdk/platform-tools/adb
```

Before installation, confirm exactly one authorised device and record only a
redacted device identifier, model, Android version and API level.

Install as an update so existing application data is retained:

```zsh
/Volumes/AndroidDev/android-sdk/platform-tools/adb install -r \
  /Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/app-release.apk
```

Require `Success`. If installation reports a signature conflict, downgrade,
insufficient storage or another failure, stop with the exact error. Do not
uninstall the existing app or erase its data.

Launch the installed application using its verified application ID. Confirm it
starts with Metro stopped and reaches the poster. Then stop at:

`READY_FOR_KRAKEN_S8_REVIEW_AND_DEVICE_SWITCH`

Kraken will perform the S8 review, disconnect only the S8, connect/unlock the
Xiaomi MIX Fold 2 and confirm USB debugging. Keep the SanDisk mounted.

## 15. Phase G — Install the same APK on Xiaomi MIX Fold 2

Continue in the same Codex session. Do not rebuild.

1. confirm Samsung is absent;
2. confirm exactly one authorised device is now the Xiaomi;
3. record a redacted identifier, model, Android version and API level;
4. recalculate the APK SHA-256 and prove it equals the Phase E/S8 APK;
5. install with the same `adb install -r` command;
6. require `Success` and launch by verified application ID;
7. confirm standalone poster-first launch with Metro stopped.

Do not uninstall or erase application data on an install failure.

Only after both installations and evidence capture may Codex stop ADB/Gradle
processes and report that the external volume is ready for Kraken to eject.
Codex must not physically or programmatically eject it without Kraken.

## 16. Physical acceptance checklist

Perform on both phones unless a row names Xiaomi only:

| ID | Action | Expected result |
| --- | --- | --- |
| `POSTER-01` | Cold-launch with Metro stopped | Correct poster is first and app is standalone |
| `POSTER-02` | Inspect and swipe upward | Poster is complete/undistorted; Welcome appears |
| `POSTER-03` | Keep Welcome focused for three seconds | Poster returns without freeze or overlay |
| `POSTER-04` | Repeat three cycles | No stack growth or degraded response |
| `POSTER-05` | Select French | French poster appears next |
| `POSTER-06` | Select Chinese | Chinese poster appears next |
| `POSTER-07` | Select the other six locales | English poster appears; selected UI language remains correct |
| `POSTER-08` | Exercise Arabic then an LTR locale | RTL/LTR remains responsive and correct |
| `POSTER-09` | Keep language selector open beyond three seconds | No hidden, stale or frozen selector |
| `POSTER-10` | Enter About/assessment before timeout | No delayed poster redirect |
| `POSTER-11` | Check About, five assessment screens and Review | Accepted behaviour remains unchanged |
| `POSTER-12` | Xiaomi folded and unfolded | Poster and controls remain usable in both forms |
| `POSTER-13` | Disconnect phone from Mac and relaunch | Standalone launch succeeds without Metro |

Unperformed items are `NOT_EVIDENCED`, never `PASS`.

## 17. Evidence report and corrections

Create/update only:

```text
docs/MOB-V0.5-ANDROID-POSTER-WELCOME-001-Evidence-Report.md
```

Record:

- branch, full baseline SHA and accepted-ancestor result;
- exact pre-edit/final changed files;
- poster dimensions, sizes and SHA-256 before/after;
- implementation decisions and asset decision;
- automated command/exit posture and protected-scope audit;
- effective Gradle memory settings and any exact diff;
- Release command/result, APK path, size and SHA-256;
- proof Metro port `8081` was not serving;
- redacted S8/Xiaomi device evidence and both install results;
- checklist results;
- correction-cycle count and residual defects.

Maximum: two bounded source-correction cycles for defects introduced here.
Stop before a third correction, protected-scope expansion, dependency install,
Prebuild, signing change, destructive uninstall or unexpected Git change.

## 18. Legal terminal states

End with exactly one supported state:

- `BLOCKED_BASELINE`
- `BLOCKED_S8_CONNECTION`
- `BLOCKED_IMPLEMENTATION`
- `BLOCKED_BUILD`
- `BLOCKED_S8_INSTALL`
- `READY_FOR_KRAKEN_S8_REVIEW_AND_DEVICE_SWITCH`
- `BLOCKED_XIAOMI_CONNECTION`
- `BLOCKED_XIAOMI_INSTALL`
- `READY_FOR_KRAKEN_ANDROID_PHYSICAL_REVIEW`
- `EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE`

Only Kraken accepts the result and authorises commit/push or the later
mock-server/API task.

## 19. Opening message for Codex

```text
MOB-V0.5-ANDROID-POSTER-WELCOME-001 — Revision 1.1

Repository:
/Users/Kraken/DAPP/acr-mobile-companion

Required branch:
feature/mobile-v0.5-android

SESSION_BASELINE_SHA:
<FULL_SHA_AFTER_REVISION_1.1_IS_COMMITTED_AND_PUSHED>

Accepted Android ancestor SHA:
e5fa5e7ff3d1873728c6e5531faf142ef63a503e

Read this instruction completely before acting:
docs/MOB-V0.5-ANDROID-POSTER-WELCOME-001_v1.1.md

Confirm SESSION_BASELINE_SHA equals local HEAD and
origin/feature/mobile-v0.5-android, with 0/0 divergence and a clean tree.
Confirm the accepted Android SHA is an ancestor. Then execute the complete
instruction without per-command permission prompts.

The AndroidDev SanDisk and Samsung Galaxy S8 are connected. Keep the SanDisk
mounted through both device installations. Metro must remain stopped. Build
one Release APK, install it first on Samsung, pause for Kraken's physical device
switch, then install that identical APK on Xiaomi without rebuilding.

Do not commit, push, create a branch, install dependencies, run Prebuild,
uninstall an existing app, erase device data or begin mock-server/API work.
```
