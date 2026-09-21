#!/usr/bin/env zsh
# Build, verify and upload the iOS TestFlight build of ACR Companion.
#
#   scripts/ios-testflight.sh preflight   checks only — changes nothing
#   scripts/ios-testflight.sh archive     preflight, then archive and export the .ipa
#   scripts/ios-testflight.sh upload      validate and upload the exported .ipa
#   scripts/ios-testflight.sh             preflight → archive → export → validate → upload
#
# Nothing is uploaded unless every check passes. The build identity comes from
# app.json; the gateway only accepts mob-v<version>+<build>, so the version and
# build number in the archive must match it exactly.
#
# App Store Connect credentials are never stored in this repository. The script
# reads them from ~/.acr-signing/appstore-connect.env, which must define
# ASC_KEY_ID and ASC_ISSUER_ID and sit beside AuthKey_<ASC_KEY_ID>.p8.
set -uo pipefail

REPO_DIR="${0:A:h:h}"
IOS_DIR="$REPO_DIR/ios"
VOLUME="/Volumes/AndroidDev"
DERIVED="$VOLUME/xcode-derived/acr-mobile-companion"
ARCHIVE_ROOT="$VOLUME/acr-ios-archives"
SIGNING_DIR="$HOME/.acr-signing"
ASC_ENV="$SIGNING_DIR/appstore-connect.env"
TEAM_ID="X9QB4QT8NH"
GATEWAY_ORIGIN="https://mobile-gateway-review.acragent.com"
STAGE="${1:-all}"

ok()   { print -P "%F{green}✔%f $*"; }
note() { print -P "%F{cyan}•%f $*"; }
warn() { print -P "%F{yellow}!%f $*"; }
fail() { print -P "%F{red}✘ $*%f"; print -P "%F{red}Stopped. Nothing was uploaded.%f"; exit 1; }

# ── Identity, taken from app.json and checked against the Xcode project ──────
VERSION=$(node -p "require('$REPO_DIR/app.json').expo.version") || fail "cannot read app.json"
BUILD=$(node -p "require('$REPO_DIR/app.json').expo.ios.buildNumber") || fail "cannot read app.json"
BUNDLE_ID=$(node -p "require('$REPO_DIR/app.json').expo.ios.bundleIdentifier") || fail "cannot read app.json"
CLIENT_ID="mob-v${VERSION}+${BUILD}"
ARCHIVE="$ARCHIVE_ROOT/ACRCompanion-v${VERSION}-build${BUILD}.xcarchive"
EXPORT_DIR="$ARCHIVE_ROOT/export-v${VERSION}-build${BUILD}"
IPA="$EXPORT_DIR/ACRCompanion.ipa"

print -P "%BACR Companion iOS → TestFlight%b  $VERSION ($BUILD) · $BUNDLE_ID · $CLIENT_ID\n"

