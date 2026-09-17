# MOB-P1P2-AR-RTL-FREEZE-FIX-001 Evidence Report

## 1. Terminal state

`EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE`

The Arabic freeze correction passed automated checks, Kraken's simulator
acceptance, and Kraken's complete PHY-01 through PHY-11 physical Release review
on iPhone 13 / iOS 26.6.1. The standalone app launches with Metro stopped, and
the final protected-scope/repository audit passes. Kraken's acceptance and later
Git commit remain intentionally unperformed.

## 2. Baseline

- Repository: `/Users/Kraken/DAPP/acr-mobile-companion`
- Required and actual branch: `feature/mobile-v0.5-p1-p2`
- `SESSION_BASELINE_SHA`: `2a49ce5555003fb71e61d3bdc3d2fda47e194703`
- Local `HEAD`: `2a49ce5555003fb71e61d3bdc3d2fda47e194703`
- Local `origin/feature/mobile-v0.5-p1-p2`: `2a49ce5555003fb71e61d3bdc3d2fda47e194703`
- Ahead/behind: `0 0`
- Initial working tree: completely clean, including untracked files
- Post-investigation diff: only
  `A docs/MOB-P1P2-AR-RTL-FREEZE-FIX-001.md`

All Phase A commands exited `0`. Initial porcelain output was empty.

## 3. Accepted ancestors

Each command exited `0`:

```text
git merge-base --is-ancestor e0d4c8b5dadfa16bf37d63071150edaae9449a6a HEAD
git merge-base --is-ancestor 8196e135e600d75ae891645587ad2dc7536dc303 HEAD
git merge-base --is-ancestor 2a300a1ee67e2c1f43bf53ea01779dbe92bb9e2c HEAD
```

## 4. Confirmed pre-edit failure path

The active source matched the accepted investigation:

```text
WelcomeScreen.handleSelectLanguage
  -> await changeLanguage(code)
  -> i18n.changeLanguage(lang)
  -> I18nManager.allowRTL/forceRTL
  -> Updates.reloadAsync()
  -> modal dismissal only after the awaited call
```

`src/i18n/config.ts` also mutated native RTL state during Arabic device-locale
startup. `src/utils/rtl.ts` contained a second, unused native mutation helper.
Active About, assessment, and Review styles read `I18nManager.isRTL` at module
initialisation rather than deriving direction reactively from i18next.

## 5. DD-AR-RTL-001 implementation summary

### Proposal

Remove process reload and native direction mutation, make direction a pure
consequence of the active locale, close the selector before the awaited change,
and apply that direction at the shared presentation boundary and affected
screen text/layout points.

### Pre-edit shared-component scope evidence

`src/components/ScreenLayout.tsx` is the single additional shared
presentation-only component admitted under section 7.1 before it is edited.

- Direct usage: `WelcomeScreen`, `AboutScreen`, `Step1ReceptorsScreen`,
  `Step2TumourScreen`, `Step3MarkersScreen`, `P1Screen`, `P2Screen`, and
  `ReviewScreen` all render `ScreenLayout` directly.
- Necessity: `ScreenLayout` owns the common root plus header, banner, body,
  step-indicator, and footer boundary. The listed screens cannot coherently set
  one locale direction for that shared boundary without duplicating a wrapper
  across every screen and leaving the shared composition itself unaware of
  locale changes.
- Boundary: its planned change is presentation-only: subscribe to the active
  i18next locale and apply an explicit `ltr`/`rtl` root direction. It will not
  change navigation, assessment state, wording, API, inference, attestation,
  Result, storage, or clinical behaviour.

`App.tsx` is not required because the navigator, shared layout, and affected
screens can subscribe directly to i18next changes.

### Actual action, result, and why

- Removed `expo-updates`, `I18nManager`, startup native RTL mutation, and the
  Release reload branch from the active i18n configuration. `changeLanguage`
  now awaits exactly one i18next language change and propagates rejection.
- Replaced the unused native-mutation utility with pure locale direction,
  alignment, and row-direction helpers. `ar-SA` and i18next base form `ar` are
  RTL; all other registered locales are LTR.
- The Welcome handler now guards duplicate taps, dismisses the modal before its
  awaited language change, and reports genuine failures through `console.error`
  while releasing the guard in `finally`.
