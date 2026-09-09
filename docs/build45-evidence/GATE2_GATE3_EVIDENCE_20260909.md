# Build 45 — Gate 2 and Gate 3 Evidence

**Authority:** `ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_1.md` §4 (Gate 2), §5 (Gate 3)
**Date:** 9 September 2026
**Branch:** `feature/mobile-v0.6.5-build45`
**Result: GATE 2 PASS · GATE 3 PASS**

---

## Gate 2 — Welcome + Poster (UI regression)

Regression only, against the Build 44 baseline. No blocker closure.

| Check | Result |
|---|---|
| Build 44 baseline suite (`verify:mobile`) | **PASS** — every assertion green |
| Eight-language display | **PASS** — 8 locales present, **333 keys, all key-identical**, no missing/extra keys in any locale |
| Arabic RTL / LTR | **PASS** — direction matrix: `ar-SA` RTL, seven registered locales LTR; language switch uses one i18next call with no reload or native mutation |
| Poster screen | **PASS** — eight-locale poster mapping with English fallback; local assets, responsive contain rendering, vertical gesture, route replacement |
| Welcome screen | **PASS** — fresh-launch Gateway boundary, focused timer cleanup, modal safeguard, non-Welcome redirect guard |
| Android/iOS automated poster/Welcome evidence | **PASS** |

**STOP condition — truthful-delivery labelling regression: NOT TRIGGERED.**
Neither `WelcomeScreen.tsx` nor `PosterScreen.tsx` references `LIVE_REASONER`,
`PLATFORM_FALLBACK`, `LOCAL_SYNTHETIC_DEMO` or `NOT_EXECUTED`. Correct by construction:
no assessment result exists at these screens, so no delivery mode can be asserted or
misrepresented there.

**Carried limitation (not a failure):** the suite reports
`LIMITATION rendered responsiveness and visual direction require simulator/device review`.
Rendered verification is Gate 12 work and is covered by the P-06 waiver until then.

---

## Gate 3 — Gateway Foundation

Builds on `b3376e36`'s hardening, which D-D accepts as the Build 45 baseline. The
imported T45-11 auth module is **not** used as a starting point; Gate 10 re-derives auth
against SQLite separately.

### G3-01 — Current gateway state vs `b3376e36` baseline

**Already present at baseline (inherited, unchanged):**

- Six `/m/v1` routes, exactly matching the T4 edge ingress allow-list:
  `GET /m/v1/live`, `POST /m/v1/auth/redeem`, `POST /m/v1/auth/refresh`,
  `GET /m/v1/attestation`, `POST /m/v1/infer`, `POST /m/v1/demo/infer`
- `helmet`, CORS restricted to `GET`/`POST` with an explicit header allow-list,
  16 KiB JSON body cap, metadata-only request logging
- Strict UUIDv4 request-id derivation; header/body request-id correlation
- `CLIENT_BUILD_MISMATCH` 403 build binding; `preRouteMiddleware` injection point
- AJV schema validation, 20-field mapper, `acr.error.v1` envelopes
- `upstream-validator.js` fail-closed response guard (proven at Gate 1)
- `redirect: 'error'` on both outbound fetch paths

**Added by this gate:** dedicated-hostname enforcement (G3-02) and mechanically
enforced contract parity (G3-04). Nothing was removed.

### G3-02 — Dedicated `acr-mobile-review` hostname routing/config

Two changes, neither of which creates or activates a tunnel.

**Gateway — optional Host enforcement.** New `ACR_PUBLIC_HOSTNAME` config
(`parsePublicHostname`, bare DNS hostname only — scheme, port or path is rejected).
When set, a middleware ahead of body parsing refuses any request that did not arrive
through that hostname with **421 `MISDIRECTED_REQUEST`**, outcome `NOT_SUBMITTED`.
This is defence in depth *behind* the edge ingress rules, not a replacement for them.
Unset by default, preserving the supervised-LAN posture Gates 4–9 need.

Observed behaviour:

| Host header | Result |
|---|---|
| `mobile-gateway-review.acragent.com` (configured) | **200** `{"status":"UP"}` |
| `127.0.0.1:3001` (direct loopback) | **421** `MISDIRECTED_REQUEST` |
| `mobile.acragent.com` (retired t4 identity) | **421** `MISDIRECTED_REQUEST` |
| `api.acragent.com` / `evil.example` | **421** `MISDIRECTED_REQUEST` |
| any host, `ACR_PUBLIC_HOSTNAME` unset | **200** (LAN posture) |

**Mobile — build-time endpoint governance.** `src/config/gateway.ts` now declares a
governed origin set and compiles exactly one of them in:

- `LAN_EVALUATION_ORIGIN` = `http://192.168.1.94:3001` — **active**, supervised LAN
- `BUILD45_REVIEW_ORIGIN` = `https://mobile-gateway-review.acragent.com` — declared,
  activated at Gate 10 with the tunnel

