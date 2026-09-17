# MOB-V0.5-ANDROID-POSTER-WELCOME-001

Revision: `1.0`

Status: `READY FOR CODEX EXECUTION`

## 1. Authority and execution boundary

- Sponsor, acceptance authority and release authority: Kraken.
- Implementer: OpenAI Codex in VS Code.
- Repository: `/Users/Kraken/DAPP/acr-mobile-companion`.
- Required branch: `feature/mobile-v0.5-android`.
- Controlling revision: `SESSION_BASELINE_SHA` supplied in Kraken's opening
  message.
- Accepted Android ancestor:
  `e5fa5e7ff3d1873728c6e5531faf142ef63a503e`.
- Codex may inspect, implement, test, build and, when an authorised Android
  device is connected, install and launch the Android application.
- Codex must not commit, push, merge, publish, deploy or create another branch.
- Codex must not ask Kraken for permission for each ordinary read-only command,
  source edit, verification command or authorised Android build step.

## 2. Objective

Add an Android-only poster screen immediately before the existing
`WelcomeScreen` without changing the existing assessment, About, Review,
language, RTL, clinical, API or inference behaviour.

Required user flow:

1. A cold launch from the Android application icon displays the poster screen
   first instead of the current `WelcomeScreen`.
2. An upward swipe/scroll on the poster screen displays the existing
   `WelcomeScreen`.
3. If the existing `WelcomeScreen` remains focused for three continuous
   seconds, the application returns to the poster screen.
4. The poster remains displayed until the user swipes/scrolls upward again.
5. This poster-to-Welcome loop can repeat without a crash, stale modal,
   navigation-stack growth or RTL/LTR leakage.
6. If the user navigates away from `WelcomeScreen` into About, assessment or
   another existing route before the timer expires, cancel the timer and do
   not redirect that later screen.
7. If the language selector is open, do not allow the timer to strand or hide
   the selector. Pause, defer or safely reset the timer using the smallest
   implementation consistent with the current component design.
8. The feature must not alter the iOS launch or Welcome behaviour.

## 3. Poster inputs and language mapping

The following three exact source files must exist before implementation:

```text
src/assets/posters/ACR_PLATFORM_One_Page_Intro_EN_v1.1_76SWRL.png
src/assets/posters/ACR_PLATFORM_One_Page_Intro_FR_v1.1_76SWRL.png
src/assets/posters/ACR_PLATFORM_One_Page_Intro_ZH-CN_v1.1_76SWRL.png
```

Poster selection must use the application's currently selected locale:

| Active locale | Poster asset |
| --- | --- |
| `fr-FR` | French poster |
| `zh-CN` | Chinese poster |
| `en-GB` | English poster |
| `ar-SA` | English poster |
| `de-DE` | English poster |
| `ja-JP` | English poster |
| `ko-KR` | English poster |
| `ru-RU` | English poster |
| Any missing, malformed or unsupported locale | English poster |

Use explicit static asset references compatible with the existing React
Native/Expo bundler. Do not construct a runtime filesystem path or download an
image from a network service.

## 4. Asset investigation and authorised optimisation

Before changing source code, Codex must inspect and record for each PNG:

- exact path and filename;
- file type;
- pixel dimensions;
- byte size;
- SHA-256;
- colour mode and transparency when the installed tools expose them;
- whether the file opens successfully and contains the expected language.

Codex is authorised to optimise or resize the runtime PNGs without pausing for
additional approval only when investigation demonstrates a material Android
package-size, decode-memory or rendering reason.

Any asset modification must satisfy all of these conditions:

- preserve the complete poster, language, wording, logos and visual meaning;
- preserve aspect ratio;
- do not crop, redraw, translate, regenerate or add content;
- retain sufficient resolution for the accepted phone and foldable layouts;
- use only tools already installed locally;
- do not install a package or use an online conversion service;
- record before/after dimensions, sizes and SHA-256 values;
- visually inspect the resulting file before using it;
- keep only runtime assets required by the application bundle.

If no modification is necessary, use the supplied PNGs unchanged and record
that decision. A source image of approximately 2 MB is not by itself a defect.

## 5. Permitted changes

Codex may make the minimum required changes within:

```text
src/navigation/
src/screens/
src/components/
src/utils/
src/assets/posters/
tests/
docs/MOB-V0.5-ANDROID-POSTER-WELCOME-001-Evidence-Report.md
```

Codex may update an existing active locale JSON file only if a short visible
accessibility label or instruction genuinely requires translation. Prefer no
new visible wording when the gesture is discoverable without it.

Shared React Native source may be edited only with an explicit, verified
Android runtime boundary so that iOS retains its current initial route and
Welcome behaviour.

## 6. Forbidden changes

Do not modify:

- `ios/`;
- native Android build or signing files under `android/`;
- `package.json` or any lockfile;
- Expo or application configuration;
- API, gateway, mock-server or network code;
- inference, ontology, SWRL, SQWRL, Openllet or clinical logic;
- attestation, governance or Result logic;
- the accepted two About pages;
- assessment field definitions, validation ranges or Review meaning;
- existing application icon or splash assets.

