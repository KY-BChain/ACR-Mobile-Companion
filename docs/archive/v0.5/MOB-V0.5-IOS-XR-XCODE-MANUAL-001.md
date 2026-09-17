# MOB-V0.5-IOS-XR-XCODE-MANUAL-001

## Manual Xcode installation on iPhone XR / iOS 18.7.9

This procedure installs the accepted UI-only ACR Companion app on the physical
iPhone XR using Xcode. Codex is not required to operate Xcode for this task.

## 1. Fixed source baseline

Repository:

```text
/Users/Kraken/DAPP/acr-mobile-companion
```

Branch and accepted commit:

```text
feature/mobile-v0.5-p1-p2
808565d69a2ca6253c63bc0167b5f2cd39705818
```

The iPhone XR build must initially use this exact accepted source unless a
specific iOS 18 compatibility defect is demonstrated.

## 2. Before opening Xcode

### Step 2.1 — Verify the repository

Open Terminal and run:

```bash
cd ~/DAPP/acr-mobile-companion

git branch --show-current
git rev-parse HEAD
git rev-parse origin/feature/mobile-v0.5-p1-p2
git rev-list --left-right --count HEAD...origin/feature/mobile-v0.5-p1-p2
git status --short --branch
```

Required result:

```text
feature/mobile-v0.5-p1-p2
808565d69a2ca6253c63bc0167b5f2cd39705818
808565d69a2ca6253c63bc0167b5f2cd39705818
0 0
clean working tree
```

Stop if the branch, SHA, upstream or cleanliness differs.

### Step 2.2 — Stop development services

1. Quit the iPhone simulator.
2. Confirm Metro is stopped.
3. Close any terminal process still running `expo start`.
4. Do not start Expo Go.
5. Keep the MacBook connected to power.

The Release build must embed its Hermes JavaScript bundle and must not depend
on Metro after installation.

### Step 2.3 — Confirm the existing native workspace

In Finder or Terminal confirm this file exists:

```text
ios/ACRCompanion.xcworkspace
```

Open the `.xcworkspace`, not the `.xcodeproj`:

```bash
open ios/ACRCompanion.xcworkspace
```

Do not run Expo Prebuild and do not reinstall Pods for this compatibility
installation unless Xcode demonstrates a specific missing-workspace or Pods
failure.

## 3. Prepare the iPhone XR

### Step 3.1 — Connect and trust

1. Connect the iPhone XR to the MacBook by USB cable.
2. Unlock the iPhone.
3. If the iPhone displays **Trust This Computer?**, tap **Trust**.
4. Enter the iPhone passcode.
5. Keep the phone unlocked while Xcode prepares it.

### Step 3.2 — Make Xcode recognise the device

In Xcode:

1. Open **Window > Devices and Simulators**.
2. Select **Devices**.
3. Confirm the iPhone XR appears and shows iOS 18.7.9.
4. Wait while Xcode completes any device preparation.
5. Do not continue while Xcode reports the device as unavailable or preparing.

### Step 3.3 — Enable Developer Mode if required

If Xcode reports **Developer Mode disabled**:

1. On the iPhone open **Settings > Privacy & Security**.
2. Scroll to **Developer Mode**.
3. Turn it on.
4. Accept the required restart.
5. After restart, unlock the phone and confirm **Turn On**.
6. Reconnect the cable if necessary.
7. Return to Xcode **Devices and Simulators** and confirm the device is
   available.

If the Developer Mode option is initially absent, leave the phone connected
while Xcode attempts device preparation, then check the setting again.

## 4. Check the Xcode target without changing it

### Step 4.1 — Select the application target

1. In the Xcode Project navigator, select the blue **ACRCompanion** project.
2. Under **TARGETS**, select **ACRCompanion**.
3. Open the **General** tab.

Confirm:

- the application identity is ACR Companion;
- the bundle identifier remains the existing accepted identifier;
- the app icon is present;
- the minimum iOS deployment target is not higher than iOS 18.7.9.

Do not change the bundle identifier, app name, icon, capabilities or deployment
target merely to make the build proceed.

If the deployment target is higher than 18.7.9, stop. Lowering it is a tracked
compatibility change that requires a separate source change and verification;
it is not part of a simple installation.

### Step 4.2 — Confirm signing

Open **Signing & Capabilities** and confirm:

1. **Automatically manage signing** is enabled.
2. The same Personal Team used for the successful iPhone 13 build is selected.
3. Xcode shows no signing error.
4. The bundle identifier remains unchanged.

