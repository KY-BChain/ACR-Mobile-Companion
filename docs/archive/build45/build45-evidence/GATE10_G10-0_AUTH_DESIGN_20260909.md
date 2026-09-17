# Build 45 — Gate 10 / G10-0: Re-derived Authentication Design

**Authority:** `ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_1.md` §10, G10-0
**Date:** 9 September 2026
**Status:** **AWAITING KRAKEN'S WRITTEN GO/NO-GO. NO AUTH-01 IMPLEMENTATION HAS BEGUN.**
**Basis:** re-derived from backlog §10.2 (AUTH-01–16), §10.3 (AT-01–19), §10.4, and the
3 September review's disposition list — treated per **D-D** as *design input only, not
inherited code*.

---

## 0. Correction: the review lists 14 defects, not 15

Loop v1.1 §0.4 and G10-0 both say "15 defects", and my Gate 0 reconciliation log says
the same. **That count was mine and it was wrong.** The disposition table in
`T45-11-remote-gateway/docs/T45-11-REVIEW-REPORT.md` contains **14 rows**; the report
itself never states a total. The error originated in my 9 September reconciliation
report and propagated into Loop v1.1, which you wrote from it.

All **14** are mapped in §6. Nothing is missing — the set is smaller than stated, not
incomplete. No document is amended here; the correction is recorded for the sign-off.

---

## 1. What is inherited and what is re-derived

| Component | Decision |
|---|---|
| `gateway/src/app.js`, `schema.js`, `mapper.js`, `upstream-validator.js`, `platform-adapter.js`, `evidence-probe.js`, `synthetic-fixture-adapter.js`, `attestation.js` | **Inherited unchanged.** Accepted Build 45 baseline per D-D; proven at Gates 1–7. |
| `b3376e36` hardening (strict UUIDv4, `preRouteMiddleware`, `CLIENT_BUILD_MISMATCH` 403, dependency bumps) | **Inherited unchanged.** |
| `T45-11-remote-gateway/t3-gateway/persistent-auth.js` (JSON store) | **Not used.** Superseded, per D-B and D-D. Read for ideas only. |
| `T45-11-remote-gateway/t3-gateway/rate-limit.js` (in-memory) | **Not used.** Re-derived against SQLite so limits survive restart. |
| `T45-11-remote-gateway/t3-gateway/invite-admin.js`, `server.js`, `t3-gateway-hardened.js` | **Not used.** Re-derived. |

**Ideas carried forward from the design input** (attribution, not reuse): scrypt+pepper
invite hashing; keyed digests for tokens; constant-time comparison; refresh *families*
with rotation and replay-family revocation; owner-only `0600` secret files; a pepper
stored separately from the store.

**Weaknesses in that input that this design deliberately fixes:**

1. `redeem()` linearly scans every live invite computing `scryptSync` per candidate —
   O(n) slow hashes per attempt. That is a denial-of-service vector and contradicts
   AUTH-05's "indexed for constant-time lookup". → **selector/verifier scheme (§4.1)**.
2. Whole-state read-modify-write with no cross-process locking (the review's own
   residual list flags this). → **SQLite WAL + `BEGIN IMMEDIATE` transactions**.
3. Rate limiting held in memory, so a restart erases lockouts — AT-09 and AT-11
   conflict. → **rate limits persisted (§3.4)**.
4. No durability barrier on write. → **WAL + `synchronous=FULL`**.

---

## 2. Session model

### 2.1 Entities

```
Invitation ──1:N── Session(family) ──1:N── RefreshToken (chain, one live)
                          │
                          └──1:N── AccessToken (short-lived, many)
```

- **Invitation** — one named evaluator, one device. Single redemption by default.
- **Session** — the unit AUTH-05 calls a *structured session record*, and the unit
  revocation acts on. Created at redemption. Binds tester + Build 45 + app install.
  This is the "family" for replay detection.
- **RefreshToken** — a chain within a session. Exactly one is live; each rotation
  consumes the current one and issues its successor.
- **AccessToken** — 15-minute bearer, issued from a session, never stored on the client
  beyond memory.

A session is *usable* only when: not revoked, its invitation is not revoked, it has not
expired, and the presented device binding and client build match those recorded at
redemption. Every check is re-evaluated per request — nothing is cached in process
memory, so revocation is immediate (AUTH-06) and restart-safe (AUTH-10).

