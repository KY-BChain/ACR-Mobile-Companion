# Build 45 — Gate 0 Pre-Flight Reconciliation Log

**Session:** ACR-Mobile-Build45-Loop-v1.0-S001 (bridge session)
**Date:** 9 September 2026
**Executor:** Claude Code
**Authority:** `ACR_MOBILE_BUILD45_PREFLIGHT_RECONCILIATION_v1_0.md`
**Companion:** `GATE0_PREFLIGHT_LOG_20260909.md` (not modified)
**Outcome:** Conflicts A, B, C, F resolved. **D-D and D-E remain HARD STOPS.**
Pre-flight re-run passes except P-06 and P-08, both blocked on owner physical action.
**Gate 1 not entered** — see §6.

---

## Part I — Investigation (read-only)

### I-A — Tunnel `acr-mobile-gateway-t4`: **NEVER ACTIVATED**

| Probe | Result |
|---|---|
| `cloudflared tunnel list` | Only `acr-api` `56ea5620-5ecd-41eb-96d5-1197df92d704` (created 2026-05-20). No t4 tunnel exists in the account. |
| `~/.cloudflared/` credentials | Only `56ea5620-….json` (mtime 20 May 2026) and `cert.pem`. No t4 credentials file. |
| Local config | No `config.yml`, no `acr-mobile-gateway-t4.yml`. |
| launchd / brew service | No LaunchAgent installed, no service loaded, no `~/.cloudflared/logs/`. |
| `dig mobile.acragent.com` | **No answer — does not resolve.** |
| `dig mobile-gateway-review.acragent.com` | No answer — does not resolve (expected; Gate 10 would create it). |
| `dig api.acragent.com` | 172.67.163.223, 104.21.57.124 (Cloudflare edge — existing acr-api route). |

**Conclusion:** the t4 tunnel was never created, never routed, never run. → D-A AUTO-RESOLVE authorised.

### I-B — Provenance of `b3376e36` and the T45-11 module: **BULK IMPORT, BUT INDEPENDENTLY REVIEWED**

- Gateway sources (`app.js`, `config.js`, `evidence-probe.js`, `platform-adapter.js`) were all **first introduced** by `119a2e5a` (Build 44), author KrakenYu <kybchain@gmail.com>. Normal in-repo lineage.
- The **entire 26-file `T45-11-remote-gateway/` module was added in one commit**, `b3376e36` (8 Sep 2026, KrakenYu). `git log --all -- T45-11-remote-gateway/` returns exactly **one** commit. No incremental authorship. The commit message itself says "Move T45-11-remote-gateway.zip to docs/archive/" — i.e. a supplied zip was unpacked into the repo. **Bulk-import signature confirmed.**
- **Co-located review evidence exists and is substantive:**
  - `README.md` — "reviewed implementation candidate"; status *VIABLE LOCAL TEST CANDIDATE / NOT APPROVED FOR PUBLIC DEPLOYMENT (2026-09-03)*. States the originally supplied monolithic T3 and mobile client were "protocol-incompatible … and contained permissive authentication placeholders", and that the duplicate monolith was **rejected and replaced** by a composition of the existing tested modular gateway.
  - `docs/T45-11-REVIEW-REPORT.md` (3 Sep 2026) — enumerates **15 critical supplied defects with dispositions**, including "Any format-valid invite, refresh token and bearer token was accepted" → replaced by scrypt+pepper invite verification, hashed tokens, expiry, build/install binding, rotation and replay-family revocation. Lists 7 residual blockers (unsigned ADR, edge controls, Keychain/Keystore adapter, edge rate limiting, T45-08 operator recovery, country reachability NOT ASSESSABLE, clinical adjudication).
  - `docs/T45-11-LOCAL-TEST-EVIDENCE-20260903.md` — module suite 5/5, gateway Jest 158/158, e2e 4/4, dependency audit 0 known vulnerabilities, "Independent source re-review PASS for controlled local testing; public deployment remains blocked". Explicit "Not run / not accepted" list.
  - `adr/T45-11-ARCHITECTURE-DECISION-RECORD.md` — status **PROPOSED / NOT APPROVED — security review amendments required**; no owner signature.

