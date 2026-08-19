# Kraken's First Codex Loop — Human Procedure v1.4

**Loop:** `MOB-P1P2-FIRST-LOOP-001`
**Supersedes:** `ACR_Mobile_P1P2_First_Loop_Human_Procedure_v1.3.md`
**Repository:** `/Users/Kraken/DAPP/acr-mobile-companion/`
**Canonical remote:** `https://github.com/KY-BChain/ACR-Mobile-Companion` (public)
**Codex success state:** `READY_FOR_KRAKEN_SIMULATOR_REVIEW`

## 1. What this Loop does

Codex will:

- inspect and verify the existing React Native/Expo/iOS build;
- prove the current three-screen application before editing it;
- inspect the generator as reference material without executing it;
- implement P1 and P2 as minimal changes to current source;
- use the existing provisional enum fields for demo/testing;
- update the eight active files in `src/i18n/locales/`, using `en-GB.json` as the source/template;
- preserve the API, attestation and Result behaviour;
- extend the existing About screen into five localised pages explaining what the ACR Platform is and how it works, while preserving current build/baseline information;
- run available checks and the iOS Simulator;
- return an uncommitted diff and evidence for Kraken.

It will not install dependencies, run Expo Prebuild, change native configuration, package the app, install it on the iPhone, commit or push.

### Approved provisional demo fields

Use these local, strongly typed synthetic-demo values with no default:

- `gender`: `female`, `male`, `other`, `unknown`, or empty;
- `pdl1Status`: `positive`, `negative`, `not_tested`, or empty;
- `her2Low`: `positive`, `negative`, `unknown`, or empty;
- `treatmentIntent`: `neoadjuvant`, `adjuvant`, `unspecified`, or empty;
- `ecogScore`: integer `0`–`4` or empty.

Optional enums must be clearable. Empty gender may show a pending warning but must not block P1 → P2. The nodal-mapping warning remains visible but does not block this UI-only flow. Tumour size may be empty; when entered it must be finite and greater than zero and display `unit pending`. LVEF may be empty; when entered it must be finite and from `0` to `100` inclusive. Invalid non-empty numeric values block navigation or Review. These are provisional UI/demo values, not clinically approved or API wire values, and all P1/P2 state stays in memory and outside API, attestation, reasoner and Result processing.

### Required English (UK) About source meaning

The Implementation Loop must reproduce this source meaning through all eight active locales:

**About 1 of 5 — What the ACR Platform is**
**Title:** What the ACR Platform is
**Text:** ACR Platform is an investigational clinical decision-support platform. Clinical partners and clinical-trials experts guide the clinical facts collected and review its governed medical knowledge model and decision-support rules. It supports clinical judgement; it does not replace diagnosis, treatment decisions or the responsible clinician.

**About 2 of 5 — How it works**
**Title:** How ACR works
**Text:** An authorised user enters approved structured clinical facts. The companion app sends only the approved assessment request to the connected ACR service. The ACR Platform applies its ontology and clinician-reviewed SWRL rules through the Openllet reasoner. It returns decision-support results with the rules that fired and reasoning provenance for review. Where enabled, the optional Bayesian layer can add a confidence estimate without replacing the rule-based explanation.

**About 3 of 5 — Data Stays. Rules Travel.**
**Title:** Data Stays. Rules Travel.
**Text:** In a clinical deployment, ACR is designed so patient data remains within authorised clinical infrastructure while governed knowledge and rules are deployed to where the data is held. This mobile demo uses synthetic data only and does not demonstrate a production patient-data connection.

**About 4 of 5 — Explainability and this demo**
**Title:** Explainability and safety
**Text:** ACR results are decision support only. The app can show recommendations, fired rules, reasoning mode and baseline identity so the result can be reviewed. P1 and P2 are provisional demo fields in this version and are not sent to the API or used to produce the Result. Do not enter real, coded or pseudonymised patient information.

**About 5 of 5 — Build and verified baseline**
Retain the existing application, service, baseline-attestation and data-handling cards. Do not hard-code new version, gateway, reasoner, hash or verification claims.

## 2. How to prepare and start it — eight procedures

### Procedure 1 — Finish the pre-Loop document update

Run the separate pre-Loop Codex instruction first. It must finish with:

`PRE_LOOP_V1_4_READY_FOR_KRAKEN_REVIEW`

Review the resulting documentation-only diff. No application source, locale, package, configuration or native file may have changed.

The active `vP1P2/` directory should then contain the current files only:

