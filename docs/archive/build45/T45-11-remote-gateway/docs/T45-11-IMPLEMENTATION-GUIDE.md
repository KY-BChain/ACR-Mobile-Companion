# T45-11 operational implementation guide

This guide separates local verification from external deployment. Commands are
zsh-compatible. Replace no placeholders until the ADR is signed. Never paste
real patient data, invitation codes, tokens, credentials or raw clinical output
into evidence or shared terminals.

## 1. Roles and service path

| Tier | Function |
|---|---|
| T1 | Spring Boot ACR Ontology/SWRL/Openllet reasoner and optional Bayes layer on local port 8080 |
| T2 | Existing Cloudflare tunnel for the canonical platform/website API |
| T3 | Mobile-only contract, invitation/session, attestation, mapping, fixture and privacy boundary on `127.0.0.1:3001` |
| T4 | Proposed outbound Cloudflare tunnel from the approved mobile HTTPS hostname to loopback T3 |

Option A is Phone → T4 → T3 → canonical HTTPS/T2 → T1. The website remains
Browser → website/API/T2 → T1 and never passes through T3/T4. Thus both use the
same reasoner, while only mobile uses invitation/session and the mobile contract.

## 2. Local source preparation (safe now)

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Do not create another source copy. Preserve Build 44 by its Git commit and
signed app/APK artefacts. Install only the gateway's locked dependencies:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
npm ci
cd /Users/Kraken/DAPP/acr-mobile-companion
chmod 755 T45-11-remote-gateway/scripts/test-local.sh
chmod 755 T45-11-remote-gateway/t3-gateway/invite-admin.js
chmod 755 T45-11-remote-gateway/t3-gateway/server.js
chmod 755 T45-11-remote-gateway/t4-tunnel/setup-cloudflared.sh
chmod 755 T45-11-remote-gateway/t4-tunnel/health-check.sh
./T45-11-remote-gateway/scripts/test-local.sh
```

Passing local tests proves source behavior only. It does not approve a public
endpoint, a mobile build or distribution.

## 3. Create protected local authentication state

Use a shell session with history disabled for secret-bearing commands:

```zsh
setopt HIST_IGNORE_SPACE
export ACR_AUTH_STORE_PATH=/Users/Kraken/.acr-gateway/build45-auth.json
export ACR_AUTH_PEPPER_PATH=/Users/Kraken/.acr-gateway/build45-pepper.bin
node /Users/Kraken/DAPP/acr-mobile-companion/T45-11-remote-gateway/t3-gateway/invite-admin.js list
ls -ld /Users/Kraken/.acr-gateway
ls -l "$ACR_AUTH_STORE_PATH" "$ACR_AUTH_PEPPER_PATH"
```

The first `list` creates the owner-only directory and files. Expected modes are
700 for the directory and 600 for both files. Create a pseudonymous, non-personal
test invite; the plaintext is shown once:

```zsh
export ACR_INVITE_DAYS=1
export ACR_INVITE_MAX_REDEMPTIONS=1
node /Users/Kraken/DAPP/acr-mobile-companion/T45-11-remote-gateway/t3-gateway/invite-admin.js create local-test-01
```

Store the code only in the approved password manager. Never reuse the Build 44
code. List status or revoke by returned UUID:

```zsh
node /Users/Kraken/DAPP/acr-mobile-companion/T45-11-remote-gateway/t3-gateway/invite-admin.js list
node /Users/Kraken/DAPP/acr-mobile-companion/T45-11-remote-gateway/t3-gateway/invite-admin.js revoke INVITE_UUID
```

The running T3 reloads the store on each authentication operation, so revocation
is observed without restart. To avoid a create/revoke write racing a redemption,
perform routine administration before the review window. For an emergency,
stop T4 first, apply revocation, verify it, then reopen the approved window.

## 4. Configure and start a local T3 candidate

Do not `source` the example blindly. Export reviewed values explicitly. For ADR
Option A, first run T1 and existing T2 using the platform operations guide, then:

```zsh
export ACR_GATEWAY_HOST=127.0.0.1
export ACR_GATEWAY_PORT=3001
export ACR_EXPECTED_CLIENT_BUILD_ID=mob-v0.6.5+45
export ACR_UPSTREAM_INFER_URL=https://api.acragent.com/api/infer
export ACR_EVIDENCE_HEALTH_URL=https://api.acragent.com/api/infer/health
export ACR_EVIDENCE_STATUS_URL=https://api.acragent.com/api/ontolator/status
export ACR_EVIDENCE_MANIFEST_URL=https://api.acragent.com/api/ontolator/manifest
export ACR_EVIDENCE_ONTOLOGY_PATH=/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl
export ACR_UPSTREAM_TIMEOUT_MS=8000
export ACR_AUTH_STORE_PATH=/Users/Kraken/.acr-gateway/build45-auth.json
export ACR_AUTH_PEPPER_PATH=/Users/Kraken/.acr-gateway/build45-pepper.bin
node /Users/Kraken/DAPP/acr-mobile-companion/T45-11-remote-gateway/t3-gateway/server.js
```

In a separate terminal, verify only liveness and listening scope:

```zsh
curl --fail --silent --show-error http://127.0.0.1:3001/m/v1/live
lsof -nP -iTCP:3001 -sTCP:LISTEN
```

Expected JSON is `{"status":"UP"}` and the listener must show loopback only.
Authenticated attestation/inference tests are in the detailed test plan; avoid
putting bearer credentials in shell history.

Stop T3 with Control-C. Stop T2 and T1 independently in their own terminals.

## 5. Mobile integration before building

1. Merge `mobile/api-client.ts` into the existing `src/api/client.ts`; do not
   ship parallel clients.
2. Supply `baseUrl` and build identity from the signed build configuration.
3. Implement `InstallationProofStore` with iOS Keychain and Android Keystore
   through one reviewed Expo-compatible secure-storage dependency. Do not use a
   hardware identifier or a shared constant.
4. Merge ATS via Expo/native config into generated target `ACRCompanion` and
   merge Android attributes/resources; do not overwrite whole manifests.
5. Set version `0.6.5`, iOS build `45`, Android versionCode `45` only on the
   Build 45 branch. Run TypeScript, lint, native manifest and release scans in
   Gate 0 before any simulator/device build.

## 6. T4 read-only preflight (safe; no deployment)

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion
./T45-11-remote-gateway/t4-tunnel/setup-cloudflared.sh --preflight
```

