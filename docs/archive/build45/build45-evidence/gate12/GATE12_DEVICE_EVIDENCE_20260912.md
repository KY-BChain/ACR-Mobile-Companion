# Build 45 — Gate 12 Evidence: Rebuilt Apps on Physical Devices

**Authority:** `ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_1.md` §12
**Dates:** 11–12 September 2026 (UTC)
**Final build under test:** `b8950363` (`feature/mobile-v0.6.5-build45`), identity **0.6.5 / 45**, `mob-v0.6.5+45`

**Result: Gate 12 device testing COMPLETE on three physical devices, all on the final
build.** Device testing found four client defects in the P3 session work and one false
privacy statement. All five were fixed, re-verified and re-tested on devices within the
gate. Across the final-build device runs, the gateway recorded **0 non-2xx responses**.

This gate does not change `G_COMPLETE`: the Gate 11 items (independent reviewer,
platform data classification) are still outstanding. **No external distribution is
authorised by this gate.**

All traffic was synthetic. No invitation code, token or device binding appears in this
document, the committed log or the screenshots.

---

## 1. What was built

| Commit | Change | Why |
|---|---|---|
| `5cbe67ce` | exclude `expo-dev-client` pods / modules | restore a Release composition without the dev launcher (P14) |
| `18f3879c` | New assessment / Cancel keep access; refresh clears only on a gateway refusal; single-flight refresh and restore; invite field hidden while signed in | Samsung finding F1, F2 |
| `3061fa93` | correct the privacy statement in all 8 locales | simulator finding F5 |
| `c136784f` | stop ending evaluation access on every app launch | Xiaomi finding F3 |
| `b8950363` | fetch baseline evidence after a restore or a new assessment | Xiaomi finding F4 |

| Artefact | Identity |
|---|---|
| Android APK (final) | `app-release.apk` SHA-256 `4d0e609ae01c879e6d495c959197fab048b4272fd58784ac0d2aa9f01250dcb6`, 73,119,329 bytes, built 2026-09-12 00:24 UTC |
| Android signing | debug keystore, cert SHA-256 `fac61745…3b9c` — **identical to the shipped Build 44 APK**, so Build 45 installs over Build 44 in place |
| iOS app (final) | `main.jsbundle` SHA-256 `cc5481ab4cc1…`, built 2026-09-12 00:23 UTC, `codesign --verify --deep --strict` OK |
| iOS signing | Apple Development (team `X9QB4QT8NH`, Personal Team); Xcode-managed profile, 1 provisioned device (the iPhone 13), **expires 2026-09-18 23:15 UTC** |
| Toolchain | Xcode 26.3; Android build-tools 34.0.0, Gradle 8.8, JDK 21.0.11 (Temurin); `@react-native/gradle-plugin` 0.74.87 |

### Content checks run on every build before any install

| Check | Android | iOS |
|---|---|---|
| Version 0.6.5 / 45 | ✅ | ✅ |
| One compiled origin `https://mobile-gateway-review.acragent.com`, no LAN origin, no Metro origin | ✅ | ✅ |
| Cleartext | `usesCleartextTraffic=false`; `network_security_config` = `base-config cleartextTrafficPermitted=false` only | ATS `NSAllowsArbitraryLoads=false`; `NSLocalNetworkUsageDescription` absent |
| OTA | `expo.modules.updates.ENABLED=false`, no update URL | `EXUpdatesEnabled=0`, no update URL |
| Dev client | 0 dev-launcher / dev-menu class definitions | 0 bundles, 0 symbols |
| Session fix present (`restoreFromStore`, `rotateRefresh`) | ✅ | ✅ |
| Corrected privacy statement present; old one absent | ✅ | ✅ |

**Composition change against Build 44 (Android).** The shipped Build 44 APK contains
the full `expo-dev-launcher` / `expo-dev-menu` (DevLauncherController, DevMenuModule,
Metro client, shake detector). Build 45 contains none of it. The only dev-launcher-named
strings left are `expo-updates`' own `UpdatesDevLauncherController`. This removes a
component that can load a JS bundle from a URL at runtime. `expo-updates` 0.25.28 is
compiled in on both platforms, exactly as in Build 44, but disabled with no update URL.

