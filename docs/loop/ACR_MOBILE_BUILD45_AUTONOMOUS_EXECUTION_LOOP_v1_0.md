# ACR Mobile Build 45 — Autonomous Execution Loop v1.0

**Status:** APPROVED FOR CONTROLLED IMPLEMENTATION — EXTERNAL DISTRIBUTION NOT AUTHORISED
**Governing requirements document:** `ACR_MOBILE_BUILD45_TECHNICAL_CLINICAL_REVIEW_BACKLOG_v0.5.md` (approved, Gate 0 approved by Kraken)
**This document:** the executable session instruction. The backlog defines *what* and *why*; this document defines *how*, *where*, and *when to stop*.
**Prepared:** 8 September 2026
**Session owner:** Kraken. Executor: Claude Code.

---

## 0. Authority, Scope and Absolute Prohibitions

### 0.1 Opening instruction (paste verbatim as the session's first message to Claude Code)

```
I approve ACR_MOBILE_BUILD45_TECHNICAL_CLINICAL_REVIEW_BACKLOG_v0.5.md and
ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1.0.md for controlled implementation.
I explicitly authorise implementation and controlled testing of the dedicated Build 45
HTTPS gateway through a new, dedicated outbound authenticated Cloudflare tunnel
("acr-mobile-review", hostname mobile-gateway-review.acragent.com), separate and
independent from the existing "acr-api" tunnel. This does not authorise external
distribution, real-patient use, public release, App Store/Play Store publication,
platform production modification, or clinical acceptance. External distribution
requires completion of all Section 3 blockers, independent evidence review and my
separate written approval. Proceed through Gate 0–Gate 12 of the Execution Loop v1.0,
stopping at every defined STOP condition.
```

If this instruction is not given verbatim (or an equivalent explicit authorisation covering the named tunnel), Claude Code **must stop before Gate 10** and wait.

### 0.2 Scope

React Native iOS/Android Build 45 only. WeChat Mini-Program is out of scope (separate backlog, separate session).

### 0.3 Absolute prohibitions (apply at every gate, no exceptions)

- No modification, commit, or branch creation inside the canonical platform checkout (`/Users/Kraken/DAPP/acr-platform`).
- No git push. Claude Code commits locally only; Kraken pushes via GitHub Desktop.
- No tunnel other than `acr-mobile-review` is created or activated. `acr-api` is not touched.
- No real-patient data, names, hospital identifiers, or contact details enter any test, log, fixture, or commit.
- No App Store / Play Store submission, OTA update, production fallback switch, new clinical classifier, or copied mobile reasoner.
- No deletion of the isolated evidence worktree (Gate 1) without Kraken's explicit instruction.
- No credential, token, or secret in Git, application bundles, reports, or command history.

Any prohibited action attempted or required to proceed is an immediate hard STOP, not a workaround.

---

## 1. Repository, Branch and Path Reference

> **Corrected 9 September 2026** per `ACR_MOBILE_BUILD45_PREFLIGHT_RECONCILIATION_v1_0.md` decision **D-C**.
> The original two-repository layout did not exist. Preserved Build 44 evidence
> (`ACR_MOBILE_CDS_PARITY_EXECUTION_EVIDENCE_v1.6.md` §2) records a **unified single-repo**
> Build 44 source commit `119a2e5ab4c9d84da9632847e9fbec5dab764d75` in `acr-mobile-companion`
> whose scope explicitly includes "gateway, schemas, fixtures, end-to-end tests"
> (verified: that commit touches gateway 26, schemas 5, e2e 6, tests 7, src 36 files).
> `acr-mobile-companion-extended` has **zero commits** and holds a divergent 31 August
> snapshot; there is no verified Build 44 commit there to branch from.

```text
Mobile app + gateway (single repository — authoritative):
/Users/Kraken/DAPP/acr-mobile-companion

Platform (canonical, read-only — do not branch or modify):
/Users/Kraken/DAPP/ACR-platform

Isolated platform evidence (Gate 1 only):
/Users/Kraken/DAPP/REVIEW-WORKTREES/acr-platform-build45-evidence

Inactive / reference-only — do not branch from, do not build from, do not delete:
/Users/Kraken/DAPP/acr-mobile-companion-extended
```