### 2.2 Binding

Bound at redemption, enforced on every authenticated request:

| Dimension | Source | Storage |
|---|---|---|
| Tester | invitation → session | `invitation_id` FK |
| Build | `X-Client-Build-ID` header + `client.buildId` body | `client_build_id` literal, compared to `config.expectedClientBuildId` |
| App install | `X-Device-Binding` (Keychain/Keystore-backed install proof) | **keyed digest only**, never plaintext |

A mismatch on any dimension fails closed with the existing `acr.error.v1` envelope —
`DEVICE_BINDING_MISMATCH` or `CLIENT_BUILD_MISMATCH`, HTTP 403, outcome
`NOT_SUBMITTED`. **No live-to-synthetic fallback ever occurs on an auth failure**
(AUTH-15); the client surfaces the failure through the existing FailClosed path.

---

## 3. SQLite schema

Store: `~/.acr-gateway/build45-auth.db`, mode `0600`, owner-checked at open.
Pepper: `~/.acr-gateway/build45-pepper.bin`, ≥32 random bytes, mode `0600`, **separate
file** so a store copy alone cannot verify anything. Both outside Git, the app bundle,
documents and command history (AUTH-13, §10.4).

Pragmas: `journal_mode=WAL`, `synchronous=FULL`, `foreign_keys=ON`.
*(All four verified working on `node:sqlite` under Node 22.14.0 before writing this.)*

### 3.1 `invitations`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUIDv4 |
| `selector` | TEXT UNIQUE NOT NULL | public half of the code — **indexed**, enables O(1) lookup |
| `verifier_hash` | TEXT NOT NULL | scrypt(secret ‖ pepper, salt) — the slow half |
| `salt` | TEXT NOT NULL | per-invite, 16 bytes hex |
| `label` | TEXT NOT NULL | non-clinical evaluator label, e.g. `reviewer-03` |
| `issued_by` | TEXT NOT NULL | named issuer (T45-08) |
| `issued_at` / `expires_at` | INTEGER NOT NULL | epoch ms; 7-day activation window |
| `max_redemptions` | INTEGER NOT NULL DEFAULT 1 | |
| `redemptions` | INTEGER NOT NULL DEFAULT 0 | |
| `revoked_at` / `revoked_reason` | INTEGER / TEXT NULL | lost-code procedure |

No plaintext code is ever stored (AUTH-12).

### 3.2 `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUIDv4 — the session identifier; **the only id permitted in logs, redacted** (AUTH-09) |
| `invitation_id` | TEXT NOT NULL REFERENCES invitations(id) | |
| `device_binding_hash` | TEXT NOT NULL | HMAC-SHA256(install proof, pepper) |
| `client_build_id` | TEXT NOT NULL | |
| `created_at` / `expires_at` | INTEGER NOT NULL | 30-day review window |
| `revoked_at` / `revoked_reason` | INTEGER / TEXT NULL | `ADMIN`, `REUSE_DETECTED`, `INVITE_REVOKED` |

Index: `sessions(invitation_id)`.

### 3.3 `access_tokens` and `refresh_tokens`

| Column | `access_tokens` | `refresh_tokens` |
|---|---|---|
| `token_hash` | TEXT PK — HMAC-SHA256(token, pepper) | same |
| `session_id` | NOT NULL REFERENCES sessions(id) | same |
| `issued_at` / `expires_at` | INTEGER NOT NULL (15 min from issue) | INTEGER NOT NULL — **always `sessions.expires_at`**, never `issued_at + 30d` (see §4.6) |
| `consumed_at` | — | INTEGER NULL — single-use marker |
| `superseded_by` | — | TEXT NULL — successor hash, for chain audit |

The token itself is 32 random bytes, base64url. **Only its keyed digest is stored**
(AUTH-13). A keyed HMAC — not scrypt — is correct here: these are 256-bit random
secrets, not human-entered, so there is nothing to brute-force and a slow hash would
only add latency. Human-entered invitation codes get scrypt precisely because they are
low-entropy.

Index: both tables on `session_id`; both on `expires_at` for sweeping.

### 3.4 `rate_limits`

| Column | Type |
|---|---|
| `bucket` | TEXT PK — `<class>:<subject>:<window>` |
| `count` | INTEGER NOT NULL |
| `window_start` | INTEGER NOT NULL |
| `blocked_until` | INTEGER NULL |