## 2. Devices and results (final build `b8950363`)

| | Samsung Galaxy S8 (SM-G950F) | Xiaomi MIX Fold2 | iPhone 13 |
|---|---|---|---|
| OS | Android 9 (API 28) | HyperOS OS3.0.9.0 / Android 15 (API 35) | iOS 26.6.2 |
| Install | `adb install -r` over Build 45 `5cbe67ce` | `adb install -r` over `c136784f` | `devicectl` over USB; one-time certificate trust on the device |
| Connect, attestation **VERIFIED** (71/76/76/76/27) | ✅ | ✅ | ✅ |
| Live assessment | ✅ infer 200, 425 ms | ✅ infer 200, 492 ms | ✅ infer 200, 727 ms |
| New assessment keeps access | ✅ | ✅ | ✅ |
| Restart restores access **without an invitation** | ✅ `am force-stop` + cold start → refresh 200 | ✅ `am force-stop` + cold start → refresh 200 | ✅ swipe-away + reopen → refresh 200 |
| Access survives an **app update** | — | ✅ `c136784f` → `b8950363`, refresh 200, no redeem | — |
| Offline launch keeps the stored session | ⚠ resumed, not cold (see below) | ✅ cold offline launch, then online cold launch → refresh 200 | ✅ offline launch, then online → refresh 200 |
| Offline state shown, no silent demo fallback | ✅ (Kraken, on screen) | ✅ | ✅ |
| Non-2xx responses | 0 | 0 | 0 |

**Samsung offline launch.** The phone's own process log shows only one app process
exit after the forced restart (00:56:51 UTC), so reopening with Wi-Fi off resumed the
still-running process rather than cold-starting it. What the Samsung proves is recovery
after an offline period: a cold online launch at 00:57:07 refreshed the same token
family. A *cold* offline launch on Android is proven on the Xiaomi (phone log: process
started 00:25:19 UTC with no gateway traffic; next online cold start refreshed at
00:25:42).

### Timelines (gateway log, UTC)

**iPhone 13:** 00:37:46 redeem 200 → attestation 200 · 00:38:20 infer 200 · 00:38:35
New assessment (re-attested) · **00:39:05 refresh 200** (restart; no redeem) · no
traffic (offline launch) · **00:40:18 refresh 200** (back online; no redeem).

**Xiaomi:** 00:16:04 redeem 200 · 00:17:03 infer 200 · **00:18:24 refresh 200** (forced
cold restart) · 00:25:19 cold offline launch, no traffic · **00:25:42 refresh 200** ·
00:26:01 infer 200 · update to `b8950363` · **00:29:06 refresh 200**, screen "Gateway
connected — Live Platform verified".

**Samsung:** 00:52:00 redeem 200 · 00:52:41 infer 200 · 00:52:59 New assessment ·
**00:53:57 refresh 200** (forced cold restart) · 00:54–00:57 no traffic (Wi-Fi off) ·
**00:57:08 refresh 200** (cold, back online).

Screenshots: `G12_xiaomi_mixfold2_b8950363_restored_after_update.png`,
`G12_samsung_s8_b8950363_restored_after_forcestop.png`. Full request log:
`G12_gateway_request_log.jsonl`.

## 3. Findings

