# ACR Mobile Companion v0.6.5 Build 45 — Full Implementation Plan

**Document Version:** 1.0  
**Prepared:** 2 September 2026  
**Predecessor:** ACR Mobile v0.6.0 Build 44 (ab8140d2b54ed32a0fe2896ea39f50b88970f9c5)  
**Branch:** `feature/mobile-v0.6.5-build45` (to be created from Build 44)  
**Repository:** `github.com/KY-BChain/acr-mobile-companion`  
**Local Working Directory:** `~/DAPP/acr-mobile-companion/`  
**Target:** iOS (iPhone 13, iPhone X, iPhone 8+, iPad), Android (multiple physical devices), Apple Watch (post-mobile)  
**Governance Principle:** *Data Stays. Rules Travel.*

---

## Executive Summary

This plan transforms the Build 44 evaluation codebase into Build 45 — a technically hardened, clinically reviewed, and multi-device-validated release. Build 45 resolves all deferred Phase G items, implements the 12 technical safety workstreams (T45-01 to T45-12), prepares the 11 clinical decision points (C45-01 to C45-11) for partner adjudication, establishes secure remote-review capability, and validates across the full device matrix.

**Critical Constraint:** Build 45 remains an evaluation build. No real-patient data. No public distribution without separate clinical validation and release approval.

---

## Part 1 — Repository and Branch Strategy

### 1.1 Git Setup and Branching

| Step | Action | Command / Procedure | Evidence Required |
|------|--------|---------------------|-------------------|
| 1.1.1 | Verify local Build 44 state | `cd ~/DAPP/acr-mobile-companion && git status` | Clean working tree, no uncommitted changes |
| 1.1.2 | Verify remote sync | `git log --oneline -5` | HEAD at ab8140d2, matches origin |
| 1.1.3 | Create Build 45 feature branch | `git checkout -b feature/mobile-v0.6.5-build45` | Branch created from Build 44 HEAD |
| 1.1.4 | Push branch to GitHub | `git push -u origin feature/mobile-v0.6.5-build45` | Branch visible on github.com/KY-BChain/acr-mobile-companion |
| 1.1.5 | Tag Build 44 baseline | `git tag -a build44-baseline -m "Build 44 baseline for Build 45 development"` | Annotated tag pushed to origin |
| 1.1.6 | Configure GitHub Desktop | Open GitHub Desktop, confirm `feature/mobile-v0.6.5-build45` is active | Screenshot of active branch |
| 1.1.7 | Create GitHub Project "ACR Mobile" | github.com → Projects → New → Link to repository | Project board created, Build 45 milestone created |
| 1.1.8 | Link Issues to Project | Create GitHub Issues for each T45-XX and C45-XX item | All 23 items tracked in Project board |

### 1.2 Repository Structure Verification

```
~/DAPP/acr-mobile-companion/
├── src/                    # Shared React Native/TypeScript source
├── ios/                    # iOS native project
├── android/                # Android native project
├── gateway/                # Mock/same-backend gateway
├── schemas/                # API schemas
├── e2e/                    # End-to-end tests
├── docs/loop/              # Loop documentation
│   ├── ACR_MOBILE_CDS_PARITY_EXECUTION_EVIDENCE_v1.6.md
│   ├── ACR_MOBILE_CDS_PARITY_AUTONOMOUS_CODEX_LOOP_v1.6.md
│   ├── ACR_MOBILE_BUILD45_TECHNICAL_CLINICAL_REVIEW_BACKLOG_v0.1.md
│   ├── ACR_MOBILE_FUNCTIONAL_FLOW_FOR_CLINICAL_REVIEW_v0.1.md
│   ├── ACR_PLATFORM_AND_MOBILE_GATEWAY_MANUAL_OPERATIONS_01SEPT26.md
│   └── ACR_MOBILE_BACKEND_REASONER_FLOW_REAFFIRMATION_v0.1.md
├── .acr-loop/              # Loop evidence and review artifacts
└── package.json            # Dependencies and scripts
```

---

## Part 2 — Technical Safety Work Implementation (T45-01 to T45-12)

### 2.1 T45-01 — Isolated Openllet/SWRL vs Java Fallback Parity Test Facility

**Objective:** Execute identical synthetic fixtures through both reasoning paths in an isolated environment and enumerate all differences.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-01a | Create isolated test facility (`/test-facility/isolated-reasoner/`) separate from production runtime | Dev | Directory structure, no production dependency imports |
| T45-01b | Import exact Build 44 Openllet/SWRL source and Java fallback source into facility | Dev | Source checksums match production |
| T45-01c | Define synthetic fixture set: minimum 50 cases covering all 20 fields, boundary values, missing data, all subtypes | Dev | Fixture catalog with field coverage matrix |
| T45-01d | Execute each fixture through Openllet/SWRL path, capture: subtype, risk, treatments, biomarkers, firedRules, explanations, completeness, Bayes ON/OFF | Dev | Raw output logs |
| T45-01e | Execute identical fixtures through Java fallback path, capture same fields | Dev | Raw output logs |
| T45-01f | Automated diff engine: compare every field, flag any divergence | Dev | Diff report with severity classification |
| T45-01g | Clinical review of divergences: classify as acceptable variance, bug, or specification gap | Clinical Lead | Signed adjudication document |
| T45-01h | Fix or document each divergence; re-run until diff report is empty or all items documented | Dev | Final diff report, commit hash |

**Completion Criteria:** Independent repeated comparison shows zero unexplained differences.

---

### 2.2 T45-02 — Forced BayesianEnhancer Exception Path Testing

**Objective:** Prove platform failure representation and gateway fail-closed handling when `BayesianEnhancer` throws.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-02a | In isolated test facility, create instrumented `BayesianEnhancer` that throws controlled exceptions | Dev | Instrumented source code |
| T45-02b | Trigger exception at each stage: initialization, prior calculation, posterior update, bounds computation | Dev | Stage-by-stage test logs |
| T45-02c | Verify platform returns structured error response, no partial clinical output | Dev | Response captures |
| T45-02d | Verify gateway detects degraded/partial Bayes response and fails closed | Dev | Gateway logs showing rejection |
| T45-02e | Verify mobile app displays appropriate unavailable state, never shows invented clinical data | Dev | Mobile screenshots per exception type |
| T45-02f | Document all exception paths and expected mobile behaviour | Dev | Exception path matrix document |

