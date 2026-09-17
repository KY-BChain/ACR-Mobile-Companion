# MOB-P1P2-AR-RTL-FREEZE-FIX-001

## Arabic RTL language-switch correction, simulator verification and physical iPhone Release rebuild

Status: `READY FOR EXECUTION`

Date prepared: 21 August 2026

This is an **implementation and build task**. It is not a verification-only
session. If the baseline gates pass, Codex must proceed from investigation to
the authorised source correction, automated checks, simulator execution and
physical iPhone Release rebuild. Codex must not stop after restating the
investigation report.

---

## 1. Authority and roles

- Product owner, acceptance authority and release authority: Kraken.
- Implementer for this task: OpenAI Codex.
- Independent human visual tester: Kraken.
- Clinical-content authority: ACR clinical partners. This task makes no clinical
  decision, clinical wording or assessment-logic change.
- Git commit and push authority: Kraken only, using GitHub Desktop unless Kraken
  explicitly decides otherwise.
- Codex is authorised to edit only the paths permitted below and to run the
  local checks, local simulator route and local Xcode physical-device build
  defined by this script.
- Codex is not authorised to commit, push, publish, merge, open a pull request,
  distribute the app, use live patient data or change any remote system.

Missing evidence is never acceptance. Codex may report results, but only Kraken
may accept the visual behaviour and authorise the later Git commit and push.

---

## 2. Repository and controlling baseline

Repository:

```text
/Users/Kraken/DAPP/acr-mobile-companion
```

Required branch:

```text
feature/mobile-v0.5-p1-p2
```

Accepted investigation-evidence commit:

```text
e0d4c8b5dadfa16bf37d63071150edaae9449a6a
```

Earlier accepted implementation and build ancestors:

```text
Accepted P1/P2/About implementation:
8196e135e600d75ae891645587ad2dc7536dc303

Accepted iOS standalone instruction baseline:
2a300a1ee67e2c1f43bf53ea01779dbe92bb9e2c

Arabic investigation execution baseline:
c8ded91616b84cc4dd3ecddc04bfc462eece3f66
```

### 2.1 Session-baseline rule

This instruction file will be committed and pushed before the Codex fix session
starts. That commit will create a new full SHA. Therefore this file deliberately
does not embed the later post-push value.

Kraken must supply the new full commit SHA in the Codex opening message using
the name:

```text
SESSION_BASELINE_SHA
```

Codex must not begin implementation unless all of the following are true:

1. `SESSION_BASELINE_SHA` is present in Kraken's opening message.
2. Local `HEAD` equals `SESSION_BASELINE_SHA`.
3. Local `origin/feature/mobile-v0.5-p1-p2` equals
   `SESSION_BASELINE_SHA`.
4. Ahead/behind is exactly `0 0`.
5. The working tree is completely clean, including untracked files.
6. Commit `e0d4c8b5dadfa16bf37d63071150edaae9449a6a` is an ancestor of
   `SESSION_BASELINE_SHA`.
7. The only commit-level change after the accepted investigation-evidence
   commit is this instruction file. If any other path is present, stop.

Do not fetch, pull, rebase, merge, reset, switch branch or otherwise alter Git
state to make a failed baseline pass.

---

## 3. Canonical evidence and terminology

Codex must read these files completely before editing source:

```text
docs/MOB-P1P2-AR-RTL-FREEZE-FIX-001.md
docs/MOB-P1P2-AR-RTL-FREEZE-INV-001 Evidence Report.md
docs/MOB-P1P2-IOS-STANDALONE-001.md
```

If the standalone instruction file has a different exact filename, Codex may
locate it with `find docs -maxdepth 1 -type f -name '*IOS-STANDALONE-001*.md'`,
record the resolved path and read that one file. Do not scan unrelated projects.

Canonical direction terminology for this task:

| Locale | Direction |
| --- | --- |
| `ar-SA` | RTL |
| `en-GB` | LTR |
| `fr-FR` | LTR |
| `zh-CN` | LTR |
| `de-DE` | LTR |
| `ja-JP` | LTR |
| `ko-KR` | LTR |
| `ru-RU` | LTR |

Arabic is the only RTL locale. All seven other active locales are LTR.

---

## 4. Confirmed defect and new runtime evidence

The investigation established the active path:

```text
WelcomeScreen.handleSelectLanguage
  -> changeLanguage
  -> I18nManager.forceRTL(...)
  -> Updates.reloadAsync()
  -> Release React-context recreation
```

The language modal is dismissed only after the awaited reload call. In the
physical Release app, selecting Arabic leaves the modal visible and the app
apparently frozen.

Kraken's subsequent physical observation adds the missing behavioural evidence:

1. Starting from an LTR locale, selecting Arabic causes the visible freeze.
2. Force-closing and reopening the app makes the persisted native RTL direction
   take effect.
3. The entire app then remains natively RTL, including when any of the seven
   LTR languages is selected, until the native direction is changed back.
4. This is consistent with native RTL state persisting while the selected
   i18next locale is not persisted.

The exact internal native stall stack remains unproven. That does not block the
correction because the unsafe language-selection path, persisted global native
direction and restart-only application of that native direction are all
directly evidenced.

---

## 5. Accepted correction decision — DD-AR-RTL-001

Status: `AUTHORISED FOR IMPLEMENTATION IN THIS SESSION`

### What

