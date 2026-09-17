# MOB-P1P2-FIRST-LOOP-001 — Codex Implementation Task v1.4

**Status:** Prepared execution candidate — active only after Kraken's pre-Loop review
**Supersedes:** `ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.3.md`
**Repository:** `/Users/Kraken/DAPP/acr-mobile-companion/`
**Canonical remote:** `https://github.com/KY-BChain/ACR-Mobile-Companion` (public)
**Working material:** `/Users/Kraken/DAPP/acr-mobile-companion/vP1P2/`
**Execution:** Codex extension in VS Code, local workspace
**Success state:** `READY_FOR_KRAKEN_SIMULATOR_REVIEW`

## 1. What Codex must deliver

Update the current working ACR Mobile demo/testing application from three New Assessment input screens to five by adding P1 and P2.

The completed local working tree must provide:

- `Welcome → Step 1/5 → Step 2/5 → Step 3/5 → P1/5 → P2/5 → Review → existing submission/Result`;
- the current provisional P1/P2 fields and validations defined below;
- P1/P2 state held in memory and cleared by the existing assessment reset lifecycle;
- separate provisional P1 and P2 sections on Review;
- all new visible text in the existing eight-language system;
- no P1/P2 data in the API request, attestation, reasoner processing or Result derivation;
- regression evidence for Step 1–3, navigation, reset, languages, request exclusion and Result preservation;
- a successful Expo/Metro launch in the iOS Simulator;
- a five-page, eight-language About explanation of what the ACR Platform is and how it works, while preserving the existing build/baseline information;
- a complete uncommitted diff and evidence report for Kraken.

This task does not package or install a standalone physical-iPhone application.

## 2. How Codex must work

### 2.1 Source order

When information differs, use this order:

1. Applicable repository instructions such as `AGENTS.md`.
2. Current working source, tests, configuration and proved three-screen behaviour.
3. This v1.4 Implementation Task.
4. `vP1P2/ACR_Mobile_Input_Completeness_Review_v0.5.md`.
5. `vP1P2/ACR_Mobile_P1_P2_Validation_Mockups_v0.5.html`.
6. `vP1P2/ACR_Mobile_P1P2_Generator_Review_v0.5.md`.
7. `vP1P2/ACR_Mobile_v0.5_P1P2_Application_Guide.md` as requirements/reference only; its replacement, Git, tagging and push procedures are superseded.
8. The generator and its embedded files as candidate material only.

Do not invent a new field, enum, unit, clinical threshold, API mapping or Result rule.

### 2.2 Permitted work

Codex may:

- read the complete repository;
- edit authorised application, locale and verification files;
- run existing non-destructive checks;
- create narrowly scoped zero-dependency verification under `tests/p1p2/` if no test runner exists;
- use only the already-installed Node.js and TypeScript toolchain;
- start the existing Expo/Metro flow and iOS Simulator;
- run one `git fetch --prune origin` after verifying the remote and receiving approval;
- extract the generator's heredoc bodies to a unique disposable directory under `/tmp` without executing the generator.

### 2.3 Forbidden work

Codex must not:

- execute `vP1P2/apply-v0.5-update.sh` against the repository;
- replace the live files wholesale with generator output;
- install, remove or upgrade dependencies;
- change `package.json`, lockfiles, Expo/React Native versions, `app.json`, Metro/Babel configuration, Pods or native projects;
- run Expo Prebuild, especially `prebuild --clean`;
- alter API, inference, ontology/SWRL, attestation or Result semantics;
- use real, coded or pseudonymised patient data;
- discard, reset, stash, overwrite or hide pre-existing user changes;
- pull, merge, rebase, commit, amend, tag, push or open a pull request;
- sign, package, install on a physical device, deploy or release;
- edit `acr-mobile-companion-extended` or another repository.

If completion genuinely requires a forbidden action, stop `BLOCKED_SCOPE` and report the exact evidence.

## 3. Baseline that Codex must verify

At 17 August 2026, before the v1.4 preparation commit, public `origin/main` was:

`557aff786dbe7ff8fdb51acb31ac05347d800284`

This is a preparation reference, not the execution pin. The execution baseline is the full `origin/main` SHA after Kraken commits and pushes the final v1.4 preparation files and creates the authorised feature branch from that exact commit.

K0 must prove:

- Git root is `/Users/Kraken/DAPP/acr-mobile-companion`;
- `origin` identifies `KY-BChain/ACR-Mobile-Companion`;
- the authorised feature branch begins at the current full `origin/main` SHA;
- `git rev-list --left-right --count HEAD...origin/main` is `0 0` before source edits;
- the working tree is clean at task start;
- the application is React Native with Expo and uses the existing native iOS project;
- the eight active locale files are under `src/i18n/locales/`;
- `src/i18n/locales/en-GB.json` is the source/template locale;
- current Step 1–3, navigation, state, reset, Review/request, attestation and Result boundaries are understood.

Repository inspection does not re-prove the historical physical-device build. Record that history as supplied by Kraken and prove the locally available baseline separately.

## 4. Approved provisional P1/P2 behaviour

These values are authorised for the v0.5 synthetic-data demo only. They are not clinically confirmed and must be presented to clinical partners, including ZZU, for later advice and confirmation.

### 4.1 P1

| Field | Local representation | Demo behaviour |
|---|---|---|
| `tumorSize` | String input parsed as a finite decimal | Empty is permitted because clinical requiredness is unresolved. If entered, it must be greater than zero. Display `unit pending`; do not infer or append a unit. |
| `gender` | `female`, `male`, `other`, `unknown`, or empty | Provisional selectable enum. No default. Empty shows a non-blocking pending message; it does not prevent P1 → P2 navigation. |
| Nodal mapping warning | Informational | Display that N0–N3 must not be silently mapped to positive/negative. It does not block this UI-only flow because P1/P2 are excluded from requests. It remains a blocker for later API mapping. |

An invalid non-empty tumour-size value blocks Next and displays an accessible localised error.

### 4.2 P2

| Field | Local representation | Demo behaviour |
|---|---|---|
| `ecogScore` | Empty or integer `0`–`4` | Optional. Invalid non-empty values block Review. The UI or validator must make the invalid `5` test exercisable. |
| `pdl1Status` | `positive`, `negative`, `not_tested`, or empty | Optional provisional enum; deselection/empty must remain possible. |
| `her2Low` | `positive`, `negative`, `unknown`, or empty | Optional provisional enum; deselection/empty must remain possible. |
| `lvef` | Empty or finite decimal `0`–`100` | Optional. Invalid non-empty values block Review. |
| `treatmentIntent` | `neoadjuvant`, `adjuvant`, `unspecified`, or empty | Optional provisional enum; deselection/empty must remain possible. |

Do not use `any` to force enum assignments. Define strong local types and preserve the ability to clear optional values.

### 4.3 Common rules

- P1/P2 must be visibly labelled provisional and synthetic-data/demo only.
- No new clinical default is permitted.
- Malformed, `NaN`, infinite, mixed-text and out-of-range numeric input must be rejected without clamping, rounding or coercion.
- Invalid values remain editable and their errors must be accessible and localised.
- P1/P2 must be reset with the rest of the assessment.
- P1/P2 must appear separately on Review.
- P1/P2 must be absent from the request payload and Result derivation.

## 5. About explanation

The Home screen is `src/screens/WelcomeScreen.tsx`. Its existing About action navigates to the existing `About` route, and the current `src/screens/AboutScreen.tsx` already displays application build, service, baseline-attestation and data-handling information. Preserve that entry path and route. Extend the existing About screen; do not create assessment-style P1/P2 About routes and do not add another navigation container.

Use internal pagination labelled `About 1 of 5` through `About 5 of 5`. Each page must fit the current small-screen layout through existing scrolling or responsive layout. Opening About starts at page 1. Cancel or Close returns to `Welcome`. Back and Next move only within About.

All titles, text, page indicators and buttons must use the active selected language. Add matching keys to all eight active locale resources, using English (UK) as the source/template. The seven translations are provisional application translations pending language/clinical review; key parity and readable layout are mandatory.

### About 1 of 5 — What the ACR Platform is

**Title:** What the ACR Platform is
**Source text:** ACR Platform is an investigational clinical decision-support platform. Clinical partners and clinical-trials experts guide the clinical facts collected and review its governed medical knowledge model and decision-support rules. It supports clinical judgement; it does not replace diagnosis, treatment decisions or the responsible clinician.

### About 2 of 5 — How it works

**Title:** How ACR works
**Source text:** An authorised user enters approved structured clinical facts. The companion app sends only the approved assessment request to the connected ACR service. The ACR Platform applies its ontology and clinician-reviewed SWRL rules through the Openllet reasoner. It returns decision-support results with the rules that fired and reasoning provenance for review. Where enabled, the optional Bayesian layer can add a confidence estimate without replacing the rule-based explanation.

