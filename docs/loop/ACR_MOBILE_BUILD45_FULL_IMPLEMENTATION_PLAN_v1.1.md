# ACR Mobile Companion v0.6.5 Build 45 — Full Implementation Plan

**Document Version:** 1.1
**Prepared:** 2 September 2026
**Revised:** 2 September 2026 after source, contract, security and scope review
**Predecessor:** ACR Mobile v0.6.0 Build 44 (ab8140d2b54ed32a0fe2896ea39f50b88970f9c5)
**Branch:** proposed `feature/mobile-v0.6.5-build45` (not created by this plan review)
**Repository:** `https://github.com/KY-BChain/ACR-Mobile-Companion`
**Local Working Directory:** `/Users/Kraken/DAPP/acr-mobile-companion/`
**Verified core devices:** iPhone 16e simulator; physical iPhone 13, Samsung S8/SM-G950F and Xiaomi MIX Fold 2
**Governance Principle:** *Data Stays. Rules Travel.*

---

## Executive Summary

This plan develops the Build 44 evaluation codebase into a Build 45 evaluation candidate. It must resolve the deferred Phase G items, implement the 12 technical safety workstreams (T45-01 to T45-12), obtain rather than invent the 11 clinical decisions (C45-01 to C45-11), and validate on the devices and networks actually available. Secure remote-review capability is a high-priority workstream, but its public hostname/tunnel implementation begins only after the owner approves its architecture, provider/account ownership, retention policy and operating model.

**Critical constraints:** Build 45 remains an evaluation build. Use synthetic or explicitly authorised non-patient test cases only. De-identification alone does not place real clinical records inside this scope. No real-patient data, autonomous clinical decision, production reasoner switch, public endpoint deployment, distribution, merge to `main` or release is implied by this plan.

### 0.1 Authority and completion model

- The plan authorises no GitHub mutation, platform source change, new tunnel/DNS record, signing, installation or distribution by itself.
- Each state-changing stage requires the named owner gate below. Clinical decisions come only from the authorised clinical partners; an AI agent may organise evidence but must not decide them.
- Implementation agents and an independent reviewer work from fixed commit/artefact identities. The reviewer does not implement or self-approve repairs.
- `G_COMPLETE=true` is available only on the final frozen Build 45 source after all applicable T45/C45 changes. Historic Build 44 test counts are minimum regression families, not fixed future totals.
- A technical Build 45 candidate and approval to distribute it are separate terminal states.

---

## Part 1 — Repository and Branch Strategy

### 1.1 Git Setup and Branching

