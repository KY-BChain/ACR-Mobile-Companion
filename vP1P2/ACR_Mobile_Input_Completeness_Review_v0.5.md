# ACR Mobile Companion — Input Completeness Review

**Version:** v0.5 — clinical-partner review and demo/testing implementation candidate  
**Date:** 15 August 2026  
**Decision status:** `EVIDENCE READY — NOT CLINICALLY ACCEPTED`  
**Intended next version:** v1.0 after ZZU/UCD clinical review, contract reconciliation and Kraken acceptance  
**Controlling clinical baseline:** ACR-Platform Sprint F / `OPENLLET_SWRL` / 76 SWRL rules / 27 SQWRL queries / ontology SHA-256 `b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1`

## 1. Purpose and decision

This document defines a **provisional five-screen structured-entry surface for demonstration and synthetic-data testing** of the ACR Mobile Companion. It preserves the existing three New Assessment screens and adds the two review-candidate screens P1 and P2.

The mobile app remains an alternative input and presentation client for the unchanged ACR-Platform Sprint F reasoning service. It does not perform clinical inference, create clinical rules, connect directly to a Patient DB, or intentionally retain clinical data.

The v0.5 decision is:

> **GO for a bounded demo/testing implementation of P1 and P2, including deterministic client-side type, format and range validation. HOLD for API submission, production use and clinical completeness claims until the executable contract and rule dependencies are reconciled and the clinical partners advise on the fields.**

The current product classification remains:

> **Sprint F CDS output mirror with a provisional structured-entry surface** — not a subtyping-only product, and not yet a complete treatment recommender.

## 2. Authority and review status

| Matter | Authority |
|---|---|
| Clinical sufficiency, terminology, units, clinically valid ranges and recommendation prerequisites | Designated ZZU/UCD clinicians and ACR clinical advisers |
| Ontology, SWRL and API changes | ACR governed change process; not this mobile task |
| Demo/mobile implementation acceptance | Kraken |
| Release, push, distribution and use with any real patient data | Kraken; separately authorised |
| Software implementation | Codex, within the bounded execution brief only |

No field becomes clinically approved because it appears in a mock-up, test dataset, DTO, mobile screen or AI-generated document.

## 3. Evidence boundary and source artefacts

This v0.5 review is derived from:

- `ACR_Mobile_Field_Completeness_Review_Candidate_v0.8.html`;
- `ACR_Mobile_Input_Completeness_Review_v0.1.md`;
- the retained ACR Sprint F/mobile design record;
- `ACR-MOB-LOOP-WORK-PLAN_v0.1.md` and `ACR-MOB-LOOP-CODEX-RUNBOOK_v0.1.md` as the later interface campaign controls;
- the recorded Sprint F `PatientData` field inventory;
- the existing three-screen Mobile Companion implementation and its working eight-language selector, to be verified in the repository before editing.

The following were not executable artefacts in the document-review environment and must be checked by Codex in the actual repositories:

- current TSX components and navigation flow;
- the exact list of eight locale identifiers and translation keys;
- current form state, validation library and test framework;
- current Java DTO and `/api/infer` mapper;
- exact enums, units, nullability and per-rule traces;
- the 200-record test database value distributions.

Therefore, v0.5 is an implementation candidate and clinical review instrument, not the final input contract.

## 4. Proposed demo/testing assessment flow

The original steps remain identifiable and retain their present clinical groupings. P1 and P2 form a clearly marked **provisional extension** after Step 3 and before Review.

| Order | Screen | Status in v0.5 demo build | Purpose |
|---:|---|---|---|
| 1 | Step 1 — Receptors | Existing | ER, PR, HER2 and Ki-67 |
| 2 | Step 2 — Tumour | Existing | Stage, grade, histology, nodal status and age |
| 3 | Step 3 — Biomarkers and surgery | Existing | CA 15-3, CEA and surgery date |
| 4 | P1 — Core contract reconciliation | New, provisional | Tumour size, sex/gender contract field and nodal-mapping warning |
| 5 | P2 — Existing Sprint F modifiers | New, provisional | ECOG, PD-L1, HER2-low, LVEF and treatment intent |
| 6 | Review | Existing, to be extended | Display all entered values and provisional status before any submission action |

P1/P2 may be active in a synthetic-data demo build. Their values must remain in local in-memory assessment state and must **not** be mapped to a real or mock network request during this task.

If Kraken accepts the implementation, its exact mobile-repository SHA and evidence packet become part of the starting baseline for the later integration campaign. That campaign must re-run its read-only `MOB-LOOP-S000/S002` inventory against the updated app. This v0.5 task does not supersede, skip or pre-accept any later interface gate.

The flow must visibly state that P1/P2 are pending clinical and executable-contract confirmation. This label must not be removed merely to make the demonstration look production-ready.

## 5. Field inventory and provisional validation specification

### 5.1 Validation principles

Client-side validation is limited to preventing malformed demo input. It must not perform clinical interpretation or duplicate Openllet/SWRL logic.