- Applied locale-derived direction reactively at `ScreenLayout`, Welcome,
  navigation animation, segmented controls, About, all five assessment input
  screens, and Review presentation points.
- Preserved device-locale startup selection and added no storage, rehydration,
  restart, dependency, native, clinical, API, inference, attestation, or Result
  change.

Result: static/pure regression evidence passes, Kraken accepted the rendered
simulator correction, and all eleven physical standalone Release checks passed.

## 6. Changed-file inventory

### Application source

- `src/components/ACRSegmentedControl.tsx`
- `src/components/ScreenLayout.tsx` (the one pre-declared shared
  presentation-only component)
- `src/i18n/config.ts`
- `src/navigation/AppNavigator.tsx`
- `src/screens/AboutScreen.tsx`
- `src/screens/P1Screen.tsx`
- `src/screens/P2Screen.tsx`
- `src/screens/ReviewScreen.tsx`
- `src/screens/Step1ReceptorsScreen.tsx`
- `src/screens/Step2TumourScreen.tsx`
- `src/screens/Step3MarkersScreen.tsx`
- `src/screens/WelcomeScreen.tsx`
- `src/utils/rtl.ts`

### Tests

- `tests/rtl/verify.js`

### Evidence documentation

- `docs/MOB-P1P2-AR-RTL-FREEZE-FIX-001-Evidence-Report.md`

### Unexpected files

None.

## 7. Per-file explanation

- `src/i18n/config.ts`: removes the defective reload and native direction
  mutation while retaining device-locale startup and normal i18next rejection.
- `src/utils/rtl.ts`: supplies the side-effect-free locale decision used by UI
  presentation and executed directly by the focused test.
- `src/screens/WelcomeScreen.tsx`: closes the modal before awaiting, prevents
  duplicate execution, exposes failures, and updates Home/modal text and
  physical-edge presentation from the selected locale.
- `src/components/ScreenLayout.tsx`: applies explicit reactive locale direction
  at the common root/header/body/footer boundary.
- `src/navigation/AppNavigator.tsx`: derives left/right slide motion from the
  active locale instead of a fixed LTR animation.
- `src/components/ACRSegmentedControl.tsx`: derives direction, text alignment,
  and separator edge from the active locale.
- `src/screens/AboutScreen.tsx`: replaces module-load native RTL reads on the
  accepted two-page text with reactive locale presentation.
- `src/screens/Step1ReceptorsScreen.tsx`, `Step2TumourScreen.tsx`, and
  `Step3MarkersScreen.tsx`: replace native RTL label/hint presentation with
  reactive locale presentation; field definitions/state are unchanged.
- `src/screens/P1Screen.tsx` and `src/screens/P2Screen.tsx`: replace native RTL
  label/hint/error presentation; provisional validation/state are unchanged.
- `src/screens/ReviewScreen.tsx`: replaces native RTL row/hint/error
  presentation; request construction and submission behaviour are unchanged.
- `tests/rtl/verify.js`: executes the production pure helper and checks the
  direction matrix, active-path/order/call-count invariants, locale parity, and
  the existing P1/P2/About verifier. It is explicitly not a rendered UI test.

## 8. Commands and results

### Baseline

```text
pwd
exit 0: /Users/Kraken/DAPP/acr-mobile-companion

git branch --show-current
exit 0: feature/mobile-v0.5-p1-p2

git rev-parse HEAD
git rev-parse origin/feature/mobile-v0.5-p1-p2
exit 0 for each: 2a49ce5555003fb71e61d3bdc3d2fda47e194703

git rev-list --left-right --count HEAD...origin/feature/mobile-v0.5-p1-p2
exit 0: 0 0

git status --porcelain=v1 --untracked-files=all
exit 0: empty

git diff --name-status e0d4c8b5dadfa16bf37d63071150edaae9449a6a...HEAD
exit 0: A docs/MOB-P1P2-AR-RTL-FREEZE-FIX-001.md
```

### Pre-edit and post-edit verification