- **Commit-message accuracy: the message is wrong in both directions.**
  - It claims "No gateway or mobile source changes; documentation and archive reorganisation only" — but the commit changed **46 files / 3942 insertions**, including gateway source, both JSON schemas, mobile TypeScript and a test harness.
  - It claims to add `BACKLOG_v0.5.md`, `AUTONOMOUS_EXECUTION_LOOP_v1_0.md`, `BACKEND_REASONER_FLOW_REAFFIRMATION_v0.1.md` and the Token-Based Auth doc — **it added none of them.** See §4 below.

- **Nature of the source changes (all reviewed and coherent):** generalise the frozen Build 44 identity so Build 45 can exist (`buildId` `const "mob-v0.6.0+44"` → pattern `^mob-v\d+\.\d+\.\d+\+\d+$` in both schemas, `requestBuilder.ts`, `types/api.ts`), plus defensive hardening — strict UUIDv4 request-id, `preRouteMiddleware` hook, `CLIENT_BUILD_MISMATCH` 403 build-binding, `redirect:'error'` on both fetch paths, dependency bumps (express 4.19.2→4.22.2, ajv 8.16.0→8.20.0, `qs` override 6.16.0, unused `uuid` dropped). No clinical logic, no classifier, no fallback switch.

### I-C — Repository layout: **single-repo confirmed**

- `acr-mobile-companion-extended`: `git rev-list --all --count` = **0**. Unborn HEAD, no remote. Re-confirmed, not acted upon.
- `119a2e5a` is an ancestor of HEAD and on the working branch. Its changed-file scope: **gateway 26, schemas 5, e2e 6, tests 7, src 36**, android 4, ios 2, docs 5, plus 32,494 `node_modules` removals — exactly matching the preserved evidence's description ("gateway, schemas, fixtures, end-to-end tests"; "32,494 tracked node_modules files removed").

### I-D — Competing plan documents: **UNCOVERED MATERIAL FOUND**

`docs/loop/…FULL_IMPLEMENTATION_PLAN_v1.0.md` (882 lines), `_v1.1.md` (926 lines), `_V1.0_REVIEW_2SEPT26.MD`.

**SHA discrepancy — explained, benign.** v1.1 is dated 2 September 2026 and cites predecessor `ab8140d2`. On that date `ab8140d2` was the **tip of the branch**; `119a2e5a` is the **Build 44 source commit**. `ab8140d2` is a docs-only descendant of `119a2e5a` on the same branch (verified: its diff against its parent touches no `gateway/`, `e2e/`, `schemas/` or `src/` file). Different referent, not a different lineage.

**Apple Watch — covered.** v1.0 Part 6 proposed an Apple Watch extension; **v1.1 Part 6 explicitly excludes it** from Build 45. The backlog/Loop pair's silence matches v1.1's exclusion.

**Material present in v1.1 and absent from BOTH backlog v0.5 and Loop v1.0** (string probes returned 0 hits in both governing documents):

| Item | Detail | Probe |
|---|---|---|
| Build 45 identity matrix | v1.1 §1.3 fixes the identity-only first change: Expo `0.6.5`/`45`, iOS `MARKETING_VERSION=0.6.5`/`CURRENT_PROJECT_VERSION=45`, Android `versionName 0.6.5`/`versionCode 45`, binding `mob-v0.6.5+45`, gateway package `0.6.5` | `mob-v0.6.5`, `versionCode`, `MARKETING_VERSION` — 0/0 |
| Native-project preservation | "Preserve the native `ios/` and `android/` projects; do not run Expo Prebuild or regenerate them" | `Prebuild` — 0/0 |
| Storage preflight | Internal/external free-space preflight before dependency restore and every native build; serial builds; preserve artifact hashes before removing intermediates; AndroidDev must be explicitly connected and verified | `free-space` — 0/0 |
| Contract-version decision | "Retain `acr.cds.v1` only if compatible; otherwise introduce a reviewed version and migration together" | `acr.cds.v1`, `contract version` — 0/0 |
| M0–M10 milestone model | Parallel governance model with entry/exit authority per gate. **M5→M6 requires independent security review and owner GO/NO-GO before gateway implementation** — the Loop folds this into Gate 10 with only the opening authorisation | `M0`, `M5` — 0/0 |
| Named Security Reviewer sign-off | v1.1 §11.2 requires `SECURITY-REVIEW-001` and `G-COMPLETE-REVIEW-002` sign-offs under `.acr-loop/v1.7/` | `Security Reviewer`, `SECURITY-REVIEW` — 0/0 |
| ADR requirement | v1.1 §2.11/§5.3 require a signed upstream-route ADR and genuine off-LAN tests before implementation | `ADR` — 0/0 |
| T45-06c re-scope | "historic 79 is a minimum retained family" — replaces the Loop's fixed 79/79 target | — |

