#!/usr/bin/env zsh
# Archive the built Android and iOS release files to /Volumes/AndroidDev, keep the
# newest three releases there, then free the MacBook's local Android build folder.
#
#   scripts/archive-release-builds.sh           check, copy, verify, prune, delete local
#   scripts/archive-release-builds.sh --keep-local   same, but leave android/app/build in place
#
# The version comes from app.json. Nothing is archived unless every APK/AAB carries
# that version and CRIL's release key, and the iOS app carries the same version.
# Local files are deleted only after the archived copies pass their SHA-256 check.
set -uo pipefail

REPO_DIR="${0:A:h:h}"
VOLUME="/Volumes/AndroidDev"
ARCHIVE_ROOT="$VOLUME/acr-release-archive"
KEEP=3
RELEASE_CERT_SHA256="65a04dbbee2bf1104b6dc89ca5a9fe1e356f4598b340e72939c3beb649a815fc"
ANDROID_OUT="$REPO_DIR/android/app/build/outputs"
IOS_PRODUCTS="$VOLUME/xcode-derived/acr-mobile-companion/Build/Products/Release-iphoneos"
KEEP_LOCAL=false
[[ "${1:-}" == "--keep-local" ]] && KEEP_LOCAL=true

ok()   { print -P "%F{green}✔%f $*"; }
note() { print -P "%F{cyan}•%f $*"; }
fail() { print -P "%F{red}✘ $*%f"; print -P "%F{red}Stopped. Nothing was deleted.%f"; exit 1; }

[[ -d "$VOLUME" ]] || fail "$VOLUME is not mounted"
VERSION=$(node -p "require('$REPO_DIR/app.json').expo.version") || fail "cannot read app.json"
BUILD=$(node -p "require('$REPO_DIR/app.json').expo.ios.buildNumber") || fail "cannot read app.json"
RELEASE="v${VERSION}-build${BUILD}"
DEST="$ARCHIVE_ROOT/$RELEASE"
print -P "%BArchive ACR Companion $RELEASE%b → $DEST\n"

BT=$(ls -d "$VOLUME"/android-sdk/build-tools/* 2>/dev/null | sort -V | tail -1)
[[ -n "$BT" ]] || fail "Android build-tools not found under $VOLUME/android-sdk"
export JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home -v 21 2>/dev/null)}"

typeset -a android_files
android_files=("$ANDROID_OUT"/apk/release/*.apk(N) "$ANDROID_OUT"/bundle/release/*.aab(N))
(( ${#android_files} )) || fail "no Android release APK/AAB in $ANDROID_OUT"
for f in "${android_files[@]}"; do
  name=${f:t}
  if [[ "$f" == *.apk ]]; then
    badge=$("$BT/aapt2" dump badging "$f" 2>/dev/null | head -1)
    [[ "$badge" == *"versionCode='$BUILD'"* && "$badge" == *"versionName='$VERSION'"* ]] || fail "$name is not $VERSION ($BUILD)"
    "$BT/apksigner" verify --print-certs "$f" 2>/dev/null | grep -q "SHA-256 digest: $RELEASE_CERT_SHA256" || fail "$name is not signed with CRIL's release key"
  else
    keytool -printcert -jarfile "$f" 2>/dev/null | tr -d ':' | tr 'A-F' 'a-f' | grep -q "$RELEASE_CERT_SHA256" || fail "$name is not signed with CRIL's release key"
  fi
  ok "$name — $VERSION ($BUILD), release key"
done

IOS_APP="$IOS_PRODUCTS/ACRCompanion.app"
if [[ -d "$IOS_APP" ]]; then
  ios_v=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$IOS_APP/Info.plist")
  ios_b=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$IOS_APP/Info.plist")
  [[ "$ios_v" == "$VERSION" && "$ios_b" == "$BUILD" ]] || fail "iOS app is $ios_v ($ios_b), not $VERSION ($BUILD)"
  ok "ACRCompanion.app — $VERSION ($BUILD)"
else
  note "no iOS release build found — archiving Android only"
fi

[[ -e "$DEST" ]] && fail "$DEST already exists — remove it first if this release was rebuilt"
mkdir -p "$DEST/android" || fail "cannot create $DEST"
for f in "${android_files[@]}"; do cp -p "$f" "$DEST/android/" || fail "copy failed: ${f:t}"; done
if [[ -d "$IOS_APP" ]]; then
  mkdir -p "$DEST/ios"
  ditto -c -k --keepParent "$IOS_APP" "$DEST/ios/ACRCompanion-$RELEASE.app.zip" || fail "iOS app zip failed"
  [[ -d "$IOS_APP.dSYM" ]] && { ditto -c -k --keepParent "$IOS_APP.dSYM" "$DEST/ios/ACRCompanion-$RELEASE.app.dSYM.zip" || fail "iOS dSYM zip failed"; }
fi
{
  print "ACR Companion $RELEASE"
  print "Archived: $(date -u '+%Y-%m-%d %H:%M UTC')"
  print "Repository at archiving (build from an earlier commit is possible): $(git -C "$REPO_DIR" rev-parse --short HEAD) ($(git -C "$REPO_DIR" branch --show-current))"
  print "Android application ID: com.acragent.companion · release key SHA-256 $RELEASE_CERT_SHA256"
  print "Android: arm64-v8a = phones from about 2017 on (send this one) · armeabi-v7a = old 32-bit phones · universal = any phone or emulator · .aab = Google Play upload only"
  [[ -d "$DEST/ios" ]] && print "iOS: development-signed (personal team); installs only on registered devices while its profile is valid"
} > "$DEST/BUILD_INFO.txt"
(cd "$DEST" && find android ios -type f 2>/dev/null | sort | xargs shasum -a 256 > SHA256SUMS.txt) || fail "checksum file failed"
(cd "$DEST" && shasum -a 256 -c SHA256SUMS.txt >/dev/null) || fail "archived copies failed their checksum"
for f in "${android_files[@]}"; do
  [[ "$(shasum -a 256 "$f" | cut -d' ' -f1)" == "$(grep " android/${f:t}\$" "$DEST/SHA256SUMS.txt" | cut -d' ' -f1)" ]] || fail "${f:t} differs from its archived copy"
done
ok "archived and verified: $(du -sh "$DEST" | cut -f1)"

typeset -a releases
releases=("$ARCHIVE_ROOT"/v*-build*(N/))
releases=(${(f)"$(for r in "${releases[@]}"; do print "${r##*build} $r"; done | sort -n | cut -d' ' -f2-)"})
if (( ${#releases} > KEEP )); then
  for old in "${releases[@]:0:$(( ${#releases} - KEEP ))}"; do
    rm -rf "$old" && note "removed older release ${old:t}"
  done
fi
ok "releases kept on $VOLUME: $(ls -d "$ARCHIVE_ROOT"/v*-build*(N/) | xargs -n1 basename | tr "\n" " ")"

if $KEEP_LOCAL; then
  note "local android/app/build left in place (--keep-local)"
else
  freed=$(du -sh "$REPO_DIR/android/app/build" | cut -f1)
  rm -rf "$REPO_DIR/android/app/build" && ok "deleted local android/app/build ($freed freed); the next release build recreates it"
fi
note "iOS build files already live on $VOLUME (xcode-derived); nothing iOS is stored in the MacBook repository"
