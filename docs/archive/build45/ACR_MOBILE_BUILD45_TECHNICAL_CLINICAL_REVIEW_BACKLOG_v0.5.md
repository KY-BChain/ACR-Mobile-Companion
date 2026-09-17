# ACR Mobile v0.6.5 Build 45 — Technical and Clinical Review Backlog

**Status:** DRAFT — TECHNICAL CORRECTION REQUIRED
**Prepared:** 8 September 2026
**Predecessor physically reviewed:** ACR Mobile v0.6.0 Build 44
**Proposed refinement:** ACR Mobile v0.6.5 Build 45
**Version:** 0.5

---

## 1. Purpose and decision boundary

This document groups the unresolved technical safety work and the clinical‑process questions that should be reviewed after selected partners can inspect **Build 45**. It is a review and refactoring backlog, not a clinical validation, release approval, distribution decision or claim that Phase G passed.

Kraken explicitly directed that the remaining Phase G checks be deferred to v0.6.5 Build 45, if Build 44 can first be installed and inspected on the authorised iPhone 13 and Samsung device. This is an owner‑directed sequencing exception. The independent Phase G result remains **FAIL / `G_COMPLETE=false`** and must not be rewritten as PASS.

Build 44 remains an evaluation build. It must use synthetic demonstration data or explicitly authorised non‑patient test cases only. It is not approved for diagnosis, treatment decisions, real‑patient entry, public distribution or unsupervised clinical use.

The governing ACR Platform design principle is **“Data Stays. Rules Travel.”** No real‑patient record or direct personal identifier is to enter the ACR Platform. The mobile assessment supplies only the bounded clinical facts represented by the 20 fields on its five screens for the ACR Ontology/SWRL/Openllet reasoner to process and infer. Those clinical facts must remain separated from names, email addresses, hospital identifiers, addresses, contact details and other identifying information. Any future trial protocol or distribution route must preserve this boundary and define where the originating clinical record remains, how the bounded facts are minimised, and how requests/results are retained or discarded.

---

## 2. Build 44 evidence available to reviewers

Build 44 provides:

- five mobile input screens transporting 20 clinical/control fields;
- Review and clinical‑first Result screens, with optional technical detail;
- live delivery through the same ACR Platform `/api/infer` backend used by the website;
- current Openllet/SWRL reasoning and optional Bayesian output supplied by that backend;
- an explicit, immutable synthetic replay captured from the real platform;
- truthful delivery labels: `LIVE_REASONER`, `PLATFORM_FALLBACK`, or `LOCAL_SYNTHETIC_DEMO / NOT_EXECUTED`;
- fail‑closed behaviour when the gateway/backend is unavailable; and
- eight languages and Arabic RTL/LTR behaviour.

Completed Phase G evidence includes substantive Bayes ON/OFF direct‑to‑gateway parity, fixture capture/review/promotion/revalidation, exact replay, edited/unknown refusal, failure separation, 157/157 gateway tests and 79/79 targeted platform tests. The independent review is recorded at `.acr-loop/v1.6/acr-mobile-cds-parity-v1.6-20260831T074903Z/reviewer/G-COMPLETE-REVIEW-001/review.md`.

---

## 3. Pre‑Distribution Blockers (must be completed before partner review)

The following items must be completed before Build 45 is distributed to partners.

| ID | Required Build 45 work | Completion evidence |
| --- | --- | --- |
| T45‑01 | Execute the same complete synthetic fixture through Openllet/SWRL and the existing Java fallback in an isolated exact‑source test facility | Independently repeated comparison of subtype, risk, treatments, biomarkers, rules, explanations, completeness and Bayes; all differences enumerated |
| T45‑02 | Force an actual `BayesianEnhancer` exception in an isolated exact‑source test facility | Prove platform failure representation and gateway fail‑closed handling without partial or invented clinical output |
| T45‑04 | Define the `firedRules[]` ordering contract | Platform contract states whether order is meaningful; deterministic ordering added only if clinically/technically required |
| T45‑05 | Complete website/mobile canonical‑fact parity design | Approved mapping identifying shared, mobile‑only and website‑only facts and controlled evaluation context |
| T45‑06 | Re‑run full Phase G and Build 44 regressions on the Build 45 frozen snapshot | Independent `G_COMPLETE=true` only after every mandatory family passes; no failed check relabelled pending |
| T45‑08 | Define per‑invitee access administration – see Section 10 | Named code issuer/controller, unique code policy, expiry/revocation, audit metadata, lost‑code procedure and no plaintext source storage |
| T45‑10 | Separate gateway reachability from live‑platform availability in connection UI | Display distinct states such as `Gateway connected — Live Platform offline`, keep live submission fail‑closed, explain that explicit verified synthetic replay can remain available through the gateway, and never imply that the phone performs local clinical inference |
| T45‑11 | Design secure remote‑review gateway and endpoint mobility – see Section 10 | Approved architecture/operations record, security review, exact endpoint and certificate posture, multi‑invite tests, regional reachability results, clean privacy/log scans, failure‑mode tests, rebuilt physical apps and controlled distribution approval |