→ **D-E = HARD STOP.** Plan docs **not** archived.

### I-E — Gate 11 count recovery: **NOT RECOVERABLE**

- `.acr-loop/` absent from the repo and from `/Users/Kraken/DAPP`, `Documents`, `Desktop`, `Downloads`. Never tracked (gitignored: "Local execution evidence can contain machine/device/session identifiers").
- `G-COMPLETE-REVIEW-001/review.md` not found anywhere reachable.
- Mounted volumes: `Macintosh HD`, `com.apple.TimeMachine.localsnapshots` only. The external archive `/Volumes/AndroidDev/ACR-Mobile-Companion-Build44-Critical-20260902` is **not mounted**.
- `79/79` appears only in prose (backlog v0.1/v0.2/v0.3/v0.5, Loop §11, plan v1.0). No underlying evidence file exists.
- Observed baseline at HEAD, re-run 9 September 2026: gateway Jest **158/158**, e2e **4/4**, T45-11 module **5/5** = **167**.

---

## Part II — Environment Remediation

| Step | Outcome |
|---|---|
| **E-01 JDK 21** | **SUCCESS.** No `.java-version` precedent existed. Applied `jenv local 21.0.11` in both repo directories (per-repo, **not** a system-wide change — `jenv global` remains `system`). Verified: `openjdk 21.0.11 Temurin-21.0.11+10`. Creates an **untracked** `.java-version` in each repo; deliberately not committed and not gitignored — flagged for owner preference. |
| **E-02 EAS CLI** | **SUCCESS with a caveat.** No `eas-cli` devDependency and no `eas.json` exist, so no project-local pattern was available; installed globally: `eas-cli/23.2.0`. **Caveat:** this project has never used EAS. It builds bare-native (`expo run:ios`, Xcode, Gradle) with preserved `ios/`/`android/` projects, and v1.1 §1.3 forbids Expo Prebuild. EAS is a cloud build/submit/OTA service, and Loop §0.3 prohibits OTA updates and store submission. P-04 is now satisfied, but **EAS should not be used** on this project. |
| **E-03 AndroidDev mount** | **BLOCKED — MANUAL ACTION REQUIRED.** No partition named AndroidDev is present (`diskutil list`); the only external devices are Xcode simulator disk images. `ANDROID_HOME`/`ANDROID_SDK_ROOT` point into the unmounted volume. Physical media must be connected by the owner. Attempts stopped as instructed. |
| **E-04 acr-api tunnel** | **BLOCKED — WOULD REQUIRE A CONFIG CHANGE; NOT PERFORMED.** The documented architecture (`ACR_CloudflaredTunnel_MacBookAir_SetupGuide_v1_0_15JUN26.md`) runs `acr-api` **on a separate MacBook Air relay**, using a `~/.cloudflared/config.yml` whose ingress points at the Dev Mac's LAN IP:8080. **This Mac has no such config file.** Starting the tunnel here would require creating one and would relocate where `api.acragent.com` is served from — a change to `acr-api`, prohibited by Loop §0.3 and excluded by E-04's own "if starting it requires a config change, do not make one". Not attempted. Separately, even a connected tunnel would not return non-530 here: **no listener on 127.0.0.1:8080** (platform Spring Boot not running), which is outside this script's scope. |

---

## Part III — Decision Matrix outcomes

### D-A — Tunnel identity: **AUTO-RESOLVED** ✅

Basis: I-A = NEVER ACTIVATED. Retargeted `acr-mobile-gateway-t4` / `acr-mobile-t4` → **`acr-mobile-review`**, and `mobile.acragent.com` → **`mobile-gateway-review.acragent.com`** across all 10 committed files, and renamed the launchd plist to match (`git mv`):