When the new iPhone XR is connected, allow Xcode automatic signing to register
the device and create or update the development provisioning profile. Do not
manually edit provisioning files in the repository.

If Xcode asks you to sign into the Apple Account already used for development:

1. Open **Xcode > Settings > Accounts**.
2. Select or add the correct Apple Account.
3. Return to **Signing & Capabilities**.
4. Re-select the correct Personal Team.

Do not expose the Apple Account password, signing certificate or complete
device identifier in documentation or chat.

## 5. Select a Release run configuration

### Step 5.1 — Select the physical destination

In the device selector at the top of Xcode:

1. Select the **ACRCompanion** scheme.
2. Select the connected **iPhone XR** as the run destination.
3. Confirm that a simulator is not selected.

### Step 5.2 — Set Run to Release

1. Select **Product > Scheme > Edit Scheme**.
2. Select **Run** in the left column.
3. Open the **Info** tab.
4. Set **Build Configuration** to **Release**.
5. Leave the executable as the existing ACRCompanion application.
6. Click **Close**.

If Xcode records this as a tracked shared-scheme change, do not commit it as
part of the compatibility installation. Record the path and decide separately
whether the project intentionally standardises Run as Release.

## 6. Build and install

### Step 6.1 — Build

1. Keep the iPhone connected and unlocked.
2. Select **Product > Build** or press **Command-B**.
3. Wait for **Build Succeeded**.
4. If the build fails, open the Report navigator and identify the first causal
   error. Do not change multiple settings speculatively.

The Expo bundle phase may invoke the Metro transformer internally to create the
embedded Hermes bundle. This is local build processing; it is not a listening
Metro development server.

### Step 6.2 — Install and launch

1. Select **Product > Run** or press **Command-R**.
2. Xcode builds the Release configuration, signs it, installs it and launches
   it on the iPhone XR.
3. If the iPhone requests trust for the developer identity, follow the displayed
   device instructions under **Settings > General > VPN & Device Management**.
4. Confirm the ACR app icon appears on the iPhone Home screen.
5. Confirm the Home/Welcome screen opens.

## 7. Prove that the installation is standalone

1. Stop any Metro process on the Mac.
2. Force-close the ACR app on the iPhone XR.
3. Disconnect the USB cable.
4. Tap the ACR app icon.
5. Confirm the Home/Welcome screen appears and remains responsive.

Failure at this point means the build is not accepted as standalone, even if it
worked while Xcode was attached.

## 8. Minimum physical compatibility test

Use synthetic/demo values only.

1. Open Home in English and confirm LTR presentation.
2. Select Arabic and confirm immediate RTL with no freeze.
3. Open both About pages.
4. Traverse Step 1, Step 2, Step 3, P1 and P2.
5. Reach Review.
6. Return Home and change back to English.
7. Select French, Chinese, German, Japanese, Korean and Russian once each.
8. Force-close and relaunch.
9. Confirm the app does not remain globally stuck in RTL.
10. Confirm the app launches again while disconnected from the Mac.

Record only observed failures or material visual differences from the accepted
iPhone 13 build.

## 9. Repository audit after Xcode

Before closing the task, run:

```bash
cd ~/DAPP/acr-mobile-companion

git status --short --branch
git status --porcelain=v1 --untracked-files=all
git diff --stat
git diff --name-only
git diff --check
```

Expected result: the repository remains clean.

If Xcode changed a tracked project, scheme, signing, plist or configuration
file, do not commit it automatically. Record the exact path and determine
whether it is a required iOS 18 compatibility change or an incidental Xcode
workspace mutation.

## 10. Completion record

Record:

```text
Source SHA: 808565d69a2ca6253c63bc0167b5f2cd39705818
Device: iPhone XR
OS: iOS 18.7.9
Configuration: Release
Signing: Personal Team development signing
Build: PASS/FAIL
Install: PASS/FAIL
Standalone launch with Metro stopped and cable removed: PASS/FAIL
Eight-language check: PASS/FAIL/PARTIAL
Arabic RTL round-trip: PASS/FAIL
Repository clean after build: PASS/FAIL
Observed compatibility defects: none/list
```

The Personal Team development profile remains time-limited. Rebuild and
reinstall when the profile expires.

## Official references

- Apple: https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices
- Apple Developer Mode: https://developer.apple.com/videos/play/wwdc2022/110344/
- Expo local builds: https://docs.expo.dev/guides/local-app-development/
