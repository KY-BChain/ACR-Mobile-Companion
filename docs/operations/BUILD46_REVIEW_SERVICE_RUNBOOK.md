# Build 46 — Review Service, Invitations and Device Build Runbook

**Scope:** starting and stopping the remote-review service, issuing and managing
invitations (device pairing), and rebuilding the apps for the named test devices.
Supersedes the Build 45 runbook (13 September 2026).

**What changed in Build 46:**
- An invite code pairs with **one device**. The pairing uses a random install
  identifier held in the phone's secure keystore; iOS and Android 10+ do not let
  apps read the IMEI.
- The 30-day term runs from pairing.
- The Welcome screen shows a one-time pop-up on pairing. There are clear messages
  for a wrong device and for an expired code.
- The offline walkthrough is available only on a paired device, and it keeps the
  session.
- Screen readers now announce the attestation state.
- Existing Build 45 sessions carry over (§7).

## 0. The four services and their order

| Tier | What | Who starts it |
|---|---|---|
| T1 | ACR Platform (Spring Boot, `:8080`) | **Kraken**, by hand (below) |
| T2 | `acr-api` Cloudflare tunnel → `api.acragent.com` | **Kraken**, by hand (below) |
| T3 | Build 46 gateway, `127.0.0.1:3001` (loopback only) | `scripts/build46-review-service.sh` |
| T4 | `acr-mobile-review` tunnel → `mobile-gateway-review.acragent.com` | `scripts/build46-review-service.sh` |

**The dependency runs one way.** T1+T2 work without T3+T4; the ACR Platform
back office uses them directly. T3+T4 need T1+T2 for live assessments and for
the VERIFIED baseline. They do **not** need them for invite checks or pairing:
the invitation database is inside T3.

**Start order: T1 → T2 → T3 → T4.** **Stop order: T4 → T3 → T2 → T1.**

T1 and T2 commands come from Kraken's own manual
(`ACR-platform/docs/ACR-SP and tunnel manual operations 01Sept26.md`, §3–4).
**Kraken to confirm these are the current ones.**

```sh
# Terminal 1 — T1 (check first; do not start a second copy)
lsof -nP -iTCP:8080 -sTCP:LISTEN || true
cd /Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface
mvn spring-boot:run -Dspring-boot.run.profiles=hybrid
#   wait for Spring "Started", then from another terminal:
curl -fsS http://localhost:8080/api/infer/health

# Terminal 2 — T2, only after T1 is healthy (check first)
pgrep -lf 'cloudflared.*acr-api' || true
cloudflared tunnel run --url http://localhost:8080 acr-api
curl -fsS https://api.acragent.com/api/infer/health
```

Keep both terminals open. Closing a terminal stops that service.

**Keep the Mac awake** for long unattended sessions, in its own terminal:
`caffeinate -ims`. The script also keeps the Mac awake for as long as the
gateway runs.

