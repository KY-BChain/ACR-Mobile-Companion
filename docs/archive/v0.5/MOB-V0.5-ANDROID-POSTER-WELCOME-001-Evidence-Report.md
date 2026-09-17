# MOB-V0.5-ANDROID-POSTER-WELCOME-001 Evidence Report

Revision: `1.1`  
Execution date: `2026-08-23`  
Status: `READY_FOR_KRAKEN_ANDROID_PHYSICAL_REVIEW`

## Baseline gate

- Repository: `/Users/Kraken/DAPP/acr-mobile-companion`
- Branch: `feature/mobile-v0.5-android`
- Local `HEAD`: `c8ac2bda1b15007c8f14292c50ee52023f5242d5`
- `origin/feature/mobile-v0.5-android`: `c8ac2bda1b15007c8f14292c50ee52023f5242d5`
- Ahead/behind: `0 0`
- Pre-edit working tree: clean
- Accepted Android ancestor: `e5fa5e7ff3d1873728c6e5531faf142ef63a503e` is an ancestor of `HEAD` (`git merge-base --is-ancestor` exit `0`).
- `/Volumes/AndroidDev` remained mounted at `/dev/disk3s1` during the build and Samsung installation.
- Accepted paths were present: external Android SDK, explicit ADB, external Gradle cache, local Expo binary and project Gradle wrapper.
- Environment: `ANDROID_HOME=/Volumes/AndroidDev/android-sdk`, `ANDROID_SDK_ROOT=/Volumes/AndroidDev/android-sdk`, `GRADLE_USER_HOME=/Volumes/AndroidDev/.gradle`; ADB `1.0.41`/`37.0.1`; Gradle `8.8`; project Java home is Temurin 21 as configured in the accepted Android project.

## Poster asset investigation

All three files opened correctly as non-interlaced 8-bit RGB PNGs. Visual inspection confirmed the complete ACR Platform one-page content, logos and wording in the named language.

| Required source | Language confirmed | Dimensions | Bytes | SHA-256 before/after |
| --- | --- | ---: | ---: | --- |
| `src/assets/posters/ACR_PLATFORM_One_Page_Intro_EN_v1.1_76SWRL.png` | English | 1024 × 1536 | 2,005,107 | `9f3cb6e22aba2316a19f109b22e90e50738114ee7f644647831716faae3a271d` |
| `src/assets/posters/ACR_PLATFORM_One_Page_Intro_FR_v1.1_76SWRL.png` | French | 1024 × 1536 | 2,142,397 | `0003a665a78688dd6eaf0962a00e8e50bc1469c5dff732926e419f36a6d6b896` |
| `src/assets/posters/ACR_PLATFORM_One_Page_Intro_ZH-CN_v1.1_76SWRL.png` | Simplified Chinese | 1024 × 1536 | 2,082,464 | `48ceb42d837498dc6bb00bd09e7148938c5dd574004d82a0a9b1f5477a66d437` |

Asset decision: no optimization. Each source is only approximately 2 MB, opens correctly, and has no demonstrated package-size, decode-memory or rendering defect. The source assets remain byte-identical. The Release resource copies have the same three SHA-256 values.

## Implementation decision

- Android-only boundary: `Platform.OS === 'android'` controls registration and the `Poster` initial route; iOS retains `Welcome` as its initial route.
- Route discipline: poster-to-Welcome and timer return both use `navigation.replace`, so the loop maintains one route rather than growing a stack.
- Responsive poster: a centered `Image` uses the source 2:3 aspect ratio, live window/safe-area dimensions and `resizeMode="contain"`; the complete poster remains undistorted across narrow and wide dimensions.
- Upward gesture: `PanResponder` captures only an upward-dominant vertical displacement, independent of locale direction.
- Timer: Android Welcome uses `useFocusEffect`; the 3,000 ms timeout exists only while focused, is cleared on dependency change/blur/unmount, confirms the route is still focused before replacement, and is suspended while the language modal is visible.
- Locale mapping: exact `fr-FR` maps to French, exact `zh-CN` maps to Chinese, and the other six supported locales plus missing/malformed/unsupported values map to English. All image references are literal local `require` calls.
- English wording: `welcome.description3` remains exactly: “The app does not intentionally store clinical data. Entries are held in memory for the current assessment only.”

## Gradle low-memory normalization

Effective properties contain exactly one active assignment each:

```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=false
org.gradle.daemon=false
org.gradle.configureondemand=false
```

Exact tracked diff: removed the earlier duplicate `org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m` assignment; no other Android property changed.

## Automated verification

| Check | Result |
| --- | --- |
| `node tests/poster/verify.js` | Exit `0`: eight-locale mapping, fallbacks, three static assets, contain rendering, vertical gesture, route replacement, Android-only initial route, focus timer cleanup and modal safeguard pass. |
| `node tests/rtl/verify.js` | Exit `0`: RTL direction matrix, language-change safeguards, reactive direction wiring, eight-locale parity and existing P1/P2 verifier pass. |
| `node tests/p1p2/verify.js` | Exit `0`: P1/P2, reset, navigation and About regressions pass for eight locales. |
| `npm run typecheck` before/after | Both retain the same 261 pre-existing diagnostics; logs are byte-identical with SHA-256 `87f54a78dd544ce2008d5f696cd9243ae9d28c72532200f1940c650ec639326d`. No new diagnostic. |
| `npm run lint` | Not run to completion: configured binary is absent (`eslint: command not found`, exit `127`). No dependency was installed. |
| `git diff --check` | Exit `0`. |

