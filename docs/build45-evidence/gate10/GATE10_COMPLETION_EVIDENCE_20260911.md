# Build 45 — Gate 10 Completion Evidence (after the WAF remediation)

**Authority:** `ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_1.md` §10; Kraken's GO of
11 September 2026 after deploying the Cloudflare WAF rule *"Block HTTP - mobile gateway"*.
**Date:** 11 September 2026
**Follows:** `GATE10_LIVE_EVIDENCE_20260911.md` (§10.1, live integration over loopback, AT-14 STOP).

**Result: Gate 10 implementation COMPLETE. AT-14 now PASSES. Every live acceptance test
run passes.** T45-08 is closed. T45-11 has its implementation and test evidence complete;
the items left for its formal closure need people or places this session cannot supply
(§8).

No new STOP-class finding arose. All traffic was synthetic and non-patient. No invitation
code, token or device binding appears in this document or any committed file.

---

## 1. T1/T2 — verified read-only, never touched

Before every live step, using the Doc 2 commands:

| Check | Result |
|---|---|
| T1 `java` on `:8080` | PID 31233, local health 200 |
| T2 `cloudflared tunnel run --url http://localhost:8080 acr-api` | PID 34190 (the same process all session), public health / status / manifest 200 |

Neither was started, stopped or restarted.

## 2. AT-14 TLS only — **PASS** (re-run with the WAF rule active)

| Probe | Result | Answered by |
|---|---|---|
| `https GET /m/v1/live` | 200 | origin |
| `http GET /m/v1/live` | **403** | **Cloudflare** block page |
| `http POST /m/v1/auth/redeem` (dummy code) | **403** | **Cloudflare** — no helmet headers, no `acr.error.v1` body |
| `http GET /m/v1/infer` | **403** | Cloudflare |
| Gateway log lines with `scheme:"http"` | **0** | — |

Cleartext is now refused at the edge and never reaches the origin.

**Defence in depth (punch item P2, applied and proven live).** When `ACR_PUBLIC_HOSTNAME`
is set, the gateway also refuses to *process* anything the edge did not forward as HTTPS,
answering **403 `TLS_REQUIRED`**, outcome `NOT_SUBMITTED`. This relies on
`X-Forwarded-Proto: https`, which I observed live on real tunnel traffic before writing
the check. Proven live: loopback requests with the approved `Host` but without the header,
or with `http`, are refused; edge-forwarded HTTPS passes; a full public integration passes
with P2 active.

## 3. Live-platform integration — **PASS on both legs**

| Leg | Path | Result |
|---|---|---|
| A (14:04 UTC, earlier evidence) | loopback → gateway → T2 → T1 | PASS, 2,056 ms |
| **B** | **device → Cloudflare edge → `acr-mobile-review` → gateway → T2 → T1** | **PASS, 1,339 ms** |
| B again, with P2 active | same | PASS, 1,058 ms |

Every run: redeem 200 · attestation `VERIFIED` (v2.2, 71/76/76/76/27, ontology hash
match) · infer 200 `LIVE_REASONER` / `OPENLLET_SWRL`, `currentExecution: true` ·
`LuminalB_HER2Negative`, `INTERMEDIATE`, Tier 3, R17b present, Bayes
`0.6001915864330829`. The output is identical across legs and matches Gate 1's
isolated-worktree result.

## 4. AT-13 binding — **PASS live, 8/8**, through the public hostname

| Check | Result |
|---|---|
| Redeem on device A | 200 |
| Device A authenticated call | 200 |
| Device B presents A's **access** token | **403 `DEVICE_BINDING_MISMATCH`** |
| Device B presents A's **refresh** token | **403 `DEVICE_BINDING_MISMATCH`** |
| Superseded Build 44 client presents A's token | **403 `CLIENT_BUILD_MISMATCH`** |
| Second redemption of the same invite from device B | **401 `INVITE_INVALID`** |
| Device A refresh after B's failed attempts | 200 — failed attempts do not revoke |
| Device A uses the rotated token | 200 |