```
t4-tunnel/cloudflared-config.yml                              (9 refs)
t4-tunnel/com.cloudflare.cloudflared.acr-mobile-review.plist  (3 refs, renamed from …acr-mobile-t4.plist)
t4-tunnel/health-check.sh                                     (2 refs)
t4-tunnel/setup-cloudflared.sh                                (1 ref)
adr/T45-11-ARCHITECTURE-DECISION-RECORD.md                    (3 refs — Options A, B, C)
docs/T45-11-IMPLEMENTATION-GUIDE.md                          (10 refs)
mobile/api-client.ts                                          (2 refs — type literal + runtime guard)
mobile/ios-Info.plist.additions                               (1 ref)
mobile/android-network-security-config.xml                    (1 ref)
scripts/test-local.sh                                         (1 ref)
```

The `t4-tunnel/` directory name is retained — "T4" is the architecture **tier** name (T1 reasoner, T3 gateway, T4 tunnel), not a tunnel name.

**Verification after retarget:** zero occurrences of the old tunnel name or hostname remain; `bash -n` OK on all three shell scripts; `plutil -lint` OK; `xmllint` OK; **`cloudflared tunnel ingress validate` → OK**; T45-11 module suite **5/5 PASS**; gateway Jest **158/158 PASS**.

**No tunnel was created, routed, activated or modified.** Tunnel creation remains Gate 10 work under Loop v1.0.

### D-B — Auth store: **AUTO-RESOLVED (logged, no code change)** ✅

Confirmed: `T45-11-remote-gateway/t3-gateway/persistent-auth.js` uses a **JSON file** store (`fs`; `ACR_AUTH_STORE_PATH=/Users/Kraken/.acr-gateway/build45-auth.json`), diverging from Loop §10.2's SQLite mandate. P-07 confirms `node:sqlite` is functional, so the Loop's substitution clause does not apply and no Redis question arises. **The rewrite is Gate 10 work, deliberately not done in pre-flight.** No open question remains. Note: `node:sqlite` is flagged experimental on Node 22.14.0 — record this when the Gate 10 rewrite is designed.

### D-C — Repo layout: **AUTO-RESOLVED** ✅

Loop v1.0 §1 corrected in place: single-repo table, `ACR-platform` path case fixed, `acr-mobile-companion-extended` marked **inactive / reference-only — do not branch from, do not build from, do not delete**, and `feature/gateway-v0.6.5-build45` **withdrawn**. A dated correction note citing D-C is embedded in the document.

### D-D — Commit `b3376e36` and the T45-11 module: **HARD STOP** ⛔

Not acted upon. See §5 for the finding and recommendation.

### D-E — Competing plan documents: **HARD STOP** ⛔

I-D found requirements in v1.1 that are absent from both governing documents (table above). Per the script, the plan documents were **not** archived and **not** merged. See §5.

### D-F — Gate 11 counts: **AUTO-RESOLVED (documentation) + NOT RECOVERABLE recorded** ✅

Loop v1.0 §11 corrected: G11-02 now carries the observed baseline (Jest 158/158, e2e 4/4, module 5/5 = 167), flags it **provisional pending D-D**, and records the platform-test figure and `G-COMPLETE-REVIEW-001` as **NOT RECOVERABLE** with no invented replacement. G11-01 updated for the single-branch snapshot.

---

## 4. Additional finding: the governing documents were untracked

`ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_0.md` and `…BACKLOG_v0.5.md` were **not tracked in any repository**. They existed only as untracked files in `acr-mobile-companion-extended/docs/` — the repo with zero commits that D-C has now marked inactive. Only backlog **v0.1** was tracked. `b3376e36`'s message claims to have added them; it did not.

Since D-C makes `acr-mobile-companion` authoritative and the script requires the §1 correction to be committed, both corrected governing documents plus this reconciliation script were copied into `docs/loop/` so they become tracked. **This step is an inference from D-C, not a literal instruction** — it is additive and reversible, and is flagged here for the owner's confirmation.

---

## 5. Outstanding items requiring Kraken's written decision

### D-D — does the imported T45-11 module become the Build 45 security foundation?

