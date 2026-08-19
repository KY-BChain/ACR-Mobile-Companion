# ACR Mobile Companion v0.5 P1/P2 Generator Review v0.5

**Review ID:** `MOB-P1P2-GEN-REVIEW-004`
**Generator:** `/Users/Kraken/DAPP/acr-mobile-companion/vP1P2/apply-v0.5-update.sh`
**Reviewed file:** 2,989 lines; 154,753 bytes
**SHA-256:** `b3c152bd2711c3adc93e4a4f69caf91801fee3eecb9830ce674d8149add8b4dd`
**Git blob SHA:** `fd749ea267f8a87de02ba50d5cbe2666cc1884ff`
**Decision:** **HOLD — reference only; do not execute against the working application**
**Supersedes:** `ACR_Mobile_P1P2_Generator_Review_v0.4.md`

## 1. What the generator is

In this campaign, the term **generator** means only:

`/Users/Kraken/DAPP/acr-mobile-companion/vP1P2/apply-v0.5-update.sh`

It is a Zsh file containing 16 embedded candidate application files. It is not the implementation Loop and it is not authorised to update the live repository.

Zsh remains appropriate. The hold decision is caused by content and integration defects, not by the shell choice.

## 2. How Codex may use it

Codex may:

1. read it;
2. parse its quoted heredoc sections;
3. extract the 16 candidates to a unique disposable directory under `/tmp`;
4. verify the candidate manifest;
5. compare each candidate with current source and specifications;
6. reuse small compatible fragments through minimal edits.

Codex must not:

- invoke the generator against the repository;
- accept its final success message as verification;
- copy all candidates over current files;
- create its backup directory in the repository;
- follow its broad `git add src/` suggestion.

## 3. Provenance checks

| Check | Result |
|---|---|
| `/usr/bin/zsh -n` parse | Pass |
| `set -euo pipefail` present | Pass |
| Quoted heredocs | Pass |
| Embedded output count | Pass: 16 |
| Embedded locale JSON syntax | Pass |
| Candidate locale key parity | Pass |
| Network, dependency installation, `sudo` or deletion | None found |
| Automatic commit, tag or push | None performed |
| Candidate API request includes P1/P2 | No |

These checks prove only that the file is readable and extractable. They do not prove compatibility with the working application.

## 4. Generator output manifest

The generator contains these exact output destinations:

| # | Generator destination | Generator intent |
|---:|---|---|
| 1 | `src/store/assessmentStore.ts` | Replace existing |
| 2 | `src/navigation/AppNavigator.tsx` | Replace existing |
| 3 | `src/screens/Step1ReceptorsScreen.tsx` | Replace existing |
| 4 | `src/screens/Step2TumourScreen.tsx` | Replace existing |
| 5 | `src/screens/Step3MarkersScreen.tsx` | Replace existing |
| 6 | `src/screens/P1Screen.tsx` | Create |
| 7 | `src/screens/P2Screen.tsx` | Create |
| 8 | `src/screens/ReviewScreen.tsx` | Replace existing |
| 9 | `src/locales/en-GB.json` | Incorrect destination |
| 10 | `src/locales/fr-FR.json` | Incorrect destination |
| 11 | `src/locales/de-DE.json` | Incorrect destination |
| 12 | `src/locales/ru-RU.json` | Incorrect destination |
| 13 | `src/locales/ar-SA.json` | Incorrect destination |
| 14 | `src/locales/zh-CN.json` | Incorrect destination |
| 15 | `src/locales/ko-KR.json` | Incorrect destination |
| 16 | `src/locales/ja-JP.json` | Incorrect destination |

The generator's P1/P2 bundle remains 14 existing files plus two new screens, 16 candidate files total. The full v1.4 implementation also modifies the existing `src/screens/AboutScreen.tsx`, so the complete expected application surface is 15 existing files plus two new assessment screens, 17 files total. The About enhancement is not present in the generator.

The eight live locale destinations are:

`src/i18n/locales/{en-GB,fr-FR,de-DE,ru-RU,ar-SA,zh-CN,ko-KR,ja-JP}.json`

`src/i18n/locales/en-GB.json` is the current source/template locale. Codex must not create `src/locales/`.

## 5. Blocking generator defects