A true second *physical* device additionally needs a rebuilt app installed, which is
Gate 12 work.

## 5. AT-11 persistence — **PASS live, 6/6**, across a real process restart

State was established through the public hostname: a live session, plus a rate-limit
lockout on selector `ZZZZZZZZ` (10 × 401, then 429). The gateway process was then stopped
(port freed, process memory gone) and a **new process** started 47 s later.

| After restart | Result |
|---|---|
| Pre-restart access token | **200** |
| Lockout on `ZZZZZZZZ` | **429 `RATE_LIMITED` — survived the restart** |
| Forged 256-bit bearer | 401 |
| Pre-restart refresh token | **200 — rotates** |
| That refresh token replayed | 409 `TOKEN_REUSE_DETECTED` — family revoked |
| The rotated token after revocation | 401 |

This is the property the in-memory design could not have: sessions **and** lockouts both
survive a restart.

## 6. Failure modes and log privacy

**Backend outage — PASS.** A throwaway second gateway on `127.0.0.1:3002`, pointed at a
closed port, ran with the platform unreachable, without touching T1/T2:

| Step | Result |
|---|---|
| Redeem (auth is local) | 200 |
| Attestation | `verificationState: UNAVAILABLE` |
| Live infer | **503 `ATTESTATION_UNAVAILABLE`, outcome `NOT_SUBMITTED`, no clinical data** |

The throwaway was stopped and its temporary store deleted. That a live failure never
silently switches to demo is already covered by the unit test *"demo route is explicit
and never an automatic live fallback"*. My live sub-probe for it failed on a header bug in
my driver, and was not re-run.

**Tunnel outage — PASS** (earlier evidence): with the connector stopped, the public
hostname returns 530 on both schemes, and nothing reaches the origin.

**Log privacy against real output — PASS** (G12-04 / AT-10). Punch item P1 wired the
logger to structured stdout, so these are now real logs rather than a no-op.

| Measure | Result |
|---|---|
| Lines scanned | 67 (35 `request.complete`, 21 `request.error`) |
| Every invite code and secret half used today | 0 hits |
| Every access token, refresh token and device binding used today | 0 hits |
| Synthetic `patientId`, subtype, treatments, biomarkers, Bayes fields | 0 hits |
| `Bearer `, `inviteCode`, `refreshToken`, `accessToken` | 0 hits |
| Keys present | `ts, event, requestId, route, method, status, code, durationMs, resultMode, reasoningMode, scheme` — allow-list only |

**Correlation data redacted (punch item P5, live-proven).** `requestId` is now logged as
an 8-character prefix (`"6ae39cac…"`), per backlog §10.4 "redact correlation data".

## 7. Client side — AUTH-03, AUTH-04 and the single https endpoint

**P3 — secure client session (closes the client half of AUTH-03 and AUTH-04).** The
Build 44 client generated a new device binding on every app launch and kept both tokens in
memory, so an evaluator who closed the app lost access for good, invitations being
single-use. Now:

- the **refresh token** is stored in the iOS Keychain / Android Keystore (`expo-secure-store`
  13.0.2, the SDK 51 match) with `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, so it never syncs to
  iCloud and never migrates to another device;
- the **access token** stays in memory only;
- the **install binding** is created once per install and reused;
- `restoreSession()` re-establishes access after an app restart without a new invitation.
  A refused token is wiped, and nothing falls back to demo.

The new mobile verifier compiles the real `secureSession.ts` against a fake SecureStore,
and asserts every storage call uses device-only accessibility and that no access token is
ever persisted.

**P11 — one hardcoded https endpoint, no cleartext exception (backlog §10.4).**

| Layer | Before (Build 44 LAN) | After |
|---|---|---|
| Compiled origin | `http://192.168.1.94:3001` | `https://mobile-gateway-review.acragent.com` only; LAN origin removed from the governed set |
| iOS ATS | `NSAllowsLocalNetworking: true` + local-network usage prompt | both removed; `NSAllowsArbitraryLoads: false` retained |
| Android | `domain-config cleartextTrafficPermitted="true"` for `192.168.1.94` | removed; `base-config cleartextTrafficPermitted="false"` only |
| Verifiers | asserted the LAN posture | assert TLS-only on both platforms and no `http://` origin |

