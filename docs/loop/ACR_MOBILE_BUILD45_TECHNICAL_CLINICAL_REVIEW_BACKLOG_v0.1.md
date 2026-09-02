# ACR Mobile v0.6.5 Build 45 — Technical and Clinical Review Backlog

Status: **DRAFT FOR KRAKEN AND CLINICAL-TRIAL PARTNER REVIEW**
Prepared: 1 September 2026
Predecessor under device review: ACR Mobile v0.6.0 Build 44
Proposed refinement: ACR Mobile v0.6.5 Build 45

## 1. Purpose and decision boundary

This document groups the unresolved technical safety work and the clinical-process questions that should be reviewed after selected partners can inspect Build 44. It is a review and refactoring backlog, not a clinical validation, release approval, distribution decision or claim that Phase G passed.

Kraken explicitly directed that the remaining Phase G checks be deferred to v0.6.5 Build 45, if Build 44 can first be installed and inspected on the authorised iPhone 13 and Samsung device. This is an owner-directed sequencing exception. The independent Phase G result remains **FAIL / `G_COMPLETE=false`** and must not be rewritten as PASS.

Build 44 remains an evaluation build. It must use synthetic demonstration data or explicitly authorised non-patient test cases only. It is not approved for diagnosis, treatment decisions, real-patient entry, public distribution or unsupervised clinical use.

The governing ACR Platform design principle is **“Data Stays. Rules Travel.”** No real-patient record or direct personal identifier is to enter the ACR Platform. The mobile assessment supplies only the bounded clinical facts represented by the 20 fields on its five screens for the ACR Ontology/SWRL/Openllet reasoner to process and infer. Those clinical facts must remain separated from names, email addresses, hospital identifiers, addresses, contact details and other identifying information. Any future trial protocol or distribution route must preserve this boundary and define where the originating clinical record remains, how the bounded facts are minimised, and how requests/results are retained or discarded.

## 2. Build 44 evidence available to reviewers

Build 44 provides:

- five mobile input screens transporting 20 clinical/control fields;
- Review and clinical-first Result screens, with optional technical detail;
- live delivery through the same ACR Platform `/api/infer` backend used by the website;
- current Openllet/SWRL reasoning and optional Bayesian output supplied by that backend;
- an explicit, immutable synthetic replay captured from the real platform;
- truthful delivery labels: `LIVE_REASONER`, `PLATFORM_FALLBACK`, or `LOCAL_SYNTHETIC_DEMO / NOT_EXECUTED`;
- fail-closed behaviour when the gateway/backend is unavailable; and
- eight languages and Arabic RTL/LTR behaviour.

Completed Phase G evidence includes substantive Bayes ON/OFF direct-to-gateway parity, fixture capture/review/promotion/revalidation, exact replay, edited/unknown refusal, failure separation, 157/157 gateway tests and 79/79 targeted platform tests. The independent review is recorded at `.acr-loop/v1.6/acr-mobile-cds-parity-v1.6-20260831T074903Z/reviewer/G-COMPLETE-REVIEW-001/review.md`.

## 3. Deferred Build 45 technical safety work

