# ACR Mobile Build 45 — Autonomous Execution Loop v1.1

**Status:** APPROVED FOR CONTROLLED IMPLEMENTATION — EXTERNAL DISTRIBUTION NOT AUTHORISED
**Supersedes:** `ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_0.md` (retain in `docs/archive/` — do not delete)
**Governing requirements document:** `ACR_MOBILE_BUILD45_TECHNICAL_CLINICAL_REVIEW_BACKLOG_v0.5.md`
**Incorporates:** `GATE0_PREFLIGHT_LOG_20260909.md` and `GATE0_RECONCILIATION_LOG_20260909.md` findings/decisions in full.
**Objective:** deliver a working, enhanced API/gateway interface, built on the already-working Build 44 baseline, that connects the v0.6.0 Build 44 mobile app end to end. This is a working-codebase objective, not a design-review exercise — every gate below produces running, tested code or a named, evidenced blocker, never a discussion output alone.
**Prepared:** 9 September 2026 (post pre-flight reconciliation)
**Session owner:** Kraken. Executor: Claude Code.

---

## 0. Authority, Scope and Absolute Prohibitions

### 0.1 Opening instruction (paste verbatim as the session's first message to Claude Code)

```
Read ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_1.md in full — it supersedes v1.0
and already incorporates the 9 September pre-flight reconciliation (Conflicts A-F,
Decisions D-D and D-E). Treat this document as sole execution authority. If any other
document in /docs or /docs/archive appears to conflict with it, stop and report the
conflict rather than reconciling silently.

I confirm D-D and D-E as recorded in Section 0.4 below. P-06 (AndroidDev) and P-08
(acr-api reachability) are waived for Gates 1-9 and for Gate 10's design/build work.
Both must be resolved before Gate 10's live-platform integration test and before Gate
12's physical build/install steps — revisit them once the enhanced gateway/API is
built and testable, not before.

I explicitly authorise implementation and controlled testing of the dedicated Build 45
HTTPS gateway through the "acr-mobile-review" tunnel (mobile-gateway-review.acragent.com),
already retargeted in commit d4f5c421 and separate from the existing "acr-api" tunnel.
This does not authorise external distribution, real-patient use, public release, App
Store/Play Store publication, platform production modification, or clinical acceptance.
Proceed from Gate 1 onward, stopping at every defined STOP condition.
```

If this instruction is not given verbatim (or an equivalent explicit authorisation covering the named tunnel and the D-D/D-E confirmations below), Claude Code **must stop before Gate 10** and wait.

### 0.2 Scope

React Native iOS/Android Build 45 only, single repository. WeChat Mini-Program, `ACR_MOBILE_BACKEND_REASONER_FLOW_REAFFIRMATION_v0.1.md`, and the Token-Based Authentication WeChat proposal are out of scope — separate future session.

### 0.3 Absolute prohibitions (apply at every gate, no exceptions)

- No modification, commit, or branch creation inside the canonical platform checkout (`/Users/Kraken/DAPP/acr-platform`).
- No git push. Claude Code commits locally only; Kraken pushes via GitHub Desktop.
- No tunnel other than `acr-mobile-review` is created or activated. `acr-api` is not touched or reconfigured — including not relocating where it is served from.
- No use of EAS Build, EAS Update, or any cloud build/OTA service. This project is bare-native and has never used EAS. `eas-cli` may remain installed but is not to be invoked for any build, submit, or update step. (Correction to v1.0 P-04, which wrongly implied EAS was required — see §0.5.)
- No real-patient data, names, hospital identifiers, or contact details enter any test, log, fixture, or commit.
- No App Store / Play Store submission, OTA update, production fallback switch, new clinical classifier, or copied mobile reasoner.
- No deletion of the Gate 1 evidence worktree without Kraken's explicit instruction.
- No credential, token, or secret in Git, application bundles, reports, or command history.
- No rewriting of existing commit history (including `b3376e36`) — record discrepancies in evidence logs, do not amend/rebase.

Any prohibited action attempted or required to proceed is an immediate hard STOP, not a workaround.

### 0.4 Standing decisions from pre-flight reconciliation (confirmed by Kraken, in force for this Loop)