The script checks the installed tools and templates and makes no changes. The
template contains `<YOUR_TUNNEL_UUID>` by design, so render a temporary approved
copy before final cloudflared validation.

## 7. T4 Phase B (STOP — owner authority required)

Do not run `cloudflared tunnel login/create/route dns`, change the Cloudflare
zone, install launchd files, or expose the hostname from this guide alone.
Before Phase B, obtain:

- signed ADR choosing Option A/B and approving the exact hostname/account;
- completed T45-08 and mobile secure-store tests;
- threat model, edge method/body/rate/WAF/TLS policy, retention and rollback;
- independent source security concurrence;
- explicit owner instruction to mutate Cloudflare/DNS and run a controlled window.

After authority, the implementer must inventory existing tunnels/DNS first,
render the actual UUID credential path, validate ingress with installed
cloudflared, and use explicit human operation or a reviewed per-user LaunchAgent.
The supplied root LaunchDaemon template is not approved for installation.

### 7.1 Owner-approved manual T4 procedure

These commands are documentation, not present authority to run them:

```zsh
cloudflared --version
cloudflared tunnel list
dig +short mobile-gateway-review.acragent.com
ls -la /Users/Kraken/.cloudflared
```

Stop if the name/hostname already exists or ownership is unclear. After the
owner confirms the Cloudflare account and hostname, authenticate and create one
named tunnel:

```zsh
cloudflared tunnel login
cloudflared tunnel create acr-mobile-review
```

Copy the printed UUID exactly, validate its format, and render a protected
runtime config. `T45_TUNNEL_UUID` below is task-specific, not a secret:

```zsh
export T45_TUNNEL_UUID=PASTE-EXACT-UUID
printf '%s\n' "$T45_TUNNEL_UUID" | grep -Eq '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$'
cp /Users/Kraken/DAPP/acr-mobile-companion/T45-11-remote-gateway/t4-tunnel/cloudflared-config.yml /Users/Kraken/.cloudflared/acr-mobile-review.yml
sed -i.bak "s/<YOUR_TUNNEL_UUID>/$T45_TUNNEL_UUID/g" /Users/Kraken/.cloudflared/acr-mobile-review.yml
chmod 600 /Users/Kraken/.cloudflared/acr-mobile-review.yml "/Users/Kraken/.cloudflared/$T45_TUNNEL_UUID.json"
cloudflared tunnel --config /Users/Kraken/.cloudflared/acr-mobile-review.yml ingress validate
cloudflared tunnel --config /Users/Kraken/.cloudflared/acr-mobile-review.yml ingress rule https://mobile-gateway-review.acragent.com/m/v1/liveevil
```

The negative rule command must select the 404 catch-all. Configure and record
Cloudflare zone controls for exact methods, 16-KiB body limit, reviewer-IP rate
limits, WAF and minimum TLS before DNS. Then, only with the separate DNS GO:

```zsh
cloudflared tunnel route dns "$T45_TUNNEL_UUID" mobile-gateway-review.acragent.com
```

Start T4 in its own visible Terminal for the first controlled window:

```zsh
cloudflared tunnel --config /Users/Kraken/.cloudflared/acr-mobile-review.yml run "$T45_TUNNEL_UUID"
```

Do not install auto-start until manual outage/rollback, sleep/wake and network
change tests pass. A per-user LaunchAgent must be separately generated and
reviewed; do not install the legacy-named plist in this package as a daemon.

### 7.2 Full four-terminal start order for Option A

Terminal 1 — reasoner:

```zsh
cd /Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface
mvn spring-boot:run -Dspring-boot.run.profiles=hybrid
```

Terminal 2 — existing website/API tunnel, after T1 is ready:

```zsh
cloudflared tunnel run --url http://localhost:8080 acr-api
```

Terminal 3 — export the variables from section 4 and start T3:

```zsh
node /Users/Kraken/DAPP/acr-mobile-companion/T45-11-remote-gateway/t3-gateway/server.js
```

Terminal 4 — start the approved T4 command from section 7.1. Terminal 5 may run
read-only health evidence:

```zsh
export ACR_MOBILE_HOSTNAME=mobile-gateway-review.acragent.com
/Users/Kraken/DAPP/acr-mobile-companion/T45-11-remote-gateway/t4-tunnel/health-check.sh
```

## 8. Controlled runtime and acceptance order

1. Start T1 and prove local backend health.
2. Start existing T2 and prove canonical API plus website.
3. Start loopback T3 and prove local six-route contract/auth/attestation.
4. Start approved T4 and run `t4-tunnel/health-check.sh`.
5. Run Gate 7 edge negatives before giving any invitation to a reviewer.
6. Run synthetic-only Gate 8 same-backend tests and website regression.
7. Build iPhone simulator first and stop for owner inspection.
8. After approval, test physical iPhone 13 standalone/off-LAN; then Samsung S8
   and Xiaomi MIX Fold 2. No Android emulator.
9. Use a unique invitation per app installation. Revoke immediately on loss,
   completion, anomaly or withdrawal.
10. Obtain independent runtime review, then separate owner distribution approval.

## 9. Shutdown and rollback

Stop public exposure first (T4), then T3, then T2/T1 if the website window also
ends. Disable/remove DNS and revoke tunnel credentials as specified in the
approved infrastructure rollback record. Revoke evaluator invitations. Verify
no listener on 3001, remote hostname denial, website regression and Build 44
artefact hashes. Use Git commit/worktree recovery; never restore with wildcard
copy commands. Record any region not actually tested as NOT ASSESSABLE.
