# MOB-P1P2-IOS-STANDALONE-001
# Physical iPhone 13 Local Release Build and Standalone Verification

Run this task as a NEW Codex session.

This is a build, installation and runtime-verification session. It is not a
feature implementation session and it is not a clinical-validation session.

## 1. Authority

Owner and acceptance authority:
- Kraken

Implementation and evidence agent:
- Codex

Clinical-domain authority:
- ACR clinical partners, including the participating clinical and academic
  experts.

Release and repository-promotion authority:
- Kraken only

Codex is authorised to:

- inspect the existing repository and native iOS project;
- run local diagnostic, build and installation commands;
- open the existing Xcode workspace or project;
- use Xcode automatic signing with the already configured Apple account;
- renew or create a free Personal Team development provisioning profile;
- register the connected iPhone through Xcode if normal automatic signing
  requires it;
- install and launch the application on the connected iPhone 13;
- stop a Metro process belonging specifically to this repository;
- create local Xcode DerivedData and other normal untracked build outputs;
- perform safe, non-mutating build retries.

Codex is not authorised to commit, push, merge, publish, distribute, enrol in a
paid programme or modify clinical functionality.

Do not request permission for each ordinary terminal or build command.
Pause only when Kraken must interact physically with the iPhone, Xcode,
Keychain, Apple ID, two-factor authentication or a material stop condition.

Never request an Apple ID password, Keychain password or two-factor code in
the Codex conversation.

## 2. Controlling baseline

Repository:

/Users/Kraken/DAPP/acr-mobile-companion

Required branch:

feature/mobile-v0.5-p1-p2

Accepted application implementation commit:

8196e135e600d75ae891645587ad2dc7536dc303

This fixed SHA identifies the application implementation already accepted in
the iPhone 16e / iOS 26.3 simulator. It must remain an ancestor of the session
repository baseline described below.

Session repository baseline:

- Kraken supplies the documentation-inclusive full commit SHA in the opening
  Codex message as `SESSION_BASELINE_SHA` after this instruction file has been
  committed and pushed.
- This file deliberately does not embed the value of `SESSION_BASELINE_SHA`,
  because a tracked file cannot contain the SHA of the commit that contains
  that same file without changing the commit SHA again.
- Codex must not begin execution unless `SESSION_BASELINE_SHA` is present in
  Kraken's opening message.
- `SESSION_BASELINE_SHA` must equal both local `HEAD` and
  `origin/feature/mobile-v0.5-p1-p2` at the start and end of the task.

Required upstream:

origin/feature/mobile-v0.5-p1-p2

Target physical device:

- iPhone 13
- iOS 26.6.1
- Developer Mode to be confirmed and, if necessary, enabled during Xcode
  device preparation in Phase B
- connected directly to the Mac

Accepted simulator evidence:

- iPhone 16e / iOS 26.3 simulator;
- ACR app icon and launch flow working;
- two About pages accepted;
- all eight languages accepted on both About pages;
- all eight languages accepted on all five assessment pages;
- Steps 1–3 retained;
- P1 and P2 implemented as provisional fields;
- no clinical acceptance has been granted.

The existing native ios/ project is the only permitted native baseline.

## 3. Objective

Produce and install a local iOS Release build on the physical iPhone 13 so
that:

1. the ACR app icon appears on the iPhone;
2. the application opens directly from that icon;
3. Expo Go is not involved;
4. no Expo development launcher is displayed;
5. Metro is stopped and unavailable when the application is launched;
6. the JavaScript bundle and application assets are embedded in the installed
   app;
7. the app continues to open after USB disconnection and force-closing;
8. the accepted P1/P2 and About implementation remains unchanged;
9. the repository remains clean at the controlling baseline;
10. the signing method and provisioning-profile expiry are reported accurately.

This session proves local standalone execution on Kraken's iPhone. It does not
produce a distributable Ad Hoc IPA for external testers.

## 4. Explicit exclusions and forbidden actions

Do not:

- run Expo Prebuild;
- run `expo prebuild`, `npx expo prebuild` or any equivalent;
- delete or regenerate ios/;
- install or update npm, Yarn, Expo, CocoaPods, Ruby or Homebrew dependencies;
- run `npm install`, `npm update`, `yarn`, `pnpm install` or `pod install`;
- use EAS Build or any other cloud-build service;
- log in to Expo;
- use Expo Go;
- use a Metro tunnel or remote development server;
- change package.json or any lockfile;
- change app.json, app.config.*, metro.config.*, babel.config.* or tsconfig.*;
- change the bundle identifier;
- change entitlements or application capabilities;
- change DEVELOPMENT_TEAM or other persistent project-signing settings silently;
- change any application source, locale, test or documentation file;
- change API, gateway, inference, ontology, SWRL, Openllet, attestation or Result
  functionality;