Use the currently selected application locale as the sole runtime source of UI
direction:

```text
ar-SA -> RTL
all seven other active locales -> LTR
```

Language selection must update React/i18next state and the relevant presentation
styles without forcing a native process direction or reloading the React
context.

### Required implementation consequences

1. Remove the active language-selection dependency on
   `Updates.reloadAsync()`.
2. Remove active runtime `I18nManager.forceRTL()` and `allowRTL()` mutation from
   the language-selection path.
3. Dismiss the language modal before awaiting the language change.
4. Derive direction reactively from the selected locale, using `i18n.dir(...)`
   or a small pure equivalent whose eight-locale mapping is tested.
5. Apply explicit locale-derived direction to affected text and horizontal
   presentation where required for the existing Home, About, assessment and
   Review UI.
6. Do not add an app restart.
7. Do not add locale persistence in this correction. The existing device-locale
   startup behaviour remains unchanged.
8. Do not remove the `expo-updates` package or edit dependency manifests. Only
   remove its use from this defective runtime path.

### Why

Merely deleting `reloadAsync()` while retaining `forceRTL()` would remove the
immediate reload attempt but would still require a full restart before native
direction becomes coherent. It would also retain the evidenced risk that native
direction and selected locale diverge. Locale-derived React presentation avoids
that restart-only global state and permits immediate Arabic-to-LTR and
LTR-to-Arabic switching.

### Rejected alternatives for this task

- Retain `forceRTL()` and ask users to restart: rejected because it does not
  restore the previously working immediate language-selector behaviour.
- Persist the selected locale and deliberately restart the app: deferred as a
  separate product decision and unnecessary for this prototype correction.
- Add a restart package or another dependency: forbidden.
- Change native iOS localisation settings, Expo configuration or the Xcode
  project: forbidden.

---

## 6. Objective and success condition

### Objective

Correct the Arabic language-selection freeze and native-direction leakage while
preserving all accepted P1, P2, About, assessment, translation and standalone
application behaviour.

### Success condition

The task is successful only when evidence supports all of the following:

1. Selecting Arabic closes the language modal, immediately renders Arabic in
   RTL and leaves the app responsive.
2. Selecting any of the seven LTR locales immediately returns the app to LTR
   without a restart.
3. Repeated LTR-to-RTL and RTL-to-LTR switching does not freeze, crash, reload
   the React context or leave a stale modal.
4. All eight locales remain selectable.
5. Both About pages and the five assessment input screens remain available and
   usable; the Review flow remains intact.
6. No clinical content, input rules, assessment state, request construction,
   API, inference, attestation or Result behaviour changes.
7. Existing P1/P2 regression evidence remains green.
8. The correct iPhone 16e / iOS 26.3 simulator is exercised through the existing
   local Expo/Metro development route.
9. After simulator acceptance, the app is rebuilt locally in Release mode and
   installed on the physical iPhone 13 / iOS 26.6.1 with Metro stopped.
10. Repository mutations remain inside the authorised source, test and evidence
    paths.

---

## 7. Scope

### 7.1 Primary permitted source paths

Codex may inspect any tracked repository file required to understand the active
path. Source edits are limited to the minimum subset of these paths that the
actual implementation demonstrates is necessary:

```text
src/i18n/config.ts
src/screens/WelcomeScreen.tsx
src/utils/rtl.ts
src/navigation/AppNavigator.tsx
src/components/ACRSegmentedControl.tsx
src/screens/AboutScreen.tsx
src/screens/Step1ReceptorsScreen.tsx
src/screens/Step2TumourScreen.tsx
src/screens/Step3MarkersScreen.tsx
src/screens/P1Screen.tsx
src/screens/P2Screen.tsx
src/screens/ReviewScreen.tsx
```

`App.tsx` is conditionally permitted only if Codex first proves that the current
root cannot react to locale direction without a minimal root-level direction key
or context. Codex must record that evidence before editing `App.tsx`. Do not edit
it merely for convenience.

One existing shared presentation-only component directly used by the listed
screens may be added to the permitted set only if all of the following are true:

1. direct usage is shown;
2. the RTL defect cannot be corrected coherently in the listed paths alone;
3. the file is named in the evidence report before it is edited;
4. its change is presentation-only.

Otherwise stop with `BLOCKED_SCOPE` and ask Kraken.

### 7.2 Permitted test and evidence paths

```text
tests/
docs/MOB-P1P2-AR-RTL-FREEZE-FIX-001-Evidence-Report.md
```

Use the existing test style and dependencies. A targeted deterministic Node
verification script is permitted when no configured component-test framework
exists. It must be labelled as static/pure-function evidence and must not be
misrepresented as a rendered UI test.

### 7.3 Explicitly forbidden source and configuration changes

Do not modify:

- `package.json`, any lockfile or dependency version;
- `app.json`, `app.config.*`, `eas.json`, Babel, Metro or TypeScript
  configuration;
- `ios/` or `android/` source, project, workspace, plist, manifest, signing or
  entitlement files;
- any locale JSON wording or locale key;
- API, gateway, inference, ontology, SWRL, Openllet, Bayesian, attestation,
  Result or request-payload logic;
- assessment field definitions, validation ranges, state or reset behaviour;
- app name, bundle identifier, icon, version or build number;
- About wording or number of About pages;
- P1/P2 wording or provisional status;
- documentation other than this task's evidence report.

