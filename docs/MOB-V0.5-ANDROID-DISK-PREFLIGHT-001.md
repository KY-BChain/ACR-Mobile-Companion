# MOB-V0.5-ANDROID-DISK-PREFLIGHT-001

## Safe disk inventory and bounded housekeeping before the Android build

Status: `READY FOR CODEX EXECUTION AFTER COMMIT/PUSH AND BASELINE CONFIRMATION`

This is a local disk-capacity preflight. It is not an Android implementation,
build, dependency-installation or repository-editing session.

## 1. Authority

- Owner and cleanup approval authority: Kraken.
- Executor: OpenAI Codex.
- Codex may perform the read-only inventory in this document without further
  approval.
- Codex must present one consolidated cleanup proposal containing exact paths,
  sizes and recovery consequences before deleting anything.
- Kraken authorises deletion only by replying with the exact cleanup batch and
  item identifiers.
- Codex may never infer deletion approval from this instruction file alone.

## 2. Repository and controlling baseline

Repository:

```text
/Users/Kraken/DAPP/acr-mobile-companion
```

Required branch:

```text
feature/mobile-v0.5-android
```

Accepted application ancestor:

```text
808565d69a2ca6253c63bc0167b5f2cd39705818
```

Kraken supplies the full clean, pushed branch commit as:

```text
SESSION_BASELINE_SHA
```

The same baseline may subsequently be used for the Android build session only
if this preflight leaves the repository completely unchanged and clean.

## 3. Objective and disk gate

Current reported free space is approximately 21 GB. The objective is to:

1. identify where the mobile development storage is actually used;
2. remove only specifically approved, regenerable artefacts;
3. preserve source, dependencies, signing materials and required toolchains;
4. finish with at least **35 GB free** on the macOS data volume;
5. keep the Git working tree byte-for-byte unchanged.

Terminal decision:

- `ANDROID_DISK_PREFLIGHT_GO` requires at least 35 GB free, a clean repository
  and no cleanup error.
- Below 35 GB is `ANDROID_DISK_PREFLIGHT_NOGO`, with the exact remaining large
  candidates reported. Do not begin the Android build.

The Android emulator is excluded. Both Android tests will use physical phones.

## 4. Non-negotiable preservation rules

Codex must not delete, move, edit or recreate:

- `.git/`, tracked files, untracked instruction files or repository source;
- `node_modules/`;
- `ios/Pods/`, `Podfile.lock` or CocoaPods configuration;
- `ios/` or `android/` native projects;
- `package.json`, any lockfile or Expo configuration;
- Android SDK platforms, Build Tools, Platform Tools or accepted JDK/Gradle
  components needed by the forthcoming build;
- `~/.gradle/caches` or `~/.gradle/wrapper` before the first Android build;
- Android signing keystores, certificates, provisioning profiles or passwords;
- Xcode Archives containing the accepted ACR build;
- the installed iOS 26.3 simulator runtime used for iPhone 16e verification;
- the external `acr-mobile-companion_P1P2_21AUG26.zip` backup;
- ACR evidence, clinical documents, locale files, test results or reports;
- personal files, Photos, Mail, Messages, browser profiles or cloud-sync data;
- Time Machine local snapshots;
- the Trash without Kraken explicitly approving that separate action.

Forbidden commands include:

```text
git clean -fd
git clean -fdx
git reset --hard
npm cache clean --force
rm -rf with ~, /Users/Kraken, /Users/Kraken/DAPP, / or an unresolved variable
deletion of all ~/Library/Caches
deletion of all Xcode, Android SDK, Gradle or CocoaPods data
```

Do not install, update or remove Android Studio, Android SDK packages, Java,
Gradle, Node, Expo, React Native, CocoaPods or Xcode in this session.

## 5. Legal terminal states

- `READY_FOR_KRAKEN_CLEANUP_APPROVAL`
- `ANDROID_DISK_PREFLIGHT_GO`
- `ANDROID_DISK_PREFLIGHT_NOGO`
- `BLOCKED_BASELINE`
- `BLOCKED_INVENTORY`
- `BLOCKED_CLEANUP`
- `BLOCKED_SCOPE`

# EXECUTION

## Phase A — Close active build processes

Ask Kraken to confirm that the following are closed or stopped:

- Xcode;
- iOS Simulator;
- Android Studio, if installed;
- Metro/Expo development server;
- any active Gradle build.

VS Code and the current Codex session may remain open.

Codex may inspect processes but must not kill an unrelated process:

```zsh
ps aux | grep -E '[X]code|[S]imulator|[M]etro|[e]xpo start|[g]radle|[s]tudio'
lsof -nP -iTCP:8081 -sTCP:LISTEN || true
```

If a relevant build process is active, ask Kraken to close it and then repeat
the inspection.

## Phase B — Verify the repository baseline

Run:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion

pwd
git branch --show-current
git rev-parse HEAD
git rev-parse origin/feature/mobile-v0.5-android
git rev-list --left-right --count HEAD...origin/feature/mobile-v0.5-android
git status --short --branch
git status --porcelain=v1 --untracked-files=all
git merge-base --is-ancestor \
  808565d69a2ca6253c63bc0167b5f2cd39705818 HEAD
