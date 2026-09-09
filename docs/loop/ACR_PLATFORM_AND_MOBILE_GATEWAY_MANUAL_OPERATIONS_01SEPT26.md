# ACR Platform and Mobile Gateway — Manual Operations

> **SUPERSEDED FOR BUILD 45 (9 September 2026).** Every `ACR_INVITE_CODE_SHA256` step below
> describes the retired Build 44 mechanism: a single unsalted-SHA-256 invitation code shared by
> all evaluators, with in-memory sessions. Build 45 replaces it entirely with a per-invitee
> SQLite store administered by the local `acr-invite` CLI — see `gateway/README.md` and
> `docs/build45-evidence/GATE10_G10-0_AUTH_DESIGN_20260909.md`. Do not follow the invite steps
> below when operating Build 45; the platform and tunnel steps remain valid.

**Updated:** 2 September 2026
**Scope:** ACR Platform Mode 2 hybrid demo and ACR Companion v0.6.0 Build 44 controlled synthetic evaluation.
**Safety:** No real-patient data, personal identifiers, deployment, distribution or public mobile-gateway exposure is authorised here.

## 1. Service relationship

Backend-dependent website functions require T1 and T2; the separately hosted static website can remain visible without them. Build 44 **Live Platform** mode requires the fixed LAN address plus T1, T2 and T3. Explicit verified **Synthetic Demonstration** requires the LAN address and T3 only. Standalone app launch/navigation requires none of these services:

```text
ACR website ───────────────► api.acragent.com ─► T2 Cloudflare ─► T1 Spring Boot/Openllet

Build 44 mobile app ─► 192.168.1.94:3001 ─► T3 mobile gateway ─► api.acragent.com ─► T2 ─► T1
```

T3 is a validation/authentication transport boundary. It contains no clinical inference. Ontology, SWRL/Openllet, platform Java logic and optional Bayes remain in T1.

### What T3 does

T3 is the Build 44 mobile app's controlled gateway. A human operator starts it in Terminal 3 with the Zsh command and environment shown in section 5. While that terminal remains open, T3:

- listens only on the configured evaluation address `192.168.1.94:3001`;
- checks the configured invitation-code hash and issues in-memory access/refresh tokens bound to the device and exact Build 44 client identity;
- validates headers, request size, JSON schema and the complete mobile assessment contract;
- maps the mobile assessment's 20 bounded clinical/processing inputs, plus its generated technical correlation identifier, to the existing ACR Platform request contract without performing clinical inference;
- sends **Live Platform** requests only to the configured `https://api.acragent.com/api/infer` route;
- probes the platform status, manifest and health routes and the local canonical ontology asset, then compares observed reasoner identity/hash/counts with the pinned expected evidence;
- rejects unavailable, inconsistent, malformed or partial Live results rather than inventing or repairing clinical output;
- provides **Synthetic Demonstration** only through the independently verified immutable fixture and only when that mode is explicitly selected; and
- keeps authentication state in memory, so stopping/restarting T3 invalidates issued sessions.

T3 does **not** contain Ontology/SWRL/Openllet, Java clinical aggregation, Bayes, a copied classifier or a hidden Live-to-Demonstration fallback. It must not log invitation plaintext, tokens, the 20 clinical facts or clinical result bodies.

### Mobile connectivity versus website connectivity

| Function | Website | Build 44 mobile app |
| --- | --- | --- |
| Initial connection | Browser reaches the separately hosted public website; backend-dependent functions call `api.acragent.com` | App calls only private-LAN T3 at `192.168.1.94:3001` |
| Authentication boundary | Existing website/platform controls | T3 invitation redemption plus device/build-bound in-memory tokens |
| Route to reasoner | Website → public `api.acragent.com` → T2 → T1 | App → T3 → public `api.acragent.com` → T2 → T1 |
| Clinical inference | T1 only | T1 only; never the app or T3 |
| Live dependencies | T1 and T2 for backend-dependent functions | Correct `.94/32` alias plus T3, T2 and T1 |
| Verified Synthetic Demonstration | Website behaviour is separate | Correct `.94/32` alias plus T3; T1/T2 may be offline |
| Standalone UI launch | Public static site availability is separate from the Mac | No server or Metro required; Live submission still needs the full route |
| Mac restart | T1/T2 must be restarted for website backend functions | The `/32` alias and T1/T2/T3 must be checked/restarted for Live mode |
| Remote Internet reviewer | Public website/backend route can be reachable through T2 | Build 44 cannot reach private `.94` off-LAN; Build 45 requires the separately reviewed HTTPS gateway/rebuilt-app design |

T1 and T2 are shared by website and mobile Live inference. T3 is mobile-specific and sits in front of that same backend; it is not another reasoner or a replacement for T1/T2.

## 2. Terminal 0 — checks after every Mac restart or network change

Build 44 is frozen to `http://192.168.1.94:3001`. A Mac restart removes the temporary address alias. First inspect the active address and any existing alias:

```zsh
ifconfig en0 | grep -E 'inet 192\.168\.1\.'
ifconfig en0 | grep -E 'inet 192\.168\.1\.94 netmask 0xffffffff' || true
lsof -nP -iTCP:3001 -sTCP:LISTEN || true
```

If the second command prints the exact `.94` line with `netmask 0xffffffff`, the `/32` alias is already correct. Do not add it again.

If `.94` is absent, first confirm that another LAN device is not using it:

```zsh
arp -n 192.168.1.94 || true
ping -c 2 192.168.1.94 || true
```

An existing ARP/MAC entry or ping response means STOP: do not claim the address. Resolve the LAN conflict first.

If `.94` is absent and unused, add the restart-temporary `/32` alias:

```zsh
sudo ifconfig en0 alias 192.168.1.94 netmask 255.255.255.255
```

If `.94` exists but does **not** show `netmask 0xffffffff`, correct that exact alias:

```zsh
sudo ifconfig en0 -alias 192.168.1.94
sudo ifconfig en0 alias 192.168.1.94 netmask 255.255.255.255
```

Verify before starting T3:

```zsh
ifconfig en0 | grep -E 'inet 192\.168\.1\.94 netmask 0xffffffff'
route -n get 192.168.1.94
```

Do not use the incorrect form `ifconfig en0 alias 192.168.1.94 255.255.255.255`; on this Mac it treats the last value as broadcast information and leaves `.94` on `/24` rather than creating the required `/32`.

## 3. Terminal 1 — Spring Boot/Openllet hybrid service

Check before starting:

```zsh
lsof -nP -iTCP:8080 -sTCP:LISTEN || true
```

If port 8080 is already owned by the expected Java service, verify it and do not start a duplicate:

```zsh
curl -fsS http://localhost:8080/api/infer/health | jq .
curl -fsS http://localhost:8080/api/ontolator/status | jq .
```

Otherwise start T1:

```zsh
cd /Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface
mvn spring-boot:run -Dspring-boot.run.profiles=hybrid
```

Keep this terminal open. Wait until Spring reports ready, then verify from another terminal:

```zsh
curl -fsS http://localhost:8080/api/infer/health | jq .
```

## 4. Terminal 2 — existing Cloudflare tunnel

Start only after T1 is healthy. Check before starting:

```zsh
lsof -nP -iTCP:20241 -sTCP:LISTEN || true
pgrep -lf 'cloudflared.*acr-api' || true
```

If the expected tunnel is already running, do not start a duplicate. Otherwise:

```zsh
cloudflared tunnel run --url http://localhost:8080 acr-api
```

Keep this terminal open. Verify the existing public backend route:

```zsh
curl -fsS https://api.acragent.com/api/infer/health | jq .
curl -fsS https://api.acragent.com/api/ontolator/status | jq .
curl -fsS https://api.acragent.com/api/ontolator/manifest | jq .
```

This tunnel also supports the existing `www.acragent.com` website. It does not expose the Build 44 mobile gateway.

## 5. Terminal 3 — Build 44 mobile gateway

For all gateway modes, prerequisites are the correct `.94/32` alias and no existing port-3001 listener. For **Live Platform**, T1 and T2 must also be healthy. For explicit verified **Synthetic Demonstration**, T1/T2 may be offline because T3 replays only the independently verified local fixture; it never silently falls back from Live.

Always check the `/32` and port 3001:

```zsh
ifconfig en0 | grep -E 'inet 192\.168\.1\.94 netmask 0xffffffff'
lsof -nP -iTCP:3001 -sTCP:LISTEN || true
```

For **Live Platform** only, also require the public backend health check:

```zsh
curl -fsS https://api.acragent.com/api/infer/health | jq .
```

The operator chooses the invitation code. Read it without placing its plaintext in shell history, then calculate only its SHA-256:

```zsh
read -r -s 'ACR_INVITE_CODE?Build 44 invitation code: '
printf '\n'
ACR_INVITE_CODE_SHA256="$(printf '%s' "$ACR_INVITE_CODE" | shasum -a 256 | awk '{print $1}')"
unset ACR_INVITE_CODE
```

Start T3:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion-extended/gateway