| Step | Action | Command / Procedure | Evidence Required |
|------|--------|---------------------|-------------------|
| 1.1.1 | Preserve user-authored files and verify Build 44 | `cd /Users/Kraken/DAPP/acr-mobile-companion && git status --short --branch` | Owner reviews any dirty/untracked files; do not discard them |
| 1.1.2 | Verify exact local/remote baseline | Compare `git rev-parse HEAD` and `git rev-parse origin/feature/mobile-v0.6.0-build44-cds-parity` after an authorised fetch | Both equal `ab8140d2b54ed32a0fe2896ea39f50b88970f9c5` |
| 1.1.3 | Create Build 45 feature branch | Only after owner says GO: `git switch -c feature/mobile-v0.6.5-build45 ab8140d2b54ed32a0fe2896ea39f50b88970f9c5` | Branch begins at the exact reviewed Build 44 commit |
| 1.1.4 | Publish feature branch | Separate owner authority: `git push -u origin feature/mobile-v0.6.5-build45` | Remote branch and upstream verified; no PR/merge implied |
| 1.1.5 | Preserve baseline identity | The immutable commit SHA and external verified bundle are sufficient; create/push a tag only if the owner separately approves a tag name | No unrequested tag mutation |
| 1.1.6 | GitHub Desktop | Confirm the same repository and feature branch after branch creation | Local application view agrees with CLI |
| 1.1.7 | Optional GitHub Project/issues | Prepare an issue-import proposal first; create the Project/issues only with owner authority | No duplicate or public clinical/security issue disclosure |
| 1.1.8 | Public-repository safety | Secret and privacy scan every proposed commit; keep invite secrets, tokens, tunnel credentials, device IDs and raw private evidence outside Git | Scan evidence and reviewed allowlist |

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
├── .acr-loop/              # Private task-local evidence; ignored, offloaded and never auto-committed
└── package.json            # Dependencies and scripts
```

Committed redacted evidence belongs under `docs/loop/`. Raw logs, device identifiers, signing material, invite records, tunnel credentials and clinical case bodies stay outside the public repository. Reproducible dependencies/build intermediates remain ignored and are recreated from lockfiles only when needed.

### 1.3 Build identity, toolchain and storage gate

Before implementation, restore dependencies from the committed lockfiles and record Node/npm, Xcode, CocoaPods, Java/Gradle and Android SDK/NDK versions. Preserve the native `ios/` and `android/` projects; do not run Expo Prebuild or regenerate them. Keep Build 44 source/artifacts externally recoverable.

The first Build 45 identity-only change must keep all layers consistent:

| Layer | Required candidate identity |
| --- | --- |
| Expo/app metadata | version `0.6.5`, build `45` |
| iOS | `MARKETING_VERSION=0.6.5`, `CURRENT_PROJECT_VERSION=45` |
| Android | `versionName 0.6.5`, monotonic `versionCode 45` |
| Mobile/gateway binding | `mob-v0.6.5+45` |
| Gateway package | `0.6.5` |
| Contract | Retain `acr.cds.v1` only if compatible; otherwise introduce a reviewed version and migration together |

Run an internal/external free-space preflight before dependency restoration and every native build. Use the external Android SDK/Gradle strategy only after AndroidDev is explicitly connected and verified. Build serially, preserve each final artifact/hash before removing intermediates, and never delete source, lockfiles, accepted artifacts, signing assets or Git history. Generated `node_modules`, Pods and build outputs must remain untracked.

---

## Part 2 — Technical Safety Work Implementation (T45-01 to T45-12)

### 2.1 T45-01 — Isolated Openllet/SWRL vs Java Fallback Parity Test Facility

**Objective:** Execute identical synthetic fixtures through both reasoning paths in an isolated environment and enumerate all differences.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-01a | Add a test-only profile/harness in the platform repository, isolated from normal runtime and unreachable through production controllers | Platform Dev | Exact-source test seam and proof no runtime/test-control endpoint exists |
| T45-01b | Exercise the checked-out platform source directly; do not copy the reasoner or fallback into a second implementation | Platform Dev | Platform commit identity and source manifest |
| T45-01c | Define a coverage-driven synthetic fixture set covering all 20 mobile inputs, null/zero/false semantics, boundaries, missing-data tiers and every reachable subtype; do not invent an arbitrary case-count acceptance threshold | Dev + Clinical Lead | Fixture catalogue, coverage matrix and clinical provenance |
| T45-01d | Execute each fixture through Openllet/SWRL path, capture: subtype, risk, treatments, biomarkers, firedRules, explanations, completeness, Bayes ON/OFF | Dev | Raw output logs |
| T45-01e | Execute identical fixtures through Java fallback path, capture same fields | Dev | Raw output logs |
| T45-01f | Automated diff engine: compare every field, flag any divergence | Dev | Diff report with severity classification |
| T45-01g | Clinical review of clinically material divergences; technical ordering/serialization differences remain separately classified | Clinical Lead + Reviewer | Signed adjudication and technical classification |
| T45-01h | Fix or document each divergence; re-run until diff report is empty or all items documented | Dev | Final diff report, commit hash |

**Completion Criteria:** Independent repeated comparison shows zero unexplained differences.

---

### 2.2 T45-02 — Forced BayesianEnhancer Exception Path Testing

**Objective:** Prove platform failure representation and gateway fail-closed handling when `BayesianEnhancer` throws.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-02a | Add dependency-injected/fault-injection behaviour available only in tests; do not create a production switch or public fault endpoint | Platform Dev | Test seam plus proof normal runtime cannot invoke it |
| T45-02b | Trigger exception at each stage: initialization, prior calculation, posterior update, bounds computation | Dev | Stage-by-stage test logs |
| T45-02c | Verify platform returns structured error response, no partial clinical output | Dev | Response captures |
| T45-02d | Verify gateway detects degraded/partial Bayes response and fails closed | Dev | Test assertion and metadata-only log evidence; no response body in logs |
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
| T45-03c | Retain only approved metadata: timestamp, random non-clinical correlation ID, processing duration, bounded error category and build version | Dev | Approved metadata whitelist and re-identification review |
| T45-03d | Prohibit clinical/request/result values at every operational log level, including DEBUG/TRACE; tests may assert against in-memory fixtures without emitting bodies | Dev | Log configuration and source diff |
| T45-03e | Implement log scanning CI check: fail build if clinical patterns detected in INFO/WARN/ERROR | Dev | CI pipeline config, test failure evidence |
| T45-03f | Run sentinel synthetic fixtures and scan platform, gateway and mobile logs, crash records and routine storage | Dev | Clean positive/negative scan report |
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
| T45-05g | If the approved fact set changes, version the contract and migration explicitly; do not silently change `acr.cds.v1` | Dev | Compatibility decision and schema/OpenAPI update |
| T45-05h | Update gateway/mobile validation only after the contract and clinical decisions are approved | Dev | Cross-layer contract tests |

**Completion Criteria:** Approved mapping document identifying shared, mobile-only, and website-only facts with controlled evaluation context.

---

### 2.6 T45-06 — Full Phase G and Build 44 Regression on Build 45 Snapshot

**Objective:** Re-run all automated tests on frozen Build 45 codebase.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-06a | Freeze the candidate commit after all applicable T45/C45 changes; record SHA without creating a tag unless separately authorised | Dev | Immutable commit and source manifest |
| T45-06b | Run every current gateway test plus all Build 45 additions; the historic 157 tests are a minimum retained family, not a fixed total | Dev | Test report with pass/fail and test inventory |
| T45-06c | Run every retained targeted platform test plus new isolation/privacy/failure tests; historic 79 is a minimum retained family | Platform Dev | Test report with pass/fail and test inventory |
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
| T45-07b | Reproduce and classify the historical diagnostics on the Build 45 toolchain; do not assume the former count of 250 remains exact | Dev | Versioned diagnostic inventory |
| T45-07c | For "delete": remove dead code with commit | Dev | Commits with rationale |
| T45-07d | For "migrate": move to active source with proper typing | Dev | Migration commits |
| T45-07e | For "archive": move to `/archive/` with README | Dev | Archive directory |
| T45-07f | For "document exclusion": add to `tsconfig.json` exclude with justification comment | Dev | tsconfig diff |
| T45-07g | Verify `strict` mode not weakened | Dev | tsconfig strict flags unchanged |
| T45-07h | Active build graph passes clean; any intentionally archived/non-build root has a manifest and separately justified check boundary | Dev | Clean active check plus archived-root evidence |

**Completion Criteria:** Active graph clean; full repository typecheck passes; strictness maintained.

---

### 2.8 T45-08 — Per-Invitee Access Administration

**Objective:** Replace single owner-supplied invite code with multi-invitee governance.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-08a | Design invite system: named issuer, unique code policy, expiry, revocation | Dev/Security | Design document |
| T45-08b | Implement high-entropy invite generation and a reviewed salted slow verifier (prefer Argon2id or scrypt; PBKDF2 only with documented parameters); add an environment-held pepper if the threat model requires it | Dev/Security | Algorithm, parameter and rotation rationale |
| T45-08c | Implement one-time/limited redemption and reviewed app-installation proof. The current caller-supplied binding header is an identifier, not strong attestation; choose Keychain/Keystore-protected secret proof or asymmetric proof-of-possession through the threat model | Dev/Security | Redemption, challenge/replay and key-loss flow |
| T45-08d | Implement expiry: configurable TTL (default 7 days for evaluators) | Dev | Expiry logic |
| T45-08e | Implement revocation through a local-only administration CLI or separately protected management plane; do not add a public mobile admin route | Dev/Security | Access-control and revocation tests |
| T45-08f | Implement minimal non-clinical audit metadata: opaque invite record ID, state transitions and timestamps. Use an app-installation binding, never a stable hardware fingerprint | Dev/Security | Data-minimised audit schema and retention policy |
| T45-08g | Lost-code procedure: re-issue requires owner approval, old code invalidated | Dev | Procedure document |
| T45-08h | Store no plaintext invite, access token or refresh token; persist only what is required for expiry/revocation using restrictive file permissions and reviewed backup handling | Dev | Store/schema/permissions review |
| T45-08i | Mobile: update invite entry screen to support new code format | Dev | UI update |
| T45-08j | Gateway: update authentication to validate against new invite store | Dev | Gateway auth diff |
| T45-08k | Test issuance, one-time/limited redemption, concurrent attempts, brute-force rate limits, expiry, individual revocation, token rotation/reuse revocation, restart and clock boundaries | Dev + Reviewer | Deterministic security test evidence |

**Completion Criteria:** Named issuer/controller, unique codes, expiry, revocation, audit, lost-code procedure operational; no plaintext storage.

---

### 2.9 T45-09 — Governed Patient-Facing Bayesian Percentage Presentation

**Objective:** Display a governed user-facing Bayesian metric only when the backend contract and clinical partners establish its meaning and valid range. Do not call the audience “patient-facing” until C45-10 defines intended use.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-09a | Define display conditions and authoritative backend field, including observed valid range; do not assume `[0,1]` without a platform contract | Clinical Lead + Platform Dev | Display/contract specification |
| T45-09b | If the value is contractually normalised, define conversion and rounding; otherwise define the correct native presentation | Clinical Lead | Conversion specification |
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
| T45-10b | Retain gateway-process liveness at `GET /m/v1/live`; add a versioned status contract only if the existing route is insufficient | Dev | Contract and compatibility tests |
| T45-10c | Use protected `GET /m/v1/attestation` for observed platform verification and the canonical platform probes `/api/infer/health`, `/api/ontolator/status` and `/api/ontolator/manifest` | Dev | Freshness/timeout and fail-closed tests |
| T45-10d | Update Welcome screen: show dual-state indicator, not single "connected" | Dev | UI implementation |
| T45-10e | Mark Live unavailable or retryable from fresh evidence. Offer Explicit Verified Synthetic only when an eligible fixture is actually loaded; never infer availability merely because Live is offline | Dev | Mode-state matrix |
| T45-10f | Add explanation text: "Gateway is reachable but Live Platform is offline. You can still use verified synthetic demonstration." | UX | Text copy |
| T45-10g | Ensure no implication that phone performs local clinical inference | Dev | UI text review |
| T45-10h | Test: Wi-Fi on, gateway running, Spring Boot stopped → verify correct state | Dev | Test evidence |
| T45-10i | Test DNS/TLS/tunnel/Wi-Fi failures and use an honest “Gateway unreachable” state unless the operating system can reliably prove “No Network” | Dev | Failure-class evidence |
| T45-10j | Test: gateway stopped → verify "Gateway Unreachable" | Dev | Test evidence |

**Completion Criteria:** Distinct states displayed; live submission remains fail-closed; explicit synthetic replay available; no local inference implication.

---

### 2.11 T45-11 — Secure Remote-Review Gateway and Endpoint Mobility

**Objective:** Enable small named reviewer group access without RFC1918 assumptions.

#### Phase A — Design (No implementation without explicit owner authority)

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-11a | Complete T45-08 first (prerequisite) | Dev | T45-08 completion evidence |
| T45-11b | Produce an architecture decision record comparing current-Mac interim service with later managed/VPS hosting | Security + Owner | Approved ADR with costs, ownership, availability and rollback |
| T45-11c | Define a separate outbound authenticated tunnel and candidate dedicated HTTPS mobile-gateway hostname; do not create either during design | Security | Tunnel/hostname specification and route allowlist |
| T45-11d | Define gateway origin: bind to loopback or narrowly controlled local interface | Security | Binding specification |
| T45-11e | Define modern TLS at the public edge, origin protection and certificate/DNS rotation. Do not require TLS 1.3 exclusively where reviewed clients need TLS 1.2 compatibility; no brittle pinning without backup/rotation design | Security | TLS/certificate specification |
| T45-11f | Define endpoint: single approved `https://` gateway, no cleartext, no endpoint editor, no platform bypass | Security | Endpoint policy |
| T45-11g | Define no automatic Live-to-Demo fallback | Security | Fallback policy |
| T45-11h | Define request-size limits, strict JSON/schema validation, build/device binding | Security | Validation spec |
| T45-11i | Define refresh rotation, reuse revocation, rate limiting | Security | Token policy |
| T45-11j | Define secrets management: tunnel credentials, invite pepper/store keys and tokens outside Git, app bundles, documents, screenshots and shell history | Security | Secrets inventory, owner and rotation policy |
| T45-11k | Define restart recovery: no silent acceptance of old/unknown sessions | Security | Recovery procedure |
| T45-11l | Define availability modes: Live (Mac+Spring+platform tunnel+gateway+tunnel), Synthetic (Mac+gateway+tunnel) | Security | Availability matrix |
| T45-11m | Regional assessment: EU/EEA, UK, Ireland, Japan, HKSAR and mainland China connectivity/legal/institutional constraints; record untested regions as `NOT ASSESSABLE` | Security + Governance | Regional assessment |
| T45-11n | Threat model: TLS, auth, rate limits, replay, revocation, logs, backend outage, tunnel outage, DNS/cert rotation, Mac restart, travel/network change | Security | Threat model document |
| T45-11o | Independent security review before external distribution | Security | Signed review |