### 7.4 Forbidden actions

Do not:

- install, update or remove dependencies;
- run Expo Prebuild;
- run EAS Build or use any cloud build service;
- use Expo Go for acceptance;
- create or switch branches;
- fetch, pull, merge, rebase, reset, stash or cherry-pick;
- commit, push, publish, distribute or open a pull request;
- delete or uninstall the physical-device app without Kraken's explicit
  in-session approval;
- erase simulator devices, reset Xcode, clear Keychains or delete broad caches;
- access live clinical or patient data;
- repair unrelated typecheck or lint failures.

---

## 8. Invariants

The following must remain true:

1. Eight active locale JSON files remain present with exact existing key/type
   parity.
2. Arabic wording is unchanged and is not clinically reviewed by Codex.
3. P1 and P2 remain provisional input screens.
4. About remains two accepted native-text pages.
5. About remains isolated from assessment, language persistence, API,
   inference, attestation and Result state.
6. The mobile app performs no clinical inference locally.
7. Result and clinical request behaviour are unchanged.
8. No intentional clinical data-at-rest mechanism is introduced.
9. No Sprint G, decentralised governance, AI-agent, DLT or federated-learning
   function is introduced.
10. The physical Release app remains standalone: its JavaScript bundle and
    assets are embedded locally and it does not require a listening Metro
    server after installation.

---

## 9. Resource and execution constraints

The build host is an Intel MacBook Pro with 8 GB RAM. Execute heavy work
sequentially:

1. Do not run simulator build, physical build, typecheck and other heavy tasks
   in parallel.
2. Reuse existing local `node_modules`, Pods, workspace and build setup.
3. Do not perform speculative clean builds or delete DerivedData unless a
   directly evidenced stale-build defect requires it and Kraken approves.
4. Close or avoid unnecessary build processes.
5. Codex may execute routine read-only shell commands, local tests, Metro,
   simulator boot/launch, Xcode open/build, device install and log capture
   without asking permission for every command, provided the command is already
   authorised by this script.
6. Use `git grep`, `grep` and `find`; do not require `rg`, which is not installed
   on Kraken's Mac.

---

## 10. Correction-loop budget

This task has one primary implementation pass and at most two bounded correction
cycles.

For every correction cycle, Codex must first report:

```text
Expected result:
Actual result:
Reproduction/evidence:
Proposed minimal correction:
Files required:
Cycle number:
```

Codex may proceed without another permission only when the defect is directly
caused by this task's changes and every required file is already permitted.

Stop and ask Kraken when:

- a third correction cycle would be required;
- an unlisted application file is required;
- a dependency, native file or configuration change appears necessary;
- a baseline defect rather than a newly introduced defect blocks progress;
- clinical or assessment meaning would change.

---

## 11. Legal terminal states

Codex must finish with exactly one of these terminal states:

- `EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE`
- `READY_FOR_KRAKEN_SIMULATOR_REVIEW`
- `READY_FOR_KRAKEN_DEVICE_CONNECTION`
- `READY_FOR_KRAKEN_PHYSICAL_REVIEW`
- `BLOCKED_BASELINE`
- `BLOCKED_SCOPE`
- `BLOCKED_DEPENDENCY`
- `BLOCKED_IMPLEMENTATION`
- `BLOCKED_AUTOMATED_VERIFICATION`
- `BLOCKED_SIMULATOR`
- `BLOCKED_DEVICE`
- `BLOCKED_SIGNING`
- `BLOCKED_BUILD`
- `BLOCKED_PHYSICAL_RUNTIME`

`EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE` is not a Git release or product
acceptance. It means only that the authorised evidence packet is complete for
Kraken's decision.

---

# EXECUTION PHASES

## Phase A — Read instructions and verify the immutable baseline

### Proposal

Begin only from the exact clean post-script-commit baseline supplied by Kraken.

### Actual action

Read this file and the canonical evidence files completely. Then run, without
fetching or changing Git state:

```bash
pwd
git branch --show-current
git rev-parse HEAD
git rev-parse origin/feature/mobile-v0.5-p1-p2
git rev-list --left-right --count HEAD...origin/feature/mobile-v0.5-p1-p2
git status --short --branch
git status --porcelain=v1 --untracked-files=all
git merge-base --is-ancestor e0d4c8b5dadfa16bf37d63071150edaae9449a6a HEAD
git merge-base --is-ancestor 8196e135e600d75ae891645587ad2dc7536dc303 HEAD
git merge-base --is-ancestor 2a300a1ee67e2c1f43bf53ea01779dbe92bb9e2c HEAD
git diff --name-status e0d4c8b5dadfa16bf37d63071150edaae9449a6a...HEAD
```

Compare the two resolved SHAs with `SESSION_BASELINE_SHA` supplied in Kraken's
opening message.

### Expected result and evidence

- Correct repository and branch.
- `HEAD`, local upstream and `SESSION_BASELINE_SHA` are identical.
- Ahead/behind is `0 0`.
- Porcelain output is empty.
- All three ancestry commands exit `0`.
- The diff after `e0d4c8...` contains only
  `docs/MOB-P1P2-AR-RTL-FREEZE-FIX-001.md`.

Record commands, exact outputs and exit results in the evidence report.

### Stop condition

Any mismatch: stop immediately with `BLOCKED_BASELINE`. Do not repair Git state.

### Why

