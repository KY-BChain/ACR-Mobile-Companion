# Build 45 — Gate 10 Live Evidence: §10.1 Tunnel, Live-Platform Integration, AT-14

**Authority:** `ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_1.md` §10
**Date:** 11 September 2026
**Result:** §10.1 **DONE** · live-platform integration over loopback **PASS** ·
**AT-14 FAIL → Loop v1.1 §10.4 STOP CONDITION.** Testing halted, system placed in a
safe state, awaiting Kraken.

All traffic was synthetic and non-patient. No invitation code, access token or refresh
token appears in this document, in any committed file, or in command history — codes
were written to `0600` files and read by the driver, never echoed.

---

## 1. Components in scope — the Build 45 gateway only

| Component | Path / identity | Role in Gate 10 |
|---|---|---|
| **Build 45 gateway** | `acr-mobile-companion/gateway`, `127.0.0.1:3001` | **The gateway under test** |
| T1 — Spring Boot | PID 31233, `:8080`, serving `/Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface` | Verified read-only; never started/stopped |
| T2 — `acr-api` tunnel | PID 34190, `cloudflared tunnel run --url http://localhost:8080 acr-api` | Verified read-only; never started/stopped |
| `acr-mobile-review` tunnel | created this session | §10.1 |
| Old Build 44 T3 | `acr-mobile-companion-extended/gateway` | **Out of scope, not touched.** It still carries the retired `InMemoryAuthService` and cannot serve Build 45. |

---

## 2. Pre-test verification of T1/T2 (read-only, Doc 2 commands)

Run before every live step and again after the safe-state stop.

| Check | Result |
|---|---|
| `lsof -iTCP:8080` | `java` PID 31233 listening |
| `curl localhost:8080/api/infer/health` | `success:true`, HTTP 200 |
| `curl localhost:8080/api/ontolator/status` | v2.2, 71 logical / 76 physical / 76 active / 76 loaded / 27 queries |
| `pgrep cloudflared.*acr-api` | PID 34190 |
| `lsof -iTCP:20241` | acr-api metrics listener present |
| `cloudflared tunnel info acr-api` | 1 connector, 4 edge connections (1×cdg10, 1×cdg13, 2×lhr13) |
| `curl https://api.acragent.com/api/infer/health` / status / manifest | HTTP 200 / 200 / 200 |

**T1 and T2 were healthy throughout. Neither was started, stopped or restarted.**
T2's PID was identical (34190) before §10.1 and after the safe-state stop, and its
credentials file kept its 20 May mtime.

---

## 3. §10.1 — Tunnel creation

| Step | Result |
|---|---|
| Port 3001 free before start | Confirmed |
| `cloudflared tunnel create acr-mobile-review` | Created, **id `a9959b5a-3225-4218-813c-c0cd68de5f6a`** |
| Interactive login needed? | **No.** The existing 20 May origin certificate (`~/.cloudflared/cert.pem`) authorised creation. This corrects my earlier statement that `tunnel login` was required. |
| Runtime config | `~/.cloudflared/acr-mobile-review.yml`, mode `0600`, rendered from `T45-11-remote-gateway/t4-tunnel/cloudflared-config.yml` (`d4f5c421`); 0 placeholders left |
| `ingress validate` | **OK** |
| Ingress routing | `/m/v1/live`, `/m/v1/auth/redeem`, `/m/v1/infer` → `127.0.0.1:3001`; `/m/v1/liveevil`, `/m/v1/live/`, `/admin`, `/` → 404; `api.acragent.com` on this tunnel → 404 (no overlap with `acr-api`) |
| `route dns` | CNAME `mobile-gateway-review.acragent.com` → tunnel, confirmed via authoritative NS, 1.1.1.1 and 8.8.8.8 |
| Tunnel run | 4 edge connections (lhr13 ×2, cdg12, cdg10), `protocol=http2`, config loaded from the explicit file |
| Origin bind | `127.0.0.1:3001` only — `lsof` shows no wildcard |

**Credentials storage location (§10.1 requires it recorded):**
`/Users/Kraken/.cloudflared/a9959b5a-3225-4218-813c-c0cd68de5f6a.json`, mode `0400`,
outside Git, the app bundle and all documents. Its contents were never read or printed.

**Protection of `acr-api`.** T2 runs with `--url` and no `--config`, so a future restart
would read a default `~/.cloudflared/config.yml` if one existed. None was created: the new
tunnel uses its own named file and was always launched with an explicit `--config`.