#### Phase B — Implementation (Requires explicit owner authority after Phase A approval)

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-11p | After explicit owner GO, configure the approved outbound tunnel on the Mac without router port-forwarding/UPnP | Dev/Ops | Redacted config and account-owner record |
| T45-11q | Route only the approved `/m/v1/*` mobile surface to loopback-bound T3; configure edge TLS, request limits, rate limits and denial of management/test paths | Dev/Security | Edge policy and external negative tests |
| T45-11r | Rebuild iOS with approved endpoint | Dev | Build artifact |
| T45-11s | Rebuild Android with approved endpoint | Dev | Build artifact |
| T45-11t | Implement certificate rotation handling | Dev | Rotation test |
| T45-11u | Implement rollback handling | Dev | Rollback procedure |
| T45-11v | Multi-invite, brute-force, expiry/revocation, build-binding and app-installation-binding tests with T45-08 | Dev | Test evidence |
| T45-11w | Off-LAN cellular test plus authorised regional tests; do not infer international reachability from local Wi-Fi or the website tunnel | Dev + Named Reviewers | Observed results or `NOT ASSESSABLE` |
| T45-11x | Clean privacy/log scans | Dev | Scan reports |
| T45-11y | Failure-mode tests: backend outage, tunnel outage, cert rotation, restart | Dev | Test evidence |
| T45-11z | Prepare a distribution decision packet; actual distribution remains a later, separate owner action | Owner | Signed GO/NO-GO decision, not inferred from technical PASS |