This proves that the fix is attributable to this session and not to an
unreviewed branch or concurrent edit.

---

## Phase B — Capture pre-edit implementation and verification posture

### Proposal

Record the actual faulty path and current test failures before editing so the
post-edit comparison is evidence-based.

### Actual action

1. Resolve the active direction/reload references using commands such as:

   ```bash
   git grep -n -E 'I18nManager|forceRTL|allowRTL|reloadAsync|expo-updates|changeLanguage|isRTL|writingDirection' -- App.tsx src tests
   ```

2. Read the complete active implementations in:

   ```text
   src/i18n/config.ts
   src/screens/WelcomeScreen.tsx
   src/utils/rtl.ts
   App.tsx
   src/navigation/AppNavigator.tsx
   src/components/ACRSegmentedControl.tsx
   all current About, assessment and Review screens
   package.json
   tests/p1p2/verify.js
   ```

3. Record which files use native `I18nManager.isRTL` and which derive direction
   from the selected i18n locale.

4. Create one uniquely named disposable task directory with `mktemp -d`. Use it
   only for command logs. Do not write generated evidence into application
   source.

5. Run the existing P1/P2 verification before editing:

   ```bash
   node tests/p1p2/verify.js
   ```

6. Run the configured typecheck before editing and preserve its complete output
   and exit code in the disposable directory. Investigation evidence predicts
   exit `2`; do not call that PASS.

7. Inspect whether the configured lint executable exists. If absent, record
   `SKIPPED — dependency absent`; do not install it. If present, run the exact
   configured lint command and preserve output and exit code.

8. Parse all eight active locale JSON files and confirm current key/type and
   interpolation parity without editing them.

### Expected result and evidence

- Existing P1/P2 verification exits `0`.
- The pre-edit reload and native-direction path matches or explicitly updates
  the investigation report.
- Pre-existing typecheck/lint posture is captured exactly.
- All eight locale files parse and retain parity.

### Stop condition

Stop with `BLOCKED_BASELINE` if the existing P1/P2 verification now fails, a
locale file does not parse, the active code materially contradicts the accepted
investigation, or required local dependencies are absent.

### Why

The task must not hide a pre-existing failure or claim that an unrelated
baseline error was introduced or corrected by this change.

---

## Phase C — Confirm the minimal file plan before mutation

### Proposal

Use locale-derived React presentation while changing the smallest coherent set
of files.

### Actual action

Before editing, print a short implementation plan containing:

```text
1. Exact files to edit.
2. Faulty statement/path removed from each file.
3. Locale-derived replacement behaviour added to each file.
4. Tests to add or update.
5. Why App.tsx is or is not required.
6. Confirmation that no forbidden path is required.
```

The plan must implement DD-AR-RTL-001. It must not reopen the already rejected
native-restart design unless the current source directly contradicts the
investigation. If it does, stop with evidence.

### Expected result and evidence

A bounded file plan entirely within section 7.

### Stop condition

If the plan requires a package, native/configuration file, locale wording,
clinical logic or unpermitted shared component, stop with `BLOCKED_SCOPE`.

### Why

This converts the investigation into an auditable action plan before source is
changed.

---

## Phase D — Implement the language-switch correction

### Proposal

Remove the unsafe reload/global-direction path and make direction a pure,
reactive consequence of the selected locale.

### Actual action

Implement all requirements below.

#### D1. Make the direction decision pure

- Establish one small, testable direction decision based on the active locale.
- It must classify `ar-SA` as RTL and all seven other registered locales as LTR.
- It must tolerate the i18next resolved/base-language form actually used by the
  repository without incorrectly classifying non-Arabic locales.
- Prefer `i18n.dir(activeLanguage)` when it is already available and reactive;
  otherwise implement a pure equivalent in `src/utils/rtl.ts`.
- `src/utils/rtl.ts` must no longer contain unused native direction mutation.
- The direction decision must have no storage, native mutation, process reload
  or navigation side effect.

#### D2. Correct `changeLanguage`

- Remove the `expo-updates` import from the active i18n configuration when it is
  used only for this path.
- Remove `Updates.reloadAsync()` from language selection.
- Remove active `I18nManager.allowRTL()` and `I18nManager.forceRTL()` mutation
  from language selection.
- `changeLanguage` must change the requested registered language and resolve or
  reject normally.
- Do not swallow a failed language change.
- Do not remove the `expo-updates` dependency from package files.

#### D3. Correct modal ordering

- In `WelcomeScreen.handleSelectLanguage`, dismiss the language modal before
  awaiting the language change.
- Prevent accidental duplicate execution if the existing UI permits rapid
  repeated taps, but do not add unnecessary global state.
- On a genuine language-change error, keep the app responsive and preserve an
  observable failure path. Do not add untranslated user wording solely for this
  task.
- Do not leave business logic after a process-reload call; no process-reload
  call should remain in this path.

#### D4. Make affected presentation react to locale direction

- Direction must update immediately when i18next's active language changes.
- Do not read `I18nManager.isRTL` as the source of the selected language's
  direction.
- Apply locale-derived `writingDirection` and `textAlign` to relevant visible
  text.
- Apply locale-derived `row`/`row-reverse`, alignment and physical-edge styling
  only where needed to preserve the accepted Home, About, segmented-control,
  assessment and Review presentation.
- If navigation animation is direction-dependent, derive it from the active
  locale rather than native global RTL state.