```

Required:

- exact repository and branch;
- HEAD, upstream and `SESSION_BASELINE_SHA` identical;
- ahead/behind `0 0`;
- completely clean working tree;
- accepted application commit is an ancestor.

Any failure ends `BLOCKED_BASELINE`. Do not repair Git state.

## Phase C — Record the starting storage state

Run and preserve the output:

```zsh
date
sw_vers
uname -m
df -h /
diskutil info / | grep -E 'Container Total Space|Container Free Space|Volume Free Space'
tmutil listlocalsnapshots / 2>/dev/null || true
```

Time Machine snapshots are inventory only. Do not delete them.

Record:

```text
START_FREE_SPACE_GB:
START_USED_PERCENT:
```

## Phase D — Measure the repository without changing it

From the repository root:

```zsh
du -sh .
du -h -d 1 . 2>/dev/null | sort -h

for candidate_path in \
  node_modules \
  ios/Pods \
  ios/build \
  android/.gradle \
  android/build \
  android/app/build \
  .expo \
  .git
do
  if [ -e "$candidate_path" ]; then
    du -sh "$candidate_path"
  fi
done

git count-objects -vH
git status --porcelain=v1 --untracked-files=all
```

Do not run `git gc`, `git prune`, package-manager cleanup or a Gradle clean.

Report the ten largest immediate repository directories. Distinguish:

- tracked source;
- required installed dependencies;
- regenerable build output;
- Git metadata;
- unknown content requiring inspection.

## Phase E — Measure development storage outside the repository

Measure only the following bounded development paths when they exist:

```zsh
for candidate_path in \
  "$HOME/Library/Developer/Xcode/DerivedData" \
  "$HOME/Library/Developer/Xcode/Archives" \
  "$HOME/Library/Developer/Xcode/iOS DeviceSupport" \
  "$HOME/Library/Developer/CoreSimulator" \
  "$HOME/Library/Caches/CocoaPods" \
  "$HOME/Library/Android/sdk" \
  "$HOME/.android/avd" \
  "$HOME/.gradle/caches" \
  "$HOME/.gradle/wrapper" \
  "$HOME/.npm"
do
  if [ -e "$candidate_path" ]; then
    du -sh "$candidate_path"
  fi
done
```

Then inspect only one level below large development directories:

```zsh
du -h -d 1 "$HOME/Library/Developer/Xcode/DerivedData" 2>/dev/null | sort -h
du -h -d 1 "$HOME/Library/Developer/CoreSimulator" 2>/dev/null | sort -h
du -h -d 1 "$HOME/Library/Android/sdk" 2>/dev/null | sort -h
du -h -d 1 "$HOME/.gradle" 2>/dev/null | sort -h
```

Do not scan the whole home directory, personal data or mounted external disks.

## Phase F — Inventory installed iOS simulator resources

Run:

```zsh
xcrun simctl list runtimes
xcrun simctl list devices
xcrun simctl list devices unavailable
```

Record:

- the required iOS 26.3 runtime;
- iPhone 16e simulator availability;
- other installed runtimes;
- unavailable device records;
- approximate CoreSimulator size.

Do not delete a runtime or simulator in this phase.

## Phase G — Inventory the Android toolchain and estimate new space

Run read-only checks:

```zsh
test -d "/Applications/Android Studio.app" && echo ANDROID_STUDIO_PRESENT || echo ANDROID_STUDIO_ABSENT
which adb || true
adb version || true
java -version
/usr/libexec/java_home -V
echo "ANDROID_HOME=${ANDROID_HOME:-}"
echo "ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-}"
test -d "$HOME/Library/Android/sdk" && du -sh "$HOME/Library/Android/sdk"
```

If the Android project exists, read its pinned SDK requirements without running
Gradle or downloading anything. Report whether the installed SDK already
contains the required platform and Build Tools.

Classify expected additional disk demand as:

- Android Studio already installed / absent;
- required SDK present / missing;
- Gradle wrapper and dependencies locally cached / missing;
- no emulator image required;
- likely build-output allowance.

Do not install missing components during housekeeping.

## Phase H — Produce the ranked cleanup proposal and stop

Return a table with one row per candidate:

| ID | Exact path/action | Size | Category | Regenerable | Re-download/rebuild consequence | Recommendation |
| --- | --- | ---: | --- | --- | --- | --- |

Use these categories.

### Batch A — Project-specific, normally low-risk candidates

Include only candidates that actually exist and whose size was measured:

- untracked and ignored `ios/build/` build output;
- untracked and ignored `android/build/` or `android/app/build/` output;
- exact ACR project directories under Xcode `DerivedData`;
- unavailable simulator device records through
  `xcrun simctl delete unavailable`;
- obsolete ACR-specific `.xcresult` or build-log artefacts after proving they
  are outside accepted evidence and outside Git.

Before proposing a repository path, prove it contains no tracked files:

```zsh
git ls-files -- <exact-relative-path>
git check-ignore -v <exact-relative-path> || true
```

### Batch B — Larger, higher-cost candidates requiring separate selection

Examples, only after exact measurement:

- named non-ACR Xcode DerivedData directories;
- an unused iOS simulator runtime other than iOS 26.3, removed manually through
  **Xcode > Settings > Components**;
- named old iOS DeviceSupport versions no longer required;
- named old Xcode Archives only after Kraken confirms they are backed up;
- npm cache only when exceptionally large and only with acceptance that future
  installs must download packages again;
- items already copied to the external USB drive and independently verified.

Do not propose deleting Gradle caches or Android SDK components needed for the
next task merely because they are large.

### Batch C — Never delete in this task

List any large protected item, including `node_modules`, Pods, source, current
SDKs, signing material, accepted Archives, iOS 26.3 runtime and evidence, with
the decision `PRESERVE`.

Calculate projected free space for each proposed batch. Then stop with:

```text
READY_FOR_KRAKEN_CLEANUP_APPROVAL
```

Kraken's approval must name exact identifiers, for example:

```text
APPROVE CLEANUP: A1, A2, A4
```

No approval means no deletion.

## Phase I — Execute only the approved cleanup

After explicit approval:

1. repeat `df -h /`;
2. revalidate every exact approved path;
3. confirm no approved path resolves to `/`, `$HOME`, `/Users/Kraken/DAPP`, the
   repository root, `.git`, `node_modules`, Pods, a signing path or a protected
   item;
4. stop if a path has changed, is a symlink to an unexpected location or is no
   longer exactly the approved target;
5. remove only the approved item;
6. record success/failure and immediately remeasure free space;
7. do not substitute a different candidate if deletion saves less than
   projected.

For an approved ACR DerivedData directory, Codex must use its complete literal
path as listed in the approval. For an approved repository build directory,
Codex must use the complete literal repository path. Do not use globs in a
destructive command.

If an unused simulator runtime is approved, Kraken removes that named runtime
through Xcode Settings. Codex then re-runs the simulator inventory; Codex must
not remove the iOS 26.3 runtime.

Do not empty the Trash unless Kraken separately says:

```text
APPROVE EMPTY TRASH
```

## Phase J — Final verification

Run:

```zsh
df -h /
diskutil info / | grep -E 'Container Total Space|Container Free Space|Volume Free Space'