**Completion Criteria:** Every exception path tested; no partial or invented clinical output observed.

---

### 2.3 T45-03 — Remove Clinical Data from Operational INFO Logs

**Objective:** Ensure no submitted facts, derived values, or identifiers appear in INFO/WARN/ERROR logs.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-03a | Audit all log statements in: `InferenceController`, `ReasonerService`, `BayesianEnhancer`, `ACRSWRLAuditLogger`, `ClinicalOutputAssembler` | Dev | Source audit report with line numbers |
| T45-03b | Remove or redact from INFO/WARN/ERROR: patient/correlation identifiers, all 20 submitted fields, derived subtype, risk, recommendation, rule IDs, Bayes confidence, result bodies | Dev | Diff showing removed log statements |
| T45-03c | Retain only approved redacted metadata: timestamp, request ID hash, processing duration, error category (no detail), build version | Dev | Approved metadata whitelist |
| T45-03d | Add log-level guards: clinical data may only appear at DEBUG/TRACE and only in non-production builds | Dev | Log configuration diff |
| T45-03e | Implement log scanning CI check: fail build if clinical patterns detected in INFO/WARN/ERROR | Dev | CI pipeline config, test failure evidence |
| T45-03f | Run full synthetic fixture set and scan all logs | Dev | Clean scan report |
| T45-03g | Test exception paths: verify no clinical data leaks in error logs | Dev | Exception log scan report |
| T45-03h | Independent source/runtime/log-capture review | Reviewer | Signed review document |

**Completion Criteria:** Sentinel identifiers, all 20 submitted clinical/processing inputs, derived values absent from INFO/WARN/ERROR across platform, gateway, and mobile.

---

### 2.4 T45-04 — Define `firedRules[]` Ordering Contract

**Objective:** Resolve non-deterministic rule ordering in Bayes-OFF executions.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-04a | Document current behaviour: identical executions return same rules in different order | Dev | Evidence from T45-01 logs |
| T45-04b | Consult clinical team: is rule order clinically meaningful? | Clinical Lead | Decision record |
| T45-04c | If order is meaningful: implement deterministic sorting (e.g., by rule ID, priority, or semantic category) | Dev | Sort implementation, before/after comparison |
| T45-04d | If order is not meaningful: document contract explicitly, add test verifying set-equality regardless of order | Dev | Contract document, passing test |
| T45-04e | Update API schema to include ordering contract | Dev | Schema diff |
| T45-04f | Verify mobile handles both deterministic and documented non-deterministic ordering | Dev | Mobile test evidence |

**Completion Criteria:** Platform contract documented; mobile behaviour correct under contract.

---

### 2.5 T45-05 — Website/Mobile Canonical-Fact Parity Design

**Objective:** Define authoritative mapping between website and mobile input fields.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-05a | Catalog all website controls (15 fields) | Dev | Website field inventory |
| T45-05b | Catalog all mobile fields (20 fields) | Dev | Mobile field inventory |
| T45-05c | Identify shared fields, mobile-only fields, website-only fields | Dev | Three-way mapping matrix |
| T45-05d | For mobile-only fields: document clinical rationale and backend consumer | Clinical Lead | Rationale document |
| T45-05e | For website-only fields: document why absent from mobile and migration path | Dev | Gap analysis document |
| T45-05f | Define controlled evaluation context: which fields are required for parity testing | Dev | Evaluation context specification |
| T45-05g | Update mobile schema to reflect canonical fact set | Dev | Schema update |
| T45-05h | Update gateway validation to enforce canonical fact boundaries | Dev | Gateway validation diff |

**Completion Criteria:** Approved mapping document identifying shared, mobile-only, and website-only facts with controlled evaluation context.

---

### 2.6 T45-06 — Full Phase G and Build 44 Regression on Build 45 Snapshot

**Objective:** Re-run all automated tests on frozen Build 45 codebase.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-06a | Freeze Build 45 snapshot at feature-complete milestone | Dev | Git tag `build45-feature-complete` |
| T45-06b | Run 157/157 gateway tests | Dev | Test report with pass/fail |
| T45-06c | Run 79/79 targeted platform tests | Dev | Test report with pass/fail |
| T45-06d | Re-run Bayes ON/OFF direct-to-gateway parity | Dev | Parity report |
| T45-06e | Re-run fixture capture/review/promotion/revalidation | Dev | Fixture lifecycle evidence |
| T45-06f | Re-run exact replay tests | Dev | Replay accuracy report |
| T45-06g | Re-run edited/unknown refusal tests | Dev | Refusal evidence |
| T45-06h | Re-run failure separation tests | Dev | Failure handling evidence |
| T45-06i | Independent review: verify no failed check relabelled as pending | Reviewer | Signed G-COMPLETE review |

**Completion Criteria:** `G_COMPLETE=true` only after every mandatory family passes. No exceptions.

---

### 2.7 T45-07 — Resolve TypeScript Legacy Diagnostics

**Objective:** Clean 250 reviewed inactive/archived diagnostics.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-07a | Generate full repository typecheck report | Dev | Typecheck output |
| T45-07b | Classify each diagnostic: delete, migrate, archive, or document exclusion | Dev | Classification spreadsheet |
| T45-07c | For "delete": remove dead code with commit | Dev | Commits with rationale |
| T45-07d | For "migrate": move to active source with proper typing | Dev | Migration commits |
| T45-07e | For "archive": move to `/archive/` with README | Dev | Archive directory |
| T45-07f | For "document exclusion": add to `tsconfig.json` exclude with justification comment | Dev | tsconfig diff |
| T45-07g | Verify `strict` mode not weakened | Dev | tsconfig strict flags unchanged |
| T45-07h | Full typecheck passes clean | Dev | Clean typecheck output |

**Completion Criteria:** Active graph clean; full repository typecheck passes; strictness maintained.

---

### 2.8 T45-08 — Per-Invitee Access Administration