Persisted so a restart cannot clear a lockout — which is what makes AT-09 and AT-11
consistent rather than contradictory.

### 3.5 `audit`

| Column | Type |
|---|---|
| `id` | INTEGER PK AUTOINCREMENT |
| `at` | INTEGER NOT NULL |
| `event` | TEXT NOT NULL — `INVITE_ISSUED`, `INVITE_REDEEMED`, `REFRESH_ROTATED`, `REUSE_DETECTED`, `SESSION_REVOKED`, `RATE_LIMIT_BLOCK` |
| `session_id` | TEXT NULL — redacted to first 8 chars on emit |
| `invitation_label` | TEXT NULL — non-clinical label only |
| `detail` | TEXT NULL — **constrained vocabulary; never free text, never a token, never a hash, never clinical data** |

Minimal non-clinical audit metadata only (T45-08, §10.4).

---

## 4. Token lifecycle

### 4.1 Invitation → session (AUTH-01, AUTH-02)

**Code format:** `ACR45-<selector>-<secret>`, where `selector` is 8 and `secret` is 12
Crockford-base32 characters (unambiguous, human-transcribable). Total entropy in the
secret ≈ 60 bits.

This **selector/verifier** split is the substantive change from the design input:

1. Split on `-`; if the shape is wrong → generic `INVITE_INVALID`.
2. `SELECT ... WHERE selector = ?` — a single indexed lookup, O(1), **one** scrypt.
3. `scrypt(secret ‖ pepper, salt)` → compare with `crypto.timingSafeEqual` (AUTH-11).
4. Check not revoked, not expired, `redemptions < max_redemptions`.
5. In one `BEGIN IMMEDIATE` transaction: increment `redemptions`, insert `sessions` row,
   insert first refresh + access token, write audit row, `COMMIT`.

Every failure path returns the **same** `INVITE_INVALID` error and takes the same work,
so a caller cannot distinguish "no such selector" from "wrong secret" from "expired".

**Response:** access token (15 min) + refresh token (30 days).

### 4.2 Access-token use (AUTH-03, AUTH-04, AUTH-14)

Per request: digest the bearer → indexed PK lookup → join session → verify not expired,
session live, invitation live, device binding digest matches, build id matches. Any
failure → 401/403, fail closed. Client holds the access token **in memory only**.

### 4.3 Refresh rotation and reuse detection (AUTH-06, AUTH-07, AT-17)

Rotation, in one `BEGIN IMMEDIATE` transaction:

```sql
UPDATE refresh_tokens
   SET consumed_at = ?, superseded_by = ?
 WHERE token_hash = ? AND consumed_at IS NULL;
```

`changes === 1` → this caller won; issue the successor pair.
`changes === 0` → the token was already consumed, i.e. **replay**. Revoke the entire
session (all access and refresh tokens for that `session_id`), write a `REUSE_DETECTED`
audit row, return 401.

This single conditional UPDATE is what makes AT-17 deterministic: two simultaneous
refreshes with the same token cannot both succeed, because SQLite serialises the write
and only one sees `consumed_at IS NULL`. **I verified this primitive behaves exactly so
on `node:sqlite` before proposing it** (`changes` 1 then 0).

Client stores the refresh token in **iOS Keychain / Android Keystore** (AUTH-03),
supplied to the gateway layer through an injected `InstallationProofStore` adapter so no
platform API leaks into transport code.

### 4.4 Revocation (AUTH-06) and restart recovery (AUTH-10)

Revocation writes `revoked_at` on the session (or invitation, cascading). Because every
request re-reads state, the next request fails — no cache to invalidate.

On restart, nothing is trusted from memory: expired rows are swept, and every session is
re-validated from disk on first use. **No old or unknown session is silently accepted.**
A store that fails integrity validation is refused at open rather than repaired.

### 4.5 Rate limiting ahead of authentication (AUTH-08)

Applied **before** any credential work, via the inherited `preRouteMiddleware` hook, so
brute force never reaches scrypt. Per backlog AT-09: **10 failed attempts in 1 minute →
blocked 5 minutes**, keyed on invitation selector and on a coarse caller class. A
general-route limit sits above it. Local limiting is a safety fuse only — because
cloudflared is the local peer, per-reviewer IP limiting must be proven at the Cloudflare
edge (§10.4, and a residual blocker in the 3 September review).