ACR_GATEWAY_HOST=192.168.1.94 \
ACR_GATEWAY_PORT=3001 \
ACR_ALLOW_PRIVATE_LAN=true \
ACR_UPSTREAM_INFER_URL=https://api.acragent.com/api/infer \
ACR_EVIDENCE_STATUS_URL=https://api.acragent.com/api/ontolator/status \
ACR_EVIDENCE_MANIFEST_URL=https://api.acragent.com/api/ontolator/manifest \
ACR_EVIDENCE_HEALTH_URL=https://api.acragent.com/api/infer/health \
ACR_EVIDENCE_ONTOLOGY_PATH=/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl \
ACR_SYNTHETIC_FIXTURE_DIR=/Users/Kraken/DAPP/acr-mobile-companion-extended/.acr-loop/v1.6/acr-mobile-cds-parity-v1.6-20260831T074903Z/implementation/G-FIXTURE-CAPTURE-001/candidate \
ACR_INVITE_CODE_SHA256="$ACR_INVITE_CODE_SHA256" \
npm start
```

Keep this terminal open. Verify from another terminal:

```zsh
lsof -nP -iTCP@192.168.1.94:3001 -sTCP:LISTEN
curl -fsS http://192.168.1.94:3001/m/v1/live | jq .
```

Then force-close and relaunch ACR Companion. The app begins a fresh invitation/mode cycle. Enter the exact plaintext code chosen for this T3 session.

## 6. Invitation-code control

- Kraken or an explicitly authorised ACR operator is the code issuer/controller.
- The plaintext is shared directly with the intended evaluator; it is not stored in source or this manual.
- T3 configuration stores only the SHA-256 hash. During `/auth/redeem`, the app sends the plaintext code transiently over Build 44's controlled-LAN HTTP connection so T3 can hash and compare it; this is a Build 44 evaluation limitation and is not suitable for public-Internet use.
- The current gateway accepts one configured code at a time.
- Restarting T3 destroys all in-memory access/refresh tokens.
- Restarting T3 with a new hash disables the previous code.
- Build 44 has no per-invitee identity, concurrent invite registry, individual expiry/revocation, redemption limit or durable audit record.
- Do not reuse a code already disclosed outside the intended controlled session.
- Unique, concurrent partner invitations require the Build 45 governance/refactoring backlog before external review distribution.

To generate a new high-entropy session code, display it once, calculate its hash, and clear the plaintext variable without embedding its value in shell history:

```zsh
ACR_INVITE_CODE="ACR44-EVAL-$(openssl rand -hex 8 | tr '[:lower:]' '[:upper:]')"
printf 'New invitation code: %s\n' "$ACR_INVITE_CODE"
ACR_INVITE_CODE_SHA256="$(printf '%s' "$ACR_INVITE_CODE" | shasum -a 256 | awk '{print $1}')"
unset ACR_INVITE_CODE
```

Share the displayed plaintext through an approved private channel and use `ACR_INVITE_CODE_SHA256` when starting T3. Do not commit either value.

## 7. Local and remote reviewer limitation

Build 44 permits controlled synthetic evaluation only. Its app code/binary is hard-coded to private address `192.168.1.94:3001`. Android's cleartext exception is restricted to that exact host; iOS allows local networking more broadly but the Build 44 app still has only the hard-coded `.94` endpoint. Therefore:

- it works when the phone can route to the Mac on the same controlled LAN;
- moving the Mac requires rechecking the LAN, address conflict and `/32` alias;
- T1/T2 may serve the website's backend-dependent functions from France, Ireland or another location where the Mac and tunnel are online; the static website hosting is separate;
- an invitee elsewhere in the EU/EEA, UK, Ireland, HKSAR, Japan or China cannot reach this private Build 44 gateway over the public Internet merely by possessing an invitation code;
- the existing `acr-api` tunnel exposes the platform API, not T3, and Build 44 must not bypass T3 to call that API directly.

Remote partner review requires a separately approved design: secure HTTPS gateway hosting/routing, a non-private mobile endpoint and rebuilt app, managed per-invitee access, regional/privacy/security review, retention and incident policy, and a chosen signed-app distribution route. No new tunnel, DNS, deployment or distribution is authorised by this manual.

## 8. Optional Terminal 4 — simulator development only

Physical iOS and Android Release apps are standalone and must not use Metro. Start Metro only for the existing iPhone simulator development workflow:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion
./node_modules/.bin/expo start --dev-client --localhost --port 8081
```

Simulator relaunch:

```zsh
ACR_SIM_UDID='0A75B040-6627-4DA6-A6D1-E9B695F32F7C'
xcrun simctl boot "$ACR_SIM_UDID" 2>/dev/null || true
open -a Simulator --args -CurrentDeviceUDID "$ACR_SIM_UDID"
xcrun simctl bootstatus "$ACR_SIM_UDID" -b
xcrun simctl launch "$ACR_SIM_UDID" com.anonymous.acr-mobile-companion
```

## 9. Stop order

Use `Control-C` in the owning terminal:

1. T3 mobile gateway, when mobile testing is finished.
2. T2 Cloudflare, only when website/public API demo access may stop.
3. T1 Spring Boot, after T2 is stopped.
4. Metro, if it was started for simulator development.

Do not kill unrelated Java, Node, ADB or Cloudflare processes by broad name. Confirm listeners afterward:

```zsh
lsof -nP -iTCP:3001 -sTCP:LISTEN || true
lsof -nP -iTCP:20241 -sTCP:LISTEN || true
pgrep -lf 'cloudflared.*acr-api' || true
lsof -nP -iTCP:8080 -sTCP:LISTEN || true
lsof -nP -iTCP:8081 -sTCP:LISTEN || true
```

The `.94/32` alias can remain for the evaluation session. Remove it only when no Build 44 phone/simulator needs it:

```zsh
sudo ifconfig en0 -alias 192.168.1.94
```