**Objective:** Replace single owner-supplied invite code with multi-invitee governance.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-08a | Design invite system: named issuer, unique code policy, expiry, revocation | Dev/Security | Design document |
| T45-08b | Implement invite code generation: cryptographically random, slow hash (Argon2id or PBKDF2), not unsalted SHA-256 | Dev | Implementation with algorithm choice rationale |
| T45-08c | Implement invite redemption: one-time or limited-use, device/build binding | Dev | Redemption flow |
| T45-08d | Implement expiry: configurable TTL (default 7 days for evaluators) | Dev | Expiry logic |
| T45-08e | Implement revocation: admin endpoint to invalidate specific codes | Dev | Revocation API |
| T45-08f | Implement audit: minimal non-clinical metadata (code hash, redemption timestamp, device fingerprint hash, NOT clinical data) | Dev | Audit schema |
| T45-08g | Lost-code procedure: re-issue requires owner approval, old code invalidated | Dev | Procedure document |
| T45-08h | No plaintext invite storage: store only slow hash | Dev | Database schema review |
| T45-08i | Mobile: update invite entry screen to support new code format | Dev | UI update |
| T45-08j | Gateway: update authentication to validate against new invite store | Dev | Gateway auth diff |
| T45-08k | Test: generate 10 codes, redeem 5, revoke 2, let 3 expire, verify behaviour | Dev | Test evidence |

**Completion Criteria:** Named issuer/controller, unique codes, expiry, revocation, audit, lost-code procedure operational; no plaintext storage.

---

### 2.9 T45-09 — Governed Patient-Facing Bayesian Percentage Presentation

**Objective:** Display Bayes confidence only when valid, with approved presentation.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-09a | Define display conditions: only from valid backend Bayes-enabled response, value in [0,1] | Clinical Lead | Display conditions spec |
| T45-09b | Define conversion: 0–1 to percentage, rounding rules (e.g., round to nearest integer, floor, or ceiling) | Clinical Lead | Conversion spec |
| T45-09c | Define label: "Confidence", "Probability", "Bayesian Support" — approved terminology | Clinical Lead | Label approval |
| T45-09d | Define placement: within clinical-first result, after deterministic result, with separator | UX | Placement mockup |
| T45-09e | Define accessibility: VoiceOver/TalkBack reads percentage with context | Dev | Accessibility test |
| T45-09f | Define OFF/unavailable states: when Bayes disabled, failed, or absent | Clinical Lead | State definitions |
| T45-09g | Implement: never describe SWRL rule firing as probabilistic | Dev | UI text review |
| T45-09h | Implement: percentage displayed only when `bayesianConfidence` field present and valid | Dev | Implementation |
| T45-09i | Test with Bayes ON (valid), Bayes ON (invalid), Bayes OFF, backend unavailable | Dev | Screenshot matrix |
| T45-09j | Clinical review: verify no overstatement of certainty | Clinical Lead | Signed review |

**Completion Criteria:** Percentage appears only from valid backend Bayes response; approved label, conversion, placement, accessibility; explicit OFF/unavailable states; no probabilistic SWRL description.

---

### 2.10 T45-10 — Separate Gateway Reachability from Live-Platform Availability

**Objective:** Eliminate contradictory connection states in UI.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-10a | Define connection states: `Gateway Connected — Live Platform Online`, `Gateway Connected — Live Platform Offline`, `Gateway Unreachable`, `No Network` | UX | State definitions |
| T45-10b | Implement gateway health check: ping `/gateway/health` independently of platform | Dev | Health endpoint implementation |
| T45-10c | Implement platform health check: ping `/api/health` or infer from `/api/infer` readiness | Dev | Platform health check |
| T45-10d | Update Welcome screen: show dual-state indicator, not single "connected" | Dev | UI implementation |
| T45-10e | Update mode selection: when platform offline, disable "Live" mode, enable "Explicit Verified Synthetic" | Dev | Mode logic update |
| T45-10f | Add explanation text: "Gateway is reachable but Live Platform is offline. You can still use verified synthetic demonstration." | UX | Text copy |
| T45-10g | Ensure no implication that phone performs local clinical inference | Dev | UI text review |
| T45-10h | Test: Wi-Fi on, gateway running, Spring Boot stopped → verify correct state | Dev | Test evidence |
| T45-10i | Test: Wi-Fi off → verify "No Network" | Dev | Test evidence |
| T45-10j | Test: gateway stopped → verify "Gateway Unreachable" | Dev | Test evidence |

**Completion Criteria:** Distinct states displayed; live submission remains fail-closed; explicit synthetic replay available; no local inference implication.

---

### 2.11 T45-11 — Secure Remote-Review Gateway and Endpoint Mobility

**Objective:** Enable small named reviewer group access without RFC1918 assumptions.

#### Phase A — Design (No implementation without explicit owner authority)

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-11a | Complete T45-08 first (prerequisite) | Dev | T45-08 completion evidence |
| T45-11b | Design architecture document: current-Mac interim vs VPS migration path | Security | Architecture document |
| T45-11c | Define tunnel: outbound authenticated tunnel to dedicated HTTPS mobile-gateway hostname | Security | Tunnel specification |
| T45-11d | Define gateway origin: bind to loopback or narrowly controlled local interface | Security | Binding specification |
| T45-11e | Define TLS: modern TLS 1.3, certificate rotation, no brittle pinning without backup | Security | TLS specification |
| T45-11f | Define endpoint: single approved `https://` gateway, no cleartext, no endpoint editor, no platform bypass | Security | Endpoint policy |
| T45-11g | Define no automatic Live-to-Demo fallback | Security | Fallback policy |
| T45-11h | Define request-size limits, strict JSON/schema validation, build/device binding | Security | Validation spec |
| T45-11i | Define refresh rotation, reuse revocation, rate limiting | Security | Token policy |
| T45-11j | Define secrets management: server secrets outside Git, app bundles, documents, command history | Security | Secrets policy |
| T45-11k | Define restart recovery: no silent acceptance of old/unknown sessions | Security | Recovery procedure |
| T45-11l | Define availability modes: Live (Mac+Spring+platform tunnel+gateway+tunnel), Synthetic (Mac+gateway+tunnel) | Security | Availability matrix |
| T45-11m | Regional assessment: EU/EEA, UK, Ireland, Japan, HKSAR, China connectivity and constraints | Security | Regional assessment |
| T45-11n | Threat model: TLS, auth, rate limits, replay, revocation, logs, backend outage, tunnel outage, DNS/cert rotation, Mac restart, travel/network change | Security | Threat model document |
| T45-11o | Independent security review before external distribution | Security | Signed review |

