# Kraken's First Codex Loop — Human Procedure v1.2

**Loop:** `MOB-P1P2-FIRST-LOOP-001`  
**Target:** `/Users/Kraken/DAPP/acr-mobile-companion/`  
**Codex terminal success:** `READY_FOR_KRAKEN_SIMULATOR_REVIEW`  
**Canonical remote:** `https://github.com/KY-BChain/ACR-Mobile-Companion` (private)  
**Campaign directory:** `/Users/Kraken/DAPP/acr-mobile-companion/vP1P2/`  
**Supersedes:** `ACR_Mobile_P1P2_First_Loop_Human_Procedure_v1.1.md`

## 1. What this Loop delivers

Codex will:

- understand and verify the existing React Native/Expo build stack;
- prove the current three-screen business baseline before editing;
- review the generator without executing it;
- implement P1/P2 as minimal source changes;
- preserve eight-language selection, API/attestation and Result boundaries;
- run automated checks and the iOS Simulator through Expo/Metro;
- return a complete uncommitted diff and evidence packet.

It will not reinstall dependencies, run Prebuild, package a standalone build, refresh provisioning, install on the physical iPhone, commit or push.

## 2. Establish the GitHub baseline first

Use GitHub Desktop before opening the Codex task:

1. Select the local `acr-mobile-companion` repository.
2. Confirm the local path is `/Users/Kraken/DAPP/acr-mobile-companion/`.
3. Confirm its remote is `https://github.com/KY-BChain/ACR-Mobile-Companion` or the equivalent SSH URL.
4. Select `main` as the intended pre-feature baseline branch.
5. Click **Fetch origin**.
6. Review the result:

| Git state | Action |
|---|---|
| Clean and aligned with origin | Continue |
| Local accepted commits are ahead | Push them before starting |
| Remote is ahead | Review and pull through GitHub Desktop before starting; re-test the baseline if code changed |
| Branch has diverged | Stop and resolve deliberately; do not start the Loop |
| Known-working baseline has uncommitted changes | Review them, make a deliberate baseline checkpoint commit and push, or postpone the Loop |
| Unknown/unrelated uncommitted changes | Stop and identify ownership |

The authoritative baseline identity is the commit SHA, not the display count “118 changes”. The expected state is local `main` equal to `origin/main`, with no ahead/behind difference and a clean working tree after the campaign-control files below have been deliberately committed.

Recommended: first commit and push the canonical `vP1P2/` control/specification package to `main` if it is not online yet. Then create a feature branch such as `feature/mobile-v0.5-p1-p2` from that clean, synced baseline using GitHub Desktop. Do not let another coding agent edit the checkout during this task.

The Loop will independently report the branch, HEAD, remote and ahead/behind count. It will not repair Git divergence automatically.

## 3. Establish the root-level campaign directory

Keep P1/P2 specifications, review material and the inactive generator together at:

`/Users/Kraken/DAPP/acr-mobile-companion/vP1P2/`

Do not move this directory back under `src/`. `src/` is reserved for runtime application source; `vP1P2/` is campaign/control material and must not be treated as a Metro application module.

Place or retain these canonical files there:

- `ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.2.md`
- `ACR_Mobile_P1P2_First_Loop_Start_Prompt_v1.2.md`
- `ACR_Mobile_P1P2_Generator_Review_v0.3.md`
- `ACR_Mobile_v0.5_P1P2_Application_Guide.md`;
- `ACR_Mobile_Input_Completeness_Review_v0.5.md`;
- accepted P1/P2 validation mock-ups/field contract, if separate;
- `apply-v0.5-update.sh`.

Move superseded Loop documents such as the earlier v1.0/v1.1 task and procedure into `vP1P2/archive/`, or leave them outside editor context. The v1.2 Task Contract is the sole controlling Loop instruction.

The 16 separately generated source files are not required because their candidate contents are embedded in the generator.

## 4. Open the exact project in VS Code

1. Start VS Code.
2. Choose **File → Open Folder…**.
3. Select `/Users/Kraken/DAPP/acr-mobile-companion/`.
4. Confirm the Explorer root is `acr-mobile-companion`, not `DAPP` and not `acr-mobile-companion-extended`.
5. If VS Code asks whether you trust the folder, confirm only after checking the exact path.
6. Close or pause Claude Code or any other agent that could write to this checkout.

## 5. Open Codex inside VS Code

1. Select the **Codex icon** in the VS Code Activity Bar.
2. If the icon is not visible, press `Shift+Cmd+P` to open the Command Palette.
3. Run **Codex: Open Codex Sidebar**.
4. Sign in if requested.
5. Start a new chat associated with the currently opened project.
6. Choose local workspace execution rather than a cloud hand-off because Expo/Metro and the iOS Simulator are on this Mac.
7. Select the preferred coding model and high reasoning level available to you.
8. Keep the normal approval/sandbox setting that permits writes only inside the opened workspace and asks before exceptional commands.

Official Codex documentation confirms that the VS Code extension is opened through the Codex icon or **Codex: Open Codex Sidebar**, and that open files/selections can be attached as editor context: <https://learn.chatgpt.com/docs/codex/ide>.

## 6. Prepare the editor context

