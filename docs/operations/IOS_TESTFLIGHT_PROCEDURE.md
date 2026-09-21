# ACR Companion for iOS — TestFlight procedure (private distribution)

**Applies to:** v0.6.7 · Apple Developer Program team **X9QB4QT8NH** ("Kraken YU") · Xcode 26.3
**Written:** 18 September 2026 · **Updated:** 19 September 2026
**Status:** D-1 and D-2 decided; **Phase B complete** — v0.6.7 (Build 49), `com.acragent.companion`,
client identity `mob-v0.6.7+49`, all suites green. Phase A **A1 to A4 complete and verified**;
provisioning profiles now run twelve months, not seven days. No build has been uploaded to Apple.
The next step is **A5, the distribution certificate**.

---

## 0. What this is for, and what it is not

TestFlight is used here as a **private delivery channel to named invited reviewers**, replacing the
7-day development profile that has forced a rebuild every week. It is not a release. Nothing in this
procedure puts the app on the App Store, and the App Store submission button is never pressed.

What does **not** change: the app still refuses to work without an invite code, each session is still
bound to one device, the trial banner still appears on every screen, and no real patient data is used
at any point. A TestFlight tester is in exactly the same position as a reviewer with a cabled phone,
except that Apple does the delivery.

**Three things TestFlight fixes:** builds last **90 days** instead of 7; reviewers install the app
themselves instead of bringing a phone to the MacBook; and the build that reviewers run is the same
signed artefact for everyone, recorded by Apple.

---

## 1. Who does what

| Step | Kraken | Claude |
|---|---|---|
| Apple ID, two-factor, payment, agreements | **all of it** — Claude has no access to the Apple account and must never be given it | — |
| Certificates, identifiers, API key | creates them in the browser and in Xcode | tells Kraken exactly which buttons, and checks the result from the command line |
| App Store Connect app record, tester groups, tester emails | **all of it** | drafts the text that goes in the fields |
| Repository changes (bundle ID, build number, pins, tests) | approves | **does the work** |
| Archive, verify, upload | present at the machine; types the keychain password when macOS asks | **runs `scripts/ios-testflight.sh`** |
| T1 Spring Boot, T2 `acr-api` tunnel | **starts and stops — Claude never touches these** | reports if either is down, and waits |
| T3 gateway, T4 review tunnel | may start them | may start, stop and restart them |
| Invite codes | decides who gets one and delivers it | runs the issuing command on request; never records the code |

---

## 2. The decisions

### D-1 — the bundle identifier — **decided, 18 September 2026: `com.acragent.companion`**

The app carried `com.anonymous.acr-mobile-companion`, the placeholder Expo writes when no identifier
is chosen. **A bundle identifier is permanent**: once a build is uploaded, Apple ties it to the app
record for ever, it cannot be renamed, and it cannot be reused by another app.

`com.acragent.companion` is the identifier the Android build already uses, under a domain CRIL
controls; the two stores are separate namespaces, so there is no conflict. It is now set in
`app.json`, in `ios/ACRCompanion.xcodeproj/project.pbxproj` and in the `Info.plist` URL scheme.

**Consequence, unavoidable whichever identifier was chosen:** the iPhone 13 must delete the app it
has now and redeem a fresh invite code. iOS refuses to install over an app signed by a different
profile, so the current development build has to go, and with it the stored session.

### D-2 — internal or external testers — **decided: internal first, external after**

| | Internal | External |
|---|---|---|
| Who can be added | up to 100 people, each needing an App Store Connect **user account** on Kraken's team | up to 10,000 people, added by **e-mail address only** |
| Access they get | can see the app record, builds, and depending on role more of the account | nothing but the app |
| Apple review | **none** — available minutes after processing | **Beta App Review** on the first build of each version, usually 24–48 h |
| Extra fields required | none | test information, feedback e-mail, **privacy policy URL** |

Internal first, for Kraken's own devices and anyone at CRIL, so the first build is proved end to end
within the hour without Apple review and without a privacy policy URL. External follows, as a
**private group with the public link switched off**, for the ZZU, UCD and HKU reviewers — they should
not hold accounts on the developer team.

### D-3 — the name shown to testers

The name in App Store Connect must be **unique across the entire App Store**, even for an app that is
never published. "ACR Companion" may already be taken. Fallback: **"ACR Companion (CRIL)"**. Only
testers ever see it; the name on the phone's home screen stays "ACR Companion" and is set in the app,
not by Apple.

---

## 3. Phase A — the Apple account (Kraken, about 40 minutes)

> Claude cannot do any of Phase A. Do not share the Apple ID, its password, or a two-factor code.