#### Phase B — Implementation (Requires explicit owner authority after Phase A approval)

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-11p | Implement tunnel client on Mac | Dev | Tunnel client config |
| T45-11q | Implement mobile-gateway HTTPS termination | Dev | Gateway config |
| T45-11r | Rebuild iOS with approved endpoint | Dev | Build artifact |
| T45-11s | Rebuild Android with approved endpoint | Dev | Build artifact |
| T45-11t | Implement certificate rotation handling | Dev | Rotation test |
| T45-11u | Implement rollback handling | Dev | Rollback procedure |
| T45-11v | Multi-invite tests with T45-08 system | Dev | Test evidence |
| T45-11w | Regional reachability tests | Dev | Test results |
| T45-11x | Clean privacy/log scans | Dev | Scan reports |
| T45-11y | Failure-mode tests: backend outage, tunnel outage, cert rotation, restart | Dev | Test evidence |
| T45-11z | Controlled distribution approval | Owner | Signed approval |

**Completion Criteria:** Approved architecture, security review, exact endpoint/certificate posture, multi-invite tests, regional results, clean scans, failure tests, rebuilt apps, controlled distribution approval.

---

### 2.12 T45-12 — Mirror Web ACR Pathway Clinical-Result Design

**Objective:** Achieve web-to-mobile clinical presentation parity from identical backend responses.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-12a | Catalog web Pathway elements: subtype badges, risk, warnings, treatment/recommendation cards, reasoning, confidence/Bayes, source details | Dev | Web element inventory |
| T45-12b | Catalog current mobile result elements | Dev | Mobile element inventory |
| T45-12c | Define parity matrix: which web elements map to mobile, which are web-only | Clinical Lead | Parity matrix |
| T45-12d | Implement subtype presentation: identical wording and hierarchy | Dev | Implementation |
| T45-12e | Implement risk grade: HIGH (governed red), INTERMEDIATE (amber/orange), LOW (green), unknown/incomplete (neutral) — only after C45-03/C45-04 approval | Dev | Implementation with colour tokens |
| T45-12f | Ensure every colour has text/icon/non-colour cues | Dev | Accessibility test |
| T45-12g | Ensure accessible contrast ratios (WCAG AA minimum) | Dev | Contrast test report |
| T45-12h | Implement completeness indicator | Dev | Implementation |
| T45-12i | Implement missing-data warning | Dev | Implementation |
| T45-12j | Implement recommendations hierarchy matching web | Dev | Implementation |
| T45-12k | Implement supporting reasoning display | Dev | Implementation |
| T45-12l | Implement provenance: reasoning mode, backend version, timestamp | Dev | Implementation |
| T45-12m | Implement actual backend Bayes percentage/bounds (under C45-08) | Dev | Implementation |
| T45-12n | Technical trace remains optional and collapsible | Dev | Implementation |
| T45-12o | Eight-language support verified | Dev | Localization test |
| T45-12p | RTL (Arabic) support verified | Dev | RTL test |
| T45-12q | Screen-reader support verified | Dev | VoiceOver/TalkBack test |
| T45-12r | Dynamic Type/font scaling verified | Dev | Font scaling test |
| T45-12s | Layout tests: S8, iPhone 13, folded/unfolded | Dev | Screenshot matrix |
| T45-12t | Parity test: identical backend response renders equivalent clinical meaning on web and mobile | Dev | Side-by-side comparison |

**Completion Criteria:** From one validated backend response, web and mobile show same authoritative clinical meaning and section hierarchy; all accessibility requirements met; parity-tested.

---

## Part 3 — Clinical Decision Points (C45-01 to C45-11)

### 3.1 Clinical Question Resolution Procedure

For each C45-XX item:
1. Present current Build 44 behaviour to clinical partners (ZZU/UCD)
2. Document partner decision
3. Update mobile UI, backend contract, or both
4. Verify implementation matches decision
5. Clinical sign-off

### 3.2 C45-01 — Tumour Size Unit

| Aspect | Detail |
|--------|--------|
| **Question** | What is the governed tumour-size unit? |
| **Current Behaviour** | Mobile transports positive number unchanged; backend uses `>20` threshold; no conversion |
| **Decision Needed** | Confirm unit (mm? cm?), UI label, allowed precision/range, conversion policy |
| **Implementation** | Update field label, add unit suffix, add validation range, document no-conversion policy |
| **Evidence** | Updated UI screenshots, validation tests |

### 3.3 C45-02 — Tumour Size and Stage Optionality

| Aspect | Detail |
|--------|--------|
| **Question** | Are tumour size and stage optional for entry, inference, or both? |
| **Current Behaviour** | UI treats as optional; omitted facts lower completeness |
| **Decision Needed** | Define minimum dataset, incomplete-case result policy, user-facing explanation |
| **Implementation** | Update field required/optional states, update completeness calculation, add explanation text |
| **Evidence** | Field state matrix, completeness test |

### 3.4 C45-03 — Authoritative Risk Grade Source

| Aspect | Detail |
|--------|--------|
| **Question** | Which backend field is the authoritative patient-facing risk grade? |
| **Current Behaviour** | Top-level risk can be absent; Build 44 displays `—` rather than inventing |
| **Decision Needed** | Define risk source, allowed labels, relationship to deterministic risk, incomplete cases |
| **Implementation** | Map to authoritative field, handle absent case, update display logic |
| **Evidence** | Backend field mapping, absent-case handling tests |

### 3.5 C45-04 — Risk Colour Governance

| Aspect | Detail |
|--------|--------|
| **Question** | How should risk colour be governed? |
| **Current Behaviour** | No colour inferred when no authoritative grade exists |
| **Decision Needed** | Approve grade-to-colour mapping, accessibility contrast, non-colour cues, unknown/incomplete handling |
| **Implementation** | Implement colour tokens, ensure text/icon alternatives, test contrast |
| **Evidence** | Colour token spec, contrast test report, accessibility audit |

### 3.6 C45-05 — Tumour Stage Linkage

| Aspect | Detail |
|--------|--------|
| **Question** | How should tumour stage be linked to tumour size and nodal facts? |
| **Current Behaviour** | Stage and nodal status are separate optional inputs; no mobile derivation |
| **Decision Needed** | UI guidance, validation, or links without calculating stage |
| **Implementation** | Add contextual help text, cross-field validation, or info links |
| **Evidence** | UI review, validation logic tests |