### Platform Log‑Privacy Item (Separate Backlog)

**T45‑03 (Platform portion):** Remove identifiers, submitted facts and derived clinical/result values from operational INFO logs in the ACR Platform.

**Treatment:** This item is not a mandatory completion gate for Build 45. If platform log remediation is required, it must be performed in an isolated platform branch/worktree with explicit owner authorisation and independent security review. The gateway and mobile log‑privacy tests (ensuring that no clinical data is logged at the gateway or mobile layers) remain mandatory before Build 45 distribution.

**Gateway and mobile log‑privacy evidence:** Sentinel identifiers, all 20 submitted clinical/processing inputs, derived subtype/risk/recommendation/rule/Bayes/result values and bodies are absent from gateway and mobile INFO/WARN/ERROR logs and routine storage; only approved redacted metadata remains; exception paths tested; functional output unchanged; independent source/runtime/log‑capture review.

---

## 4. Partner Review Questions (C45‑01–C45‑11)

These are **outputs** of the partner review, not prerequisites. They will be answered after partners inspect Build 45.

| ID | Question requiring clinical advice | Decision needed for Build 45 |
| --- | --- | --- |
| C45‑01 | What is the governed tumour‑size unit? | Confirm unit, UI label, allowed precision/range and whether conversion is ever permitted |
| C45‑02 | Are tumour size and stage optional for entry, inference, or both? | Define minimum dataset, incomplete‑case result policy and user‑facing explanation |
| C45‑03 | Which backend field is the authoritative patient‑facing risk grade? | Define risk source, allowed labels, relationship to deterministic risk and incomplete cases |
| C45‑04 | How should risk colour be governed? | Approve grade‑to‑colour mapping, accessibility contrast, non‑colour cues and handling of unknown/incomplete results |
| C45‑05 | How should tumour stage be linked to tumour size and nodal facts? | Decide whether the UI should provide guidance, validation or links without calculating stage |
| C45‑06 | Is the HER2‑low mapping clinically adequate? | Define distinct not‑tested/unknown/indeterminate states and backend contract |
| C45‑07 | What should be shown for fields with no active consumer? | Decide whether to retain for future use, disclose non‑influence, or remove from the assessment |
| C45‑08 | How should Bayesian output and its patient‑facing percentage be described? | Approve terminology, conversion/rounding, explanation, visibility/default, OFF/unavailable behaviour and limits; display only an actual backend value and avoid overstating certainty or attributing it to SWRL rule firing |
| C45‑09 | What is the appropriate patient‑facing result hierarchy? | Review subtype wording, warnings, recommendations, supporting rules, provenance and escalation language against the website |
| C45‑10 | Are recommendations informational, decision support, or trial‑only observations? | Define intended use, accountable clinician role, contraindication checks and mandatory disclaimer/stop conditions |
| C45‑11 | Which web result elements and visual semantics are clinically authoritative for mobile parity? | Approve a web‑to‑mobile presentation matrix, exact labels/order, authoritative backend fields, risk‑grade colours plus non‑colour cues, missing/incomplete states, recommendation hierarchy, Bayes wording and which technical elements remain optional; prohibit copying web‑only fallback inference or frontend‑derived clinical logic into mobile/T3 |

---

## 5. Post‑Review Refinements (Build 46)