- **D-A (tunnel):** Resolved and executed. `acr-mobile-review` / `mobile-gateway-review.acragent.com` retargeted across all committed references in commit `d4f5c421`. No further action needed except creating/activating the tunnel itself, which remains a Gate 10 step.
- **D-B (auth store):** SQLite confirmed. `persistent-auth.js` (JSON-file store) is superseded, not extended, at Gate 10.
- **D-C (repo layout):** Single repo confirmed — `acr-mobile-companion` only. `acr-mobile-companion-extended` is inactive/reference-only; do not branch from it, do not delete it.
- **D-D (T45-11 module provenance):** The 26-file T45-11 module was a bulk import from an unpacked zip, not incrementally authored in this repo. It has a co-located, substantive but **unsigned, PROPOSED/NOT-APPROVED** review (3 September) that already rejected the original monolith and disposed of 15 defects. **Decision: treat this material as design input only, not inherited code.** Gate 10 re-derives the authentication implementation against SQLite from AUTH-01–AUTH-16 and the disposition list in that review — it does not extend or ship `persistent-auth.js` or the imported module as-is. The independently-sound `b3376e36` gateway/schema/TS hardening (strict UUIDv4, build-mismatch 403, dependency bumps) **is** accepted as the Build 45 baseline, unrelated to the auth-module question. No commit-message correction/rewrite — the discrepancy is recorded in the reconciliation log, history is not amended.
- **D-E (design/implementation checkpoint):** Confirmed gap. Gate 10 now includes an explicit sign-off checkpoint (**G10-0**, below) before any AUTH-01 implementation begins, closing the gap between gateway design and gateway build that v1.0 lacked.
- **P-06/P-08 waiver:** AndroidDev mount and live `acr-api` reachability are **not required for Gates 1–9 or for Gate 10's design and build work.** Revisit both once the enhanced gateway/API is built and independently testable — not as a precondition to starting that work. Both remain hard requirements before Gate 10's live-platform integration test, and before Gate 12 (physical Android build/install, full regression against the live platform).

### 0.5 Correction to Pre-Flight P-04 (from v1.0)

P-04 no longer requires EAS CLI. Required toolchain: `mvn`, Node, npm, and the project's existing bare-native React Native build tooling (Xcode `xcodebuild` / Gradle). Record versions; no cloud build tooling required or permitted.

---

## 1. Repository and Path Reference (corrected — single repo)

```text
Mobile + gateway (single repo):
/Users/Kraken/DAPP/acr-mobile-companion

Platform (canonical, read-only — do not branch or modify):
/Users/Kraken/DAPP/acr-platform

Isolated platform evidence (Gate 1 only):
/Users/Kraken/DAPP/REVIEW-WORKTREES/acr-platform-build45-evidence

Inactive / reference-only (do not branch from, do not delete):
/Users/Kraken/DAPP/acr-mobile-companion-extended

Branch:
feature/mobile-v0.6.5-build45   (already created, single branch)
```

---

## 2. Pre-Flight — Status

P-01, P-02, P-03, P-04 (as corrected), P-05, P-07, P-09, P-10: **PASS** (per reconciliation log, 9 September). P-06, P-08: **WAIVED for Gates 1–9 and Gate 10 design/build** per §0.4 — re-check both explicitly before starting Gate 10's live-platform test and before Gate 12.

No further pre-flight action needed. Proceed to Gate 1.

---

## 3. Gate 1 — Isolated Backend Evidence (closes T45-01, T45-02)

**Location:** `/Users/Kraken/DAPP/REVIEW-WORKTREES/acr-platform-build45-evidence` only. Never the canonical checkout.

| Step | Action |
|---|---|
| G1-01 | Create a detached disposable worktree (or exact local clone, if worktree creation conflicts with Git metadata protections) at the pinned canonical platform SHA `33daead3`. |
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

UI regression only against Build 44 baseline. Eight-language display and Arabic RTL/LTR spot-checked on these two screens.

**STOP condition:** any regression against Build 44 truthful-delivery labelling (`LIVE_REASONER` / `PLATFORM_FALLBACK` / `LOCAL_SYNTHETIC_DEMO / NOT_EXECUTED`) surfaced anywhere in these screens.

---

## 5. Gate 3 — Gateway Foundation (builds on `b3376e36`; T45-11 foundation only, not closure)

`b3376e36`'s hardening (strict UUIDv4, `preRouteMiddleware`, `CLIENT_BUILD_MISMATCH` 403, dependency bumps) is the accepted starting point per D-D. The T45-11 auth module itself is **not** the starting point — Gate 10 re-derives auth separately.

| Step | Action |
|---|---|
| G3-01 | Confirm current gateway state against `b3376e36` as baseline; record what's already present vs what this gate adds. |
| G3-02 | Extend/complete the gateway's routing/config structure for the dedicated `acr-mobile-review` hostname (retargeted in commit `d4f5c421` — do not reintroduce `acr-mobile-gateway-t4` references anywhere). No tunnel creation yet. |
| G3-03 | Confirm the gateway origin binds to `127.0.0.1:3001` (loopback). |
| G3-04 | This is the core "enhanced API interface" work connecting to the Build 44 app: verify/complete the gateway's request/response mapping against the Build 44 mobile client's actual API contract (schemas in `/schemas`), not just against the isolated fixture set. |