- add production URLs, credentials, secrets or clinical data;
- archive or export an App Store, TestFlight or Ad Hoc distribution package;
- commit, push, publish or merge;
- fetch, pull, rebase, reset, clean or switch branches;
- claim clinical validation.

If any prohibited action appears necessary, stop and report why. Do not take it.

## 5. Phase A — Baseline verification

Before opening Xcode or building:

1. Change to the repository root.
2. Record:

   - absolute working directory;
   - current branch;
   - full HEAD SHA;
   - full upstream SHA;
   - `SESSION_BASELINE_SHA` supplied in Kraken's opening message;
   - ancestry of accepted application implementation commit
     `8196e135e600d75ae891645587ad2dc7536dc303` relative to HEAD;
   - ahead/behind comparison;
   - short Git status;
   - staged and unstaged diff posture.

3. Confirm:

   - branch is exactly `feature/mobile-v0.5-p1-p2`;
   - Kraken's opening message supplies a full `SESSION_BASELINE_SHA`;
   - HEAD equals `SESSION_BASELINE_SHA`;
   - `origin/feature/mobile-v0.5-p1-p2` equals `SESSION_BASELINE_SHA`;
   - accepted application implementation commit
     `8196e135e600d75ae891645587ad2dc7536dc303` is an ancestor of HEAD;
   - ahead/behind is `0 0`;
   - the working tree is clean;
   - ios/ already exists;
   - the local Expo executable and required node_modules already exist.

4. Read only the relevant build instructions and configuration from:

   - package.json;
   - app.json or the active app configuration;
   - the existing ios/ project;
   - vP1P2/ACR_Mobile_v0.5_P1P2_Application_Guide.md;
   - any existing repository documentation that records the previously
     successful physical-iPhone build route.

Do not fetch or change Git state.

Stop with `BLOCKED_BASELINE` if `SESSION_BASELINE_SHA` is absent, or if the
branch, SHA, implementation ancestry, upstream or clean-tree conditions are
not satisfied.

Stop with `BLOCKED_DEPENDENCIES` if required local dependencies are absent.
Do not install them.

## 6. Phase B — Toolchain and device recognition

Record:

- macOS version;
- Xcode version and selected developer directory;
- available iOS SDK version;
- Node version;
- local Expo CLI version;
- detected physical devices;
- target device name and reported iOS version.

Use the current Xcode device tools to prove that the connected iPhone is
recognised. Do not expose the full device UDID in the final report.

Confirm that:

- the iPhone is unlocked;
- the Mac and iPhone trust relationship is established;
- Developer Mode is enabled before the application is installed and launched;
- Xcode recognises iOS 26.6.1;
- the iPhone is available as a build destination.

Developer Mode may not yet be visible in iPhone Settings before Xcode first
prepares the connected device for development. If it is not visible at the
start of this task, do not classify that alone as a failure. Codex must:

1. keep the iPhone connected, unlocked and trusted;
2. open the existing project in Xcode and select the connected iPhone as the
   run destination;
3. allow Xcode to begin preparing the device or attempt the authorised local
   development launch;
4. pause when Xcode or iOS asks for Developer Mode;
5. instruct Kraken to enable **Settings > Privacy & Security > Developer
   Mode**, restart the iPhone if requested, and confirm **Enable** after the
   restart;
6. resume the same Codex session after Kraken confirms completion.

If the iPhone needs a physical confirmation, pause with one concise instruction
for Kraken and continue in the same session after it is completed.

If the installed Xcode cannot support or recognise iOS 26.6.1, stop with:

BLOCKED_XCODE_DEVICE_SUPPORT

Return the exact Xcode version, device output and error. Do not update Xcode
during this task.

## 7. Phase C — Native project and signing audit

Locate the existing native workspace and project.

Prefer the `.xcworkspace` when CocoaPods integration is present. Do not create
a new workspace or project.

Inspect and report:

- workspace or project used;
- Xcode scheme;
- product name;
- Release configuration;
- bundle identifier;
- signing style;
- configured development team;
- relevant entitlements;
- whether the existing settings are compatible with a Personal Team build.

Do not print certificates, credentials, account email addresses, complete
profile UUIDs or complete device identifiers in the report.

Codex may open Xcode automatically if signing or device selection requires the
Xcode interface.

If Xcode asks Kraken to:

- sign in to the existing Apple account;
- unlock Keychain;
- accept a device-trust request;
- select the existing Personal Team;
- confirm automatic signing;
- acknowledge Developer Mode;

pause and state the exact action required. Continue after Kraken confirms it.

Expected Personal Team behaviour:

- an expired free development profile may be renewed or replaced;
- the connected iPhone may be registered for development;
- the profile will normally have a limited validity period;
- this build is for direct installation on Kraken's device;
- it is not an Ad Hoc distribution build.

Automatic renewal of a local development certificate or provisioning profile
is permitted.

