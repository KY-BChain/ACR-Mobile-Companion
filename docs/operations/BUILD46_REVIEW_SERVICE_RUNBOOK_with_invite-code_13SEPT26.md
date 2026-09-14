# Build 46 — Review Service and Device Build Runbook (Kraken's working copy)

> **Working runbook for Build 46.** Revised on 14 September 2026 (option b). This is
> Kraken's copy: the Build 45 runbook plus the invite-code notes, brought up to date for
> Build 46. `BUILD46_REVIEW_SERVICE_RUNBOOK.md` covers the same procedures. The Build 45
> version is kept unchanged as `BUILD45_REVIEW_SERVICE_RUNBOOK_with_invite-code_13SEPT26.md`.

**Scope:** starting and stopping the Build 46 remote-review service, issuing invitations,
and rebuilding the apps for the named test devices. For the Build 46 device results, see
`docs/build46-evidence/BUILD46_DEVICE_EVIDENCE_20260913.md`. For Gate 12, see
`docs/build45-evidence/gate12/GATE12_DEVICE_EVIDENCE_20260912.md`.

| Tier | What | Who starts it |
|---|---|---|
| T1 | ACR Platform (Spring Boot, `:8080`) | **Kraken**, by hand; never by this runbook's script |
| T2 | `acr-api` Cloudflare tunnel → `api.acragent.com` | **Kraken**, by hand; never by this runbook's script |
| T3 | Build 46 gateway, `127.0.0.1:3001` (loopback only) | `scripts/build46-review-service.sh` |
| T4 | `acr-mobile-review` tunnel → `mobile-gateway-review.acragent.com` | `scripts/build46-review-service.sh` |

**Start order: T1 → T2 → T3 → T4. Stop order: T4 → T3 → T2 → T1.**

The dependency runs one way:
- T1+T2 work without T3+T4.
- T3+T4 need T1+T2 for live assessments and the VERIFIED baseline, but not for invite
  checks or pairing.

---

## 1. Start the review service

Step by step (Build 46 runbook §0–1). Give each service its own terminal and keep it open.

**Terminal 1: T1** (skip if it is already running)

```zsh
lsof -nP -iTCP:8080 -sTCP:LISTEN || true
cd /Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface
mvn spring-boot:run -Dspring-boot.run.profiles=hybrid
# once Spring has started, from another terminal:
curl -fsS http://localhost:8080/api/infer/health | jq .
```

**Terminal 2: T2**, only after T1 is healthy (skip if it is already running)

```zsh
pgrep -lf 'cloudflared.*acr-api' || true
cloudflared tunnel run --url http://localhost:8080 acr-api
curl -fsS https://api.acragent.com/api/infer/health | jq .
```