### About 3 of 5 — Data Stays. Rules Travel.

**Title:** Data Stays. Rules Travel.
**Source text:** In a clinical deployment, ACR is designed so patient data remains within authorised clinical infrastructure while governed knowledge and rules are deployed to where the data is held. This mobile demo uses synthetic data only and does not demonstrate a production patient-data connection.

### About 4 of 5 — Explainability and this demo

**Title:** Explainability and safety
**Source text:** ACR results are decision support only. The app can show recommendations, fired rules, reasoning mode and baseline identity so the result can be reviewed. P1 and P2 are provisional demo fields in this version and are not sent to the API or used to produce the Result. Do not enter real, coded or pseudonymised patient information.

### About 5 of 5 — Build and verified baseline

Preserve the current About screen's application, service, baseline-attestation and data-handling information. Preserve its live attestation values and existing unavailable-state behaviour. Do not hard-code new version, reasoner, gateway, hash or verification claims.

Accessibility requirements:

- page title and `About {{current}} of {{total}}` are announced/readable;
- navigation controls have clear labels and roles;
- focus moves sensibly after page change;
- text is not clipped at supported text scaling;
- Arabic uses the established RTL behaviour;
- leaving About does not change assessment state, attestation state or the selected language.

## 6. Expected application files

The expected application inventory is 15 existing files plus two new assessment screens, 17 application files in total:

1. `src/store/assessmentStore.ts`
2. `src/navigation/AppNavigator.tsx`
3. `src/screens/Step1ReceptorsScreen.tsx`
4. `src/screens/Step2TumourScreen.tsx`
5. `src/screens/Step3MarkersScreen.tsx`
6. `src/screens/P1Screen.tsx` — new
7. `src/screens/P2Screen.tsx` — new
8. `src/screens/ReviewScreen.tsx`
9. `src/screens/AboutScreen.tsx`
10. `src/i18n/locales/en-GB.json`
11. `src/i18n/locales/fr-FR.json`
12. `src/i18n/locales/de-DE.json`
13. `src/i18n/locales/ru-RU.json`
14. `src/i18n/locales/ar-SA.json`
15. `src/i18n/locales/zh-CN.json`
16. `src/i18n/locales/ko-KR.json`
17. `src/i18n/locales/ja-JP.json`

Do not force a change to an existing file when its current code already satisfies the requirement. Verification files under `tests/p1p2/` are additional to this application inventory.

Protected files include `ResultScreen.tsx`, API/inference files, `package.json`, lockfiles, application configuration, `ios/`, Pods and native build files. Read them to prove compatibility; do not edit them.

## 7. Finite autonomous Loop

### K0 — Understand repository and build

1. Verify path, Git root, branch, full HEAD, status, remote and upstream.
2. If approved, fetch once and prove the starting branch point equals `origin/main` with `0 0` divergence.
3. Stop `BLOCKED_GIT_BASELINE` for unexpected dirt, divergence, missing upstream identity or overlapping edits. Do not repair automatically.
4. Inspect package scripts, installed versions, Expo configuration, native iOS project and simulator route.
5. Map navigation, store/reset, localisation, validation, Review/request, attestation, Result and the existing Welcome → About → Welcome behaviour.
6. Record whether repository evidence is consistent with Kraken's build history.

Exit: `BASELINE_UNDERSTOOD` or a legal blocker.

### K1 — Prove the existing three-screen baseline

1. Run configured static checks without installing anything.
2. Start the existing Expo/Metro flow and launch the current app in the iOS Simulator without Prebuild.
3. Check Welcome, Step 1–3, Review, the existing About screen, current validations, all eight languages, Arabic RTL, reset, request construction, attestation/fail-closed and Result boundary as far as automation permits.
4. Mark anything not directly exercised as `NOT_EVIDENCED`.

Exit: `BUSINESS_BASELINE_VERIFIED` or a legal blocker.

### K2 — Compare candidate material and plan minimal edits

1. Parse the generator's 16 heredoc outputs into a unique `/tmp` directory without running the generator.
2. Verify exactly 16 candidate paths and reject path traversal or additional outputs.
3. Diff candidates against current source.
4. Apply `ACR_Mobile_P1P2_Generator_Review_v0.5.md`, including the incorrect generated locale destination.
5. Build a concise field matrix covering type, optionality, allowed provisional values, validation, reset, Review display and request exclusion.
6. Build an About-content/key map for all five pages and all eight locales, preserving the existing live build/baseline cards on page 5.
7. Plan minimal patches. Refactor only when a proved blocker prevents safe implementation; do not perform general modernisation.
8. Remove the disposable extracted candidates after the comparison/evidence is complete.