---

## 5. Requirements coverage (AUTH-01–16)

| ID | Where satisfied |
|---|---|
| AUTH-01 | §4.1 — one-time code, 7-day window, 20 chars in `ACR45-<8>-<12>` |
| AUTH-02 | §4.1 — 15-min access + 30-day refresh |
| AUTH-03 | §4.2/§4.3 — access in memory; refresh in Keychain/Keystore |
| AUTH-04 | §2.2 — tester + Build 45 + install bound at redemption |
| AUTH-05 | §3.2 — `sessions` table; PK/indexed lookup, not a hash list |
| AUTH-06 | §4.4 — server-side `revoked_at`, effective next request |
| AUTH-07 | §4.3 — conditional UPDATE detects replay, revokes the whole session |
| AUTH-08 | §4.5 — persisted limiter ahead of authentication |
| AUTH-09 | §3.5 — only a redacted session id; constrained vocabulary |
| AUTH-10 | §3, §4.4 — SQLite WAL + `synchronous=FULL`; explicit restart recovery |
| AUTH-11 | §4.1/§4.2 — `crypto.timingSafeEqual` on equal-length digests |
| AUTH-12 | §3.1 — scrypt + per-invite salt + pepper |
| AUTH-13 | §3.3 — HMAC-SHA256 keyed digests; no plaintext |
| AUTH-14 | §3.3/§4 — expiry enforced in SQL and re-checked per request |
| AUTH-15 | §2.2 — auth failure never switches delivery mode |
| AUTH-16 | Edge terminates TLS; §7 keeps the origin loopback-only |

## 5.1 Acceptance tests (AT-01–19)

All nineteen are runnable against this design without live infrastructure except AT-14
(TLS) and AT-13's second device, which need the Gate 10 tunnel. Notes on the three that
need care:

- **AT-11 (persistence)** — restart the process, assert sessions survive *and* that
  rate-limit blocks survive, which the in-memory design could not do.
- **AT-12 (constant time)** — code inspection for `timingSafeEqual` plus a timing
  distribution over ≥1000 valid/invalid pairs, asserting no material separation. The
  selector/verifier scheme makes this meaningful, since every path does exactly one
  scrypt.
- **AT-17 (concurrent refresh)** — driven through the §4.3 conditional UPDATE with two
  genuinely concurrent callers; exactly one must succeed.

---

## 6. Mapping to the 3 September review's 14 dispositions

| # | Supplied defect | How this design addresses it |
|---|---|---|
| 1 | Any format-valid invite, refresh token and bearer token was accepted | **Directly re-derived.** §4.1 scrypt+pepper verifier over an indexed selector; §3.3 keyed digests; §4.2 per-request expiry + binding checks; §4.3 rotation with replay-family revocation. Nothing is accepted on shape alone. |
| 2 | Monolith did not validate/map all 20 fields and rejected the real platform wrapper | **Not re-introduced.** Auth is a `preRouteMiddleware` layer only; the inherited AJV schema, 20-field mapper and upstream validator are untouched — proven at Gates 4–6 (all 21 governed properties, identifiers refused at two layers). |
| 3 | Attestation was reachability-only, unprotected and did not gate Live | **Inherited gate retained.** `attestation.js` stays authenticated and pinned; Gate 7's connection model makes live submission fail-closed unless attestation is `VERIFIED`. |
| 4 | Synthetic route returned an invalid placeholder | **Inherited adapter retained.** Immutable exact-input fixture replay is unchanged; auth does not touch it. |
| 5 | Client headers, bodies, token lifecycle and errors differed from Build 44 | **Contract preserved.** `X-Client-Build-ID`, `X-Device-Binding`, `X-ACR-Contract`, `clientBuildId` and `acr.error.v1` are the existing ones, now locked by `tests/contract/verify.js` (Gate 3). |
| 6 | Random request ID and installation placeholder | **Inherited generator retained.** `b3376e36`'s strict UUIDv4 request-id stands; install proof arrives through an injected Keychain/Keystore adapter (§2.2), never invented by transport code. |
| 7 | T3 host/upstream accepted unsafe values and redirects | **Inherited config retained and extended.** Loopback-bound origin, `redirect: 'error'` on both fetch paths, plus Gate 3's `ACR_PUBLIC_HOSTNAME` 421 check. |
| 8 | T4 route expressions matched prefixes/suffixes | **Unchanged from the retarget.** All six paths remain `^…$`-anchored with two default-deny rules; `cloudflared ingress validate` passed after `d4f5c421`. |
| 9 | Credential path used tunnel name instead of generated UUID | **Unchanged.** Template remains `<YOUR_TUNNEL_UUID>.json`; §10.1 records the credential location as evidence, outside Git. |
| 10 | Launch service hardcoded Apple-Silicon path and ran a user binary as root | **Unchanged and still review-only.** Auto-start disabled; per-user LaunchAgent preferred. No launchd state is installed at this gate. |
| 11 | Setup immediately mutated login, DNS, tunnel and launchd state | **Preserved as read-only preflight.** Tunnel creation is a distinct §10.1 step under your authorisation; this design changes no external state. |
| 12 | Health script could finish successfully after failures | **Unchanged.** Bounded checks, bypass negatives, TLS expiry check, non-zero exit retained. |
| 13 | Android round icon absent; iOS path wrong | **Not affected by auth.** Remains corrected; verified at Gate 12 build time. |
| 14 | ATS/Android config falsely claimed global hostname allowlisting | **Wording stays corrected, and is now enforced.** Gate 3's build-time endpoint governance compiles exactly one origin with no runtime switching — asserted by `tests/contract/verify.js`. |