Branch to create (single branch, from the verified Build 44 lineage):

```text
feature/mobile-v0.6.5-build45         (in acr-mobile-companion)
```

`feature/gateway-v0.6.5-build45` is **withdrawn** — the gateway lives inside
`acr-mobile-companion/gateway/` and is covered by the single branch above.

---

## 2. Pre-Flight (must complete before Gate 0 is marked passed)

| Step | Action | STOP condition |
|---|---|---|
| P-01 | Record current HEAD SHA in `acr-mobile-companion` and `acr-mobile-companion-extended` | — |
| P-02 | Reconcile recorded SHAs against preserved Build 44 evidence (per backlog #9 physical-review record) | STOP if source cannot be reconciled with preserved Build 44 evidence |
| P-03 | Confirm JDK 21 active via `jenv version` | STOP if not JDK 21 |
| P-04 | Confirm `mvn`, Node, npm, Expo CLI, EAS CLI versions; record all | STOP if any required tool absent |
| P-05 | Confirm Xcode + valid provisioning profile for iPhone 13 target | STOP if signing identity unavailable |
| P-06 | Confirm Android SDK + signing key for Samsung device target | STOP if signing key unavailable |
| P-07 | Confirm a Node-compatible SQLite driver is available and functional for the auth store (Section 10) | STOP if no compatible driver — do not silently substitute Redis; report to Kraken |
| P-08 | Confirm `cloudflared` present; confirm existing tunnel `acr-api` (`56ea5620-5ecd-41eb-96d5-1197df92d704`, `api.acragent.com`) is running and **untouched** | STOP if `acr-api` config would be altered by any planned step |
| P-09 | Confirm intended local origin for the new gateway, `http://127.0.0.1:3001`, is free/assignable | STOP if port conflict; do not silently pick another port — report and wait |
| P-10 | Create the two Build 45 branches listed in #1 | STOP if branch already exists with divergent history |

**Gate 0 evidence record:** SHAs, tool versions, branch names, port confirmation, written to a pre-flight log file in the mobile repo (not committed to platform).

---

## 3. Gate 1 — Isolated Backend Evidence (closes T45-01, T45-02)

**Location:** `/Users/Kraken/DAPP/REVIEW-WORKTREES/acr-platform-build45-evidence` only. Never the canonical checkout.

| Step | Action |
|---|---|
| G1-01 | Create a detached disposable worktree (or, if worktree creation conflicts with Git metadata protections, an exact local clone) at the pinned canonical platform SHA. |
| G1-02 | Diff the canonical checkout against its own last-known-good state to confirm zero drift **before** any work begins. Record the diff (expected: empty). |
| G1-03 | **T45-01:** Execute the complete synthetic fixture through Openllet/SWRL and the existing Java fallback inside the isolated worktree only. Capture subtype, risk, treatments, biomarkers, rules, explanations, completeness, and Bayes output for both paths. Enumerate every difference. |
| G1-04 | **T45-02:** Force an actual `BayesianEnhancer` exception inside the isolated worktree only. Confirm the platform represents the failure correctly and the gateway path fails closed — no partial or invented clinical output under any condition. |
| G1-05 | Test-only fault injection is permitted **only** inside this isolated worktree. Record every test-only source change made, with rationale. |
| G1-06 | Diff the canonical checkout against its pre-Gate-1 state again. Must be empty. |
| G1-07 | Retain the worktree/clone intact. Do not delete automatically — Kraken reviews this evidence before disposal. |

**STOP condition:** any non-empty diff against the canonical checkout at G1-02 or G1-06; any attempt to expose the isolated worktree through `acr-api` or `acr-mobile-review`; any BayesianEnhancer failure producing partial/invented output.

**PASS criteria:** T45-01 comparison fully enumerated and recorded; T45-02 fail-closed behaviour proven; canonical checkout provably unchanged.

---

## 4. Gate 2 — Welcome + Poster (React Native)

UI regression only against Build 44 baseline. Eight-language display and Arabic RTL/LTR spot-checked on these two screens. No blocker closure — standard implementation gate.

**STOP condition:** any regression against Build 44 truthful-delivery labelling (`LIVE_REASONER` / `PLATFORM_FALLBACK` / `LOCAL_SYNTHETIC_DEMO / NOT_EXECUTED`) surfaced anywhere in these screens.

---

## 5. Gate 3 — Gateway Foundation (T45-11 foundation only — not closure)

| Step | Action |
|---|---|
| G3-01 | Establish the gateway's internal routing/config structure for a future dedicated hostname, without creating or activating any tunnel yet. |
| G3-02 | Confirm compatibility with the existing route pattern used by the platform API without modifying it. |
| G3-03 | Confirm the gateway origin will bind to `127.0.0.1:3001` (loopback), matching the port reserved at P-09. |

T45-11 is **not** closed at this gate — full closure (tunnel creation, endpoint rebuild, multi-invite testing) happens at Gate 10.

**STOP condition:** any attempt to bind the gateway to a non-loopback interface; any attempt to create the `acr-mobile-review` tunnel before Gate 10.

---

## 6. Gates 4–5 — Step 1–3 and P1/P2 (React Native transport layer)

Implements the five input screens' data transport (20 clinical/control fields) over the existing `/api/infer` contract via the Build 44 pattern. This work **supports** T45-05 (canonical-fact parity) but does not close it — closure is Gate 6.

**STOP condition:** any field transported that is not among the governed 20; any identifying field (name, email, hospital ID, address, contact detail) present in any transported payload.

---

## 7. Gate 6 — Review Screen + Canonical-Fact Parity (closes T45-05)

| Step | Action |
|---|---|
| G6-01 | Implement the Review screen. |
| G6-02 | Complete the website/mobile canonical-fact parity mapping: identify shared facts, mobile-only facts, website-only facts, and the controlled evaluation context for each. |
| G6-03 | Record the approved mapping as evidence. |

**PASS criteria:** mapping complete and internally consistent with the 20 governed fields; no undocumented fact divergence between website and mobile.

---

## 8. Gate 7 — Result/Error Handling (closes T45-04, T45-10)

| Step | Action |
|---|---|
| G7-01 | **T45-04:** Define the `firedRules[]` ordering contract. State explicitly whether order is clinically/technically meaningful. Add deterministic ordering only if required — do not add it speculatively. |
| G7-02 | **T45-10:** Implement distinct connection states — e.g. `Gateway connected — Live Platform offline` — separating gateway reachability from live-platform availability. Live submission remains fail-closed in all offline states. Verified synthetic replay may remain available through the gateway. The UI must never imply on-device clinical inference. |
| G7-03 | Implement the clinical-first Result screen and Fail states per Build 44 pattern, carrying forward truthful delivery-mode labelling. |

**STOP condition:** any UI path that could be read as the phone performing local clinical inference; any silent fallback from Live to Demonstration mode.

---

## 9. Gates 8–9 — About, Accessibility, Languages, Polish

Standard UI regression gates: About screen, navigation bar, styling, language modal, eight languages, Arabic RTL/LTR, Dynamic Type/font scaling. No blocker closure.

---

## 10. Gate 10 — Authentication and Dedicated Remote Gateway (closes T45-08, T45-11)

**Authorisation check (repeat of #0.1):** confirm the opening instruction explicitly authorised implementation and testing of the `acr-mobile-review` tunnel. If absent, **STOP here** and wait for written confirmation — do not proceed on inference from prior sessions.

### 10.1 Tunnel creation

```text
Tunnel name:      acr-mobile-review
Hostname:         mobile-gateway-review.acragent.com
Origin:           http://127.0.0.1:3001
Existing tunnel:  acr-api (56ea5620-5ecd-41eb-96d5-1197df92d704, api.acragent.com) — unchanged
```

Confirm the origin port matches P-09 before activating. Credentials for the new tunnel are stored outside Git, app bundles, reports, and command history — confirm storage location explicitly in evidence.

### 10.2 Authentication implementation (AUTH-01–AUTH-16, per backlog #10.2)

Implement in full: one-time short-expiry invitation codes; access token (15 min) / refresh token (30 day) exchange; in-memory access token storage on client, iOS Keychain / Android Keystore for refresh tokens; device/build/tester binding; structured session records (not a flat hash list); immediate server-side revocation; refresh-token reuse detection with full revocation; rate limiting ahead of authentication; no token or hash-prefix in logs; bcrypt (or equivalent) for invitation codes; hashed/digested storage for all tokens; enforced expiry; no automatic live-to-synthetic fallback on auth failure; TLS-only.

**Persistent store:** SQLite, per P-07 confirmation. Do not introduce Redis unless SQLite is proven unsuitable during pre-flight — if so, STOP and report rather than substituting silently.

### 10.3 Acceptance tests (AT-01–AT-19, per backlog #10.3)

Run all nineteen. Record pass/fail per test individually. No test may be marked pass on partial evidence.

### 10.4 Gateway constraints (per backlog #10.4)

No embedded public IP; no port-forwarding/UPnP/raw TCP/direct HTTP; loopback-bound origin; request-size limits, strict schema validation, build/device binding, refresh rotation/reuse revocation, rate limiting, fail-closed backend checks; rebuilt apps with one hardcoded `https://` endpoint, no cleartext exception, no endpoint editor, no bypass, no automatic fallback; T45-08 invite administration complete (named issuer, unique-code policy, expiry/revocation, audit metadata, lost-code procedure, no plaintext storage — slow hash or keyed verification, not unsalted SHA-256); short-scoped device-bound revocable tokens; secrets outside Git/bundles/documents/history; explicit restart-recovery behaviour (no silent acceptance of old/unknown sessions); same-backend architecture preserved (gateway does transport/auth/validation only — Ontology/SWRL/Openllet/Java/Bayes remain platform-only); connectivity/privacy/export posture independently assessed per region (EU/EEA, UK, Ireland, Japan, HKSAR, China) — mark **NOT ASSESSABLE** rather than assume, especially for mainland China reachability; threat-model and independently test TLS, auth, rate limits, replay/revocation, log privacy, backend outage, tunnel outage, DNS/certificate rotation, Mac restart, travel/network change, and recovery before any external evaluator receives the build.

**STOP condition:** any of the above constraints found unmet at test time; any regional connectivity claim made without an observed test.

**PASS criteria (T45-11 full closure):** approved architecture/operations record, security review, exact endpoint and certificate posture, multi-invite tests, regional reachability results (including explicit NOT ASSESSABLE entries), clean privacy/log scans, failure-mode tests, rebuilt physical apps, evidence package complete. Distribution approval remains separate and is **not** granted by this gate passing.

---

## 11. Gate 11 — Full Regression and Independent Review (closes T45-06)

| Step | Action |
|---|---|
| G11-01 | Freeze the Build 45 snapshot (single `feature/mobile-v0.6.5-build45` branch at a fixed commit, per corrected §1). |
| G11-02 | Re-run the full Phase G test family and Build 44 regression suite against this snapshot — see **corrected baseline** below. |
| G11-03 | Independent reviewer (not the implementing session) reviews results. |

> **Corrected 9 September 2026** per `ACR_MOBILE_BUILD45_PREFLIGHT_RECONCILIATION_v1_0.md` decision **D-F**.
>
> **Gateway tests — corrected.** The original "157/157" figure came from the preserved
> Build 44 evidence (153 Jest + 4 e2e). Commit `b3376e36` added 5 Jest tests. The observed
> baseline at that commit, re-run and verified on 9 September 2026, is:
>
> - Gateway Jest: **158/158** (5 suites)
> - Gateway e2e: **4/4**
> - T45-11 module suite: **5/5**
> - **Total: 167**
>
> This count is **provisional pending decision D-D**. If the T45-11 module is isolated
> rather than retained, the module's 5 tests and part of the Jest delta fall away and the
> baseline must be re-established before Gate 11 closes.
>
> **Platform tests — NOT RECOVERABLE.** The "79/79 targeted platform tests" figure and the
> independent review record cited in backlog §2
> (`.acr-loop/v1.6/acr-mobile-cds-parity-v1.6-20260831T074903Z/reviewer/G-COMPLETE-REVIEW-001/review.md`)
> **could not be recovered**. `.acr-loop/` is gitignored as local execution evidence, was never
> tracked, and is absent from `/Users/Kraken/DAPP`, `Documents`, `Desktop`, `Downloads` and all
> mounted volumes. The only surviving external archive location
> (`/Volumes/AndroidDev/ACR-Mobile-Companion-Build44-Critical-20260902`) is not mounted.
> No replacement figure is invented here. Before Gate 11 can close, Kraken must either
> locate an external copy of that evidence or accept a freshly established platform-test
> baseline recorded at Gate 11 time. Note that FULL_IMPLEMENTATION_PLAN v1.1 §T45-06c already
> re-scopes this as "historic 79 is a minimum retained family" rather than a fixed target.

**PASS criteria:** `G_COMPLETE=true` recorded **only** if every mandatory check family passes. No failed check may be relabelled pending or silently excluded. If any check fails, `G_COMPLETE` remains `false` and the gate does not close — report to Kraken.

---

## 12. Gate 12 — iOS/Android Builds and Distribution-Readiness Evidence (final technical gate)

| Step | Action |
|---|---|
| G12-01 | iOS: build for simulator first, verify functional parity, then build and install on the authorised physical iPhone 13. |
| G12-02 | Android: build and install on the authorised physical Samsung device via AndroidDev. **No Android emulator** at any stage. |
| G12-03 | Compile the final changed-file inventory across `acr-mobile-companion` and `acr-mobile-companion-extended`. |
| G12-04 | Confirm log-privacy evidence (gateway and mobile layers): no clinical facts, tokens, or invite plaintext in any log — independent scan recorded. |
| G12-05 | Assemble the complete Section 3 evidence package (all of T45-01, T45-02, T45-04, T45-05, T45-06, T45-08, T45-10, T45-11) for Kraken's review. |

This gate produces **implementation-complete, controlled-review-ready** evidence. It does **not** itself authorise partner distribution — that remains Kraken's separate written decision per backlog #8.

---

## 13. Session Close (mandatory ending sequence)

1. Confirm canonical platform checkout (`/Users/Kraken/DAPP/acr-platform`) is bit-for-bit unchanged from session start.
2. Confirm no push has occurred on any branch.
3. Commit locally on each feature branch with a clear message referencing the gates closed.
4. State the local commit hash(es) for `feature/mobile-v0.6.5-build45` and `feature/gateway-v0.6.5-build45`.
5. State explicitly: **no push, no merge, no distribution, no deletion of the Gate 1 evidence worktree.**
6. Instruct: push via GitHub Desktop is Kraken's action only.
7. End the session. Do not continue past this point in the same run.

---

## 14. Cross-Cutting STOP Conditions (apply at any gate, override gate-local instructions)

- Any required action would modify the canonical platform checkout.
- Any tunnel other than `acr-mobile-review` would be created or activated.
- Real-patient data, or any identifying field, appears anywhere in a payload, fixture, log, or commit.
- A credential, token, or secret is found in Git, an app bundle, a report, or command history.
- A distribution action (App Store/Play submission, OTA push, public release) is implied or requested.
- Section 10 authorisation (per #0.1) is not present and Gate 10 has been reached.
- Any canonical-checkout diff is non-empty at a Gate 1 checkpoint.
- SQLite proves unsuitable for the auth store and the session considers substituting another store without reporting first.

On any of these: stop immediately, report the exact condition and gate, and wait for Kraken.

---

**END OF DOCUMENT**
