# Build 49 — Review Service and Device Build Runbook

> **Working runbook for v0.6.7 (build 48).** It is Kraken's Build 47 working copy
> (now `docs/archive/build47/BUILD47_REVIEW_SERVICE_RUNBOOK.md`) brought up to date for
> Build 49. What changed since Build 47:
> - The service script is now `scripts/build49-review-service.sh`. The old name prints the new one.
> - The app ID is unchanged, so every phone updates in place and **keeps its pairing**.
> - New in the app: the poster's second page carries the Privacy & Cookies notice, and READ DETAILS opens the reviewer manual on the phone.
> - New on the service: `acr-invite purge` deletes records 30 days after they stop being current, which is what the privacy notice promises (§10).
> - A new demonstration fixture must be captured for `mob-v0.6.7+49`; the Build 48 fixture is not accepted (§9).

**Scope:** starting and stopping the Build 49 remote-review service, issuing invitations, rebuilding the apps for the named test devices, and the demonstration fixture. For the Build 49 device results, see `docs/build48-evidence/`; Build 47 is in `docs/archive/build47/`.

| Tier | What | Who starts it |
|---|---|---|
| T1 | ACR Platform (Spring Boot, `:8080`) | **Kraken**, by hand; never by this runbook's script |
| T2 | `acr-api` Cloudflare tunnel → `api.acragent.com` | **Kraken**, by hand; never by this runbook's script |
| T3 | Build 49 gateway, `127.0.0.1:3001` (loopback only) | `scripts/build49-review-service.sh` |
| T4 | `acr-mobile-review` tunnel → `mobile-gateway-review.acragent.com` | `scripts/build49-review-service.sh` |

**Start order: T1 → T2 → T3 → T4. Stop order: T4 → T3 → T2 → T1.**

The dependency runs one way:
- T1+T2 work without T3+T4.
- T3+T4 need T1+T2 for live assessments and the VERIFIED baseline, but not for invite checks or pairing. The synthetic demo (§9) also works without T1+T2 once its fixture exists, but the gateway's start checks still require them.

---

## 1. Start the review service

Give each service its own terminal and keep it open.

**Terminal 1: T1** (skip if it is already running)

```zsh
lsof -nP -iTCP:8080 -sTCP:LISTEN || true

# if clear, then:

cd /Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface
mvn spring-boot:run -Dspring-boot.run.profiles=hybrid
# once Spring has started, check from another terminal:
curl -fsS http://localhost:8080/api/infer/health | jq .
```

**Terminal 2: T2**, only after T1 is healthy (skip if it is already running)

```zsh
pgrep -lf 'cloudflared.*acr-api' || true

# if clear, then:

cloudflared tunnel run --url http://localhost:8080 acr-api

# once the tunnel (T2) has started, check from another terminal:
curl -fsS https://api.acragent.com/api/infer/health | jq .
```

**Terminal 3: T3 and T4 with one command**

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion
scripts/build49-review-service.sh start
```

The script:
- runs seven checks and should end with `Service is up.`;
- starts T3 (the gateway), then T4 (the review tunnel);
- says whether a synthetic demo fixture for this build was found (§9);
- keeps the Mac awake while the gateway runs;
- never starts or stops T1 or T2.

**Other commands**

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion
scripts/build49-review-service.sh status   # read-only check of T1–T4
scripts/build49-review-service.sh stop     # stops T4, then T3 — do this before closing T1/T2
scripts/acr-services.sh stop               # all four in reverse, asking before it signals T1/T2
```

**When you finish:** first run `scripts/build49-review-service.sh stop`. Then close T2, then T1, each with Ctrl+C.

**Phones.** A phone with a saved session reconnects by itself, with no code, and shows VERIFIED. While the service is down, the app shows **"Signed in on this device"** with a Retry button instead of an empty invite field.
- All three test phones ran Build 47 (16 September 2026) and update in place to Build 49:
  - Samsung `gate47-samsung-2` and Xiaomi `gate47-xiaomi`: sessions valid until 16 October.
  - iPhone `gate12-iphone13`: session valid until 12 October.
