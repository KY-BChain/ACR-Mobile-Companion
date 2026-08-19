# ACR Mobile Companion v0.5 P1/P2 Generator Review v0.3

**Review ID:** `MOB-P1P2-GEN-REVIEW-002`  
**Generator:** `vP1P2/apply-v0.5-update.sh`  
**Reviewed copy:** `apply-v0.5-update.sh`, 2,989 lines, 154,753 bytes  
**SHA-256:** `b3c152bd2711c3adc93e4a4f69caf91801fee3eecb9830ce674d8149add8b4dd`  
**Decision:** **HOLD — do not run this version against the working application**

## Direct answers

1. **Zsh is appropriate.** The `#!/bin/zsh` shebang, `set -euo pipefail`, quoted heredocs and UTF-8 content all parse successfully with `/usr/bin/zsh -n`. The Mac's default login shell is not material when the file is invoked explicitly as `zsh vP1P2/apply-v0.5-update.sh` from the repository root.
2. The uploaded copy has mode `0644`, so `./apply-v0.5-update.sh` would require an executable bit. Explicit `zsh …` does not. This is not a reason to convert it to Bash.
3. **Do not provide the 16 separate files for the first Codex Loop.** The generator contains all 16 outputs. Codex should inspect or extract them to a temporary directory, compare them with the current application, and implement minimal patches. It should not execute this generator on the live tree.
4. If an independent provenance comparison is wanted later, provide one ZIP containing the 16 files plus a SHA-256 manifest—not 16 separate uploads.

## What passed

| Check | Result |
|---|---|
| Zsh parse (`/usr/bin/zsh -n`) | Pass |
| Quoted heredocs prevent shell interpolation in generated source | Pass |
| Embedded output count | Pass: exactly 16 |
| Locale JSON syntax | Pass: all eight parse |
| Locale scalar-key parity against `en-GB` | Pass |
| Duplicate locale leaf paths | Pass: none detected |
| Network, dependency install, `sudo`, delete, signing or deployment actions | None found |
| Automatic Git staging, commit, tag or push | None executed |
| P1/P2 included in the candidate API request | No; the candidate request omits them |

These passes establish that the file is readable and internally extractable. They do not establish that its wholesale replacements are compatible with the current repository.

## Exact 16-file manifest

The guide's statement “12 modified files and 2 new files” is arithmetically incorrect. The inventory is **14 existing files plus 2 new files = 16 files**.

| # | Candidate path | Intended status |
|---:|---|---|
| 1 | `src/store/assessmentStore.ts` | Existing |
| 2 | `src/navigation/AppNavigator.tsx` | Existing |
| 3 | `src/screens/Step1ReceptorsScreen.tsx` | Existing |
| 4 | `src/screens/Step2TumourScreen.tsx` | Existing |
| 5 | `src/screens/Step3MarkersScreen.tsx` | Existing |
| 6 | `src/screens/P1Screen.tsx` | New |
| 7 | `src/screens/P2Screen.tsx` | New |
| 8 | `src/screens/ReviewScreen.tsx` | Existing |
| 9 | `src/locales/en-GB.json` | Existing |
| 10 | `src/locales/fr-FR.json` | Existing |
| 11 | `src/locales/de-DE.json` | Existing |
| 12 | `src/locales/ru-RU.json` | Existing |
| 13 | `src/locales/ar-SA.json` | Existing |
| 14 | `src/locales/zh-CN.json` | Existing |
| 15 | `src/locales/ko-KR.json` | Existing |
| 16 | `src/locales/ja-JP.json` | Existing |

Codex may also need to add or update tests. That is acceptable and does not change the 16 application-file inventory.

## Blocking findings

