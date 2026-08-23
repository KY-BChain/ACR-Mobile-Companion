# MOB-V0.5-ANDROID-ACCEPTANCE-CHECKPOINT-001

Revision: `1.0`

Status: `KRAKEN-REPORTED DEVICE ACCEPTANCE — IDENTIFIERS TO RECORD`

## Accepted outcome

The ACR Companion Android Release application has been built locally and
installed on physical Android devices without Expo Go, Metro, EAS or Google
Play distribution.

Reported functional scope:

- Home and both About pages;
- Step 1, Step 2, Step 3, P1 and P2;
- Review flow using synthetic/demo values;
- eight languages;
- immediate Arabic RTL and return to LTR;
- standalone launch from the application icon;
- Xiaomi MIX Fold 2 folded and unfolded presentation.

## Source branch

```text
feature/mobile-v0.5-android
```

Record after the final push:

```text
ANDROID_ACCEPTED_SHA:
ORIGIN_SHA:
AHEAD_BEHIND:
WORKING_TREE_CLEAN:
```

Verification commands:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion
git branch --show-current
git rev-parse HEAD
git rev-parse origin/feature/mobile-v0.5-android
git rev-list --left-right --count HEAD...origin/feature/mobile-v0.5-android
git status --short --branch
git status --porcelain=v1 --untracked-files=all
```

## Android project and build storage

Tracked/native Android project:

```text
/Users/Kraken/DAPP/acr-mobile-companion/android
```

Expected Release APK family:

```text
/Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/
```

External development volume:

```text
/Volumes/AndroidDev/
```

Reported external layout:

```text
/Volumes/AndroidDev/android-sdk/   Android SDK, API 26/34 and Build Tools
/Volumes/AndroidDev/.gradle/       Gradle user home, caches and dependencies
```

The project and native Android source remain on the internal disk. The Android
SDK and Gradle user home are external. The external volume must be mounted at
the same path for future builds; an already-installed APK does not need the
external volume to run.

Future Release builds must reuse the accepted signing configuration and exact
Gradle Release task recorded by the implementation evidence. Do not substitute
an Expo development command merely because it can install an app.

## Release artefact identifiers

Locate but do not rebuild:

```zsh
find /Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs \
  -type f \( -name '*.apk' -o -name '*.aab' \) -print
```

For the accepted Release APK, record:

```text
APK_ABSOLUTE_PATH:
APK_FILE_SIZE:
APK_SHA256:
APPLICATION_ID:
VERSION_NAME:
VERSION_CODE:
SIGNING_CERTIFICATE_SHA256:
BUILD_COMMAND:
BUILD_EXIT:
```

Representative checksum command:

```zsh
shasum -a 256 /absolute/path/to/accepted-release.apk
```

Do not record keystore passwords, private keys or full physical-device serials.

## Physical-device acceptance

| Device | Reported outcome | Evidence classification |
| --- | --- | --- |
| Xiaomi MIX Fold 2 / HyperOS 3.0.8.0 | PASS folded and unfolded; five screens, About and eight languages | Kraken-reported physical review |
| Samsung Galaxy S8 | PASS stated in supplied Android completion summary | Kraken-reported; retain exact OS/API from build evidence |

## Disk housekeeping performed

Reported actions:

| Action | Reported result |
| --- | --- |
| Removed Xcode DerivedData | approximately 8 GB reclaimed |
| Cleared npm cache | approximately 1–3 GB reclaimed |
| Cleared CocoaPods cache | approximately 0.5–1 GB reclaimed |
| Android Studio cache cleanup | skipped; none found |
| Internal free space | increased from approximately 16 GB to 26 GB |

These items are regenerable. Future iOS/Node builds may need to rebuild or
download them again. Do not repeat broad deletion automatically.

## Residual operational conditions

- The 64 GB external volume is now part of the Android build environment and
  should be backed up/configured reproducibly.
- Build configuration must not rely on a private key stored in Git.
- No Android emulator is required; the two physical devices are the acceptance
  targets.
- APK distribution to clinical partners requires a separately accepted signing,
  versioning and distribution procedure.
- Mock server/API work, iOS tester distribution and WeChat Mini Program work are
  separate tasks and branches.

## Next authorised task

The next proposed implementation task is the existing ACR mobile mock server
and mobile API interface under `MOB-MOCK-API-INTERFACE-001`, beginning with
canonical-path and contract discovery.
