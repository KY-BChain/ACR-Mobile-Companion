# ACR Mobile Companion — Complete `/loop` Workflow

**Version:** 1.0  
**Date:** 3 August 2026  
**Status:** DRAFT — for architecture, contract and build review  
**Sources:** ACR-DD-013 v0.7, ACR-DD-014 v0.1, ACR_Mobile_Mockup_iPhone_v0.7.html

---

## 0. Philosophy

The `/loop` is a **tight, gated, evidence-based build sequence** — not an administrative programme. Each slice has one objective, one evidence gate, and one stopping condition. The mobile app is UI-only, in-memory-only, and synthetic-data-only. No clinical logic runs on the device. No patient data is persisted. No Phase 4 surface appears.

---

## 1. Pre-Loop: Inventory & Freeze

### 1.1 Controlled Sources Checklist

Before any code is written, verify these documents are present and version-locked:

| Document | Version | Purpose |
|----------|---------|---------|
| `ACR-DD-013_Mobile_App_Design_v0.7.md` | v0.7 | Mobile scope, field set, attestation, retention, exclusions |
| `ACR_Mobile_Mockup_iPhone_v0.7.html` | v0.7 | 9-screen visual specification, every renderable value |
| `ACR-DD-014_Backend_API_Specification_v0.1.md` | v0.1 | `/m/v1` contract, canonical model, error envelope |
| `MOB-S000_request_schema.json` | — | Sprint F internal request DTO (reconciliation required) |
| `MOB-S000_request_sample.json` | — | Sprint F request sample |
| `MOB-S000_response_sample.json` | — | Sprint F response sample |
| `MOB-S000_PartA_Inspection.md` | — | Sprint F evidence inspection |

**Gate:** All 7 documents present and hash-verified. If MOB-S000 files are missing, the loop stops at L0.

### 1.2 Baseline Pin Table (Immutable)

| Item | Pinned Value | Verification Method |
|------|------------|---------------------|
| Reasoner version | `2.2.1` | `GET /m/v1/attestation` |
| Reasoning mode | `OPENLLET_SWRL` | Attestation response |
| Ontology SHA-256 | `b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1` | Full string comparison |
| Rule count | `76` | Attestation response |
| Query count | `27` | Attestation response |
| Confidence pin | `0.6001915864330829` | `POST /m/v1/infer` response |
| Response contract | `m1` | Response envelope |
| Mobile contract | `acr.cds.v1` | Request/response envelope |

**Gate:** No slice may change a pinned value. If reconciliation reveals a mismatch, stop and escalate.

---

## 2. The Seven Loop Slices

### L0 — Reconcile

**Objective:** Map the approved mobile visual requirements to the actual Sprint F internal contract without semantic drift.

