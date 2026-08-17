# MOB-P1P2-FIRST-LOOP-001 — Codex Task Contract v1.1

**Status:** Approved execution candidate  
**Supersedes:** `ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.0.md`  
**Target repository:** `/Users/Kraken/DAPP/acr-mobile-companion/`  
**Execution surface:** Codex extension in VS Code, working locally on the opened repository  
**Terminal success state:** `READY_FOR_KRAKEN_SIMULATOR_REVIEW`

## 1. Objective

Update the current working ACR Mobile demo/testing application from three New Assessment input screens to five by adding provisional P1 and P2 screens, their approved validation, state, navigation, Review display, eight-language localisation and regression tests.

Deliver a complete working-tree implementation that runs successfully through Expo/Metro on the iOS Simulator and is ready for Kraken's human simulator review.

This Loop does not package or install the subsequent standalone physical-iPhone build.

## 2. Accepted baseline facts

Treat these as supplied build-history facts, then verify the repository is consistent with them:

- The existing three-screen application is working.
- The application is React Native with Expo and supports iOS and Android.
- `expo-dev-client` was installed successfully and is expected to be pinned in `package.json` and the lockfile.
- The icon and `app.json` configuration are already complete.
- `npx expo prebuild --platform ios` was previously run successfully and produced the native iOS project.
- `npx expo run:ios --device "iPhone 13"` previously built and installed the development client on the physical iPhone.
- Expo/Metro operation through USB and Wi-Fi was proved.
- A subsequent standalone iOS app was proved by Kraken.
- The exact standalone Release-packaging procedure is intentionally deferred to `MOB-P1P2-IOS-PACKAGE-001` after simulator acceptance.

Preserve this working stack. Do not replace, upgrade, modernise or reconfigure it unless completion is otherwise impossible and the reason is supported by repository evidence.

## 3. Authority and exclusions

You may:

- read the complete target repository;
- edit authorised source, locale and test files inside it;
- run existing local, non-destructive scripts and tests;
- start the existing Expo/Metro development server;
- launch and test the application in the iOS Simulator using installed local tooling;
- run one remote-read comparison, `git fetch --prune origin`, if the repository has an accepted `origin` and approval is available;
- extract the 16 generator candidates into a unique temporary directory without executing the generator.

You may not:

- work in `acr-mobile-companion-extended` or another checkout;
- run `src/vP1P2/apply-v0.5-update.sh` against the repository;
- discard, reset, overwrite, stash or hide pre-existing user changes;
- install, remove or upgrade dependencies;
- change `package.json`, a lockfile, Expo/React Native versions, `app.json`, Metro configuration, Pods, the native iOS project or build tooling;
- run Expo Prebuild, especially `prebuild --clean`, unless an unavoidable native requirement is proved and Kraken gives new authority;
- alter API contracts, inference, ontology/SWRL, attestation semantics or Result semantics;
- use real patient data;
- pull, merge, rebase, commit, amend, tag, push, open a PR, sign, archive, package, install on a physical device, deploy or release;
- weaken tests, type safety, validation, fail-closed behaviour or safety messaging.

If an excluded action is genuinely required, stop `BLOCKED_SCOPE` with the exact evidence. Do not perform it first and explain afterwards.

## 4. Source precedence

Resolve conflicts in this order:

1. Applicable repository instructions, including `AGENTS.md`.
2. Current working source, tests, configuration and proved three-screen behaviour.
3. Approved P1/P2 field contract, Input Completeness Review and validation mock-ups present in the repository.
4. `ACR_Mobile_v0.5_P1P2_Application_Guide.md`.
5. `docs/loop/ACR_Mobile_P1P2_Generator_Review_v0.2.md` as the known-defect register.
6. `src/vP1P2/apply-v0.5-update.sh` and its embedded outputs as candidate code only.

Never invent a clinical enum, unit, required/optional rule or wire value. Stop `BLOCKED_CONTRACT` if higher-precedence sources do not resolve one.

## 5. Non-negotiable functional invariants

- Existing accepted Step 1–3 inputs, defaults, validation, accessibility and localisation remain working.
- The flow becomes `Welcome → Step 1/5 → Step 2/5 → Step 3/5 → P1/5 → P2/5 → Review → existing submission/Result`.
- P1/P2 are visibly provisional, synthetic-data/demo-testing only and not clinically accepted.
- P1/P2 state is in memory only and clears through the accepted assessment-reset lifecycle.
- P1/P2 appear separately on Review.
- P1/P2 do not enter the inference request, attestation, reasoner, Result calculation or Result screen.
- Existing API, fail-closed and attestation behaviour remains unchanged.
- All new user-facing strings use the existing i18n system; the eight existing locale resources retain matching key sets; Arabic retains established RTL behaviour.
- No silent clinical defaults are introduced.
- Approved numeric rules are enforced without silent coercion. At minimum, where confirmed by the field contract: tumour size is finite and greater than zero; ECOG is an integer from 0 to 4; LVEF is finite from 0 to 100.
- Invalid values remain editable and display accessible, localised feedback.
- No native or dependency change is expected for this TypeScript/JSON feature.