| ID | Required Build 45 work | Present evidence/risk | Completion evidence |
| --- | --- | --- | --- |
| T45-01 | Execute the same complete synthetic fixture through Openllet/SWRL and the existing Java fallback in an isolated exact-source test facility | No safe existing trigger was available without changing frozen assets/runtime state | Independently repeated comparison of subtype, risk, treatments, biomarkers, rules, explanations, completeness and Bayes; all differences enumerated |
| T45-02 | Force an actual `BayesianEnhancer` exception in an isolated exact-source test facility | Gateway rejects degraded/partial Bayes responses, but the platform exception path was not executed | Prove platform failure representation and gateway fail-closed handling without partial or invented clinical output |
| T45-03 | Remove identifiers, submitted facts and derived clinical/result values from operational INFO logs | Current backend evidence found generated patient/correlation identifiers at INFO in `InferenceController`, `ReasonerService`, `BayesianEnhancer` and `ACRSWRLAuditLogger`, plus derived subtype/reasoning-mode/Bayes-confidence values in `ReasonerService`/`ClinicalOutputAssembler`; even synthetic/non-patient values must not become routine operational telemetry | Sentinel identifiers, all 20 submitted clinical/processing inputs, derived subtype/risk/recommendation/rule/Bayes/result values and bodies are absent from INFO/WARN/ERROR logs and routine storage across platform, gateway and mobile; only approved redacted metadata remains; exception paths tested; functional output unchanged; independent source/runtime/log-capture review |
| T45-04 | Define the `firedRules[]` ordering contract | Separate identical Bayes-OFF executions returned the same rules in different order; gateway preserved each response | Platform contract states whether order is meaningful; deterministic ordering added only if clinically/technically required |
| T45-05 | Complete website/mobile canonical-fact parity design | Website exposes 15 comparable controls while mobile transports 20; absent website facts were not invented | Approved mapping identifying shared, mobile-only and website-only facts and controlled evaluation context |
| T45-06 | Re-run full Phase G and Build 44 regressions on the Build 45 frozen snapshot | Build 44 automated surface passes, but the three blocking items above remain | Independent `G_COMPLETE=true` only after every mandatory family passes; no failed check relabelled pending |
| T45-07 | Resolve or formally retire inactive TypeScript legacy diagnostics | Active graph is clean; full repository typecheck retains 250 reviewed inactive/archived diagnostics | Delete/migrate/archive through an approved refactor, or document a maintained exclusion boundary without weakening strictness |
| T45-08 | Define per-invitee access administration | Build 44 uses an owner-supplied invite code represented at the gateway by a hash; it is not yet a multi-invitee governance system | Named code issuer/controller, unique code policy, expiry/revocation, audit metadata, lost-code procedure and no plaintext source storage |
| T45-09 | Add governed patient-facing Bayesian percentage presentation | Build 44 can receive the optional backend Bayesian confidence value, but the physical review did not show the expected `xx%` presentation after the explained deterministic result | Display a percentage only from a valid backend Bayes-enabled response; approve label, conversion from 0–1, rounding, placement, accessibility and explicit OFF/unavailable states; never describe SWRL rule firing itself as probabilistic |
| T45-10 | Separate gateway reachability from live-platform availability in connection UI | In standalone iPhone review with Spring/Cloudflare stopped, the Wi-Fi gateway correctly remained reachable and the welcome state said connected, while Live Platform commit correctly failed closed as server unavailable; the two states appeared contradictory | Display distinct states such as `Gateway connected — Live Platform offline`, keep live submission fail-closed, explain that explicit verified synthetic replay can remain available through the gateway, and never imply that the phone performs local clinical inference |
| T45-11 | Design secure remote-review gateway and endpoint mobility, dependent on T45-08 invite governance | Build 44 is frozen to private LAN `192.168.1.94:3001`; an invitation code grants authentication but cannot make that RFC1918 route reachable to evaluators in another country or network | Decide approved HTTPS gateway hosting/routing and regional posture; rebuild mobile network policy for the approved endpoint; implement T45-08 managed per-invitee access; retain same-backend validation and fail-closed behaviour; define availability, secrets, retention, incident response and rollback; independently security-review before any external distribution |
| T45-12 | Mirror the web ACR Pathway's clinical-result information design in the mobile clinical-first result | Build 44 presents a clinical-first summary but physical review found missing/neutral risk presentation, absent governed grade colour and missing visible backend Bayes percentage; the website has richer subtype, risk, warning, recommendation, reasoning, confidence and provenance presentation | From one identical validated backend response, web and mobile show the same authoritative clinical meaning and section hierarchy; HIGH uses governed red, INTERMEDIATE governed amber/orange, LOW governed green and unknown/incomplete governed neutral styling only after C45-03/C45-04 approval; every colour has text/icon/non-colour cues and accessible contrast; actual backend Bayes percentage/bounds appear only under C45-08; subtype, completeness, missing-data warning, recommendations, supporting reasoning and provenance are parity-tested; technical trace remains optional; eight-language/RTL, screen-reader, Dynamic Type/font scaling and S8/iPhone13/folded-unfolded layouts independently pass |

### T45-11 interim secure remote-review design constraints

Build 45 must support the small, named reviewer group without assuming that a VPS/ISP migration is available. The interim current-Mac option is a design candidate, not an authorised deployment. Its review must require all of the following:

- Do not embed the Mac's current public IP address in the app, DNS record, invitation or operating procedure. It may change with ISP/network/location and is not an authentication boundary.
- Do not expose T3 with router port-forwarding, UPnP, a raw public TCP listener or direct HTTP. Use only an approved outbound authenticated tunnel to a dedicated HTTPS mobile-gateway hostname, separate from the existing platform API route and independently revocable.
- Bind the gateway origin to loopback or another narrowly controlled local interface; the public edge terminates modern TLS and forwards only the required gateway routes. Retain request-size limits, strict JSON/schema validation, build/device binding, refresh rotation/reuse revocation, rate limiting and fail-closed backend/evidence checks.
- Rebuild iOS and Android with one approved `https://` gateway endpoint, no cleartext exception, no endpoint editor, no direct platform bypass and no automatic Live-to-Demonstration fallback. Define certificate-rotation and rollback handling; do not add brittle pinning without a reviewed backup-pin/renewal process.
- Complete T45-08 first: unique invite per named evaluator/device, short activation window, expiry, redemption limit, individual revocation, lost-code response and minimal non-clinical audit metadata. Store no plaintext invite; use a reviewed slow password hash or keyed verification design appropriate to human-entered codes rather than relying only on unsalted fast SHA-256.
- Keep access and refresh tokens short-scoped, device/build-bound and revocable. Store server secrets outside Git, app bundles, documents and command history. Define restart recovery without silently accepting old or unknown sessions.
- Apply **Data Stays. Rules Travel**: no real-patient record or direct identifier; selected-review testing remains synthetic or explicitly authorised non-patient. Do not log request/response bodies, the 20 clinical facts, results, tokens or invite plaintext. Redact correlation data and define minimal retention/deletion.
- Preserve the exact same-backend architecture: only the platform performs Ontology/SWRL/Openllet, Java aggregation and optional Bayes; the mobile gateway performs transport/authentication/validation only.
- Document current-Mac availability limits by mode: Live Platform requires the Mac, Spring Boot, existing platform tunnel, gateway and mobile-gateway tunnel to be awake/healthy; explicit verified Synthetic Demonstration requires the Mac, gateway and mobile-gateway tunnel only and must truthfully report the platform unavailable without becoming a hidden Live fallback. Restart procedures and health monitoring are explicit; this is not production SLA infrastructure.
- Independently assess EU/EEA, UK, Ireland, Japan, HKSAR and China connectivity, privacy, institutional and export/security constraints. In particular, do not promise Cloudflare or app-distribution reachability in mainland China without an observed test and approved regional route.
- Threat-model and independently test TLS, authentication, rate limits, replay/revocation, log privacy, backend outage, tunnel outage, DNS/certificate rotation, Mac restart, travel/network change and recovery before any external evaluator receives the build.
- Keep later VPS/ISP migration possible through configuration/build-time endpoint governance, but do not introduce runtime endpoint switching or hidden fallback.

Completion evidence must include an approved architecture/operations record, security review, exact endpoint and certificate posture, multi-invite tests, regional reachability results (including explicit NOT ASSESSABLE where applicable), clean privacy/log scans, failure-mode tests, rebuilt physical apps and controlled distribution approval. It must not be inferred from the existing website tunnel working.

No Build 45 repair may introduce a production fallback switch, new clinical classifier, copied mobile reasoner or hidden automatic synthetic fallback. No current Build 44 action or ordinary Build 45 code repair may deploy or activate a new public tunnel; T45-11 may design one, and any implementation/test requires separate explicit owner authority, security review and operational evidence.

## 4. Clinical and logical questions for ZZU/UCD and trial partners

| ID | Question requiring clinical advice | Current Build 44 behaviour | Decision needed for Build 45 |
| --- | --- | --- | --- |
| C45-01 | What is the governed tumour-size unit? | Mobile transports the positive number unchanged; backend Java risk uses a `>20` threshold; no conversion is performed | Confirm unit, UI label, allowed precision/range and whether conversion is ever permitted |
| C45-02 | Are tumour size and stage optional for entry, inference, or both? | UI treats them as optional, while omitted facts can lower completeness or block a useful result | Define minimum dataset, incomplete-case result policy and user-facing explanation |
| C45-03 | Which backend field is the authoritative patient-facing risk grade? | Top-level risk can be absent, so Build 44 displays `—` rather than inventing High/Medium/Low | Define risk source, allowed labels, relationship to deterministic risk and incomplete cases |
| C45-04 | How should risk colour be governed? | Build 44 does not infer a colour when no authoritative grade exists | Approve grade-to-colour mapping, accessibility contrast, non-colour cues and handling of unknown/incomplete results |
| C45-05 | How should tumour stage be linked to tumour size and nodal facts? | Stage and nodal status are separate optional inputs; no mobile clinical derivation occurs | Decide whether the UI should provide guidance, validation or links without calculating stage |
| C45-06 | Is the HER2-low mapping clinically adequate? | Positive→true, negative→false, blank/unknown→null; blank and unknown collapse is lossy | Define distinct not-tested/unknown/indeterminate states and backend contract |
| C45-07 | What should be shown for fields with no active consumer? | Gender has no active CDS consumer; some `not_tested`/`unspecified` values have no active clinical-output consumer | Decide whether to retain for future use, disclose non-influence, or remove from the assessment |
| C45-08 | How should Bayesian output and its patient-facing percentage be described? | Backend can return confidence/posterior/bounds when Bayes is enabled, but Build 44 physical review did not show the expected `xx%`; calibration as diagnostic certainty is not established, and deterministic SWRL firing has no percentage | Approve terminology, conversion/rounding, explanation, visibility/default, OFF/unavailable behaviour and limits; display only an actual backend value and avoid overstating certainty or attributing it to SWRL rule firing |
| C45-09 | What is the appropriate patient-facing result hierarchy? | Build 44 shows a clinical-first summary and optional technical detail | Review subtype wording, warnings, recommendations, supporting rules, provenance and escalation language against the website |
| C45-10 | Are recommendations informational, decision support, or trial-only observations? | Results originate from current ontology/SWRL/custom rules and optional Bayes | Define intended use, accountable clinician role, contraindication checks and mandatory disclaimer/stop conditions |
| C45-11 | Which web result elements and visual semantics are clinically authoritative for mobile parity? | The web Pathway includes subtype badges, risk, warnings, treatment/recommendation cards, reasoning, confidence/Bayes and source details; some web behaviour is frontend-specific and cannot automatically become a clinical contract | Approve a web-to-mobile presentation matrix, exact labels/order, authoritative backend fields, risk-grade colours plus non-colour cues, missing/incomplete states, recommendation hierarchy, Bayes wording and which technical elements remain optional; prohibit copying web-only fallback inference or frontend-derived clinical logic into mobile/T3 |