preflight() {
  # The drive only has to be there when the build actually runs, so that the
  # checks below can be read through at any time.
  [[ -d "$VOLUME" ]] && ok "$VOLUME mounted" || warn "$VOLUME is not mounted — plug it in before archiving"

  # The Expo placeholder identifier must never reach App Store Connect: the
  # identifier is permanent once a build is uploaded and cannot be reused.
  [[ "$BUNDLE_ID" == *anonymous* ]] && fail "bundle identifier is still the Expo placeholder ($BUNDLE_ID) — set a real one in app.json and the Xcode project first"
  ok "bundle identifier $BUNDLE_ID"

  local pbx="$IOS_DIR/ACRCompanion.xcodeproj/project.pbxproj"
  # Xcode rewrites this file and quotes the identifier only when it must, so
  # accept both "com.acragent.companion" and com.acragent.companion.
  grep -qE "PRODUCT_BUNDLE_IDENTIFIER = \"?${BUNDLE_ID//./\\.}\"?;" "$pbx" || fail "the Xcode project does not carry $BUNDLE_ID — app.json and project.pbxproj disagree"
  grep -q "MARKETING_VERSION = $VERSION;" "$pbx" || fail "the Xcode project is not marketing version $VERSION"
  grep -q "CURRENT_PROJECT_VERSION = $BUILD;" "$pbx" || fail "the Xcode project is not build $BUILD"
  grep -q "DEVELOPMENT_TEAM = $TEAM_ID;" "$pbx" || fail "the Xcode project is not signed by team $TEAM_ID"
  ok "Xcode project agrees with app.json, team $TEAM_ID"

  # A paid membership is what makes a distribution certificate possible.
  local identities=$(security find-identity -v -p codesigning 2>/dev/null)
  [[ "$identities" == *"Apple Distribution"* ]] \
    || fail "no Apple Distribution certificate in the keychain — open Xcode ▸ Settings ▸ Accounts ▸ Manage Certificates and add one, or run Product ▸ Archive once"
  ok "Apple Distribution certificate present"

  [[ -f "$ASC_ENV" ]] || fail "missing $ASC_ENV — see A6 in docs/operations/IOS_TESTFLIGHT_APPLE_ACCOUNT_STEPS.md"
  source "$ASC_ENV"
  [[ -n "${ASC_KEY_ID:-}" && -n "${ASC_ISSUER_ID:-}" ]] || fail "$ASC_ENV must define ASC_KEY_ID and ASC_ISSUER_ID"
  local p8="$SIGNING_DIR/AuthKey_${ASC_KEY_ID}.p8"
  [[ -f "$p8" ]] || fail "missing $p8 — the .p8 can only be downloaded once, at the moment the key is created"
  [[ "$(stat -f '%OLp' "$p8")" == "600" ]] || fail "$p8 must be mode 600"
  ok "App Store Connect API key $ASC_KEY_ID readable, issuer set"

  # The app must be built against the review gateway only, with no local origin
  # and no over-the-air updates, exactly as for a device build.
  grep -rq "$GATEWAY_ORIGIN" "$REPO_DIR/src" || fail "the review gateway origin is missing from src/"
  grep -rqE "http://(192\.168|10\.|localhost|127\.0\.0\.1)" "$REPO_DIR/src" && fail "a local/LAN origin is compiled into the app"
  ok "one gateway origin, no LAN origin"

  local plist="$IOS_DIR/ACRCompanion/Info.plist"
  [[ "$(/usr/libexec/PlistBuddy -c "Print :ITSAppUsesNonExemptEncryption" "$plist" 2>/dev/null)" == false ]] \
    || fail "Info.plist must declare ITSAppUsesNonExemptEncryption = false, or every upload will stall on the export-compliance question"
  [[ -f "$IOS_DIR/ACRCompanion/PrivacyInfo.xcprivacy" ]] || fail "the privacy manifest PrivacyInfo.xcprivacy is missing"
  ok "export compliance declared, privacy manifest present"

  [[ -f "$IOS_DIR/ExportOptions.plist" ]] || fail "ios/ExportOptions.plist is missing"
  [[ "$(/usr/libexec/PlistBuddy -c "Print :manageAppVersionAndBuildNumber" "$IOS_DIR/ExportOptions.plist" 2>/dev/null)" == false ]] \
    || fail "ExportOptions.plist must keep manageAppVersionAndBuildNumber = false, or Xcode will renumber the build and the gateway will reject it"
  ok "export options will not renumber the build"

  # The testers' backend is the review tunnel; it has to be answering.
  # The gateway's liveness route is /m/v1/live; /health is not a route and
  # answers 404 even when it is perfectly healthy.
  local code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$GATEWAY_ORIGIN/m/v1/live" 2>/dev/null)
  if [[ "$code" == "200" ]]; then ok "gateway reachable at $GATEWAY_ORIGIN (200)"
  else warn "gateway answered $code — T3 and T4 must be running before any tester, or Apple's reviewer, opens the app"; fi
}