**STOP condition:** any attempt to bind the gateway to a non-loopback interface; any attempt to create the `acr-mobile-review` tunnel before Gate 10; any reintroduction of `acr-mobile-gateway-t4`/`mobile.acragent.com` anywhere.

---

## 6. Gates 4–5 — Step 1–3 and P1/P2 (React Native transport layer)

Implements/verifies the five input screens' data transport (20 clinical/control fields) over the gateway from Gate 3, connecting to the actual Build 44 mobile app rather than the isolated fixture harness. Supports T45-05; closure is Gate 6.

**STOP condition:** any field transported that is not among the governed 20; any identifying field (name, email, hospital ID, address, contact detail) present in any transported payload.

---

## 7. Gate 6 — Review Screen + Canonical-Fact Parity (closes T45-05)

| Step | Action |
|---|---|
| G6-01 | Implement/verify the Review screen against the gateway from Gate 3. |
| G6-02 | Complete the website/mobile canonical-fact parity mapping: shared facts, mobile-only facts, website-only facts, controlled evaluation context. |
| G6-03 | Record the approved mapping as evidence. |

**PASS criteria:** mapping complete and consistent with the 20 governed fields; no undocumented divergence between website and mobile.

---

## 8. Gate 7 — Result/Error Handling (closes T45-04, T45-10)

| Step | Action |
|---|---|
| G7-01 | **T45-04:** Define the `firedRules[]` ordering contract. State whether order is clinically/technically meaningful; add deterministic ordering only if required. |
| G7-02 | **T45-10:** Implement distinct connection states separating gateway reachability from live-platform availability (e.g. `Gateway connected — Live Platform offline`). Live submission stays fail-closed offline. Never implies on-device clinical inference. |
| G7-03 | Implement the clinical-first Result screen and Fail states, carrying forward truthful delivery-mode labelling, connected through the Gate 3 gateway. |

**STOP condition:** any UI path readable as on-device clinical inference; any silent Live→Demonstration fallback.

---

## 9. Gates 8–9 — About, Accessibility, Languages, Polish

Standard UI regression: About screen, navigation, styling, language modal, eight languages, Arabic RTL/LTR, Dynamic Type/font scaling. No blocker closure.

---

## 10. Gate 10 — Authentication and Dedicated Remote Gateway (closes T45-08, T45-11)

**Authorisation check:** confirm the opening instruction (§0.1) explicitly authorised the `acr-mobile-review` tunnel and confirmed D-D/D-E. If absent, **STOP here** and wait.

### G10-0 — Design sign-off checkpoint (new in v1.1, closes D-E gap)

Before any AUTH-01 implementation begins:

1. Present Kraken with the re-derived auth design: session model, token lifecycle, SQLite schema, and how each of the 15 defects disposed of in the 3 September review (e.g. "any format-valid invite/refresh/bearer token was accepted" → scrypt+pepper, binding, rotation, replay-family revocation) is addressed in the new design — as design input, not inherited code.
2. Wait for Kraken's written GO/NO-GO on this design specifically, separate from the original backlog/Loop approval.
3. Do not begin AUTH-01 implementation (§10.2 below) until this sign-off is given.

**STOP condition:** proceeding to §10.2 without G10-0 sign-off recorded.

### 10.1 Tunnel creation

```text
Tunnel name:      acr-mobile-review
Hostname:         mobile-gateway-review.acragent.com
Origin:           http://127.0.0.1:3001
Existing tunnel:  acr-api — unchanged, not reconfigured, not relocated
```

Confirm the origin port matches the Gate 3 gateway. Credentials for the new tunnel are stored outside Git, app bundles, reports, and command history — confirm storage location explicitly in evidence.

### 10.2 Authentication implementation (AUTH-01–AUTH-16, per backlog §10.2) — post G10-0 only

Implement in full, re-derived against SQLite (not `persistent-auth.js`): one-time short-expiry invitation codes; access token (15 min) / refresh token (30 day) exchange; in-memory access token on client, iOS Keychain / Android Keystore for refresh tokens; device/build/tester binding; structured session records with constant-time lookup; immediate server-side revocation; refresh-token reuse detection with full revocation; rate limiting ahead of authentication; no token/hash-prefix in logs; scrypt+pepper (or equivalent slow hash) for invitation codes; hashed/digested storage for all tokens; enforced expiry; no automatic live-to-synthetic fallback on auth failure; TLS-only.

### 10.3 Acceptance tests (AT-01–AT-19, per backlog §10.3)

Run all nineteen. Record pass/fail individually. No test marked pass on partial evidence.

