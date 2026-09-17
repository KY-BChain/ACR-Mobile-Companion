# ACR Mobile Companion — Kraken’s Loop Codex Implementation

## New-session title

**ACR Mobile Companion — Formalise and Execute the Codex Interface Implementation through Kraken’s Loop**

## Short introduction for the new session

This session will convert the existing ACR Mobile Companion interface implementation plan from a generally bounded Codex `/goal` workflow into a formally specified application of **Kraken’s Loop**: a finite, nested, evidence-driven agentic engineering method inspired by COBOL `PERFORM` and structured BASIC loops. The work must first prove that every loop has a definitive objective, finite execution budget, measurable acceptance conditions, controlled variables, parent/child return contract and explicit exit state. Only after Kraken accepts that control design may Codex perform the mobile-interface implementation.

The implementation concerns the ACR Mobile Companion as an **alternative user interface only**. The app must perform no clinical inference, must not connect directly to a Patient DB, must not change the ACR-Platform ontology, SWRL rules or clinical semantics, and must not intentionally retain clinical data. It may communicate only through an approved thin mobile gateway/interface that maps faithfully to the unchanged Sprint F `/api/infer` contract and presents the resulting Openllet/SWRL reasoning outputs.

Kraken is the sponsor, acceptance authority and release authority. Codex may inspect, plan, implement, test, refactor and—only if explicitly authorised—create local task commits. Codex may never infer authority to push, merge, deploy, sign, distribute, use real patient data or access production systems.

---

# Full description and controlling opening prompt

## 1. Purpose of this session

This is a new, dedicated engineering-control session for the ACR Mobile Companion interface campaign.

Its first purpose is to audit and revise the existing document provisionally identified as `ACR-MOB-LOOP-WP-001`, together with its 28-task plan and associated Codex commissioning script, so that it becomes a genuine, testable implementation of **Kraken’s Loop** rather than merely a long-running Codex goal with checkpoints.

Its second purpose, only after Kraken accepts the revised control pack, is to commission Codex to carry out the authorised mobile-interface work under that loop.

Do not begin implementation merely because this description has been supplied. The first stage is specification, reconciliation and proof. Stop for Kraken at the design-acceptance gate.

## 2. Authoritative definition of Kraken’s Loop

Kraken’s Loop is a bounded hierarchy of nested execution loops. Each loop must have:

1. a predefined, immutable objective for that loop instance;
2. explicit entry conditions;
3. named controlling inputs and accepted baseline;
4. permitted variables that may change through learning or refactoring;
5. protected invariants that may not change;
6. measurable completion and acceptance predicates;
7. finite iteration, recovery, resource or time budgets;
8. stall and non-progress detection;
9. defined failure, blocking and escalation conditions;
10. a return contract to its parent loop;
11. one explicit terminal state;
12. evidence sufficient for an independent reviewer to reproduce the result.

No loop may run indefinitely. Waiting for a human decision is a suspended state, not a running loop.

Continuous learning and refactoring may change implementation tactics, sequencing within authorised dependencies, internal structure and other declared variables. It may not silently change the objective, clinical meaning, safety boundaries, acceptance tests, source-of-truth baseline, authority model or forbidden actions. Such a change exits the current loop as `CHANGE_REQUESTED` or `ESCALATED` and requires a new accepted contract or version.

## 3. Mandatory loop hierarchy for this campaign

Use the following hierarchy unless evidence demonstrates that a different decomposition is materially safer or clearer. Any proposed change must be presented to Kraken before adoption.

| Level | Loop | Mobile campaign function | Required return to parent |
|---|---|---|---|
| `K0` | Campaign loop | Deliver the accepted Mobile Companion interface outcome | Campaign terminal state and complete evidence index |
| `K1` | Gate/phase loop | Complete one authorised group of dependent tasks | Gate acceptance packet or non-success exit |
| `K2` | Task loop | Produce one independently testable task outcome | Task acceptance matrix, diff, tests and commit state |
| `K3` | Build–test–refactor loop | Implement and verify one bounded attempt | Pass, counterexample/failure, or exhausted-attempt result |
| `K4` | Recovery/replan loop | Diagnose a bounded stall or failed approach | Repair plan, repaired result, or escalation |

Every child loop inherits all parent invariants and forbidden actions. A child may make controls stricter, never weaker. When a parent terminates, no child may continue.

## 4. Terminal states and semantic control

Software state and control decisions must use language-independent semantic IDs. Human-language labels are display and communication aids only.

Mandatory terminal states:

| Semantic ID | English | 简体中文 | Français | Controlling meaning |
|---|---|---|---|---|
| `KL-EXIT-COMPLETED` | Completed | 已完成 | Terminé | All mandatory acceptance predicates passed and required evidence exists |
| `KL-EXIT-FAILED` | Failed | 失败 | Échec | A mandatory acceptance predicate failed and no authorised recovery remains |
| `KL-EXIT-BLOCKED` | Blocked | 受阻 | Bloqué | An external dependency prevents lawful continuation |
| `KL-EXIT-ESCALATED` | Escalated | 已升级处理 | Escaladé | A decision outside the loop’s authority is required |
| `KL-EXIT-CANCELLED` | Cancelled | 已取消 | Annulé | The authorised owner ended the loop before completion |
| `KL-EXIT-BUDGET-EXHAUSTED` | Budget exhausted | 预算已耗尽 | Budget épuisé | The finite execution budget ended before acceptance |
| `KL-EXIT-CHANGE-REQUESTED` | Change requested | 已请求变更 | Modification demandée | Completion would require changing a protected objective, invariant or baseline |

The German and Russian labels and definitions must be supplied in the semantic appendix. The canonical semantic ID, not a translated phrase, must drive state transitions.

## 5. What constitutes proof

Do not claim that Kraken’s Loop has been “proved” merely because the description is logically attractive. Produce the following proof obligations.

### PO-01 — Termination

Every active loop must possess a finite integer execution budget (`fuel_remaining`) or another formally equivalent well-founded measure. Every iteration must either:

- enter a terminal state; or
- reduce that measure.

A retry, replan or recovery consumes budget. Child-loop budgets must be finite and charged to or bounded by the parent contract. Human waiting pauses execution and cannot consume an unbounded active iteration.

Evidence required:

- declared budget for every loop level and task class;
- transition table demonstrating that no active transition preserves unlimited fuel;
- test showing exhaustion produces `KL-EXIT-BUDGET-EXHAUSTED` or an authorised escalation;
- confirmation that no dependency cycle can keep tasks perpetually `READY`.

This proves termination, not successful completion. A loop may terminate as failed, blocked or exhausted.

### PO-02 — Partial correctness

If a loop returns `KL-EXIT-COMPLETED`, every mandatory postcondition must be true.

Evidence required:

- requirement-to-test traceability;
- acceptance matrix with `PASS`, `PARTIAL`, `FAIL` or `NOT EVIDENCED` for every criterion;
- rule that only an all-mandatory-`PASS` matrix can yield `KL-EXIT-COMPLETED`;
- independent inspection of the actual diff and test outputs.

### PO-03 — Safety preservation

No legal transition may violate the campaign invariants.

Evidence required:

- executable checks where feasible;
- searches/tests for mock fallback, clinical inference, Patient DB connectors, data-at-rest behaviour, ontology/SWRL changes and unauthorised network or release actions;
- immediate stop and escalation on invariant breach.

### PO-04 — Progress and stall handling

The loop must distinguish productive refinement from repetition.

Evidence required:

- attempt fingerprint containing task ID, baseline SHA, changed-file/diff hash, test-result signature and failure classification;
- stall counter when a materially equivalent attempt reproduces the same failure;
- bounded transition from repeated stall to `K4` recovery, then escalation or exhaustion;
- prohibition on reporting reworded analysis as implementation progress.

### PO-05 — Parent/child correctness

Every child result must be validated before the parent advances.

Evidence required:

- explicit child return schema;
- no task-to-gate promotion without accepted evidence;
- no gate-to-campaign promotion without Kraken’s required human acceptance;
- cancellation or suspension propagation from parent to all active children.

### PO-06 — Reproducibility and provenance

Every material implementation claim must be traceable to exact repository state and observable evidence.

Evidence required:

- repository path, branch, complete SHA and status;
- instruction files loaded;
- commands executed and full result posture, including failures, warnings and skips;
- changed-file inventory and diff inspection;
- local commit SHA when committing is authorised;
- evidence-bundle hash at accepted checkpoints.

### PO-07 — Semantic equivalence across languages

English, Chinese and French instructions must refer to the same canonical control concepts. German and Russian form the required appendix.

Evidence required:

- one semantic ID per control concept;
- canonical definition;
- preferred label per language;
- permitted synonyms and excluded interpretations where ambiguity is material;
- automated validation for unique IDs and complete required-language fields.

## 6. Assessment of the earlier mobile loop script

Treat the following as a hypothesis to verify against the actual supplied documents.