### 3.7 C45-06 — HER2-Low Mapping

| Aspect | Detail |
|--------|--------|
| **Question** | Is the HER2-low mapping clinically adequate? |
| **Current Behaviour** | Positive→true, negative→false, blank/unknown→null; blank/unknown collapse is lossy |
| **Decision Needed** | Define distinct not-tested/unknown/indeterminate states and backend contract |
| **Implementation** | Expand state enum, update backend consumer, update mobile UI options |
| **Evidence** | State mapping document, backend contract update |

### 3.8 C45-07 — Fields with No Active Consumer

| Aspect | Detail |
|--------|--------|
| **Question** | What should be shown for fields with no active consumer? |
| **Current Behaviour** | Gender has no active CDS consumer; some values have no clinical-output consumer |
| **Decision Needed** | Retain for future use, disclose non-influence, or remove |
| **Implementation** | Add info disclosure, remove field, or mark as "future use" |
| **Evidence** | UI decision, field inventory update |

### 3.9 C45-08 — Bayesian Output Description

| Aspect | Detail |
|--------|--------|
| **Question** | How should Bayesian output and its patient-facing percentage be described? |
| **Current Behaviour** | Backend can return confidence/posterior/bounds; Build 44 did not show expected `xx%`; calibration not established |
| **Decision Needed** | Approve terminology, conversion/rounding, explanation, visibility/default, OFF/unavailable behaviour, limits |
| **Implementation** | Implement under T45-09; update help text; add disclaimer |
| **Evidence** | Clinical sign-off on terminology, implemented UI tests |

### 3.10 C45-09 — Patient-Facing Result Hierarchy

| Aspect | Detail |
|--------|--------|
| **Question** | What is the appropriate patient-facing result hierarchy? |
| **Current Behaviour** | Build 44 shows clinical-first summary and optional technical detail |
| **Decision Needed** | Review subtype wording, warnings, recommendations, supporting rules, provenance, escalation language against website |
| **Implementation** | Reorder/rewrite result sections per approved hierarchy |
| **Evidence** | Side-by-side web/mobile comparison, clinical review |

### 3.11 C45-10 — Recommendation Intent

| Aspect | Detail |
|--------|--------|
| **Question** | Are recommendations informational, decision support, or trial-only observations? |
| **Current Behaviour** | Results from ontology/SWRL/custom rules and optional Bayes |
| **Decision Needed** | Define intended use, accountable clinician role, contraindication checks, mandatory disclaimer/stop conditions |
| **Implementation** | Add disclaimer screens, stop conditions, clarify recommendation intent |
| **Evidence** | Disclaimer text approval, stop-condition tests |

### 3.12 C45-11 — Web-to-Mobile Presentation Authority

| Aspect | Detail |
|--------|--------|
| **Question** | Which web result elements and visual semantics are clinically authoritative for mobile parity? |
| **Current Behaviour** | Web has richer presentation; some web behaviour is frontend-specific |
| **Decision Needed** | Approve web-to-mobile presentation matrix, exact labels/order, authoritative backend fields, risk colours, missing states, recommendation hierarchy, Bayes wording, optional technical elements |
| **Implementation** | Implement under T45-12; prohibit copying web-only fallback inference |
| **Evidence** | Approved presentation matrix, parity test results |

---

## Part 4 — Multi-Device Testing Matrix

### 4.1 iOS Devices

| Device | OS Version | Screen Size | Test Focus | Priority |
|--------|-----------|-------------|------------|----------|
| iPhone 17 Pro (simulator) | iOS 26.3 | 6.3" | Baseline, all features | P0 (baseline) |
| iPhone 13 (physical) | Latest supported | 6.1" | Primary physical validation | P0 |
| iPhone X | iOS 16.x | 5.8" | Notch layout, older OS | P1 |
| iPhone 8 Plus | iOS 16.x | 5.5" | Large form factor, home button | P1 |
| iPad (physical) | Latest supported | 10.2"+ | Tablet layout, split view | P1 |
| iPad Mini | Latest supported | 8.3" | Compact tablet | P2 |

### 4.2 Android Devices

| Device | OS Version | Screen Size | Test Focus | Priority |
|--------|-----------|-------------|------------|----------|
| Samsung Galaxy S23/S24 (physical) | Android 14 | 6.1-6.2" | Primary Android validation | P0 |
| Samsung Galaxy S8 (physical) | Android 9 | 5.8" | Older OS, smaller screen | P1 |
| Google Pixel 7/8 (physical) | Android 14 | 6.3" | Stock Android reference | P1 |
| Samsung Galaxy Z Fold (physical) | Android 14 | Folded/unfolded | Foldable layout | P1 |
| Samsung Galaxy Z Flip (physical) | Android 14 | Folded/unfolded | Flip layout | P2 |
| Various physical phones (user selected) | Various | Various | Real-world diversity | P1 |

### 4.3 Test Scenarios Per Device

1. **Installation:** Clean install, update from Build 44, reinstall
2. **Onboarding:** Poster, Welcome, invite entry, mode selection
3. **Input Flow:** All 5 screens, field validation, keyboard handling, scroll behaviour
4. **Review Screen:** Data accuracy, edit navigation, submit
5. **Results:** Clinical-first view, technical detail, Bayes display (if applicable)
6. **Languages:** All 8 languages, Arabic RTL/LTR switching
7. **Accessibility:** VoiceOver (iOS), TalkBack (Android), Dynamic Type, font scaling
8. **Connection States:** Gateway connected/platform online, gateway connected/platform offline, gateway unreachable, no network
9. **Modes:** Live, explicit synthetic, unavailable
10. **Background/Resume:** App backgrounding, resuming, memory pressure
11. **Rotation:** Portrait, landscape (where supported)
12. **Dark Mode:** iOS dark mode, Android dark theme

---

## Part 5 — Back-Office API Integration (ACR-API Document)

### 5.1 API Endpoints

| Endpoint | Method | Purpose | Build 45 Changes |
|----------|--------|---------|------------------|
| `/api/infer` | POST | Primary inference request | No structural change; ensure T45-03 log privacy |
| `/api/health` | GET | Platform health check | New endpoint for T45-10 |
| `/gateway/health` | GET | Gateway health check | New endpoint for T45-10 |
| `/gateway/auth/invite` | POST | Invite code validation | Updated for T45-08 |
| `/gateway/auth/refresh` | POST | Token refresh | Updated for T45-08 |
| `/gateway/auth/revoke` | POST | Token revocation | New for T45-08 |