- Do not redesign screens or change accepted wording, spacing or colours beyond
  the minimum RTL correction.
- Do not change the accepted button-based About navigation in this task.

#### D5. Preserve startup semantics

- Do not add AsyncStorage or another locale store.
- Do not add selected-language rehydration.
- On a new process start, retain the existing device-locale selection rule.
- Whichever locale is selected at startup, visible direction must agree with
  that locale and must not inherit a stale forced native direction in a clean
  installation.

### Expected result and evidence

- No language selection triggers Expo Updates reload or native forced RTL.
- Modal state changes before the awaited language change.
- Direction follows selected locale reactively.
- Diff contains only permitted minimal changes.

After editing, immediately print:

```bash
git status --short --untracked-files=all
git diff --stat
git diff --name-only
git diff --check
```

### Stop condition

Stop with `BLOCKED_IMPLEMENTATION` if immediate direction cannot be achieved
without a forbidden file/dependency or if assessment/clinical behaviour would
need to change.

### Why

This removes both evidenced failure elements: the Release context reload that
blocks modal completion and the persisted global native direction that leaks
across languages.

---

## Phase E — Add focused regression evidence

### Proposal

Add deterministic checks for the precise regression without pretending that a
static test is a rendered simulator test.

### Actual action

Using the repository's existing test capability and no new dependency, add or
update focused checks for:

1. the exact eight-locale direction matrix;
2. Arabic as the sole RTL locale;
3. all seven remaining locales as LTR;
4. absence of `Updates.reloadAsync()` from the active selection path;
5. absence of active `forceRTL()`/`allowRTL()` mutation from that path;
6. modal dismissal occurring before the awaited language change;
7. same-direction language selection causing no native reload or mutation;
8. LTR-to-RTL and RTL-to-LTR each requiring only one i18next language change;
9. all locale files retaining key/type/interpolation parity;
10. existing P1/P2/About invariants remaining intact.

If a configured component/unit test framework exists locally, use it. If it
does not, create a deterministic Node verification in `tests/` that checks the
pure direction function and relevant static invariants. Label its limitations
in the evidence report.

Do not create a fake UI test that only searches for strings and then call the UI
behaviour PASS.

### Expected result and evidence

The targeted test exits `0`, with each tested invariant named in its output.

### Stop condition

If the test requires a new package or cannot exercise the pure decision without
production-only hacks, stop with `BLOCKED_DEPENDENCY` or revise the permitted
implementation within the current correction cycle.

### Why

The original test suite did not cover language direction, modal ordering or
Release reload removal. This creates a durable regression gate while reserving
visual claims for actual simulator/device observation.

---

## Phase F — Automated post-edit verification

### Proposal

Prove the correction does not regress accepted behaviour or add new static
failures.

### Actual action

Run sequentially:

1. the new targeted RTL/language-switch verification;
2. `node tests/p1p2/verify.js`;
3. the same locale parity check used before editing;
4. the configured typecheck, capturing complete output and exit code;
5. lint only if its existing executable was available before editing;
6. `git diff --check`;
7. searches for reload/native-direction calls and imports;
8. a protected-scope changed-file audit.

Compare pre-edit and post-edit typecheck outputs. Existing baseline failures may
remain, but this task must introduce no new diagnostic attributable to a changed
file. Do not call an exit-2 typecheck PASS.

Required searches include the functional equivalent of:

```bash
git grep -n -E 'reloadAsync|forceRTL|allowRTL|I18nManager.isRTL|expo-updates' -- App.tsx src tests
git diff --name-only "$SESSION_BASELINE_SHA"
git diff --check "$SESSION_BASELINE_SHA"
```

Inspect every remaining match and classify it as active, inactive or unrelated.
Do not rely only on grep absence.

### Expected result and evidence

- Targeted RTL verification: PASS, exit `0`.
- Existing P1/P2 verification: PASS, exit `0`.
- Locale parity: PASS, exit `0`.
- No new typecheck diagnostic from this task.
- Lint accurately reported as PASS, FAIL or SKIPPED; never assumed.
- `git diff --check`: PASS.
- No forbidden path changed.

### Stop condition

Any new attributable failure: use one permitted correction cycle. If unresolved,
finish `BLOCKED_AUTOMATED_VERIFICATION`.

### Why

This separates a successful targeted correction from unrelated known baseline
debt and prevents a false clean-build claim.

---

## Phase G — Run the actual iPhone 16e / iOS 26.3 simulator

### Proposal

Exercise the rendered application and both direction transitions before another
physical Release build.

### Actual action

1. Identify the installed simulator by exact device name and runtime. Do not
   silently substitute an iPhone SE or another iOS runtime.
2. Boot the installed `iPhone 16e / iOS 26.3` simulator.
3. Reuse the repository's existing successful local Expo/Metro simulator route.
4. Use only the local installed Expo CLI, for example through
   `npx --no-install`, and do not install anything.
5. Do not run Expo Prebuild or Expo Go.
6. If a clean simulator app state is necessary to remove a legacy forced-RTL
   preference, Codex may uninstall only the ACR Companion bundle from the exact
   iPhone 16e simulator after first recording the simulator UDID and bundle ID.
   Do not erase or reset the simulator.
7. Launch the actual ACR application and confirm it reaches Home/Welcome.
8. Leave Metro and the simulator running for Kraken's manual review.

