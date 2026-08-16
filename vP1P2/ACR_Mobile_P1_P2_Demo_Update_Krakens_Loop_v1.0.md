# ACR Mobile Companion — Codex `/loop` for P1/P2 Demo Input Update

**Version:** v1.0  
**Task ID:** `MOB-LOOP-P1P2-UI-001`  
**Status:** `READY FOR KRAKEN AUTHORISATION`  
**Execution mode:** bounded autonomous implementation with mandatory terminal evidence return  
**Successor work:** API/mock-server interface layer — expressly not authorised by this loop

This task is a bounded predecessor to `ACR-MOB-LOOP-WP-001`; it does not supersede that work plan or its gates. If accepted, the ending mobile-repository SHA becomes a new input to the later `MOB-LOOP-S000/S002` baseline audit.

## 1. Paste this opening instruction into the Codex session

```text
/goal

Execute MOB-LOOP-P1P2-UI-001 exactly as specified in:
/Users/Kraken/DAPP/acr-mobile-companion/ACR_Mobile_P1_P2_Demo_Update_Krakens_Loop_v1.0.md

Controlling review candidate:
/Users/Kraken/DAPP/acr-mobile-companion/ACR_Mobile_Input_Completeness_Review_v0.5.md

Visual references, read-only:
/Users/Kraken/DAPP/acr-mobile-companion-extended/ACR_Mobile_Field_Completeness_Review_Candidate_v0.8.html
and, if copied there,
/Users/Kraken/DAPP/acr-mobile-companion-extended/ACR_Mobile_P1_P2_Validation_Mockups_v0.5.html

Authoritative implementation repository:
/Users/Kraken/DAPP/acr-mobile-companion/

Run the complete K0–K4 bounded loop. Work autonomously only inside the authorised demo-UI scope. Do not ask for routine decisions already resolved by the brief. Stop and return KL-EXIT-CONTRACT-BLOCKED if any material repository fact, enum, unit, locale architecture, safety invariant or test requirement cannot be proved without guessing.

Do not begin API, gateway or mock-server interface work. Do not commit, push, merge, deploy, build for distribution, alter ontology/SWRL/reasoner code, or use real/coded/pseudonymised patient data. Finish by returning the required evidence packet and terminal state; Codex stopping is not itself completion.
```

## 2. Authority

- **Sponsor, acceptance and release authority:** Kraken.
- **Domain authority:** designated ZZU/UCD clinicians and ACR clinical advisers.
- **Implementer:** Codex.
- **Independent reviewer:** Kraken and/or a separately commissioned Codex review session.
- **Permitted autonomy:** inspect, plan, edit authorised mobile UI/local-state/localisation/test files, run non-destructive checks and tests, refactor within scope, and prepare evidence.
- **Not authorised:** clinical decisions, API/gateway/mock-server changes, commits, pushes, merges, deployments, EAS distribution builds, App Store/Play Store actions, messages to partners, or access to real patient/production systems.

## 3. Control frame

### Objective

Update the current demo/testing ACR Mobile Companion to include the P1 and P2 provisional input screens and their deterministic validation states, preserve the original Step 1–3 behaviour, integrate all new strings with the existing eight-language architecture, extend the Review screen, and prove the result through automated and static evidence.

### Success condition

`KL-EXIT-COMPLETED` is legal only when every mandatory acceptance criterion `AC-01` through `AC-18` is `PASS`, all mandatory evidence exists, no forbidden file or interface layer changed, and the final working tree/diff is reported accurately.

### Canonical sources, in precedence order

1. actual current implementation and tests in `/Users/Kraken/DAPP/acr-mobile-companion/`;
2. accepted project instructions (`AGENTS.md`, `CLAUDE.md`, repository README and governing mobile design documents);
3. `ACR_Mobile_Input_Completeness_Review_v0.5.md`;
4. attached P1/P2 and validation mock-ups for visual intent;
5. recorded Sprint F contract evidence only where locally available and verifiable.