The following items depend on clinical decisions (C45‑01–C45‑11) and will be implemented in **v0.6.6 Build 46**, not Build 45.

| ID | Required work | Completion evidence |
| --- | --- | --- |
| T45‑09 | Add governed patient‑facing Bayesian percentage presentation | Display a percentage only from a valid backend Bayes‑enabled response; approve label, conversion from 0–1, rounding, placement, accessibility and explicit OFF/unavailable states; never describe SWRL rule firing itself as probabilistic |
| T45‑12 | Mirror the web ACR Pathway's clinical‑result information design in the mobile clinical‑first result | From one identical validated backend response, web and mobile show the same authoritative clinical meaning and section hierarchy; HIGH uses governed red, INTERMEDIATE governed amber/orange, LOW governed green and unknown/incomplete governed neutral styling only after C45‑03/C45‑04 approval; every colour has text/icon/non‑colour cues and accessible contrast; actual backend Bayes percentage/bounds appear only under C45‑08; subtype, completeness, missing‑data warning, recommendations, supporting reasoning and provenance are parity‑tested; technical trace remains optional; eight‑language/RTL, screen‑reader, Dynamic Type/font scaling and S8/iPhone13/folded‑unfolded layouts independently pass |

---

## 6. Maintenance Item

| ID | Required Build 45 work | Completion evidence |
| --- | --- | --- |
| T45‑07 | Resolve or formally retire inactive TypeScript legacy diagnostics | Delete/migrate/archive through an approved refactor, or document a maintained exclusion boundary without weakening strictness |

---

## 7. Proposed partner review procedure

### Stage A — controlled application inspection

1. Provide the **Build 45** identity and a written evaluation‑only notice.
2. Use synthetic cases only. Do not enter names, hospital identifiers, contact details or other real‑patient facts.
3. Inspect Poster, Welcome, invite/mode selection, all five input screens, Review, clinical‑first Result, optional technical detail, language switching and Arabic direction.
4. Exercise live, explicit synthetic and unavailable modes separately. Record the displayed delivery/reasoning mode.
5. Capture observations as interface/logic findings, not clinical acceptance.

### Stage B — clinical case protocol design

Clinical partners should approve before any formal study:

- the intended user and intended use;
- inclusion/exclusion criteria and minimum required facts;
- a synthetic or properly governed de‑identified reference‑case set;
- expected outputs and an independent clinical adjudication method;
- discrepancy severity categories and safety stop rules;
- measures for subtype agreement, recommendation agreement, completeness, usability and explanation quality;
- treatment of indeterminate/missing data and disagreement between reasoners;
- whether Bayes is evaluated separately from deterministic inference; and
- ethics, consent, information‑governance and retention requirements if real clinical data is ever proposed.

### Stage C — technical‑clinical adjudication

Each case should retain input facts, backend/assets identity, result mode, reasoning mode, rule IDs/descriptions, warnings/recommendations, Bayes setting/output and reviewer decision in a separately governed synthetic/non‑patient research adjudication artefact. Its purpose, authorised access, storage location, retention and deletion schedule must be explicit.

**Gateway and mobile operational logs must contain no submitted clinical facts or derived result values.** The known ACR Platform logging defect (T45‑03) is a separate platform backlog item. Build 45 partner review remains strictly synthetic/non‑patient until that remediation is independently completed.

Two qualified reviewers should assess material discrepancies independently, with a defined third‑reviewer resolution process. No mobile or gateway component may silently repair a clinical‑engine difference.

### Stage D — Build 45 acceptance

Build 45 should not advance beyond controlled review until the pre‑distribution blockers (Section 3) are completed. The clinical decisions (Section 4) are expected as outputs of the review, and the post‑review refinements (Section 5) will be implemented in Build 46. Formal clinical validation, remote external‑review authority and software release approval remain separate decisions.

---

## 8. Distribution route decision still required

No distribution action is authorised by this document. Kraken and partners must choose the route after considering device count, reviewer identity, revocation, expiry, update control, crash/telemetry policy, regional privacy requirements and Apple/Google programme constraints.

Candidate routes to assess include:

- direct developer‑installed builds for a very small supervised device set;
- Apple TestFlight external/internal testing and the corresponding review/account requirements;
- Android internal/closed testing, managed distribution or controlled signed APK installation; and
- institutional MDM only if partner governance supports it.