| # | Finding | Found on | Fixed in | Status |
|---|---|---|---|---|
| F1 | "New assessment" and Step 1 "Cancel" called `clearSession()`, which since P3 also deletes the stored refresh token — one assessment signed the evaluator out for good (single-use invitation) | Samsung | `18f3879c` | fixed, device-proven |
| F2 | Any refresh failure — including a transport failure — cleared the session, so an offline launch wiped it. Now cleared only on a gateway refusal (`SESSION_INVALIDATING_CODES`) or a 200 whose body was unusable. Four Build 44 verifier expectations were updated: they encoded the rule when tokens were memory-only | Samsung | `18f3879c` | fixed, device-proven |
| F3 | `App.tsx` cleared the session on every process launch (Build 44 H-SIM "nothing from a prior token family survives"). The P3 verifiers never covered `App.tsx`. **G10-0 / P3 (AUTH-03), approved by Kraken, supersedes that part of H-SIM**; a launch still resets the assessment cycle | Xiaomi | `c136784f` | fixed, device-proven |
| F4 | After a restore or a new assessment the access screen read "Live Platform offline", attestation "—", while verified: the restore effect re-ran on its own `accessReady` change and its cleanup dropped the attestation result. Display only — `ReviewScreen` re-attests before every live submission | Xiaomi | `b8950363` | fixed, device-proven |
| F5 | The access screen said "The invite, tokens and device binding are never written to device storage" — false since P3. Corrected in all 8 locales to state exactly what is stored | iOS simulator (`G12_ios_sim_5cbe67ce_prefix_false_privacy_statement.png`) | `3061fa93` | fixed; **7 translations unreviewed** |
| F6 | **Build-process trap.** `@react-native/gradle-plugin` 0.74.87 `BundleHermesCTask` fingerprints only `**/*.js|jsx|ts|tsx` (`BundleHermesCTask.kt:34-37`). A JSON-only change (locales) left `createBundleReleaseJsAndAssets` UP-TO-DATE and produced a byte-identical APK — caught only by the pre-install content check | Android build | process | mitigated: always `--rerun` the bundle task and grep the APK before install |
| F7 | The first live inference after the platform sat idle timed out at the gateway's 8 s limit (504 `UPSTREAM_TIMEOUT`); the retry took 1.9 s. The client failed closed, no demo fallback | Samsung (first run) | — | open: raise the timeout or warm the reasoner |
| F8 | Accessibility: the attestation row is announced as "Baseline attestation:" with no state (`Row` builds its label from `value`, empty when a badge is shown; the badge has no label). Same pattern on Review and Fail-closed screens. Pre-existing; contradicts the Gates 8–9 accessibility evidence | Xiaomi (UI tree) | — | open — **after Gate 12** (Kraken) |
| F9 | Connect fetches attestation twice (the Connect handler and the new evidence effect) | iPhone / Samsung log | — | open, harmless — with F8 |
| F10 | Offline walkthrough ends evaluation access (`startWalkthrough` → `clearSession()`) | code review | — | open — **after Gate 12: keep the saved session** (Kraken) |

**Tooling notes (no product impact).**
- HyperOS refuses `adb` input injection unless "USB debugging (Security settings)" is
  on. On this device it stayed refused even after it was enabled and the transport was
  reconnected. The Xiaomi and iPhone invitation codes were therefore shown to Kraken in
  the session, to be typed on the device. All codes shown are now redeemed or revoked.
- One iOS device build hung in `actool` while the simulator's asset agent was busy.
  Shutting the simulator down before device builds avoids it.

## 4. Log privacy (G12-04 / AT-10) — PASS

Scanned against the real Gate 12 gateway output (110 lines, 93 requests) and all five
Gate 12 invitation codes:

| Measure | Result |
|---|---|
| Invitation codes, either code half, `ACR45-` pattern | 0 |
| `Bearer`, `inviteCode`, `refreshToken`, `accessToken`, `deviceBinding` | 0 |
| Opaque strings ≥ 32 characters | 0 |
| Keys outside the allow-list | none |
| Un-redacted `requestId` | 0 (8-character prefix only) |
| Scheme of every request | `https` |

## 5. Invitations and sessions (test store `~/.acr-gateway/gate10/`)

| Label | State |
|---|---|
| `gate12-samsung` | redeemed; revoked `LOST` (device lost its session to F1) |
| `gate12-xiaomi` | redeemed; revoked `LOST` (device lost its session to F3) |
| `gate12-samsung-2` | redeemed · **1 live session** |
| `gate12-xiaomi-2` | redeemed · **1 live session** |
| `gate12-iphone13` | redeemed · **1 live session** |

Revocation followed the approved lost-code procedure (G10-0 §10.3). **Kraken's decision:
keep the three live sessions**; each expires 30 days after its own redemption
(≈ 2026-10-12, flat, never sliding). No code file remains on disk.