Record:

- exact simulator identity and boot state;
- exact launch command;
- Metro command and relevant output;
- whether the Home/Welcome screen was reached;
- any JS/native error relevant to the changed path.

### Kraken simulator acceptance checklist

Codex must present this checklist and wait for Kraken's observations. Do not mark
an item PASS without Kraken's direct confirmation or captured automation that
actually exercised it.

| ID | Action | Expected result |
| --- | --- | --- |
| SIM-01 | Start in English or another LTR locale | Home is responsive and LTR |
| SIM-02 | Open language selector and choose Arabic once | Modal closes; Arabic appears; app remains responsive |
| SIM-03 | Inspect Home in Arabic | Text/alignment/order are RTL without a process restart |
| SIM-04 | Open both About pages in Arabic | Both pages render and navigation remains responsive |
| SIM-05 | Traverse Step 1, Step 2, Step 3, P1 and P2 in Arabic | Five screens render and controls remain usable |
| SIM-06 | Reach Review through the normal synthetic/demo route | Review remains available; no Result/API change |
| SIM-07 | Return Home and choose English | Immediate LTR; no freeze or restart |
| SIM-08 | Repeat English -> Arabic -> English three times | Every transition succeeds; no stale modal |
| SIM-09 | Select each of the other six LTR locales | Each remains selectable, responsive and LTR |
| SIM-10 | Force-close and relaunch | Startup locale follows existing device-locale rule and direction agrees with it |

If Kraken cannot complete some visual action, classify it `NOT EVIDENCED`, not
PASS.

### Expected result and evidence

All ten simulator criteria PASS, or any intentionally unexercised item is
explicitly `NOT EVIDENCED` and held for a later decision.

### Stop condition

- Wrong simulator/runtime or app cannot launch: `BLOCKED_SIMULATOR`.
- Any reproducible freeze or wrong-direction transition: capture expected,
  actual and reproduction evidence before a permitted correction cycle.
- Do not proceed to physical build while a core Arabic transition criterion
  fails.

### Why

Static evidence cannot prove modal responsiveness or rendered direction. The
simulator is the first executable acceptance gate.

---

## Phase H — Reconcile simulator findings and freeze source

### Proposal

Do not begin the slower physical build until the simulator correction is stable.

### Actual action

1. Reconcile every SIM criterion as `PASS`, `FAIL`, `PARTIAL` or
   `NOT EVIDENCED`.
2. If a directly introduced defect exists, use a remaining correction cycle,
   rerun Phases F and G and update the cycle count.
3. Once simulator evidence is acceptable, stop Metro cleanly before any
   physical Release build.
4. Re-run `git status`, changed-file inventory and `git diff --check`.

### Expected result and evidence

Simulator gate accepted by Kraken for physical continuation; Metro confirmed
stopped; source diff stable and within scope.

### Stop condition

If Kraken is not available to inspect, leave Metro/simulator running and finish
the current response with `READY_FOR_KRAKEN_SIMULATOR_REVIEW`. Continue in the
same Codex session after Kraken reports results.

### Why

This prevents a resource-intensive signed Release build from becoming the first
place a visible regression is discovered.

---

## Phase I — Prepare the physical iPhone and legacy RTL state

### Proposal

Clear the old build's persisted forced-RTL state without deleting physical app
data unless Kraken explicitly authorises deletion.

### Actual action

1. Ask Kraken to connect, unlock and trust the physical iPhone 13 running iOS
   26.6.1, with Developer Mode enabled.
2. Before replacing the old installed build, ask Kraken to open it, select
   English, and—if the old reload path freezes—force-close and reopen it once.
3. Confirm that the old app is then displaying an LTR language in LTR.
4. If available through the same read-only device inspection used in the
   investigation, confirm the legacy `RCTI18nUtil_forceRTL` preference is no
   longer true. Do not expose full device identifiers.
5. If the preference cannot be normalised, stop and ask Kraken whether Codex may
   uninstall only `com.anonymous.acr-mobile-companion` from the physical iPhone.
   Explain that uninstalling deletes that app's local test data. Do not perform
   it without an explicit `YES` from Kraken.
6. Confirm Xcode sees the intended iPhone destination and signing identity.

### Expected result and evidence

- Correct device and OS.
- Developer Mode enabled.
- Legacy native forced RTL cleared or Kraken-authorised clean installation
  prepared.
- Repository unchanged by device preparation.

### Stop condition

- Device unavailable: `READY_FOR_KRAKEN_DEVICE_CONNECTION`.
- Developer Mode/pairing failure: `BLOCKED_DEVICE`.
- Signing/profile failure requiring tracked configuration change:
  `BLOCKED_SIGNING`.
- Legacy RTL cannot be cleared and uninstall is not authorised:
  `BLOCKED_DEVICE` with the exact remaining condition.

### Why

An in-place install can preserve the old app's `NSUserDefaults`. A stale
`forceRTL=true` preference would contaminate the fixed-build test and could be
mistaken for a source failure.

---

## Phase J — Local standalone Release build and install

### Proposal

Build the corrected app locally through the existing Xcode workspace, embed its
JavaScript/assets and install it on the physical device without Expo Go or a
listening Metro server.

### Actual action

1. Confirm no Metro process is listening for this project.
2. Reuse the existing Xcode workspace, scheme, signing team and successful
   standalone build route recorded in
   `docs/MOB-P1P2-IOS-STANDALONE-001.md` and its evidence.