do_archive() {
  preflight
  [[ -d "$VOLUME" ]] || fail "$VOLUME is not mounted — the Xcode build products live there"
  print ""
  note "archiving — this takes several minutes"
  mkdir -p "$ARCHIVE_ROOT" || fail "cannot create $ARCHIVE_ROOT"
  rm -rf "$ARCHIVE" "$EXPORT_DIR"
  # The identity is left to Xcode. Automatic signing already chooses a
  # distribution certificate for an archive and a development one for a device
  # run; forcing CODE_SIGN_IDENTITY on the command line is treated as manual
  # signing and Xcode refuses the build outright ("conflicting provisioning
  # settings"). The exported app is checked for Apple Distribution afterwards,
  # so a wrong choice still cannot reach Apple.
  xcodebuild -workspace "$IOS_DIR/ACRCompanion.xcworkspace" \
    -scheme ACRCompanion -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE" \
    -derivedDataPath "$DERIVED" \
    -allowProvisioningUpdates \
    archive || fail "xcodebuild archive failed"
  ok "archived → $ARCHIVE"

  note "exporting the .ipa"
  xcodebuild -exportArchive -archivePath "$ARCHIVE" \
    -exportOptionsPlist "$IOS_DIR/ExportOptions.plist" \
    -exportPath "$EXPORT_DIR" \
    -allowProvisioningUpdates || fail "xcodebuild -exportArchive failed"
  [[ -f "$IPA" ]] || IPA=$(ls "$EXPORT_DIR"/*.ipa(N) | head -1)
  [[ -n "$IPA" && -f "$IPA" ]] || fail "no .ipa was produced"
  ok "exported → $IPA ($(du -h "$IPA" | cut -f1))"
  verify_ipa
}

verify_ipa() {
  print ""
  note "verifying the exported app before it leaves this machine"
  local work=$(mktemp -d)
  unzip -qq "$IPA" -d "$work" || fail "cannot read $IPA"
  local app=$(ls -d "$work"/Payload/*.app(N) | head -1)
  [[ -n "$app" ]] || fail "no .app inside the .ipa"

  local got_id=$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$app/Info.plist")
  local got_ver=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$app/Info.plist")
  local got_build=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$app/Info.plist")
  [[ "$got_id" == "$BUNDLE_ID" ]] || fail "the built app is $got_id, not $BUNDLE_ID"
  [[ "$got_ver" == "$VERSION" && "$got_build" == "$BUILD" ]] || fail "the built app is $got_ver ($got_build), not $VERSION ($BUILD) — the gateway expects $CLIENT_ID"
  ok "identity $got_id $got_ver ($got_build) → $CLIENT_ID"

  local signature=$(codesign -dv --verbose=2 "$app" 2>&1)
  [[ "$signature" == *"Authority=Apple Distribution"* ]] \
    || fail "the app is not signed with an Apple Distribution certificate"
  codesign --verify --strict "$app" 2>/dev/null || fail "the signature does not verify"
  ok "signed with Apple Distribution, signature valid"

  # A distribution build must not be debuggable.
  # Read the one key rather than pattern-matching the whole plist: an unrelated
  # <true/> further down would otherwise look like a debuggable build.
  # An absent key yields an empty string, which is correct for a release build.
  local taskallow=$(codesign -d --entitlements - --xml "$app" 2>/dev/null \
    | plutil -extract 'get-task-allow' raw -o - - 2>/dev/null)
  [[ "$taskallow" == "true" ]] && fail "get-task-allow is true — this is a development-signed build"
  ok "not debuggable (get-task-allow absent or false)"

  grep -rqa "$GATEWAY_ORIGIN" "$app" || fail "the review gateway origin is not in the shipped bundle"
  ok "shipped bundle points at the review gateway"
  rm -rf "$work"
}

do_upload() {
  [[ -f "$IPA" ]] || IPA=$(ls "$EXPORT_DIR"/*.ipa(N) 2>/dev/null | head -1)
  [[ -n "$IPA" && -f "$IPA" ]] || fail "no .ipa for $VERSION ($BUILD) — run: scripts/ios-testflight.sh archive"
  source "$ASC_ENV"
  export API_PRIVATE_KEYS_DIR="$SIGNING_DIR"

  note "validating with App Store Connect"
  xcrun altool --validate-app -f "$IPA" -t ios \
    --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID" || fail "App Store Connect rejected the build at validation"
  ok "validated"

  note "uploading — this can take several minutes"
  xcrun altool --upload-app -f "$IPA" -t ios \
    --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID" || fail "upload failed"
  ok "uploaded $VERSION ($BUILD)"
  print ""
  print -P "%BNext%b: App Store Connect ▸ TestFlight. Processing takes 5–30 minutes."
  print    "       Then add the build to the tester group and issue each tester an invite code."
}

case "$STAGE" in
  preflight) preflight; print ""; ok "preflight passed — safe to archive" ;;
  archive)   do_archive ;;
  verify)    verify_ipa ;;
  upload)    do_upload ;;
  all)       do_archive; do_upload ;;
  *)         fail "unknown stage '$STAGE' — use preflight, archive, verify, upload, or no argument for all" ;;
esac