- The iPhone app is signed with a 7-day development profile: note the new expiry at each rebuild and rebuild before it (§7).
- A later Android update installs over Build 47 and keeps the session, provided it is signed with the CRIL release key.

The script runs seven checks in order and **stops at the first one that fails**. Nothing after a failed check is started. If a check fails after T3/T4 are already up (steps 5 and 7), it stops them again.

| # | Check | Pass means |
|---|---|---|
| 1 | Prerequisites | gateway code and dependencies, auth store, pepper file at `0600`, tunnel config, ontology file, `cloudflared`, Node 22.5+ with `node:sqlite` |
| 2 | T1 / T2 (read-only) | T1 local health 200 · T2 connector running · T2 public health 200 · the edge allow-list refuses a non-inference platform path (403, header-only request) |
| 3 | Port 3001 | free (no second gateway, no other program) |
| 4 | Start T3 | gateway listening on `127.0.0.1:3001` within 20 s; current build `mob-v0.6.7+49`, still accepting Build 48 sessions (§5, changeover); demo fixture used if present |
| 5 | Local gateway checks | a request shaped as the edge forwards it → 200; a bare local request → 403/421 (the TLS and host backstop) |
| 6 | Start T4 | tunnel connector running |
| 7 | Public checks | HTTPS `/m/v1/live` → 200 within 60 s · **HTTP → 403** (cleartext blocked at the edge, AT-14) · unknown route → 404 |

Expected output (abridged):

```
1. Prerequisites
  PASS  gateway code, auth store, pepper (0600), tunnel config and ontology present
  PASS  Node v22.14.0 with node:sqlite
2. T1 / T2 (read-only)
  PASS  T1 platform local health: 200
  PASS  T2 acr-api connector running
  PASS  T2 public health: 200
  PASS  edge allow-list active: non-inference platform path refused (403)
3. Port 3001
  PASS  port 3001 is free
4. Start T3 gateway (loopback only)
  PASS  synthetic demo fixture: /Users/Kraken/.acr-gateway/fixtures/demo-mob-v0.6.7+49
  PASS  gateway listening on 127.0.0.1:3001 (PID …)
5. Local gateway checks
  PASS  local request as the edge forwards it: 200
  PASS  local request without edge headers refused (421) — TLS / host backstop active
6. Start T4 tunnel (acr-mobile-review)
  PASS  tunnel started (PID …)
7. Public checks
  PASS  public HTTPS /m/v1/live: 200
  PASS  public HTTP refused at the edge: 403
  PASS  unknown route denied by the tunnel ingress: 404
  PASS  Mac kept awake while the gateway runs
Service is up.
```

The first assessment after the platform has been idle may time out once (Gate 12 finding F7). If so, retry.

## 2. Status and stop

```sh
scripts/build49-review-service.sh status   # read-only: T1–T4 and the public endpoint
scripts/build49-review-service.sh stop     # stops T4 first, then T3; never touches T1/T2
```

Stop T3/T4 **before** stopping T1/T2, so no request reaches a half-closed platform.

## 3. Logs

Logs are in `~/.acr-gateway/logs/`: `gateway-<UTC>.log` and `tunnel-<UTC>.log` (directory `0700`).

The gateway log holds allow-listed metadata only: time, route, status, error code, duration, result mode, scheme, and an 8-character request-ID prefix. It never contains an invite code, token, device identifier or clinical value.

## 4. Troubleshooting