Exit: `READY_TO_IMPLEMENT`, `BLOCKED_SCOPE` or `BLOCKED_BASELINE`.

### K3 — Implement P1/P2 and About

1. Extend strongly typed in-memory state and reset.
2. Add P1/P2 navigation while preserving the existing attestation lifecycle and the single `NavigationContainer` in `App.tsx`.
3. Update Step 1–3 counters and Step 3 navigation only where required.
4. Implement the approved provisional P1/P2 behaviour using current components and i18n conventions.
5. Extend Review without changing request construction or Result processing.
6. Add keys to `src/i18n/locales/en-GB.json`, then maintain matching key structure in the seven other active locale files.
7. Preserve the selector and Arabic RTL behaviour.
8. Add available regression verification. If no runner exists, use a zero-dependency approach under `tests/p1p2/` without package changes.
9. Extend the existing `AboutScreen.tsx` with five internally paginated, localised pages; retain the existing About route and live build/baseline behaviour.
10. Add or update verification for About page order, Home return, eight-locale key parity and preservation of assessment/attestation state.
11. Inspect the complete diff and remove unrelated or unauthorised changes.

Exit: implementation plus verification evidence, not merely generated files.

### K4 — Verify and correct, maximum three cycles

Run, where configured and available:

1. locale JSON parsing and eight-file key parity;
2. `git diff --check`;
3. TypeScript/typecheck;
4. lint;
5. P1/P2 zero-dependency or existing repository tests;
6. existing full test suite, if one exists;
7. Expo/Metro startup;
8. iOS Simulator launch;
9. five-screen assessment flow, validation, Back preservation, reset, localisation, request exclusion, attestation and unchanged Result behaviour;
10. Welcome → About 1–5 → Welcome flow in all eight languages, including Arabic RTL and preserved live baseline information.

For each failure:

1. capture command, exit status and relevant output;
2. classify introduced, baseline/environmental, specification or scope;
3. make one focused in-scope correction;
4. re-run the narrow failure and required broader checks.

Budgets:

- maximum three correction cycles total;
- maximum two materially identical failures;
- maximum three elapsed hours;
- maximum 120 tool actions;
- zero dependency installation, Prebuild or native mutation.

## 8. Legal terminal states

- `READY_FOR_KRAKEN_SIMULATOR_REVIEW`
- `BLOCKED_GIT_BASELINE`
- `BLOCKED_BASELINE`
- `BLOCKED_SCOPE`
- `BLOCKED_ENVIRONMENT`
- `BLOCKED_STALLED`
- `FAILED_SAFETY`

Never report merely “done” or “complete”.

## 9. Required evidence return

Return:

1. exact terminal state and one-sentence outcome;
2. Git root, branch, full starting HEAD, full `origin/main`, remote and starting `0 0` evidence;
3. starting dirty-state evidence;
4. discovered build architecture and commands;
5. K1 three-screen baseline results;
6. generator comparison and exact candidate count;
7. provisional field matrix;
8. changed-file inventory grouped into source, locale and verification;
9. protected files checked and unchanged;
10. every command/check with `PASS`, `FAIL`, `BLOCKED` or `NOT_EVIDENCED`;
11. simulator launch, five-screen assessment evidence and five-page About evidence in all eight languages;
12. correction-cycle record and residual risks;
13. Kraken's exact simulator checklist;
14. confirmation that no pull, merge, rebase, stash, reset, dependency installation, Prebuild, native mutation, commit, tag, push, signing, packaging, physical installation or deployment occurred.

End with one action for Kraken: inspect the uncommitted diff and complete the simulator checklist, or resolve the stated blocker.

## 10. Housekeeping

- Keep only the current implementation instructions and current supporting specifications directly under `vP1P2/`.
- Move superseded instruction versions to `vP1P2/archive/` at each accepted milestone.
- Do not retain extracted generator candidates, temporary backup folders, Metro logs or build artefacts in the repository.
- An empty `docs/loop/` directory need not be retained because Git does not track empty directories.

## 11. Why these boundaries exist

This is the first bounded Codex Loop for a working demo application. Minimal patches, explicit evidence and human simulator acceptance protect the proved React Native/Expo/iOS stack while the provisional clinical fields and multilingual explanatory text await later partner review. Git promotion and standalone-device packaging remain separate Kraken-authorised tasks.