1. Required fields must be explicitly identified; optional empty fields remain `null`/absent according to the existing local state model.
2. No clinical default may be inserted for an omitted field.
3. Numeric parsing must reject `NaN`, infinity, mixed text and locale-ambiguous input.
4. Enum values must come from the canonical repository artefact. Display labels must not be treated as wire values.
5. Thresholds shown as clinical reference text must not be enforced unless they are also documented input-domain bounds.
6. Errors must be shown in text, associated with the field, announced to assistive technology and not conveyed by colour alone.
7. On attempted continuation, focus must move to the first invalid field and valid entries must be retained.
8. No input validation may silently clamp, round, coerce or substitute a value.

### 5.2 Existing Step 1–3 fields

| Screen/field | Local data type | Provisional client validation | Required? | Contract/clinical item requiring confirmation |
|---|---|---|---|---|
| ER status | Enum | Exact existing enum only | Current screen: required | Whether `unknown/not tested` is permitted |
| PR status | Enum | Exact existing enum only | Current screen: required | Whether `unknown/not tested` is permitted |
| HER2 status | Enum | Exact existing enum only | Current screen: required | Whether equivocal/ISH states are represented upstream |
| Ki-67 (%) | Finite decimal | `0–100` inclusive | Current screen: required | Threshold semantics remain server-side |
| Stage | Enum | Exact existing enum; no aliases | Optional | Exact stage vocabulary/substage support |
| Grade | Integer enum | `1`, `2` or `3` | Optional | Confirm JSON number versus string |
| Histological subtype | Enum | Existing controlled list; no free text | Optional | Exact ontology/API mapping |
| Nodal status | Enum | Existing UI values `N0–N3` only | Optional | Blocking conflict with recorded `positive/negative` DTO representation |
| Age (years) | Integer | `18–120` inclusive | Optional | Clinical lower bound and reasoner dependency |
| CA 15-3 (U/mL) | Finite decimal | Non-negative; upper bound must come from contract/data evidence | Optional | Unit, laboratory context and accepted maximum |
| CEA (ng/mL) | Finite decimal | Non-negative; upper bound must come from contract/data evidence | Optional | Unit, laboratory context and accepted maximum |
| Surgery date | ISO date | Valid `YYYY-MM-DD` calendar date | Optional | Future dates remain permitted in the client so the reasoner's B3 guard remains testable |

### 5.3 P1 — Core contract reconciliation

| Field/control | Local data type | Provisional client validation | Demo status | Blocking confirmation before API work |
|---|---|---|---|---|
| Tumour size (`tumorSize`) | Finite decimal | Numeric and greater than zero; no maximum until canonical unit/range is found | Candidate input | Unit, upper bound, required/null status and consuming rules |
| Sex/gender used by reasoner (`gender`) | Enum | Exact canonical enum only; no silent default | Contract-gated input | Accepted values, approved clinical wording, purpose and upstream provenance |
| Nodal mapping warning | Informational state | Prevents any future request mapping while UI `N0–N3` versus DTO `positive/negative` remains unresolved | Required warning | Executable mapper plus clinician-approved semantics |

If Codex cannot find the canonical `gender` enum or tumour-size unit in the authorised repository evidence, it must not invent them. The affected control must remain visibly contract-pending and the evidence packet must record `BLOCKED`.

### 5.4 P2 — Existing Sprint F modifiers

| Field | Local data type | Provisional client validation | Demo status | Contract/clinical confirmation |
|---|---|---|---|---|
| ECOG performance status (`ecogScore`) | Integer enum | `0–4` inclusive | Optional candidate | Rule dependencies and whether every score is accepted |
| PD-L1 status (`pdl1Status`) | Enum | Exact canonical enum only | Optional candidate | Assay/threshold context, accepted values and active rules |
| HER2-low (`her2Low`) | Enum/boolean as proven by source | Exact canonical representation only | Optional candidate | Whether active Sprint F rules consume it |
| LVEF (%) (`lvef`) | Finite decimal | `0–100` inclusive | Optional candidate | Measurement context, clinically relevant threshold and active rules |
| Treatment intent (`treatmentIntent`) | Enum | Exact canonical enum only | Optional candidate | Accepted values and rule dependency; it is not prior-therapy history |

## 6. Associated validation states

Two validation-state mock-ups accompany P1 and P2 for implementation and testing:

- **V1 — P1 validation:** malformed tumour size, missing/unavailable canonical enum and unresolved nodal mapping are identified separately. A mapping contradiction is a contract blocker, not a patient-input error.
- **V2 — P2 validation:** ECOG outside `0–4`, LVEF outside `0–100`, invalid enum keys and malformed numbers produce deterministic inline errors. Optional blank values do not produce errors.

The implementation must also extend the Review screen to show P1/P2 values under separate **Provisional clinical-review fields** sections. It must never relabel those fields as reasoner-consumed until the interface contract has been proved.

See `ACR_Mobile_P1_P2_Validation_Mockups_v0.5.html` for the visual validation candidate. The controlling source for P1/P2 layout remains `ACR_Mobile_Field_Completeness_Review_Candidate_v0.8.html`.

## 7. Eight-language requirement

The current Mobile Companion already has a working language selector aligned with the main ACR Platform website's eight-language offering. This capability must be preserved.

