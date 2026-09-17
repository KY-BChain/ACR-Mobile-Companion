# T45-11 module review report

**Review date:** 3 September 2026  
**Scope:** supplied ADR, T3, T4, mobile snippets and guide  
**External-state result:** no deployment, DNS, tunnel, service or distribution

## Verdict

The supplied package was an architectural prototype, not production-ready.
The review preserved its useful topology but rejected the duplicate monolithic
gateway. The revised runnable T3 candidate composes the existing tested modular
gateway and adds a persistent, slow-hashed invitation/session service. T4
configuration is corrected to exact paths, while its setup remains deliberately
preflight-only until owner approval.

“Runnable candidate” does not mean “approved for remote reviewers.” Public
exposure remains blocked by the ADR, edge-policy, mobile secure-store,
independent-security-review and off-LAN acceptance gates.

## Critical supplied defects and dispositions

| Finding | Disposition |
|---|---|
| Any format-valid invite, refresh token and bearer token was accepted | Replaced by persistent scrypt+pepper invite verification, hashed tokens, expiry, build/install binding, rotation and replay-family revocation |
| Monolith did not validate/map all 20 fields and rejected the real platform wrapper | Removed; candidate composes `gateway/src/app.js`, AJV schemas, mapper and upstream validator |
| Attestation was reachability-only, unprotected and did not gate Live | Removed; existing protected, pinned-evidence attestation gate retained |
| Synthetic route returned an invalid placeholder | Removed; existing immutable exact-input fixture adapter retained |
| Client headers, bodies, token lifecycle and errors differed from Build 44 | Candidate client now uses `clientBuildId`, `X-Client-Build-ID`, `X-Device-Binding`, `X-ACR-Contract`, `acr.error.v1`, strict guards and bounded fetch |
| Random request ID and installation placeholder | Existing secure UUID generator retained; install proof is supplied through an injected Keychain/Keystore adapter |
| T3 host/upstream accepted unsafe values and redirects | Existing exact config and bounded fetch adapter retained; T3 wrapper adds an unconditional loopback check |
| T4 route expressions matched prefixes/suffixes | All six paths anchored with `^...$`; two default-deny rules retained |
| Credential path used tunnel name instead of generated UUID | Template corrected to `<YOUR_TUNNEL_UUID>.json` |
| Launch service hardcoded Apple-Silicon path and ran a user binary as root | Marked review-only, corrected for this Intel host, disabled auto-start; per-user LaunchAgent is preferred |
| Setup immediately mutated login, DNS, tunnel and launchd state | Replaced with read-only preflight; Phase-B implementation needs separate owner GO |
| Health script could finish successfully after failures | Replaced with bounded checks, bypass negatives, TLS expiry check and non-zero failure exit |
| Android round icon was absent; iOS path was wrong | Missing round-icon reference removed; guidance points to generated ACRCompanion plist |
| ATS/Android config falsely claimed global hostname allowlisting | Wording corrected: they block cleartext; compiled client configuration enforces the endpoint |

## Residual blockers

- The ADR has no owner signature and no approved Cloudflare account/hostname,
  threat model, processor/regional assessment, retention or incident plan.
- Edge method allowlisting, body limit, reviewer-IP rate limiting, TLS policy and
  WAF are separate Cloudflare controls; ingress YAML does not create them.
- The app needs a reviewed Keychain/Keystore `InstallationProofStore` adapter.
- T3 local rate limiting is intentionally only a global safety fuse because
  cloudflared is the local peer. Edge reviewer-IP control must be proven.
- T45-08 administration needs operator recovery/backup and lost-device procedure.
- Country reachability is `NOT ASSESSABLE` until authorised people test there.
- Clinical logic/results are outside T45-11 and require partner adjudication.