---

## 4. Live-platform integration test — PASS

**Path:** loopback → Build 45 gateway → T2 (`https://api.acragent.com/api/infer`) → T1.

Gateway configuration: SQLite auth store at `~/.acr-gateway/gate10/` (dedicated test
store, `0600`, separate from the operator store); pinned evidence URLs on
`api.acragent.com`; ontology `/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl`
(read-only; SHA-256 `b9102586…` equals the pinned baseline and the file T1 serves);
`ACR_PUBLIC_HOSTNAME=mobile-gateway-review.acragent.com`.

**Request:** complete synthetic 21-property assessment, schema-validated by the
gateway's own AJV schema before sending.

| Stage | Result |
|---|---|
| `POST /m/v1/auth/redeem` | **200**, Bearer, access 900 s, refresh expiry exactly 30 days from redemption |
| `GET /m/v1/attestation` | **200, `VERIFIED`** — v2.2, `OPENLLET_SWRL`, 71/76/76/76/27, ontology hash match |
| `POST /m/v1/infer` | **200**, `acr.cds.v1`, `resultMode LIVE_REASONER`, `reasoningMode OPENLLET_SWRL` |
| Delivery | `CONFIGURED_PLATFORM`, `currentExecution: true`, `currentVerificationState: VERIFIED` |
| Subtype / risk | `LuminalB_HER2Negative` / `INTERMEDIATE` |
| Completeness | Tier 3, 0 rules blocked |
| Treatments | chemo + endocrine; **R17b** adjuvant (Luminal B T2 post-surgery); R33 follow-up cadence |
| Fired rules | `R2/R3, RE3, R33, RE4-2, RE4-1` |
| Bayes | enabled, confidence `0.6001915864330829` |
| Patient id | echoed correctly (synthetic `mob-` UUID) |
| Round trip | 2,056 ms |

**Cross-check against Gate 1.** The live platform's output matches the isolated-worktree
complete-fixture run exactly — same subtype, risk, tier, R17b treatment and Bayes
confidence to 16 significant figures. The live T1 and the Gate 1 worktree at `33daead3`
agree. The `firedRules[]` order differs again from every Gate 1 run, consistent with the
T45-04 contract that position carries no meaning.

Raw synthetic response: `live-infer-loopback-response.json` (secret-scanned: no invite
code, token, device binding or identifying field).

The G3-02 host check also held live: a loopback request without the approved `Host` was
refused with **421 `MISDIRECTED_REQUEST`**.

---

## 5. AT-14 TLS only — **FAIL** (STOP condition)

| Probe | Result |
|---|---|
| `https GET /m/v1/live` | 200 — TLS 1.3, `TLS_AES_256_GCM_SHA384`, certificate verified |
| Legacy TLS 1.0 / 1.1 | both refused ✅ |
| **`http GET /m/v1/live`** | **200 over cleartext, no redirect** ❌ |
| **`http POST /m/v1/auth/redeem`** (deliberately invalid code) | **401 from the gateway** ❌ |

Proof the cleartext request reached the origin rather than being answered by the edge:
the 401 carried helmet's CSP and `x-content-type-options: nosniff` headers and an
`acr.error.v1` `INVITE_INVALID` body. Only the Build 45 gateway produces those.

**Consequence.** Cloudflare is proxying plain HTTP for this hostname. A client that sends
a credential to `http://` transmits it unencrypted between the client and the Cloudflare
edge, and the gateway processes the request. AUTH-16 ("all requests TLS-only") and
backlog §10.4 ("no … direct HTTP") are not met at the edge.

**Scope of exposure during the test.** The public hostname was live for about four
minutes. Only the probes above and no genuine credentials travelled over HTTP. The
Build 45 app compiles only `https://` origins, so it would never have sent a cleartext
request.

**Per Loop v1.1 §10.4 this is a STOP:** "any of the above constraints found unmet at test
time". The public-leg integration test, the live AT-13 and the live AT-11 restart test
were **not run**.

### Recommended remediation — Kraken's decision

1. **Edge (the real fix).** In the Cloudflare dashboard, make cleartext impossible for this
   hostname. For an API endpoint, a **block** is preferable to a redirect, because a
   redirect still means the first request crossed the wire in cleartext. Options:
   - a WAF custom rule on `http.host eq "mobile-gateway-review.acragent.com" and not ssl`
     → Block (scoped to this hostname only; leaves `www` and `api` unaffected); or
   - Always Use HTTPS — **zone-wide**, so it would also change `www.acragent.com` and
     `api.acragent.com`.

   Neither can be done from `cloudflared`; both need dashboard or API access.