## 5. Proposed partner review procedure

### Stage A — controlled application inspection

1. Provide the unchanged Build 44 identity and a written evaluation-only notice.
2. Use synthetic cases only. Do not enter names, hospital identifiers, contact details or other real-patient facts.
3. Inspect Poster, Welcome, invite/mode selection, all five input screens, Review, clinical-first Result, optional technical detail, language switching and Arabic direction.
4. Exercise live, explicit synthetic and unavailable modes separately. Record the displayed delivery/reasoning mode.
5. Capture observations as interface/logic findings, not clinical acceptance.

### Stage B — clinical case protocol design

Clinical partners should approve before any formal study:

- the intended user and intended use;
- inclusion/exclusion criteria and minimum required facts;
- a synthetic or properly governed de-identified reference-case set;
- expected outputs and an independent clinical adjudication method;
- discrepancy severity categories and safety stop rules;
- measures for subtype agreement, recommendation agreement, completeness, usability and explanation quality;
- treatment of indeterminate/missing data and disagreement between reasoners;
- whether Bayes is evaluated separately from deterministic inference; and
- ethics, consent, information-governance and retention requirements if real clinical data is ever proposed.

### Stage C — technical-clinical adjudication

Each case should retain input facts, backend/assets identity, result mode, reasoning mode, rule IDs/descriptions, warnings/recommendations, Bayes setting/output and reviewer decision in a separately governed synthetic/non-patient research adjudication artefact. Its purpose, authorised access, storage location, retention and deletion schedule must be explicit. Operational mobile, gateway, tunnel and platform logs must never contain those clinical facts, results or artefact bodies. Two qualified reviewers should assess material discrepancies independently, with a defined third-reviewer resolution process. No mobile or gateway component may silently repair a clinical-engine difference.

### Stage D — Build 45 acceptance

Build 45 should not advance beyond controlled review until T45-01 through T45-12 and the approved clinical decisions are implemented, regression-tested and independently reviewed. Formal clinical validation, remote external-review authority and software release approval remain separate decisions.

## 6. Distribution route decision still required

No distribution action is authorised by this document. Kraken and partners must choose the route after considering device count, reviewer identity, revocation, expiry, update control, crash/telemetry policy, regional privacy requirements and Apple/Google programme constraints.

Candidate routes to assess include:

- direct developer-installed builds for a very small supervised device set;
- Apple TestFlight external/internal testing and the corresponding review/account requirements;
- Android internal/closed testing, managed distribution or controlled signed APK installation; and
- institutional MDM only if partner governance supports it.

The decision record must name the build owner, signing/account owner, authorised invitees/devices, code issuer, start/end date, update/revocation procedure, support contact, permitted data, evidence retention and incident response. Public App Store/Play publication, OTA updates, new deployment, clinician dispatch and general distribution remain outside the current authority.

## 7. Build 44 physical-review exception and limits

Kraken has explicitly deferred the unresolved Phase G work to Build 45 and requested Build 44 physical installation first if technically possible. This permits the serial physical-review programme to continue as an owner-directed exception, but it does not:

- change `G_COMPLETE=false`;
- waive the known platform log privacy defect;
- approve real-patient use or external distribution;
- constitute clinical acceptance;
- authorise platform source/configuration repair; or
- authorise commit, push, deployment, publication or a new tunnel.

Before each physical review, the reviewer must acknowledge that Build 44 is for controlled synthetic evaluation only. The established order remains iPhone 13 first, standalone relaunch confirmation second, then AndroidDev/Samsung verification and Android build/install; no Android emulator.