The decision record must name the build owner, signing/account owner, authorised invitees/devices, code issuer, start/end date, update/revocation procedure, support contact, permitted data, evidence retention and incident response. Public App Store/Play publication, OTA updates, new deployment, clinician dispatch and general distribution remain outside the current authority.

---

## 9. Build 44 physical‑review exception and limits

Kraken has explicitly deferred the unresolved Phase G work to Build 45 and requested Build 44 physical installation first if technically possible. This permits the serial physical‑review programme to continue as an owner‑directed exception, but it does not:

- change `G_COMPLETE=false`;
- waive the known platform log privacy defect;
- approve real‑patient use or external distribution;
- constitute clinical acceptance;
- authorise platform source/configuration repair; or
- authorise deployment, publication, distribution or a new tunnel.

After physical review and preservation, Kraken separately authorised local Git/GitHub finalisation and online source push on 2 September 2026. That later authority applies only to preserving the reviewed source branch in the existing public repository; it does not approve merge, deployment, release, distribution or clinical use.

Before each physical review, the reviewer must acknowledge that Build 44 is for controlled synthetic evaluation only. The established order remains iPhone 13 first, standalone relaunch confirmation second, then AndroidDev/Samsung verification and Android build/install; no Android emulator.

---

## 10. Token‑Based Authentication Implementation (Phase 2)

This section defines the **requirements and acceptance tests** for a privacy‑preserving, invitation‑based authentication system for Build 45. It directly addresses:

- **T45‑08** (per‑invitee access administration)
- **T45‑11** (secure remote‑review gateway and endpoint mobility)

**Scope:** This implementation is for the **React Native iOS/Android mobile app only**. The WeChat Mini‑Program authentication will be defined in a separate backlog, while sharing the same gateway/API contract.

### 10.1 Authorisation to Proceed

The Codex/DSH/Claude Code opening instruction **must explicitly authorise implementation and controlled testing of the dedicated Build 45 HTTPS gateway**. If no such authority is given, the implementation **must stop at T45‑11** and wait for written confirmation.

### 10.2 Requirements

| ID | Requirement |
|----|-------------|
| AUTH‑01 | Each invited tester receives a **one‑time, short‑expiry invitation code** (e.g., 7‑day validity, 8–12 alphanumeric characters). |
| AUTH‑02 | The invitation code is **exchanged** for an **access token** (15‑minute lifetime) and a **refresh token** (valid until the review end date, e.g., 30 days). |
| AUTH‑03 | Access tokens are stored **only in memory** on the client device. Refresh tokens are stored **securely**: iOS Keychain / Android Keystore. |
| AUTH‑04 | Each refresh token is **bound** to: the individual tester, Build 45, and the specific app install. |
| AUTH‑05 | The server maintains **structured session records** (not a simple hash list). Sessions are indexed by token identifier for constant‑time lookup. |
| AUTH‑06 | **Revocation** is immediate via server‑side session invalidation. |
| AUTH‑07 | **Refresh‑token reuse detection** triggers automatic revocation of all tokens for that user. |
| AUTH‑08 | **Rate limiting** is applied before authentication to prevent brute‑force attacks on invitation codes. |
| AUTH‑09 | **No token or token‑hash prefix** appears in audit logs. Only a session identifier (redacted) may be logged. |
| AUTH‑10 | **Persistent session storage** (database or Redis) is required; in‑memory storage is not acceptable. |
| AUTH‑11 | **Constant‑time verification** is used for access and refresh tokens. |
| AUTH‑12 | **Invitation codes** are hashed using bcrypt (or equivalent slow hash) before storage. |
| AUTH‑13 | **Access and refresh tokens** are stored as securely hashed or token‑digested values, never in plaintext. |
| AUTH‑14 | **Expiry** is enforced for all tokens (15 min access, 30 day refresh). |
| AUTH‑15 | **No automatic live‑to‑synthetic fallback** occurs on authentication failure. |
| AUTH‑16 | All requests are **TLS‑only** (HTTPS). |

### 10.3 Acceptance Tests