3. Codex may open Xcode and/or use the equivalent existing `xcodebuild` and
   `devicectl` route.
4. Build `Release` for the connected physical iPhone destination.
5. Allow the existing Expo embed phase to generate the Hermes `main.jsbundle`
   and copy local assets into the app. That in-process bundling is permitted; a
   listening Metro development server is not.
6. Do not run Prebuild, change signing files or install dependencies.
7. Install the signed app on the physical iPhone.
8. Launch it once from the installed ACR app icon.
9. Record build command, configuration, scheme, destination class, signing
   result, build exit result, install result, app size if available and launch
   result. Omit complete device/account identifiers.
10. Verify the repository remains free of native/configuration changes after
    build and install.

### Expected result and evidence

- Release build exits `0`.
- Install succeeds.
- App launches from its icon.
- No Metro server is required.
- No tracked native, signing or configuration file changes.

### Stop condition

- Build failure: `BLOCKED_BUILD` with the relevant first causal error, not pages
  of unrelated log output.
- Signing/profile problem requiring configuration mutation:
  `BLOCKED_SIGNING`.
- Any repository native/config mutation: stop `BLOCKED_SCOPE` and report exact
  paths; do not commit or conceal it.

### Why

This proves the corrected JavaScript is embedded into the intended standalone
physical-device application rather than being served by Expo Go or Metro.

---

## Phase K — Physical-device functional acceptance

### Proposal

Confirm the exact physical failure is corrected under the same Release
conditions that originally exposed it.

### Actual action

Leave the installed app ready for Kraken and present this checklist:

| ID | Action | Expected result |
| --- | --- | --- |
| PHY-01 | Launch from ACR app icon with Metro stopped | Home appears and remains responsive |
| PHY-02 | Select Arabic from English/LTR | Modal closes; Arabic RTL appears immediately; no freeze |
| PHY-03 | Exercise Home controls/gestures after Arabic selection | Controls remain responsive |
| PHY-04 | Inspect both About pages in Arabic | Correct Arabic content and usable RTL presentation |
| PHY-05 | Traverse Step 1, Step 2, Step 3, P1 and P2 in Arabic | All five screens remain usable |
| PHY-06 | Reach Review using synthetic/demo inputs | Review remains intact; no clinical Result/API change |
| PHY-07 | Return Home and select English | Immediate English LTR; no restart or freeze |
| PHY-08 | Repeat English -> Arabic -> English three times | No stale modal, hang, crash or direction leakage |
| PHY-09 | Select French, Chinese, German, Japanese, Korean and Russian | Each is selectable, responsive and LTR |
| PHY-10 | Force-close and relaunch | Direction agrees with startup locale; no globally stuck RTL state |
| PHY-11 | Disconnect from Mac or otherwise remove Metro availability, then launch | App launches standalone from embedded bundle |

Codex must wait for Kraken's observations and classify each result accurately.

If a freeze or hang occurs:

1. do not immediately edit source;
2. record expected and actual result plus exact transition;
3. capture process state and focused device/Xcode logs during the event if
   possible;
4. check whether the legacy forced-RTL preference is true;
5. distinguish stale-install state from a new source defect;
6. use a remaining correction cycle only when evidence identifies a defect
   inside the permitted source scope.

### Expected result and evidence

PHY-01 through PHY-11 PASS based on Kraken's direct observation and relevant
build/device evidence.

### Stop condition

Any unresolved Release runtime failure: `BLOCKED_PHYSICAL_RUNTIME`. Do not claim
success because simulator tests passed.

### Why

The original defect was physical-Release-specific. Physical Release evidence is
therefore mandatory for final acceptance.

---

## Phase L — Final protected-scope and repository audit

### Proposal

Prove exactly what changed and that the correction did not escape its boundary.

### Actual action

Run and record:

```bash
git status --short --branch
git status --porcelain=v1 --untracked-files=all
git diff --stat "$SESSION_BASELINE_SHA"
git diff --name-status "$SESSION_BASELINE_SHA"
git diff --check "$SESSION_BASELINE_SHA"
git diff "$SESSION_BASELINE_SHA" -- package.json package-lock.json yarn.lock pnpm-lock.yaml app.json ios android
```

Also audit, using actual repository paths, that no API, gateway, inference,
attestation, ontology, SWRL/Openllet, Result, assessment-validation or locale JSON
file changed.

Inspect the complete diff for:

- accidental formatting churn;
- debug logging;
- secrets or device identifiers;
- generated files;
- swallowed errors;
- hidden restart/native direction calls;
- unrelated presentation or wording changes.

Remove only the unique disposable command-log directory created by this task.
Do not remove repository files. Ensure Metro is stopped after physical review
unless Kraken asks to keep it running.

### Expected result and evidence

Only authorised source/test paths and the evidence report are changed. All
protected audits are clean and `git diff --check` passes.

### Stop condition

Unexpected mutation: stop `BLOCKED_SCOPE`; identify the exact file and whether
it came from Codex or the build tooling. Do not reset or conceal user changes.

### Why

The final audit makes the later Kraken-controlled commit attributable,
reviewable and reversible.

---

## Phase M — Write the mandatory evidence report

### Proposal

Return executable results, not a narrative-only claim.

### Actual action

Create:

```text
docs/MOB-P1P2-AR-RTL-FREEZE-FIX-001-Evidence-Report.md
```

The report must contain these sections:

1. Terminal state.
2. Repository, branch, `SESSION_BASELINE_SHA`, local upstream equality,
   ahead/behind and cleanliness at start.
3. Accepted-ancestor checks.
4. Confirmed pre-edit failure path.
5. DD-AR-RTL-001 implementation summary: proposal, actual action, result and why.
6. Exact changed-file inventory grouped as:
   - application source;
   - tests;
   - evidence documentation;
   - unexpected files.
7. Per-file diff explanation tied to a requirement.
8. Exact commands, exit codes and concise relevant outputs.
9. Pre-edit and post-edit P1/P2, locale parity, typecheck and lint posture.
10. Remaining `reloadAsync`, `forceRTL`, `allowRTL`, `I18nManager.isRTL` and
    `expo-updates` matches, each classified.
11. Protected-scope audit.
12. Correction-cycle accounting.
13. Simulator identity, commands and SIM-01 to SIM-10 acceptance matrix.
14. Physical device class/OS, Release build/install evidence and PHY-01 to
    PHY-11 acceptance matrix.
15. Standalone/Metro-stopped evidence.
16. Residual risks and every `PARTIAL`, `FAIL`, `SKIPPED` or `NOT EVIDENCED`
    item.
17. Rollback statement: before commit, discard only the identified task diff;
    after Kraken's later commit, revert that specific commit rather than reset
    unrelated work.
18. Exact final Git status and proposed next action, not performed.

Use this acceptance classification:

| Criterion | Expected | Observed | Evidence | Verdict | Required action |
| --- | --- | --- | --- | --- | --- |
| Baseline | Exact clean session baseline | | | PASS/FAIL | |
| Scope | Only permitted paths | | | PASS/FAIL | |
| Reload removal | No active Release reload in language selection | | | PASS/FAIL | |
| Native direction removal | No active force/allow RTL mutation | | | PASS/FAIL | |
| Locale mapping | Arabic RTL; seven locales LTR | | | PASS/FAIL | |
| Modal ordering | Dismissed before awaited change | | | PASS/FAIL | |
| Automated regression | Targeted and P1/P2 checks exit 0 | | | PASS/FAIL | |
| Typecheck | No new task-attributable diagnostics | | | PASS/PARTIAL/FAIL | |
| Simulator | SIM-01 to SIM-10 | | | PASS/PARTIAL/FAIL/NOT EVIDENCED | |
| Physical Release | PHY-01 to PHY-11 | | | PASS/PARTIAL/FAIL/NOT EVIDENCED | |
| Standalone | Launches without Metro | | | PASS/FAIL/NOT EVIDENCED | |
| Repository integrity | No forbidden mutation | | | PASS/FAIL | |

Do not include full private device identifiers, Apple account identifiers,
provisioning UUIDs, tokens or secrets.

### Expected result and evidence

The report exists in the repository working tree and accurately distinguishes
automated, simulator, physical-human and missing evidence.

### Stop condition

Do not fabricate a PASS to reach a preferred terminal state. Use the legal
blocked/readiness state that the evidence supports.

### Why

Every Codex execution must return a reviewable result packet that Kraken can use
to decide the next action and Git commit.

---

## 12. Final response contract

Codex's final response must be concise and action-oriented. It must contain:

1. legal terminal state;
2. one-sentence outcome;
3. exact changed-file inventory;
4. automated check posture with exit results;
5. simulator and physical acceptance posture;
6. protected-scope result;
7. evidence-report path;
8. residual blocker/risk, if any;
9. one proposed next action, not performed.

Codex must not:

- commit or push;
- call the change accepted on Kraken's behalf;
- hide known typecheck/lint debt;
- claim physical PASS without Kraken's direct observations;
- provide pages of generic explanation in place of results.

If all required evidence passes, finish exactly with:

```text
EVIDENCE_READY_FOR_KRAKEN_ACCEPTANCE
```

Otherwise finish with the single legal terminal state that matches the actual
stopping condition.

---

## 13. Codex opening-message template for Kraken

After this instruction file is saved under `docs/`, committed and pushed by
Kraken, obtain the new full SHA. Put that SHA only in the Codex opening message
as `SESSION_BASELINE_SHA`; do not edit this file to insert it.

Use this opening message:

```text
MOB-P1P2-AR-RTL-FREEZE-FIX-001

Repository:
/Users/Kraken/DAPP/acr-mobile-companion

Required branch:
feature/mobile-v0.5-p1-p2

SESSION_BASELINE_SHA:

Accepted investigation-evidence SHA:
e0d4c8b5dadfa16bf37d63071150edaae9449a6a

Read the following instruction script completely before taking any action:

docs/MOB-P1P2-AR-RTL-FREEZE-FIX-001.md

This is an implementation, simulator-verification and physical Release rebuild
task, not a verification-only session. Confirm SESSION_BASELINE_SHA equals both
local HEAD and origin/feature/mobile-v0.5-p1-p2, then execute every authorised
phase in order.

Do not fetch, pull, install dependencies, run Prebuild, commit, push or modify
protected native/configuration/clinical/API/inference/attestation/Result scope.
```

Paste the post-push full SHA on the blank line immediately after
`SESSION_BASELINE_SHA:` before starting the new Codex session.