```text
node tests/p1p2/verify.js
pre-edit exit 0; post-edit exit 0
PASS P1/P2 regression evidence (8 locales, request exclusion, reset,
navigation, About pages)

node tests/rtl/verify.js
final exit 0
PURE PASS direction matrix: ar-SA RTL; seven registered locales LTR
STATIC PASS language changes use one i18next call and no reload/native mutation
STATIC PASS modal ordering, duplicate guard, same-language no-op, observable error path
STATIC PASS reactive root, navigation, and segmented-control direction wiring
STATIC PASS locale JSON key/type/interpolation parity (8 locales)
STATIC PASS existing P1/P2/About invariant verifier remains green

locale key/type/interpolation parity command
pre-edit exit 0; post-edit exit 0
8 files; 250 leaf keys each; missing/extra/type/interpolation mismatches all 0

npm run typecheck
pre-edit exit 2; post-edit exit 2
diff -u typecheck-pre.log typecheck-post.log
exit 0: logs identical

test -x node_modules/.bin/eslint
pre-edit exit 1; post-edit exit 1
SKIPPED — configured lint dependency absent

git diff --check 2a49ce5555003fb71e61d3bdc3d2fda47e194703
exit 0
```

### Simulator preparation and launch

```text
xcrun simctl list -j devices available
exit 0: iPhone 16e, iOS 26.3 runtime, initial state Shutdown

xcrun simctl boot <simulator-udid>
exit 0
xcrun simctl list devices
exit 0: iPhone 16e / iOS 26.3 Booted

xcrun simctl spawn <simulator-udid> defaults read \
  com.anonymous.acr-mobile-companion RCTI18nUtil_forceRTL
exit 1: preference does not exist; simulator uninstall was unnecessary

npx --no-install expo start --dev-client --localhost --ios
running: Using development build; Metro on localhost:8081; no Expo Go
iOS Bundled 44532ms node_modules/expo/AppEntry.js (903 modules)

xcrun simctl io <simulator-udid> screenshot <disposable-log-dir>/sim-home-2.png
exit 0: visible English ACR Home/Welcome screen
```

### Final Phase L audit

```text
git status --short --branch
git status --porcelain=v1 --untracked-files=all
exit 0: exact 15-file inventory recorded in sections 6 and 18

git diff --stat 2a49ce5555003fb71e61d3bdc3d2fda47e194703
exit 0: 13 tracked source files; 308 insertions, 158 deletions
(Git does not include the two untracked files in this stat.)

git diff --name-status 2a49ce5555003fb71e61d3bdc3d2fda47e194703
exit 0: exactly the 13 modified application-source files in section 6

git diff --check 2a49ce5555003fb71e61d3bdc3d2fda47e194703
exit 0: empty

git diff 2a49ce5555003fb71e61d3bdc3d2fda47e194703 -- \
  package.json package-lock.json yarn.lock pnpm-lock.yaml app.json ios android
exit 0: empty

git diff 2a49ce5555003fb71e61d3bdc3d2fda47e194703 -- \
  src/api src/types/api.ts src/store src/utils/provisionalValidation.ts \
  src/screens/ResultScreen.tsx src/i18n/locales
exit 0: empty

node tests/p1p2/verify.js
final rerun exit 0

node tests/rtl/verify.js
final rerun exit 0

lsof -nP -iTCP:8081 -sTCP:LISTEN
exit 1: no Metro listener (expected)
```

The complete tracked diff and both untracked task files were inspected. The
unique disposable directory `/tmp/acr-rtl-fix.5t0VGC` was verified by exact
path and removed after its relevant results had been recorded.

## 9. Pre-edit and post-edit verification posture

| Check | Pre-edit | Post-edit |
| --- | --- | --- |
| P1/P2 verifier | PASS, exit `0` | PASS, exit `0` |
| Targeted RTL verifier | Not present | PASS, exit `0` |
| Locale key/type/interpolation parity | PASS, exit `0`; 8 files, 250 leaves each | PASS, exit `0`; same counts/parity |
| Typecheck | FAIL, exit `2`; accepted baseline diagnostics captured completely | PARTIAL, exit `2`; byte-identical pre/post output, no new diagnostic |
| Lint | `SKIPPED` — `node_modules/.bin/eslint` absent | `SKIPPED` — executable remains absent |