> **Click by click:** [IOS_TESTFLIGHT_APPLE_ACCOUNT_STEPS.md](IOS_TESTFLIGHT_APPLE_ACCOUNT_STEPS.md)
> walks through **A1 to A7** — the same identifiers used here — with the exact fields, the check to run
> after each one, and what to do when Apple's wording differs. The summary below is the *what and why*;
> that document is the *how*. **Execute from that document, not this one.**

**A1 — confirm the membership is live.**
[developer.apple.com/account](https://developer.apple.com/account) → Membership details. It should
show the programme as active, an expiry a year out, and **Team ID X9QB4QT8NH**. The Team ID does not
change when a Personal Team becomes a paid one, which is why nothing in the Xcode project needs
editing for the team.

**A2 — accept the Program License Agreement.**
App Store Connect → **Business** → Agreements. Until the current agreement is accepted, every upload
is refused with a message that does not say why. Tax and banking details are **not** needed: they
apply to paid apps, and this app is neither paid nor published.

**A3 — refresh Xcode's view of the account.**
Xcode → Settings → Accounts → select the Apple ID → the team must now read **"Kraken YU"** and not
"Kraken YU (Personal Team)". If it still says Personal Team, remove the account and add it again.
Once it is right, provisioning profiles last **12 months**, and the 25 September expiry problem is over.

**A4 — register the App ID.**
developer.apple.com → Certificates, Identifiers & Profiles → **Identifiers** → **+** → App IDs → App →
**Explicit**. Description `ACR Companion`. Bundle ID: the identifier chosen in D-1. **Enable no
capabilities** — the app's entitlements file is empty and must stay that way; every capability added
here is something Apple will ask about later.

**A5 — create the distribution certificate.**
Xcode → Settings → Accounts → the team → **Manage Certificates** → **+** → **Apple Distribution**.

> **Back it up the same day.** Keychain Access → My Certificates → the Apple Distribution certificate →
> right-click → Export → save as `~/.acr-signing/acr-companion-distribution.p12` with a strong
> password, alongside the Android release key. Apple allows only **two** distribution certificates per
> account, and the private key cannot be recovered from Apple if the Mac is lost.

**A6 — create the App Store Connect API key** (this is the "key" that has not been made yet).
App Store Connect → **Users and Access** → **Integrations** → App Store Connect API → **Team Keys** →
**+**. Name `ACR Companion upload`. Access: **App Manager**. Generate, then:

- **Download the `.p8` immediately.** Apple allows exactly one download, ever.
- Note the **Key ID** (10 characters) and the **Issuer ID** (a UUID, at the top of the page).

Then, in Terminal, put them where the build script expects them:

```zsh
mkdir -p ~/.acr-signing
mv ~/Downloads/AuthKey_XXXXXXXXXX.p8 ~/.acr-signing/
chmod 600 ~/.acr-signing/AuthKey_XXXXXXXXXX.p8
cat > ~/.acr-signing/appstore-connect.env <<'EOF'
ASC_KEY_ID=XXXXXXXXXX
ASC_ISSUER_ID=00000000-0000-0000-0000-000000000000
EOF
chmod 600 ~/.acr-signing/appstore-connect.env
```

`~/.acr-signing` is outside the repository and is where the Android signing secrets already live.
**The `.p8`, the `.p12` and the issuer ID are never committed, never pasted into chat, and never put
in a report.**

**A7 — create the app record.**
App Store Connect → **Apps** → **+** → New App. Platform **iOS**; name from D-3; primary language
**English (UK)**; bundle ID from D-1 (it appears in the list once A4 is done); SKU
`ACR-COMPANION-001` (internal only, never shown); user access **Full Access**.

---

## 4. Phase B — repository changes (Claude, about 30 minutes)

Done on a branch, reviewed by Kraken, committed as one change. Kraken pushes.

| | Change | Why |
|---|---|---|
| B1 | **Done, 18 Sept.** Bundle identifier `com.acragent.companion` in `app.json`, `project.pbxproj` and the `Info.plist` URL scheme | D-1; `scripts/ios-testflight.sh preflight` refuses to build while the placeholder is there |
| B2 | Build number **48 → 49**, version stays **0.6.7** | Apple refuses a repeated build number for ever, even for a build that was rejected. Build 49 is also the rebuild already planned for the profile expiry |
| B3 | Gateway: `ACR_EXPECTED_CLIENT_BUILD_ID=mob-v0.6.7+49`, `ACR_PREVIOUS_CLIENT_BUILD_IDS=mob-v0.6.7+48` | the Samsung and the Xiaomi keep working on Build 48 while iOS moves to 49 |
| B4 | `scripts/build48-review-service.sh` → `build49-review-service.sh`, and the call in `scripts/acr-services.sh` | the rename was missed at Build 48 and stopped T3/T4 starting |
| B5 | Version pins in `tests/`, `gateway/tests/`, `tests/mobile/completeness.verify.js` | the verifiers assert the exact build identity |
| B6 | **Done, 18 Sept.** Branch name in the header of `docs/build48-evidence/BUILD48_DEVICE_EVIDENCE_20260918.md` | named the old branch |

Then, and only then: `npm run verify:mobile`, `npm run typecheck:active`, and the gateway test suite —
all green before anything is archived.

---

## 5. Phase C — build and upload (Claude runs it; Kraken at the machine)

**Preconditions:** `/Volumes/AndroidDev` plugged in (the Xcode build products and archives live there,
not on the MacBook's 56 GB); T3 and T4 running; Phase A and Phase B complete.

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion
scripts/ios-testflight.sh preflight   # checks only, changes nothing
scripts/ios-testflight.sh archive     # archive, export the .ipa, verify it
scripts/ios-testflight.sh upload      # validate with Apple, then upload
```

`preflight` stops the run unless **all** of the following hold, and names the first one that does not:

- the bundle identifier is not the Expo placeholder, and `app.json` and the Xcode project agree on it;
- the marketing version, the build number and the team in the project match `app.json`;
- an **Apple Distribution** certificate is in the keychain;
- `~/.acr-signing/appstore-connect.env` exists, names a key and an issuer, and the matching `.p8` is
  present and mode 600;
- the review gateway origin is compiled in and **no LAN or localhost origin is**;
- `ITSAppUsesNonExemptEncryption` is `false` and the privacy manifest is present;
- `ExportOptions.plist` still forbids Xcode to renumber the build;
- the gateway answers at `https://mobile-gateway-review.acragent.com` (a warning, not a stop).

After the export, and before anything leaves the machine, the script unpacks the `.ipa` and checks
the identifier, the version, the build number, that the signature is **Apple Distribution** and
verifies, that `get-task-allow` is not set — a development build would have it — and that the shipped
bundle really points at the review gateway.

**What to expect:** the first archive will ask for the login keychain password, possibly twice —
Kraken types it. The archive takes roughly 8–15 minutes. Upload takes 2–10 minutes. Apple then
processes the build for **5–30 minutes**; it appears in TestFlight when that finishes, and any failure
arrives by e-mail to the Apple ID.

---

## 6. Phase D — App Store Connect, once the build has processed (Kraken)

**D1 — export compliance.** Because the app declares `ITSAppUsesNonExemptEncryption = false`, the
build should pass straight through. If asked: the app uses only standard HTTPS/TLS provided by iOS
and holds no proprietary cryptography, so it is exempt.

**D2 — internal testing first.** TestFlight → the build → **Internal Testing** → add Kraken's own
Apple ID. Install on the iPhone 13 and confirm: the app launches, the gateway pairs with a fresh
invite code, the poster and the notice rotate, the manual opens in all eight languages, and the
service banner behaves when T3 is stopped. **Do not proceed to external testers until this passes.**

**D3 — test information** (external testing only, and required before it can start):

- Feedback e-mail: `info@acragent.com`
- Marketing URL: `https://www.acragent.com`
- **Privacy policy URL — this does not exist yet.** Apple requires one for external testing. Section
  15 of the reviewer manual is already the right text; it needs to be put on a page at
  `www.acragent.com`. **This is a blocker for external testing and nothing else in this procedure
  resolves it.**

**D4 — "What to test", draft:**

> Invited evaluation of ACR Companion v0.6.7 (Build 49). Please work through the five screens with the
> synthetic cases in the reviewer manual, which is inside the app under READ DETAILS on the opening
> poster and in About. Report anything where the app's result, wording or explanation differs from
> what you would expect clinically. The app requires an invite code supplied to you separately. It is
> a research prototype for evaluation only: it is not a medical device, it must not be used for any
> real patient, and no patient data of any kind should be entered.

**D5 — App Review information, draft** (external testing only):

> ACR Companion is an investigational research prototype for an invited clinical evaluation. It is not
> a medical device, it makes no diagnostic claim, it is not offered for sale or public download, and
> it is not intended for use with real patients. Every screen carries a trial banner saying so.
>
> Sign-in: the app requires a one-time invite code, which is issued to each named reviewer. A code for
> review is in the notes below. The code is valid for 7 days and binds to the first device that uses it.
>
> The backend is a restricted research service. If the app reports that the service is unavailable,
> please contact info@acragent.com and we will confirm the service window.

**D6 — the tester group.** TestFlight → **Groups** → **+** → `CRIL invited reviewers`. **Leave the
public link switched off.** A public link would make the build available to anyone holding the URL,
which is exactly what must not happen.

---

## 7. Phase E — inviting one reviewer

1. **Kraken** adds the reviewer's e-mail to the `CRIL invited reviewers` group. Only names on the
   approved list; ZZU, UCD and HKU reviewers are added only after Kraken's own approval.
2. **The reviewer** installs Apple's **TestFlight** app (iOS 14 or later), accepts the e-mail
   invitation, and installs ACR Companion from it. **If they already have a cabled development build,
   they delete it first** — iOS will not install over a differently signed copy.
3. **Kraken** asks for an invite code. **Claude** runs, with the gateway up:
   ```zsh
   cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
   ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db \
   ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
     node src/auth/invite-admin.js issue --org ZZU --label "reviewer-3" --issued-by Kraken
   ```

   > **Both environment variables are required.** Without them the tool falls back to the Build 45
   > paths (`~/.acr-gateway/build45-*`), where an empty database still sits. It would issue a
   > perfectly valid-looking code that the live gateway then rejects, with nothing to say why.
   Organisations: `ZZU`, `UCD`, `HKU`, `CRIL`, `TEST`. The code is shown **once**, is stored nowhere,
   and is never written to a file, a report or a commit.
4. **Kraken** delivers the code through the agreed private channel — not by e-mail alongside the
   TestFlight invitation.
5. **The reviewer** enters it within **7 days**. The session then lasts **30 days** and is bound to
   that one device. A second device needs a second code.

---

## 8. Phase F — while the evaluation is running

- **The backend is Kraken's MacBook.** T1 and T2 are Kraken's to start; T3 and T4 come up with
  `scripts/acr-services.sh`. When they are down the app shows "Service unavailable" and a failure code —
  correct behaviour, but a reviewer who meets it without warning will report it as a fault. Tell
  reviewers the hours, or leave the services up for the window.
- **Builds expire after 90 days.** A build uploaded on, say, 21 September stops opening around
  20 December. Upload a fresh build before then, or the reviewers are locked out with no notice.
- **Retention.** `node gateway/src/auth/invite-admin.js purge` (dry run) and `--confirm` (applies)
  keeps the 30-day promise in section 15 of the manual. Run it monthly.
- **Feedback** arrives in App Store Connect → TestFlight → Feedback, including screenshots if the
  reviewer shakes the phone. It is Apple-hosted: treat anything a reviewer types there as public, and
  remind them never to enter patient details.

---

## 9. What must not happen

- No **Submit for Review** for the App Store, and no public TestFlight link, at any time.
- No tester added who is not on Kraken's approved list.
- The `.p8`, the `.p12`, the issuer ID and any invite code are never committed, never published and
  never quoted in a report.
- Xcode must never renumber the build: the gateway accepts one exact client identity.
- No capability is added to the App ID unless the app genuinely needs it.

---

## 10. Every later build

1. Bump the build number in `app.json` (version only when the app really changes version).
2. Update `ACR_EXPECTED_CLIENT_BUILD_ID` and move the old value into `ACR_PREVIOUS_CLIENT_BUILD_IDS`.
3. `scripts/ios-testflight.sh` — preflight, archive, upload.
4. Add the processed build to the tester group. Internal testers get it at once; external testers get
   it after Beta App Review, which is quick for a build that only changes the build number, and is
   **not** needed again within the same version string unless the change is substantial.

---

## 11. Open risks

| Risk | Likelihood | What it would look like | Mitigation |
|---|---|---|---|
| Beta App Review queries the clinical nature of the app (App Store guidelines 1.4.1, 5.1.1) | moderate | Rejection asking for regulatory documentation or a claim to be removed | The D5 wording is written for this. If it is still queried: keep the evaluation on **internal** testers, where no review takes place |
| The backend is down when Apple's reviewer opens the app | **high, if not planned for** | Rejection for "unable to sign in" or a non-functional app | Keep T1–T4 up for the whole review window, and say so in the review notes |
| No privacy policy URL | certain, today | External testing cannot be started at all | Publish manual section 15 at `www.acragent.com` (§6, D3) |
| Bundle identifier regretted later | low | Cannot be changed; a new app record and every tester re-invited | Take D-1 deliberately, now |
| Distribution certificate or `.p8` lost | low | No upload possible until replaced; the `.p8` cannot be re-downloaded | Back both up to `~/.acr-signing` on the day they are created |
| Build expiry passes unnoticed | moderate | Reviewers locked out silently at 90 days | Diary the date when the first build is accepted |
