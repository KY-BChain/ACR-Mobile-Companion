I completed the review and created a corrected v1.1 while preserving the original v1.0:

[ACR_MOBILE_BUILD45_FULL_IMPLEMENTATION_PLAN_v1.1.md](/Users/Kraken/DAPP/acr-mobile-companion/docs/loop/ACR_MOBILE_BUILD45_FULL_IMPLEMENTATION_PLAN_v1.1.md)

SHA-256:

```text
63831d8a025cee7469f368cce53d4e6d705c66c88311e9ce4652cb9629bd35db
```

No Build 45 branch, commit, push, tunnel, deployment or distribution action was performed.

## Review assessment

The v1.0 proposal was strong in several respects:

- It covered all T45-01–T45-12 and C45-01–C45-11 items.
- It correctly separated T45-11 design from owner-authorised implementation.
- It established human controls over merges, clinical decisions and deployment.
- It included partner review, evidence and risk-management structures.

The main corrections in v1.1 are:

- Replaced invented API routes and incomplete TypeScript examples with the actual Build 44 routes and complete 20-input contract.
- Made Build 45 an evaluation candidate, not a presumptive release.
- Replaced the speculative 127-day schedule with evidence gates.
- Restricted device requirements to the devices actually available.
- Retained the no-Android-emulator rule.
- Prohibited clinical facts/results from all operational log levels, including DEBUG/TRACE.
- Replaced ambiguous “de-identified” cases with wholly synthetic/non-patient cases.
- Removed Apple Watch, Siri, Health and result-history work from Build 45 because they create a separate persistence, privacy and intended-use project.
- Made GitHub Projects, issues, tags, CI, signing and automation owner-authorised proposals rather than automatic actions.
- Separated private raw evidence from redacted public GitHub documentation.
- Added explicit Build 45 identity requirements: `0.6.5`, Build `45`, and `mob-v0.6.5+45`.

## How the gateway works now

Build 44 uses this path:

```text
Build 44 mobile app
    │
    │ HTTP — private LAN only
    │ 192.168.1.94:3001
    ▼
T3 mobile gateway on the Mac
    │
    │ HTTPS
    │ https://api.acragent.com/api/infer
    ▼
T2 existing Cloudflare acr-api tunnel
    │
    │ http://localhost:8080
    ▼
T1 Spring Boot hybrid service
    │
    ├─ Ontology
    ├─ SWRL/Openllet
    ├─ platform Java aggregation/fallback
    └─ optional Bayesian module
```

T3 does not perform clinical reasoning. It:

- verifies the invitation credential;
- creates in-memory access and refresh tokens;
- binds them to the declared app installation and exact Build 44 identity;
- validates headers, body size, JSON and the complete request schema;
- checks actual platform reasoner/ontology evidence;
- maps the mobile request to the platform request;
- calls `/api/infer`;
- validates the platform response; and
- returns it without manufacturing subtype, risk, recommendations, rules or Bayes values.

Its actual routes are:

| Route | Function |
|---|---|
| `GET /m/v1/live` | T3 process liveness |
| `POST /m/v1/auth/redeem` | Invitation redemption |
| `POST /m/v1/auth/refresh` | Refresh-token rotation |
| `GET /m/v1/attestation` | Platform/reasoner verification |
| `POST /m/v1/infer` | Live platform inference |
| `POST /m/v1/demo/infer` | Explicit verified synthetic replay |

The synthetic route is never an automatic fallback. It works only with an independently reviewed immutable fixture matching the submitted clinical/control values. It truthfully reports that the current platform execution was not performed.

The limitation is networking: `192.168.1.94` is private. An invitation code authenticates the user, but it cannot make that address reachable from Ireland, the UK, Japan, HKSAR, China or another network.

## What Build 45 needs

The proposed remote route is:

```text
Selected reviewer’s phone
    │
    │ HTTPS — approved Build 45 hostname
    ▼
Public TLS/security edge
    │
    │ dedicated authenticated outbound tunnel
    ▼
T3 bound to 127.0.0.1 on the Mac
    │
    │ validated same-backend request
    ▼
Existing ACR Platform route
    ▼
T2 → T1 → Openllet/SWRL/Java/Bayes
```

This adds a proposed fourth service boundary:

| Tier | Role |
|---|---|
| T1 | Spring Boot reasoner and optional Bayes |
| T2 | Existing website/platform API tunnel |
| T3 | Mobile authentication, validation and transport gateway |
| T4 | Proposed dedicated HTTPS tunnel exposing only T3’s approved mobile routes |

Under the recommended exact-route option:

- Website backend functions require T1 + T2.
- Remote Live mobile requires T1 + T2 + T3 + T4.
- Remote verified Synthetic Demonstration requires T3 + T4 and an eligible fixture.
- App launch and offline navigation require none of them.

My recommendation for the small initial reviewer group is to retain T3’s call through the already verified public `api.acragent.com/api/infer` route. That preserves the same route used for Build 44 parity, although it adds an Internet hairpin and requires T2. Calling T1 directly over loopback is possible, but it must be a deliberate architecture decision and would need separate proof that public-route behaviour remains equivalent.

Before T4 can be deployed, Build 45 requires:

1. Owner approval of the architecture, hostname/provider/account ownership and operating model.
2. A dedicated HTTPS mobile hostname—never the Mac’s public IP.
3. T3 bound to loopback, with no router forwarding, UPnP or exposed raw port.
4. An edge route allowlist exposing only the necessary `/m/v1/*` surface.
5. Unique, expiring, individually revocable invitation records.
6. Salted slow invite verification, brute-force rate limits and no plaintext invite storage.
7. Local-only invite administration—not a public `/gateway/auth/revoke` endpoint.
8. Stronger app-installation proof using Keychain/Secure Enclave or Android Keystore; the current self-declared binding header is not strong attestation.
9. Build-time HTTPS endpoint configuration and removal of Build 44’s Android cleartext exception.
10. Distinct UI states for gateway reachable, platform verified/online, platform unavailable and gateway unreachable.
11. Genuine off-LAN cellular testing plus TLS, DNS, tunnel, restart, expiry, revocation, replay and outage tests.
12. Independent security review before any selected reviewer receives the build.

The revised gateway and contract section begins at [Part 5](/Users/Kraken/DAPP/acr-mobile-companion/docs/loop/ACR_MOBILE_BUILD45_FULL_IMPLEMENTATION_PLAN_v1.1.md:516). The evidence-gated implementation sequence begins at [Part 10](/Users/Kraken/DAPP/acr-mobile-companion/docs/loop/ACR_MOBILE_BUILD45_FULL_IMPLEMENTATION_PLAN_v1.1.md:759).