Do not:

- run Expo Prebuild;
- start Expo Go;
- add or install dependencies;
- fetch, pull, rebase, reset, clean or delete user files;
- use a cloud build, EAS, Google Play or an online image processor;
- place PNG files in `src/screens/` or `src/i18n/locales/`;
- convert the poster into hard-coded text or base64 source;
- begin mock-server/API-interface work in this session.

## 7. Phase A — Baseline gate

Read this instruction completely before taking any other action. Then verify:

1. current directory is the required repository;
2. current branch is exactly `feature/mobile-v0.5-android`;
3. local `HEAD` equals `SESSION_BASELINE_SHA`;
4. `origin/feature/mobile-v0.5-android` equals `SESSION_BASELINE_SHA` without
   fetching or pulling;
5. ahead/behind is `0 0`;
6. the working tree is clean;
7. accepted Android ancestor
   `e5fa5e7ff3d1873728c6e5531faf142ef63a503e` is an ancestor of `HEAD`;
8. all three exact PNG input files exist;
9. `/Volumes/AndroidDev` is mounted;
10. existing local dependencies and the accepted Android build environment are
    present without installation.

Stop with `BLOCKED_BASELINE` if any repository equality, ancestry, cleanliness
or required-input check fails. Do not repair Git state or invent a missing
asset.

## 8. Phase B — Bounded investigation

Inspect only what is needed to establish:

- how `AppNavigator` selects the current Android initial route;
- whether navigation state is persisted;
- how `WelcomeScreen` gains/loses focus;
- how the language selector opens, closes and changes the active locale;
- how Arabic direction changes are currently contained;
- how timers and cleanup are handled elsewhere in the app;
- the existing asset import convention;
- the existing test commands and accepted Android Release build command.

Return a short implementation decision before editing that identifies:

- the selected poster-screen component boundary;
- the Android-only route boundary;
- the upward-gesture mechanism;
- the timer lifecycle and modal safeguard;
- the locale-to-asset mapping location;
- whether the PNGs will remain unchanged or be optimised.

Proceed directly when the decision satisfies this script. Stop with
`BLOCKED_DESIGN` only if the existing architecture makes one of the stated
requirements materially unsafe or contradictory.

## 9. Phase C — Implementation

Implement the smallest coherent change that provides all required behaviour.

Mandatory implementation properties:

- the Android cold-launch initial route is the poster screen;
- iOS retains its existing initial route;
- the selected poster is derived from the active app locale using the table in
  section 3;
- an unsupported locale deterministically falls back to English;
- the poster uses safe-area-aware responsive layout;
- the complete poster is visible without distortion or loss of content;
- the implementation handles the Xiaomi folded and unfolded widths;
- one deliberate upward gesture moves from poster to the existing Welcome;
- the gesture is vertical and independent of RTL/LTR direction;
- the Welcome timer starts only while Welcome is focused;
- the timer is cancelled on blur, unmount or navigation away;
- no delayed callback can redirect About, assessment, Review or another route;
- language-selector use cannot leave a stale modal or frozen UI;
- returning to the poster reflects the newly selected language immediately;
- repeated looping does not push unlimited duplicate routes onto the stack;
- no network access is required to render a poster.

Do not rewrite the current navigation structure or Welcome screen when a small
route/component addition and bounded timer integration are sufficient.

## 10. Phase D — Automated verification

Run proportionate verification using only existing local tooling.

At minimum:

1. validate the exact eight-locale poster mapping and English fallback;
2. validate that the feature is explicitly Android-only;
3. validate timer cleanup and protection against redirecting a non-Welcome
   route, using the existing test framework where practical;
4. run the existing locale/RTL regression verification;
5. run the existing P1/P2 and validation regression verification;
6. run the configured typecheck before and after, or compare with the most
   recent accepted baseline diagnostics if a same-session pre-edit result was
   captured;
7. run configured lint only if its dependency and script already exist;
8. audit the exact changed-file inventory and protected paths;
9. run whitespace/diff validation;
10. confirm that no package, lockfile, configuration, `ios/`, `android/`, API,
    inference, attestation, governance or Result file changed.

Existing diagnostics may remain only when Codex proves they are identical to
the pre-edit baseline. Any new diagnostic caused by this task is a failure.
Do not install a missing linter.

## 11. Phase E — Android Release build

After Phase D passes:

1. confirm `/Volumes/AndroidDev` remains mounted;
2. keep Expo Go and Metro stopped;
3. use the exact existing successful local Android Release build route and
   accepted signing configuration discovered from repository evidence;
4. do not run Prebuild or mutate native/configuration files;
5. record the exact command, exit status, APK path, APK size and SHA-256;
6. prove that the three required poster assets are packaged and no remote asset
   fetch is needed;
7. if exactly one authorised target is visible through the existing ADB setup,
   Codex may install and launch the Release app on the Xiaomi MIX Fold 2 or
   Samsung Galaxy S8;