| Symptom | Meaning | Action |
|---|---|---|
| `T1 platform local health: 000` | T1 is not running | start T1, re-run `start` |
| `T2 acr-api connector not running` / public health not 200 | T2 is down | start T2, re-run `start` |
| `edge allow-list NOT active` | the Cloudflare rule "Restrict api.acragent.com to required paths" is missing | **do not continue**; restore the rule |
| `a gateway is already running` | T3 is already up | `status`, or `stop` then `start` |
| `node … has no node:sqlite` / `node not found` | wrong Node | `nvm install 22 && nvm use 22` |
| `scripts/build47-review-service.sh was renamed for Build 49` | old script name | use `scripts/build49-review-service.sh` |
| `gateway did not start` and the log says `synthetic fixture directory failed closed verification` | the demo fixture does not match this build or the platform baseline | move the fixture folder aside, `start` again, and re-capture it (§9) |
| public HTTPS `530` after 60 s | the tunnel could not connect | check the tunnel log and internet access; `stop`, then `start` |
| **public HTTP not 403** | cleartext reaches the service (AT-14) | the script has already stopped T3/T4; restore the WAF rule "Block HTTP - mobile gateway" |
| Phone shows **"Incorrect device used"** | this code is paired with another phone, or with this phone's **old** app | issue this phone its own code (§6) |
| Phone shows **"Invite Code Expired. Request a refreshed one."** | 30 days have passed since pairing, or an unused code was not entered within 7 days | issue a new code (§6) |
| Phone shows **"Signed in on this device — waiting for the server"** | it holds a valid session but cannot reach the service | start the service, then tap **Retry check** |
| Phone asks for a code with no message | disconnected (Disconnect access), revoked, or the app was deleted and reinstalled | after Disconnect: re-enter **this phone's own code** (same expiry); otherwise issue a new code (§6) |
| Synthetic demo says the fixture is unavailable | no fixture for this build, or the case was changed | capture one (§9); keep the demonstration values unchanged |

## 5. Manual fallback (the same steps by hand)

Use two Terminal windows; closing a window stops that service.

**Do not start the gateway with an older build as the current build.** A gateway expecting an older build refuses Build 49 phones as the wrong build, and each phone then deletes its saved session and needs a new code.

```sh
# Window A — checks, then T3
curl -s -o /dev/null -w "T1 %{http_code}\n" http://localhost:8080/api/infer/health          # 200
curl -s -o /dev/null -w "T2 %{http_code}\n" https://api.acragent.com/api/infer/health       # 200
lsof -nP -iTCP:3001 -sTCP:LISTEN                                                            # nothing
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
ACR_GATEWAY_HOST=127.0.0.1 ACR_GATEWAY_PORT=3001 \
ACR_EXPECTED_CLIENT_BUILD_ID=mob-v0.6.7+49 \
ACR_PREVIOUS_CLIENT_BUILD_IDS=mob-v0.6.6+47 \
ACR_PUBLIC_HOSTNAME=mobile-gateway-review.acragent.com \
ACR_UPSTREAM_INFER_URL=https://api.acragent.com/api/infer \
ACR_EVIDENCE_HEALTH_URL=https://api.acragent.com/api/infer/health \
ACR_EVIDENCE_STATUS_URL=https://api.acragent.com/api/ontolator/status \
ACR_EVIDENCE_MANIFEST_URL=https://api.acragent.com/api/ontolator/manifest \
ACR_EVIDENCE_ONTOLOGY_PATH=/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl \
ACR_UPSTREAM_TIMEOUT_MS=8000 \
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db \
ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
node src/listener.js                                  # → "ACR gateway listening on 127.0.0.1:3001"
# add  ACR_SYNTHETIC_FIXTURE_DIR="$HOME/.acr-gateway/fixtures/demo-mob-v0.6.7+49"  when that folder exists

# Window B — local check, then T4
curl -s -o /dev/null -w "%{http_code}\n" -H 'Host: mobile-gateway-review.acragent.com' \
  -H 'X-Forwarded-Proto: https' http://127.0.0.1:3001/m/v1/live                          # 200
cloudflared tunnel --config ~/.cloudflared/acr-mobile-review.yml run acr-mobile-review    # "Registered tunnel connection"

# Window C — public checks
curl -s -o /dev/null -w "https %{http_code}\n" https://mobile-gateway-review.acragent.com/m/v1/live   # 200
curl -s -o /dev/null -w "http  %{http_code}\n" http://mobile-gateway-review.acragent.com/m/v1/live    # 403
```