Codex must:

1. read the supported-locale list from the current mobile repository; it must not guess the eight languages;
2. add localisation keys for every P1/P2 label, option, hint, provisional banner, validation message and Review-screen heading;
3. preserve the existing selector, locale persistence behaviour and fallback policy unless this conflicts with the no-data-at-rest rule;
4. reuse supplied/approved translations where present;
5. not invent clinically approved translations;
6. produce a locale-by-key parity report for all eight configured locales;
7. mark missing clinical translations explicitly for partner review and keep them out of any production-ready claim;
8. test layout at the longest available translated labels, right-to-left behaviour if any configured locale requires it, text scaling and screen-reader labels.

English (UK) remains the source wording for v0.5. Any temporary fallback to English must be deterministic, visible in the evidence report and limited to the demo/test build until clinical language review is complete.

## 8. Fields not added by v0.5

| Proposed field | v0.5 disposition | Reason |
|---|---|---|
| Menopausal status | Defer | Present in test-data notes but not proved in the deployed request/rule path |
| BRCA1/2 status | Defer | No retained Sprint F request key or rule mapping |
| Prior therapies | Exclude from this task | Requires a temporal treatment-history model, not a UI-only list |
| Generic comorbidities | Exclude from this task | No current generic contract; discrete measurements must be considered separately |
| Pregnancy status, residual disease and additional timing fields | Reconcile, do not add in this update | Recorded in wider model but not part of the attached P1/P2 decision |

These concepts may be clinically important. Their exclusion from v0.5 means only that a mobile-only change is not authorised.

## 9. Clinical-partner questions for ZZU and UCD

For each field, the clinical partners are asked to classify it as `MANDATORY`, `CONDITIONALLY REQUIRED`, `OPTIONAL`, `EXCLUDE`, or `FUTURE GOVERNED EXTENSION`, and advise:

1. Is the field needed for a useful, meaningful and explainable CDS result?
2. Which recommendations or rule groups depend on it?
3. What is the clinically correct definition, unit and controlled vocabulary?
4. What represents unknown, not tested, unavailable and not applicable?
5. Which combinations are invalid, contradictory or insufficient for a recommendation?
6. Which missing fields must suppress a recommendation rather than merely lower confidence?
7. Are the proposed English (UK), Chinese and French labels clinically accurate?
8. What review is required for the other configured mobile/web languages?
9. Are the 200 synthetic test records representative enough to exercise the field safely?
10. Which additional synthetic edge cases must be included before v1.0?

## 10. Demo/testing acceptance criteria

| ID | Criterion |
|---|---|
| AC-01 | Existing Step 1–3 behaviour and visual structure remain functional. |
| AC-02 | P1 and P2 are reachable only in the authorised demo assessment flow and are visibly provisional. |
| AC-03 | Every new field uses in-memory state only; cancel, completion and app background/termination follow existing clearing controls. |
| AC-04 | No API client, gateway, mock-server request schema or reasoner code is changed. |
| AC-05 | Client validation follows Sections 5–6 and never performs clinical inference, defaulting or silent coercion. |
| AC-06 | Review displays P1/P2 values distinctly and does not claim reasoner consumption. |
| AC-07 | The existing eight-language selector still works; all new keys appear in a locale parity report. |
| AC-08 | Unit, enum or mapping contradictions cause an explicit `BLOCKED`/pending state, not an invented value. |
| AC-09 | Automated tests cover valid, boundary, invalid, empty optional, back-navigation, cancel/clear and language-switch cases. |
| AC-10 | Accessibility checks cover labels, error association, focus, screen readers, colour independence and text scaling. |
| AC-11 | Only synthetic fixtures are used; no real, coded or pseudonymised patient data enters the app or evidence. |
| AC-12 | Codex returns a changed-file inventory, diff, test output and criterion-by-criterion evidence; it does not commit, push or continue to interface development. |

## 11. Stop conditions

Implementation must stop and return evidence if:

- the actual repository contradicts the screen/field baseline;
- supported locales, validation framework or state-clearing behaviour cannot be proved;
- P1/P2 cannot be isolated from the API/mock-server layer;
- canonical enum/unit information is absent and the UI cannot represent a safe pending state;
- any test suggests persistence of assessment data;
- unrelated or Sprint G/Phase 4 files would need to change;
- existing Step 1–3 tests regress;
- clinical meaning would have to be invented to proceed.

## 12. Required path to v1.0

v1.0 requires all of the following:

1. executable field map from UI state through gateway/API DTO to ontology property and consuming SWRL rules;
2. evidence for `FIRED`, `NOT_MATCHED` and `ERROR` profiles using synthetic data;
3. resolved tumour-size unit, gender terminology/enum and nodal mapping;
4. ZZU/UCD advice on necessity, clinical definitions, missing-data behaviour and multilingual terminology;
5. updated validation tests and eight-locale parity evidence;
6. Kraken's explicit acceptance of the reconciled clinical input specification.

Until then, P1/P2 remain demo/testing candidates and cannot support a production, diagnostic or complete-treatment-recommendation claim.