If Xcode requires a repository change to project.pbxproj, the bundle
identifier, entitlements, DEVELOPMENT_TEAM or another tracked configuration
file, stop before changing it and return:

BLOCKED_SIGNING_CONFIGURATION_CHANGE

Report:

- expected setting;
- actual setting;
- exact file that Xcode proposes to change;
- why the change appears necessary;
- whether it is device-specific or should become a controlled repository
  change.

If paid Developer Program membership is demanded for an entitlement or
capability, stop with:

BLOCKED_SIGNING_ENTITLEMENT

Do not remove capabilities as a workaround.

## 8. Phase D — Stop Metro and select the build route

Before the physical Release build:

1. Check whether anything is listening on the normal Metro port.
2. Identify whether any Metro/Expo process belongs to this repository.
3. Stop only a Metro/Expo process confirmed to belong to this repository.
4. Confirm that Metro is no longer listening.

Do not start Metro for this task.

Inspect the existing project and previously successful build instructions,
then select the least-mutating local Release route.

Permitted routes are:

- the existing local Expo CLI `run:ios` Release route using the existing ios/
  project and already installed dependencies; or
- the existing Xcode workspace/scheme using the Release configuration.

If using the local Expo CLI, use the repository-local executable. Do not allow
npx to download or install a package.

Before execution, report the exact selected command or Xcode action and why it
does not invoke Prebuild, Expo Go, a cloud build or a Metro-dependent Debug
runtime.

The build must use the Release configuration.

## 9. Phase E — Build and install

Build the existing application for the connected iPhone 13.

Capture:

- exact build command or Xcode operation;
- workspace/project;
- scheme;
- configuration;
- destination device;
- start and finish time;
- command exit result;
- significant warnings;
- signing identity category, without exposing private details;
- provisioning-profile type and expiry date, where available;
- generated application bundle identifier;
- installation result.

Safe rebuilds and an Xcode Clean Build of this exact project are permitted.

Do not delete broad DerivedData directories. If an exact project-specific
DerivedData cleanup is proposed, identify the resolved target first and ensure
it does not affect other projects.

If the build fails, return:

BUILD_FAILED

Include:

- expected result;
- actual result;
- exact failing phase;
- concise relevant error output;
- whether the cause is code, toolchain, signing, dependency or device related;
- the smallest proposed corrective action.

Do not change source or project configuration to make the build pass.

If build succeeds but installation fails, return:

INSTALL_FAILED

Include the exact device/install error.

## 10. Phase F — Automated standalone evidence

After installation:

1. Confirm the ACR application is installed on the target iPhone.
2. Confirm its bundle identifier and displayed application name.
3. Confirm Metro remains stopped and its normal port is not listening.
4. Launch the installed application without starting Metro.
5. Confirm that no Expo Go or Expo development launcher is used.
6. Record whether the native application process starts successfully.
7. Capture relevant device/runtime logs for launch errors or fatal exceptions.

Do not include private identifiers or unrelated device logs in the response.

If the installed application asks for Metro, displays a development-server
connection error, opens Expo Go, opens a development launcher or fails to start,
return:

STANDALONE_RUNTIME_FAILED

Provide exact reproduction evidence.

## 11. Phase G — Kraken physical-device acceptance

When automated installation and launch evidence is ready, stop at:

READY_FOR_KRAKEN_PHYSICAL_IOS_REVIEW

Leave the app installed. Do not start Metro.

Give Kraken this exact manual checklist and wait for the results:

1. Confirm the ACR icon is visible on the iPhone Home Screen.
2. Tap the ACR icon and confirm the Home/Welcome screen opens.
3. Confirm no Expo Go or development-launcher screen appears.
4. Force-close the ACR app and open it again from the icon.
5. Disconnect the iPhone from the Mac and open the app again.
6. Confirm the two About pages open and remain readable.
7. Complete one English path through all five assessment pages to Review.
8. Confirm P1 and P2 remain clearly provisional.
9. Change language and inspect at least French, Chinese and Arabic.
10. Confirm Arabic RTL presentation is usable.
11. Confirm no crash, frozen screen or Metro connection message occurs.
12. Optionally restart the iPhone and confirm another cold launch.

The exhaustive eight-language simulator matrix is already accepted. Do not
repeat the entire matrix on the physical device unless Kraken requests it.

Do not declare physical acceptance until Kraken returns the checklist results.

## 12. Phase H — Repository integrity audit

After build and installation, record:

- current branch;
- full HEAD;
- upstream comparison;
- Git short status;
- tracked-file changes;
- untracked files inside the repository;
- whether Xcode or the build changed any project/configuration file.

The expected result is the same clean tracked repository at
`SESSION_BASELINE_SHA` supplied in Kraken's opening message.

Normal DerivedData outside the repository is acceptable.