`ACTIVE_GATEWAY_ORIGIN` is typed to the governed union and `GATEWAY_API_BASE` derives
from it. This is the "configuration or build-time endpoint governance" backlog §10.4
requires, and it deliberately does **not** introduce runtime switching: the verifier
asserts the module contains no `process.env`, `AsyncStorage`, `localStorage`,
`setOrigin` or `useState`. There is no endpoint editor and no fallback between origins.

The active origin is intentionally **not** switched to HTTPS at this gate. Gate 10 owns
that flip together with tunnel creation and removal of the cleartext exception;
switching now would leave Gates 4–9 with no reachable gateway.

### G3-03 — Loopback binding

`ACR_GATEWAY_HOST` defaults to `127.0.0.1` and `ACR_GATEWAY_PORT` to `3001`. Any
non-loopback bind requires an explicit `ACR_ALLOW_PRIVATE_LAN=true`, and plaintext HTTP
upstreams are permitted only for approved loopback hosts. **Confirmed unchanged.**

### G3-04 — Enhanced API interface: contract verified against the real client

The Build 44 suites exercise the gateway against fixtures. Gate 3 adds
`tests/contract/verify.js`, wired into `verify:mobile`, which asserts that the three
independent declarations of the governed contract stay in lockstep:

1. `schemas/acr.cds.v1.request.schema.json` — the governed wire contract
2. `gateway/src/mapper.js` `PATIENT_FIELDS` — what the gateway transports
3. `src/api/requestBuilder.ts` — what the app actually emits

**Result — fully aligned:**

| Check | Result |
|---|---|
| Governed assessment properties | **21** (20 transported + `bayesianEnhanced` control) |
| `additionalProperties` on assessment | `false` — ungoverned fields cannot be transported |
| Schema fields not mapped by the gateway | **none** |
| Gateway-mapped fields absent from the schema | **none** |
| Governed fields not emitted by the app | **none** (all 21, incl. `patientId` shorthand) |
| `bayesianEnhanced` carried to the platform | yes |
| `analysisVersion` pinned | `2.2` |
| Client identity | derived from `app.json`; no hardcoded literal in `requestBuilder` |
| Response envelope | 10 envelope keys + 9 data keys pinned on both sides, `hasExactKeys` exact-match |
| Retired t4 identity in gateway/client config | **absent** |

The verifier was negatively proven: adding an ungoverned field to `PATIENT_FIELDS`
fails it with *"gateway PATIENT_FIELDS must transport exactly the governed non-control
fields"*. The change was reverted immediately after the check.

It also pins the **Gate 1 OBS-5** fixture gap explicitly — the stored e2e fixture omits
`ecogScore`, `gender`, `her2Low`, `lvef`, `pdl1Status`, `treatmentIntent` and
`tumorSize` — so that incompleteness is tracked rather than mistaken for full coverage,
and asserts the Build 43 mock can never become eligible for delivered replay.

### Build 45 identity bump (prerequisite for Gate 3 contract work)

Identity moved from `0.6.0 / 44` to **`0.6.5 / 45`** across `app.json`,
`build.gradle`, `Info.plist`, `project.pbxproj` and the gateway's expected client
build. `MOBILE_BUILD_ID` (`mob-v0.6.5+45`) is *derived* from `app.json`, so there is no
second literal to drift.

Two consequences handled:

- **Negative build-binding tests** previously used `mob-v0.6.5+45` as their
  deliberately-wrong *future* identity. They now assert against the superseded
  `mob-v0.6.0+44`, which is a stronger property: a Build 44 client is refused by the
  Build 45 gateway with `CLIENT_BUILD_MISMATCH`.
- **A pre-existing type error was found and fixed.** `b3376e36` typed
  `client.buildId` as the template literal `` `mob-v${number}.${number}.${number}+${number}` ``
  while `MOBILE_BUILD_ID` is composed at runtime and widens to `string`.
  `npm run typecheck:active` was **failing at HEAD before this session's changes** and
  was not caught because `verify:mobile` does not run `tsc`. Fixed with a named
  `GatewayBuildId` type and a runtime type predicate, so the narrowing is earned by the
  existing regex check rather than an unchecked cast. **Recommend adding
  `typecheck:active` to the Gate 11 mandatory family** — a green `verify:mobile` did not
  imply a green typecheck.

### STOP conditions — none triggered

| Condition | Status |
|---|---|
| Non-loopback gateway bind | Not attempted; loopback default intact |
| `acr-mobile-review` tunnel created before Gate 10 | **Not created.** `cloudflared tunnel list` still shows only `acr-api`; no credentials file, no DNS record |
| `acr-mobile-gateway-t4` / `mobile.acragent.com` reintroduced | **Absent** — asserted by the contract verifier across four config/source files |

---

## Verification summary at Gate 3 close

| Suite | Result |
|---|---|
| Gateway Jest | **161 / 161** (158 baseline + 3 new hostname tests) |
| Gateway e2e | **4 / 4** |
| T45-11 module suite | **5 / 5** |
| `verify:mobile` | **21 / 21** assertions (20 baseline + contract parity) |
| `typecheck:active` | **PASS** (was failing at HEAD before this session) |

Canonical platform checkout untouched. No push. No tunnel created or activated.

---

**END OF GATE 2 / GATE 3 EVIDENCE**