### 5.2 Data Contract

```typescript
// Request (20 fields)
interface ACRAssessmentRequest {
  // Clinical facts only — no identifiers
  age: number;
  gender: 'male' | 'female' | 'other' | null;
  tumourSize: number | null;        // C45-01: unit to be confirmed
  tumourStage: string | null;       // C45-02: optional?
  nodalStatus: string | null;       // C45-05: linked to stage?
  erStatus: 'positive' | 'negative' | 'unknown' | null;
  prStatus: 'positive' | 'negative' | 'unknown' | null;
  her2Status: 'positive' | 'negative' | 'low' | 'unknown' | null;  // C45-06
  ki67: number | null;
  grade: string | null;
  // ... remaining 10 fields per T45-05 canonical fact set
}

// Response
interface ACRAssessmentResponse {
  deliveryLabel: 'LIVE_REASONER' | 'PLATFORM_FALLBACK' | 'LOCAL_SYNTHETIC_DEMO' | 'NOT_EXECUTED';
  subtype: string | null;
  risk: 'HIGH' | 'INTERMEDIATE' | 'LOW' | null;  // C45-03
  riskColour: 'red' | 'amber' | 'green' | 'neutral' | null;  // C45-04
  recommendations: string[];
  warnings: string[];
  completeness: number;  // 0.0 to 1.0
  missingDataWarning: string | null;
  firedRules: string[];  // T45-04: ordering contract
  reasoningMode: 'SWRL' | 'SWRL+BAYES' | 'FALLBACK';
  bayesianConfidence: number | null;  // T45-09: only if valid
  bayesianBounds: [number, number] | null;  // C45-08
  provenance: {
    backendVersion: string;
    timestamp: string;
    ontologyVersion: string;
  };
}
```

### 5.3 Integration Test Plan

| Test | Description | Evidence |
|------|-------------|----------|
| INT-01 | Valid request returns 200 with complete response | Response capture |
| INT-02 | Invalid field types rejected with 400 | Error response capture |
| INT-03 | Missing required fields handled per C45-02 | Response capture |
| INT-04 | Backend timeout → gateway fail-closed | Timeout test evidence |
| INT-05 | Backend 500 → gateway fail-closed | Error test evidence |
| INT-06 | Bayes ON response includes confidence | Response capture |
| INT-07 | Bayes OFF response excludes confidence | Response capture |
| INT-08 | Large request rejected (size limit) | Rejection evidence |
| INT-09 | Invalid JSON rejected | Rejection evidence |
| INT-10 | Schema validation rejects unknown fields | Rejection evidence |

---

## Part 6 — Apple Watch (iWatch) Extension

### 6.1 Scope Definition

The Apple Watch extension is **post-mobile** priority. It will be planned after Build 45 mobile is feature-complete and tested.

| Aspect | Detail |
|--------|--------|
| **Target Device** | Apple Watch Series 8+, Watch Ultra |
| **Target OS** | watchOS 10+ |
| **Primary Use Case** | Quick result viewing, notification alerts, complication updates |
| **Data Principle** | *Data Stays. Rules Travel.* — Watch receives only result summary, never full clinical facts |
| **Integration** | WatchConnectivity framework to paired iPhone; iPhone performs gateway calls |

### 6.2 Preliminary Feature Set

1. **Complication:** Show last assessment result summary (subtype + risk level)
2. **Notification:** Alert when assessment complete (if initiated from phone)
3. **Quick View:** Scrollable result summary with key recommendations
4. **Siri Shortcut:** "Show my last ACR assessment" (voice-activated)

### 6.3 Implementation Phases (Post-Build 45)

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| Watch Phase 1 | Build 45 + 2 weeks | Complication, basic notification |
| Watch Phase 2 | Build 45 + 4 weeks | Quick View UI, result history |
| Watch Phase 3 | Build 45 + 6 weeks | Siri Shortcut, health app integration research |

---

## Part 7 — GitHub Integration and AI Agent Loop Setup

### 7.1 GitHub Repository Configuration

| Step | Action | Evidence |
|------|--------|----------|
| 7.1.1 | Verify repository: `github.com/KY-BChain/acr-mobile-companion` | Repository accessible |
| 7.1.2 | Configure branch protection for `main`: require PR review, status checks | Branch protection rules |
| 7.1.3 | Configure branch protection for `feature/*`: require PR review | Branch protection rules |
| 7.1.4 | Set up GitHub Actions CI: typecheck, lint, unit tests, log scan | `.github/workflows/ci.yml` |
| 7.1.5 | Set up GitHub Actions CD: build iOS, build Android (manual trigger) | `.github/workflows/build.yml` |
| 7.1.6 | Link GitHub Project "ACR Mobile" to repository | Project board active |
| 7.1.7 | Configure issue templates: Bug Report, Feature Request, Clinical Question | Issue templates |
| 7.1.8 | Configure PR template with checklist | PR template |

### 7.2 GitHub Desktop Workflow

```bash
# Daily workflow
1. Open GitHub Desktop
2. Fetch origin to check for remote changes
3. Pull latest `feature/mobile-v0.6.5-build45`
4. Make changes in local working directory
5. Commit with descriptive message referencing T45-XX or C45-XX
6. Push to origin
7. Create Pull Request when feature complete
8. Merge after review and CI pass
```

### 7.3 AI Agent Loop Configuration

The "ACR Mobile" GitHub Project will run autonomously via AI agents. Configuration:

| Component | Purpose | Setup |
|-----------|---------|-------|
| **Loop Trigger** | Monitor repository for new issues/PRs | GitHub webhook → AI agent endpoint |
| **Code Review Agent** | Automated PR review: typecheck, lint, test pass, security scan | GitHub Action + AI service |
| **Clinical Review Agent** | Flag issues requiring clinical input (C45-XX labels) | Label-based routing |
| **Test Agent** | Run automated tests on PR, report results | GitHub Action |
| **Documentation Agent** | Update docs when code changes | GitHub Action + doc generation |
| **Release Agent** | Prepare release notes, tag versions | Manual trigger + AI generation |

### 7.4 Autonomous Loop Rules