The earlier script already contains useful Kraken-compatible controls:

- a definitive mobile-interface objective;
- explicit exclusions and forbidden actions;
- read-only commissioning tasks before implementation;
- dependency-ordered tasks and mandatory human gates;
- durable status, decision and evidence records;
- per-task testing, diff inspection and local commit recording;
- separation of local commit authority from push, merge, deploy and release authority;
- explicit use of Codex `/goal` as the long-running execution mechanism.

However, it appears only **partially Kraken-conformant** because it does not yet make the following controls explicit and testable:

- `K0`–`K4` loop-instance contracts;
- finite fuel/iteration/replan budgets at every active level;
- a legal state-transition table;
- a parent/child return schema;
- formal stall fingerprints and repeated-failure detection;
- proof obligations for termination, partial correctness and invariants;
- separation between `Codex /goal` and the governing Kraken methodology;
- language-independent semantic IDs and multilingual correspondence tables;
- an objective-change exit rather than silent plan amendment;
- automated conformance tests for the loop control files.

Therefore, do not merely rename “Ralph-style loop” to “Kraken’s Loop”. Revise the execution architecture.

## 7. Required control artefacts

Audit the existing control directory and preserve useful material. The expected canonical directory is:

```text
docs/acr-mobile-integration-loop/
```

At minimum, reconcile or prepare proposals for:

```text
PROMPT.md
PLAN.md
RUNBOOK.md
STATUS.md
DECISIONS.md
EVIDENCE.md
KRAKEN-LOOP-CONTRACT.md
KRAKEN-LOOP-SEMANTICS.md
KRAKEN-LOOP-TRANSITIONS.md
KRAKEN-LOOP-PROOF-OBLIGATIONS.md
```

If machine-readable control is appropriate, propose—but do not implement before approval—a schema and validator such as:

```text
kraken-loop.schema.json
scripts/validate-kraken-loop.*
```

`AGENTS.md` must remain concise. It should point to these canonical files and state the non-negotiable execution rules; it must not duplicate the full plan.

## 8. Control frame for the mobile-interface campaign

### Objective

Deliver an independently testable ACR Mobile Companion that operates as an alternative UI to the accepted ACR-Platform Sprint F CDS interface through an approved thin mobile gateway, faithfully presents the returned Openllet/SWRL reasoning results, and satisfies the accepted privacy, attestation, failure-handling and standalone-build requirements.

### Success condition

Success requires all accepted task and campaign criteria to be evidenced as `PASS`, all mandatory human gates to be explicitly accepted by Kraken, exact source revisions and evidence to be recorded, and no unresolved invariant violation or acceptance failure.

### Non-negotiable invariants

- The mobile app is an alternative UI only.
- The mobile app performs no clinical inference.
- The mobile app contains no Patient DB connector.
- The mobile app does not alter clinical meaning.
- The ACR-Platform ontology, SWRL rules and accepted Sprint F semantics remain unchanged.
- No real patient data is used.
- No clinical data is intentionally stored at rest in the app.
- Partner/evaluation builds contain no silent mock fallback.
- Gateway mappings are faithful to the accepted `/api/infer` contract.
- Failures, missing fields and attestation errors fail visibly and safely.
- Codex never infers push, merge, deployment, signing, distribution or production authority.
- Kraken remains sponsor, acceptance authority and release authority.

### Baseline rule

Do not assume repository names, paths, branches, SHAs, evidence hashes, package classifications or Patient DB interface status from narrative history. Verify them read-only from the actual attached workspace and supplied artefacts. Label each item `FACT`, `ASSUMPTION`, `PROPOSAL` or `UNRESOLVED`.

## 9. Stage A — Read-only audit and redesign

Begin with read-only authority.

Read in full:

1. every applicable `AGENTS.md` and `AGENTS.override.md`;
2. the existing `ACR-MOB-LOOP-WP-001` or successor document;
3. every file in `docs/acr-mobile-integration-loop/`;
4. the accepted Mobile commissioning brief, setup checklist and evidence pack;
5. the actual Mobile Companion and extended-package documentation;
6. the accepted ACR-Platform Sprint F interface contract and evidence;
7. LPDI/Patient DB interface design documents relevant to the institution-local boundary;
8. any repository-level build, test, schema and security instructions.

Perform only non-mutating inspection. Do not edit, create, rename, delete, install, commit, push, merge, deploy, sign or distribute.

Return:

1. verified workspace/repository inventory;
2. branches, full HEAD SHAs, remotes and working-tree states;
3. instruction-file precedence;
4. accepted and conflicting baselines;
5. original-script Kraken conformance matrix;
6. dependency-cycle analysis of the task graph;
7. proposed `K0`–`K4` loop contracts and budgets;
8. proof-obligation matrix `PO-01`–`PO-07`;
9. proposed revised artefact set and exact changes;
10. open decisions that require Kraken;
11. a `GO / HOLD / NO-GO` recommendation for revising the control pack.

Stop for Kraken. Do not change permissions and do not implement.

## 10. Gate `KG-0` — Kraken accepts the methodology design

`KG-0` passes only when Kraken explicitly accepts:

- the verified baseline;
- the definitive objective and invariants;
- the loop hierarchy;
- exact task graph or accepted plan version;
- finite budgets and stall thresholds;
- terminal-state semantics;
- proof obligations;
- write ownership by repository;
- commit authority;
- the human gate schedule;
- the revised control-pack change set.

Silence is not acceptance. A recommendation is not acceptance. Codex’s confidence is not acceptance.

## 11. Stage B — Revise the control pack

Only after `KG-0` acceptance and explicit workspace-write authority:

1. revise the canonical control files using the accepted design;
2. preserve prior versions and mark superseded provisions explicitly;
3. add semantic IDs and multilingual correspondence tables;
4. encode budgets, transitions, return contracts and proof obligations;
5. add automated structural validation where authorised;
6. run documentation/schema/graph validation;
7. inspect the complete diff;
8. return an acceptance matrix and evidence packet;
9. create a local control-pack commit only if specifically authorised;
10. never push.

Suggested local commit message, subject to Kraken’s approval:

```text
docs(mobile): formalise Kraken's Loop control pack
```

Stop at `KG-1` for Kraken to inspect and accept the revised pack.

## 12. Stage C — Commission the Codex `/goal`

Codex `/goal` is the persistence mechanism for a long-running coding objective. It is not Kraken’s Loop itself. Kraken’s Loop is the governing contract, task hierarchy, evidence system and exit discipline within which `/goal` operates.

After `KG-1` acceptance, use an objective equivalent to:

```markdown
/goal Execute only the tasks authorised as READY in the accepted
docs/acr-mobile-integration-loop/PLAN.md, under the contracts, transitions,
budgets, proof obligations and authority limits in the accepted Kraken's Loop
control pack.

For each active loop instance:

1. Load the accepted objective, baseline, parent contract and inherited invariants.
2. Confirm entry conditions and finite fuel before doing work.
3. Select exactly the first READY task whose dependencies are accepted.
4. Open one K2 task loop and perform only its defined outcome.
5. Use a bounded K3 build-test-refactor loop; decrement fuel on every attempt.
6. Record the attempt fingerprint, complete test posture and diff evidence.
7. If progress stalls, enter K4 only within its accepted budget.
8. Return the child result to its parent using the canonical semantic exit ID.
9. Promote a task or gate only when all mandatory acceptance evidence is PASS.
10. Create an intentional local task commit only when authorised and accepted.
11. Continue only while the next task is READY, inside the same accepted gate,
    and all parent contracts remain active.
12. Stop at every human gate, invariant breach, material baseline contradiction,
    protected-objective change, blocker, cancellation or budget exhaustion.

Never push, merge, deploy, distribute, sign, access production, use real patient
data, alter ACR-Platform clinical semantics, change ontology/SWRL rules, place
clinical inference in the app, or place a Patient DB connector in the app.

Completion means every accepted campaign postcondition is independently
evidenced as PASS and Kraken has supplied the required acceptance. Stopping,
running out of work, reaching a token/time limit or producing a summary does
not mean completion.
```

If `/goal` is unavailable in the installed Codex version or surface, stop and report that fact. Do not imitate a persistent background goal while claiming that the command is active.

## 13. Per-iteration algorithm

The operational loop must follow this control flow:

```text
PERFORM K0-CAMPAIGN
  UNTIL K0-TERMINAL

  VERIFY K0-FUEL-AND-INVARIANTS
  SELECT FIRST-AUTHORISED-K1-GATE

  PERFORM K1-GATE
    UNTIL K1-TERMINAL

    VERIFY K1-FUEL-AND-DEPENDENCIES
    SELECT FIRST-READY-K2-TASK

    PERFORM K2-TASK
      UNTIL K2-TERMINAL

      PERFORM K3-BUILD-TEST-REFACTOR
        UNTIL ACCEPTANCE-PASSES
           OR K3-FUEL-EXHAUSTED
           OR INVARIANT-BREACH

        DECREMENT K3-FUEL
        RECORD ATTEMPT-FINGERPRINT
        IMPLEMENT BOUNDED CHANGE
        RUN REQUIRED VERIFICATION
        INSPECT COMPLETE DIFF
      END-PERFORM

      IF STALLED AND K4-AUTHORISED
        PERFORM K4-RECOVERY
          UNTIL RECOVERED
             OR K4-FUEL-EXHAUSTED
        END-PERFORM
      END-IF

      RETURN CANONICAL K2 EXIT TO K1
    END-PERFORM

    RETURN CANONICAL K1 EXIT TO K0
  END-PERFORM

END-PERFORM
```

The implementer must also express this as a legal transition table. Prose alone is insufficient.

## 14. Evidence record for every task

Each K2 task result must contain:

```text
loop_instance_id
parent_loop_instance_id
task_id
objective_version
baseline_repository
baseline_branch
baseline_full_sha
fuel_initial
fuel_consumed
fuel_remaining
attempt_fingerprints[]
changed_files[]
diff_hash
commands_and_results[]
acceptance_matrix[]
invariant_checks[]
warnings[]
failures[]
skips[]
local_commit_sha_or_NONE
terminal_semantic_id
exit_reason
review_authority
review_state
timestamp
```

Do not hide failed or skipped checks. Do not describe an unrun check as passing.

## 15. Human authority and Git model

Unless Kraken explicitly changes the authority model:

- Codex may conduct authorised local inspection, editing and testing.
- Codex may create local task commits only after the control pack explicitly permits it.
- Kraken reviews local commits at mandatory gates.
- Kraken alone authorises and performs or separately directs any push.
- Merge, deployment, signing, distribution and production access remain separately prohibited until explicitly authorised.

Commit, push, merge, deploy and release are distinct permissions. One never implies another.

## 16. DLT/blockchain position

Do not introduce DLT into the mobile implementation loop merely because Kraken’s broader methodology can support it.

For this campaign, Git SHAs, evidence-bundle hashes, signed human approvals and an append-only decision history are sufficient unless Kraken separately authorises a DLT proof-of-concept.

If a later DLT layer is evaluated, keep source diffs, prompts, patient/clinical data and detailed logs off-chain. Anchor only accepted checkpoint identifiers, baseline/evidence hashes, validator identities, decision state, timestamps and supersession/rollback references. DLT may attest agreement and provenance; it does not prove that clinical or software reasoning is correct.

## 17. Required first response in the new session

The first response must not pretend that the repositories or files have already been inspected. It must:

1. acknowledge the two-stage purpose—formal proof/control design first, implementation later;
2. state that the former script is provisionally assessed as partially, not fully, Kraken-conformant;
3. list the exact source documents and repository roots required for read-only audit;
4. confirm the explicit exclusions and authority model;
5. identify any missing files or paths that prevent the audit;
6. propose the immediate read-only action;
7. avoid implementing or changing anything before Kraken supplies or confirms the necessary inputs and authority.

## 18. Current official Codex facts to preserve

The session should verify current behaviour from official OpenAI documentation before relying on it. At the date of this brief:

- `/goal <objective>` is documented for a durable, long-running objective with a verifiable stopping condition;
- `/goal`, `/goal pause`, `/goal resume` and `/goal clear` are documented controls, and current documentation also describes `/goal edit`;
- `AGENTS.md` instructions are discovered from global and project scopes, with nearer project instructions taking precedence according to the documented discovery rules;
- read-only and workspace-write permissions are distinct least-privilege modes/profiles;
- the newer named permission-profile system and the older `sandbox_mode` system should not be combined in one effective configuration;
- workspace-write does not necessarily grant write access to `.git`, so local commit capability must be verified rather than assumed.

Official references:

- https://learn.chatgpt.com/use-cases/follow-goals
- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://learn.chatgpt.com/docs/permissions
- https://learn.chatgpt.com/docs/config-file/config-advanced

## 19. Final governing statement

The campaign is not complete because Codex has iterated many times, produced persuasive prose, exhausted its context, stopped running or created code that appears plausible.

It is complete only when the accepted objective is satisfied, every mandatory postcondition and invariant is evidenced, the nested loops have returned lawful terminal states, the implementation matches the accepted Sprint F interface contract, and Kraken has explicitly accepted the required gates.

**Ralph-style repetition may operate inside K3. Codex `/goal` may sustain the campaign. Kraken’s Loop governs both.**