## 1. Start T3 + T4 (one command)

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion
scripts/build46-review-service.sh start
```

The script runs seven checks and **stops at the first one that fails**. If a check
fails after T3/T4 are already up (steps 5 and 7), it stops them again.

| # | Check | Pass means |
|---|---|---|
| 1 | Prerequisites | gateway code and dependencies, auth store, pepper at `0600`, tunnel config, ontology, `cloudflared`, Node 22.5+ with `node:sqlite` |
| 2 | T1 / T2 (read-only) | T1 local health 200 · T2 connector running · T2 public health 200 · the edge allow-list refuses a non-inference platform path (403) |
| 3 | Port 3001 | free |
| 4 | Start T3 | gateway listening on `127.0.0.1:3001` within 20 s, current build `mob-v0.6.5+46`, accepting Build 45 sessions (§7) |
| 5 | Local gateway checks | a request shaped as the edge forwards it → 200; a bare local request → 403/421 |
| 6 | Start T4 | tunnel connector running |
| 7 | Public checks | HTTPS `/m/v1/live` → 200 · **HTTP → 403** (cleartext blocked, AT-14) · unknown route → 404 |

It ends with `Service is up.` The script never starts, stops or restarts T1/T2.

## 2. Status and stop

```sh
scripts/build46-review-service.sh status   # read-only: T1–T4 and the public endpoint
scripts/build46-review-service.sh stop     # stops T4, then T3; never touches T1/T2
```

Stop T3/T4 **before** stopping T1/T2.

## 3. Logs

`~/.acr-gateway/logs/gateway-<UTC>.log` and `tunnel-<UTC>.log`, in a `0700`
directory. The gateway log holds allow-listed metadata only: time, route, status,
error code, duration, result mode, scheme, and an 8-character request-ID prefix.
It never contains an invite code, token, device identifier or clinical value.

## 4. Troubleshooting

| Symptom | Meaning | Action |
|---|---|---|
| `T1 platform local health: 000` | T1 is not running | start T1, re-run `start` |
| `T2 … not running` / public health not 200 | T2 is down | start T2, re-run `start` |
| `edge allow-list NOT active` | the Cloudflare rule "Restrict api.acragent.com to required paths" is missing | **do not continue**; restore the rule |
| `a gateway is already running` | T3 is already up | `status`, or `stop` then `start` |
| `node … has no node:sqlite` | wrong Node | `nvm install 22 && nvm use 22` |
| public HTTPS `530` after 60 s | the tunnel could not connect | check the tunnel log; `stop`, then `start` |
| **public HTTP not 403** | cleartext reaches the service (AT-14) | the script has already stopped T3/T4; restore the WAF rule "Block HTTP - mobile gateway" |
| Phone shows **"Incorrect device used"** | this code is paired with another device | issue this device its own code (§6) |
| Phone shows **"Invite Code Expired. Request a refreshed one."** | 30 days have passed since pairing, or an unused code was not entered within 7 days | issue a new code (§6) |
| Phone asks for a code with no message | this phone was disconnected (Disconnect access), or its access was revoked, or the app was deleted and reinstalled | after Disconnect: re-enter **this phone's own code** (same expiry); otherwise issue a new code (§6) |
| "Live Platform offline" while the gateway is connected | T1/T2 down, or the first request after idle timed out (finding F7) | check T1/T2; retry |

## 5. Manual fallback (the same steps by hand)

```sh
# Window A — T3
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
ACR_GATEWAY_HOST=127.0.0.1 ACR_GATEWAY_PORT=3001 \
ACR_EXPECTED_CLIENT_BUILD_ID=mob-v0.6.5+46 \
ACR_PREVIOUS_CLIENT_BUILD_IDS=mob-v0.6.5+45 \
ACR_PUBLIC_HOSTNAME=mobile-gateway-review.acragent.com \
ACR_UPSTREAM_INFER_URL=https://api.acragent.com/api/infer \
ACR_EVIDENCE_HEALTH_URL=https://api.acragent.com/api/infer/health \
ACR_EVIDENCE_STATUS_URL=https://api.acragent.com/api/ontolator/status \
ACR_EVIDENCE_MANIFEST_URL=https://api.acragent.com/api/ontolator/manifest \
ACR_EVIDENCE_ONTOLOGY_PATH=/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl \
ACR_UPSTREAM_TIMEOUT_MS=8000 \
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db \
ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
node src/listener.js                        # → "ACR gateway listening on 127.0.0.1:3001"

# Window B — T4
cloudflared tunnel --config ~/.cloudflared/acr-mobile-review.yml run acr-mobile-review

# Window C — public checks
curl -s -o /dev/null -w "https %{http_code}\n" https://mobile-gateway-review.acragent.com/m/v1/live   # 200
curl -s -o /dev/null -w "http  %{http_code}\n" http://mobile-gateway-review.acragent.com/m/v1/live    # 403
```

Stop: Ctrl-C in window B first, then window A.

## 6. Invitations and device pairing

### How it works

1. **Kraken issues a code.** The code is printed once and never stored in
   plaintext. It must be entered within **7 days**.
2. **The invitee enters it in the app.** The gateway pairs the code with that phone's
   install identifier and records the pairing time.
   - The phone shows the pop-up *"Invite Code accepted and paired with this mobile
     device and this mobile device only. For 30 days."*
   - The pop-up also shows the pairing time and expiry, as DDMMYY-HHMMSS UTC.
3. **For 30 days from pairing the phone stays signed in**, across restarts, app
   updates and offline periods. The offline walkthrough is available.
   - Entering the code again **on the same phone** signs it back in. The expiry
     date does not change.
   - The same code on **any other phone**: *"Incorrect device used. This device is
     not authorised for this invite code."* That phone gets no access.
4. **After 30 days:** *"Invite Code Expired. Request a refreshed one."* Issue a
   new code.

**Disconnect access** asks first: *"You'll need to re-enter the invite code again."*
(Cancel / Disconnect). Disconnecting deletes the saved session on the phone; the
same phone can re-enter **its own code** to sign back in, and its expiry does not
change. The offline walkthrough and Build 46 app updates keep the session.

**Offline:** a phone that is offline judges its access from the expiry date saved
on the phone. If you revoke a code, the phone learns this only the next time it
reaches the gateway. The walkthrough uses only on-device sample data and sends
nothing.

**Deleting and reinstalling the app** creates a new install identifier, so the
phone counts as a new device and needs a new code.

### Issue, list, revoke

The gateway does not need to be running.

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
export ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db
export ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin

node src/auth/invite-admin.js issue --org ZZU --label zzu-001 --issued-by Kraken
node src/auth/invite-admin.js list                   # every code: issued, uses, live devices
node src/auth/invite-admin.js sessions               # every paired device: label, build, paired (DDMMYY-HHMMSS UTC), expiry, live
node src/auth/invite-admin.js revoke --label reviewer-01 --reason LOST
```