**Findings:** bulk import in a single commit from a supplied zip, under a commit message that misdescribes it — **but** with substantive co-located independent review evidence dated 3 September 2026 that rejected the supplied monolith, enumerated and dispositioned 15 critical defects (including blanket credential acceptance), replaced the auth design with scrypt+pepper hashing, binding, rotation and replay-family revocation, and recorded a passing local test run. Its own ADR is **PROPOSED / NOT APPROVED, unsigned**, and 7 residual blockers are explicitly listed.

**Recommendation:** this sits between the script's two branches. It is a bulk import, which the script maps to "isolate"; but authorship is documented and an independent review already rejected and rebuilt the dangerous parts, which the script maps to "accept". **Recommended: accept the reviewed *composition* as the Gate 3/10 baseline, but treat it as unapproved design material rather than validated code** — i.e. Gate 10 re-derives the auth implementation onto SQLite per D-B and Loop §10.2, rather than shipping `persistent-auth.js` as-is, and the ADR must be signed before Gate 10 opens. The gateway/schema/TS changes in `b3376e36` are separately sound and should be accepted as the Build 45 baseline regardless; only the module's status is in question.

**Also requires a ruling:** `b3376e36`'s commit message is factually wrong on this branch's history. Options are to leave it and rely on this log, or to record a correcting note in the Build 45 branch history.

### D-E — competing plan documents

FULL_IMPLEMENTATION_PLAN v1.0/v1.1 contain requirements absent from backlog v0.5 and Loop v1.0 (identity matrix, native-project preservation, storage preflight, contract-version decision, M0–M10 milestones, named Security Reviewer sign-off, signed ADR). The most consequential is governance: **v1.1 requires an independent security review and owner GO/NO-GO between gateway design (M5) and gateway implementation (M6); Loop v1.0 has no equivalent checkpoint inside Gate 10.** Ruling needed on whether these fold into the Loop before Gate 10, and only then may the plan docs be archived.

### Environment blockers (owner physical action)

- **P-06** — connect the AndroidDev external volume (also restores the Build 44 critical backup, which is the only remaining candidate location for the lost `.acr-loop` evidence).
- **P-08** — start `acr-api` on its normal MacBook Air relay, or authorise a Dev-Mac config for it. Not done here because it would modify `acr-api`.

---

## 6. Pre-flight re-run (Part IV) and Gate 1 status

| Step | Result |
|---|---|
| P-01 | PASS — HEAD `b3376e36` on `feature/mobile-v0.6.5-build45` |
| P-02 | PASS — `119a2e5a` and `d32ab22b` both ancestors; scope matches preserved evidence |
| P-03 | PASS — JDK 21.0.11 |
| P-04 | PASS — mvn 3.9.11, node v22.14.0, npm 8.19.4, Expo CLI present, eas-cli 23.2.0 |
| P-05 | PASS — Xcode 26.3, 1 signing identity, iPhone 13 attached |
| P-06 | **BLOCKED** — AndroidDev not mounted |
| P-07 | PASS — `node:sqlite` functional |
| P-08 | **BLOCKED** — `acr-api` no active connection; `api.acragent.com` HTTP 530 |
| P-09 | PASS — 127.0.0.1:3001 free |
| P-10 | PASS — `feature/mobile-v0.6.5-build45` created (did not previously exist) |

**Gate 1 NOT entered.** Part IV §3 authorises Gate 1 only if every pre-flight step passes except those gated on D-D. P-06 and P-08 fail for reasons unrelated to D-D, so that precondition is not met.

Neither blocker is technically required for Gate 1 — that gate needs only the platform source, JDK 21 and Maven, all of which are present and verified. **Recommendation:** Kraken may waive P-06 and P-08 for Gate 1 specifically, and Gate 1 can then proceed immediately. Gates 3 and 10 remain closed pending D-D and D-E regardless.

---

## 7. Prohibitions honoured

- Canonical platform `/Users/Kraken/DAPP/ACR-platform` at `33daead3`, tracked diff **empty**, read-only access only. Its two untracked `docs/Mobile_App/` files were present at session start and are unchanged.
- No tunnel created, routed, activated or modified. `acr-api` untouched.
- No push. No merge. No distribution action.
- No real-patient data in any file, payload, fixture or log.
- No credential, token or secret written to Git, a bundle, a report or command history.
- Gate 1 evidence worktree not created and nothing deleted.

---

**END OF RECONCILIATION LOG**