| Test ID | Test Case | Pass / Fail Criteria |
|---------|-----------|----------------------|
| AT‑01 | Valid invitation code | Exchange returns access token (15 min) and refresh token (30 days). |
| AT‑02 | Invalid invitation code | Exchange returns 401, no tokens issued. |
| AT‑03 | Expired invitation code | Exchange returns 401, no tokens issued. |
| AT‑04 | Access token expiry | After 15 min, API request with expired token returns 401. |
| AT‑05 | Refresh token expiry | After 30 days, refresh returns 401. |
| AT‑06 | Refresh token rotation | Refresh token can be exchanged for a new access token and a new refresh token. |
| AT‑07 | Refresh token reuse detection | Reuse of an old refresh token revokes all tokens for that user. |
| AT‑08 | Revocation | Admin revokes session; subsequent access token requests fail. |
| AT‑09 | Rate limiting | 10 failed attempts in 1 minute blocks further attempts for 5 minutes. |
| AT‑10 | No token in logs | All authentication logs are scanned; no token or hash appears. |
| AT‑11 | Persistent storage | Restart server; active sessions remain valid. |
| AT‑12 | Constant‑time verification | Code inspection confirms equal‑length token digests are compared using the platform’s constant‑time comparison function; statistical testing finds no material token‑validity timing distinction. |
| AT‑13 | Binding | A refresh token from one device cannot be used on another device. |
| AT‑14 | TLS only | HTTP requests are rejected. |
| AT‑15 | Invitation code reuse | An already redeemed invitation code cannot be reused. |
| AT‑16 | Revocation endpoint protection | The revocation endpoint rejects requests that are not properly authorised (admin‑only). |
| AT‑17 | Concurrent refresh | Two simultaneous refresh attempts with the same refresh token result in only one valid session; the other attempt is rejected. |
| AT‑18 | Malformed tokens | Malformed and oversized tokens are rejected with a 400 or 401 response. |
| AT‑19 | No plaintext secrets | Session/token records contain no plaintext secrets; all secrets are hashed or token‑digested. |

### 10.4 T45‑11 Secure Remote‑Review Gateway Constraints

The implementation must satisfy the following constraints:

- **Do not** embed the Mac's current public IP address in the app, DNS record, invitation or operating procedure. It may change with ISP/network/location and is not an authentication boundary.
- **Do not** expose T3 with router port‑forwarding, UPnP, a raw public TCP listener or direct HTTP. Use only an approved outbound authenticated tunnel to a dedicated HTTPS mobile‑gateway hostname, separate from the existing platform API route and independently revocable.
- **Bind** the gateway origin to loopback or another narrowly controlled local interface; the public edge terminates modern TLS and forwards only the required gateway routes. Retain request‑size limits, strict JSON/schema validation, build/device binding, refresh rotation/reuse revocation, rate limiting and fail‑closed backend/evidence checks.
- **Rebuild** iOS and Android with one approved `https://` gateway endpoint, no cleartext exception, no endpoint editor, no direct platform bypass and no automatic Live‑to‑Demonstration fallback. Define certificate‑rotation and rollback handling; do not add brittle pinning without a reviewed backup‑pin/renewal process.
- **Complete** T45‑08 first: unique invite per named evaluator/device, short activation window, expiry, redemption limit, individual revocation, lost‑code response and minimal non‑clinical audit metadata. Store no plaintext invite; use a reviewed slow password hash or keyed verification design appropriate to human‑entered codes rather than relying only on unsalted fast SHA‑256.
- **Keep** access and refresh tokens short‑scoped, device/build‑bound and revocable. Store server secrets outside Git, app bundles, documents and command history. Define restart recovery without silently accepting old or unknown sessions.
- **Apply Data Stays. Rules Travel**: no real‑patient record or direct identifier; selected‑review testing remains synthetic or explicitly authorised non‑patient. Do not log request/response bodies, the 20 clinical facts, results, tokens or invite plaintext. Redact correlation data and define minimal retention/deletion.
- **Preserve** the exact same‑backend architecture: only the platform performs Ontology/SWRL/Openllet, Java aggregation and optional Bayes; the mobile gateway performs transport/authentication/validation only.
- **Document** current‑Mac availability limits by mode: Live Platform requires the Mac, Spring Boot, existing platform tunnel, gateway and mobile‑gateway tunnel to be awake/healthy; explicit verified Synthetic Demonstration requires the Mac, gateway and mobile‑gateway tunnel only and must truthfully report the platform unavailable without becoming a hidden Live fallback. Restart procedures and health monitoring are explicit; this is not production SLA infrastructure.
- **Independently assess** EU/EEA, UK, Ireland, Japan, HKSAR and China connectivity, privacy, institutional and export/security constraints. In particular, do not promise Cloudflare or app‑distribution reachability in mainland China without an observed test and approved regional route.
- **Threat‑model and independently test** TLS, authentication, rate limits, replay/revocation, log privacy, backend outage, tunnel outage, DNS/certificate rotation, Mac restart, travel/network change and recovery before any external evaluator receives the build.
- **Keep** later VPS/ISP migration possible through configuration/build‑time endpoint governance, but do not introduce runtime endpoint switching or hidden fallback.