## 6. Expected application surfaces

The expected application inventory is 14 existing files plus 2 new files:

- `src/store/assessmentStore.ts`
- `src/navigation/AppNavigator.tsx`
- `src/screens/Step1ReceptorsScreen.tsx`
- `src/screens/Step2TumourScreen.tsx`
- `src/screens/Step3MarkersScreen.tsx`
- `src/screens/P1Screen.tsx`
- `src/screens/P2Screen.tsx`
- `src/screens/ReviewScreen.tsx`
- `src/locales/en-GB.json`
- `src/locales/fr-FR.json`
- `src/locales/de-DE.json`
- `src/locales/ru-RU.json`
- `src/locales/ar-SA.json`
- `src/locales/zh-CN.json`
- `src/locales/ko-KR.json`
- `src/locales/ja-JP.json`

Tests may be added or updated only in established repository test locations. Do not force a change to every listed file if the current code already contains the accepted result.

Protected surfaces include:

- `ResultScreen.tsx`;
- API and inference files;
- shared components unless an existing component defect makes P1/P2 impossible and new authority is obtained;
- `package.json` and lockfiles;
- `app.json`/`app.config.*`, Metro and Babel configuration;
- `ios/`, Pods and native build files;
- themes and unrelated utilities.

Read protected files to prove compatibility; do not edit them.

## 7. Finite automated Loop

### K0 — Repository, Git and build architecture

Perform read-only discovery before any source edit:

1. Confirm `pwd`, the canonical Git root and the exact target repository.
2. Read all applicable instruction files.
3. Record current branch, HEAD SHA and `git status --short --branch`.
4. Record `git remote -v` and the current upstream. Do not change the remote.
5. If authorised and `origin` is correct, run `git fetch --prune origin`, then record `git rev-list --left-right --count HEAD...@{upstream}`.
6. If the repository is behind, diverged, lacks the expected upstream, or contains an unexpected overlapping change, stop `BLOCKED_GIT_BASELINE`. Do not pull, merge, stash or reset.
7. Inspect `package.json`, the lockfile, Expo/React Native and `expo-dev-client` versions, application config, Metro/Babel config, native-directory policy, Pod/workspace/scheme presence and repository scripts.
8. Determine whether `ios/` is generated-only or contains direct native modifications that Prebuild could overwrite.
9. Map navigation, state, reset, i18n, validation, Review/request, attestation and Result boundaries.
10. State explicitly whether the repository confirms the accepted build history.

K0 exit: `BASELINE_UNDERSTOOD` or a legal blocker.

### K1 — Prove the current three-screen business baseline

Before implementation:

1. Discover and run the existing static checks and automated tests without installation.
2. Start the existing Expo/Metro flow with the locally installed toolchain.
3. Launch the current application in the iOS Simulator. Do not run Prebuild merely to launch it.
4. Verify, as far as automation and simulator control permit:
   - Welcome and new-assessment entry;
   - Step 1 → Step 2 → Step 3 → Review;
   - existing fields and validation;
   - eight-language selector and Arabic RTL;
   - reset/new-assessment clearing;
   - Review request construction;
   - attestation/fail-closed handling;
   - Result boundary.
5. Add characterisation tests only when an established test location and framework already exist and the tests are necessary to protect behaviour during the feature change.
6. Record every unverified item as `NOT_EVIDENCED`; do not convert it to a pass.

K1 exit: `BUSINESS_BASELINE_VERIFIED` or a legal blocker.

### K2 — Contract and engineering readiness

1. Parse or extract the generator's 16 quoted heredoc outputs into a unique temporary directory without executing it.
2. Prove the manifest contains exactly the expected 16 paths and no extra/traversal target.
3. Validate candidate locale JSON and key parity.
4. Diff each candidate against current source; independently confirm the defects recorded in the Generator Review.
5. Build a field-contract matrix: field, purpose, required/optional, type, unit, allowed values, initial value, validation, reset, Review display, persistence and API/Result mapping.
6. Review engineering structure for issues that materially block safe P1/P2 implementation.
7. Refactor before feature work only when all are true:
   - a concrete blocker is evidenced;
   - the change preserves observable business behaviour;
   - characterisation tests protect it;
   - it remains within an authorised application surface;
   - one focused cycle can correct it.
8. Do not perform cosmetic, speculative or general architecture refactoring.
9. Produce the smallest coherent implementation plan.

