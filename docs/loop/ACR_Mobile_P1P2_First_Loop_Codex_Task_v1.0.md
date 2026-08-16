# MOB-P1P2-FIRST-LOOP-001 — Codex Task Contract

**Target:** `/Users/Kraken/DAPP/acr-mobile-companion/`  
**Mode:** one Codex writer, local workspace only  
**Purpose:** deliver a reviewable iOS demo codebase containing provisional P1 and P2 assessment screens, validation, Review integration and proved non-integration with inference Results.

## 1. Start command

When instructed to execute this task, start at K0 immediately. Do not ask routine planning questions. Ask Kraken only when a legal terminal blocker below is reached.

This document is the Loop control programme. It is not a shell installer and does not require a native `/loop` command.

## 2. Authority

You may:

- read the complete target repository;
- edit source, locale and test files inside the target repository within the scope below;
- run existing local, non-destructive repository checks;
- create temporary candidate-extraction files outside the repository;
- repair in-scope failures within the stated budgets.

You may not:

- run `src/vP1P2/apply-v0.5-update.sh` against the working tree;
- discard, reset, overwrite or hide pre-existing user changes;
- access another checkout as a substitute target;
- install or upgrade dependencies, use the network, or change lockfiles merely to make checks pass;
- alter API contracts, inference, ontology/rules, Results semantics or clinical logic;
- use real patient data;
- commit, amend, tag, push, open a PR, sign, archive, deploy or distribute;
- write outside the repository except for disposable extraction/test output;
- weaken tests, lint, TypeScript, attestation, fail-closed behaviour or safety messaging.

## 3. Sources of truth

Use this precedence order:

1. Repository instructions such as `AGENTS.md` and accepted configuration.
2. Current working code, tests and repository-native contracts.
3. Approved P1/P2 contract, completeness review and validation mock-ups present in the repository.
4. `ACR_Mobile_v0.5_P1P2_Application_Guide.md`.
5. `ACR_Mobile_P1P2_Generator_Review_v0.2.md` as a known-defect register.
6. `src/vP1P2/apply-v0.5-update.sh` and its embedded outputs as candidate code only.

Never resolve a clinical, unit or wire-enum conflict by preference. If higher-precedence sources do not resolve it, return `BLOCKED_CONTRACT` with the exact field, alternatives and evidence.

## 4. In-scope outcome

The accepted flow is:

`Welcome → Step 1/5 → Step 2/5 → Step 3/5 → P1 (4/5) → P2 (5/5) → Review → existing submission/Result flow`

Required behaviour:

- Step 1–3 retain all current inputs, validation, accessibility, localisation and request behaviour apart from the intended step count/navigation change.
- P1 and P2 are visibly marked provisional, demo/testing only and not clinically accepted.
- P1/P2 values are kept in memory only and reset with the assessment.
- P1/P2 appear in a distinct provisional section on Review.
- P1/P2 do not enter the API request, inference, attestation, Results calculation or Result screen.
- Existing fail-closed and attestation behaviour is preserved.
- User-facing P1/P2 text uses the repository's existing i18n mechanism; all eight supported locales have matching keys; Arabic layout remains RTL.
- No silent clinical defaults are introduced.
- Validation follows the approved field contract. At minimum, when the approved specification says so: tumour size is finite and greater than zero; ECOG is an integer 0–4; LVEF is finite 0–100.
- Invalid values remain editable, display accessible localised errors and do not silently coerce.

Contract-sensitive fields include tumour-size unit/maximum, sex/gender wording and enum, nodal semantics, PD-L1, HER2-low and treatment intent. Use only proved contracts.

## 5. Permitted application surfaces

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

Test files may be added or updated in the repository's established test locations. Do not force edits to every listed file if the current repository already contains an accepted equivalent. Make the smallest coherent diff.

Protected application surfaces include `ResultScreen.tsx`, all API files, app/build configuration, shared components, themes, utilities, native iOS project files, dependency manifests and lockfiles. Read them to prove compatibility; do not modify them unless Kraken separately changes the task authority.

## 6. Known defects to verify

Independently confirm the review findings before using any candidate code:

- navigator backup uses `.ts` while the write target is `.tsx`;
- candidate screens use hard-coded English rather than i18n;
- French transparency copy contains German text;
- Step 2 and Step 3 candidate replacements may delete existing controls;
- initial ER/PR/HER2 values may silently default to positive;
- P1 gender, nodal-blocker and Next behaviour conflict with the guide;
- segmented ECOG cannot exercise the guide's invalid value 5;
- `as any` bypasses candidate enum typing;
- Review may alter build identity or break the attestation/Submit lifecycle;
- reset, accessibility and automated coverage are not proved.

A candidate defect is not authority to redesign unrelated code. Preserve the live baseline.

## 7. Finite Loop

### K0 — Baseline and guardrails

Perform read-only work first:

1. Confirm `pwd` resolves to the exact target repository and identify the Git root.
2. Read all applicable repository instruction files before acting.
3. Record branch, HEAD SHA and `git status --short`; do not modify Git state.
4. If an unexpected pre-existing change overlaps an intended edit, stop `BLOCKED_BASELINE` and list it. Do not stash or revert it.
5. Discover the package manager, scripts, TypeScript/lint/test configuration, i18n architecture, navigation, state/reset lifecycle, request mapper, attestation flow and Result boundary.
6. Locate and read the guide, completeness review, validation mock-ups, generator review and generator.
7. Record the commands that can run locally without installation or network access.