**Completion Criteria:** Phase A is complete when the owner approves the ADR and independent security review. Phase B is complete only after a separately authorised implementation has exact endpoint/certificate posture, multi-invite tests, observed/`NOT ASSESSABLE` regional results, clean scans, failure tests and rebuilt apps. Neither completion state itself distributes an app.

---

### 2.12 T45-12 — Mirror Web ACR Pathway Clinical-Result Design

**Objective:** Achieve web-to-mobile clinical presentation parity from identical backend responses.

| Task | Detail | Owner | Evidence |
|------|--------|-------|----------|
| T45-12a | Catalog web Pathway elements: subtype badges, risk, warnings, treatment/recommendation cards, reasoning, confidence/Bayes, source details | Dev | Web element inventory |
| T45-12b | Catalog current mobile result elements | Dev | Mobile element inventory |
| T45-12c | Define parity matrix: which web elements map to mobile, which are web-only | Clinical Lead | Parity matrix |
| T45-12d | Implement subtype presentation: identical wording and hierarchy | Dev | Implementation |
| T45-12e | Implement only the C45-03/C45-04-approved authoritative risk grade and colour mapping; colours are presentation tokens, not invented API clinical data | Dev | Field trace and colour-token implementation |
| T45-12f | Ensure every colour has text/icon/non-colour cues | Dev | Accessibility test |
| T45-12g | Ensure accessible contrast ratios (WCAG AA minimum) | Dev | Contrast test report |
| T45-12h | Implement completeness indicator | Dev | Implementation |
| T45-12i | Implement missing-data warning | Dev | Implementation |
| T45-12j | Implement the approved recommendation hierarchy using backend-returned content only; do not copy web-authored fallback or add rationale/priority/guideline claims | Dev | Source-to-render trace and negative tests |
| T45-12k | Implement supporting reasoning display | Dev | Implementation |
| T45-12l | Implement provenance: reasoning mode, backend version, timestamp | Dev | Implementation |
| T45-12m | Implement actual backend Bayes percentage/bounds (under C45-08) | Dev | Implementation |
| T45-12n | Technical trace remains optional and collapsible | Dev | Implementation |
| T45-12o | Eight-language support verified | Dev | Localization test |
| T45-12p | RTL (Arabic) support verified | Dev | RTL test |
| T45-12q | Screen-reader support verified | Dev | VoiceOver/TalkBack test |
| T45-12r | Dynamic Type/font scaling verified | Dev | Font scaling test |
| T45-12s | Layout tests: S8, iPhone 13, folded/unfolded | Dev | Screenshot matrix |
| T45-12t | Parity test: one captured, schema-valid backend response renders equivalent authoritative meaning on web and mobile; record intentional layout-only differences | Dev + Reviewer | Side-by-side semantic comparison |

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
| **Implementation** | Only after approval: update label/unit/range and contract together; preserve raw transport unless conversion is expressly governed |
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
| **Implementation** | Add approved contextual help or links. Any cross-field validation must be clinically specified and backend-consistent; mobile must not calculate tumour stage |
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
| **Implementation** | Add approved non-influence disclosure, remove through a versioned contract, or retain without claiming an effect; do not label speculative future use as fact |
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

### 4.1 Verified core devices

| Device | Verified Build 44 OS/context | Build 45 test focus | Priority |
|--------|-------------------------------|---------------------|----------|
| iPhone 16e simulator | iOS 26.3; prior device was deleted during authorised housekeeping and may be recreated only when Build 45 testing starts | First native candidate, offline/online state and visual review before physical iOS | P0 |
| iPhone 13 (physical) | iOS 26.6.1 | Primary iOS Release upgrade, signing, standalone and remote/off-LAN review | P0 |
| Samsung S8/SM-G950F (physical) | Android 9 | Minimum supported/legacy Android, small screen, standalone and remote review | P0 |
| Xiaomi MIX Fold 2 (physical) | Android 15 | Folded/unfolded/resized layout and remote review | P0 |

### 4.2 Optional devices

iPhone X/8 Plus/iPad, newer Samsung/Pixel/Fold/Flip devices and additional OS versions are **not currently evidenced as available**. Add them only when the owner supplies and authorises the exact physical device or a supported iOS simulator. Record unavailable rows as `NOT TESTED`, never implied coverage. No Android emulator is permitted under the retained execution constraint.

### 4.3 Test Scenarios Per Device

1. **Installation:** Preserve Build 44, then test approved in-place upgrade; clean reinstall only when separately authorised
2. **Onboarding:** Poster, Welcome, invite entry, mode selection
3. **Input Flow:** All 5 screens, field validation, keyboard handling, scroll behaviour
4. **Review Screen:** Data accuracy, edit navigation, submit
5. **Results:** Clinical-first view, technical detail, Bayes display (if applicable)
6. **Languages:** All 8 languages, Arabic RTL/LTR switching
7. **Accessibility:** VoiceOver (iOS), TalkBack (Android), Dynamic Type, font scaling
8. **Connection States:** Gateway connected/platform online, gateway connected/platform offline, gateway unreachable, no network
9. **Modes:** Live, explicit synthetic, unavailable
10. **Background/Resume:** App backgrounding, resuming, memory pressure
11. **Remote route:** same-LAN baseline and genuine off-LAN cellular/Wi-Fi, TLS failure and tunnel restart
12. **Rotation/theme:** only where the application explicitly supports them; unsupported modes are documented, not treated as automatic requirements