## 6. Decisions recorded (Kraken, 12 September 2026)

1. **Accessibility (F8, F9):** fix after Gate 12, with other planned updates.
2. **Offline walkthrough (F10):** keep the saved session, as a post-Gate 12 update. An
   invited evaluator showing or practising the app must stay signed in for the fixed
   30-day term.
3. **Translations (F5):** reviewed through on-the-ground field testing; a clinical, not
   a technical, matter.
4. **Test sessions:** keep the three live device sessions (30 days).
5. **Platform (P4):** T1's external interface stays open — the ACR Platform uses it for
   back-office services. The residual platform exposure is tracked in the platform
   record kept outside this public repository.

## 7. T45-11 status update

| Requirement | Status after Gate 12 |
|---|---|
| Rebuilt physical apps | **Done** — iOS and Android, three devices |
| Failure modes | Backend outage, tunnel outage, process restart (Gate 10); **app restart, offline launch, app update (Gate 12)**. DNS / certificate rotation and travel / network change: not tested. A real Mac restart follows this gate |
| Independent security review | **Outstanding** |
| Regional reachability | France only; all others NOT ASSESSABLE |
| Controlled distribution approval | Kraken's separate decision; not granted by any gate |

## 8. Operating notes

**Restarting the review service after a Mac restart** (T1 and T2 are started by Kraken
first). From `gateway/`, the Build 45 gateway (T3) on loopback:

```sh
ACR_GATEWAY_HOST=127.0.0.1 ACR_GATEWAY_PORT=3001 \
ACR_EXPECTED_CLIENT_BUILD_ID=mob-v0.6.5+45 \
ACR_PUBLIC_HOSTNAME=mobile-gateway-review.acragent.com \
ACR_UPSTREAM_INFER_URL=https://api.acragent.com/api/infer \
ACR_EVIDENCE_HEALTH_URL=https://api.acragent.com/api/infer/health \
ACR_EVIDENCE_STATUS_URL=https://api.acragent.com/api/ontolator/status \
ACR_EVIDENCE_MANIFEST_URL=https://api.acragent.com/api/ontolator/manifest \
ACR_EVIDENCE_ONTOLOGY_PATH=/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl \
ACR_UPSTREAM_TIMEOUT_MS=8000 \
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db \
ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
node src/listener.js
```

and the tunnel (T4): `cloudflared tunnel --config ~/.cloudflared/acr-mobile-review.yml run acr-mobile-review`.
Sessions live in the store and on the devices, so the three phones reconnect without
new invitations once the service is back within their 30-day term.

**Issuing an invitation** (the issuer is Kraken; any operator session only runs the tool):

```sh
cd gateway
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
  node src/auth/invite-admin.js issue --label reviewer-01 --issued-by Kraken
```

The code is printed once and never stored in plaintext; it is single-use, must be
redeemed within 7 days, and gives a flat 30-day session. `list`, `sessions` and
`revoke --label X --reason LOST` manage it. Distribution outside the named test devices
needs Kraken's separate authorisation.

**iOS Personal Team builds expire after 7 days** (this build: 2026-09-18 23:15 UTC). To
renew: rebuild the Release app and reinstall over the existing one, which keeps the same
bundle identifier and team:

```sh
xcodebuild -workspace ios/ACRCompanion.xcworkspace -scheme ACRCompanion -configuration Release \
  -destination "generic/platform=iOS" -allowProvisioningUpdates DEVELOPMENT_TEAM=X9QB4QT8NH build
xcrun devicectl device install app --device <device-id> <path-to>/Release-iphoneos/ACRCompanion.app
```

or Xcode → select the iPhone → Product → Run with the Release configuration. A paid
Apple Developer Program membership gives one-year profiles and TestFlight; that is a
distribution decision.

**Android release builds** must force the JS bundle (F6):

```sh
cd android && ./gradlew :app:createBundleReleaseJsAndAssets --rerun assembleRelease
```

---

**END OF GATE 12 EVIDENCE**