If two sources materially conflict, stop with `KL-EXIT-CONTRACT-BLOCKED`. Do not choose the convenient interpretation.

### In scope

- mobile navigation/step flow required to reach P1/P2;
- P1/P2 presentational components;
- local in-memory assessment-state fields;
- deterministic client-side type/format/range validation;
- validation/error presentation and accessibility;
- Review-screen presentation of provisional fields;
- existing localisation/i18n resources for every currently configured locale;
- unit/component/navigation/localisation/accessibility tests;
- documentation and evidence for this task.

### Explicitly out of scope

- `/api/infer`, API clients, gateway clients or request mappers;
- mock server, operational gateway and network configuration;
- ACR-Platform, Openllet, ontology, SWRL/SQWRL or Bayesian logic;
- Patient DB/LPDI integration;
- changing existing clinical thresholds or recommendation logic;
- new clinical fields beyond attached P1/P2;
- Expo-to-standalone hardening, signing or distribution;
- Sprint G, Phase 4, governance, FL, RL or DLT surfaces.

### Non-negotiable invariants

1. Synthetic data only.
2. No intentional clinical data at rest.
3. No local clinical inference.
4. No silent default, coercion, clamping or enum invention.
5. No API/mock-server/gateway change.
6. Original Step 1–3 behaviour remains functional.
7. P1/P2 are visibly provisional.
8. The existing language selector remains functional for all configured locales.
9. New strings use the existing i18n system; no parallel language mechanism.
10. Missing or contradictory contract facts cause a blocked/pending state, not fabricated certainty.
11. No personally identifying, coded, pseudonymised or real patient data in source, fixtures, screenshots, logs or evidence.
12. No unrelated edits.

## 4. Finite Kraken's Loop contract

### Loop hierarchy

- `K0` — baseline and authority audit;
- `K1` — implementation plan and contract map;
- `K2` — bounded P1/P2 implementation;
- `K3` — test/fix/refactor loop;
- `K4` — independent self-audit and evidence return.

### Global fuel

```yaml
max_elapsed_time: 6 hours
max_model_iterations: 24
max_tool_calls: 180
max_implementation_cycles: 6
max_test_fix_cycles: 6
max_identical_stalls: 2
max_replans: 2
max_scope_expansions: 0
```

Every material attempt must record an attempt fingerprint containing:

```text
loop_id + objective + changed_files + failing_check + proposed_correction
```

If the same fingerprint fails twice without new evidence, do not repeat it. Re-plan once within scope; otherwise exit `KL-EXIT-STALLED`.

### Legal terminal states

| State | Meaning |
|---|---|
| `KL-EXIT-COMPLETED` | All mandatory criteria and evidence pass |
| `KL-EXIT-CONTRACT-BLOCKED` | A material enum, unit, locale, repository or safety fact cannot be resolved without guessing |
| `KL-EXIT-TEST-FAILED` | Tests still fail after bounded repair budget |
| `KL-EXIT-INVARIANT-BREACH` | A non-negotiable invariant was or would be violated |
| `KL-EXIT-SCOPE-BLOCKED` | Completion requires out-of-scope work |
| `KL-EXIT-STALLED` | Two materially identical failed attempts plus bounded re-plan cannot progress |
| `KL-EXIT-BUDGET-EXHAUSTED` | Any global fuel limit is reached before completion |
| `KL-EXIT-ENVIRONMENT-BLOCKED` | Toolchain, dependency or permission state prevents verification |

No terminal state permits Codex to start the API/mock-server successor task.

The K0–K4 run is autonomous after Kraken starts it: there is no routine human pause between K1 and K4. Safety, scope or evidence uncertainty is handled by a legal blocked terminal state, never by guessing. Kraken reviews only the returned evidence/terminal state before authorising any successor work.

## 5. K0 — Read-only baseline audit

### K0 actions

Before editing:

1. Resolve the exact repository root and record `pwd`.
2. Read every applicable `AGENTS.md`, `CLAUDE.md`, README and mobile design instruction in precedence order.
3. Record Git branch, HEAD SHA, status, tracked/untracked inventory and remotes without mutating them.
4. Identify package manager, Node version requirements, Expo/React Native version, TypeScript configuration, navigation framework, form/validation approach, state management, test runner and lint/typecheck commands.
5. Identify the exact components/files implementing original Step 1–3 and Review.
6. Identify assessment-state lifecycle and prove how cancel, finish, background/termination and new assessment clear state.
7. Identify the language selector, locale registry, exact eight configured locale identifiers, translation resources, fallback behaviour and localisation tests.
8. Search for existing field keys: `tumorSize`, `gender`, `ecogScore`, `pdl1Status`, `her2Low`, `lvef`, `treatmentIntent` and nodal status.
9. Search all network/API/gateway code and record the file boundary that must remain unchanged.
10. Run existing tests, typecheck and lint without updating dependencies or snapshots.
11. Record pre-existing failures separately; do not claim or repair unrelated defects.
12. Calculate hashes for the two controlling review/mock-up files if present.

### K0 required evidence

- baseline table with file paths and exact revisions;
- dirty-worktree classification distinguishing user changes from this task;
- current test posture;
- Step 1–3/Review component map;
- local-state clearing map;
- eight-locale registry and key/fallback map;
- network/interface exclusion file list;
- field-key findings and contradictions.

### K0 stop conditions

Exit without editing if:

- repository instructions prohibit the task;
- the worktree contains overlapping user changes that cannot be preserved safely;
- the implementation repository is not the stated one;
- P1/P2 cannot be added without editing network/API/gateway code;
- the app does not contain a verifiable eight-locale architecture and proceeding would require inventing one;
- baseline tests fail in a way that prevents attribution of new regressions.

K0 child return: `K0-PASS` or a legal terminal state with evidence.

## 6. K1 — Plan and executable field contract

### K1 actions

1. Produce a minimal changed-file plan; no file outside it may be edited without a recorded re-plan.
2. Map every new display field to local state type, validation rule, localisation keys, Review rendering and tests.
3. Extract enums from the actual repository where they exist. Distinguish display label from stored/local value.
4. Mark tumour-size unit/maximum, gender enum, nodal mapping, PD-L1 enum, HER2-low representation and treatment-intent enum as `PROVED`, `DISPLAY-ONLY`, or `BLOCKED`.
5. Choose a navigation representation that preserves the original Step 1–3 identity and exposes P1/P2 as a provisional extension.
6. Define how P1/P2 values stay out of any network request for this task. Prefer compile-time/type boundary plus tests over comments alone.
7. Define deterministic error IDs/messages and accessibility associations.
8. Define a locale parity test/report covering every configured locale.
9. Define rollback: revert only this task's changed files to the recorded K0 baseline; never reset unrelated user work.

### K1 gate

K1 may proceed autonomously to K2 only if all of the following are true:

- no clinical meaning is being invented;
- P1/P2 can be isolated from request mapping;
- missing contract facts can be represented honestly as provisional/pending without unsafe inputs;
- all planned edits are within the authorised mobile UI/state/i18n/test scope;
- all acceptance criteria have a planned test or inspection.

Otherwise return `KL-EXIT-CONTRACT-BLOCKED` or `KL-EXIT-SCOPE-BLOCKED`.

K1 child return: `K1-PASS`, changed-file plan and acceptance-test map.

## 7. K2 — Bounded implementation

Perform the smallest coherent implementation in this sequence:

### K2.1 Shared local types/state

- Add only the P1/P2 local-state fields that K1 can represent without guessing.
- Preserve null/undefined semantics used by the existing app.
- Keep the fields outside the API/request DTO type or mapper.
- Add explicit provisional metadata if the design uses it; do not infer reasoner consumption.

### K2.2 Validation

