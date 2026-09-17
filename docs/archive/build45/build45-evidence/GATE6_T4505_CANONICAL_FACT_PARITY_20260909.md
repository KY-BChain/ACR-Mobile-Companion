# Build 45 — Gate 6 Evidence: Review Screen and Canonical-Fact Parity (closes T45-05)

**Authority:** `ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_1.md` §7 (Gate 6)
**Date:** 9 September 2026
**Result: GATE 6 PASS — T45-05 closed**

---

## G6-01 — Review screen verified against the Gate 3 gateway

`src/screens/ReviewScreen.tsx` assembles the five-screen store
(`store.form`, `store.p1`, `store.p2`) through the single governed
`buildAssessmentRequest(...)` path and submits via `gatewayClient.submit(...)`
with the user's explicit delivery choice. It authors no request fields of its
own and performs no inference. Gates 4–5 already prove that this exact path
transports only the governed 20 fields plus `patientId`.

Submission is gated on `store.accessReady` unless the session is an explicit
walkthrough, so a review cannot be submitted without gateway access.

---

## G6-02 — Website / mobile canonical-fact mapping

**Website comparator:** `acr-test-website/js/acr-api-client.js`,
function `mapToBackendPayload`, read from the canonical platform checkout at the
pinned SHA `33daead3` via the Gate 1 isolated worktree. This is the client used
by the web **ACR Pathway** (`acr_pathway.html`), the comparator named in C45-11.

Both clients POST the same envelope shape to the same backend endpoint:
`{ patientData, bayesianEnhanced, analysisVersion }` → `/api/infer`.

### Shared facts — 15

Sent by both, to the same backend field, with the same meaning:

| # | Fact | # | Fact | # | Fact |
|---|---|---|---|---|---|
| 1 | `patientId` | 6 | `her2Status` | 11 | `stage` |
| 2 | `age` | 7 | `ki67` | 12 | `ecogScore` |
| 3 | `gender` | 8 | `tumorSize` | 13 | `histologicalSubtype` |
| 4 | `erStatus` | 9 | `nodalStatus` | 14 | `ca153` |
| 5 | `prStatus` | 10 | `grade` | 15 | `cea` |

### Mobile-only facts — 5

| Fact | Status |
|---|---|
| `surgeryDate` | Governed schema property; drives the R33 follow-up-cadence rule (observed firing at Gate 1) |
| `pdl1Status` | Governed schema property; surfaces in the platform biomarker map |
| `her2Low` | Governed schema property; mapped `positive→true`, `negative→false`, else `null` |
| `lvef` | Governed schema property; appears in platform reasoning evidence |
| `treatmentIntent` | Governed schema property |

None is mobile-invented: each is a declared property of
`schemas/acr.cds.v1.request.schema.json` and is consumed by the platform's
`PatientData` model. Gate 1's complete-fixture run confirmed these fields
materially change platform output (Tier 1 → Tier 3, additional R17b treatment,
`HER2-low` and `PD-L1` entries in the biomarker map, four extra evidence lines).

**This is a deliberate superset, not a divergence to be closed.** The mobile
assessment collects a richer governed fact set than the current web Pathway.

### Website-only facts — 1

| Fact | Value | Treatment |
|---|---|---|
| `dataProvenance` | `'demo_test'` | **Mobile must never send it** |

`dataProvenance` is one of the twelve identifying/administrative properties the
platform's `PatientData` model can hold. Under **"Data Stays. Rules Travel."**
the mobile client deliberately transports none of them. Gates 4–5 prove this is
enforced at two independent layers: AJV refuses it with
`SCHEMA_INVALID / 400 / NOT_SUBMITTED`, and the allow-list mapper strips it even
if validation is bypassed.

**This divergence is required and approved. It must not be "fixed" by adding
`dataProvenance` to the mobile payload.**

### Controlled evaluation context

The two clients reach the same backend contract by different routes, and the
mobile route is the stricter:

| Aspect | Web ACR Pathway | Mobile Build 45 |
|---|---|---|
| Source of facts | Server patient bundle (`patients.php`) or a flattened form object | Direct clinician entry across five screens |
| Receptor status | Free-text normalisation — English/Chinese/`+`/`-`/percent, with `≥1%` treated as positive | Governed enum `positive`/`negative` at entry |
| HER2 | `3+`→positive, `0`/`1+`→negative, **`2+`/equivocal → `null`** (defers to backend ISH logic) | Governed enum; no equivocal state today (see C45-06) |
| Nodal status | Derived from `clinicalN`, else from a positive-node count | Governed enum `N0`–`N3` at entry |
| Grade | Normalised from mixed representations | Governed enum `1`/`2`/`3` |
| Identifiers | Sends `dataProvenance` | Sends none |
| Evaluation posture | Demonstration data, `dataProvenance: 'demo_test'` | Synthetic / explicitly authorised non-patient only |

Because the website performs lossy normalisation before transport and the mobile
app constrains at entry, an identical *clinical case* can legitimately produce a
different *transported fact set* between the two. Any future web/mobile result
comparison must therefore compare **transported facts**, not source records.

---

## G6-03 — Mapping recorded and mechanically enforced

The mapping above is pinned in `tests/parity/verify.js`, wired into
`verify:mobile`. It asserts:

1. shared + mobile-only exactly accounts for all 20 transported mobile facts;
2. shared + website-only exactly accounts for all 16 website facts;
3. the classifications are mutually exclusive;
4. `dataProvenance` is the sole website-only fact and is never sent by mobile;
5. every mobile-only fact is a governed schema property, so mobile sends nothing
   the contract does not declare;
6. mobile entry is enum-constrained for `erStatus`, `prStatus`, `her2Status`,
   `nodalStatus` and `grade`.

The website source is not in this repository, so `WEBSITE_FACTS` is pinned as a
constant with its provenance recorded. **If the website changes, this verifier
must be re-derived against it — failing loudly is the intended behaviour.**

---

## Finding carried forward — declared `analysisVersion` diverges

| Client | Declared `analysisVersion` |
|---|---|
| Web ACR Pathway | `2.1.2` |
| Mobile Build 45 gateway | `2.2` |
| Platform `InferenceRequestDTO` default | `2.0` |

Three different values reach the same endpoint. The platform **stores but never
reads** the field — `InferenceRequestDTO` exposes only a getter and setter, and
no main-source logic branches on it — so this is **inert today and changes no
clinical output**. It is nonetheless an undocumented labelling inconsistency
between the two clients.

Pinned by the verifier so it cannot drift further unnoticed. Recommended for
**C45-11** (web-to-mobile presentation authority), which is where the governing
decision on client/version labelling belongs. No code change made, because
choosing the correct value is not this session's decision.

---

## PASS criteria

| Criterion | Status |
|---|---|
| Mapping complete and internally consistent with the 20 governed fields | **MET** — 15 shared + 5 mobile-only = 20, exhaustive and mutually exclusive, mechanically asserted |
| No undocumented fact divergence between website and mobile | **MET** — every divergence enumerated: 5 mobile-only (governed superset), 1 website-only (`dataProvenance`, deliberately excluded), plus the `analysisVersion` labelling difference recorded above |

**T45-05 closed.**

---

**END OF GATE 6 EVIDENCE**