Stop: Ctrl-C in window B (tunnel) first, then window A (gateway).

**Changeover.** `ACR_PREVIOUS_CLIENT_BUILD_IDS=mob-v0.6.6+47` lets a phone still on Build 47 keep its session; it moves to Build 49 when the updated app next refreshes. The app ID is unchanged since Build 47, so **all three phones update in place and keep their pairing**. Once no Build 47 app is in use, set it to `""` in the script.

## 6. Issuing an invitation

The issuer is Kraken; an operator session only runs the tool. The gateway does not need to be running to issue.

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
  node src/auth/invite-admin.js issue --org ZZU --label zzu-001 --issued-by Kraken
```

The code is printed once and never stored in plaintext. What happens next:
1. **Unused codes expire.** A code must be entered within **7 days**.
2. **The first phone to use it is paired with it.** That phone shows the pop-up *"Invite Code accepted and paired with this mobile device and this mobile device only. For 30 days."*
3. **The 30 days count from pairing.**
4. **The same phone can re-enter its own code**, for example after Disconnect access. It signs back in and its expiry does not change. Disconnect asks first: *"You'll need to re-enter the invite code again."*
5. **Any other phone is refused.** It gets *"Incorrect device used. This device is not authorised for this invite code."* A new app ID would count as another phone, but Build 49 keeps the Build 47 app ID, so pairings carry over.
6. **After 30 days the code has expired.** The phone shows *"Invite Code Expired. Request a refreshed one."*

**Managing codes:**
- `list`: every code, with its uses and live devices.
- `sessions`: every paired phone, with label, organisation, build, pairing time (DDMMYY-HHMMSS UTC), expiry and whether it is live.
- `revoke --label <label> --reason LOST`: withdraws a code.

Use one label per invitee. Distribution beyond the named test devices needs Kraken's separate authorisation.

**Changing the 30-day term:**
- The term is set on line 13 of `gateway/src/auth/lifetimes.js` (`SESSION_MS = 30 * 24 * 60 * 60 * 1000`).
- After changing it, run `scripts/build49-review-service.sh stop`, then `start`.
- No app rebuild is needed.
- It applies to phones paired afterwards.

## 7. iOS — rebuild and install (build cache on `/Volumes/AndroidDev`)

A Personal Team build stops launching when its provisioning profile expires, 7 days after the build (step 3 prints the date).

Rebuild and reinstall over the existing app. The team stays the same, so the Keychain session survives.

> **Changed on 18 September 2026.** The bundle identifier is now `com.acragent.companion`, chosen for
> TestFlight, where an identifier is permanent. The first build carrying it installs as a **new app**
> beside the old one: delete `com.anonymous.acr-mobile-companion` from the phone first, and expect the
> session to be gone and a fresh invite code to be needed. See
> [IOS_TESTFLIGHT_PROCEDURE.md](IOS_TESTFLIGHT_PROCEDURE.md).

**Build cache and timings:**
- The cache lives on the external APFS drive; the internal disk has little free space.
- **The first build into a new cache is a full build: about 25–40 minutes on this Mac.**
- Later builds with the cache in place take 1½–6 minutes.
- Keep the drive mounted for every iOS build. If it is unplugged mid-build, only the cache is damaged: delete the `xcode-derived` folder and rebuild.

```sh
# 0. Preconditions
REPO=/Users/Kraken/DAPP/acr-mobile-companion
DD=/Volumes/AndroidDev/xcode-derived/acr-mobile-companion
DEVICE="KY iPhone13"                        # or the Identifier from `xcrun devicectl list devices`
diskutil info /Volumes/AndroidDev | grep 'File System Personality'   # must say APFS
mkdir -p "$DD"
cd "$REPO" && git status --short && git log -1 --oneline            # clean tree, the commit you intend to ship