2. **Gateway (defence in depth, not a substitute).** When `ACR_PUBLIC_HOSTNAME` is set,
   refuse any request whose forwarded scheme is not `https`. Cloudflare sets
   `X-Forwarded-Proto` and `CF-Visitor` on proxied requests. This would stop the origin
   ever *processing* a cleartext request, and would keep AT-14 true if the edge setting
   regressed. It cannot prevent the bytes crossing the wire, so on its own it does not
   satisfy AUTH-16. **Not implemented:** it is a STOP-gated change, and the exact header
   that cloudflared forwards must be observed before code relies on it.

---

## 6. Other findings (not STOP conditions)

**F-1 — The gateway writes no request log in production.** `createMetadataLogger(sink = () => {})`
defaults to a no-op sink, and `listener.js` never supplies one. The logger's allow-list
design is privacy-sound (it can only emit `requestId, route, method, status, code,
durationMs, resultMode, reasoningMode`), but nothing is ever written. Consequences:

- AT-10 and G12-04 log-privacy checks currently pass because **no log exists**, not
  because a log was inspected and found clean;
- there is no HTTP-level record for incident response, rate-limit forensics or the
  §10.4 health monitoring, although auth events are recorded in the SQLite `audit` table.

**Recommendation:** wire the sink to structured stdout. Log-privacy evidence should then
be re-gathered against real output, and a retention policy set.

**F-2 — T1 listens on all interfaces.** `lsof` shows `java … TCP *:8080`, not
`127.0.0.1:8080`, so T1 is reachable from the LAN directly. This is pre-existing platform
posture, outside Build 45's authority (the canonical checkout is read-only), and the
mobile app cannot reach it — it compiles only the gateway origin. It is still relevant to
§10.4's "no direct platform bypass" and is recorded for the platform backlog.

**F-3 — The first DNS lookup was empty.** The first local lookup after `route dns`
returned nothing; the authoritative NS, 1.1.1.1 and 8.8.8.8 all answered within a minute,
and the local resolver shortly after. This was propagation lag, not a fault. Worth
knowing for the regional-reachability work.

---

## 7. AT-13 and AT-14 status

| Test | Automated (§10.3) | Live through the public hostname |
|---|---|---|
| **AT-13** binding | **PASS** — refresh and access from a second device binding are refused with `DEVICE_BINDING_MISMATCH`, and the legitimate device keeps working | **Not run** — halted by the AT-14 STOP. A true second *physical* device additionally needs the app rebuilt with `ACTIVE_GATEWAY_ORIGIN = BUILD45_REVIEW_ORIGIN` and installed (Gate 12 build path) and operated by Kraken. |
| **AT-14** TLS only | Origin loopback-only and https-only client origin: PASS | **FAIL** — cleartext HTTP proxied to the origin (§5) |

---

## 8. Safe state at halt

| Item | State |
|---|---|
| `acr-mobile-review` tunnel process | **Stopped** (PID 53916, SIGTERM, command verified before kill). No connector remains. |
| Public hostname | Returns **530** on both HTTP and HTTPS — origin unreachable |
| Build 45 gateway | **Stopped** (PID 53904). Port 3001 free. |
| T1 | PID 31233, healthy — untouched |
| T2 | **PID 34190, same process as at the start**, public health 200, credentials mtime 20 May — untouched |
| `~/.cloudflared/config.yml` | Does not exist — never created |
| Tunnel object + DNS CNAME | **Retained**, both authorised §10.1 artefacts. Inert with no connector. Deleting the tunnel revokes its credentials. |
| Gate 10 test store `~/.acr-gateway/gate10/` | Retained for resumption. `gate10-integration` redeemed (1 session); `gate10-at13`, `gate10-at11`, `gate10-public` unused. All codes expire 7 days after issue. Codes live only in `0600` scratchpad files outside Git. |

**To resume after remediation:** start the gateway and the tunnel with the same commands,
re-verify T1/T2, re-run AT-14, then complete the public-leg integration, the live AT-13
and the live AT-11 restart. **To withdraw instead:**
`node gateway/src/auth/invite-admin.js revoke --label <label>` for each unused invite,
and `cloudflared tunnel delete acr-mobile-review`.

---

**END OF GATE 10 LIVE EVIDENCE**