- Reuse the current validation architecture; do not add a second validation framework without necessity.
- Implement the v0.5 type/format/range rules.
- Do not implement reference thresholds as clinical eligibility rules.
- Implement first-error focus, accessible error association, value retention and deterministic messages.

### K2.3 P1 screen

- Match the attached visual design proportionately.
- Include tumour size, contract-proved sex/gender control if available, and the nodal-mapping contract warning.
- If a canonical enum/unit is unproved, render a clearly pending/disabled or display-only candidate state; never fabricate options.
- Keep synthetic-data/provisional language visible.

### K2.4 P2 screen

- Include ECOG, PD-L1, HER2-low, LVEF and treatment intent only as allowed by K1 findings.
- ECOG accepts only integers `0–4`; LVEF accepts finite values `0–100` inclusive.
- Enum values come from proved sources; otherwise use a pending state.
- Optional empty values remain null/absent.

### K2.5 Navigation and Review

- Preserve original Step 1–3 field behaviour and back/forward state.
- Add P1 then P2 before Review, clearly presented as a provisional extension.
- Extend Review with a separate provisional-fields section.
- Do not add P1/P2 values to a request payload.
- Cancel/new-assessment/completion clearing must cover all new fields.

### K2.6 Localisation

- Reuse the exact existing selector and locale registry.
- Add keys for labels, options, hints, errors, banners and Review text.
- Reuse approved translations if present.
- Do not present AI-invented clinical translations as approved.
- Apply the existing deterministic fallback only where necessary and report every fallback/missing translation.

### K2.7 Tests

Add or update tests only for changed behaviour. Do not update snapshots blindly.

K2 child return: changed-file inventory, requirement-to-diff map and test inventory.

## 8. K3 — Test, repair and refactor loop

Run the repository's actual commands identified in K0. At minimum, where supported:

1. targeted P1/P2 component and validation tests;
2. Step 1–3 regression tests;
3. navigation/back/cancel/clear tests;
4. Review rendering tests;
5. locale parity and selector regression tests;
6. accessibility assertions;
7. request-payload exclusion tests;
8. full unit/integration suite;
9. TypeScript typecheck;
10. lint/format check;
11. production or development bundle/build validation that does not sign or distribute.

### Mandatory test cases

- valid lower/upper bounds for Ki-67, age, ECOG and LVEF;
- values immediately outside each bound;
- decimals versus integers where appropriate;
- malformed, blank, whitespace, `NaN` and infinity-like numeric input;
- optional blank values;
- no default after screen entry or language switch;
- state retained on Back and cleared on Cancel/New assessment/defined completion;
- every configured locale loads P1/P2 without a missing-key crash;
- error text remains accessible and focusable;
- P1/P2 state never appears in an API/mock/gateway request object;
- Step 1–3 and existing Review/Result paths do not regress.

### Repair rule

For each failure:

1. classify `NEW-DEFECT`, `PRE-EXISTING`, `ENVIRONMENT`, or `CONTRACT`;
2. record attempt fingerprint;
3. make the smallest in-scope correction;
4. rerun the narrow failing check, then the relevant regression set;
5. decrement one test-fix cycle.

Do not weaken assertions, skip tests, delete coverage or change expected behaviour merely to obtain green output.

K3 child return: complete command/result table, failure history and residual risks.

## 9. K4 — Independent self-audit and terminal evidence

### K4 audit

1. Re-read the diff independently of the implementation narrative.
2. Compare final changed-file inventory with K1 plan.
3. Prove no API, gateway, mock-server, reasoner, ontology/SWRL, build-signing or unrelated file changed.
4. Search for hard-coded English strings in new UI code outside the established localisation mechanism.
5. Search for storage writes, analytics, logging of assessment values, silent defaults, coercion, `any`, disabled tests, skipped tests and swallowed errors introduced by the task.
6. Verify all fixtures and screenshots are synthetic.
7. Re-run final targeted and full verification checks.
8. Classify every acceptance criterion as `PASS`, `PARTIAL`, `FAIL`, or `NOT EVIDENCED`.
9. Return one legal terminal state. `PARTIAL` or `NOT EVIDENCED` on a mandatory criterion prohibits `KL-EXIT-COMPLETED`.

