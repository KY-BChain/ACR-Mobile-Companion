# Kraken's First Codex Loop — Human Procedure

**Loop:** `MOB-P1P2-FIRST-LOOP-001`  
**Target:** `/Users/Kraken/DAPP/acr-mobile-companion/`  
**Human authority:** Kraken owns acceptance, commit, release and distribution.

## Decision before starting

- Keep the generator as Zsh. No Bash conversion is needed.
- Do **not** run the current generator on the working application.
- Do **not** upload or copy the 16 generated files into the repository. Codex will derive their candidate content from the generator and compare it with the live code.
- Use one Codex session as the only writer to this checkout.

## A. Place the control files

Create this folder in the repository if it does not exist:

`/Users/Kraken/DAPP/acr-mobile-companion/docs/loop/`

Place these two downloaded files there:

- `ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.0.md`
- `ACR_Mobile_P1P2_Generator_Review_v0.2.md`

Confirm these project inputs are available at their stated paths:

- `ACR_Mobile_v0.5_P1P2_Application_Guide.md` or its existing project-document location;
- `src/vP1P2/apply-v0.5-update.sh`;
- the accepted Input Completeness Review and P1/P2 Validation Mock-ups, if they exist.

Do not invent or recreate a missing clinical field contract. Codex is designed to stop with `BLOCKED_CONTRACT` if a required enum, unit or semantic choice is genuinely unresolved.

## B. Prepare the safe working surface

1. Close or pause every other coding agent that could edit this checkout.
2. Open GitHub Desktop and select `acr-mobile-companion`.
3. Note the current branch and visible changes. Do not commit, stash, discard or stage anything for this exercise.
4. Open **only** `/Users/Kraken/DAPP/acr-mobile-companion/` as the VS Code folder—not its parent and not the `acr-mobile-companion-extended` reference copy.
5. Open the Codex sidebar in VS Code.
6. Select the preferred Codex coding model and a high reasoning setting. Keep the agent constrained to the opened workspace. Network access and dependency installation are not required.
7. Open these files in VS Code tabs so they are readily available as context:
   - the Codex Task Contract;
   - the Generator Review;
   - the Application Guide;
   - `apply-v0.5-update.sh`.

## C. Start the Loop

Paste this exact bootstrap instruction into the Codex sidebar:

```text
Work only in /Users/Kraken/DAPP/acr-mobile-companion/.

Execute MOB-P1P2-FIRST-LOOP-001 exactly as defined in:
docs/loop/ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.0.md

Start K0 now and continue autonomously through K1, K2, K3 and K4 while the task contract permits. Treat src/vP1P2/apply-v0.5-update.sh and its 16 embedded files as candidate material only. Do not run that generator on the working tree. Preserve the current app, implement minimal patches, add or update tests, and prove P1/P2 are excluded from the API and Results process.

Do not commit, tag, push, install dependencies, use the network, sign or deploy. Stop only in a legal terminal state from the task contract. On success, return READY_FOR_KRAKEN_IOS_REVIEW with the complete evidence packet.
```

There is no need to type a literal `/loop` command. The task-contract file defines the finite Loop and the bootstrap starts it.

## D. Handle Codex approvals

Allow actions that are all of the following:

- inside the exact application repository;
- limited to the permitted source/locale/test scope;
- non-destructive;
- based on already-installed tools;
- necessary to inspect, edit or test the local app.

Do not approve:

- running the generator on the live tree;
- writes outside the repository other than disposable temporary extraction output;
- dependency installation or network access;
- `sudo`, destructive Git commands, stashing or discarding changes;
- commit, tag, push, PR, signing, deployment or release;
- edits to API, inference, Result, configuration, dependency or native project files.

If Codex stops on a missing clinical enum/unit decision, answer only from an approved document or clinical authority. Do not guess merely to keep the Loop moving.

## E. Read the terminal result

Accept only one exact terminal state:

| State | Meaning | Kraken action |
|---|---|---|
| `READY_FOR_KRAKEN_IOS_REVIEW` | Automated work completed within scope | Inspect diff and run section F |
| `BLOCKED_BASELINE` | Existing overlapping changes make edits unsafe | Identify whether those changes are intentional |
| `BLOCKED_CONTRACT` | A field contract is unresolved | Supply an approved decision/source |
| `BLOCKED_SCOPE` | A protected file must change | Decide whether to expand scope in a new instruction |
| `BLOCKED_ENVIRONMENT` | A required local check cannot run safely | Supply the tool/environment or accept a stated manual check |
| `BLOCKED_STALLED` | Finite repair budget was reached | Review the last repeated failure before authorising another run |
| `FAILED_SAFETY` | A guardrail was breached | Stop and inspect before any further action |

Do not accept a response that merely says “done” without changed files, commands/results, acceptance evidence and the no-Git/no-release declaration.

## F. Kraken's diff and iOS review

1. In VS Code or GitHub Desktop, inspect every changed and untracked file.
2. Confirm the diff is a focused P1/P2 update and that existing Step 1–3 controls remain present.
3. Confirm no API, Result, build configuration, dependency, lockfile or native iOS project file changed.
4. Start the app using the repository's normal, already-established iOS procedure.
5. Test this sequence with synthetic data only:

| Test | Expected result |
|---|---|
| Start a new assessment | Step 1 shows 1 of 5 with no new silent clinical defaults |
| Complete Step 1 and Step 2 | Existing inputs and validation still work |
| Complete Step 3 | Next opens P1; all prior Step 3 controls still work |
| P1: non-numeric tumour size | Localised finite-number error |
| P1: `2.5` | Accepted if consistent with the approved unit contract |
| P1: leave a contract-sensitive field empty | Behaviour exactly matches the approved contract; no invented value |
| P1 → P2 | Navigation and Back preserve entered values |
| P2: ECOG `5` | Localised integer 0–4 error, if the approved UI permits direct entry |
| P2: LVEF `120` | Localised 0–100 error |
| P2: optional values empty | Review remains reachable when the approved contract permits |
| Review | P1/P2 are visibly provisional and separate from mapped assessment data |
| Submit | Existing attestation/fail-closed path works; request has no P1/P2 fields |
| Result | Existing Result content/behaviour is unchanged and does not derive from P1/P2 |
| Cancel, then new assessment | All assessment data including P1/P2 is cleared |
| French | All new visible text is French; no German transparency text |
| Arabic | New text is Arabic and the established RTL layout is preserved |
| Small iPhone layout | Controls, errors and buttons remain readable and operable |
| VoiceOver spot check | Controls have understandable labels; errors are discoverable |

6. Compare your observations with Codex's evidence packet. Record any mismatch by file/screen, exact steps and expected versus actual result.

## G. Return one human decision

If the implementation passes, send Codex:

```text
KRAKEN DECISION: ACCEPT_FOR_LOCAL_IOS_DEMO
MOB-P1P2-FIRST-LOOP-001 passed human diff and iOS review.
Do not perform Git or release actions.
```

If corrections are needed, send one bounded follow-up:

```text
KRAKEN DECISION: RETURN_FOR_CORRECTION
Re-open MOB-P1P2-FIRST-LOOP-001 for one correction cycle only.
Observed failure: <exact screen and steps>
Expected: <expected result>
Actual: <actual result>
Evidence: <screenshot/log/file if available>
Keep all original authority limits. Return to K3, then K4.
```

Use `HOLD` if a contract or environment decision is pending, and `REJECT` if the diff is unsafe.

## H. Git remains a separate human action

Only after `ACCEPT_FOR_LOCAL_IOS_DEMO`, review the final diff once more and perform any commit/push through your normal human-controlled GitHub Desktop workflow. Git promotion is deliberately outside this first Loop.

This run can be considered successful even though it stops before a commit: its deliverable is a complete, tested working-tree candidate ready for Kraken's review—not an automatically promoted release.
