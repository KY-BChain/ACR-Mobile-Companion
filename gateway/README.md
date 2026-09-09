# ACR Build 44 same-backend gateway

This is a transport and validation boundary. It contains no subtype, risk, treatment, rule, recommendation or Bayesian logic. Live requests are sent only to the explicitly configured, verified ACR Platform `/api/infer` URL. Service failures return structured errors and never select demonstration replay.

## Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/m/v1/live` | Gateway process liveness only |
| POST | `/m/v1/auth/redeem` | Issue an in-memory evaluation token family |
| POST | `/m/v1/auth/refresh` | Rotate a refresh token; reuse revokes the family |
| GET | `/m/v1/attestation` | Expected-versus-observed evidence |
| POST | `/m/v1/infer` | Current inference through the configured platform route |
| POST | `/m/v1/demo/infer` | Explicit exact verified synthetic-fixture replay |

There are no production test-control endpoints. Tests inject their controls through `createApp()` composition.

## Configuration

The listener defaults to `127.0.0.1:3001`. A private-LAN host requires both `ACR_GATEWAY_HOST` and `ACR_ALLOW_PRIVATE_LAN=true`. The default upstream timeout is 8,000 ms and must remain between 250 and 30,000 ms.

`ACR_UPSTREAM_INFER_URL` has no default. It must be the exact canonical `/api/infer` route on the verified same backend used by the website. Plain HTTP is accepted only for loopback development; every non-loopback upstream must use HTTPS. For Mode 2 this is the existing public Cloudflare transport to the owner-started hybrid Spring Boot service; no new route or tunnel is created by this gateway. Never disable TLS verification.

Observed attestation is not copied from the expected baseline or from self-declared environment values. Configure the three exact, read-only controller routes `ACR_EVIDENCE_STATUS_URL=/api/ontolator/status`, `ACR_EVIDENCE_MANIFEST_URL=/api/ontolator/manifest`, and `ACR_EVIDENCE_HEALTH_URL=/api/infer/health`, plus the absolute local non-patient ontology asset path `ACR_EVIDENCE_ONTOLOGY_PATH`. All four are required together and the endpoints must share the configured upstream origin. The probe derives and cross-checks 71 logical rules, 76 physical blocks, 76 active blocks, 76 embedded/loaded axioms and 27 queries from actual GET responses, and hashes the configured asset itself. If evidence is incomplete, inconsistent or unavailable, all observed members are reported null and live inference fails closed; internally consistent degraded observations are reported as `MISMATCH`. `ACR_OBSERVED_*` values are deliberately ignored. Explicit replay may still run offline when its independent immutable capture provenance is verified; its response keeps current unavailable evidence separate from captured platform identity.

Build 45 authentication uses a per-invitee SQLite store, not a single shared code. `ACR_INVITE_CODE_SHA256` is **retired**: the Build 44 mechanism was one unsalted SHA-256 of one code shared by every evaluator, with sessions held in memory and lost on restart. It could not satisfy T45-08 (per-invitee issue, expiry, individual revocation, lost-code procedure) and is removed rather than left dormant.

Configure `ACR_AUTH_STORE_PATH` and `ACR_AUTH_PEPPER_PATH` (both absolute, both owner-only `0600`, and different files, so a copy of the store alone verifies nothing). Invitations are issued and revoked with the local `acr-invite` CLI; there is deliberately no network administration endpoint. Invitation codes are `ACR45-<selector>-<secret>`: the selector is indexed for O(1) lookup and the secret is verified with scrypt plus the server pepper, so a redemption costs exactly one slow hash regardless of how many invitations exist. Access and refresh tokens are 256-bit random values stored only as keyed HMAC digests.

Redeem binds the session to the supplied device binding and the exact client build `mob-v0.6.5+45`. Protected calls must send `X-Device-Binding` and `X-Client-Build-ID`, and refresh must repeat both bound values in its JSON body. Refresh rotation, replay-family revocation and rate limiting ahead of authentication are enforced. A refresh token expires with its parent session — a flat 30 days from that evaluator's own redemption — so rotation moves the token but never the deadline.

## Run and test