Pre-edit changed files: none.

Current intended changed files:

```text
android/gradle.properties
docs/MOB-V0.5-ANDROID-POSTER-WELCOME-001-Evidence-Report.md
src/navigation/AppNavigator.tsx
src/screens/PosterScreen.tsx
src/screens/WelcomeScreen.tsx
src/utils/posterLocale.ts
tests/poster/verify.js
```

Protected-scope audit: no package/lockfile, Expo/application configuration, iOS, API/gateway/mock-server, inference/clinical logic, attestation, governance, Result, icon or splash file changed. No tracked Android file other than `android/gradle.properties` changed.

## Release build

- Pinned Expo help documents `--no-bundler`, `--no-install`, and `--device [device]`, but the installed Android resolver treats a supplied value as an actual device name and has no `generic` target. The required Gradle fallback was selected.
- Only build command run:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion/android
caffeinate -d -i ./gradlew app:assembleRelease \
  --no-daemon \
  --max-workers=1 \
  --no-parallel \
  --no-configure-on-demand
```

- Result: exit `0`, `BUILD SUCCESSFUL in 5m 1s`; 849 actionable tasks, 58 executed and 791 up-to-date.
- Bundling: `Android Bundled` in 18,034 ms, 802 modules; bundle and sourcemaps written; 11 assets copied; Hermes compilation completed. No Metro listener existed on TCP port `8081` before or after the build.
- APK: `/Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/app-release.apk`
- APK bytes: `73,442,292`
- APK SHA-256: `a42da7a907fec41587d119cc177dbfa96aa62bfb2a2398b192199bbb83aee528`
- Embedded bundle: `assets/index.android.bundle`, 1,286,184 bytes.
- `aapt dump resources` proves all three poster drawable resources are present in the APK: English `0x7f0700e1`, French `0x7f0700e2`, Chinese `0x7f0700e3`.
- Verified application ID: `com.anonymous.acr_mobile_companion`; version code `42`, version name `0.1.0`.

## Device installation evidence

### Samsung Galaxy S8

- Redacted identifier: `ce12…1e05`
- Model: `SM-G950F`
- Android: `9`
- API: `28`
- Exactly one authorized ADB `device` was present before installation.
- Command: explicit mounted-SDK ADB `install -r` of the APK path above.
- Result: `Performing Streamed Install` then `Success`; existing application data retained.
- Launcher: `com.anonymous.acr_mobile_companion/.MainActivity` resolved from the installed package.
- Cold launch result: `Status: ok`; screenshot confirms the complete English poster is the first application screen. TCP port `8081` had no listener. The SanDisk remained mounted.
- Kraken sponsor review: confirmed the updated ACR Companion is installed as a standalone application; visual inspection of the new Welcome flow and amended English (UK) wording passed; all other functions worked as before and as expected. Samsung was then disconnected.

### Xiaomi MIX Fold 2

- Redacted identifier: `6b74…99b7`
- Model: `22061218C` (Xiaomi MIX Fold 2 / `zizhan`)
- Android: `15`
- API: `35`
- Samsung was absent and exactly one authorized Xiaomi ADB `device` was present before installation.
- The existing APK was not rebuilt. Its recalculated pre-install SHA-256 was `a42da7a907fec41587d119cc177dbfa96aa62bfb2a2398b192199bbb83aee528`, exactly matching the Phase E/Samsung artifact; size remained `73,442,292` bytes.
- Command: explicit mounted-SDK ADB `install -r` of the same APK path.
- Result: `Performing Streamed Install` then `Success`; existing application data retained.
- Installed package: application ID `com.anonymous.acr_mobile_companion`, version code `42`, version name `0.1.0`; launcher `com.anonymous.acr_mobile_companion/.MainActivity`.
- Explicit active-display cold launch: `Status: ok`, `LaunchState: COLD`; the process remained alive. Xiaomi exposes two physical displays while folded, so capture used the active outer display ID explicitly after a default capture included stale powered-off inner-display framebuffer content.
- Active outer-display screenshot (`1080 × 2520`) confirms the complete English poster is first, centered and undistorted. TCP port `8081` had no listener. The SanDisk remained mounted.
- After both installations and capture completion, ADB was closed successfully and the project wrapper confirmed no Gradle daemons were running. `/Volumes/AndroidDev` was not ejected and is ready for Kraken to eject when desired.

## Physical acceptance checklist

Unperformed actions are recorded as `NOT_EVIDENCED`.

| ID | Samsung Galaxy S8 | Xiaomi MIX Fold 2 |
| --- | --- | --- |
| `POSTER-01` | `PASS` — cold launch with Metro stopped reached the English poster first; Kraken confirmed standalone installation | `PASS` — explicit active-display cold launch with Metro stopped reached the complete English poster first |
| `POSTER-02` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-03` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-04` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-05` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-06` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-07` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-08` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-09` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-10` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-11` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |
| `POSTER-12` | Not applicable | `NOT_EVIDENCED` |
| `POSTER-13` | `NOT_EVIDENCED` | `NOT_EVIDENCED` |

## Corrections and residuals

- Source-correction cycles: `0`
- Residual defects introduced by this change: none identified by automated/build/both-device launch evidence.
- Residual evidence gap: the detailed Xiaomi folded/unfolded and remaining physical checklist actions require Kraken review. Samsung's broad sponsor review passed, but checklist rows not explicitly reported remain conservatively `NOT_EVIDENCED`.