Use one label per invitee, for example `reviewer-01`. Deliver each code through a
private channel and do not record it. Distribution beyond the named test devices
needs Kraken's separate authorisation.

### The invitation database

Yes, it is a small SQLite database, but **the invite code itself is never kept in it.**

```
~/.acr-gateway/gate10/auth.db        SQLite, WAL mode, owner-only (0600)
~/.acr-gateway/gate10/auth.db-wal    \ part of the database: keep the three together
~/.acr-gateway/gate10/auth.db-shm    /
~/.acr-gateway/gate10/pepper.bin     32-byte secret key used in hashing (0600)
```

**Code format.** A new code names the invitee's organisation, for example
`ACR-ZZU-XXXXXXXX-YYYYYYYYYYYY`.
- The allowed tags are a fixed list in `gateway/src/auth/organisations.js`: ZZU, UCD,
  HKU, and TEST for internal test phones. To add a partner, add its tag there, then
  restart the gateway. `issue` requires `--org`.
- Older codes read `ACR45-XXXXXXXX-YYYYYYYYYYYY` and still work.
- Capitals don't matter, and O, I and L are read as 0, 1 and 1.
- A tag can't be swapped: a code with the wrong tag is refused like a wrong code.

After the prefix and tag, a code has two parts:
- The middle part is a **selector**, stored as-is so the gateway can find the row.
- The last part is the secret. Only its scrypt hash is stored, salted and keyed
  with `pepper.bin`.

A lost code therefore cannot be looked up. Revoke it and issue a new one.

Each pairing record (table `sessions`) holds three things:
- **(A) the invite:** a link to its row;
- **(B) the device:** a keyed hash of the install identifier, never the identifier itself;
- **(C) the pairing time:** stored as a timestamp; `sessions` prints it as DDMMYY-HHMMSS UTC.

Tokens are stored only as hashes. The `audit` table records events without codes or
tokens.

**Keep `auth.db` and `pepper.bin` together, and treat `pepper.bin` as a secret.**
- Losing `pepper.bin` ends every code and every session.
- A copy of both files is what an attacker would need to try guessing codes.
- Never put either file in the repository or in a shared folder.

The folder is named `gate10` because it began as the Gate 10 test store. It holds
the three Gate 12 phone sessions. For real testers, a separate store keeps test and
review history apart. To set one up:
1. Run `node src/auth/invite-admin.js init` with both variables pointing at a new folder.
2. Start the service with `ACR_AUTH_DIR=<that folder> scripts/build46-review-service.sh start`.

### Changing the 30-day term (or the 7-day rule)

The parameters are in one file:
[gateway/src/auth/lifetimes.js](../../gateway/src/auth/lifetimes.js).

```js
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;            // line 13 — term from pairing (30 days)
const INVITE_ACTIVATION_MS = 7 * 24 * 60 * 60 * 1000;   // line 14 — an unused code must be entered within 7 days
```

- **To change 30 days,** edit the `30` on line 13, then run
  `scripts/build46-review-service.sh stop`, then `start`.
- **No app rebuild is needed.** The pop-up's "For N days" and the expiry date come
  from the gateway.
- A change applies to phones **paired afterwards**. Phones already paired keep the
  expiry they were given.
- Run the gateway tests after any change: `cd gateway && npm test`.

## 7. Build 45 → 46 changeover

The three Gate 12 phones hold Build 45 sessions. The script starts the gateway with
`ACR_PREVIOUS_CLIENT_BUILD_IDS=mob-v0.6.5+45`:
- A phone still on Build 45 keeps working.
- The first time a phone updated to Build 46 refreshes, its session moves to
  Build 46. The expiry is unchanged, and the session can never move back.