# 1. Shut down simulators — a busy simulator asset agent can hang the asset compiler
xcrun simctl shutdown all

# 2. Build (Release, signed with the Personal Team, cache on AndroidDev)
xcodebuild -workspace ios/ACRCompanion.xcworkspace -scheme ACRCompanion -configuration Release \
  -destination "generic/platform=iOS" -allowProvisioningUpdates DEVELOPMENT_TEAM=X9QB4QT8NH \
  -derivedDataPath "$DD" build 2>&1 | tee /tmp/acr47-ios-build.log | grep -E '^\*\* BUILD|error:'
#    → ** BUILD SUCCEEDED **

# 3. Verify before installing
APP="$DD/Build/Products/Release-iphoneos/ACRCompanion.app"
echo "version $(plutil -extract CFBundleShortVersionString raw "$APP/Info.plist") / $(plutil -extract CFBundleVersion raw "$APP/Info.plist")"   # 0.6.6 / 47
grep -ac 'mobile-gateway-review.acragent.com' "$APP/main.jsbundle"    # 1  (the one compiled origin)
grep -acE 'http://192\.168' "$APP/main.jsbundle"                      # 0  (no LAN origin)
plutil -extract EXUpdatesEnabled raw "$APP/Expo.plist"                # false (no OTA)
codesign --verify --deep --strict "$APP" && echo "signature OK"
security cms -D -i "$APP/embedded.mobileprovision" | python3 -c \
  'import io,plistlib,sys; p=plistlib.load(io.BytesIO(sys.stdin.buffer.read())); print("profile expires", p["ExpirationDate"], "UTC ·", len(p.get("ProvisionedDevices",[])), "device(s)")'

# 4. Install (iPhone unlocked; cable or the same Wi-Fi network)
xcrun devicectl list devices
xcrun devicectl device install app --device "$DEVICE" "$APP"
xcrun devicectl device process launch --device "$DEVICE" com.acragent.companion
```

**If the launch is refused** with *"…its profile has not been explicitly trusted by the user"*: on the iPhone open **Settings → General → VPN & Device Management → Apple Development → Trust**, then open the app from the home screen.

**Renewing the 7-day profile** (found 16 September 2026):
- Command-line builds renew it only while your Apple ID is signed in to the Xcode app (**Xcode → Settings → Accounts**, team `X9QB4QT8NH`). Without it, `xcodebuild` fails with "No Accounts".
- Xcode keeps reusing a profile that has not yet expired. To renew early, quit Xcode, move the cached profile out of `~/Library/Developer/Xcode/UserData/Provisioning Profiles/` (keep it until the build succeeds), then run step 2. Step 3 then shows the new expiry.
- Never change the bundle identifier or the team: either makes iOS treat the app as a new one, and the phone loses its session.

**The iPhone must be unlocked** for installs and launches: a locked phone refuses the developer disk image ("The device is locked"). On a new iOS version the Mac first downloads its developer components; wait for that to finish.

**Xcode and iOS versions.** Build 47 installed on iOS 27.0 with Xcode 26.3. An iPhone on a newer iOS than the installed Xcode supports may refuse installation or launch from the Mac. If that happens, update Xcode to a version that supports the phone's iOS, then rebuild.

**Xcode alternative:**
1. Open `ios/ACRCompanion.xcworkspace` and select the iPhone.
2. Go to **Product → Scheme → Edit Scheme → Run** and set **Build Configuration: Release**.
3. Choose **Product → Run**.

A paid Apple Developer Program membership gives one-year profiles and TestFlight; that is a distribution decision.

## 8. Android — rebuild and install

The Android SDK is on the same drive (`ANDROID_HOME=/Volumes/AndroidDev/android-sdk`). Two rules:
- **Always force the JS bundle.** The React Native Gradle plugin ignores JSON-only changes and would otherwise ship a stale bundle (Gate 12 finding F6).
- **Release builds need CRIL's release key** in `~/.acr-signing` (see `BUILD47_ANDROID_RELEASE_SIGNING.md`). Without it the build stops; it never signs with the debug key.

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion/android
export ANDROID_HOME=/Volumes/AndroidDev/android-sdk JAVA_HOME=$(/usr/libexec/java_home -v 21)
./gradlew :app:createBundleReleaseJsAndAssets --rerun assembleRelease bundleRelease
BT=$ANDROID_HOME/build-tools/34.0.0
ls -l app/build/outputs/apk/release/*.apk app/build/outputs/bundle/release/*.aab
```