**Activities:**
1. Side-by-side comparison of `ACR-DD-014` §5.1 request envelope with `MOB-S000_request_schema.json`
2. Side-by-side comparison of `ACR-DD-014` §5.4 response envelope with `MOB-S000_response_sample.json`
3. Field-mapping table: every mobile field → Sprint F DTO field → `/m/v1` JSON path
4. Enum reconciliation: stage, grade, histology, nodal status — exact Sprint F values only, no aliases
5. Identify contradictions (e.g., optional field representation, histology code for Paget's)

**Deliverables:**
- `L0_Field_Mapping_Table.md`
- `L0_Enum_Reconciliation.md`
- `L0_Contradictions_Log.md` (empty = clean pass)

**Evidence Gate:**
- [ ] Every mockup screen field has a mapped DTO field
- [ ] Every enum value in the mockup exists in the Sprint F schema
- [ ] No unresolved clinical ambiguity
- [ ] Contradictions log reviewed by domain reviewer

**Stop Condition:** Any contradiction that changes clinical meaning → escalate before L1.

---

### L1 — Freeze Contract

**Objective:** Produce machine-verifiable JSON Schema / OpenAPI artefacts for the mobile external contract.

**Activities:**
1. JSON Schema for `acr.cds.v1` request envelope (`additionalProperties: false`)
2. JSON Schema for `acr.cds.v1` response envelope
3. JSON Schema for `acr.attestation.v1` envelope
4. JSON Schema for `acr.error.v1` envelope
5. Positive and negative test examples for each schema
6. OpenAPI 3.1 spec for `/m/v1` route inventory (§6.1)

**Deliverables:**
- `schemas/acr.cds.v1.request.schema.json`
- `schemas/acr.cds.v1.response.schema.json`
- `schemas/acr.attestation.v1.schema.json`
- `schemas/acr.error.v1.schema.json`
- `schemas/m1.openapi.json`
- `tests/schema_positive/` (valid examples)
- `tests/schema_negative/` (invalid examples with expected errors)

**Evidence Gate:**
- [ ] All positive examples pass schema validation
- [ ] All negative examples fail with correct error path
- [ ] `additionalProperties: false` enforced on every clinical schema
- [ ] No patient-identifier fields exist in mobile request schema
- [ ] Schema version matches pinned baseline

**Stop Condition:** Any schema test fails → fix schema or escalate before L2.

---

### L2 — Mobile Gateway

**Objective:** Implement the `/m/v1` gateway surface: `live`, `auth`, `attestation`, `infer`.

**Activities:**
1. `GET /m/v1/live` — minimal liveness, no baseline disclosure
2. `POST /m/v1/auth/redeem` — invite code → token family
3. `POST /m/v1/auth/refresh` — rotating refresh credential
4. `POST /m/v1/auth/revoke` — administrative revocation
5. `GET /m/v1/attestation` — expected vs. observed baseline comparison
6. `POST /m/v1/infer` — schema validation → attestation gate → reasoner proxy → normalised response
7. Input/output logging audit: confirm no clinical payload in logs/traces/cache/metrics
8. Rate limiting: invite, refresh, infer separate buckets

**Deliverables:**
- Gateway service code
- Route-level unit tests
- Integration tests against mock reasoner
- Security scan: log leakage test
- `L2_Gateway_Test_Report.md`

**Evidence Gate:**
- [ ] `POST /m/v1/infer` returns `503` when attestation is `MISMATCH` or `UNAVAILABLE`
- [ ] `POST /m/v1/infer` returns `400` for unknown fields
- [ ] No clinical value appears in any observed log, trace, or metric label
- [ ] Token reuse detection revokes family
- [ ] Rate limits enforced per route category
- [ ] Response normalisation preserves clinical meaning byte-for-byte

**Stop Condition:**
- Attestation gate fails open → **CRITICAL STOP**
- Clinical value in log → **CRITICAL STOP**
- Response changes clinical meaning → **CRITICAL STOP**

---

### L3 — Mobile Client

**Objective:** Bind the 9 English mockup screens to the generated `m1` types and `/m/v1` gateway.

**Activities:**
1. Project scaffold: React Native + TypeScript (or Flutter / SwiftUI + KMP)
2. Design system tokens: colours, typography, spacing from mockup CSS
3. Component library: card, header, segmented control, input, banner, badge, stop box
4. Screen 1: Welcome / Consent — acknowledgement only, no clinical consent
5. Screen 2: Step 1 — Receptors (ER, PR, HER2, Ki-67) + session ID generation
6. Screen 3: Step 2 — Tumour (stage, grade, histology, nodal, age)
7. Screen 4: Step 3 — Markers (CA 15-3, CEA, surgery date)
8. Screen 5: Review — attestation display, submit button (blocked if not VERIFIED)
9. Screen 6–7: Result — subtype, confidence, rules, recommendations, provenance, retention notice
10. Screen 8: About — build identity, baseline attestation, data handling
11. Screen 9: Fail-closed — attestation unavailable/mismatch, retry check
12. Navigation stack: Welcome → Step1 → Step2 → Step3 → Review → Result
13. State management: in-memory only (Zustand/Context), **no AsyncStorage, no SQLite, no files**
14. Form validation: format-only (ranges, enums), no clinical threshold application
15. Error handling: ACR error envelope mapped to user-facing messages (no stack traces)

**Deliverables:**
- Complete source tree (this repository)
- Component storybook / snapshot tests
- iOS build (TestFlight or local simulator)
- Android build (local emulator)
- `L3_Client_Screen_Matrix.md` (every screen vs. mockup comparison)

**Evidence Gate:**
- [ ] Every mockup screen has a corresponding implemented screen
- [ ] Every rendered value in the mockup is rendered from API response (not hardcoded)
- [ ] Attestation `UNAVAILABLE` blocks submission and routes to Screen 9
- [ ] Leaving Result screen clears assessment from memory
- [ ] No patient identifier input field exists anywhere
- [ ] No free-text input exists anywhere
- [ ] No analytics SDK initialised
- [ ] No crash reporting enabled
- [ ] No OTA update mechanism configured
- [ ] iOS and Android builds compile without warnings

**Stop Condition:**
- Persistent storage of assessment data → **CRITICAL STOP**
- Analytics or crash reporting initialised → **CRITICAL STOP**
- Hardcoded clinical values in result screen → fix before L4
- Missing fail-closed screen → **CRITICAL STOP**

---

### L4 — Local Clinical Plane

**Objective:** Implement `/site/v1` around the **unchanged** Sprint F reasoner for institution-local deployment.

**Activities:**
1. `/site/v1/attestation` — local baseline verification
2. `/site/v1/assessments` — structured input + local record reference modes
3. `/site/v1/patients/search` — POST-body search, no URL parameters
4. `/site/v1/cohorts/query` — registry-approved SQWRL only, zero egress
5. `/site/v1/import-jobs` — validated DB extract/CSV import
6. `/site/v1/releases/pending` + `/activate` — signed release activation
7. Egress Gate: schema-enforced RPR batching, minimum batch size `k`
8. Local audit: append-only, institution-controlled

**Deliverables:**
- Local node service code
- `/site/v1` OpenAPI spec
- Local-only boundary tests
- Egress Gate adversarial tests
- `L4_Local_Boundary_Test_Report.md`

**Evidence Gate:**
- [ ] Patient search results remain local (zero outbound network call)
- [ ] Cohort query produces zero RPR candidates
- [ ] RPR batch below `k` is not transmitted
- [ ] RPR schema with unknown field is quarantined
- [ ] Release activation is atomic (rollback on mismatch)
- [ ] Local audit is append-only and tamper-evident

**Stop Condition:**
- Patient data leaves institution boundary unbatched → **CRITICAL STOP**
- Cohort query result transmitted to central network → **CRITICAL STOP**
- Release activation non-atomic → fix before L5

---

### L5 — Portal Separation

**Objective:** Bind real users, institutions, and node metadata to `www.acragent.com` without clinical proxying.

**Activities:**
1. `/portal/v1/me` — user identity and memberships
2. `/portal/v1/institutions` — visible institution list
3. `/portal/v1/institutions/{id}/nodes` — node metadata and health
4. `/portal/v1/institutions/{id}/nodes/register` — node public identity
5. `/portal/v1/invitations` — role-based user invitation
6. `/portal/v1/releases` — approved release catalogue (non-clinical metadata)
7. Database schema audit: confirm no patient-derived column
8. Route inventory audit: confirm no `/site/v1` or `/m/v1` clinical routes exposed through portal

**Deliverables:**
- Portal service code
- Database schema documentation
- Route inventory report
- `L5_Portal_Boundary_Audit.md`

**Evidence Gate:**
- [ ] Portal database contains no patient identifier column
- [ ] Portal has no route capable of carrying clinical assessment input
- [ ] Portal does not reverse-proxy to `/site/v1`
- [ ] Institution-local CDS screen connects directly to local node
- [ ] Node health endpoint returns no clinical baseline details

**Stop Condition:**
- Portal schema contains patient data field → **CRITICAL STOP**
- Portal acts as reverse proxy for clinical payload → **CRITICAL STOP**

---

### L6 — Rules / RPR Plane

**Objective:** Implement signed release distribution and schema-enforced RPR batching with DLT anchoring.

**Activities:**
1. `/network/v1/releases/{version}/manifest` — signed manifest metadata
2. `/network/v1/releases/{version}/package` — content-addressed release package
3. `/network/v1/nodes/{nodeId}/acknowledgements` — activation status (no patient data)
4. `POST /network/v1/rpr-batches` — batch submission with signature verification
5. RPR schema enforcement: `additionalProperties: false`, quantised confidence, day-precision dates
6. DLT anchor verification: batch hash must match ledger entry
7. Adversarial tests: malformed RPR, undersized batch, hash mismatch, signature failure

**Deliverables:**
- Network service code
- Release manifest format specification
- RPR batch schema and validation logic
- DLT anchor verification module
- `L6_RPR_Adversarial_Test_Report.md`

**Evidence Gate:**
- [ ] RPR with unknown field is rejected and quarantined
- [ ] RPR batch below site `k` is not transmitted
- [ ] Batch hash mismatch triggers network rejection
- [ ] Node signature failure triggers network rejection
- [ ] DLT contains hash + site ID + timestamp, not payload
- [ ] Release manifest includes dual-institution signatures and DLT anchor

**Stop Condition:**
- RPR contains raw clinical value or free text → **CRITICAL STOP**
- RPR transmitted without DLT anchor → **CRITICAL STOP**
- Release package activated without hash verification → **CRITICAL STOP**

---

## 3. Cross-Cutting Gates (Every Slice)

### 3.1 Clinical Meaning Preservation

- Ontology SHA-256 unchanged
- Confidence pin byte-for-byte
- Rule guard behaviour identical
- Recommendation text unmodified by gateway
- Subtype semantics preserved
- Truthful rule firing (no suppression, no invention)

### 3.2 Security Invariants

- TLS 1.2+ only
- No clinical values in URLs, headers, logs, traces, caches, metrics
- `additionalProperties: false` on all clinical schemas
- Bounded string lengths and array sizes
- No arbitrary query text or rule source text accepted
- Rate limits per route category (keys must not include patient fields)

### 3.3 Privacy Invariants

- Mobile: no intentional clinical data at rest
- Local: patient store institution-controlled, audit append-only
- Central: no patient input, result, or cohort-result fields
- RPR: de-identified, quantised, batched, anchored

### 3.4 Mobile Permanent Exclusions

The following must have **no route, dependency, import, screen, or feature flag** in the mobile app:

- Governance Consensus engine
- Governance chambers
- Authority or credibility registries
- Proposal or voting functions
- DLT or ledger anchoring
- Federated learning
- Reinforcement learning
- Agentic AI rule-proposal functions
- Rule activation or rollback
- SQWRL cohort search
- Patient database integration

**Verification:** Route probe must return `404` for likely Phase 4 paths, not `401`, redirects, stubs, or feature-disabled metadata.

---

## 4. Testing Strategy by Slice

| Slice | Unit | Integration | E2E | Security | Contract |
|-------|------|-------------|-----|----------|----------|
| L0 | — | Schema diff | — | — | Enum reconciliation |
| L1 | Schema validators | Cross-example | — | — | Positive/negative suites |
| L2 | Route handlers | Gateway ↔ mock reasoner | Auth flow | Log leakage, rate limits | API-01 to API-13 |
| L3 | Components | Screen navigation | iOS/Android synthetic | Storage scan, network scan | Screen-to-mockup matrix |
| L4 | Local handlers | Node ↔ reasoner | Local patient search | Egress boundary | API-14 to API-16 |
| L5 | Portal handlers | Portal ↔ node registry | Institution onboarding | Schema audit, route audit | API-20 |
| L6 | RPR validators | Network ↔ DLT | Release activation | Adversarial RPR | API-17 to API-19 |

---

## 5. Regression Controls

Any change touching the Sprint F service must preserve:

1. Ontology SHA-256: `b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1`
2. Confidence pin: `0.6001915864330829`
3. All existing Sprint F tests: 293 passed, 0 failed, 0 errors, 1 skipped
4. Rule guard behaviour (B3, future dates, etc.)
5. Clinical recommendation and subtype semantics
6. Truthful rule firing and provenance
7. Existing web client compatibility

---

## 6. Decision Log (Pre-v1.0)

| ID | Decision | Proposed | Owner | Status |
|----|----------|----------|-------|--------|
| API-OD-01 | Canonical stage enum | Import from Sprint F schema, no aliases | Domain | OPEN |
| API-OD-02 | Optional field representation | Explicit `null` for stable clients | Tech | OPEN |
| API-OD-03 | Paget's disease code | Exact Sprint F enum | Domain | OPEN |
| API-OD-04 | Response-field mapping | Freeze after MOB-S000 comparison | Tech | OPEN |
| API-OD-05 | Local-node identity | Institution OIDC/SAML | Security | OPEN |
| API-OD-06 | RPR minimum batch `k` | Default 10, site-configurable | DPO | OPEN |
| API-OD-07 | RPR legal classification | Counsel determination | Legal | OPEN |
| API-OD-08 | SQWRL runtime availability | Verify in Sprint F executable | Tech | OPEN |
| API-OD-09 | Local patient search schema | Site adapter profile | Tech | OPEN |
| API-OD-10 | Portal-to-node launch | Direct local connection only | Arch | OPEN |

---

## 7. Acceptance Criteria for v1.0

This workflow and the resulting codebase may proceed to v1.0 only after:

1. [ ] Exact MOB-S000 schemas and samples reconciled (L0)
2. [ ] Canonical field mapping has no unresolved clinical ambiguity (L0)
3. [ ] Kraken accepts the three-profile separation (L2–L5)
4. [ ] Clinical/domain reviewer confirms result fields and wording (L3)
5. [ ] Privacy/security review confirms portal and Egress Gate boundaries (L4–L5)
6. [ ] JSON Schema / OpenAPI artefacts pass automated examples and negative tests (L1)
7. [ ] Mobile client attestation fail-closed verified on device (L3)
8. [ ] No clinical payload in any log, trace, cache, or metric (L2)
9. [ ] Route probe confirms no Phase 4/governance/FL/RL surface in mobile (L3)
10. [ ] iOS and Android builds compile and pass synthetic E2E (L3)

**Authorisation boundary:** Acceptance of this workflow authorises contract design and build review only. It does **not** authorise production patient-data access, repository mutation, deployment, public release, or rule activation.

---

## 8. Loop Visual Summary

```
L0 ──Reconcile──▶ L1 ──Freeze──▶ L2 ──Gateway──▶ L3 ──Client──▶ L4 ──Local──▶ L5 ──Portal──▶ L6 ──RPR──▶ v1.0
     │               │              │               │              │              │              │
     ▼               ▼              ▼               ▼              ▼              ▼              ▼
  Field map       Schema        Attestation      9 screens     Patient       No clinical     Signed
  Enum check      Examples      Fail-closed      In-memory     search        proxying        releases
  Contradictions  OpenAPI       Log leakage      No storage    Cohort        Schema audit    RPR batches
                No-patient    Rate limits      No analytics    zero egress   Route audit     DLT anchor
```

---

*End of `/loop` workflow document.*
