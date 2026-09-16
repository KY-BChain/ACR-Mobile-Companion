# ACR Companion for Android: release signing key

**Created:** 16 September 2026, for v0.6.6 (build 47)
**Owner:** CRIL (Kraken)

## What it is

From build 47, every Android release of ACR Companion is signed with CRIL's own key, not the development ("debug") key. Android accepts an update only when it is signed with the same key as the installed app. Google Play and the Chinese app stores tie the app to this key as well.

| Item | Value |
|---|---|
| App ID | `com.acragent.companion` |
| Key alias | `acr-companion` |
| Owner name in the certificate | `CN=ACR Companion, O=Cornerstone Research International Limited, L=Dublin, C=IE` |
| Algorithm | RSA 4096-bit, SHA384withRSA |
| Valid | 16 September 2026 to 8 September 2056 |
| **SHA-256 fingerprint** | `65:A0:4D:BB:EE:2B:F1:10:4B:6D:C8:9C:A5:A9:FE:1E:35:6F:45:98:B3:40:E7:29:39:C3:BE:B6:49:A8:15:FC` |

The fingerprint is public: it is what the apps are checked against. The key and its password are secret.

## Where it is

Outside the repository, readable only by the Mac user account:

```
~/.acr-signing/                              folder, 0700
~/.acr-signing/acr-companion-release.p12     the key store (PKCS#12), 0600
~/.acr-signing/release-signing.properties    its location, alias and password, 0600
```

The Android build reads `release-signing.properties`. To keep it elsewhere, set `ACR_RELEASE_SIGNING_PROPERTIES` to its full path. **If the file is missing, a release build stops with an error. It never falls back to the debug key.**

Nothing about the key is committed. The repository holds only this record and the build settings.

## Back it up now

**If the key is lost, the app can never be updated in place.** Every user would have to uninstall, lose their session and install a new app. Google Play and the Chinese stores would treat it as a different app.

1. Copy the **whole `~/.acr-signing` folder** to two places that are not this Mac, for example an encrypted USB drive kept at the office and a password manager that stores files.
2. Keep the two files together: the key store is useless without the password in the properties file.
3. Check the copy: `keytool -list -keystore <copy>/acr-companion-release.p12` asks for the password and should list the alias `acr-companion`.
4. Do not email it, put it in a shared drive, or commit it.

## Checking an APK

```sh
BT=/Volumes/AndroidDev/android-sdk/build-tools/34.0.0
$BT/apksigner verify --print-certs <file.apk> | grep 'SHA-256'
# must print 65a04dbbee2bf1104b6dc89ca5a9fe1e356f4598b340e72939c3beb649a815fc
```

A build signed with the old debug key prints `fac61745…3b9c`. Such an APK must never be distributed.

## Google Play, later

When the app is registered on Google Play, enrol in **Play App Signing** and upload the app bundle (`.aab`) signed with this key. Play then keeps its own distribution key, and this key becomes the "upload key". If it is ever lost after enrolment, Google can reset the upload key; the Chinese stores have no such arrangement, so the backup above still matters.
