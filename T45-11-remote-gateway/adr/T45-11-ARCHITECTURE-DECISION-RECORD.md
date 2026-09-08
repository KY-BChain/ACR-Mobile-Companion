# T45-11 Architecture Decision Record — Remote-Review Gateway

**ADR Number:** T45-11-ADR-001  
**Status:** PROPOSED / NOT APPROVED — security review amendments required  
**Date:** 2 September 2026  
**Context:** Build 45 remote-review capability  
**Deciders:** Owner (Kraken), Security Reviewer, Lead Developer  

---

## 1. Problem Statement

Build 44 mobile evaluation requires the phone to reach T3 (mobile gateway) at `192.168.1.94:3001` via HTTP on a private LAN. An invitation code authenticates the caller but cannot create network reachability. Reviewers in Ireland, UK, Japan, HKSAR, China or on cellular networks cannot access Build 44.

Build 45 must enable a small named reviewer group to evaluate the app from off-LAN networks without:
- exposing the Mac's public IP address,
- opening router ports or using UPnP,
- creating a raw public TCP listener,
- bypassing T3 to reach T1 directly,
- adding automatic Live-to-Demo fallback, or
- treating the current Mac as production SLA infrastructure.

## 2. Decision Drivers

1. **Security:** No inbound ports, no clinical data exposure, no plaintext secrets.
2. **Same-backend fidelity:** T3 must continue calling the same platform route with identical validation.
3. **Fail-closed:** Any component failure must not invent clinical output.
4. **Evaluative only:** This is evaluation infrastructure, not production service.
5. **Reversibility:** Must be stoppable without affecting website T2/T1 operation.
6. **Regional reachability:** Must work across reviewer locations; untested regions marked `NOT ASSESSABLE`.

## 3. Options Considered

### Option A — Hairpin through existing T2 (`api.acragent.com`)

```
Phone → HTTPS mobile.acragent.com → T4 → T3@127.0.0.1:3001 → HTTPS api.acragent.com → T2 → T1@localhost:8080
```

**Pros:**
- Uses the exact same verified public route that Build 44 parity tests already exercised.
- T3→T2 path is proven; no new T3→T1 integration risk.
- Website and mobile share the same platform endpoint.
- T1 does not need to accept loopback connections from T3.

**Cons:**
- Internet hairpin: traffic leaves the Mac to Cloudflare and returns.
- Adds latency; no range is claimed until measured from authorised locations.
- Requires T2 to be healthy for Live mobile; T2 outage affects both.
- Uses bandwidth on the public route for evaluation traffic.

### Option B — Direct loopback to T1

```
Phone → HTTPS mobile.acragent.com → T4 → T3@127.0.0.1:3001 → HTTP 127.0.0.1:8080 → T1
```

**Pros:**
- No Internet hairpin; lower latency.
- T2 outage does not affect mobile Live if T1 is healthy.
- Reduces dependency on T2 for mobile evaluation.

**Cons:**
- T3 must be modified to call T1 on loopback instead of T2.
- Requires proof that loopback behaviour is equivalent to public-route behaviour.
- T1 must accept connections from T3 on loopback (currently may not).
- Spring Boot profile or CORS may need adjustment.
- Creates a second integration path to maintain and parity-test.

### Option C — VPS jump host (future)

```
Phone → HTTPS mobile.acragent.com → VPS → SSH/tunnel → Mac T3
```

**Pros:**
- A VPS can improve the public edge, but the service still stops if T3/T1
  remain on a sleeping or restarting Mac.
- Better availability only if serving components are migrated off the Mac.
- Easier regional routing.

**Cons:**
- Requires VPS procurement, hardening, and ongoing cost.
- Adds a new administrative boundary.
- Out of scope for Build 45; reserved for post-evaluation migration.

### Option D — Router port-forwarding (REJECTED)

```
Phone → Mac public IP:3001 → router → T3
```

**Rejected because:**
- Exposes Mac public IP, which changes with ISP/location.
- Requires router configuration and UPnP.
- No TLS termination at edge; raw TCP exposure.
- Violates T45-11 security requirements.

## 4. Recommendation awaiting decision

**Recommended primary: Option A (Hairpin through T2)** for Build 45 evaluation.
This is not an owner decision or deployment authority.

**Rationale:**
- Build 44 parity tests already proved this path end-to-end.
- No T3 source modification needed for the upstream route.
- T3 continues to use the same `api.acragent.com` endpoint that the website uses.
- Reduces implementation risk and test surface.
- T2 health is already required for website; mobile evaluation shares that dependency.

