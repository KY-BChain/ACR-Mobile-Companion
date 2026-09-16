# Build 47 (v0.6.6) — Device Evidence (16 September 2026)

**Result: PASS on all three test phones.** Samsung Galaxy S8, Xiaomi MIX Fold2 and iPhone 13 (iOS 27.0) run the final Build 47. Kraken ran and passed every device test, including the retests of the fixes made during the day.

**Branch:** `feature/mobile-v0.6.6-build47` · **Plan:** `docs/operations/BUILD47_PLAN_15SEPT26.md` (approved by Kraken, 16 September 2026)
**Scope kept:** mobile-only (Phase 1) plus Android A–C. No change to T1, the platform or the request/response contract. The platform checkout was read only (`33daead`, unchanged). No EAS, cloud build, store submission or push. Synthetic data only.

---

## 1. What Build 47 delivers

| ID | Change | Device result |
|---|---|---|
| M1 | "Complete missing fields" returns to the first screen holding a missing value, with every value kept | PASS (tier 1 → 2 → 3 on all phones) |
| M2 | T1's field names shown as app labels with the screen number | PASS |
| M3 | One localised "Full assessment not reached" notice; T1's own text still shown unchanged | PASS |
| M4 | Risk line "withheld — needs …" instead of a blue dash | PASS |
| M5 | Deterministic risk greyed out and labelled "(not an assessed risk)" while risk is withheld | PASS |
| M6 | "Rules blocked" moved to Technical details as the platform's fixed figure | PASS |
| M7 | Review lists blank values T1 needs, with "Go to" links; submission still allowed | PASS |
| M8 | "needed for a full assessment" marker on grade, nodal status, age, stage, tumour size, ECOG | PASS |
| M9 | Review marks Steps 1–3 values still holding the sample | PASS |
| M10 | New strings in 8 locales (7 non-English are drafts) | English and Chinese PASS; see §8 |
| M11 | "Signed in on this device — waiting for the server" with Retry, instead of an empty invite field | PASS |
| M12 | Synthetic demo loads the demonstration case and replays the approved recorded result; Review warns if it is changed | PASS (8 replays, 1 correct refusal of a changed case) |
| A | Android release signing with CRIL's key; the build refuses the debug key | PASS |
| B | Android app ID `com.acragent.companion` | PASS |
| C | arm64-v8a and armeabi-v7a APKs, universal APK, app bundle | PASS |

### Changes made from the device tests (same day)

| Finding (phone) | Change | Retest |
|---|---|---|
| Risk word stayed in English (Samsung) | Summary risk shown in the reader's language: HIGH / INTERMEDIATE / LOW; 高危 / 中危 / 低危 (Kraken's choice, the ACR Platform website's terms). Colour still follows T1's word | PASS |
| "Checking…" never ended after unplugging USB, although T3/T4 were up (Samsung) | The reachability check gives up after 10 s, runs again when the app returns to the foreground, and Retry shows whenever the gateway reads not connected | PASS |
| Demo mode looked the same as live (Samsung, Kraken) | Synthetic demonstration in amber `#b45309`: the selected button and the delivery mode on Review; 5:1 contrast both ways | PASS |
| Number pad stayed open on screens 4 and 5, hiding Next / Review (iPhone) | Done bar above iOS number pads; Android's Done key closes the keyboard; footer rises above the keyboard; taps on Next/Review work with it open | PASS on all three |
| Review warnings not prominent enough (iPhone, Kraken) | "Needed for a full assessment" and "Demonstration case changed" as red boxes with red "Go to" links (4.8:1) | PASS on all three |

## 2. Commits

| Commit | What |
|---|---|
| `0e74fe11` | Field reference, MSP logical-flow investigation and findings, approved plan |
| `76a3ef43` | Build 47 M1–M12, version 0.6.6 (47), Android A–C settings, script rename, new verifier |
| `4fce2cf5` | Risk word in the reader's language |
| `44e7b46f` | Time-limited gateway check; amber demo mode |
| `5a61cb99` | Keyboard gives way; red Review warnings |
| (this commit series) | Xcode 26.3 project normalisation; runbook, signing record and this evidence |

## 3. Automated checks (final commit)

| Check | Result |
|---|---|
| TypeScript (`tsc -p tsconfig.active.json`) | clean |
| Mobile verifiers (`npm run verify:mobile`) | 13 of 13 pass, including the new `tests/mobile/completeness.verify.js` |
| Gateway (`npm test` in `gateway/`) | 231 of 231 |
| End-to-end | 4 of 4 |

The new verifier pins the ten completeness fields to T1 (`ReasonerService.assessDataCompleteness`, platform `33daead`), so any platform change to them fails the check.

## 4. Builds

### Android (signed with the CRIL release key)

| File | Size | Package / version | ABIs |
|---|---|---|---|
| `app-arm64-v8a-release.apk` | 32.0 MB | `com.acragent.companion` 47 / 0.6.6 | arm64-v8a |
| `app-armeabi-v7a-release.apk` | 27.2 MB | same | armeabi-v7a |
| `app-universal-release.apk` | 73.1 MB | same | all four |
| `app-release.aab` | 36.7 MB | same | Google Play |

- **Certificate SHA-256 (all four):** `65a04dbbee2bf1104b6dc89ca5a9fe1e356f4598b340e72939c3beb649a815fc`. The debug key (`fac61745…3b9c`) is no longer used for release builds.
- **Each bundle contains:** the single gateway origin (`mobile-gateway-review.acragent.com`) and the Build 47 text, checked in the Hermes bundle (non-ASCII strings are stored as UTF-16).
- **Key record and backup:** `docs/operations/BUILD47_ANDROID_RELEASE_SIGNING.md`. Kraken confirmed two off-site backups of `~/.acr-signing` on 16 September.