**What the build produces:**

| File | For |
|---|---|
| `app/build/outputs/apk/release/app-arm64-v8a-release.apk` | almost every phone from the last 8 years, including the three test phones |
| `app/build/outputs/apk/release/app-armeabi-v7a-release.apk` | older 32-bit phones |
| `app/build/outputs/apk/release/app-universal-release.apk` | any phone, when unsure which to use (largest) |
| `app/build/outputs/bundle/release/app-release.aab` | Google Play only; it cannot be installed directly |

**Check before installing or sending:**

```sh
APK=app/build/outputs/apk/release/app-arm64-v8a-release.apk
$BT/aapt2 dump badging "$APK" | grep -oE "package: name='[^']+'|versionCode='[0-9]+' versionName='[^']+'"   # com.acragent.companion · 47 / 0.6.6
$BT/apksigner verify --print-certs "$APK" | grep 'SHA-256'     # 65a04dbb…a815fc (CRIL release key)
unzip -p "$APK" assets/index.android.bundle | grep -ac 'mobile-gateway-review.acragent.com'   # 1
```

**Installing on a test phone:**

```sh
ADB=$ANDROID_HOME/platform-tools/adb
$ADB devices -l                                   # phone listed as "device"
$ADB install "$APK"                               # first Build 47 install: a new app
$ADB install -r "$APK"                            # later Build 47+ updates: -r keeps the session
$ADB kill-server                                  # before ejecting the drive
```

The Build 46 app (`com.anonymous.acr_mobile_companion`) is a different app and stays installed until removed. Remove it once the Build 47 app is paired, so there is only one ACR Companion on the phone: `$ADB uninstall com.anonymous.acr_mobile_companion`. Its gateway session can then be revoked (§6).

**Before installing:**
- Keep the phone awake and unlocked. An install to a sleeping Samsung hangs.
- HyperOS (Xiaomi) needs **Install via USB** in Developer options. It also blocks typing a code over the cable, so enter codes on the phone by hand.

**Before ejecting `/Volumes/AndroidDev`:** quit VS Code. Its Java extension keeps files open on the drive.

## 9. Synthetic demonstration fixture (optional)

"Synthetic demo" shows a result recorded earlier from the live platform, for one fixed synthetic case, without running the reasoner. The app loads that case when Synthetic demo is chosen. The gateway replays the result only if **all 20 values are unchanged**, and the Review screen warns if they were changed.

The fixture is tied to the app build ID and to the platform baseline (reasoner version, ontology hash, rule counts). **Capture a new one for every new build**, and after any platform change.

**Capture** (needs T1 and T2 running; synthetic values only):

```sh
F=$HOME/.acr-gateway/fixtures
mkdir -p "$F/requests" && chmod 700 "$F" "$F/requests"
REQ="$F/requests/demo-mob-v0.6.7+49.json"      # the demonstration request (see the Build 48 evidence)
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
ACR_EVIDENCE_HEALTH_URL=https://api.acragent.com/api/infer/health \
ACR_EVIDENCE_STATUS_URL=https://api.acragent.com/api/ontolator/status \
ACR_EVIDENCE_MANIFEST_URL=https://api.acragent.com/api/ontolator/manifest \
ACR_EVIDENCE_ONTOLOGY_PATH=/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl \
node src/capture-tool.js --authorize-synthetic-capture \
  --upstream=https://api.acragent.com/api/infer \
  --request="$REQ" --request-sha256=$(shasum -a 256 "$REQ" | cut -d' ' -f1) \
  --output="$F/demo-mob-v0.6.7+49.candidate"
# → "Synthetic capture candidate written as PENDING_INDEPENDENT_REVIEW."
```