**Terminal 3: T3 and T4 with one command**

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion
scripts/build46-review-service.sh start
```

The script:
- runs seven checks and should end with `Service is up.`;
- starts T3 (the gateway), then T4 (the review tunnel);
- keeps the Mac awake while the gateway runs;
- never starts or stops T1 or T2.

**Other commands**

```zsh
scripts/build46-review-service.sh status   # read-only check of T1–T4
scripts/build46-review-service.sh stop     # stops T4, then T3 — do this before closing T1/T2
```

**When you finish:** first run `scripts/build46-review-service.sh stop`. Then close T2,
then T1, each with Ctrl+C.

**Phones.** The three phones reconnect by themselves with no code and show VERIFIED.
- Samsung and Xiaomi: sessions valid until 13 October.
- iPhone: session valid until 12 October.
- The iPhone build stops launching after **18 September, 23:15 UTC**. Rebuild it
  before then (§7).

The script runs seven checks in order and **stops at the first one that fails**. Nothing
after a failed check is started. If a check fails after T3/T4 are already up (steps 5
and 7), it stops them again.

| # | Check | Pass means |
|---|---|---|
| 1 | Prerequisites | gateway code and dependencies, auth store, pepper file at `0600`, tunnel config, ontology file, `cloudflared`, Node 22.5+ with `node:sqlite` |
| 2 | T1 / T2 (read-only) | T1 local health 200 · T2 connector running · T2 public health 200 · the edge allow-list refuses a non-inference platform path (403, header-only request) |
| 3 | Port 3001 | free (no second gateway, no other program) |
| 4 | Start T3 | gateway listening on `127.0.0.1:3001` within 20 s; current build `mob-v0.6.5+46`, still accepting Build 45 sessions (§5, changeover) |
| 5 | Local gateway checks | a request shaped as the edge forwards it → 200; a bare local request → 403/421 (the TLS and host backstop) |
| 6 | Start T4 | tunnel connector running |
| 7 | Public checks | HTTPS `/m/v1/live` → 200 within 60 s · **HTTP → 403** (cleartext blocked at the edge, AT-14) · unknown route → 404 |

On success it also keeps the Mac awake for as long as the gateway runs (`caffeinate -w`),
and prints `Service is up.`

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

The first assessment after the platform has been idle may time out once (Gate 12 finding
F7). If so, retry.

## 2. Status and stop

```sh
scripts/build46-review-service.sh status   # read-only: T1–T4 and the public endpoint
scripts/build46-review-service.sh stop     # stops T4 first, then T3; never touches T1/T2
```

Stop T3/T4 **before** stopping T1/T2, so no request reaches a half-closed platform.

## 3. Logs

Logs are in `~/.acr-gateway/logs/`: `gateway-<UTC>.log` and `tunnel-<UTC>.log`
(directory `0700`).

The gateway log holds allow-listed metadata only: time, route, status, error code,
duration, result mode, scheme, and an 8-character request-ID prefix. It never contains an
invite code, token, device identifier or clinical value.

## 4. Troubleshooting

| Symptom | Meaning | Action |
|---|---|---|
| `T1 platform local health: 000` | T1 is not running | start T1, re-run `start` |
| `T2 acr-api connector not running` / public health not 200 | T2 is down | start T2, re-run `start` |
| `edge allow-list NOT active` | the Cloudflare rule "Restrict api.acragent.com to required paths" is missing | **do not continue**; restore the rule |
| `a gateway is already running` | T3 is already up | `status`, or `stop` then `start` |
| `node … has no node:sqlite` / `node not found` | wrong Node | `nvm install 22 && nvm use 22` |
| `zsh: no such file or directory: scripts/build45-review-service.sh` | old script name | use `scripts/build46-review-service.sh` |
| public HTTPS `530` after 60 s | the tunnel could not connect | check the tunnel log and internet access; `stop`, then `start` |
| **public HTTP not 403** | cleartext reaches the service (AT-14) | the script has already stopped T3/T4; restore the WAF rule "Block HTTP - mobile gateway" |
| Phone shows **"Incorrect device used"** | this code is paired with another phone | issue this phone its own code (§6) |
| Phone shows **"Invite Code Expired. Request a refreshed one."** | 30 days have passed since pairing, or an unused code was not entered within 7 days | issue a new code (§6) |
| Phone asks for a code with no message | this phone was disconnected (Disconnect access), its access was revoked, or the app was deleted and reinstalled | after Disconnect: re-enter **this phone's own code** (same expiry); otherwise issue a new code (§6) |

## 5. Manual fallback (the same steps by hand)

Use two Terminal windows; closing a window stops that service.

**Do not start the gateway with `mob-v0.6.5+45` as the current build.** All three phones
now run Build 46. A gateway expecting Build 45 would refuse them as the wrong build, and
each phone would then delete its saved session and need a new code.

```sh
# Window A — checks, then T3
curl -s -o /dev/null -w "T1 %{http_code}\n" http://localhost:8080/api/infer/health          # 200
curl -s -o /dev/null -w "T2 %{http_code}\n" https://api.acragent.com/api/infer/health       # 200
lsof -nP -iTCP:3001 -sTCP:LISTEN                                                            # nothing
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
node src/listener.js                                  # → "ACR gateway listening on 127.0.0.1:3001"

# Window B — local check, then T4
curl -s -o /dev/null -w "%{http_code}\n" -H 'Host: mobile-gateway-review.acragent.com' \
  -H 'X-Forwarded-Proto: https' http://127.0.0.1:3001/m/v1/live                          # 200
cloudflared tunnel --config ~/.cloudflared/acr-mobile-review.yml run acr-mobile-review    # "Registered tunnel connection"

# Window C — public checks
curl -s -o /dev/null -w "https %{http_code}\n" https://mobile-gateway-review.acragent.com/m/v1/live   # 200
curl -s -o /dev/null -w "http  %{http_code}\n" http://mobile-gateway-review.acragent.com/m/v1/live    # 403
```

Stop: Ctrl-C in window B (tunnel) first, then window A (gateway).

**Changeover.** `ACR_PREVIOUS_CLIENT_BUILD_IDS=mob-v0.6.5+45` lets a phone still on
Build 45 keep its session. It moves to Build 46 when that phone's updated app next
refreshes. No phone is on Build 45 any more, so this can be left out, or set to `""`
in the script.

## 6. Issuing an invitation

The issuer is Kraken; an operator session only runs the tool. The gateway does not need
to be running to issue.

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
  node src/auth/invite-admin.js issue --label reviewer-01 --issued-by Kraken
```

