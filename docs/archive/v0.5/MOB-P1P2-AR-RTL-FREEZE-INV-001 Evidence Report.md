### MOB-P1P2-AR-RTL-FREEZE-INV-001 Evidence Report

#### 1. Terminal state

`ROOT_CAUSE_PROBABLE`

The probable cause is the Release-only React Native context reload initiated by `Updates.reloadAsync()` during the RTL transition, before the language modal is dismissed. Static evidence is strong; a synchronized CPU/main-thread sample was not obtained, so the precise native failure mode remains unproven.

#### 2. Baseline and repository integrity

- Repository: `/Users/Kraken/DAPP/acr-mobile-companion`
- Branch: `feature/mobile-v0.5-p1-p2`
- `SESSION_BASELINE_SHA`: `c8ded91616b84cc4dd3ecddc04bfc462eece3f66`
- Local HEAD: same SHA
- Live remote branch from `git ls-remote`: same SHA
- Ahead/behind: `0 0`
- Staged, unstaged and untracked state: clean
- Accepted application SHA `8196e135e600d75ae891645587ad2dc7536dc303`: ancestor, exit `0`
- Accepted build SHA `2a300a1ee67e2c1f43bf53ea01779dbe92bb9e2c`: ancestor, exit `0`
- Diff from accepted build baseline: only `A docs/MOB-P1P2-AR-RTL-FREEZE-INV-001.md`, 273 inserted lines.

Principal commands all exited `0`:

```text
git branch --show-current
git rev-parse HEAD
git ls-remote --heads origin refs/heads/feature/mobile-v0.5-p1-p2
git status --porcelain=v1 --untracked-files=all
git rev-list --left-right --count refs/remotes/origin/feature/mobile-v0.5-p1-p2...HEAD
git merge-base --is-ancestor <accepted-sha> HEAD
git diff --name-status 2a300a1e...HEAD
```

#### 3. Confirmed device/iOS/app details

- Physical iPhone 13, product type `iPhone14,5`
- Actual OS: iOS `26.6.1`, build `23G83`
- Developer Mode: enabled
- Device state: available, paired through manual pairing; Developer Disk Image services available
- Installed application: ACR Companion
- Bundle identifier: `com.anonymous.acr-mobile-companion`
- Marketing version: `0.1.0`
- Bundle version: `42`
- Developer application: yes

Complete device identifiers were intentionally omitted.

#### 4. Reproduction result

The supplied physical result is consistent and specific:

1. English Home responds.
2. Language modal opens.
3. Tapping Arabic once leaves the modal visible and the app apparently frozen.
4. Force-closing and relaunching restores operation.
5. Earlier simulator Arabic testing worked.

A fresh controlled reproduction was requested during this investigation, including the required control/gesture and post-relaunch-locale observations. No synchronized response was returned during the session, so a second forced freeze was not attempted.

On-device preferences subsequently confirmed that the Arabic attempt persisted native RTL state:

```text
RCTI18nUtil_allowRTL = true
RCTI18nUtil_forceRTL = true
RCTI18nUtil_makeRTLFlipLeftAndRightStyles = true
```

There was no persisted selected-locale value.

#### 5. Process, hang, crash and log evidence

- ACR Companion was not running in two post-event process snapshots. These were not captured during the frozen interval and therefore do not establish whether the process was alive at that moment.
- The device contained 158 top-level system crash-log entries. None was named for ACR Companion or a watchdog termination.
- No locally synchronized ACR Companion `.ips`, crash or hang report was present.
- No relevant React Native/Hermes terminal message was available.
- No CPU sample or main-thread stack was obtained because the reproduction was not synchronized with capture.
- No Metro server was started or used.

Therefore:

- Crash/watchdog termination: not evidenced.
- CPU-bound JavaScript loop: not evidenced.
- Native main-thread/context-reload stall: supported, but not directly proven by a stack.
- Responsive process behind a blocked modal layer: supported by the static ordering, but responsiveness during the event was not observed.

#### 6. Static Arabic/RTL transition trace

The complete active path is:

1. The Home selector opens the modal at [WelcomeScreen.tsx](/Users/Kraken/DAPP/acr-mobile-companion/src/screens/WelcomeScreen.tsx:75).
2. The Arabic row calls `handleSelectLanguage(item.code)` at [WelcomeScreen.tsx](/Users/Kraken/DAPP/acr-mobile-companion/src/screens/WelcomeScreen.tsx:136).
3. `handleSelectLanguage` awaits `changeLanguage(code)` at lines 41–44.
4. Modal dismissal occurs only afterward at line 45.
5. `changeLanguage` at [config.ts](/Users/Kraken/DAPP/acr-mobile-companion/src/i18n/config.ts:70):

   - snapshots `I18nManager.isRTL`;
   - calls `i18n.changeLanguage(lang)`;
   - calls `allowRTL` and `forceRTL` when direction changes;
   - awaits `Updates.reloadAsync()` at line 80.

Important evidence:

- Installed `expo-updates` source explicitly warns that meaningful logic must not be placed after `await Updates.reloadAsync()` because the JS runtime is about to reload. The modal dismissal violates this contract indirectly by waiting on `changeLanguage`.
- In development/simulator mode, `reloadAsync()` rejects before the native call; the catch runs and the handler can dismiss the modal. This explains why the earlier simulator exercise could work.
- In Release, it invokes the native reload path.
- Native Expo configuration explicitly disables updates at [Expo.plist](/Users/Kraken/DAPP/acr-mobile-companion/ios/ACRCompanion/Supporting/Expo.plist:5).
- Despite that configuration, installed `expo-updates 0.25.28` uses `DisabledAppController.requestRelaunch`, which queues `RecreateReactContextProcedure`.
- That procedure dispatches `RCTTriggerReloadCommandListeners(...)` on the main queue. This is the exact Release-only boundary most likely to stall while leaving the old modal snapshot visible.

Root initialization at [config.ts](/Users/Kraken/DAPP/acr-mobile-companion/src/i18n/config.ts:41) always chooses the device locale and does not rehydrate the user’s selected locale. [App.tsx](/Users/Kraken/DAPP/acr-mobile-companion/App.tsx:7) initializes this once during root loading. There is:

- no locale store;
- no AsyncStorage or locale hydration;
- no navigator key replacement;
- no locale subscription/effect that can repeatedly call `changeLanguage`;
- no render-time state mutation;
- no restart call from the root navigator.

Thus, a repeated JavaScript reload loop is contradicted. The code requests one native context reload for each direction change.

LTR-to-RTL and RTL-to-LTR both take the same risky path. Native RTL flags persist through `NSUserDefaults`, while the selected i18next language does not. A restart can therefore produce English content with native RTL still forced.

Other RTL findings:

- Eight locales are registered; Arabic is the sole RTL locale.
- i18next fallback is `en-GB`.
- iOS `knownRegions` contains only `en` and `Base`; this does not prevent bundled JS translations but is incomplete as a native locale declaration.
- No active code explicitly calls `swapLeftAndRightInRTL`; React Native defaults it to true and the device preference confirms it.
- [rtl.ts](/Users/Kraken/DAPP/acr-mobile-companion/src/utils/rtl.ts:12) duplicates direction mutation logic but is unused.
- Navigation always uses `slide_from_right`.
- Segmented controls and footers use fixed `row` layouts and physical right borders.
- About and assessment screens mainly branch only `writingDirection`.
- Welcome uses several physical `left`, `right`, `marginLeft` and `marginRight` styles.

These are RTL visual-completeness risks, not demonstrated freeze causes.

#### 7. Locale parity result

Inline read-only Node parity check, exit `0`:

- All eight JSON files parsed successfully.
- Each contained 250 leaf keys.
- Every locale, including `ar-SA.json`, had:

```text
missing=0
extra=0
typeMismatches=0
interpolationMismatches=0
```

Arabic wording or clinical content was not changed or clinically assessed.

#### 8. Existing tests/typecheck/lint results

`node tests/p1p2/verify.js`

- Exit: `0`
- Result: `PASS P1/P2 regression evidence (8 locales, request exclusion, reset, navigation, About pages)`

`npm run typecheck`

- Exit: `2`
- Not a pass.
- Existing errors include missing `apiFetch` exports, missing `uuid` declarations, unavailable `@react-native-picker/picker`, invalid `colors` import, a `FailClosedScreen` prop mismatch, and numerous archived/v1 path errors.

Lint:

- Configured command: `npm run lint`
- Skipped because `node_modules/.bin/eslint` was absent.
- This is `SKIPPED`, not PASS.

Existing coverage:

- The single verification script checks locale key parity and P1/P2/About static invariants.
- No test covers language selection, LTR-to-RTL, RTL-to-LTR, modal ordering, persistence, rehydration, context reload or app restart.