1. **No autonomous merge to `main`:** All merges require human approval
2. **No autonomous clinical decisions:** C45-XX items route to human clinical lead
3. **No autonomous deployment:** T45-11 requires explicit owner authority
4. **Autonomous testing:** Full test suite runs on every PR automatically
5. **Autonomous documentation:** Loop evidence auto-generated and committed to `.acr-loop/`
6. **Autonomous issue triage:** New issues auto-labelled, assigned, and prioritized

---

## Part 8 — Build 45 Partner Review Procedure

### 8.1 Stage A — Controlled Application Inspection

| Step | Action | Responsible | Evidence |
|------|--------|-------------|----------|
| A.1 | Provide unchanged Build 45 identity + written evaluation-only notice | Owner | Distribution record |
| A.2 | Use synthetic cases only; no real-patient data | Reviewer | Signed undertaking |
| A.3 | Inspect: Poster, Welcome, invite/mode, 5 input screens, Review, Result, technical detail, languages, Arabic | Reviewer | Inspection checklist |
| A.4 | Exercise: Live, explicit synthetic, unavailable modes separately | Reviewer | Mode test record |
| A.5 | Record observations as interface/logic findings, not clinical acceptance | Reviewer | Findings document |

### 8.2 Stage B — Clinical Case Protocol Design

| Step | Action | Responsible | Evidence |
|------|--------|-------------|----------|
| B.1 | Approve intended user and intended use | Clinical Partners | Decision record |
| B.2 | Define inclusion/exclusion criteria and minimum facts | Clinical Partners | Protocol document |
| B.3 | Approve synthetic or de-identified reference-case set | Clinical Partners | Case set approval |
| B.4 | Define expected outputs and independent adjudication | Clinical Partners | Adjudication plan |
| B.5 | Define discrepancy severity and safety stop rules | Clinical Partners | Safety rules |
| B.6 | Define measures: subtype agreement, recommendation agreement, completeness, usability, explanation quality | Clinical Partners | Measures document |
| B.7 | Define indeterminate/missing data handling | Clinical Partners | Handling rules |
| B.8 | Define Bayes evaluation scope | Clinical Partners | Bayes evaluation plan |
| B.9 | Define ethics, consent, information-governance if real data proposed | Clinical Partners | Ethics approval |

### 8.3 Stage C — Technical-Clinical Adjudication

| Step | Action | Responsible | Evidence |
|------|--------|-------------|----------|
| C.1 | Retain input facts, backend identity, result mode, reasoning, rules, warnings, recommendations, Bayes, reviewer decision | Dev | Research artefact |
| C.2 | Define artefact purpose, access, storage, retention, deletion | Governance | Governance document |
| C.3 | Ensure operational logs never contain clinical facts or artefact bodies | Dev | Log scan evidence |
| C.4 | Two qualified reviewers assess discrepancies independently | Clinical Partners | Reviewer reports |
| C.5 | Define third-reviewer resolution process | Clinical Partners | Resolution procedure |
| C.6 | No silent repair of clinical-engine differences | Dev | Verification evidence |

### 8.4 Stage D — Build 45 Acceptance

| Criterion | Requirement |
|-----------|-------------|
| T45-01 to T45-12 | All implemented, tested, evidence recorded |
| C45-01 to C45-11 | All decided, implemented per decision, clinical sign-off |
| G_COMPLETE | `true` after independent review |
| Security Review | T45-11 passed independent security review |
| Distribution | Approved route selected, documented, signed |

---

## Part 9 — Distribution Route Decision

### 9.1 Candidate Routes

| Route | Suitability | Requirements | Constraints |
|-------|-------------|--------------|-------------|
| **Direct Developer Install** | Very small supervised set (P0) | Apple Developer account, device UDID registration | Max 100 devices/year (iOS), manual installation |
| **Apple TestFlight** | Small-medium external testing | Apple Developer account, app review for external | 90-day expiry, 10,000 testers, review time |
| **Android Internal/Closed Testing** | Small-medium testing | Google Play Console, signed APK | Google Play policies, review time |
| **Android Signed APK** | Controlled distribution | Code signing certificate | Manual installation, security warnings |
| **Institutional MDM** | Enterprise deployment | MDM infrastructure, institutional agreement | Requires partner governance |

### 9.2 Decision Record Template

```
Distribution Decision Record — Build 45
- Build Owner: [Name]
- Signing/Account Owner: [Name]
- Authorised Invitees/Devices: [List or count]
- Code Issuer: [Name/Role]
- Start Date: [Date]
- End Date: [Date]
- Update/Revocation Procedure: [Description]
- Support Contact: [Email]
- Permitted Data: [Synthetic only / Explicitly authorised non-patient]
- Evidence Retention: [Duration and location]
- Incident Response: [Procedure reference]
- Approved By: [Signature]
```

---

## Part 10 — Timeline and Milestones

### 10.1 Proposed Schedule

| Milestone | Target Date | Deliverables | Dependencies |
|-----------|-------------|--------------|--------------|
| **M1: Branch & Setup** | Day 1-2 | feature/mobile-v0.6.5-build45 created, GitHub Project active, issues created | — |
| **M2: T45-01 to T45-03** | Day 3-14 | Isolated test facility, exception testing, log privacy | M1 |
| **M3: T45-04 to T45-07** | Day 15-28 | Rule ordering, fact parity, Phase G re-run, TypeScript cleanup | M2 |
| **M4: T45-08 to T45-10** | Day 29-42 | Invite governance, Bayes presentation, connection states | M3 |
| **M5: Clinical Decisions** | Day 43-56 | C45-01 to C45-11 decided and documented | M4 (parallel) |
| **M6: T45-11 Design** | Day 43-56 | Secure remote-review architecture approved | M5 |
| **M7: T45-12 + Clinical Implementation** | Day 57-70 | Web parity, clinical decisions implemented | M5 |
| **M8: Multi-Device Testing** | Day 71-84 | iPhone 13, X, 8+, iPad, Android devices tested | M7 |
| **M9: T45-11 Implementation** | Day 85-98 | Remote-review gateway built and tested | M6 |
| **M10: Final Regression** | Day 99-105 | Full Phase G, Build 44 regressions, G_COMPLETE | M8, M9 |
| **M11: Security Review** | Day 106-112 | Independent security review, threat model validation | M10 |
| **M12: Partner Review** | Day 113-126 | Stage A-D review procedure | M11 |
| **M13: Build 45 Release** | Day 127+ | Distribution, documentation, loop evidence | M12 |