The code is printed once and never stored in plaintext. What happens next:
1. **Unused codes expire.** A code must be entered within **7 days**.
2. **The first phone to use it is paired with it.** That phone shows the pop-up
   *"Invite Code accepted and paired with this mobile device and this mobile device only.
   For 30 days."*
3. **The 30 days count from pairing.**
4. **The same phone can re-enter its own code**, for example after Disconnect access. It
   signs back in and its expiry does not change. Disconnect asks first: *"You'll need to
   re-enter the invite code again."*
5. **Any other phone is refused.** It gets *"Incorrect device used. This device is not
   authorised for this invite code."*
6. **After 30 days the code has expired.** The phone shows *"Invite Code Expired. Request
   a refreshed one."*

**Managing codes:**
- `list`: every code, with its uses and live devices.
- `sessions`: every paired phone, with label, build, pairing time (DDMMYY-HHMMSS UTC),
  expiry and whether it is live.
- `revoke --label <label> --reason LOST`: withdraws a code.

Use one label per invitee. Distribution beyond the named test devices needs Kraken's
separate authorisation.

**Changing the 30-day term:**
- The term is set on line 13 of `gateway/src/auth/lifetimes.js`
  (`SESSION_MS = 30 * 24 * 60 * 60 * 1000`).
- After changing it, run `scripts/build46-review-service.sh stop`, then `start`.
- No app rebuild is needed.
- It applies to phones paired afterwards.

## 7. iOS — rebuild and install (build cache on `/Volumes/AndroidDev`)

A Personal Team build stops launching when its provisioning profile expires. For the
current build that is **18 September 2026, 23:15 UTC** (step 3 prints the date).

Rebuild and reinstall over the existing app. The bundle identifier and team stay the
same, so the Keychain session survives. This was proven on the iPhone 13 on
13 September 2026, when Build 46 went over Build 45 and the phone signed in without a
code.

**Build cache and timings:**
- The cache lives on the external APFS drive; the internal disk has little free space.
- **The first build into a new cache is a full build: about 25–40 minutes on this Mac.**
- Later builds with the cache in place took 1½–6 minutes (5½ minutes on 13 September).
- Keep the drive mounted for every iOS build. If it is unplugged mid-build, only the
  cache is damaged: delete the `xcode-derived` folder and rebuild.

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
  -derivedDataPath "$DD" build 2>&1 | tee /tmp/acr46-ios-build.log | grep -E '^\*\* BUILD|error:'
#    → ** BUILD SUCCEEDED **

# 3. Verify before installing
APP="$DD/Build/Products/Release-iphoneos/ACRCompanion.app"
echo "version $(plutil -extract CFBundleShortVersionString raw "$APP/Info.plist") / $(plutil -extract CFBundleVersion raw "$APP/Info.plist")"   # 0.6.5 / 46
grep -ac 'mobile-gateway-review.acragent.com' "$APP/main.jsbundle"    # 1  (the one compiled origin)
grep -acE 'http://192\.168' "$APP/main.jsbundle"                      # 0  (no LAN origin)
plutil -extract EXUpdatesEnabled raw "$APP/Expo.plist"                # false (no OTA)
codesign --verify --deep --strict "$APP" && echo "signature OK"
security cms -D -i "$APP/embedded.mobileprovision" | python3 -c \
  'import io,plistlib,sys; p=plistlib.load(io.BytesIO(sys.stdin.buffer.read())); print("profile expires", p["ExpirationDate"], "UTC ·", len(p.get("ProvisionedDevices",[])), "device(s)")'