Defects 2–4, 6–14 are addressed by *not* re-introducing the rejected monolith and by
retaining inherited components; defect 1 is the one this design genuinely re-derives.

---

## 7. What this design does not change

Same-backend architecture is preserved absolutely: the gateway performs transport,
authentication and validation only. Ontology, SWRL/Openllet, Java aggregation and Bayes
remain platform-only. No clinical classifier, no copied reasoner, no fallback switch. The
origin stays loopback-bound; the edge terminates TLS.

---

## 8. Open questions for your decision

**Q1 — SQLite driver.** `node:sqlite` (built into Node 22.14.0) is functional and I
verified WAL, `foreign_keys`, transactions and the conditional-UPDATE primitive on it.
It emits `ExperimentalWarning` and its API may change across Node versions.
`better-sqlite3` is mature and stable but adds a native dependency requiring a build
toolchain. **Recommendation: `node:sqlite`** — no new supply-chain surface, and the
gateway pins its Node version; the experimental flag is a stability risk on upgrade, not
a security one. Your call.

**Q2 — Invitation code length.** `ACR45-<8>-<12>` is 20 significant characters, above
backlog AUTH-01's stated 8–12. The selector needs its own entropy to be an unguessable
lookup key. I judged transcription cost worth the O(1) lookup and uniform failure path.
If you prefer AUTH-01's literal 8–12, say so and I will use a single secret with a short
indexed prefix, accepting a small hash-bucket scan.