Open these files in VS Code tabs:

- `vP1P2/ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.2.md`;
- `vP1P2/ACR_Mobile_P1P2_Generator_Review_v0.3.md`;
- the Application Guide;
- the Input Completeness Review;
- `vP1P2/apply-v0.5-update.sh`.

Open `vP1P2/ACR_Mobile_P1P2_First_Loop_Start_Prompt_v1.2.md`, copy only its fenced prompt text, and paste it into the new Codex chat.

There is no dependency on a built-in `/loop` command. The Task Contract defines the finite Loop; the Start Prompt tells Codex to execute it autonomously.

## 7. What to approve while Codex runs

Approve only actions that are:

- within `/Users/Kraken/DAPP/acr-mobile-companion/`;
- within the permitted source/locale/test scope;
- non-destructive;
- based on already-installed tools;
- required for checks, Expo/Metro or the iOS Simulator;
- the one optional `git fetch --prune origin` remote-read verification when the displayed remote is correct.

Do not approve:

- `npm install`, `npm update`, Expo/React Native upgrade or lockfile change;
- any Expo Prebuild command;
- writes to `ios/`, app configuration, API, inference or Result files;
- execution of `vP1P2/apply-v0.5-update.sh` against the repository;
- pull, merge, rebase, stash, reset or discard;
- commit, tag, push or PR creation;
- provisioning, signing, packaging, physical-device installation or deployment;
- writes outside the repository except disposable temporary extraction data.

Codex may stop for a clinical enum/unit decision. Answer only from an approved source; do not guess to keep the Loop moving.

## 8. Expected Codex progression

| Checkpoint | Expected outcome |
|---|---|
| K0 | `BASELINE_UNDERSTOOD`: correct repo/Git/build/state/navigation/i18n/API map |
| K1 | `BUSINESS_BASELINE_VERIFIED`: existing three-screen tests and simulator evidence |
| K2 | `READY_TO_IMPLEMENT`: field contract and minimal plan; no speculative refactor |
| K3 | P1/P2 source, locales and tests implemented |
| K4 | Checks plus updated five-screen iOS Simulator flow; no more than three correction cycles |
| Terminal | `READY_FOR_KRAKEN_SIMULATOR_REVIEW` or a precise legal blocker |

Do not accept a generic “done”. Require the exact terminal state and evidence packet.

## 9. Kraken simulator review

When Codex returns `READY_FOR_KRAKEN_SIMULATOR_REVIEW`:

1. Inspect the complete uncommitted diff in the Codex/VS Code review view or GitHub Desktop.
2. In the Codex composer, `/review` can be used to select **Review uncommitted changes**; this review does not modify the working tree unless you separately ask Codex to apply fixes.
3. Confirm no protected/configuration/native/dependency files changed.
4. Use the running Expo/Metro/iOS Simulator environment to test:

| Test | Expected result |
|---|---|
| New assessment | Step 1 of 5; no new silent defaults |
| Step 1 and Step 2 | Existing inputs and validation preserved |
| Step 3 | Existing controls preserved; Next opens P1 |
| P1 invalid tumour size | Localised finite-number error |
| P1 approved valid values | Accepted according to the field contract |
| P1 → P2 and Back | Navigation preserves entered values |
| P2 invalid ECOG/LVEF | Approved localised boundary errors |
| P2 optional blanks | Review reachable where the contract permits |
| Review | P1/P2 visibly provisional and separate |
| Submission | Existing attestation works; request contains no P1/P2 |
| Result | Existing content/behaviour unchanged by P1/P2 |
| Cancel/new assessment | All assessment state, including P1/P2, clears |
| French | New text is French; no German contamination |
| Arabic | New text is Arabic and established RTL is preserved |
| Small simulator | Controls/errors/buttons remain usable |
| Accessibility spot check | Labels are understandable and errors discoverable |

If a correction is needed, send one bounded follow-up with exact reproduction, expected result, actual result and evidence. Retain the three-cycle total budget.

## 10. Accept and sync local to GitHub

If the simulator and diff pass, send Codex:

```text
KRAKEN DECISION: ACCEPT_FOR_SIMULATOR_BASELINE
MOB-P1P2-FIRST-LOOP-001 passed human diff and iOS Simulator review.
Do not perform Git or packaging actions.
```

Then, in GitHub Desktop:

1. Reinspect the exact changed-file list.
2. Stage/include only the accepted P1/P2 source, locale, test and Loop evidence files you intend to retain.
3. Create the feature commit with a concise message.
4. Push the selected branch to the verified `origin`.
5. Confirm GitHub Desktop shows no unpushed commit and the working tree is clean, apart from any deliberately retained evidence.

This is the authorised local-to-online sync. Codex verification does not itself grant commit/push authority.

## 11. Later standalone-device task

Only after the simulator baseline is accepted and synced, begin `MOB-P1P2-IOS-PACKAGE-001` to:

- recover/verify the existing standalone Release path;
- refresh the Personal Team provisioning profile;
- package and install on the iPhone 13;
- verify the five-screen app;
- stop Metro and remove the development connection;
- prove the installed ACR icon launches independently of Metro.

Android packaging remains a later separate task.