Every device result records exact model/OS/build/hash, physical versus simulator, automated versus human evidence, and `PASS`, `FAIL`, `NOT TESTED` or `NOT ASSESSABLE`. A screenshot alone does not prove gestures, networking or standalone launch.

---

## Part 5 — Current Gateway and Build 45 Remote-Review Interface

### 5.1 How Build 44 works now

```text
Build 44 phone
  │  HTTP to fixed private LAN address 192.168.1.94:3001
  ▼
T3 — Node mobile gateway on the Mac
  │  HTTPS to https://api.acragent.com/api/infer
  ▼
T2 — existing Cloudflare acr-api tunnel
  │  forwards to http://localhost:8080
  ▼
T1 — Spring Boot hybrid profile
  └─ Ontology + SWRL/Openllet → platform Java aggregation/fallback → optional Bayes
```

T3 is not a reasoner. It redeems the one configured invitation-code hash, issues in-memory access/refresh token families bound to the app-provided device binding and exact `mob-v0.6.0+44` identity, validates the versioned request, obtains observed platform attestation, maps the request to the platform wrapper, calls the configured `/api/infer`, validates the response and returns it without clinical reinterpretation. Live timeouts, malformed/partial output, evidence mismatch and backend failures fail closed.

The separate `POST /m/v1/demo/infer` route is selected explicitly. It can replay only an independently reviewed immutable platform capture whose non-transport input values match exactly. Current execution is labelled `NOT_EXECUTED`; it never becomes an automatic fallback from Live.

Build 44 works only on a network that can route to `192.168.1.94`. An invitation code authenticates a caller but does not create network reachability. The website does not use T3: it calls the public platform API through T2 directly.

### 5.2 Verified Build 44 routes

| Tier | Method and route | Purpose |
| --- | --- | --- |
| T3 | `GET /m/v1/live` | Gateway process liveness only |
| T3 | `POST /m/v1/auth/redeem` | Exchange invite + app-installation/build binding for an in-memory token family |
| T3 | `POST /m/v1/auth/refresh` | Rotate refresh token; reuse revokes the family |
| T3 | `GET /m/v1/attestation` | Protected expected-versus-observed platform evidence |
| T3 | `POST /m/v1/infer` | Protected current inference through the configured platform route |
| T3 | `POST /m/v1/demo/infer` | Protected explicit verified replay |
| T1/T2 | `POST /api/infer` | Canonical platform inference used by website and T3 |
| T1/T2 | `GET /api/infer/health` | Platform inference health |
| T1/T2 | `GET /api/ontolator/status` | Observed reasoner/rule status |
| T1/T2 | `GET /api/ontolator/manifest` | Observed manifest/count evidence |

Do not replace these with invented `/gateway/*` or `/api/health` paths. Any new Build 45 route must be under a reviewed versioned contract. Invite administration is local-only or on a separately protected management plane, never on the public mobile surface.

### 5.3 Build 45 proposed remote path — owner/security gate required

```text
Named reviewer phone on an off-LAN network
  │  HTTPS to one approved build-time hostname (candidate only)
  ▼
Public edge: TLS + narrow route allowlist + request/rate controls
  │  authenticated outbound tunnel; no router port-forwarding or public Mac IP
  ▼
T3 bound to 127.0.0.1 on the current Mac
  │  validated same-backend call
  ▼
Existing ACR Platform route/backend (T2 → T1), as selected by the approved ADR
```

The hostname, Cloudflare account/zone owner, tunnel identity, regional posture and upstream choice are not yet approved. The ADR must explicitly choose between: (A) retaining T3's call through the exact public `api.acragent.com/api/infer` route, preserving current route parity but requiring T2 and an Internet hairpin; or (B) calling the same Spring controller on loopback, reducing a dependency but requiring separate proof that public-route behaviour remains equivalent. No code or operations document may silently switch between them.

Required implementation controls:

1. T3 listens on loopback, and only the outbound tunnel can reach it. No UPnP, router forwarding, raw public port or embedded public IP.
2. The app contains one approved `https://` origin at build time. Remove Android cleartext exceptions and do not add an endpoint editor, direct platform bypass or hidden fallback.
3. The public edge exposes only required `/m/v1/*` routes, rejects management/test paths, limits body/method/rate and preserves end-to-end request IDs without logging bodies.
4. T45-08 supplies unique expiring invite records, salted slow verification, local-only administration, individual revocation and brute-force protection. Replace the current self-asserted binding string with reviewed app-installation proof protected by iOS Keychain/Secure Enclave where applicable and Android Keystore, or explicitly document why a weaker model is accepted for evaluation. Do not use hardware fingerprinting. The app begins a fresh invite/mode cycle on a genuine cold launch unless a different behaviour is explicitly approved.
5. Access/refresh tokens remain short-scoped, build/install-bound, rotatable and revocable. Secrets and invite plaintext never enter Git, app bundles, screenshots, manuals or shell history.
6. T3 continues schema validation, 16 KiB body limiting (or a separately reviewed limit), exact mode/provenance checks and fail-closed upstream validation. It does not acquire clinical logic.
7. Attestation distinguishes gateway reachability, platform availability and verified platform identity. Status is freshness-bounded; a green UI cannot survive an unchecked restart/outage indefinitely.
8. Live mode requires every approved live-path component. Explicit replay requires T3, the remote tunnel and a loaded eligible fixture, and always says current platform execution did not occur.
9. Tests include true off-LAN cellular access, TLS/DNS/tunnel/backend failures, Mac restart/network change, invite brute force/expiry/revocation, stale status, concurrent sessions and privacy/log scans. Regions not actually tested are `NOT ASSESSABLE`.
10. The current Mac is an evaluation host, not an SLA service. Document power/sleep, restart order, monitoring, certificate/tunnel rotation, incident stop, backup and later VPS migration.