**Secondary: Option B (Loopback)** may be prototyped in isolation after Option A is verified, but only if:
- A separate proof-of-equivalence test suite passes,
- T1 is confirmed to accept loopback connections in the target profile,
- Clinical partners approve that the same-backend guarantee holds, and
- The owner explicitly authorizes the additional integration path.

**Future: Option C (VPS)** is the preferred migration path after Build 45 evaluation completes, documented as a separate post-evaluation ADR.

## 5. Consequences

### Positive
- Fastest path to working remote review.
- Minimal T3 code changes (only bind-to-loopback and hardening).
- Reuses existing proven platform integration.
- Easy to stop: disable T4; loopback-bound T3 then remains Mac-local. LAN mode
  requires a separate authorised bind/firewall configuration.

### Negative
- Internet hairpin latency.
- T2 shared dependency.
- Mac must remain awake for remote access.

### Mitigations
- Document hairpin latency as evaluation-only limitation.
- Monitor T2 health independently of T3.
- Explicit Synthetic Demonstration remains available only while T3/T4 are
  reachable and an independently reviewed immutable exact-input fixture is
  loaded and eligible. It is never an automatic Live fallback.
- Plan VPS migration in post-evaluation roadmap.

## 6. Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────────────────────────┐
│  Reviewer Phone │ ──────────────>│  T4: Cloudflare Tunnel Edge         │
│  (off-LAN)      │   mobile.acr.  │  - TLS 1.2+ termination             │
│                 │   agent.com    │  - Six exact /m/v1 route patterns  │
└─────────────────┘                │  - Edge controls separately gated   │
                                   │  - No management/test path exposure │
                                   └──────────────────┬──────────────────┘
                                                      │
                                   outbound tunnel    │  cloudflared
                                   (no inbound ports) │
                                                      ▼
                                   ┌─────────────────────────────────────┐
                                   │  T3: Mobile Gateway @ 127.0.0.1:3001│
                                   │  - Loopback bind only               │
                                   │  - Invite auth (T45-08)             │
                                   │  - Schema validation                │
                                   │  - 16KB body limit                  │
                                   │  - Rate limiting                    │
                                   │  - No clinical data in logs         │
                                   │  - Fail-closed upstream             │
                                   └──────────────────┬──────────────────┘
                                                      │ HTTPS
                                                      │ api.acragent.com
                                   ┌──────────────────┴──────────────────┐
                                   │  T2: Existing Cloudflare Tunnel     │
                                   │  - Already operational for website  │
                                   └──────────────────┬──────────────────┘
                                                      │ HTTP
                                                      │ localhost:8080
                                   ┌──────────────────┴──────────────────┐
                                   │  T1: Spring Boot Platform           │
                                   │  - Ontology/SWRL/Openllet           │
                                   │  - Java aggregation/fallback        │
                                   │  - Optional BayesianEnhancer        │
                                   └─────────────────────────────────────┘
```

## 7. Required Components

| Component | Purpose | New/Modified |
|-----------|---------|-------------|
| T3 Gateway | Loopback bind, hardening, no clinical logs | Modified |
| T4 Tunnel | Cloudflare Tunnel to expose T3 securely | New |
| Edge Config | Route allowlist, rate limits, TLS | New |
| Mobile App | Build-time HTTPS endpoint, no cleartext | Modified |
| Operations | Start/stop/monitor/rotate/rollback runbook | New |

## 8. Approval

Before signature, record Cloudflare account/zone ownership, operator roles,
hostname approval, available WAF/rate-limit features, processor/regional/legal
assessment, credential and log retention, rotation/recovery, incident stop,
Mac sleep/travel/network operation, threat model, cost and rollback. Edge
method/body/rate/TLS policy is not supplied by tunnel ingress YAML alone.

| Role | Name | Decision | Date |
|------|------|----------|------|
| Owner | Kraken | APPROVE / REJECT / MODIFY | _______ |
| Security Reviewer | | CONCUR / DISSENT | _______ |
| Lead Developer | | CONCUR / DISSENT | _______ |

**If APPROVED:** Proceed to T45-11 Phase B implementation.  
**If REJECTED:** Document reason and revisit Option B or C.  
**If MODIFY:** Record modifications and re-review.

---

*ADR T45-11-ADR-001 v1.1 review draft — 3 September 2026*