Completion evidence must include an approved architecture/operations record, security review, exact endpoint and certificate posture, multi‑invite tests, regional reachability results (including explicit NOT ASSESSABLE where applicable), clean privacy/log scans, failure‑mode tests, rebuilt physical apps and controlled distribution approval. It must not be inferred from the existing website tunnel working.

No Build 45 repair may introduce a production fallback switch, new clinical classifier, copied mobile reasoner or hidden automatic synthetic fallback. No current Build 44 action or ordinary Build 45 code repair may deploy or activate a new public tunnel; T45‑11 may design one, and any implementation/test requires separate explicit owner authority, security review and operational evidence.

---

## 11. Version Sequence

| Phase | Build | Description |
|-------|-------|-------------|
| 1 | **v0.6.5 Build 45** | Pre‑distribution blockers completed. Controlled partner review build (iOS/Android). |
| 2 | Partner review | Partners inspect Build 45. Clinical decisions (C45‑01–C45‑11) are recorded as outputs. |
| 3 | **v0.6.6 Build 46** | Post‑review refinements (T45‑09, T45‑12) and any changes from C45‑01–C45‑11 are implemented. Revised review/acceptance build. |
| 4 | Final acceptance | Build 46 is reviewed and accepted for intended use. |

---

## 12. Implementation Gates (Build 45 iOS/Android)

The following gates apply to the **React Native iOS/Android** implementation only. The WeChat Mini‑Program will be defined in a separate backlog.

1. **Gate 0**: Blueprint (this document) – approved.
2. **Gate 1**: Fix translation system (switch from WXS to JS – **This gate applies only to the WeChat Mini‑Program and is therefore removed from this backlog. The React Native app already uses JS‑based translation.**)
3. **Gate 2**: Welcome + Poster (React Native).
4. **Gate 3**: Gateway (React Native).
5. **Gate 4**: Step1–3 (React Native).
6. **Gate 5**: P1 + P2 (React Native).
7. **Gate 6**: Review (React Native).
8. **Gate 7**: Result + Fail (React Native).
9. **Gate 8**: About (React Native).
10. **Gate 9**: Polish (navigation bar, styling, language modal – React Native).
11. **Gate 10**: Token Authentication Implementation (Section 10 – React Native only).

---

## 13. WeChat Mini‑Program Relationship

The WeChat Mini‑Program is a separate project. Its implementation backlog will be defined separately, and it will share:

- The same backend API contract (invitation code exchange, access/refresh tokens, inference endpoint).
- The same authentication requirements (Section 10).
- The same gateway endpoint (T45‑11).

The WeChat implementation will not be part of Build 45 or Build 46. It will follow its own timeline and review process.

---

## 14. Next Steps

1. Project owner reviews and approves v0.5.
2. Codex/DSH opening instruction **must explicitly authorise implementation and controlled testing of the dedicated Build 45 HTTPS gateway**.
3. Implementation proceeds sequentially through Gates 2–10 (excluding Gate 1).
4. Build 45 is distributed to partners for controlled review.
5. Partner review outputs (C45‑01–C45‑11) are collected.
6. Post‑review refinements (T45‑09, T45‑12) are implemented in Build 46.
7. Build 46 is reviewed for final acceptance.

---

**END OF DOCUMENT**