K0 exit: a concise baseline, current-flow map, protected-path confirmation and any contract gaps.

### K1 — Candidate and contract audit

1. Parse or extract the generator's 16 quoted heredoc bodies into a unique temporary directory. Do **not** execute the generator and do not fake `HOME`.
2. Prove the candidate manifest has exactly the expected 16 paths and no traversal or extra write target.
3. Validate the eight JSON candidates and key parity.
4. Diff candidates against the current repository one file at a time.
5. Build a field matrix with: field, required/optional, type, unit, allowed values, validation, initial value, persistence, Review display, request mapping and source citation.
6. Resolve conflicts by the source precedence in section 3.
7. Choose a minimal implementation plan. Do not copy whole candidate files where a focused patch preserves more current behaviour.

K1 exit:

- `READY_TO_IMPLEMENT`; or
- `BLOCKED_CONTRACT`, `BLOCKED_BASELINE` or `BLOCKED_SCOPE` with precise evidence.

### K2 — Minimal implementation

If K1 is ready:

1. Extend state with strongly typed P1/P2 data and a complete reset path. Preserve all accepted existing state fields and defaults.
2. Register P1/P2 routes and change only the intended navigation edges and step counts.
3. Implement P1/P2 with existing components and i18n conventions. Do not use `any` to force clinical enums.
4. Make optional segmented choices clearable if empty is a supported state.
5. Implement approved validation with localised, accessible feedback.
6. Add distinct provisional P1/P2 Review summaries while preserving request construction, attestation and submission.
7. Add only the required locale keys to all eight locale files; correct proved cross-language contamination in changed keys.
8. Add/update tests using existing repository patterns. At minimum prove:
   - valid and invalid numeric boundaries;
   - reset/new-assessment clearing;
   - navigation order;
   - Review display;
   - exact request shape contains no P1/P2 fields;
   - Result behaviour and existing Step 1–3 behaviour remain unchanged;
   - locale key parity and fallback/RTL behaviour where the current harness supports it.
9. Inspect the diff immediately. If a protected file changed or unrelated behaviour was removed, repair before K3.

K2 exit: coherent code plus tests, not merely generated files.

### K3 — Verify and bounded repair

Run the repository's existing local commands in this order, adapting names to the discovered package scripts:

1. locale JSON parse and key-parity check;
2. formatter/check mode, if configured;
3. `git diff --check`;
4. TypeScript/typecheck;
5. lint;
6. targeted P1/P2 tests;
7. full automated test suite;
8. existing non-signing iOS/Expo build or diagnostic check that does not install, sign or deploy.

For each failure:

1. capture the exact command, exit status and relevant error;
2. classify it as introduced, baseline/environmental or contract/scope;
3. make one focused in-scope repair;
4. rerun the narrow failing check, then the broader required checks.

Budgets:

- maximum four repair cycles in total;
- maximum two materially identical failures before `BLOCKED_STALLED`;
- maximum three hours elapsed;
- maximum 120 tool actions;
- zero network installs and zero scope expansion.

Do not weaken a check or mark success because an unavailable environment prevented it.

### K4 — Final audit and return

1. Re-run `git status --short`, `git diff --check`, required static checks and tests.
2. Review the complete diff, including untracked files.
3. Prove only authorised files changed and pre-existing changes remain intact.
4. Search the request/mapper and candidate diff for P1/P2 field names; demonstrate they are excluded.
5. Confirm `ResultScreen.tsx`, API, inference, app configuration, dependencies and lockfiles did not change.
6. Confirm all user-facing new strings use i18n and all eight locale files retain key parity.
7. Confirm no commit, tag, push, signing or deployment occurred.
8. Return the evidence packet below and stop for Kraken's human test.

## 8. Legal terminal states

- `READY_FOR_KRAKEN_IOS_REVIEW`: all available automated acceptance checks pass; any simulator-only step is clearly assigned to Kraken.
- `BLOCKED_BASELINE`: overlapping or unsafe pre-existing repository state.
- `BLOCKED_CONTRACT`: a clinical/unit/enum decision lacks an approved source.
- `BLOCKED_SCOPE`: completion requires changing a protected surface.
- `BLOCKED_ENVIRONMENT`: a required local check cannot run without installation, network, signing or unavailable tooling.
- `BLOCKED_STALLED`: repair or action budget exhausted.
- `FAILED_SAFETY`: an invariant was violated; stop immediately and report it.

Never report “done”, “complete” or “ready” without one of these exact states.

## 9. Required evidence packet

Return one concise final report containing:

1. terminal state and one-sentence outcome;
2. baseline branch, original HEAD and original dirty-state record;
3. generator verdict and exact candidate manifest count;
4. contract decisions and unresolved items;
5. changed files grouped as source, locale and tests;
6. protected files checked and unchanged;
7. every validation command with pass/fail/blocked result;
8. acceptance table for flow, validation, reset, i18n/RTL, accessibility, request exclusion, attestation and Results preservation;
9. repair-cycle count and residual risks;
10. exact human iOS checklist;
11. explicit statement: “No commit, tag, push, signing or deployment was performed.”

End with exactly one requested human action: inspect the diff and run the iOS checklist, or resolve the stated blocker.