The pre-edit typecheck diagnostics include missing `apiFetch` exports, missing
`uuid` declarations, missing `@react-native-picker/picker`, an invalid `colors`
import, archived/v1 path errors, and the existing `FailClosedScreen` prop
mismatch. It is not reported as a pass.

## 10. Reload/native-direction match classification

- `src/i18n/config.ts`, active Welcome/About/assessment/Review screens, active
  navigator, active segmented control, and `src/utils/rtl.ts`: no remaining
  `reloadAsync`, `forceRTL`, `allowRTL`, `I18nManager.isRTL`, or `expo-updates`
  match.
- `src/i18n/locales/v1/config_v1.ts` and `config_v2.ts`: inactive legacy v1
  copies; unchanged by this task.
- `src/screens/archived/**`: inactive archived copies and comments; unchanged.
- `src/screens/FailClosedScreen.tsx`: active but unrelated fail-closed
  presentation read; not in permitted source paths and unchanged.
- `src/screens/ResultScreen.tsx`: protected Result-scope presentation read;
  explicitly unchanged.
- `tests/rtl/verify.js`: negative static assertions only; verification code,
  not an application call/import.

## 11. Protected-scope audit

Final protected-scope audit passes:

- no diff in dependency manifests, app configuration, `ios/`, or `android/`;
- no diff in `src/api`, `src/store`, `src/screens/ResultScreen.tsx`, or locale
  JSON files;
- no diff in `src/types/api.ts` or `src/utils/provisionalValidation.ts`, and no
  repository paths for ontology, SWRL/Openllet, gateway, or separate inference
  artifacts were found outside the already protected API path;
- changed inventory contains only permitted application/test/evidence paths and
  the one pre-declared presentation-only shared component;
- complete source/test/evidence inspection found no accidental formatting
  churn, debug logging, secrets/private identifiers, generated repository
  files, swallowed errors, hidden restart/native-direction calls, unrelated
  wording, or unrelated presentation changes;
- the sole added `console.error` is the required observable language-change
  failure path, not debug logging;
- `git diff --check 2a49ce5555003fb71e61d3bdc3d2fda47e194703`
  exits `0`;
- Metro remains stopped and the unique disposable command-log directory is
  removed at final handoff.

## 12. Correction-cycle accounting

- Primary implementation pass: complete
- Correction cycles used: `1` of at most `2`
- Cycle 1 corrected only a new test defect: the locale parity assertion compared
  object insertion order rather than sorted key sets. After sorting the key
  paths, the test retained per-key type/interpolation checks and exited `0`.

## 13. Simulator evidence

- Simulator: iPhone 16e
- Runtime: installed iOS 26.3 runtime, reported by Xcode as iOS 26.3.1
- Initial/final preparation state: Shutdown -> Booted
- ACR bundle: `com.anonymous.acr-mobile-companion`
- Legacy forced-RTL preference: absent; app was not uninstalled
- Route: repository-local `npx --no-install expo start --dev-client --localhost --ios`
- Expo posture: explicit development build; Expo Go not used
- Metro: running on localhost port 8081
- Bundle: success, 903 modules, 44.532 seconds
- Automated launch posture: app process running; captured English Home/Welcome
  screen; no relevant changed-path JS/native error

| ID | Verdict | Evidence/observation |
| --- | --- | --- |
| SIM-01 | PASS | Kraken confirmed the English/LTR starting flow was responsive |
| SIM-02 | PASS | Kraken confirmed English to Arabic was immediate with no freeze |
| SIM-03 | PASS | Kraken confirmed Arabic Home was responsive and RTL |
| SIM-04 | PASS | Kraken confirmed both Arabic About pages were responsive |
| SIM-05 | PASS | Kraken confirmed all five Arabic assessment screens were responsive |
| SIM-06 | NOT EVIDENCED | Review was not named in Kraken's returned observations |
| SIM-07 | PASS | Kraken confirmed Arabic to English was immediate |
| SIM-08 | PARTIAL | Both transition directions succeeded; the exact three repetitions were not separately stated |
| SIM-09 | PASS | Kraken confirmed the other languages remained LTR |
| SIM-10 | PASS | Kraken confirmed close/reopen did not leave the app stuck in RTL |

Kraken stated simulator acceptance was complete and explicitly authorised
continuation to the physical Release build despite the accurately retained
`NOT EVIDENCED`/`PARTIAL` details above.