#### 9. Candidate-cause matrix

| Candidate | Classification | Evidence |
|---|---|---|
| JavaScript/render loop | `NOT EVIDENCED` | No cyclic effect, subscription, root key or render-time mutation; CPU capture missing. |
| Native main-thread hang | `SUPPORTED BUT NOT PROVEN` | Release reload dispatches context recreation on the main queue; no synchronized stack. |
| Crash/watchdog termination | `NOT EVIDENCED` | No ACR/watchdog diagnostic; no during-event process capture. |
| Blocked modal/touch layer | `SUPPORTED BUT NOT PROVEN` | Modal cannot dismiss before awaited reload; responsive controls were not observed. |
| RTL state-change/reload loop | `CONTRADICTED` | One reload is requested; no root path re-enters `changeLanguage`. |
| Persistence/rehydration loop | `CONTRADICTED` | RTL flags persist, but selected locale has no persistence or hydration code. |
| Unsafe Release context reload before modal dismissal | `SUPPORTED BUT NOT PROVEN` | Exact Release-only path and simulator/Release difference are evidenced; runtime stack is missing. |

#### 10. Root-cause conclusion and confidence

Expected behavior: selecting Arabic should close the selector, render Arabic, remain responsive, and transition coherently to RTL.

Actual behavior: the handler changes the translations and RTL preference, then initiates a Release React-context reload before it can dismiss the modal. The previous modal remains visible while the reload fails to complete normally. Native RTL persists, but the chosen locale does not.

Most likely responsible path:

```text
WelcomeScreen.handleSelectLanguage
→ changeLanguage
→ I18nManager.forceRTL(true)
→ Updates.reloadAsync()
→ DisabledAppController.requestRelaunch
→ main-queue React-context recreation
```

Confidence: high for the faulty/unsafe path; moderate for the precise runtime mechanism. A native reload stall or stale unresponsive modal snapshot is more likely than a JavaScript loop, persistence loop, crash or watchdog termination.

#### 11. Exact proposed minimal correction

For the smallest freeze correction:

1. Remove the `expo-updates` import and `Updates.reloadAsync()` call from `changeLanguage`.
2. Dismiss the language modal before performing direction-change work.
3. Let `changeLanguage` update i18next and the native RTL preference, then return normally.
4. Do not reload the React context from the language-selection handler.

A complete persistence design should be separately decided before reintroducing any automated restart, because native RTL currently survives restart while the chosen locale does not.

#### 12. Required regression tests

Before another physical Release build:

- Modal closes for all eight language selections.
- LTR→RTL and RTL→LTR each call direction mutation at most once.
- Same-direction language changes never reload.
- Release-mode test proves `Updates.reloadAsync()` is not invoked.
- Arabic selection remains interactive across Home, both About pages and all five assessment pages.
- Segmented controls, navigation motion, headers, footers and physical-edge styles are checked in RTL.
- If persistence is added, selected locale must hydrate before root render and remain consistent with native RTL after restart.
- Existing verification test must remain green.
- Typecheck should be brought to a defined passing baseline; lint must only be reported after its dependency exists.
- One Metro-free physical Release verification on iPhone 13/iOS 26.6.1, including process responsiveness and crash/hang diagnostics.

#### 13. Residual risks and missing evidence

- No synchronized reproduction observation was returned.
- No CPU sample, main-thread stack, or focused Hermes/native console excerpt was captured.
- Process survival during the frozen interval remains unknown.
- User-visible controls and gestures during the event remain unknown.
- Active locale after relaunch was not reported.
- Native RTL and i18next locale can diverge after restart.
- RTL layout uses several fixed physical-direction styles.
- iOS native known regions do not enumerate all eight locales.
- iOS 26.6.1 compatibility with this older React Native/Expo context-reload path remains an open contributing factor.

#### 14. Final Git status

```text
## feature/mobile-v0.5-p1-p2...origin/feature/mobile-v0.5-p1-p2
HEAD c8ded91616b84cc4dd3ecddc04bfc462eece3f66
ahead/behind 0 0
porcelain: empty
```

No repository file was modified. No build, reinstall, Prebuild, dependency installation, Metro launch, commit or push occurred. The unique disposable `/tmp` investigation directory was removed.

#### 15. One proposed next action; not performed

Authorize a separate fix session to remove the language-handler `expo-updates` reload, dismiss the modal first, add targeted RTL-transition tests, and then prepare one Kraken-authorized physical Release verification.