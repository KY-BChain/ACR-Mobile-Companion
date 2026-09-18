# Build 48 — device evidence

**Version:** v0.6.7 (Build 48) · **Date:** 18 September 2026 · **Branch:** feature/mobile-v0.6.6-build47
**Scope:** what was built, what was installed, what was tested and what remains open. Synthetic data only; no real patient data at any point.

---

## 1. What Build 48 adds

| | |
|---|---|
| Privacy & Cookies notice | Second page of the poster, in all 8 languages, with CRIL as controller, the registered address, contact e-mail, data categories, purpose, recipients, 30-day retention and rights |
| In-app reviewer manual | 17 sections, **each of the 8 languages has its own manual**, generated from `docs/clinical` by `scripts/build-manual-content.js` |
| Reaching it | READ DETAILS on the notice, and About page 2 → "Privacy & Cookies in full", both opening at section 15 |
| Poster behaviour | Poster and notice turn into each other every 6 s until the reader swipes or opens the manual; an upward swipe still continues to Welcome |
| Manual navigation | Close on every page, Back and "Go to section 1" at the top, Next through to 17 |
| Retention promise kept in software | `acr-invite purge` deletes invitations, sessions, tokens, audit and rate-limit rows 30 days after they stop being current; live pairings untouched; dry run unless `--confirm` |
| Wording correction | The retired "Assessment blocked" text removed from all 8 locales; the live stop screen is "Service unavailable" plus the failure code |

## 2. Build identity

| Artefact | Identity | SHA-256 (first 16) |
|---|---|---|
| `app-arm64-v8a-release.apk` | com.acragent.companion 0.6.7 (48) | `ad7252521e32a119` |
| `app-armeabi-v7a-release.apk` | same | `38bf9844be2f134f` |
| `app-universal-release.apk` | same | `aa4105f968992b2e` |
| `app-release.aab` | same | `b23bb0388280d3cb` |
| `ACRCompanion.app` (iOS) | com.anonymous.acr-mobile-companion 0.6.7 / 48 | signed, 1 provisioned device |

- Android signing key: CRIL release key, SHA-256 `65a04dbb…a815fc`, verified on every APK and the AAB.
- iOS provisioning profile renewed during this build: **expires 25 September 2026, 13:09 UTC** (Apple's 7-day maximum for a Personal Team).
- Gateway client identity: `mob-v0.6.7+48`; previous build `mob-v0.6.6+47` accepted for changeover.

## 3. Devices

| Phone | Model | Result | Session |
|---|---|---|---|
| Samsung | SM-G950F | Installed in place over Build 47; tested and passed | `gate47-samsung-2`, now `mob-v0.6.7+48`, valid to 16 Oct |
| Xiaomi | MIX Fold 2 (22061218C) | Installed in place; tested and passed | `gate47-xiaomi`, now `mob-v0.6.7+48`, valid to 16 Oct |
| iPhone 13 | iOS 27.0, Xcode 26.3 | Installed and launched by `devicectl`; tested and passed | `gate12-iphone13`, now `mob-v0.6.7+48`, valid to 12 Oct |

**All three updated in place and kept their pairing** — the app ID is unchanged since Build 47, so no invite code was re-entered. Each was seen refreshing and attesting through the gateway within seconds of launch (`auth/refresh` 200, `attestation` 200).

## 4. Checks

- `npm run verify:mobile` — **35 checks pass**, including the new `tests/legal/verify.js`.
- `npm run typecheck:active` — passes.
- Gateway — **238 tests plus 4 end-to-end, all pass**, including 7 new retention tests.
- Bundle contents verified inside the shipped APK: all 8 manuals present (page 1 and section 15 of each), READ DETAILS, Go to section 1, Privacy & Cookies, CRIL's address.
- iOS app verified before install: one compiled gateway origin, no LAN origin, over-the-air updates disabled, signature valid.

## 5. Service state during testing

| Tier | State |
|---|---|
| T1 Spring Boot :8080 | healthy, 200 |
| T2 `acr-api` tunnel | healthy; edge allow-list refusing non-public platform paths |
| T3 gateway 127.0.0.1:3001 | healthy, started with `scripts/build48-review-service.sh` |
| T4 `acr-mobile-review` tunnel | healthy; HTTPS 200, plain HTTP refused 403 |

Gateway traffic during the session: 47 metadata events — 35 liveness, 6 refresh, 6 attestation. No clinical values are logged.

Retention report (`acr-invite purge`, dry run): nothing yet eligible; the oldest records are inside the 30-day window.

## 6. Incidents during this build

1. **MacBook hang and forced restart.** Cause was most likely Spotlight indexing the external drive during a Gradle build. Full inspection afterwards: no kernel panic, no disk errors, `git fsck` clean, gateway database `integrity_check: ok`, archived Build 47 release passed its checksums. Spotlight indexing is now disabled for `/Volumes/AndroidDev`.
2. **`ios/.xcode.env.local` pointed at a deleted Node version.** Found before it caused a failure; repointed to `/usr/local/bin/node`, which survives nvm changes.
3. **The iOS platform component was missing**, because deleting every simulator runtime during the storage clean-up also removed what Xcode counts as "iOS installed". Device builds failed with "iOS 26.2 is not installed". Recovered with `xcodebuild -downloadPlatform iOS` (about 13 GB, 25 minutes). The two obsolete iOS 18 runtimes were then deleted again; iOS 26.3.1 is kept, and iPhone builds were re-verified afterwards.
4. **`scripts/acr-services.sh` still called the Build 47 service script** after the rename, so T3/T4 did not start on the first attempt. Fixed.
5. **The ACR Platform website lost its backend.** Not a backend fault: the Cloudflare rule listed ontolator paths individually, so `/api/ontolator/languages` and then `/api/ontolator/rules` were blocked, which the browser reported as a CORS error. Kraken changed the rule to a `starts_with(http.request.uri.path, "/api/ontolator/")` prefix. Verified afterwards: all ontolator paths and both inference routes 200 with the correct CORS header; `/api/patients`, `/api/infer/batch` and `/actuator/health` still 403.

## 7. Open items

| Item | Owner | Note |
|---|---|---|
| Synthetic demonstration fixture for `mob-v0.6.7+48` | ZZU and Kraken to approve | Captured 18 Sept 15:33 UTC and held as PENDING_INDEPENDENT_REVIEW outside the repository: LuminalB_HER2Negative, INTERMEDIATE, tier 3, 5 fired rules, confidence 60.02%. Until it is approved, Synthetic demonstration reports it unavailable; live mode is unaffected |
| iOS profile expiry, 25 September | Kraken | Build 49 (still v0.6.7) if the paid Apple Developer account is not live by then |
| Platform hardening items | Kraken | Tracked in the secure operations notes held outside this public repository |
| Legal basis and China (PIPL) notice | Legal reviewer | One line each in the manual's section 15 |
| Sprint G access model | Separate session | Federated learning over DLT; reviewed outside this repository |
| Website-to-app field mapping | Separate session | 12 website tabs against 5 app screens and 20 fields |