### Acceptance matrix

| ID | Required outcome |
|---|---|
| AC-01 | Correct authoritative repository and K0 baseline recorded |
| AC-02 | User's pre-existing work preserved |
| AC-03 | Original Step 1–3 behaviour preserved |
| AC-04 | P1 and P2 implemented in the demo flow and visibly provisional |
| AC-05 | P1 local validation matches v0.5 without invented enum/unit semantics |
| AC-06 | P2 local validation matches v0.5 |
| AC-07 | Optional empty values remain null/absent; required errors are deterministic |
| AC-08 | No clinical default, inference, clamp or silent coercion introduced |
| AC-09 | Review screen distinguishes provisional P1/P2 fields |
| AC-10 | P1/P2 values are excluded from all request/API/gateway/mock-server mappings |
| AC-11 | Assessment state remains memory-only and clearing controls cover new fields |
| AC-12 | Existing eight-locale selector remains functional |
| AC-13 | Locale-key parity report produced; untranslated clinical text identified honestly |
| AC-14 | Accessibility/error-focus requirements evidenced |
| AC-15 | Targeted, regression, typecheck and lint checks pass or are truthfully blocked |
| AC-16 | No forbidden or unrelated files changed |
| AC-17 | Synthetic-data-only evidence confirmed |
| AC-18 | Complete evidence packet and rollback instructions returned; no commit/push/deploy performed |

## 10. Required final evidence packet

Codex must return:

```markdown
# MOB-LOOP-P1P2-UI-001 Evidence Packet

## Terminal state
<one legal KL-EXIT-* state>

## Baseline
- Repository:
- Branch:
- Starting HEAD:
- Starting status:
- Instructions applied:
- Toolchain:

## Changed artefacts
| Path | Purpose | Planned in K1? | Within scope? |

## Field implementation map
| Display field | Local key/type | Validation | Locale keys | Review output | Request excluded evidence | Contract status |

## Eight-language parity
| Locale ID | Keys present | Approved translation available | Fallbacks | Layout/test result |

## Commands and results
| Command | Purpose | Exit/result | Failures/skips |

## Acceptance matrix
| ID | Expected | Observed | Evidence | Verdict | Required action |

## Invariant audit
| Invariant | Evidence | Verdict |

## Deviations, blockers and residual risks

## Rollback
Exact task-file reversal procedure that preserves unrelated user work.

## Final working-tree state
- Ending HEAD:
- Git status:
- Diff summary:
- Commit/push/deploy performed: NO

## Proposed next action
Stop. Await Kraken's review. Do not begin API/mock-server work.
```

## 11. Verification of termination and completion

Termination follows because every active cycle must either enter a terminal state or consume a finite iteration/test/re-plan budget. When any budget reaches zero, `KL-EXIT-BUDGET-EXHAUSTED` is mandatory.

Termination does not prove success. Completion is separately proved only by all mandatory acceptance criteria carrying `PASS` evidence. Codex's final response, absence of further tool calls, or a visually plausible screen is not completion evidence.

## 12. Kraken decision after the loop

After reviewing the evidence, Kraken may issue one of:

- `ACCEPT DEMO UI UPDATE`;
- `ACCEPT WITH CARRY-FORWARD CONDITIONS`;
- `RETURN FOR BOUNDED CORRECTION`;
- `HOLD FOR CLINICAL/CONTRACT DECISION`;
- `REJECT AND ROLLBACK`.

Only a later, separate authorisation may commission the API/mock-server interface loop.

If this task is accepted, update the later campaign's durable status/evidence controls with the accepted ending SHA and treat the modified Step 1–3/P1/P2/Review implementation as observed baseline—not as an assumption. Then begin that campaign at its required read-only preflight; do not jump directly to a mutating interface task.