If any tracked or unexpected repository file changed:

- do not reset or delete it;
- list the exact path;
- explain the apparent cause;
- return `UNEXPECTED_REPOSITORY_MUTATION`.

## 13. Clinical and product boundary

This session validates only:

- local Release buildability;
- signing and installation;
- standalone runtime behaviour;
- basic preservation of the simulator-accepted user interface.

It does not validate:

- clinical meaning of P1 or P2;
- clinical ranges or decision thresholds;
- diagnostic suitability;
- clinical inference;
- ontology/SWRL/Openllet behaviour;
- treatment recommendations;
- live API integration;
- tester distribution readiness.

Record clinical logic as:

NOT CLINICALLY VALIDATED — PENDING ACR CLINICAL-PARTNER REVIEW

Do not translate simulator or physical-device UI acceptance into clinical
approval.

## 14. Required evidence report

Return the report using this structure:

# MOB-P1P2-IOS-STANDALONE-001 Evidence Report

## Terminal state
Use exactly one terminal state from the permitted list.

## Baseline
- Repository:
- Branch:
- Accepted application implementation SHA:
- SESSION_BASELINE_SHA supplied by Kraken:
- Full HEAD:
- Full upstream SHA:
- Accepted application implementation is an ancestor of HEAD: YES/NO
- Ahead/behind:
- Initial working-tree state:

## Toolchain
- macOS:
- Xcode:
- Selected developer directory:
- iOS SDK:
- Node:
- Local Expo CLI:

## Target device
- Device:
- iOS:
- Developer Mode:
- Trust/pairing:
- Xcode recognition:

## Native project
- Workspace/project:
- Scheme:
- Configuration:
- Bundle identifier:
- Signing style:
- Team category:
- Relevant entitlements:

## Provisioning
- Profile category:
- Profile validity/expiry:
- Device registration result:
- Paid membership required for this build: YES/NO
- Warnings:

## Metro/Expo independence
- Metro process before build:
- Action taken:
- Metro port after action:
- Expo Go used: YES/NO
- Development launcher used: YES/NO
- JS/assets embedded in Release build: EVIDENCED/NOT EVIDENCED

## Build and installation
- Exact command/action:
- Start/finish:
- Exit result:
- Significant warnings:
- Installation result:
- ACR icon detected:

## Standalone launch
- Metro stopped:
- Automated launch:
- Runtime errors:
- Physical launch with USB disconnected:
- Force-close/relaunch:
- Device-restart/relaunch:

## Functional smoke test
- Home/Welcome:
- Two About pages:
- Five assessment pages:
- Review screen:
- English:
- French:
- Chinese:
- Arabic RTL:
- P1/P2 provisional labelling:
- Result:

## Repository integrity
- Final branch:
- Final HEAD:
- Upstream comparison:
- Final Git status:
- Tracked changes:
- Unexpected files:

## Acceptance matrix
For every criterion report PASS, PARTIAL, FAIL or NOT_EVIDENCED:

- Exact session repository baseline
- Accepted application implementation commit is an ancestor of the session
  baseline
- Target device recognised
- Release build succeeded
- Development signing succeeded
- Application installed
- ACR icon present
- Metro stopped
- No Expo Go
- No development launcher
- Launch from ACR icon
- Launch after force-close
- Launch after USB disconnection
- Basic five-page assessment flow
- Two-page About flow
- Arabic RTL smoke check
- Repository remained clean
- Clinical validation explicitly excluded

## Deviations and residual risks
Include:

- seven-day Personal Team profile expiry, if applicable;
- any warning affecting future rebuilds;
- any UI item not exercised on the physical device;
- any distribution limitation;
- any unresolved defect.

## Clinical status
NOT CLINICALLY VALIDATED — PENDING ACR CLINICAL-PARTNER REVIEW

## Proposed next action
Propose one next action only. Do not perform it.

## 15. Permitted terminal states

Use only one of:

- READY_FOR_KRAKEN_PHYSICAL_IOS_REVIEW
- IOS_STANDALONE_ACCEPTED
- BLOCKED_BASELINE
- BLOCKED_DEPENDENCIES
- BLOCKED_XCODE_DEVICE_SUPPORT
- BLOCKED_SIGNING_CONFIGURATION_CHANGE
- BLOCKED_SIGNING_ENTITLEMENT
- BUILD_FAILED
- INSTALL_FAILED
- STANDALONE_RUNTIME_FAILED
- UNEXPECTED_REPOSITORY_MUTATION

`IOS_STANDALONE_ACCEPTED` is legal only after:

- the Release build succeeds;
- installation succeeds;
- Metro is stopped;
- the application opens from its ACR icon;
- Expo Go and the development launcher are absent;
- the app opens after USB disconnection;
- the repository remains clean;
- Kraken confirms the manual checklist.

Do not commit, push, merge or begin Android work.