- Build 45 can never pair a new device.
- `sessions` shows each device's current build.

When every phone shows `mob-v0.6.5+46`, end the changeover: run
`ACR_PREVIOUS_CLIENT_BUILD_IDS= scripts/build46-review-service.sh start`, or set the
default on the `PREVIOUS_CLIENT_BUILD_IDS` line of the script to `""`.

## 8. iOS — rebuild and install (build cache on `/Volumes/AndroidDev`)

A Personal Team build stops launching **7 days** after it was built. Rebuild and
reinstall over the existing app; the Keychain session is expected to survive.

The build cache lives only on the external APFS drive. The old cache on the
MacBook's internal disk was deleted on 13 September 2026. **The first build into a
new cache is a full build, about 25–40 minutes. Later builds take 1½–3
minutes.** Keep the drive mounted for every iOS build. If it is unplugged
mid-build, delete `xcode-derived` and rebuild.

```sh
# 0. Preconditions
REPO=/Users/Kraken/DAPP/acr-mobile-companion
DD=/Volumes/AndroidDev/xcode-derived/acr-mobile-companion
DEVICE="KY iPhone13"
diskutil info /Volumes/AndroidDev | grep 'File System Personality'   # APFS
mkdir -p "$DD"
cd "$REPO" && git status --short && git log -1 --oneline

# 1. Shut down simulators (a busy simulator asset agent can hang the asset compiler)
xcrun simctl shutdown all

# 2. Build (Release, Personal Team, cache on AndroidDev)
xcodebuild -workspace ios/ACRCompanion.xcworkspace -scheme ACRCompanion -configuration Release \
  -destination "generic/platform=iOS" -allowProvisioningUpdates DEVELOPMENT_TEAM=X9QB4QT8NH \
  -derivedDataPath "$DD" build 2>&1 | tee /tmp/acr46-ios-build.log | grep -E '^\*\* BUILD|error:'

# 3. Verify before installing
APP="$DD/Build/Products/Release-iphoneos/ACRCompanion.app"
echo "version $(plutil -extract CFBundleShortVersionString raw "$APP/Info.plist") / $(plutil -extract CFBundleVersion raw "$APP/Info.plist")"   # 0.6.5 / 46
grep -ac 'mobile-gateway-review.acragent.com' "$APP/main.jsbundle"    # 1
grep -ac 'mob-v0.6.5+46' "$APP/main.jsbundle"                         # 1 or more
grep -acE 'http://192\.168' "$APP/main.jsbundle"                      # 0
plutil -extract EXUpdatesEnabled raw "$APP/Expo.plist"                # false
codesign --verify --deep --strict "$APP" && echo "signature OK"

# 4. Install over the cable (iPhone unlocked; tap Trust if asked)
xcrun devicectl device install app --device "$DEVICE" "$APP"
xcrun devicectl device process launch --device "$DEVICE" com.anonymous.acr-mobile-companion
```

If the launch is refused because the profile is not trusted, go to **Settings →
General → VPN & Device Management → Apple Development → Trust** on the iPhone.

## 9. Android — rebuild and install

The Android SDK is on the same drive. **Always force the JS bundle.** The React
Native Gradle plugin ignores JSON-only changes (Gate 12 finding F6).

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion/android
export ANDROID_HOME=/Volumes/AndroidDev/android-sdk
./gradlew :app:createBundleReleaseJsAndAssets --rerun assembleRelease
APK=app/build/outputs/apk/release/app-release.apk
BT=$ANDROID_HOME/build-tools/34.0.0

$BT/aapt2 dump badging "$APK" | grep -oE "versionCode='[0-9]+' versionName='[^']+'"   # 46 / 0.6.5
$BT/apksigner verify --print-certs "$APK" | grep 'SHA-256'     # fac61745…3b9c (unchanged since Build 44)
unzip -p "$APK" assets/index.android.bundle | grep -ac 'mobile-gateway-review.acragent.com'   # 1
unzip -p "$APK" assets/index.android.bundle | grep -ac 'mob-v0.6.5+46'                        # 1 or more

$ANDROID_HOME/platform-tools/adb devices -l
$ANDROID_HOME/platform-tools/adb install -r "$APK"             # -r keeps the app data (the session)
$ANDROID_HOME/platform-tools/adb kill-server                   # before ejecting the drive
```

HyperOS (Xiaomi) needs **Install via USB** in Developer options. Before ejecting
`/Volumes/AndroidDev`, quit VS Code; its Java extension keeps files open on the drive.