K2 exit: `READY_TO_IMPLEMENT`, `BLOCKED_CONTRACT` or `BLOCKED_SCOPE`.

### K3 — Minimal P1/P2 implementation

1. Extend state with strongly typed P1/P2 data and complete reset behaviour while preserving existing fields and accepted defaults.
2. Register P1/P2 routes and make only the intended step-count/navigation changes.
3. Implement P1/P2 with existing components and i18n conventions. Do not use `any` to force clinical enums.
4. Ensure optional controls can return to empty where the contract permits an empty value.
5. Implement approved validation and accessible localised feedback.
6. Add distinct provisional P1/P2 Review summaries while preserving request construction, attestation and submission.
7. Add only necessary locale keys across the eight resources; correct proved contamination in changed keys.
8. Add/update tests for numeric boundaries, navigation, reset, Review display, exact request exclusion, Result preservation, locale parity and current Step 1–3 regression.
9. Inspect the diff immediately. Repair unauthorised or unrelated changes before K4.

K3 exit: complete code plus tests, not merely 16 generated files.

### K4 — Verification, maximum three correction cycles, and final audit

Run repository-native checks in the discovered order, including:

1. locale parse and key parity;
2. formatter/check mode, if configured;
3. `git diff --check`;
4. TypeScript/typecheck;
5. lint;
6. targeted P1/P2 tests;
7. the complete existing test suite;
8. Expo/Metro startup using installed local tooling;
9. iOS Simulator build/launch;
10. the five-screen flow and available simulator acceptance checks.

Correction algorithm:

1. Capture the exact failing command, exit status and relevant output.
2. Classify it as introduced, baseline/environmental, contract or scope.
3. Make one focused in-scope correction.
4. Re-run the narrow failure and then the required broader checks.

Budgets:

- maximum three correction cycles total;
- maximum two materially identical failures before `BLOCKED_STALLED`;
- maximum three hours elapsed;
- maximum 120 tool actions;
- zero dependency installation, Prebuild, native mutation or unapproved scope expansion.

Final audit:

- inspect complete staged, unstaged and untracked diff;
- prove only authorised files changed;
- prove pre-existing changes remain intact;
- prove P1/P2 are absent from request and Result derivation;
- prove protected files did not change;
- prove all new visible strings use i18n;
- record final Git branch, HEAD and ahead/behind count;
- confirm no pull, merge, commit, tag, push, signing, packaging, physical installation or deployment occurred.

## 8. Legal terminal states

- `READY_FOR_KRAKEN_SIMULATOR_REVIEW`: code, tests and locally available checks pass; Expo/Metro launches the updated application in the iOS Simulator; the evidence packet is complete.
- `BLOCKED_GIT_BASELINE`: local/remote Git state or overlapping changes are unsafe.
- `BLOCKED_BASELINE`: the current application baseline cannot be proved safely.
- `BLOCKED_CONTRACT`: an approved field contract is missing or contradictory.
- `BLOCKED_SCOPE`: completion requires a protected or unauthorised change.
- `BLOCKED_ENVIRONMENT`: an existing required check cannot run without installation, Prebuild, native mutation or unavailable tooling.
- `BLOCKED_STALLED`: the correction/action budget is exhausted.
- `FAILED_SAFETY`: an invariant was breached; stop immediately.

Never report “done”, “complete” or “ready” without one exact terminal state.

## 9. Required evidence packet

Return one final report containing:

1. terminal state and one-sentence outcome;
2. Git root, branch, original/final HEAD, remote identity and ahead/behind evidence;
3. original dirty-state record and confirmation it was preserved;
4. discovered Expo/React Native/dev-client/native build architecture;
5. three-screen baseline evidence obtained before edits;
6. generator/candidate verdict and exact 16-path count;
7. field-contract decisions and unresolved items;
8. changed files grouped as source, locale and tests;
9. protected files checked and unchanged;
10. every validation command with `PASS`, `FAIL`, `BLOCKED` or `NOT_EVIDENCED`;
11. simulator launch and five-screen flow evidence;
12. correction-cycle history and residual risks;
13. exact Kraken simulator checklist;
14. the statement: “No pull, merge, commit, tag, push, dependency installation, Prebuild, native mutation, signing, packaging, physical-device installation or deployment was performed.”

End with one requested human action: inspect the uncommitted diff and run the simulator checklist, or resolve the stated blocker.

## 10. Deferred gates

After Kraken accepts the simulator result:

1. Git promotion is performed separately under Kraken's authority using GitHub Desktop or newly granted Codex authority.
2. Standalone iOS packaging and physical iPhone 13 acceptance are performed separately as `MOB-P1P2-IOS-PACKAGE-001`.
3. Android packaging and device acceptance remain a later separate task.