8. if no authorised device is connected, do not treat that as a source defect;
   stop at the physical-review-ready state with the APK preserved.

Do not uninstall an existing accepted build unless replacement installation
requires it and application-state loss is explicitly reported first.

## 12. Kraken physical acceptance checklist

| ID | Action | Expected result |
| --- | --- | --- |
| POSTER-01 | Cold-launch from Android application icon in English | English poster is the first screen; no Metro or network is required |
| POSTER-02 | Inspect and upward-swipe the poster | Full poster is undistorted; one upward gesture displays current Welcome |
| POSTER-03 | Leave Welcome focused for at least three seconds | App returns to the poster without freeze or stale overlay |
| POSTER-04 | Repeat poster → Welcome → poster three times | Every cycle succeeds without stack growth or degraded response |
| POSTER-05 | Select French on Welcome | Next poster display uses the French PNG |
| POSTER-06 | Select Chinese on Welcome | Next poster display uses the Chinese PNG |
| POSTER-07 | Select English, Arabic, German, Japanese, Korean and Russian | Each uses the English PNG; the chosen UI language itself remains correct |
| POSTER-08 | Exercise Arabic, then return to an LTR locale | RTL/LTR switching remains responsive and correct |
| POSTER-09 | Open language selector for longer than three seconds | Selector is not stranded, hidden or frozen by the timer |
| POSTER-10 | Enter About or assessment before timer expiry | Existing destination remains active; no delayed redirect to poster |
| POSTER-11 | Exercise both About pages and all five assessment screens | Existing accepted behaviour remains unchanged |
| POSTER-12 | Fold and unfold Xiaomi MIX Fold 2 on the poster | Poster remains complete, correctly scaled and usable |
| POSTER-13 | Force-close and relaunch with Metro stopped | Poster-first standalone launch succeeds using the selected-locale mapping |

Any unperformed physical item must be reported as `NOT_EVIDENCED`, not `PASS`.

## 13. Correction budget and stop conditions

Codex may complete up to two bounded source-correction cycles for defects
introduced by this task. Each cycle must record:

- expected result;
- actual result;
- reproduction evidence;
- files changed;
- verification rerun.

Stop before another correction if:

- a third source correction would be required;
- a protected file appears necessary;
- a package install, Prebuild, signing change or network build is required;
- an existing accepted function has materially regressed;
- an input poster is corrupt, incorrect or missing;
- baseline or Git state changes unexpectedly;
- a secret or credential would be exposed.

## 14. Required evidence report

Create:

```text
docs/MOB-V0.5-ANDROID-POSTER-WELCOME-001-Evidence-Report.md
```

The report must contain only useful implementation evidence:

- branch, full baseline SHA and accepted-ancestor result;
- pre-edit and final working-tree inventories;
- poster before/after dimensions, sizes and SHA-256 values;
- asset-modification decision and reason;
- implementation summary by requirement;
- exact changed files and purpose;
- automated commands with exit results;
- typecheck/lint comparison;
- protected-scope audit;
- Release command, exit result, APK path, size and SHA-256;
- physical checklist with `PASS`, `FAIL` or `NOT_EVIDENCED`;
- correction-cycle count;
- residual defects and next action.

Do not include unrelated project history or repeat this instruction script.

## 15. Legal terminal states

End with exactly one evidence-supported state:

- `BLOCKED_BASELINE`
- `BLOCKED_DESIGN`
- `BLOCKED_ASSET`
- `BLOCKED_IMPLEMENTATION`
- `BLOCKED_BUILD`
- `READY_FOR_KRAKEN_ANDROID_PHYSICAL_REVIEW`
- `EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE`

Only Kraken may accept the result, authorise commit/push or begin the separate
mock-server/API-interface task.

## 16. Opening message for the Codex session

```text
MOB-V0.5-ANDROID-POSTER-WELCOME-001

Repository:
/Users/Kraken/DAPP/acr-mobile-companion

Required branch:
feature/mobile-v0.5-android

SESSION_BASELINE_SHA:
<FULL_SHA_AFTER_THE_INSTRUCTION_AND_THREE_POSTERS_ARE_COMMITTED_AND_PUSHED>

Accepted Android ancestor SHA:
e5fa5e7ff3d1873728c6e5531faf142ef63a503e

Read the following instruction script completely before taking any action:

docs/MOB-V0.5-ANDROID-POSTER-WELCOME-001_v1.0.md

Treat SESSION_BASELINE_SHA from this opening instruction as the controlling
repository HEAD. Confirm that it equals both local HEAD and
origin/feature/mobile-v0.5-android, and confirm the accepted Android ancestor
is an ancestor of HEAD. Then execute the complete instruction script.

The three required poster PNG files are expected under
src/assets/posters/. The AndroidDev external volume will be mounted before
execution.

Do not commit, push, create a branch, install dependencies, run Prebuild or
begin mock-server/API work.
```