```text
ACR_Mobile_Input_Completeness_Review_v0.5.md
ACR_Mobile_P1_P2_Validation_Mockups_v0.5.html
ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.4.md
ACR_Mobile_P1P2_First_Loop_Human_Procedure_v1.4.md
ACR_Mobile_P1P2_First_Loop_Start_Prompt_v1.4.md
ACR_Mobile_P1P2_Generator_Review_v0.5.md
ACR_Mobile_P1P2_Pre_Loop_Codex_Prompt_v1.1.md
ACR_Mobile_v0.5_P1P2_Application_Guide.md
apply-v0.5-update.sh
archive/
```

All earlier Loop-task, procedure, start-prompt and generator-review versions belong in `vP1P2/archive/`. The specifications and mock-up remain active because they have not been superseded.

`docs/loop/` may be empty. Git does not retain an empty directory.

### Procedure 2 — Commit and push the v1.4 preparation baseline

Use GitHub Desktop:

1. Select `acr-mobile-companion`.
2. Confirm the local path is `/Users/Kraken/DAPP/acr-mobile-companion/`.
3. Confirm the current branch is `main`.
4. Inspect every changed path.
5. Confirm the changes are limited to `vP1P2/` and removal/moves of superseded `docs/loop/` documents.
6. Commit with a concise message such as:

   `docs(loop): prepare P1/P2 and About v1.4`

7. Push `main`.
8. Click **Fetch origin** again and confirm there is nothing left to push or pull.

Do not rely on the number of changed files as the baseline identifier. The full commit SHA is the identifier.

### Procedure 3 — Record the final baseline and create the feature branch

In Terminal:

```zsh
cd ~/DAPP/acr-mobile-companion
git fetch --prune origin
git status --short --branch
git remote get-url origin
git rev-parse HEAD
git rev-parse origin/main
git rev-list --left-right --count HEAD...origin/main
```

Before branching, require:

- `HEAD` equals `origin/main`;
- ahead/behind is `0 0`;
- the working tree is clean;
- the remote identifies `KY-BChain/ACR-Mobile-Companion`.

In GitHub Desktop, create this local branch from the verified `main`:

`feature/mobile-v0.5-p1-p2`

Do not publish it yet. Confirm its first commit is the exact final `origin/main` SHA.

### Procedure 4 — Open the exact repository in VS Code

1. Open VS Code.
2. Select **File → Open Folder…**.
3. Select `/Users/Kraken/DAPP/acr-mobile-companion/`.
4. Confirm the Explorer root is `acr-mobile-companion`.
5. Confirm the selected Git branch is `feature/mobile-v0.5-p1-p2`.
6. Close or pause Claude Code and any other agent that could write to this checkout.

Do not open `DAPP` as the root and do not use `acr-mobile-companion-extended`.

### Procedure 5 — Open Codex locally

1. Select the Codex icon in the VS Code Activity Bar.
2. If it is not visible, press `Shift+Cmd+P`.
3. Run **Codex: Open Codex Sidebar**.
4. Sign in if requested.
5. Start a new chat for the opened project.
6. Select local workspace execution, not a cloud hand-off.
7. Select the preferred coding model with High reasoning; XHigh is optional.
8. Keep workspace-write/on-request approval so exceptional commands require approval.

### Procedure 6 — Give Codex the controlling files

Open these files in editor tabs:

```text
vP1P2/ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.4.md
vP1P2/ACR_Mobile_P1P2_Generator_Review_v0.5.md
vP1P2/ACR_Mobile_Input_Completeness_Review_v0.5.md
vP1P2/ACR_Mobile_P1_P2_Validation_Mockups_v0.5.html
vP1P2/ACR_Mobile_v0.5_P1P2_Application_Guide.md
vP1P2/apply-v0.5-update.sh
```

Do not open archived Loop instructions as context.

The v1.4 Implementation Task is the controlling execution instruction. The generator is reference-only.

### Procedure 7 — Start the full Loop

Open:

`vP1P2/ACR_Mobile_P1P2_First_Loop_Start_Prompt_v1.4.md`

Copy only its fenced prompt and paste it into the new local Codex chat. Send it once.

There is no dependency on a built-in `/loop` command. The Implementation Task contains the finite K0–K4 Loop.

Expected progression:

| Stage | Required output |
|---|---|
| K0 | `BASELINE_UNDERSTOOD` |
| K1 | `BUSINESS_BASELINE_VERIFIED` |
| K2 | `READY_TO_IMPLEMENT`: P1/P2 and five-page About plan verified |
| K3 | P1/P2, About, locale and verification implementation |
| K4 | Checks, simulator and final audit |
| Success | `READY_FOR_KRAKEN_SIMULATOR_REVIEW` |

