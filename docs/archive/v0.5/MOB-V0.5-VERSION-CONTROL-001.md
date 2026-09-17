# MOB-V0.5-VERSION-CONTROL-001

## Concrete version-control procedure for the accepted ACR mobile UI demo

## 1. Correction of terminology

“Immutable version label” was imprecise shorthand.

The actual mechanism is an **annotated Git tag** pointing to one accepted commit.
Git permits an administrator to delete or forcibly replace a tag, so the tag is
not technically immutable. The project rule is that an accepted release tag is
never moved or reused. If a label is wrong, create a new tag rather than changing
the old one.

## 2. Two different versions must be controlled

### 2.1 Source version

The source version identifies the exact committed files:

```text
Git commit SHA
Git annotated tag
```

Current accepted source:

```text
Branch: feature/mobile-v0.5-p1-p2
Commit: 808565d69a2ca6253c63bc0167b5f2cd39705818
```

### 2.2 Installed application version

The installed app has separate visible and internal identifiers:

| Platform | User-visible version | Build identifier |
| --- | --- | --- |
| iOS | `CFBundleShortVersionString` / Expo `version` | `CFBundleVersion` / Expo `ios.buildNumber` |
| Android | `versionName` / Expo `version` | `versionCode` / Expo `android.versionCode` |

The Git tag and installed app version should agree, but they are not the same
technical field.

## 3. Do not tag the current commit as v0.5.0 until the app version is audited

Earlier device evidence reported marketing version `0.1.0` and build `42`.
That must be rechecked against the current committed configuration and Xcode
build settings. Do not create a `v0.5.0` tag while the installed bundle still
identifies itself as `0.1.0` unless Kraken explicitly accepts that mismatch.

## 4. Immediate accepted-source checkpoint

The accepted source can be labelled now without claiming an unverified app
marketing version.

Recommended tag:

```text
acr-mobile-ui-p1p2-accepted-20260821
```

### Step 4.1 — Verify the source

```bash
cd ~/DAPP/acr-mobile-companion

git branch --show-current
git rev-parse HEAD
git rev-parse origin/feature/mobile-v0.5-p1-p2
git rev-list --left-right --count HEAD...origin/feature/mobile-v0.5-p1-p2
git status --short --branch
```

Required:

```text
feature/mobile-v0.5-p1-p2
808565d69a2ca6253c63bc0167b5f2cd39705818
808565d69a2ca6253c63bc0167b5f2cd39705818
0 0
clean working tree
```

### Step 4.2 — Confirm the tag does not already exist

```bash
git tag --list 'acr-mobile-ui-p1p2-accepted-20260821'
```

Expected output: empty.

If the tag already exists, inspect it. Do not delete or replace it.

### Step 4.3 — Create the annotated tag

```bash
git tag -a acr-mobile-ui-p1p2-accepted-20260821 \
  808565d69a2ca6253c63bc0167b5f2cd39705818 \
  -m 'Accepted ACR mobile UI demo: P1/P2, two-page About, eight locales and Arabic RTL fix; simulator and iPhone 13 standalone verified'
```

Creating the tag does not edit application files or create a new commit.

### Step 4.4 — Verify the local tag

```bash
git show --no-patch --decorate --format=fuller \
  acr-mobile-ui-p1p2-accepted-20260821

git rev-parse 'acr-mobile-ui-p1p2-accepted-20260821^{}'
```

The dereferenced tag must resolve to:

```text
808565d69a2ca6253c63bc0167b5f2cd39705818
```

### Step 4.5 — Push only the tag

```bash
git push origin acr-mobile-ui-p1p2-accepted-20260821
```

### Step 4.6 — Verify the remote tag

```bash
git ls-remote --tags origin \
  'refs/tags/acr-mobile-ui-p1p2-accepted-20260821' \
  'refs/tags/acr-mobile-ui-p1p2-accepted-20260821^{}'
```

The annotated tag produces a tag-object line and a dereferenced commit line.
The dereferenced line must contain the accepted commit SHA.

## 5. Audit the installed app version before the next release-labelled build

Run these read-only searches:

```bash
cd ~/DAPP/acr-mobile-companion

git grep -n -E '"version"|buildNumber|versionCode' -- \
  app.json app.config.js app.config.ts package.json 2>/dev/null || true

xcodebuild \
  -workspace ios/ACRCompanion.xcworkspace \
  -scheme ACRCompanion \
  -configuration Release \
  -showBuildSettings | \
  grep -E 'MARKETING_VERSION|CURRENT_PROJECT_VERSION|PRODUCT_BUNDLE_IDENTIFIER'
```

If Android native files exist, also run:

```bash
git grep -n -E 'versionName|versionCode' -- android 2>/dev/null || true
```

Record the actual values. Do not infer them from document names such as “v0.5”.

## 6. Decide and apply the next application version

Recommended next user-visible demo version:

```text
0.5.0
```

Build-number rule:

1. Read the current iOS build number and Android version code.
2. Increase each monotonically for a new installed binary.
3. Never reuse a lower or previously distributed build number.
4. Do not assume `43` unless the audit proves the current value is `42`.

If Kraken accepts `0.5.0`, make one dedicated version-alignment commit before
building the version-labelled iPhone XR and Android binaries.

The commit must align every authoritative configuration actually used by the
existing native projects. Typical fields are:

```text
Expo app config version
Expo ios.buildNumber
Expo android.versionCode
Xcode MARKETING_VERSION
Xcode CURRENT_PROJECT_VERSION
Android versionName
Android versionCode
```

Do not blindly edit all of these. First determine which files are authoritative
in this repository and which are generated. Do not run Prebuild merely to change
a version.

Suggested commit summary after the values are verified and aligned:

```text
chore: set ACR mobile demo version 0.5.0
```

Suggested description:

```text
Align the user-visible ACR mobile demo version and monotonically increment the
iOS and Android build identifiers from their verified current values.

No application functionality or clinical content changed.
```

## 7. Tag the version-alignment commit

After that commit is pushed and verified clean, create a version tag containing
the actual build identifiers. Example only:

```text
acr-mobile-v0.5.0-build-<verified-build-number>
```

Replace the suffix with the verified build number; do not type the angle
brackets literally.

Create and verify it with the same annotated-tag procedure in section 4,
pointing to the version-alignment commit rather than the earlier SHA.

## 8. Branching action plan

1. Preserve the accepted tag on SHA `808565d...`.
2. Perform the iPhone XR compatibility installation directly from that accepted
   source if no application version change is required.
3. If a compatibility or version-alignment code/configuration change is needed,
   create a dedicated branch from the accepted commit before editing.
4. Create the Android implementation branch from the accepted tag or the later
   version-alignment tag, whichever Kraken designates as controlling.
5. Do not develop Android and backend integration on the same branch.

Recommended Android branch:

```text
feature/mobile-v0.5-android
```

Recommended later integration branch:

```text
feature/mobile-v0.6-gateway-integration
```

## 9. Recovery rule

Never move an accepted tag.

If a tag contains the wrong description or points to the wrong commit:

1. leave it in place;
2. create a corrected tag with a new suffix;
3. document which tag supersedes the earlier one.

## Official version reference

- Expo version management: https://docs.expo.dev/build-reference/app-versions/