| Severity | Finding | Consequence | Required response |
|---|---|---|---|
| Critical | Wrong navigator backup path | It backs up `src/navigation/AppNavigator.ts` but overwrites `AppNavigator.tsx`. | Do not run live. |
| Critical | Duplicate navigation container | Generated `AppNavigator.tsx` adds `NavigationContainer`, while current `App.tsx` already owns it. | Preserve the single current container. |
| Critical | Launch attestation removed | Wholesale navigator replacement omits the current `useEffect`/`checkAttestation` lifecycle. | Patch routes into the current navigator; preserve attestation. |
| Critical | Locale destination is wrong | The generator writes `src/locales/*.json`, which the active i18n configuration does not import. | Update `src/i18n/locales/*.json`; never create `src/locales/`. |
| Critical | Non-transactional wholesale replacement | Core TSX and locale files are overwritten without dry-run, rollback or compatibility checks. | Use candidate comparison and minimal patches. |
| High | Generated screens bypass i18n | New visible strings are hard-coded English. | Use the existing translation system for every visible string. |
| High | Existing Step 2 controls regress | Stage and histological subtype become read-only placeholders. | Preserve current Step 2 behaviour. |
| High | Existing Step 3 control regresses | The Bayesian control is omitted although state and Review still use it. | Preserve current Step 3 and request behaviour. |
| High | Silent receptor defaults | ER, PR and HER2 are initialised to `positive`. | Preserve accepted current defaults/empty behaviour; introduce no clinical default. |
| High | Unsafe enum typing | Candidate P1/P2 enum assignments use `as any`. | Define strong local provisional enum types. |
| High | Attestation submission risk | Candidate Review may disable the action that performs the attestation check. | Preserve and test the current lifecycle. |
| High | Hard-coded build identity | Candidate Review embeds `mob-v0.5.0+50`. | Preserve the repository's existing source of identity. |
| High | No automated verification | No request-exclusion, reset, navigation or regression tests are generated. | Use existing checks or zero-dependency verification permitted by v1.4. |
| Medium | French contamination | Candidate French transparency strings contain German text. | Correct changed keys and verify locale parity. |
| Medium | Weak numeric parsing | Some candidate paths permit whitespace, infinity, negatives or out-of-range values. | Implement deterministic finite/range validation. |
| Medium | Reset not demonstrated | Candidate Cancel navigation does not prove assessment reset. | Verify and preserve the full reset lifecycle. |
| Medium | Accessibility is not proved | Visual labels/errors alone do not prove announcement, association or focus. | Reuse current accessible controls and record simulator evidence. |

## 6. Provisional enum decision for v1.4

Kraken has authorised the existing candidate enum fields for the first synthetic-data demo so clinical partners can review them after the initial app is delivered.

The local demo values are:

- `gender`: `female`, `male`, `other`, `unknown`, or empty;
- `pdl1Status`: `positive`, `negative`, `not_tested`, or empty;
- `her2Low`: `positive`, `negative`, `unknown`, or empty;
- `treatmentIntent`: `neoadjuvant`, `adjuvant`, `unspecified`, or empty;
- `ecogScore`: integer `0`–`4` or empty.

This decision resolves implementation blocking for the demo only. It does not approve clinical terminology, semantic completeness, API wire values, ontology properties or reasoner use. No default is permitted, optional values must be clearable, and all P1/P2 values remain outside the request and Result process.

The remaining demo rules are:

- empty `gender` may show a pending warning but does not block P1 → P2;
- `tumorSize` may be empty; a non-empty value must be finite and greater than zero, must display `unit pending`, and blocks navigation when invalid;
- `lvef` may be empty; a non-empty value must be finite and from `0` to `100` inclusive, and blocks Review when invalid;
- invalid non-empty `ecogScore` values block Review;
- P1/P2 state remains in memory and is excluded from the API request, attestation, reasoner and Result processing.

The nodal-mapping warning is visible but does not block P1 → P2 in this UI-only task. It remains unresolved for future API mapping.

## 7. Additional operational weaknesses

- `PROJECT_DIR="${HOME}/DAPP/acr-mobile-companion"` and exact `pwd` matching are non-portable and do not prove Git identity.
- There is no `--check`, `--dry-run`, `--target-root` or isolated-output mode.
- Failure after a redirection can leave partial live changes; `set -e` does not roll them back.
- Backup names have only second-level uniqueness.
- Backups are flattened to basenames without a manifest or hashes.
- Backups are written inside the working tree and create housekeeping noise.
- The script suggests staging all of `src/`, which is too broad for controlled review.

## 8. Location and housekeeping decision

The correct location is:

`/Users/Kraken/DAPP/acr-mobile-companion/vP1P2/apply-v0.5-update.sh`

Do not move it under `src/`.

At each accepted milestone:

- keep the current review directly under `vP1P2/`;
- move the superseded review into `vP1P2/archive/`;
- remove disposable extracted candidates from `/tmp`;
- do not retain generated copies or backup folders in the repository.

## 9. Required implementation method

1. Verify the live repository and current three-screen behaviour.
2. Extract candidate heredocs only to `/tmp`.
3. Compare candidates with current source and the v1.4 instructions.
4. Implement necessary changes as minimal patches.
5. Update only the active `src/i18n/locales/*.json` resources.
6. Prove P1/P2 state, validation, navigation, reset and Review display.
7. Prove P1/P2 are absent from API, attestation and Result processing.
8. Run available static, zero-dependency and simulator checks.
9. Stop for Kraken with an uncommitted diff and evidence report.

## 10. Why the generator remains on hold

The generator records useful candidate code but no longer matches the working repository architecture. Revising it is unnecessary for the first implementation Loop because Codex can compare its embedded candidates and patch the current application safely. A future generator revision would require a separate review before execution.