### iOS

- **App:** 0.6.6 / 47, bundle `com.anonymous.acr-mobile-companion` (unchanged, so the session survives). One compiled origin, no LAN origin, OTA off, signature valid.
- **Tools:** Xcode 26.3; installed on iOS 27.0.
- **Profile:** renewed to **23 September 2026, 13:49 UTC** after Kraken signed in to Xcode. The earlier profile would have stopped the app on 18 September.
- **Warnings:** Xcode reported 562; the build log has 102 distinct. None is in the app's own code: 75 are in React Native and library headers, 27 are Hermes notices about runtime globals.

## 5. Review service

- **T3/T4:** `scripts/build47-review-service.sh start` passed all seven checks both times it ran: current build `mob-v0.6.6+47`, Build 46 sessions accepted for the changeover. T1 and T2 were started and stopped by Kraken only.
- **Demonstration fixture (M12):**
  - **Captured** 11:31:47 UTC from the live platform with the gateway's capture tool: reasoner v2.2, OPENLLET_SWRL, 71/76/76/76/27, ontology `b9102586…`.
  - **Case:** the stored e2e fixture plus the seven Gate 1 complete-fixture values (tumour size 22, female, ECOG 1, PD-L1 negative, HER2-low positive, LVEF 60, adjuvant).
  - **Result:** tier 3 · LuminalB_HER2Negative · INTERMEDIATE · R17b and R33 treatments · Bayesian confidence 60.02%, matching Gate 10.
  - **Approval:** Kraken approved it at 11:56 UTC, to be flagged to the reviewer testers. It is stored outside the repository at `~/.acr-gateway/fixtures/demo-mob-v0.6.6+47/`, and must be re-captured for every new build ID.

## 6. Devices and sessions

| Phone | Install | Session (label · build · valid until) |
|---|---|---|
| Samsung Galaxy S8 (SM-G950F) | New app (new app ID), then two in-place updates | `gate47-samsung-2` · `mob-v0.6.6+47` · 16 Oct 2026 |
| Xiaomi MIX Fold2 (22061218C) | New app, then one in-place update | `gate47-xiaomi` · `mob-v0.6.6+47` · 16 Oct 2026 |
| iPhone 13 (iOS 27.0) | Over Build 46, then over the first Build 47 | `gate12-iphone13` · moved to `mob-v0.6.6+47` at its first refresh (12:59:24 UTC) · 12 Oct 2026 |

**Housekeeping on the gateway and phones:**
- The old Build 46 apps (`com.anonymous.acr_mobile_companion`) were uninstalled from the Samsung and Xiaomi once Build 47 was paired. Their sessions `gate46-samsung` and `gate46-xiaomi` were revoked (LOST).
- **`gate47-samsung` was revoked unused (operator error):** the code was typed while no field was selected, and the only copy had already been deleted. It was replaced by `gate47-samsung-2`. No code was shown, stored or logged.
- The Xiaomi code was shown to Kraken in chat (HyperOS blocks typing over the cable), entered once, and the operator's copy deleted after pairing.

## 7. Gateway request log

`B47_gateway_request_log.jsonl`: 220 events, 11:32–14:21 UTC. It holds allow-listed metadata only: time, event, 8-character request-ID prefix, route, method, status, duration, scheme, error code, result and reasoning mode. It was scanned for invite codes, tokens, patient IDs, long secrets and e-mail addresses: none found.

| Route | Status | Count |
|---|---|---|
| `/m/v1/attestation` | 200 | 71 |
| `/m/v1/live` | 200 | 56 |
| `/m/v1/infer` (LIVE_REASONER) | 200 | 30 |
| `/m/v1/auth/refresh` | 200 | 11 |
| `/m/v1/demo/infer` (LOCAL_SYNTHETIC_DEMO) | 200 | 8 |
| `/m/v1/live` without edge headers (local check) | 421 | 2 |
| `/m/v1/auth/redeem` | 200 | 2 |
| `/m/v1/demo/infer`, changed demonstration values | 404 `DEMO_FIXTURE_NOT_AVAILABLE` | 1 request (2 log events) |

Live inference took 141–440 ms (median 199 ms). No authentication failure, rate limit or attestation mismatch occurred.

## 8. Open items

1. **The seven non-English languages:** Kraken's test without USB was still to be run at close; English and Chinese passed. All 7 non-English Build 46 and Build 47 strings remain drafts for the field review.
2. **iPhone:** rebuild before **23 September, 13:49 UTC** (runbook §7).
3. **Changeover:** no Build 46 app remains, so `ACR_PREVIOUS_CLIENT_BUILD_IDS` can be set to `""` in the script.
4. **Old sessions:** six Build 45 test sessions from Gates 10–11 (`gate10-*`, `gate11-smoke`) are still listed as live but unusable; revoke on request.
5. **Plan phases 2 and 3:** the platform items P1–P7, and the four clinical questions for ZZU/UCD, unchanged.
6. **Before external distribution:** Android D (Google Play minimum API level) and E (Chinese store filing) from `App_distribution_invite_code_14SEPT26.md`, plus Kraken's authorisation for anyone beyond the named test devices.
7. **Closed state, confirmed 14:47 UTC.** T3/T4 were stopped by the script. A first check straight after Kraken closed T1/T2 appeared to show them still active; on investigation:
   - The `acr-api` process count was a false positive: the operator's `pgrep -f` pattern matched its own shell command line.
   - The port 8080 listener was real but still shutting down.
   - Re-checked, nothing listens on 8080 or 3001, and there is no platform JVM or `cloudflared` process. T1 health gives no answer, and `api.acragent.com` and the review endpoint both return 530.
   - The only Java processes left belong to the VS Code Java extension, not T1.