### Phase H source freeze

- Metro received Ctrl-C and reported `Stopped server`.
- `lsof -nP -iTCP:8081 -sTCP:LISTEN`: exit `1`, no listener.
- `git diff --check 2a49ce5555003fb71e61d3bdc3d2fda47e194703`:
  exit `0`.
- Changed source/test inventory remained stable and within declared scope.
- No further source change was made after simulator acceptance.

## 14. Physical Release evidence

### Physical-device preparation

- Kraken confirmed the intended iPhone was connected, unlocked, trusted,
  displaying English LTR, and the old ACR app was closed.
- Read-only device inspection confirmed iPhone 13, iOS 26.6.1, paired/trusted,
  Developer Mode enabled, and developer services available. Complete device
  identifiers are intentionally omitted.
- The existing app preference domain was copied read-only to the disposable
  evidence directory. `RCTI18nUtil_forceRTL=false` and
  `RCTI18nUtil_allowRTL=false`; therefore no uninstall or data deletion was
  required.
- Xcode resolved the existing workspace, `ACRCompanion` scheme, Release
  configuration, physical iOS destination, automatic signing route, and bundle
  identifier without any tracked signing/configuration edit. Account, team,
  certificate, and provisioning identifiers are intentionally omitted.

### Release build, install, and launch

```text
xcodebuild -workspace ios/ACRCompanion.xcworkspace \
  -scheme ACRCompanion -configuration Release \
  -destination 'platform=iOS,name=<connected iPhone 13>' build
exit 0: ** BUILD SUCCEEDED **

xcrun devicectl device install app --device <connected iPhone 13> \
  <DerivedData>/Build/Products/Release-iphoneos/ACRCompanion.app
exit 0: App installed; bundle com.anonymous.acr-mobile-companion

xcrun devicectl device process launch --device <connected iPhone 13> \
  com.anonymous.acr-mobile-companion
exit 0: application launched
```

- Product: signed `ACRCompanion.app`, 21 MB.
- Standalone payload: 2.0 MB Hermes `main.jsbundle` plus copied `assets/`.
- Build log records the local Expo `export:embed` invocation with
  `--dev false`, Hermes bytecode generation, app code signing, validation, and
  `** BUILD SUCCEEDED **`.
- A read-only device process listing after launch contains the installed
  `ACRCompanion.app/ACRCompanion` executable, confirming that it remained
  running at handoff.
- Installation was in place because the stale native RTL preferences were
  already false; no app data was deleted.
- No source changes were made after simulator acceptance.
- Kraken directly completed the physical Release review and reported the exact
  correction successful: Arabic RTL and return to English LTR work without
  restart, freeze, or direction leakage.

| ID | Verdict | Kraken observation |
| --- | --- | --- |
| PHY-01 | PASS | Launch from the ACR icon with Metro stopped showed responsive Home |
| PHY-02 | PASS | English/LTR to Arabic closed the modal and applied RTL immediately without freeze |
| PHY-03 | PASS | Home controls and gestures remained responsive in Arabic |
| PHY-04 | PASS | Both About pages were correct and usable in Arabic RTL |
| PHY-05 | PASS | Step 1, Step 2, Step 3, P1, and P2 remained usable in Arabic |
| PHY-06 | PASS | Review was reached with synthetic/demo inputs and remained intact |
| PHY-07 | PASS | Returning Home and selecting English applied LTR immediately |
| PHY-08 | PASS | Three English -> Arabic -> English repetitions had no stale modal, hang, crash, or direction leakage |
| PHY-09 | PASS | French, Chinese, German, Japanese, Korean, and Russian were responsive and LTR |
| PHY-10 | PASS | Force-close/relaunch preserved the correct startup-locale direction without globally stuck RTL |
| PHY-11 | PASS | The app launched standalone from its icon with Metro unavailable |

## 15. Standalone/Metro-stopped evidence

- Metro was stopped before the physical build and reported `Stopped server`.
- `lsof -nP -iTCP:8081 -sTCP:LISTEN` returned exit `1` immediately before the
  Release build and again after physical launch: no listener.
- The Release build embedded local JavaScript/assets and the physical app
  launched successfully while port 8081 had no listener.