**Review, then approve.** The capture is written as a candidate that the gateway will not replay. Kraken reviews the captured result: subtype, tier 3, risk and treatments. Only after that approval is the manifest changed to `"verificationStatus": "VERIFIED_PLATFORM_CAPTURE"` and `"eligibleForDeliveredReplay": true`, and the folder renamed to `demo-mob-v0.6.7+49`. The next `start` then reports `synthetic demo fixture: …`.

## Additional info re invite code (KY 13SEPT26)

### 1. The script that generates invite codes

```
/Users/Kraken/DAPP/acr-mobile-companion/gateway/src/auth/invite-admin.js
```

Run it from `gateway/` (§6). The same tool also has `list`, `sessions`, `revoke --label X --reason LOST` and `init`. The gateway doesn't need to be running to issue a code.

### 2. Yes, it's a small SQLite database, but the code itself isn't kept in it

```
~/.acr-gateway/gate10/auth.db          owner-only (0600), SQLite in WAL mode
~/.acr-gateway/gate10/auth.db-wal      \ SQLite's write-ahead files: part of the database,
~/.acr-gateway/gate10/auth.db-shm      / keep them together with auth.db
~/.acr-gateway/gate10/pepper.bin       32-byte secret key used in the hashing (0600)
```

The full path is `/Users/Kraken/.acr-gateway/gate10/`. It sits in your home folder rather than the repo, so it survives restarts and is never committed.

**What's stored for an invite.** The plaintext code is printed once, when issued, and never written anywhere.

**Code format.** A new code names the invitee's organisation, for example `ACR-ZZU-XXXXXXXX-YYYYYYYYYYYY`.
- The allowed tags are a fixed list in `gateway/src/auth/organisations.js`: ZZU, UCD, HKU, CRIL, and TEST for internal test phones. `issue` requires `--org`.
- Older codes read `ACR45-XXXXXXXX-YYYYYYYYYYYY` and still work.
- Capitals don't matter, and O, I and L are read as 0, 1 and 1.

After the prefix and tag, a code has two parts:
- **The middle part is a selector,** stored as-is so the gateway can find the right row.
- **The last part is the secret verifier.** Only a scrypt hash of it is stored, salted and combined with `pepper.bin`.

So neither the database alone nor someone reading it can recover a code. That's why a lost code can't be looked up again: the procedure is to revoke it and issue a new one.

**What the database holds:**

| Table | Contents |
|---|---|
| `invitations` | selector, verifier hash, salt, organisation, label, issuer, issue and expiry dates, uses, revocation |
| `sessions` | one row per paired phone: the invite, a hashed device identifier, app build, pairing time, 30-day expiry, revocation |
| `access_tokens` / `refresh_tokens` | hashes of tokens only, with expiry; refresh rotation and replay tracking |
| `rate_limits` | lockout counters, kept across gateway restarts |
| `audit` | non-clinical events: time, event, label |

**Two practical points:**
- **Keep `auth.db` and `pepper.bin` together, and treat `pepper.bin` as a secret.** Without it, no stored hash can be checked. So losing it ends every session and invite, and a copy of it together with the database is what an attacker would need to try guessing codes.
- **The folder is named `gate10`** because it was created as the Gate 10 test store. It holds the test phones' sessions and, by Kraken's decision of 14 September, the organisation-tagged codes for invitees. Starting a separate store is a single `init` command, with the script started as `ACR_AUTH_DIR=<new folder> scripts/build49-review-service.sh start`.
