# ACR Mobile P1/P2 and About — Pre-Loop Codex Prompt v1.1

This is a Codex instruction, not a Zsh program. Paste only the fenced text into a new **local** Codex chat while VS Code has `/Users/Kraken/DAPP/acr-mobile-companion/` open.

```text
PRE-LOOP P1/P2 AND ABOUT DOCUMENTATION UPDATE ONLY.

Work only in this repository:
/Users/Kraken/DAPP/acr-mobile-companion/

Purpose:
Prepare the current P1/P2 and About instruction set as v1.4 before the Implementation Loop starts. This task edits documentation/control material only. It must not implement P1/P2/About or modify runtime application code.

Definitions:
- In this task, “generator” means only:
  /Users/Kraken/DAPP/acr-mobile-companion/vP1P2/apply-v0.5-update.sh
- The generator is reference-only and must not be executed or revised in this pre-Loop task.
- Use the title “Codex Implementation Task” and do not carry the former v1.2 title into v1.4.

Authority:
- Kraken owns acceptance and Git promotion.
- You may edit only vP1P2/ and move already-superseded files from docs/loop/ into vP1P2/archive/ if they still exist.
- You may read application files to verify facts and paths.
- Do not edit src/, App.tsx, package.json, package-lock.json, app.json, ios/, Android files, configuration, API, Result or native files.
- Do not commit, tag, push, pull, merge, rebase, reset, stash, discard, install, build, run Expo, run Prebuild or open a pull request.

Start with read-only checks:
1. Confirm pwd and Git root are /Users/Kraken/DAPP/acr-mobile-companion.
2. Record current branch, full HEAD and git status --short --branch.
3. Record git remote -v and verify origin identifies KY-BChain/ACR-Mobile-Companion.
4. Inspect the current vP1P2/ tree and docs/loop/ if it exists.
5. Preserve every pre-existing change. Do not hide or discard anything.

Read completely:
- vP1P2/ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.2.md
- vP1P2/ACR_Mobile_P1P2_First_Loop_Human_Procedure_v1.2.md
- vP1P2/ACR_Mobile_P1P2_First_Loop_Start_Prompt_v1.2.md
- vP1P2/ACR_Mobile_P1P2_Generator_Review_v0.3.md
- vP1P2/ACR_Mobile_Input_Completeness_Review_v0.5.md
- vP1P2/ACR_Mobile_P1_P2_Validation_Mockups_v0.5.html
- vP1P2/ACR_Mobile_v0.5_P1P2_Application_Guide.md
- vP1P2/apply-v0.5-update.sh
- App.tsx
- src/navigation/AppNavigator.tsx
- src/i18n/config.ts
- package.json

Create these four current files without overwriting the old versions:
- vP1P2/ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.4.md
- vP1P2/ACR_Mobile_P1P2_First_Loop_Human_Procedure_v1.4.md
- vP1P2/ACR_Mobile_P1P2_First_Loop_Start_Prompt_v1.4.md
- vP1P2/ACR_Mobile_P1P2_Generator_Review_v0.5.md

Required v1.4 corrections and decisions:

1. Repository
- Canonical local path: /Users/Kraken/DAPP/acr-mobile-companion/
- Canonical remote: https://github.com/KY-BChain/ACR-Mobile-Companion
- The repository is public.
- Do not hard-code the current preparation SHA as the future execution SHA. State that the Implementation Loop must record the final origin/main SHA after Kraken commits and pushes this v1.4 preparation.

2. File locations
- vP1P2/ is at repository root and must not be moved under src/.
- The active locale directory is src/i18n/locales/.
- src/i18n/locales/en-GB.json is the source/template for the other seven active locale JSON files.
- Do not instruct Codex to create src/locales/.
- The generator still contains 16 P1/P2 candidate files. The full v1.4 application scope is 15 existing files plus two new assessment screens, 17 application files total, because existing `src/screens/AboutScreen.tsx` is also updated.

3. Generator decision
- Record its exact path, 2,989 lines, 154,753 bytes and SHA-256 b3c152bd2711c3adc93e4a4f69caf91801fee3eecb9830ce674d8149add8b4dd.
- Decision remains HOLD/reference-only; do not run it.
- Add a Critical finding that the generator writes eight JSON files to src/locales/, while the live app imports src/i18n/locales/.
- Retain the known wrong AppNavigator.ts backup path, duplicate NavigationContainer, removed attestation lifecycle, wholesale replacement, i18n, regression, typing, reset and test findings.
- Explain that Codex may extract the 16 heredocs to a unique /tmp directory for comparison only.

4. Current provisional enum decision
Kraken has authorised the existing candidate enum fields for the initial synthetic-data demo so clinical partners such as ZZU can review and advise after delivery.

Use these strongly typed local demo values:
- gender: female, male, other, unknown, or empty;
- pdl1Status: positive, negative, not_tested, or empty;
- her2Low: positive, negative, unknown, or empty;
- treatmentIntent: neoadjuvant, adjuvant, unspecified, or empty;
- ecogScore: integer 0 to 4 or empty.

Rules:
- no default value;
- optional enums must be clearable;
- these are provisional UI/demo values, not clinically approved or API wire values;
- gender empty may display a pending warning but must not block P1 to P2;
- the nodal mapping warning is visible but does not block this UI-only flow;
- tumour size may be empty; if entered it must be finite and greater than zero and must display “unit pending”;
- LVEF may be empty; if entered it must be finite and 0 to 100 inclusive;
- invalid non-empty numeric values block navigation/review;
- all P1/P2 state remains in memory and is excluded from API, attestation, reasoner and Result processing.

5. About explanation
- Verify that the Home screen is `src/screens/WelcomeScreen.tsx`, its existing About action navigates to the existing `About` route, and `src/screens/AboutScreen.tsx` already contains build, service, attestation and data-handling information.
- Require Codex to extend the existing AboutScreen with internal pagination. Do not create About P1/P2 routes and do not add another NavigationContainer.
- Label pages `About 1 of 5` through `About 5 of 5` to avoid confusion with the P1/P2 assessment screens.
- Opening About starts at page 1. Cancel or Close returns to Welcome. Back and Next move only within About.
- Preserve the existing About route, live attestation/build/baseline values, unavailable-state behaviour and data-handling information.
- Add matching keys to all eight active locale files, using en-GB as the source/template. Every page title, body, indicator and control must use the selected language. Arabic must preserve established RTL behaviour.

Use this exact English (UK) source meaning:

About 1 of 5 — What the ACR Platform is
Title: What the ACR Platform is
Text: ACR Platform is an investigational clinical decision-support platform. It helps clinicians review structured clinical facts against a governed medical knowledge model and clinician-reviewed rules. It supports clinical judgement; it does not replace diagnosis, treatment decisions or the responsible clinician.

About 2 of 5 — How it works
Title: How ACR works
Text: An authorised user enters approved structured clinical facts. The companion app sends only the approved assessment request to the connected ACR service. The ACR Platform applies its ontology and clinician-reviewed SWRL rules through the Openllet reasoner. It returns decision-support results with the rules that fired and reasoning provenance for review. Where enabled, the optional Bayesian layer can add a confidence estimate without replacing the rule-based explanation.

About 3 of 5 — Data Stays. Rules Travel.
Title: Data Stays. Rules Travel.
Text: In a clinical deployment, ACR is designed so patient data remains within authorised clinical infrastructure while governed knowledge and rules are deployed to where the data is held. This mobile demo uses synthetic data only and does not demonstrate a production patient-data connection.

About 4 of 5 — Explainability and this demo
Title: Explainability and safety
Text: ACR results are decision support only. The app can show recommendations, fired rules, reasoning mode and baseline identity so the result can be reviewed. P1 and P2 are provisional demo fields in this version and are not sent to the API or used to produce the Result. Do not enter real, coded or pseudonymised patient information.

About 5 of 5 — Build and verified baseline
- Retain the existing application, service, baseline-attestation and data-handling cards.
- Do not hard-code new version, gateway, reasoner, hash or verification claims.

Add verification for page order, Home return, all eight languages, Arabic RTL, text scaling, accessibility and preservation of assessment/attestation/language state.

6. Verification approach
- Detect the repository's actual tests and scripts.
- Do not assume a configured test runner.
- If none exists, permit narrowly scoped zero-dependency verification under tests/p1p2/ using only already-installed Node.js/TypeScript.
- Do not install dependencies or edit package/lock files.
- Require typecheck, lint if operational, JSON parsing/key parity, git diff --check, Expo/Metro startup, iOS Simulator launch and human simulator review.
- Retain the maximum-three-correction-cycle limit.

7. Application Guide
Update vP1P2/ACR_Mobile_v0.5_P1P2_Application_Guide.md only as follows:
- add a prominent note near the top that it is requirements/reference material and its wholesale replacement, Git, tagging and push instructions are superseded by the v1.4 Codex Implementation Task;
- correct active locale paths from src/locales/ to src/i18n/locales/;
- distinguish the generator's 16 P1/P2 candidates from the full v1.4 scope of 15 existing files plus two new assessment screens = 17 application files;
- add a short v1.4 About requirement pointing to the five-page, eight-language behaviour in the v1.4 Codex Implementation Task;
- state that the generator is reference-only and must not be executed;
- do not otherwise rewrite the clinical or visual requirements.

8. Version housekeeping
After all four new files exist and have been checked:
- move the three v1.2 Loop files into vP1P2/archive/;
- move ACR_Mobile_P1P2_Generator_Review_v0.3.md into vP1P2/archive/;
- if the downloaded Generator Review v0.4 was copied into the repository, move it to vP1P2/archive/; otherwise do not add it merely to archive it;
- verify the older v1.0 and v1.1 Loop files and Generator Review v0.2 are in vP1P2/archive/;
- if the v1.1/v0.2 files have already been moved locally, do not duplicate them;
- if the downloaded v1.3 proposal files have been copied into the repository, move them to vP1P2/archive/; if they were never copied from Downloads, do not add them merely to archive them;
- leave the current specification, mock-up, Application Guide and generator directly under vP1P2/;
- docs/loop/ may remain absent/empty because Git does not track empty directories;
- do not delete Git history or application source;
- do not create duplicate generated application files or backup trees.

9. Required structure and language
- Present each active instruction in WHAT → HOW → WHY order.
- Be direct and procedural.
- Use British English.
- Use “Codex Implementation Task”, “Implementation Loop”, “field specification” or “API mapping”; do not carry the former v1.2 title into active v1.4 files.
- Preserve the legal terminal success state READY_FOR_KRAKEN_SIMULATOR_REVIEW for the later implementation Loop.

Verification before stopping:
1. Show tree -L 3 vP1P2.
2. Confirm the four new files exist and the superseded versions are under archive/.
3. Confirm active v1.4 files say public, not private.
4. Confirm active v1.4 files use src/i18n/locales/ and do not direct writes to src/locales/.
5. Confirm the Application Guide corrections.
6. Confirm the five-page About requirement and English source meaning are present in the v1.4 Implementation Task, Human Procedure and Start Prompt.
7. Confirm the generator file itself is unchanged by comparing its SHA-256.
8. Run git diff --check.
9. Show git status --short and the complete changed-file inventory.
10. Confirm no runtime source, locale, package, configuration or native file changed.

Stop with exactly:
PRE_LOOP_V1_4_READY_FOR_KRAKEN_REVIEW

Then report:
- one-sentence outcome;
- starting Git state;
- files created;
- files moved to archive;
- Application Guide edits;
- verification commands and results;
- remaining risks, if any;
- the single next human action: review the documentation-only diff in GitHub Desktop.

Do not commit or push.
```
