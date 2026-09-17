# Build 46 — Device Evidence (13 September 2026)

**Build:** ACR Companion 0.6.5 (46), branch `feature/mobile-v0.6.5-build46`.
**Devices:** Samsung Galaxy S8, Xiaomi MIX Fold2, iPhone 13, tested by Kraken with
the operator session watching the gateway.
**Service:** T1/T2 started by Kraken; T3/T4 by `scripts/build46-review-service.sh`
(all seven start checks passed); T3/T4 stopped afterwards. T1/T2 were not touched.

**Result: passed on all three devices.** The 45→46 changeover is proven on the
iPhone. The Samsung and Xiaomi were paired afresh, because their Build 45 sessions
had already been lost on the phones before the update (§3).

## 1. What Build 46 changes

| Change | Requested | Commit |
|---|---|---|
| One invite code pairs with one device. The install identifier in the phone's secure keystore stands in for the IMEI, which iOS and Android 10+ do not let apps read. | Kraken, tasks 3.1–3.3 | `e5b10005` |
| The 30-day term runs from pairing. The 7-day rule applies to unused codes only. | 3.5–3.6 | `e5b10005` |
| "Incorrect device used" for another device holding a paired code. "Invite Code Expired. Request a refreshed one." after 30 days. | 3.2, 3.7 | `e5b10005`, `0b744970` |
| One-time Welcome pop-up after pairing, showing the pairing time and expiry as DDMMYY-HHMMSS UTC. | 3.6 | `0b744970` |
| Offline walkthrough only on a paired device, and it keeps the session. | task 2 | `0b744970` |
| Screen readers announce the attestation state. Connect checks the attestation once. | task 1 | `0b744970` |
| Build 45 sessions carry over to Build 46 (changeover option a). | decision 3 | `e5b10005`, `24300fee` |
| Result values colour-coded like the ACR Platform website: red HIGH/positive, green LOW/negative, blue otherwise. | task 4 | `f2a37b60` |
| "Disconnect access" asks first: "You'll need to re-enter the invite code again." | Xiaomi field note | `2ca5b427` |

The 30-day term is `SESSION_MS` in `gateway/src/auth/lifetimes.js` (line 13). Changing it
needs a gateway restart only, not an app rebuild. See runbook §6.

## 2. Automated evidence

| Suite | Result |
|---|---|
| Gateway unit and acceptance tests (incl. new `pairing.test.js`) | **212 / 212 passed** |
| Gateway end-to-end | **4 / 4 passed** |
| Mobile verifiers (`npm run verify:mobile`, 12 suites) | **all passed**, incl. new Build 46 checks |
| Local mock: real gateway over HTTP, separate test store, port 3011 | **14 / 14 passed**: changeover, first pairing, same-phone re-entry, "Incorrect device used", generic wrong-code answer, admin listing |

Expiry after 30 days and after the 7-day window is tested with a simulated clock;
nobody waits 30 days.

## 3. Device results

| | Samsung Galaxy S8 | Xiaomi MIX Fold2 | iPhone 13 |
|---|---|---|---|
| Build 45 session on the phone before the update | **lost** (§3.1) | **lost** (§3.1) | **present**: Build 45 signed in by itself, 21:42:32 UTC |
| Install | `adb install -r` over 45 | `adb install -r` over 45 | `devicectl` over 45 |
| Access | new code `gate46-samsung`, typed over USB and never shown | new code `gate46-xiaomi`, shown to Kraken (HyperOS blocks USB typing) | **no code needed.** Session moved 45→46 at 21:44:49 UTC (`CLIENT_BUILD_UPGRADED`), expiry unchanged (12 Oct) |
| Pairing pop-up | ✔ | ✔ | not applicable (existing session) |
| Signed in, VERIFIED | ✔ | ✔ | ✔ |
| Live assessment, colour-coded result | ✔ | ✔ | ✔ |
| Walkthrough in Airplane mode, still signed in afterwards | ✔ | ✔ | ✔ |
| Screen reader announces attestation | ✔ | ✔ | ✔ |
| Disconnect → re-enter own code, same expiry | — | ✔ (`INVITE_REENTERED` ×2) | — |
| Update with the Disconnect pop-up, still signed in afterwards | ✔ (refresh 21:55:47) | ✔ (refresh 21:59:09) | ✔ (built into its install) |

### 3.1 Why the Samsung and Xiaomi had no session to carry over