cd /Users/Kraken/DAPP/acr-mobile-companion
git branch --show-current
git rev-parse HEAD
git rev-parse origin/feature/mobile-v0.5-android
git rev-list --left-right --count HEAD...origin/feature/mobile-v0.5-android
git status --short --branch
git status --porcelain=v1 --untracked-files=all
```

Required repository result is the same clean baseline SHA and `0 0` divergence.

Record:

```text
START_FREE_SPACE_GB:
END_FREE_SPACE_GB:
SPACE_RECOVERED_GB:
REPOSITORY_CHANGED: NO
ANDROID_TOOLCHAIN_PRESENT_OR_MISSING:
ANDROID_BUILD_GATE: GO or NOGO
```

If end free space is at least 35 GB, return:

```text
ANDROID_DISK_PREFLIGHT_GO
```

Otherwise return:

```text
ANDROID_DISK_PREFLIGHT_NOGO
```

Do not start the Android implementation from this housekeeping session.

## 6. Evidence return

Return, in the final response:

1. one legal terminal state;
2. starting and ending free space;
3. ranked measured storage inventory;
4. exact approved and removed items;
5. preserved large items;
6. Android Studio/SDK/JDK/Gradle availability;
7. final Git branch, SHA, upstream equality, divergence and cleanliness;
8. remaining risks;
9. whether the Android build session may start.

Optionally write the same small text report outside Git at:

```text
/Users/Kraken/DAPP/ACR-MOBILE-EVIDENCE/MOB-V0.5-ANDROID-DISK-PREFLIGHT-001/Evidence-Report.md
```

Do not create or modify a report inside the application repository.

## 7. Opening message for the Codex housekeeping session

```text
MOB-V0.5-ANDROID-DISK-PREFLIGHT-001

Repository:
/Users/Kraken/DAPP/acr-mobile-companion

Required branch:
feature/mobile-v0.5-android

SESSION_BASELINE_SHA:

Accepted application ancestor:
808565d69a2ca6253c63bc0167b5f2cd39705818

Read this instruction completely before taking action:
docs/MOB-V0.5-ANDROID-DISK-PREFLIGHT-001.md

Perform the read-only disk and toolchain inventory first. Do not delete,
install, update, clean, commit, push or modify the repository. Present one
consolidated cleanup proposal with exact paths and measured sizes, then stop at
READY_FOR_KRAKEN_CLEANUP_APPROVAL. Continue only after my explicit approval of
named cleanup items.
```

Paste the full clean, pushed Android-branch SHA after
`SESSION_BASELINE_SHA:`.

## Official capacity reference

Android Studio for macOS lists 8 GB free as the IDE minimum, 16 GB with the
emulator, and recommends an SSD with 32 GB or more free:

https://developer.android.com/studio/install
