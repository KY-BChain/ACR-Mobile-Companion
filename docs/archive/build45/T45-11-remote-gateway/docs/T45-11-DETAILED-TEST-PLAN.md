# T45-11 detailed test and acceptance plan

Every test uses synthetic facts only. Never enter real patient data. Record
PASS, FAIL, BLOCKED or NOT ASSESSABLE with timestamp, commit, operator, command,
redacted output and artefact hash. A missing test is not acceptance.

## Gate 0 — source and build

1. Confirm Build 44 commit/artifacts remain recoverable and record the Build 45
   commit under test.
2. Run `scripts/test-local.sh`; require zero failures.
3. Run gateway Jest and e2e suites after `npm ci` in `gateway/`.
4. Run root TypeScript, lint and mobile verification suites.
5. Validate merged generated iOS plist with `plutil -lint` and Android manifest/
   resources with Gradle on the S8-compatible minimum SDK.
6. Scan release source and packaged binaries for `192.168.1.94`, `http://`,
   editable endpoints, Build 43/44 identity and placeholder secrets. Expected
   Build 45 identity is exactly `mob-v0.6.5+45`.
7. Produce dependency lock diff, audit output and SBOM. Review every new package.

## Gate 1 — configuration/listener

- Default and configured host are exactly loopback; reject LAN, wildcard and
  public listeners.
- Reject invalid ports/timeouts, non-HTTP(S), plaintext non-loopback, query/hash,
  wrong endpoint paths and mixed evidence origins.
- Refuse startup if auth store/pepper, platform route, evidence or build identity
  is absent or malformed. Prove store and pepper are regular non-symlink 0600
  files inside an owner-only directory.
- Live platform POST must not follow redirects; timeout must be bounded.
- Verify restart, SIGTERM, crash/backoff, sleep/wake and Mac network changes.

## Gate 2 — 20-field contract and mapping

- Test each required, optional, null, zero and false boundary for all 20 inputs.
- Reject unknown fields, invalid enum/date/UUID/build/environment, NaN/Infinity,
  malformed JSON and payloads above 16 KiB.
- Require `X-ACR-Contract`, matching header/body request IDs and exact build ID.
- Assert byte/value mapping to `{patientData,bayesianEnhanced,analysisVersion}`,
  including the documented HER2-low lossy mapping.
- Validate complete live/fallback/Bayes success and reject partial, non-JSON,
  unknown-mode, patient-ID mismatch and malformed outputs without inventing data.

## Gate 3 — T45-08 authentication

- Create unique high-entropy invitations; prove plaintext is shown once and is
  absent from store/logs/backups. Verify scrypt parameters, random salt and pepper.
- Test expiry edges, maximum redemption, wrong invite/build/install proof,
  individual revoke, lost device and reinstall. Never use hardware fingerprinting.
- Prove access expiry, refresh rotation, concurrent double-use and replay-family
  revocation, including process restart persistence.
- Test corrupt/missing store, pepper loss, symlink/file-mode refusal, atomic-write
  interruption, approved backup/restore and operator recovery.
- Exercise brute force/rate limits and ensure audit metadata remains bounded.

## Gate 4 — six-route integration

- `/m/v1/live` is public and contains only `{status:"UP"}`.
- Redeem and refresh obey the exact auth contracts. Attestation, Live inference
  and Demo inference require token, build and install proof.
- All successes/errors validate `acr.attestation.v1`, `acr.cds.v1` or
  `acr.error.v1`, including status/retryable/outcome semantics.
- Attestation VERIFIED/MISMATCH/UNAVAILABLE/freshness tests pass. Live re-attests
  at submission and fails before upstream unless VERIFIED.
- Upstream timeout becomes INDETERMINATE with no automatic clinical retry;
  4xx/5xx/non-JSON/redirect/partial output fails safely.
- Demo replays only an exact eligible immutable fixture. Any edited null/zero/
  false/value fails. Demo is explicit and never a Live fallback.

## Gate 5 — privacy/logging

Seed unique sentinels in every input plus result/rule/Bayes/invite/token/install
proof. Exercise success, parser, auth, attestation, upstream, demo, error and
crash paths. Scan T1, T2, T3, T4, mobile and crash logs at every enabled level.
Allow only random correlation ID, duration, bounded category/status/route/build.
Fail on any clinical fact, derived result, body, invite, token, proof or stack.

## Gate 6 — mobile client

- Keychain/Keystore adapter generates and persists a random app-install proof;
  uninstall/reinstall behavior matches policy.
- Endpoint/build identity are generated from build configuration and cannot be
  edited at runtime. No HTTP fallback exists.
- Redeem stores the in-memory session; refresh updates atomically; one 401 causes
  at most one refresh/retry; 403/409 clears the session.
- Timeout/cancel works and inference is never automatically retried.
- Strict response/error guards drive every distinct honest UI connection state.

## Gate 7 — T4 and edge (only after signed ADR and Phase-B GO)

- Validate hostname, DNS, certificate chain/name/expiry and TLS 1.2/1.3; reject
  TLS 1.0/1.1. Test certificate rotation.
- Permit only the exact required method+path pairs. Reject alternate hosts,
  prefixes, suffixes, trailing/double slashes, case changes, traversal and encoded
  variants. No admin/test/platform route may reach T3.
- Prove edge method/body/rate/WAF policy separately from tunnel ingress. Ensure
  reviewer-IP identity cannot be spoofed and reviewers do not share one T3 bucket.
- Verify credential/config/log ownership, rotation and retention. Prove no Mac
  origin port is reachable from LAN or WAN.
- Test setup twice, existing/partial resources, cancellation and full rollback in
  a non-production Cloudflare account before touching the approved zone.

## Gate 8 — controlled same-backend integration

Start T1, then existing T2, T3 and T4. Confirm exact health/status/manifest
baseline. Submit authorised synthetic Live cases for Openllet/SWRL, authorised
Java fallback and Bayes off/on. Compare gateway output to direct canonical API
and website behavior. Stop T1, T2, T3 and T4 independently and confirm distinct,
honest UI states with no stale Connected state. Roll back T4/T3 and prove website
T1/T2 operation is unaffected.

## Gate 9 — off-LAN physical acceptance

Use cellular with Wi-Fi disabled on iPhone 13, Samsung S8 and Xiaomi MIX Fold 2.
Use a distinct invite per installation/reviewer. Complete five screens/20 fields,
Live, explicit Demo, expiry and revoke. Unplug build tools; no Metro and no Android
emulator. Force-close/relaunch standalone. Tests in Ireland/UK/Japan/HKSAR/China
require actual authorised reviewers; otherwise mark NOT ASSESSABLE.

## Gate 10 — human acceptance

Independent security reviewer signs fixed source and runtime evidence. Owner
signs ADR and deployment GO before T4 changes, then separately approves the
distribution route. Clinical partners decide clinical items. Do not claim
production readiness until Gates 0-7 pass or reviewer release until Gates 8-10.