| Severity | Finding | Evidence and consequence | Required Loop response |
|---|---|---|---|
| Critical | Navigator backup path is wrong | The script backs up `src/navigation/AppNavigator.ts` but overwrites `src/navigation/AppNavigator.tsx`. The actual navigator is not protected. | Never run live; correct this before any future generator use. |
| Critical | Wholesale replacement can regress the current app | Six core TypeScript/TSX files and all eight locales are replaced without a baseline diff, dry-run, transaction or rollback on partial failure. | Treat outputs as candidates; patch the current code minimally. |
| Critical | New screens do not use the localisation system | None of the generated TS/TSX files imports or calls the repository's i18n translation function. User-facing text is hard-coded English. | Use the existing i18n architecture and prove French and Arabic behaviour. |
| High | Existing Step 2 behaviour appears removed | `stage` and `histologicalSubtype` are displayed as read-only dashes in the candidate screen, with no controls to set them. | Compare with the live screen and preserve all accepted behaviour. |
| High | Existing Step 3 behaviour appears removed | State and Review include `bayesianEnhanced`, but the generated Step 3 screen provides no control for it. | Preserve the current control and request semantics. |
| High | Silent clinical defaults are introduced | The candidate initial state sets ER, PR and HER2 to `positive`. | Retain the accepted baseline or use explicit unselected state; never introduce silent clinical defaults. |
| High | P1 gender contract and behaviour contradict the guide | Code invents four enum values, uses `as any`, labels the value as “used by reasoner”, and blocks Next when empty. The guide says the contract is pending, P1/P2 are not reasoner-mapped, and a missing value shows an error while Next remains available. | Resolve from an approved contract/mock-up; otherwise stop `BLOCKED_CONTRACT`. Do not invent a clinical enum. |
| High | P1 nodal “blocker” is not a blocker | Any selected N0–N3 value shows a contract-blocker message, yet navigation remains enabled. | Reconcile warning, blocked state and navigation semantics from the approved specification. |
| High | The required ECOG invalid-input test is unreachable | A segmented control offers only 0–4, while the guide requires a human to enter 5 and see validation. | Use an input that can exercise the specified validation, or revise the accepted test/spec explicitly. |
| High | Candidate enum values are asserted without a proved contract | PD-L1, HER2-low and treatment-intent values are hard-coded and cast through `any`. | Use only documented values and strong types; otherwise stop `BLOCKED_CONTRACT`. |
| High | Review submission may be impossible | Submit is disabled unless attestation is already verified, but attestation is checked inside the disabled button's handler. Whether another screen preloads it can only be established from the live repository. | Preserve and test the current attestation lifecycle before changing Review. |
| High | Candidate build identity is changed in one source file | Review hard-codes `mob-v0.5.0+50` without a corresponding approved configuration change. | Preserve the repository's single source of build identity. |
| High | No automated tests are generated | The guide labels a manual checklist as AC-09 evidence. Manual checks alone do not prove request exclusion, reset, validation or regressions. | Add/update repository-native tests and run all existing checks. |
| Medium | French locale contains German text | `assessment.clinicalTransparency` and `clinicalTransparencyBanner` in `fr-FR.json` are German. | Correct and obtain appropriate language/clinical review. |
| Medium | Ki-67 validation is weaker than its hint | The candidate accepts whitespace, negatives, infinity and values outside 0–100 in some paths. | Preserve or strengthen the accepted current validation. |
| Medium | Reset is not demonstrated | Step 1 Cancel only navigates to Welcome; it does not call `reset`. The guide expects all data cleared for a new assessment. | Test the full cancel/new-assessment lifecycle in the live app. |
| Medium | Accessibility evidence is insufficient | The new screens contain labels and errors visually, but no explicit focus, announcement or control-association behaviour is demonstrated. | Use current accessible components and add targeted checks/manual evidence. |

## Generator-level operational weaknesses

- `PROJECT_DIR="${HOME}/DAPP/acr-mobile-companion"` and an exact `pwd` comparison make the script non-portable and do not prove Git repository identity.
- There is no `--check`, `--dry-run`, `--target-root` or isolated-output mode.
- A failure after some redirections leaves a partially updated codebase; `set -e` stops but does not roll back.
- Backup folder names have only second-level uniqueness and are stored inside the working tree.
- Backup files are flattened to basenames and have no manifest or hashes.
- The final suggestion `git add src/` is too broad for a controlled review. The script does not execute it, which is good.

## Location decision

The root-level location `/Users/Kraken/DAPP/acr-mobile-companion/vP1P2/` is preferred over `src/vP1P2/`. It keeps specifications, mock-ups, Loop controls and the inactive generator outside runtime application source. Do not move it back under `src/` merely to match superseded Loop paths.

The location change does not correct the generator defects. If a corrected generator is ever authorised for isolated use, invoke it from the repository root because its write targets are relative `src/...` paths. The current Loop must not execute it.

## Required application strategy

The first Codex Loop must use the generator as a **candidate bundle**, not as an installer:

1. Audit the live repository and record its dirty state, instructions, package manager and test commands.
2. Parse or extract the 16 heredoc bodies to a temporary directory without executing the generator.
3. Diff each candidate against the current file and the approved P1/P2 requirements.
4. Implement only the necessary changes in the live source, preserving existing functionality and localisation patterns.
5. Prove P1/P2 are in memory only, absent from the inference request and absent from result derivation.
6. Run repository-native static checks, automated tests and a non-signing iOS check, with bounded repair attempts.
7. Stop for Kraken's human diff and iOS test. Do not commit, tag, push, sign or deploy.

## Scope of this review

This was a static audit of the supplied guide, Zsh file and all 16 embedded outputs. The full application repository was not attached here, so repository compilation, runtime tests, current-code regression comparison and iOS execution must be performed by Codex locally in `/Users/Kraken/DAPP/acr-mobile-companion/`.