After Gate 12, the offline walkthrough or Disconnect was used on both phones under
Build 45 (Kraken, 13 September). Build 45 deleted the saved session on either action
(Gate 12 finding **F10**). Build 46 changes the walkthrough so it keeps the session, and
Disconnect now asks first.

Evidence that the gateway played no part:
- The gateway recorded no sign-in or refresh from either phone after its last Gate 12 use.
- Nothing was refused.
- Both apps were in-place updates (Samsung first installed 23 August).
- Build 46 found no saved session and sent no refresh.

The two orphaned server sessions (`gate12-samsung-2`, `gate12-xiaomi-2`) were revoked as
`LOST` with Kraken's approval.

## 4. Gateway request log

File: `B46_gateway_request_log.jsonl`, 112 lines, 20:43:25–21:59:10 UTC.

| Route | Result |
|---|---|
| `/m/v1/live` | 40 × 200 · 1 × 421 (the start script's own check that a request without edge headers is refused) |
| `/m/v1/auth/redeem` | 4 × 200 (2 new pairings, 2 same-phone re-entries) · 3 × 401 `INVITE_INVALID` |
| `/m/v1/auth/refresh` | 9 × 200, including the iPhone's 45→46 changeover |
| `/m/v1/attestation` | 34 × 200 |
| `/m/v1/infer` | 7 × 200, all `LIVE_REASONER` / `OPENLLET_SWRL`: live reasoning, no fallback |
| `/m/v1/demo/infer` | 2 × 404 `DEMO_FIXTURE_NOT_AVAILABLE`: synthetic demonstration chosen while signed in; no fixture is approved, so the app fails closed as designed |

Each refusal appears twice in the file: an error line and a completion line.

**The three wrong-code attempts** (21:24:24, 21:50:32, 21:53:14 UTC) got the generic answer
and had no effect.
All three were typing slips while entering the Xiaomi's code by hand (Kraken, 14 September).
An attempt with a correct code on the wrong phone would have shown "Incorrect device used"
instead.

**Privacy scan (G12-04 / AT-10 standard):** zero invite-shaped strings, tokens, device
identifiers, clinical field names, email addresses or full request IDs. The log records time,
route, status, error code, duration, result mode and an 8-character request-ID prefix only.

## 5. Builds installed

| Platform | Identity |
|---|---|
| Android APK, final (with the Disconnect pop-up) | `b0912c90892e37292f1db9cc01d71f5f7c6f2b40bd6538c051d8d7eabac2a442` · versionCode 46 · signing cert `fac61745…3b9c` (unchanged since Build 44) |
| Android APK, first Build 46 (Samsung and Xiaomi, before the pop-up) | `c8666cb592157c795313645754cf14741e7b2019737deeb42313b3e33453d6c5` |
| iOS `main.jsbundle` | `41086fdffcdf262158d7…` · 0.6.5 (46) · `EXUpdatesEnabled` false · signature valid |
| iOS provisioning profile | Personal Team `X9QB4QT8NH` · **expires 2026-09-18 23:15:33 UTC.** The iPhone build stops launching after that; rebuild per runbook §8 |

Both bundles contain exactly one compiled origin, `mobile-gateway-review.acragent.com`, and
no local-network address. The iOS build cache is now on `/Volumes/AndroidDev` (1.6 GB). An
incremental rebuild took 5½ minutes, and the old MacBook cache was deleted.

## 6. Live pairing records after the test

| Label | Paired (UTC) | Build | Expires |
|---|---|---|---|
| `gate46-samsung` | 130926-210025 | mob-v0.6.5+46 | 2026-10-13 |
| `gate46-xiaomi` | 130926-211932 | mob-v0.6.5+46 | 2026-10-13 |
| `gate12-iphone13` | 120926-003746 | mob-v0.6.5+46 (moved from 45) | 2026-10-12 |

When no Build 45 phone remains (none does now), end the changeover as described in runbook §7.

## 7. Open items

1. **Translations:** the new Build 46 text in 7 non-English locales is unreviewed. It is to be
   covered by the field translation review (Kraken: 30–60 days).
2. **F7:** the first-inference timeout after the platform has been idle did not recur today
   (first assessment 576 ms). It stays open.
3. **Carried from Gate 11 / T45-11:**
   - independent security review;
   - regional reachability;
   - DNS/certificate rotation;
   - classification of the platform database.
4. **iOS profile renewal** before 18 September (§5).
