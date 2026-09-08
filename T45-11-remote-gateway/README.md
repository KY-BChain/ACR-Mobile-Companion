# T45-11 Remote Gateway — reviewed implementation candidate

**Review status:** VIABLE LOCAL TEST CANDIDATE / NOT APPROVED FOR PUBLIC DEPLOYMENT (2026-09-03)  
**Build 44 impact:** delivered Build 44 apps/artifacts are unchanged; the shared
source working tree now contains Build 45 candidate changes and needs explicit
branch/commit provenance before release.  
**External changes made by this review:** none. No tunnel, DNS record, service,
deployment, mobile build, or distribution was created.

This directory is a design and integration package for Build 45. It is not a
standalone replacement for `gateway/`. The originally supplied monolithic T3
and mobile client were protocol-incompatible with the tested Build 44 gateway
and contained permissive authentication placeholders. The duplicate monolith
is replaced by a runnable composition of the tested modular gateway plus a
persistent invitation/session service. Public T4 remains owner-gated.

## Authoritative implementation direction

Evolve the existing modular gateway in `../gateway/src/`. Preserve its AJV
contracts, 20-field mapper, response guards, evidence attestation, immutable
synthetic fixture adapter, `acr.error.v1` envelopes, and six `/m/v1` routes.
Do not transplant the rejected monolith.

The proposed remote path, subject to a signed ADR and owner deployment GO, is:

```text
reviewer phone --HTTPS--> approved mobile hostname --T4 outbound tunnel-->
T3 127.0.0.1:3001 --approved Option A or B--> T1 reasoner
```

Option A retains the existing T2/API route between T3 and T1. Option B uses
T1 loopback only after separate same-backend parity evidence. Neither option
permits public port forwarding or a public T3 listener.

## Release blockers

1. Owner signs the ADR and separately authorises Phase B external changes.
2. Complete the remaining T45-08 mobile Keychain/Keystore adapter, operator
   recovery review and full auth matrix. The local candidate now has persistent,
   expiring, individually revocable invitations, slow salted hashing with a
   protected pepper, and token-family rotation/replay revocation. A hardware
   fingerprint is prohibited.
3. Existing modular gateway and mobile client are updated together without
   changing the `acr.cds.v1` contract accidentally.
4. All gates in `docs/T45-11-DETAILED-TEST-PLAN.md` pass.
5. An independent security reviewer signs the fixed source and runtime evidence.
6. Owner separately approves reviewer distribution. Clinical acceptance is
   never inferred from technical tests.

## Files

- `adr/`: proposed decision record; no signature is recorded.
- `t3-gateway/`: runnable loopback T3 candidate and local invite administration.
- `t4-tunnel/`: reviewed templates; running setup is an external-state change.
- `mobile/`: contract-compatible client candidate and transport snippets; merge
  into the existing mobile source rather than shipping a second client.
- `docs/T45-11-REVIEW-REPORT.md`: findings and dispositions.
- `docs/T45-11-DETAILED-TEST-PLAN.md`: executable gate sequence.
- `tests/`: offline persistence/static checks and real gateway composition test.