**Q3 — Admin/revocation endpoint (AT-08, AT-16).** I propose **no network admin
endpoint**: revocation runs as a local owner-only CLI against the SQLite file. That
removes an entire attack surface, and AT-16 ("revocation endpoint rejects
non-admin requests") is then satisfied vacuously — which I want your explicit agreement
on rather than quietly declaring the test inapplicable.

**Q4 — WITHDRAWN.** Superseded by your instruction 4: no shared review-window cutoff
exists. Expiry is a flat 30 days anchored at each evaluator's own redemption. See §4.6
and §10.4.

---

## 9. Sign-off

Per Loop v1.1 G10-0, **no AUTH-01 implementation begins until you record a written
GO/NO-GO on this design specifically**, separate from the backlog/Loop approval already
given. Answers to Q1–Q4 (or "your recommendation" on each) are enough to proceed.

**STOP condition honoured:** §10.2 has not been entered.

---

## 10. G10-0 addendum — answers to the five pre-GO points

### 10.1 Scope: shared basis for the companion app and any future WeChat surface

Confirmed. The re-derived design — selector/verifier invitations, SQLite WAL, persisted
rate limiting, HMAC token digests — is the shared basis for both surfaces. The original
proposal's code is not reverted to on either.

Three constraints follow, and the design already meets them:

1. **The auth layer stays transport- and platform-agnostic.** Nothing under
   `gateway/src/auth/` may import a React Native, Expo or WeChat API. The surface
   differences live entirely in the client.
2. **Install proof is an opaque string, not a platform artefact.** The gateway accepts
   `X-Device-Binding` as 8–256 opaque characters and stores only its keyed digest. It
   never asserts *how* the proof was produced. On the companion app that is a
   Keychain/Keystore-backed value; a WeChat surface would supply its own stable
   per-install value through the same header. No gateway change is needed to add a
   surface.
3. **The wire contract is already surface-neutral** — `/m/v1/auth/redeem`,
   `/m/v1/auth/refresh`, `X-Client-Build-ID`, `X-Device-Binding`, `X-ACR-Contract`,
   `acr.error.v1`. A second surface registers a different `clientBuildId`; it does not
   need a second protocol.

**Flagged, not solved here (WeChat is out of scope per Loop v1.1 §0.2):** a WeChat
Mini-Program has no Keychain/Keystore equivalent, so refresh-token storage there is
weaker than on the companion app. That is a real difference in achievable assurance and
should be assessed in the separate WeChat backlog before that surface is authorised —
it is not resolved by this design and must not be assumed equivalent.

### 10.2 Where refresh-token expiry is set, for the record

Once implemented, refresh-token expiry will be set in exactly one place:

| Item | Value |
|---|---|
| **File** | `gateway/src/auth/session-store.js` |
| **Function** | `issueTokenPair(db, sessionId, now)` |
| **Statement** | the `INSERT INTO refresh_tokens (...) VALUES (...)` binding for `expires_at` |
| **Value bound** | `session.expires_at` — read from the `sessions` row, never recomputed |
| **Constants** | `gateway/src/auth/lifetimes.js` — `ACCESS_TOKEN_MS = 15 * 60 * 1000`, `SESSION_MS = 30 * 24 * 60 * 60 * 1000`, `INVITE_ACTIVATION_MS = 7 * 24 * 60 * 60 * 1000` |

`SESSION_MS` is consumed in exactly one other place — `createSession(db, invitationId, …)`
in the same file, which sets `sessions.expires_at = now + SESSION_MS` at redemption.
`issueTokenPair` never reads `SESSION_MS`; it only copies the session's stored value. That
is what makes sliding expiry structurally impossible rather than merely intended.

Access-token expiry is set in the same `issueTokenPair`, as `now + ACCESS_TOKEN_MS`.

### 10.3 Lost-invitation-code procedure (T45-08)

Not previously specified. Proposed:

1. **Report.** The evaluator notifies the named issuer through the approved private
   channel. No code material is ever quoted in the report.
2. **Revoke immediately, before anything else.** `acr-invite revoke --label <label>
   --reason LOST`. This sets `invitations.revoked_at` and cascades: every session
   created from that invitation is revoked in the same transaction, so any already-issued
   access and refresh tokens stop working on the next request. Revocation precedes
   re-issue so a found-and-abused code cannot run in parallel with its replacement.
3. **Re-issue as a new invitation, never a re-send.** A new `id`, new `selector`, new
   `salt`, new secret, fresh 7-day activation window. The old row is retained
   (revoked) for audit; it is never reactivated or edited.
4. **Deliver** the new plaintext once, through the approved private channel, and do not
   record it anywhere — not in the store, a report, a document, or shell history.
5. **Audit.** Two rows: `SESSION_REVOKED` with reason `LOST` and `INVITE_ISSUED` with the
   evaluator label and named issuer. Non-clinical metadata only.
6. **Device change is the same procedure.** Because a session binds one app install,
   a reinstall or new device requires a new invitation, not a re-bind. There is
   deliberately no "move my session" path — that would be an unauthenticated rebinding
   primitive.

Suspected compromise, as opposed to loss, follows the same steps plus revocation of the
evaluator's *other* live sessions, if any, and an explicit note in the evidence package.

### 10.4 Session expiry — confirmed as already per-user, with one correction

**Confirmed for the anchor:** the design already does what you describe. There is no
shared review-window cutoff anywhere in it. `sessions.expires_at` is set at each
evaluator's own redemption (§4.1, in the redemption transaction), so two evaluators who
redeem a fortnight apart expire a fortnight apart. Q4, which had contemplated aligning
sessions to a shorter shared review window, is **withdrawn**.

**One correction to make it unambiguous.** §3.3 previously described
`refresh_tokens.expires_at` only as "30 days", without stating what happens on rotation.
Read naively that would mean each rotation issues a successor with a *fresh* 30 days —
sliding expiry, under which an evaluator who refreshes regularly would never expire and
AT-05 could never fire. That is not what you have specified, so the design now states it
explicitly:

> A refresh token's `expires_at` is **always the parent session's `expires_at`**, copied
> from the `sessions` row. It is never `issued_at + 30 days`. Rotation issues a successor
> that expires at the same fixed instant as its predecessor.

So the lifetime is a flat 30 days from that individual's redemption, and rotation moves
the token but not the deadline. §10.2 records the single code site where this is bound.

### 10.5 The existing Build 44 SHA-based login key — origin, and replacement

**Its origin is not unknown.** It entered in `119a2e5a`, the Build 44 delivery commit
(2 September 2026, KrakenYu), and is documented in `gateway/README.md` and
`docs/loop/ACR_PLATFORM_AND_MOBILE_GATEWAY_MANUAL_OPERATIONS_01SEPT26.md`, which shows
the operator computing it as `printf '%s' "$ACR_INVITE_CODE" | shasum -a 256`.

What it actually is — `InMemoryAuthService` in `gateway/src/auth.js`:

| Property | Build 44 behaviour |
|---|---|
| Invite | **One shared code for all evaluators**, supplied as `ACR_INVITE_CODE_SHA256` at process start. No per-invitee concept exists. |
| Hashing | Unsalted, single-round SHA-256 |
| Comparison | `crypto.timingSafeEqual` — this part is sound |
| Tokens | `crypto.randomUUID()`, held **in plaintext** as `Map` keys |
| Sessions | Three in-memory `Map`s; everything is lost on restart |
| Binding | Device binding and client build are bound, and family revocation on reuse exists |

Measured against Build 45 it fails AUTH-01 (no per-invitee one-time code), AUTH-05 (not
structured session records), AUTH-10 (no persistence), AUTH-12 (not a slow hash) and
AUTH-13 (tokens not stored as digests). Backlog §10.4 names this defect directly:
invite storage must use "a reviewed slow password hash or keyed verification design
appropriate to human-entered codes rather than relying only on unsalted fast SHA-256".

**Answer: Build 45 replaces it entirely. It must not keep functioning alongside.**

- Two authentication paths mean the weaker one defines the security of the system. A
  shared unsalted-SHA code retained "for continuity" would be exactly the direct bypass
  §10.4 prohibits.
- It cannot satisfy T45-08 even in principle: per-invitee issue, expiry, individual
  revocation and a lost-code procedure are impossible against a single shared secret.
- **No transition period is needed, because build binding already enforces the cut.**
  Build 44 clients identify as `mob-v0.6.0+44`, which the Build 45 gateway rejects with
  `CLIENT_BUILD_MISMATCH` — the negative tests added in the identity bump (`69bccf5a`)
  assert exactly this. A Build 44 app already cannot reach the Build 45 gateway,
  whatever its invite code.

**Implementation consequence:** `InMemoryAuthService` and the `ACR_INVITE_CODE_SHA256`
configuration are removed in §10.2's implementation, not left dormant, and
`gateway/README.md` plus the manual-operations document are updated in the same commit
so no operator procedure still points at the retired mechanism. Dormant-but-present auth
code is itself a hazard.

---

## 11. Revised status

| Point | Status |
|---|---|
| 1 — shared basis for both surfaces | Confirmed; three constraints recorded; WeChat storage-assurance gap flagged for its own backlog |
| 2 — where refresh expiry is set | `gateway/src/auth/session-store.js` → `issueTokenPair()`, binding `session.expires_at`; constants in `lifetimes.js` |
| 3 — lost-code procedure | Specified in §10.3 — **needs your confirmation before Gate 10 closes** |
| 4 — flat per-user 30 days | Confirmed as already per-user; sliding-expiry ambiguity corrected in §3.3 and §10.4 |
| 5 — Build 44 SHA key | Origin identified (`119a2e5a`); replaced entirely; no coexistence; already cut off by build binding |

Outstanding for GO: **Q1** (SQLite driver), **Q2** (invite code length), **Q3**
(no network admin endpoint, making AT-16 vacuous), and confirmation of **§10.3**.

**STOP condition still honoured: §10.2 has not been entered.**

---

**END OF G10-0 DESIGN**