**Consequence to know.** With the local-networking exception gone, a *Debug* build on a
physical device cannot fetch its JS bundle from Metro over the LAN. Gate 12 builds are
Release builds with an embedded bundle, the same standalone form Build 44 was reviewed in,
so they are unaffected. If developer Metro-on-device is needed later, it should come from
a Debug-only plist rather than by restoring the exception in the shipped one.

## 8. T45-08 and T45-11 status

**T45-08 — CLOSED.** Named issuer (`--issued-by`); unique single-use codes;
selector/verifier with scrypt+pepper, no plaintext stored; 7-day activation; per-invitation
revocation cascading to sessions; non-clinical audit metadata; the lost-code procedure
(G10-0 §10.3) was approved in Kraken's GO. All proven by AT-01–19, and live by AT-11/13/14.

**T45-11 — implementation and test evidence complete.** Remaining for formal closure:

| Requirement (backlog §10.4 / Loop §10.4) | Status |
|---|---|
| Architecture / operations record incl. G10-0 sign-off | Done (G10-0 design + GO; this record) |
| Exact endpoint and certificate posture | Done: one https origin; edge TLS 1.3, valid cert, TLS 1.0/1.1 refused |
| Multi-invite tests | Done: 5 invitations issued, all 5 redeemed live over separate device bindings; reuse refused live (AT-13) and in unit tests (AT-15) |
| Clean privacy / log scans | Done (§6) |
| Failure-mode tests | Backend outage, tunnel outage, process restart: **done**. DNS/certificate rotation, Mac restart, travel/network change: **NOT TESTED** — need Kraken or a real event. |
| **Independent security review** | **Outstanding** — must be someone other than the implementing session |
| **Regional reachability** | Observed only from France (edge `cdg`, `lhr`). **EU/EEA beyond France, UK, Ireland, Japan, HKSAR and mainland China: NOT ASSESSABLE** — no observed test from those regions. No claim of mainland-China reachability is made. |
| Rebuilt physical apps | Gate 12 |
| Controlled distribution approval | Kraken's separate decision; not granted by any gate |

## 9. Punch list

| # | Item | Status |
|---|---|---|
| P1 | Logger wrote nothing in production (no-op sink) | **DONE**, live-proven |
| P2 | Gateway HTTP backstop | **DONE**, live-proven |
| P3 | Client refresh token in Keychain/Keystore; per-install binding; restore after restart | **DONE**, unit-proven; device proof at Gate 12 |
| P4 | T1 listens on `*:8080`, not loopback | Recorded for the platform backlog (outside Build 45 authority) |
| P5 | Full `requestId` in logs | **DONE**, live-proven |
| P6 | `firedRules[]` order changes fixture SHA-256 | Gate 11 risk; platform-side fix |
| P7 | Stored e2e fixture covers 14 of 21 fields | Gate 11 |
| P8 | Add `typecheck:active` to the Gate 11 mandatory family | Gate 11 |
| P9 | `analysisVersion` differs web (2.1.2) vs mobile (2.2) | C45-11 |
| P10 | AndroidDev volume not mounted | Blocks Android Gate 12 (P-06) |
| P11 | One https endpoint, no cleartext exception | **DONE** |
| P12 | Gate 10 test store `~/.acr-gateway/gate10/`: 5 invitations issued, all redeemed (none unused); 4 test sessions live, 1 (`gate10-at11`) revoked `REUSE_DETECTED` by the AT-11 replay test. Sessions expire 30 days after their redemption. | Revoke the 4 live test sessions at session close, or keep them for Gate 12 device testing |

---

**END OF GATE 10 COMPLETION EVIDENCE**