#### 5.3.1 Proposed human-operated service sequence

| Terminal/tier | Build 45 role | Required for |
| --- | --- | --- |
| T0 checks | Verify Mac awake policy, network, disk capacity, no duplicate listeners and secrets loaded from protected local storage | Every controlled service session |
| T1 Spring Boot | Owns Ontology/SWRL/Openllet, platform Java path and optional Bayes on localhost:8080 | Website backend and Live mobile reasoning |
| T2 existing `acr-api` tunnel | Publishes the existing platform API used by the website and, under ADR option A, by T3 | Website backend; Live mobile under option A |
| T3 Build 45 gateway | Loopback-only mobile auth, contract validation, attestation, transport and explicit verified replay | Every remote mobile gateway mode |
| T4 proposed mobile-gateway tunnel | Publishes only the approved T3 HTTPS mobile surface | Off-LAN mobile access |

Start order for ADR option A is T1 → verify local health → T2 → verify public platform health/status/manifest → T3 → verify loopback liveness/redeem/attestation with a test invite → T4 → verify the dedicated HTTPS mobile origin from an off-LAN client. Stop in reverse order. Website backend functions require T1+T2. Remote Live mobile requires T1+T2+T3+T4. Remote explicit verified replay requires T3+T4 plus an eligible fixture and must report current platform execution as not performed. App launch and offline navigation require no service.

Build 45 operations must supply exact reviewed commands only after the tunnel name, hostname, credentials location, gateway store and ADR option are approved. The plan deliberately does not invent those values.

### 5.4 Exact request/response contract discipline

The current request is not a flat ten-field example. `acr.cds.v1` contains `contract`, `requestId`, nested `assessment` and `client`. The assessment carries generated technical `patientId` plus exactly these 20 values:

`erStatus`, `prStatus`, `her2Status`, `ki67`, `stage`, `grade`, `histologicalSubtype`, `nodalStatus`, `age`, `ca153`, `cea`, `surgeryDate`, `bayesianEnhanced`, `tumorSize`, `gender`, `ecogScore`, `pdl1Status`, `her2Low`, `lvef`, `treatmentIntent`.

The generated `patientId` is a transient technical correlation value, never a patient identifier. Build 45 should rename/version it if that reduces ambiguity, but must not silently break `acr.cds.v1`. The schema and OpenAPI files are authoritative; TypeScript types and tests must be derived from or checked against them rather than maintained as a contradictory pseudo-contract.

Response truth is the tuple `resultMode`, `reasoningMode`, `delivery.source`, `delivery.currentExecution`, `delivery.currentVerificationState`, current evidence and captured provenance. Risk colour is UI presentation after C45-03/C45-04, not an invented server result. Bayesian fields are displayed only under C45-08/T45-09. The client never manufactures subtype, risk, recommendations, rationale or provenance.

### 5.5 Minimum integration families

Retain all Build 44 tests and add: valid complete request; every null/zero/false boundary; unknown field/type/build/device rejection; invite brute-force/expiry/revocation/reuse; request-ID mismatch; oversized/malformed body; attestation verified/mismatch/unavailable/stale; backend timeout/HTTP/malformed/partial/unknown-mode; Bayes on/off/invalid/forced failure; explicit eligible replay and edited-input refusal; gateway/tunnel/T1/T2 outage separation; exact route/contract parity; metadata-only logs; and real off-LAN physical-device checks. Exact counts are reported from the final suite, not predeclared.

---

## Part 6 — Explicitly Excluded Scope

Apple Watch/watchOS, complications, notifications, result history, Siri and Health integration are not Build 45 work and are not present in the approved T45/C45 backlog. They introduce persistence, paired-device transfer, sensitive lock-screen/voice surfaces, new platform permissions and a separate intended-use review. In particular, “last assessment” storage conflicts with the current no-persistence application boundary.

If the owner later requests watch support, create a separate discovery/specification after Build 45. It must establish intended user/use, data classification, on-device retention/deletion, notification privacy, pairing/loss/revocation behaviour, clinical wording, accessibility, OS/device availability and independent security/clinical review. No watch target, entitlement, dependency or timeline is included in Build 45.

---

## Part 7 — GitHub Integration and AI Agent Loop Setup

### 7.1 GitHub Repository Configuration

| Step | Action | Evidence |
|------|--------|----------|
| 7.1.1 | Verify existing public repository and exact Build 44 remote SHA | Read-only evidence |
| 7.1.2 | Propose `main` protection and required checks; owner/repository administrator applies only after reviewing impact | Approved rule record |
| 7.1.3 | Do not broadly protect every `feature/*` branch without a workflow test; use PR review and least-disruptive rules | Trial/rollback evidence |
| 7.1.4 | Propose source-only CI: active typecheck, mobile/gateway/platform tests where dependencies permit, schema/secret/privacy scans | Reviewed workflow diff; no secrets exposed to untrusted PRs |
| 7.1.5 | Native signing/build automation is out of the default CI scope. Add a manually authorised protected workflow only after signing-secret, runner, cost and artefact-retention review | Separate owner/security approval |
| 7.1.6 | GitHub Project/issues/templates are optional repository mutations and require owner approval before creation | Approved issue-import/template proposal |
| 7.1.7 | Never place clinical case bodies, invite records, device identifiers, credentials or private security findings in the public repository/issues/actions logs | Public-content review |
| 7.1.8 | PR template separates automated PASS, independent technical review, human clinical decision, security approval and distribution authority | Reviewed template |

### 7.2 GitHub Desktop Workflow

```bash
# Proposed daily workflow after branch publication is authorised
1. Open GitHub Desktop
2. Fetch origin to check for remote changes
3. Pull latest `feature/mobile-v0.6.5-build45`
4. Make changes in local working directory
5. Commit with descriptive message referencing T45-XX or C45-XX
6. Push to origin
7. Prepare a Pull Request when feature complete
8. Human owner merges only after independent review, required clinical decisions and required checks; CI PASS alone is insufficient
```