```bash
npm install --ignore-scripts --no-audit --no-fund
npm test
ACR_UPSTREAM_INFER_URL=https://api.acragent.com/api/infer \
ACR_EVIDENCE_STATUS_URL=https://api.acragent.com/api/ontolator/status \
ACR_EVIDENCE_MANIFEST_URL=https://api.acragent.com/api/ontolator/manifest \
ACR_EVIDENCE_HEALTH_URL=https://api.acragent.com/api/infer/health \
ACR_EVIDENCE_ONTOLOGY_PATH=/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl \
# One-time: create the owner-only pepper.
node src/auth/invite-admin.js init

# Issue an invitation for one named evaluator. The code is printed ONCE.
node src/auth/invite-admin.js issue --label reviewer-01 --issued-by kraken

# Start the gateway against that store.
ACR_AUTH_STORE_PATH="$HOME/.acr-gateway/build45-auth.db" \
ACR_AUTH_PEPPER_PATH="$HOME/.acr-gateway/build45-pepper.bin" npm start

# Revoke (also cascades to every session from that invitation).
node src/auth/invite-admin.js revoke --label reviewer-01 --reason LOST
```

Importing `src/index.js` never starts a listener. `src/listener.js` is the executable entry point.

## Synthetic fixture policy

Replay is never automatic. To make an independently approved capture available to the ordinary listener, set `ACR_SYNTHETIC_FIXTURE_DIR` to an absolute non-symlink directory containing exactly `mobile-request.json`, `platform-response.json`, and `manifest.json`. Startup atomically reads and verifies all three; missing, malformed, linked, changed, tampered or contradictory content fails closed. A usable fixture requires `VERIFIED_PLATFORM_CAPTURE`, explicit `eligibleForDeliveredReplay: true`, immutable hashes, verified synthetic origin, valid UTC capture time, canonical exact `/api/infer` route, approved 71/76/76/76/27 provenance, and captured-mode agreement. Matching ignores only transport `requestId` and transient synthetic `assessment.patientId`; all clinical/control values, including null, zero and false, must match exactly.

The supplied Build 43 Luminal B files and the source-faithful Spring/Jackson response contract fixture are labelled `UNIT_TEST_ONLY`. They are not live captures or clinical oracles and cannot produce a delivered demonstration result. Until an authorised live synthetic capture is added and verified, `/m/v1/demo/infer` returns `DEMO_FIXTURE_NOT_AVAILABLE`.

## Later authorised synthetic capture

The capture utility is disabled unless the operator supplies all three explicit paths, the independent review hand-off's exact raw request SHA-256, and the `--authorize-synthetic-capture` gate. Before any evidence probe or POST, it reads the non-symlink request with pre/post device, inode, size, modification-time and change-time checks and verifies the reviewed raw-byte hash. It then maps the mobile synthetic request through the same gateway mapper, POSTs only to the supplied exact `/api/infer` route, validates the untouched full response and actual read-only evidence, and atomically writes the three candidate artefacts. It never reads a patient database or logs request/response bodies.

```bash
npm run capture:candidate -- --authorize-synthetic-capture \
  --request=/absolute/path/to/reviewed-synthetic-mobile-request.json \
  --request-sha256=<reviewer-provided-64-hex-raw-file-sha256> \
  --upstream=https://api.acragent.com/api/infer \
  --output=/absolute/new/directory/for-candidate
```

Every tool-produced manifest is `PENDING_INDEPENDENT_REVIEW` with `eligibleForDeliveredReplay: false`; it cannot replay. The implementer and capture tool cannot approve it. The independent reviewer performs a read-only candidate review and returns only a candidate PASS or failure; the reviewer does not edit or promote the bundle. Only after candidate PASS, the parent/owner changes exactly `verificationStatus` to `VERIFIED_PLATFORM_CAPTURE` and `eligibleForDeliveredReplay` to `true`. The independent reviewer then re-verifies the promoted three-file bundle read-only before `ACR_SYNTHETIC_FIXTURE_DIR` is configured. No implementer, tool, or reviewer self-approves. Do not run the capture until the owner authorises the Mode 2 synthetic POST gate.

Tumour size is transported as the unchanged positive number entered by the user; its unit is pending clinical confirmation and the gateway performs no conversion. HER2-low maps positive to true, negative to false, and blank/unknown to null; that blank-versus-unknown collapse is explicitly lossy and provisional.