- Kraken directly confirmed PHY-11: the app launches from its icon with Metro
  stopped/unavailable.

## 16. Residual risks and incomplete evidence

- Pre-existing typecheck exit `2` remains baseline debt and may not be called a
  pass.
- Lint is skipped because its configured executable is absent.
- SIM-06 Review was not named in Kraken's returned simulator observations.
- SIM-08's exact three repetitions were not separately stated, although both
  direction transitions passed.
- The `Unsupported dashed / dotted border style` warning appeared only in the
  simulator development build and did not appear in the physical Release app.
  Per Kraken, it is a non-blocking simulator/development carry-forward item;
  no source change was made for it in this session.
- Physical Release PHY-01 through PHY-11 all passed by Kraken's direct
  observation; no physical blocker remains.

## 17. Rollback statement

Before commit, discard only the task paths identified in the final changed-file
inventory. After a later Kraken-controlled commit, revert that specific commit
rather than resetting unrelated work.

## 18. Final status and proposed next action

Current status is `EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE`.

Exact final Git status:

```text
## feature/mobile-v0.5-p1-p2...origin/feature/mobile-v0.5-p1-p2
 M src/components/ACRSegmentedControl.tsx
 M src/components/ScreenLayout.tsx
 M src/i18n/config.ts
 M src/navigation/AppNavigator.tsx
 M src/screens/AboutScreen.tsx
 M src/screens/P1Screen.tsx
 M src/screens/P2Screen.tsx
 M src/screens/ReviewScreen.tsx
 M src/screens/Step1ReceptorsScreen.tsx
 M src/screens/Step2TumourScreen.tsx
 M src/screens/Step3MarkersScreen.tsx
 M src/screens/WelcomeScreen.tsx
 M src/utils/rtl.ts
?? docs/MOB-P1P2-AR-RTL-FREEZE-FIX-001-Evidence-Report.md
?? tests/rtl/verify.js
```

Local `HEAD` and local upstream remain equal to the session baseline,
ahead/behind remains `0 0`, no commit or push was performed, and the one
proposed next action—not performed—is for Kraken to review this exact diff and
evidence packet and decide whether to accept and commit it.

## Acceptance classification

| Criterion | Expected | Observed | Evidence | Verdict | Required action |
| --- | --- | --- | --- | --- | --- |
| Baseline | Exact clean session baseline | Exact SHA/upstream, `0 0`, clean | Phase A commands | PASS | None |
| Scope | Only permitted paths | Permitted paths plus one pre-declared shared presentation file | Status/diff/protected audit | PASS | None |
| Reload removal | No active Release reload in language selection | Active path contains none | Search plus targeted verifier and visual acceptance | PASS | None |
| Native direction removal | No active force/allow RTL mutation | Active path contains none | Search plus targeted verifier and visual acceptance | PASS | None |
| Locale mapping | Arabic RTL; seven locales LTR | Exact matrix plus base form and rendered transitions pass | Production helper, simulator, and physical review | PASS | None |
| Modal ordering | Dismissed before awaited change | Source order and rendered behaviour pass | Targeted verifier and physical review | PASS | None |
| Automated regression | Targeted and P1/P2 checks exit 0 | Both exit 0; locale parity exit 0 | Phase F and final rerun | PASS | None |
| Typecheck | No new task-attributable diagnostics | Exit 2 pre/post; logs identical | Complete disposable logs and `diff -u` exit 0 | PARTIAL | Retain baseline debt disclosure |
| Simulator | SIM-01 to SIM-10 | Core RTL/LTR correction accepted; SIM-06 not named and SIM-08 repetition count not stated | Bundle/process/screenshot plus Kraken observations | PARTIAL | Retain residual disclosure and simulator-only warning carry-forward |
| Physical Release | PHY-01 to PHY-11 | All eleven passed on iPhone 13 / iOS 26.6.1 | Xcode/devicectl evidence plus Kraken direct observations | PASS | None |
| Standalone | Launches without Metro | Icon launch passed with Metro stopped/unavailable | Embedded bundle, port check, Kraken PHY-11 | PASS | None |
| Repository integrity | No forbidden mutation | Final protected audit clean; changed inventory exact and stable | Phase L commands and complete diff inspection | PASS | None |