### 7.3 AI Agent Loop Configuration

AI agents may assist a locally controlled Build 45 loop. No external webhook/AI service, GitHub App, Project automation or permission grant is assumed. Any such integration needs a separate threat/privacy/permission review and owner authority.

| Component | Purpose | Setup |
|-----------|---------|-------|
| **Implementation agents** | Work on bounded, non-overlapping technical tasks from a fixed source SHA | Local agent loop; changes reviewed before integration |
| **Independent reviewer** | Reproduce tests, trace claims and return PASS/repair without editing the reviewed snapshot | Separate agent/person from implementer |
| **Clinical routing** | Mark C45 items blocked pending authorised human decision | No AI clinical decision/sign-off |
| **CI test runner** | If approved, run deterministic source tests and publish bounded logs | GitHub Actions with least privilege |
| **Documentation support** | Draft redacted evidence from actual results | Human-reviewed commit; no autonomous evidence claims |
| **Release preparation** | Produce an unsigned decision packet only | No tag/sign/build/deploy/distribute without human authority |

### 7.4 Autonomous Loop Rules

1. **No autonomous merge to `main`:** All merges require human approval
2. **No autonomous clinical decisions:** C45-XX items route to human clinical lead
3. **No autonomous deployment:** T45-11 requires explicit owner authority
4. **Testing is evidence-led:** Approved CI may test every PR; local tests remain required when platform/native hardware is unavailable to CI
5. **No autonomous evidence commit:** Raw `.acr-loop/` evidence stays private/ignored; only reviewed, redacted summaries enter `docs/loop/`
6. **No autonomous public issue mutation:** Triage suggestions require human review, especially clinical/security content

---

## Part 8 — Build 45 Partner Review Procedure

### 8.1 Stage A — Controlled Application Inspection

| Step | Action | Responsible | Evidence |
|------|--------|-------------|----------|
| A.1 | Provide exact unchanged Build 45 identity + written evaluation-only notice through the separately approved handoff route | Owner | Controlled handoff record |
| A.2 | Use synthetic cases only; no real-patient data | Reviewer | Signed undertaking |
| A.3 | Inspect: Poster, Welcome, invite/mode, 5 input screens, Review, Result, technical detail, languages, Arabic | Reviewer | Inspection checklist |
| A.4 | Exercise: Live, explicit synthetic, unavailable modes separately | Reviewer | Mode test record |
| A.5 | Record observations as interface/logic findings, not clinical acceptance | Reviewer | Findings document |

### 8.2 Stage B — Clinical Case Protocol Design

| Step | Action | Responsible | Evidence |
|------|--------|-------------|----------|
| B.1 | Approve intended user and intended use | Clinical Partners | Decision record |
| B.2 | Define inclusion/exclusion criteria and minimum facts | Clinical Partners | Protocol document |
| B.3 | Approve a wholly synthetic/non-patient reference-case set for Build 45 | Clinical Partners | Case-set origin and approval |
| B.4 | Define expected outputs and independent adjudication | Clinical Partners | Adjudication plan |
| B.5 | Define discrepancy severity and safety stop rules | Clinical Partners | Safety rules |
| B.6 | Define measures: subtype agreement, recommendation agreement, completeness, usability, explanation quality | Clinical Partners | Measures document |
| B.7 | Define indeterminate/missing data handling | Clinical Partners | Handling rules |
| B.8 | Define Bayes evaluation scope | Clinical Partners | Bayes evaluation plan |
| B.9 | If real clinical data is ever proposed, stop: create a separate later protocol, lawful basis/DPIA/ethics/information-governance decision and new technical authority; it is outside Build 45 | Clinical Partners + Governance | Separate future decision, not a Build 45 exception |

### 8.3 Stage C — Technical-Clinical Adjudication

| Step | Action | Responsible | Evidence |
|------|--------|-------------|----------|
| C.1 | Retain only approved synthetic case fixtures and adjudication in a separately governed evidence store; operational services remain non-persistent | Dev | Synthetic research artefact |
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
| **Direct Developer Install** | Very small supervised set | Apple Developer membership, registered device and valid provisioning | Device/product-family programme limits and expiring profiles; manual support |
| **Apple TestFlight** | Small-medium external testing | Apple Developer account, app review for external | 90-day expiry, 10,000 testers, review time |
| **Android Internal/Closed Testing** | Small-medium testing | Google Play Console, signed APK | Google Play policies, review time |
| **Android Signed APK** | Controlled distribution | Protected release keystore, provenance and secure delivery channel | Sideloading risk/warnings, manual update and revocation limitations |
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

## Part 10 — Gate-Based Milestones

Calendar promises are inappropriate until partner availability, platform-change authority, gateway provider/account ownership and actual devices are confirmed. Use evidence gates:

| Gate | Deliverable | Entry requirement | Exit evidence/human authority |
| --- | --- | --- | --- |
| **M0: Owner start** | Exact scope, branch and storage/toolchain plan | This v1.1 reviewed | Owner GO for branch; user files preserved |
| **M1: Reproducible baseline** | Dependencies restored from lockfiles; Build 44 tests reproduced | M0 | Source SHA, tool versions, baseline report |
| **M2: Clinical decisions opened** | C45 packets sent early, dependencies mapped | M0 | Decisions received or dependent code explicitly blocked |
| **M3: Platform safety** | T45-01/02 isolated tests; T45-03 log privacy; T45-04 contract | Platform edit/test authority | Independent review; no production test switch |
| **M4: Contract/refactor** | T45-05 and T45-07; contract version decision | M1 + relevant clinical input | Cross-layer tests and migration evidence |
| **M5: Gateway/security design** | T45-08/10 design and T45-11 Phase A ADR/threat model | M1 | Independent security review and owner GO/NO-GO for deployment |
| **M6: Gateway/remote implementation** | T45-08/10 and separately authorised T45-11 Phase B | M5 owner GO | Exact HTTPS endpoint, off-LAN failure/security tests; no distribution yet |
| **M7: Clinical result implementation** | T45-09/12 using approved C45 decisions | M2 decisions + M4 | Semantic web/mobile parity and accessibility review |
| **M8: Final frozen regression** | T45-06 on one candidate SHA | M3, M4, M6 if in candidate, M7 | Independent `G_COMPLETE=true`; otherwise Build 45 is blocked |
| **M9: Ordered native review** | Simulator first, then authorised physical iOS, then physical Android; no Android emulator | M8 | Exact artifacts/hashes and human visual/standalone/off-LAN evidence |
| **M10: Distribution decision** | Direct install/TestFlight/Play/MDM decision packet | M9 + clinical/security governance | Separate owner approval; implementation completion does not imply distribution |