### 10.4 Gateway constraints (per backlog §10.4)

No embedded public IP; no port-forwarding/UPnP/raw TCP/direct HTTP; loopback-bound origin; request-size limits, strict schema validation, build/device binding, refresh rotation/reuse revocation, rate limiting, fail-closed backend checks; rebuilt apps with one hardcoded `https://` endpoint, no cleartext exception, no endpoint editor, no bypass, no automatic fallback; T45-08 invite administration complete; short-scoped device-bound revocable tokens; secrets outside Git/bundles/documents/history; explicit restart-recovery behaviour; same-backend architecture preserved (gateway does transport/auth/validation only); regional connectivity/privacy posture independently assessed or marked NOT ASSESSABLE; threat-model and independently test TLS, auth, rate limits, replay/revocation, log privacy, backend outage, tunnel outage, DNS/certificate rotation, Mac restart, travel/network change, and recovery.

**Before the live-platform integration test specifically:** confirm P-08 (`acr-api` reachability) is resolved — this is the point at which the earlier waiver ends.

**STOP condition:** any constraint found unmet at test time; any regional connectivity claim made without an observed test; live-platform integration test attempted while P-08 remains unresolved.

**PASS criteria (T45-11 full closure):** approved architecture/operations record (including the G10-0 sign-off), security review, exact endpoint/certificate posture, multi-invite tests, regional reachability results, clean privacy/log scans, failure-mode tests, rebuilt physical apps, complete evidence package. Distribution approval remains separate.

---

## 11. Gate 11 — Full Regression and Independent Review (closes T45-06)

| Step | Action |
|---|---|
| G11-01 | Freeze the Build 45 snapshot at a fixed commit. |
| G11-02 | Re-run the full test family: current reconciled baseline is **158/158 gateway + 4/4 e2e + 5/5 module = 167**, recorded as **provisional** pending Gate 10 completion (auth tests add to this count). The original "79/79 targeted platform tests" figure and `G-COMPLETE-REVIEW-001` are confirmed **NOT RECOVERABLE** from disk — do not invent a replacement; establish a fresh platform-test baseline at this gate if no external copy surfaces (check `/Volumes/AndroidDev` once connected — it is the last untried location). |
| G11-03 | Independent reviewer (not the implementing session) reviews results. |

**PASS criteria:** `G_COMPLETE=true` only if every mandatory check family passes against the freshly-established or recovered baseline. No failed check relabelled pending.

---

## 12. Gate 12 — iOS/Android Builds and Distribution-Readiness Evidence (final technical gate)

Requires P-06 and P-08 fully resolved (waiver ends here at the latest, if not already ended at Gate 10).

| Step | Action |
|---|---|
| G12-01 | iOS: build for simulator first, verify functional parity, then build and install on the authorised physical iPhone 13. Bare-native `xcodebuild` — no EAS. |
| G12-02 | Android: build and install on the authorised physical Samsung device via AndroidDev. No emulator. Bare-native Gradle — no EAS. |
| G12-03 | Compile the final changed-file inventory. |
| G12-04 | Confirm log-privacy evidence: no clinical facts, tokens, or invite plaintext in any log. |
| G12-05 | Assemble the complete Section 3 evidence package (T45-01, -02, -04, -05, -06, -08, -10, -11) for Kraken's review. |

Implementation-complete, controlled-review-ready. Does not authorise partner distribution.

---

## 13. Session Close (mandatory ending sequence)

1. Confirm canonical platform checkout is bit-for-bit unchanged from session start.
2. Confirm no push has occurred on any branch.
3. Commit locally with clear messages referencing the gates closed.
4. State the local commit hash(es).
5. State explicitly: no push, no merge, no distribution, no deletion of the Gate 1 evidence worktree.
6. Instruct: push via GitHub Desktop is Kraken's action only.
7. End the session.

---

## 14. Cross-Cutting STOP Conditions (apply at any gate)

- Any required action would modify the canonical platform checkout.
- Any tunnel other than `acr-mobile-review` would be created or activated.
- Any use of EAS Build/Update is attempted.
- Real-patient data or any identifying field appears anywhere.
- A credential, token, or secret is found in Git, an app bundle, a report, or command history.
- A distribution action is implied or requested.
- Gate 10 reached without G10-0 sign-off recorded, or without §0.1 authorisation present.
- Gate 10's live-platform integration test or Gate 12 reached while P-06/P-08 remain unresolved.
- Any canonical-checkout diff is non-empty at a Gate 1 checkpoint.
- `acr-mobile-gateway-t4` or `mobile.acragent.com` references reappear anywhere.

On any of these: stop immediately, report the exact condition and gate, and wait for Kraken.

---

**END OF DOCUMENT**