### Procedure 8 — Approve only in-scope actions

Approve:

- reads within the repository;
- source, active-locale and verification edits authorised by v1.4;
- existing typecheck/lint/test commands;
- Expo/Metro and iOS Simulator commands using installed tools;
- the single remote-read `git fetch --prune origin` after confirming the remote;
- extraction of generator heredocs into a unique `/tmp` directory.

Do not approve:

- execution of `vP1P2/apply-v0.5-update.sh` against the repository;
- `npm install`, `npm update` or another dependency change;
- Expo Prebuild;
- writes to `ios/`, API/inference, Result or application configuration;
- pull, merge, rebase, reset, stash or discard;
- commit, tag, push or pull-request creation;
- provisioning, signing, packaging, physical-device installation or deployment;
- work outside `acr-mobile-companion` except disposable `/tmp` extraction.

If Codex reaches a legal blocker, retain the evidence and resolve the exact issue. Do not approve an excluded action merely to keep the Loop moving.

## 3. Kraken's simulator review

When Codex returns `READY_FOR_KRAKEN_SIMULATOR_REVIEW`:

1. Inspect the complete uncommitted diff in VS Code, Codex or GitHub Desktop.
2. Confirm only authorised source, active locale and verification files changed.
3. Confirm no `src/locales/` directory was created.
4. Confirm no package, lockfile, configuration, API, Result or native file changed.
5. Test the running iOS Simulator:

| Test | Expected result |
|---|---|
| New assessment | Step 1 of 5 |
| Step 1–3 | Existing inputs and validation preserved |
| Step 3 Next | Opens P1 |
| P1 invalid tumour size | Localised finite-number error |
| P1 enum | Current provisional gender values; no default |
| P1 nodal warning | Visible but does not block P2 |
| P1 → P2 → Back | Entered state retained |
| P2 ECOG `5` | Localised 0–4 integer error |
| P2 LVEF `120` | Localised 0–100 error |
| P2 enums | Current provisional options; empty remains possible |
| Review | Separate provisional P1/P2 sections |
| Submission | Existing request contains no P1/P2 |
| Result | Existing Result behaviour unchanged |
| Cancel/new assessment | Step 1–3 and P1/P2 state cleared |
| Eight languages | New keys available in every active locale |
| French | No German contamination in changed keys |
| Arabic | Existing RTL behaviour preserved |
| Small simulator/accessibility | Controls, errors and buttons remain usable |
| About entry | Home-screen About opens `About 1 of 5` |
| About pages | Next/Back traverse pages 1–5 in order without entering the assessment flow |
| About content | What ACR is, how it works, Data Stays/Rules Travel, explainability/safety and current build/baseline are shown |
| About languages | All five pages use the selected language in each of the eight locales |
| About Arabic | Page layout and controls preserve established RTL behaviour |
| About exit | Cancel/Close returns to Home and does not alter assessment, attestation or selected-language state |
| About baseline | Existing live attestation/build values and unavailable-state behaviour are preserved |

If a correction is required, give Codex one reproduction containing expected result, actual result and evidence. The total three-cycle budget still applies.

## 4. Accept and sync after simulator approval

If the diff and simulator pass, tell Codex:

```text
KRAKEN DECISION: ACCEPT_FOR_SIMULATOR_BASELINE
MOB-P1P2-FIRST-LOOP-001 passed human diff and iOS Simulator review.
Do not perform Git or packaging actions.
```

Then use GitHub Desktop to:

1. inspect the changed-file list again;
2. commit only the accepted P1/P2 source, locale and verification files;
3. push the feature branch;
4. confirm the branch is clean and fully pushed.

Standalone iPhone packaging and refreshed provisioning are a later task. Android packaging is also separate.

## 5. Housekeeping after the milestone

- Keep only current instructions and current specifications directly under `vP1P2/`.
- Move superseded versions to `vP1P2/archive/` after acceptance.
- Do not retain extracted generator files, in-repository backup directories, Metro logs or native build output as campaign material.
- Use Git history for code recovery; do not accumulate duplicate source trees.

## 6. Why this sequence is used

The sequence fixes the baseline first, gives Codex one controlling instruction, keeps implementation changes isolated on a feature branch and leaves simulator acceptance, Git promotion and standalone-device packaging under Kraken's separate authority.
