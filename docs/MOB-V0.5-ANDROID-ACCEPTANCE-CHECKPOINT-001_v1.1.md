# MOB-V0.5-ANDROID-ACCEPTANCE-CHECKPOINT-001

Revision: `1.1`

Date: `2026-08-23`

Status: `ACCEPTED — ANDROID PHYSICAL-DEVICE MILESTONE`

## Accepted Android source checkpoint

```text
BRANCH: feature/mobile-v0.5-android
ANDROID_ACCEPTED_ANCESTOR_SHA: e5fa5e7ff3d1873728c6e5531faf142ef63a503e
ORIGIN_BRANCH_SHA_AT_ACCEPTANCE: e5fa5e7ff3d1873728c6e5531faf142ef63a503e
AHEAD_BEHIND_AT_ACCEPTANCE: 0 0
```

`ANDROID_ACCEPTED_ANCESTOR_SHA` is the exact pushed commit containing the
Android implementation accepted on the physical devices. It is the permanent
source reference even though the branch SHA changes when this checkpoint
document is subsequently committed.

At acceptance verification, there were no uncommitted application changes.
This checkpoint document was the only untracked file.

## Accepted outcome

The ACR Companion Android Release application was built locally, installed and
accepted on physical Android devices. The installed application launches from
its application icon and does not require Expo Go, Metro, EAS or Google Play.

Accepted functional scope:

- Home and both About pages;
- Step 1, Step 2, Step 3, P1 and P2;
- Review flow using synthetic/demo values;
- all eight languages;
- Arabic RTL and return to LTR;
- standalone launch;
- folded and unfolded presentation on the Xiaomi MIX Fold 2.

## Physical-device acceptance

| Device | Acceptance result |
| --- | --- |
| Xiaomi MIX Fold 2 / HyperOS 3.0.8.0 | PASS — folded and unfolded; five assessment screens, both About pages and all eight languages |
| Samsung Galaxy S8 | PASS — physical-device Android acceptance completed |

## Android project and build environment

| Component | Accepted location |
| --- | --- |
| Repository | `/Users/Kraken/DAPP/acr-mobile-companion` |
| Native Android project | `/Users/Kraken/DAPP/acr-mobile-companion/android` |
| Release APK | `/Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/app-release.apk` |
| External Android development volume | `/Volumes/AndroidDev` |
| Android SDK and Build Tools | `/Volumes/AndroidDev/android-sdk` |
| Gradle user home, caches and dependencies | `/Volumes/AndroidDev/.gradle` |

The project and native Android source remain on the MacBook Pro internal disk.
The Android SDK and Gradle caches are on the 64 GB SanDisk volume. The volume
must be mounted at `/Volumes/AndroidDev` for future builds, but is not required
to run an application already installed on a phone.

The Release APK exists at the recorded path. Its file size and SHA-256 were not
captured in the supplied acceptance evidence and are therefore not inferred in
this checkpoint.

## Disk housekeeping completed

| Action | Result |
| --- | --- |
| Xcode DerivedData removed | Approximately 8 GB reclaimed |
| npm cache cleared | Approximately 1–3 GB reclaimed |
| CocoaPods cache cleared | Approximately 0.5–1 GB reclaimed |
| Android Studio cache cleanup | Skipped; no cache found |
| Internal free space | Increased from approximately 16 GB to 26 GB |

## Repository state

All Android implementation changes through
`e5fa5e7ff3d1873728c6e5531faf142ef63a503e` were committed and pushed to
`origin/feature/mobile-v0.5-android`.

This document records the accepted Android milestone. Mock server/API work,
iOS tester distribution and WeChat Mini Program work remain separate tasks.