# 4. Install over the cable (iPhone unlocked; tap Trust if asked)
xcrun devicectl list devices
xcrun devicectl device install app --device "$DEVICE" "$APP"
xcrun devicectl device process launch --device "$DEVICE" com.anonymous.acr-mobile-companion
```

**If the launch is refused** with *"…its profile has not been explicitly trusted by the
user"*: on the iPhone open **Settings → General → VPN & Device Management → Apple
Development → Trust**, then open the app from the home screen.

**Xcode alternative:**
1. Open `ios/ACRCompanion.xcworkspace` and select the iPhone.
2. Go to **Product → Scheme → Edit Scheme → Run** and set **Build Configuration:
   Release**.
3. Choose **Product → Run**.

A paid Apple Developer Program membership gives one-year profiles and TestFlight; that is
a distribution decision.

## 8. Android — rebuild and install

The Android SDK is on the same drive (`ANDROID_HOME=/Volumes/AndroidDev/android-sdk`).
**Always force the JS bundle.** The React Native Gradle plugin ignores JSON-only changes
and would otherwise ship a stale bundle (Gate 12 finding F6).

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion/android
export ANDROID_HOME=/Volumes/AndroidDev/android-sdk
./gradlew :app:createBundleReleaseJsAndAssets --rerun assembleRelease
APK=app/build/outputs/apk/release/app-release.apk
BT=$ANDROID_HOME/build-tools/34.0.0

$BT/aapt2 dump badging "$APK" | grep -oE "versionCode='[0-9]+' versionName='[^']+'"   # 46 / 0.6.5
$BT/apksigner verify --print-certs "$APK" | grep 'SHA-256'     # fac61745…3b9c (unchanged since Build 44)
unzip -p "$APK" assets/index.android.bundle | grep -ac 'mobile-gateway-review.acragent.com'   # 1

$ANDROID_HOME/platform-tools/adb devices -l                    # phone listed as "device"
$ANDROID_HOME/platform-tools/adb install -r "$APK"             # -r keeps the app data (the session)
$ANDROID_HOME/platform-tools/adb kill-server                   # before ejecting the drive
```

**Before installing:**
- Keep the phone awake and unlocked. An install to a sleeping Samsung hangs.
- HyperOS (Xiaomi) needs **Install via USB** in Developer options. It also blocks typing a
  code over the cable, so enter codes on the phone by hand.

**Before ejecting `/Volumes/AndroidDev`:** quit VS Code. Its Java extension keeps files
open on the drive.

## Additional info re invite code (KY 13SEPT26)

### 1. The script that generates invite codes

```
/Users/Kraken/DAPP/acr-mobile-companion/gateway/src/auth/invite-admin.js
```

Run it from `gateway/` (§6):

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
  node src/auth/invite-admin.js issue --label reviewer-01 --issued-by Kraken
```

The same tool also has `list`, `sessions`, `revoke --label X --reason LOST` and `init`.
The gateway doesn't need to be running to issue a code.

### 2. Yes, it's a small SQLite database, but the code itself isn't kept in it

```
~/.acr-gateway/gate10/auth.db          owner-only (0600), SQLite in WAL mode
~/.acr-gateway/gate10/auth.db-wal      \ SQLite's write-ahead files: part of the database,
~/.acr-gateway/gate10/auth.db-shm      / keep them together with auth.db
~/.acr-gateway/gate10/pepper.bin       32-byte secret key used in the hashing (0600)
```

The full path is `/Users/Kraken/.acr-gateway/gate10/`. It sits in your home folder rather
than the repo, so it survives restarts and is never committed.

**What's stored for an invite.** The plaintext code is printed once, when issued, and
never written anywhere. A code such as `ACR45-XXXXXXXX-YYYYYYYYYYYY` has two parts:
- **The middle part is a selector,** stored as-is so the gateway can find the right row.
- **The last part is the secret verifier.** Only a scrypt hash of it is stored, salted and
  combined with `pepper.bin`.

So neither the database alone nor someone reading it can recover a code. That's why a
lost code can't be looked up again: the procedure is to revoke it and issue a new one.

**What the database holds:**

| Table | Contents |
|---|---|
| `invitations` | selector, verifier hash, salt, label, issuer, issue and expiry dates, uses, revocation |
| `sessions` | one row per paired phone: the invite, a hashed device identifier, app build, pairing time, 30-day expiry, revocation |
| `access_tokens` / `refresh_tokens` | hashes of tokens only, with expiry; refresh rotation and replay tracking |
| `rate_limits` | lockout counters, kept across gateway restarts |
| `audit` | non-clinical events: time, event, label |

**Two practical points:**
- **Keep `auth.db` and `pepper.bin` together, and treat `pepper.bin` as a secret.**
  Without it, no stored hash can be checked. So losing it ends every session and invite,
  and a copy of it together with the database is what an attacker would need to try
  guessing codes.
- **The folder is named `gate10`** because it was created as the Gate 10 test store. It
  now holds the three live phone sessions: `gate46-samsung`, `gate46-xiaomi` and
  `gate12-iphone13`. If you later give real testers access, a separate store would keep
  test and review history apart. Starting one is a single `init` command, with the script
  started as `ACR_AUTH_DIR=<new folder> scripts/build46-review-service.sh start`.