Critical path: `M0 → M1 → (M2 in parallel) → M3/M4/M5 → owner gateway GO → M6/M7 → M8 → M9 → M10`.

---

## Part 11 — Evidence and Documentation Requirements

### 11.1 Private working evidence structure

```
.acr-loop/v1.7/build45/
├── planning/
│   └── ACR_MOBILE_BUILD45_FULL_IMPLEMENTATION_PLAN_v1.1.md (this document)
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

`.acr-loop/` remains Git-ignored. It is periodically checksum-verified and offloaded to approved external storage after source/artifact preservation. A separately reviewed, redacted summary is committed under `docs/loop/`; raw logs, invite/auth records, tunnel configuration, device identifiers, signing material and unredacted security findings are not published.

Every claim records command/test, exit status, source SHA, artefact hash, environment, implementer and independent reviewer. Automated, simulator, physical-human, clinical and security evidence are separate categories. `NOT TESTED` and `NOT ASSESSABLE` are permitted; invented PASS is not.

### 11.2 Required Sign-Offs

| Review | Required From | Evidence Location |
|--------|---------------|-------------------|
| Technical completion | Implementer + independent technical reviewer | `.acr-loop/v1.7/build45/technical/` |
| Clinical decisions | ZZU/UCD Partners | `.acr-loop/v1.7/build45/clinical/` |
| G_COMPLETE | Independent Reviewer | `.acr-loop/v1.7/build45/review/G-COMPLETE-REVIEW-002/` |
| Security (T45-11) | Security Reviewer | `.acr-loop/v1.7/build45/review/SECURITY-REVIEW-001/` |
| Distribution decision | Owner after technical/clinical/security packet | `.acr-loop/v1.7/build45/distribution/` |

---

## Part 12 — Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R01 | Clinical partner availability delays decisions | Medium | High | Start C45 discussions early; document interim positions |
| R02 | T45-11 security review finds critical issue | Medium | High | Phase A design review before implementation; budget time for rework |
| R03 | Multi-device testing reveals platform-specific bugs | High | Medium | Prioritize P0 devices; defer P2 if needed |
| R04 | iOS App Store / TestFlight rejection | Low | High | Evaluate route requirements early; no unapproved distribution fallback |
| R05 | Android fragmentation causes compatibility issues | Medium | Medium | Test on representative sample; use React Native abstraction |
| R06 | Backend API changes break mobile contract | Low | High | Version API; gateway abstraction layer; contract tests |
| R07 | Log privacy remediation is incomplete | Medium | Critical | Automated scanning; independent audit; fail CI on detection |
| R08 | Bayes presentation misleads users | Medium | High | Clinical sign-off on all text; user testing; explicit OFF states |
| R09 | Remote-review gateway compromised | Low | Critical | Threat model; independent security review; no deployment without approval |
| R10 | Build 45 scope creep delays release | High | Medium | Strict backlog adherence; defer non-critical items to Build 46 |
| R11 | Public repository exposes invite/tunnel/device/security material | Medium | Critical | Allowlisted commits, secret/privacy scans, private raw evidence, human review |
| R12 | Current Mac/power/ISP/tunnel is unavailable to remote reviewers | High | High | Truthful evaluation-only availability, monitoring/restart runbook, planned later managed host |
| R13 | Invite endpoint is brute-forced or shared | Medium | High | High entropy, slow salted verifier, rate limits, short activation, individual revocation |
| R14 | Stale connectivity status appears healthy | Medium | High | Freshness-bounded attestation and submit-time fail-closed recheck |
| R15 | Same backend but different network route behaves differently | Medium | High | ADR selects exact route; contract plus public/loopback route parity tests |
| R16 | Storage/toolchain regeneration blocks native builds | Medium | Medium | Preflight capacity, external Android SDK/cache, lockfiles, serial builds and artifact-first cleanup |
| R17 | “De-identified” real data enters evaluation workflow | Medium | Critical | Wholly synthetic/non-patient Build 45 policy; stop and require separate governance for real data |

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

## Appendix D — v1.1 Review Disposition

The v1.0 proposal had strong coverage of all 23 backlog items, explicit human merge/clinical/deployment limits, a useful partner review structure and the correct decision to split T45-11 design from implementation. v1.1 preserves those strengths and corrects the following material issues:

- exact Build 44 routes and the complete 20-input nested contract replace invented endpoints and partial pseudo-types;
- the remote gateway is described as a separate HTTPS edge/tunnel to loopback T3, with a required upstream-route ADR and genuine off-LAN tests;
- invitation administration is not publicly exposed and hardware fingerprinting is prohibited;
- clinical data is prohibited from all operational log levels, not allowed at DEBUG/TRACE;
- wholly synthetic/non-patient data replaces ambiguous “de-identified” real cases;
- verified devices replace unevidenced device assumptions, and the no-Android-emulator constraint is retained;
- Apple Watch/history/Siri/Health scope is removed from Build 45;
- GitHub/CI/AI automation, tags, projects, deployment and distribution are explicit owner-gated mutations;
- arbitrary test counts and 127-day predictions are replaced by coverage and evidence gates; and
- private raw evidence is separated from redacted public documentation.

*End of revised Implementation Plan*
*Document revised: 2 September 2026*
*Next review: owner review of v1.1 and explicit M0 GO/NO-GO; no implementation action is implied.*