*Note: Timeline assumes 1 developer FTE + clinical partner availability. Adjust based on resource availability.*

### 10.2 Critical Path

```
M1 → M2 → M3 → M4 → M7 → M8 → M10 → M11 → M12 → M13
              ↓
             M5 → M6 → M9
```

---

## Part 11 — Evidence and Documentation Requirements

### 11.1 Loop Evidence Structure

```
.acr-loop/v1.7/build45/
├── planning/
│   └── ACR_MOBILE_BUILD45_IMPLEMENTATION_PLAN_v1.0.md (this document)
├── technical/
│   ├── T45-01-isolated-reasoner/
│   ├── T45-02-exception-paths/
│   ├── T45-03-log-privacy/
│   ├── T45-04-rule-ordering/
│   ├── T45-05-fact-parity/
│   ├── T45-06-phase-g-rerun/
│   ├── T45-07-typescript/
│   ├── T45-08-invite-governance/
│   ├── T45-09-bayes-presentation/
│   ├── T45-10-connection-states/
│   ├── T45-11-remote-review/
│   └── T45-12-web-parity/
├── clinical/
│   ├── C45-01-tumour-size-unit/
│   ├── C45-02-optionality/
│   ├── C45-03-risk-grade/
│   ├── C45-04-risk-colour/
│   ├── C45-05-stage-linkage/
│   ├── C45-06-her2-mapping/
│   ├── C45-07-inactive-fields/
│   ├── C45-08-bayes-description/
│   ├── C45-09-result-hierarchy/
│   ├── C45-10-recommendation-intent/
│   └── C45-11-presentation-authority/
├── testing/
│   ├── ios-device-matrix/
│   ├── android-device-matrix/
│   └── api-integration/
├── review/
│   ├── G-COMPLETE-REVIEW-002/
│   ├── SECURITY-REVIEW-001/
│   └── CLINICAL-SIGNOFF-001/
└── distribution/
    └── DISTRIBUTION-DECISION-001/
```

### 11.2 Required Sign-Offs

| Review | Required From | Evidence Location |
|--------|---------------|-------------------|
| Technical completion | Lead Developer | `.acr-loop/v1.7/build45/technical/` |
| Clinical decisions | ZZU/UCD Partners | `.acr-loop/v1.7/build45/clinical/` |
| G_COMPLETE | Independent Reviewer | `.acr-loop/v1.7/build45/review/G-COMPLETE-REVIEW-002/` |
| Security (T45-11) | Security Reviewer | `.acr-loop/v1.7/build45/review/SECURITY-REVIEW-001/` |
| Distribution | Owner | `.acr-loop/v1.7/build45/distribution/` |

---

## Part 12 — Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R01 | Clinical partner availability delays decisions | Medium | High | Start C45 discussions early; document interim positions |
| R02 | T45-11 security review finds critical issue | Medium | High | Phase A design review before implementation; budget time for rework |
| R03 | Multi-device testing reveals platform-specific bugs | High | Medium | Prioritize P0 devices; defer P2 if needed |
| R04 | iOS App Store / TestFlight rejection | Low | High | Use direct developer install as fallback; prepare early |
| R05 | Android fragmentation causes compatibility issues | Medium | Medium | Test on representative sample; use React Native abstraction |
| R06 | Backend API changes break mobile contract | Low | High | Version API; gateway abstraction layer; contract tests |
| R07 | Log privacy remediation is incomplete | Medium | Critical | Automated scanning; independent audit; fail CI on detection |
| R08 | Bayes presentation misleads users | Medium | High | Clinical sign-off on all text; user testing; explicit OFF states |
| R09 | Remote-review gateway compromised | Low | Critical | Threat model; independent security review; no deployment without approval |
| R10 | Build 45 scope creep delays release | High | Medium | Strict backlog adherence; defer non-critical items to Build 46 |

---

## Appendices

### Appendix A — Build 44 Baseline Reference

- **Commit:** `ab8140d2b54ed32a0fe2896ea39f50b88970f9c5`
- **Branch:** `feature/mobile-v0.6.0-build44-cds-parity`
- **Reports:**
  1. `ACR_MOBILE_CDS_PARITY_EXECUTION_EVIDENCE_v1.6.md`
  2. `ACR_MOBILE_CDS_PARITY_AUTONOMOUS_CODEX_LOOP_v1.6.md`
  3. `ACR_MOBILE_BUILD45_TECHNICAL_CLINICAL_REVIEW_BACKLOG_v0.1.md`
  4. `ACR_MOBILE_FUNCTIONAL_FLOW_FOR_CLINICAL_REVIEW_v0.1.md`
  5. `ACR_PLATFORM_AND_MOBILE_GATEWAY_MANUAL_OPERATIONS_01SEPT26.md`
  6. `ACR_MOBILE_BACKEND_REASONER_FLOW_REAFFIRMATION_v0.1.md`

### Appendix B — Glossary

| Term | Definition |
|------|------------|
| **ACR** | Assistant for Clinical Reasoning |
| **Bayes/Bayesian** | Optional probabilistic enhancement to deterministic reasoning |
| **CDS** | Clinical Decision Support |
| **Fail-closed** | When uncertain, reject request rather than allow potentially unsafe operation |
| **G_COMPLETE** | Phase G (parity and safety) completion flag |
| **Openllet** | OWL reasoner used for SWRL rule execution |
| **SWRL** | Semantic Web Rule Language |
| **Synthetic data** | Artificially generated test data, not from real patients |
| **T45-XX** | Technical work item for Build 45 |
| **C45-XX** | Clinical decision point for Build 45 |
| **T3** | Gateway/mobile gateway tier |
| **RFC1918** | Private IP address space (e.g., 192.168.x.x) |

### Appendix C — Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Owner / Product Lead | Kraken | _________________ | _______ |
| Lead Developer | | _________________ | _______ |
| Clinical Lead (ZZU/UCD) | | _________________ | _______ |
| Security Reviewer | | _________________ | _______ |
| Independent Reviewer | | _________________ | _______ |

---

*End of Implementation Plan*
*Document generated: 2 September 2026*
*Next review: Upon completion of M1 (Branch & Setup)*
