# T45-11 local test evidence — 3 September 2026

**Classification:** local synthetic/source evidence; not remote-review acceptance  
**External mutations:** none (no DNS, tunnel, service, mobile build or distribution)

| Check | Result |
|---|---|
| New module static/persistence/composition suite | PASS — 5/5 |
| Gateway Jest suite after fixes | PASS — 158/158 |
| Gateway e2e | PASS — 4/4 |
| Candidate mobile client TypeScript | PASS |
| Existing Build 44 mobile verification | PASS; rendered visual checks remain human-only |
| Node/Bash/XML/plist syntax | PASS |
| Cloudflared ingress preflight | PASS; no external changes |
| Gateway production dependency audit | PASS — 0 known vulnerabilities at audit time |
| Git whitespace/error check | PASS |
| Independent source re-review | PASS for controlled local testing; public deployment remains blocked |

The module suite proves persistent slow-hashed invite redemption, exact Build 45
header/body binding, app-install proof binding, refresh rotation/replay-family
revocation, restart/external-revocation observation, valid error envelopes,
UUIDv4 correlation, rate-limit behavior, Build 45 inference composition, exact
T4 path anchoring and default denial.

Gateway regression evidence covers the full 20-field schema/mapper, pinned
71/76/76/76/27 evidence, live/fallback response validation, bounded upstream,
redirect refusal, fail-closed attestation, immutable exact-input Demo replay,
metadata-only logs and all six route contracts.

## Not run / not accepted

- T1/T2 live backend checks, because this review did not start platform services.
- T4 public DNS/tunnel/edge controls, because ADR and deployment GO are absent.
- Keychain/Keystore mobile integration and Build 45 native build.
- Simulator or physical-device testing.
- Off-LAN/country reachability, security runtime sign-off or distribution.
- Clinical correctness/acceptance.

These remain explicit gates in `T45-11-DETAILED-TEST-PLAN.md` and must not be
inferred from local passes.

The independent reviewer found no remaining critical local-T3 code defect after
the final corrections. Residual high-priority gaps are mobile behavioral tests,
edge pre-body/per-reviewer limiting, auth-store cross-process locking/fsync and
the complete protected-state corruption/recovery matrix.
