# ACR Companion for iOS — TestFlight procedure (private distribution)

**Applies to:** v0.6.7 · Apple Developer Program team **X9QB4QT8NH** ("Kraken YU") · Xcode 26.3
**Written:** 18 September 2026 · **Updated:** 6 October 2026
**Status:** **Phases A, B and C complete.** v0.6.7 (Build 49), `com.acragent.companion`, client
identity `mob-v0.6.7+49`, uploaded 20 September 2026 and processed by Apple. Internal testing is
proved end to end: the build installed on Kraken's iPhone 13 through TestFlight in the `CRIL` group,
paired with a fresh invite code and ran as designed. **The build stops opening around 19 December
2026** (90 days from upload).

**Submitted for Beta App Review 1 October 2026, 20:49 — REFUSED 2 October, 11:00,
Guideline 2.2 (Beta Testing).** Apple never opened the app: the gateway log recorded no redemption at
all. They read the submitted notes, which said the app "is not offered for sale or public download",
and concluded TestFlight was the wrong channel for it. Submission `ff4218f6-196f-4b54-88e9-9f3f9f2c21a9`.

**That sentence was wrong about the product.** ACR Companion *is* intended for App Store release;
access to the live reasoner is what stays controlled, by invite code. D4, D5 and D7 were rewritten on
3 October to say so, and to lead with the demonstration mode — all five screens and twenty fields
work with no code and no backend, which the original notes never mentioned.

**Build 50 was submitted 3 October 14:31 with the rewritten notes and REFUSED AT 15:42 — 71 minutes,
Guideline 2.2 again, the message word for word identical.** Submission
`0993c8f7-28d5-4915-8170-77388b5d56d2`. The gateway log for that window records **no app traffic of
any kind**: no redemption, no session, no request. Nobody opened it.

**So the notes were never the deciding factor.** Two rewrites changed nothing. The likeliest cause is
the **app record itself**: no App Store listing, no screenshots, no category, no age rating, no
pricing, and no App Store submission ever made. An app in that state reads as a private tool whatever
the notes say, and Apple has now twice pointed at Apple Business Manager. This is inference, not
established fact — Apple has not said so.

**External TestFlight is treated as closed.** A third attempt on the same guideline with no
substantive change is the risk Apple's own message names: *"Apps that violate the intended purpose of
the TestFlight program may risk being removed from the program."*

**The route is undecided as of 3 October evening.** Four options were put to Kraken: reply in the
rejection thread and ask what would satisfy Apple; internal TestFlight, which works today and needs
no review; **Ad Hoc**, which needs no Apple review ever, lasts up to 365 days, and needs a device UDID
from each reviewer; or building a full App Store listing and pursuing public release, which brings
guideline 1.4.1 and 5.1.1 scrutiny of a clinical app. Kraken is taking the decision after a break.

Phase E remains the internal route. Internal testing was never affected by the refusal, and a build
marked **Rejected** in App Store Connect is still installable by internal testers — the rejection
applies to external testing only. **Attach Build 50, not Build 49**, for the reason given in E4.

**Identifiers in this document:** phase steps are `A1…`, `B1…`, `C1…`, `D1…`, `E1…`, `X1…`, `F1…`.
The three decisions are `DEC-1`, `DEC-2`, `DEC-3`. They were `D-1`, `D-2`, `D-3`, which was too close
to the Phase D steps; renamed 28 September 2026. The external route was written out as **Phase X** on
29 September 2026, having previously been only a list of differences from Phase E. There is no other
numbering anywhere in this procedure.

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

### DEC-1 — the bundle identifier — **decided, 18 September 2026: `com.acragent.companion`**

The app carried `com.anonymous.acr-mobile-companion`, the placeholder Expo writes when no identifier
is chosen. **A bundle identifier is permanent**: once a build is uploaded, Apple ties it to the app
record for ever, it cannot be renamed, and it cannot be reused by another app.

`com.acragent.companion` is the identifier the Android build already uses, under a domain CRIL
controls; the two stores are separate namespaces, so there is no conflict. It is now set in
`app.json`, in `ios/ACRCompanion.xcodeproj/project.pbxproj` and in the `Info.plist` URL scheme.

**Consequence, unavoidable whichever identifier was chosen:** the iPhone 13 must delete the app it
has now and redeem a fresh invite code. iOS refuses to install over an app signed by a different
profile, so the current development build has to go, and with it the stored session.

### DEC-2 — internal or external testers — **decided: internal first, external after**

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

### DEC-3 — the name shown to testers

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
**Explicit**. Description `ACR Companion`. Bundle ID: the identifier chosen in DEC-1. **Enable no
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
App Store Connect → **Apps** → **+** → New App. Platform **iOS**; name from DEC-3; primary language
**English (UK)**; bundle ID from DEC-1 (it appears in the list once A4 is done); SKU
`ACR-COMPANION-001` (internal only, never shown); user access **Full Access**.

---

## 4. Phase B — repository changes (Claude, about 30 minutes)

Done on a branch, reviewed by Kraken, committed as one change. Kraken pushes.

| | Change | Why |
|---|---|---|
| B1 | **Done, 18 Sept.** Bundle identifier `com.acragent.companion` in `app.json`, `project.pbxproj` and the `Info.plist` URL scheme | DEC-1; `scripts/ios-testflight.sh preflight` refuses to build while the placeholder is there |
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

**D1 — export compliance. Done, 20 September 2026.** Because the app declares
`ITSAppUsesNonExemptEncryption = false`, the build passed straight through. If ever asked: the app
uses only standard HTTPS/TLS provided by iOS and holds no proprietary cryptography, so it is exempt.

**D2 — internal testing first. Done, 20–21 September 2026.** Build 49 was added to the `CRIL`
internal group with Kraken's own Apple ID, installed on the iPhone 13 through TestFlight, paired with
a fresh invite code and ran as designed.

**D3 — test information** (external testing only, and required before it can start):

- Feedback e-mail: `info@acragent.com`
- Marketing URL: `https://www.acragent.com`
- **Privacy policy URL — written, not yet published.** `privacy.html` exists, with
  `terms.html`, `ethics.html` and `accessibility.html`, in the `acr-test-website` working copy, and
  the four links at the foot of the home page point at them. **They are not on the live site**, so
  the URL `https://www.acragent.com/privacy.html` does not resolve yet. Until that FTP publication
  happens, external testing cannot be started. Internal testing is unaffected.

> **How to use D4, D5 and D7.** Each gives one block of indented text. **Paste the indented text
> only** — the headings, dates and explanations around it are for us, never for Apple. In D5,
> replace `[CODE]` with the live invite code before saving.

**D4 — "What to test", rewritten 3 October 2026** (third revision — now with the actual
navigation, checked against the build):

> **Reaching the walk-through**
>
> 1. Open ACR Companion. The opening poster appears. **READ DETAILS** on that poster opens the
>    reviewer manual, which is also in **About**, in eight languages.
> 2. Continue to **Before you begin**. It carries the notice that only synthetic data may be used.
>    Tap **I understand — Begin**.
> 3. The **Evaluation access** screen appears. Set the mode selector to **Synthetic demonstration**.
>    The alternative setting is for invited clinical reviewers holding an access code.
> 4. Continue into the assessment.
>
> **The five screens and the twenty fields**
>
> 5. **Receptor status** — then **Next**.
> 6. **Tumour characteristics** — then **Next**.
> 7. **Biomarkers** — then **Next**.
> 8. **Provisional P1** — then **Next**.
> 9. **Provisional P2** — then **Next**.
> 10. **Review** — "Confirm entries before submission". Check every entry, then **Submit**.
>
> **What we would like you to look at:** the wording of each parameter, the order the questions are
> asked in, the explanation given for each one, and whether anything differs from what you would
> expect clinically. The language can be changed at any time from the opening screen; all eight are
> worth a glance.
>
> **About results.** Entering and reviewing all twenty fields needs no account, no code and no
> network connection. **Returning a result does** — whether live inference or the stored
> demonstration case, both are produced by our research service. Without a code the app completes the
> whole walk-through and states plainly that no result can be returned. That is correct behaviour and
> not a fault. If you have been given an optional access code, enter it at **Evaluation access** to
> see a result with its full explanation.

**D5 — App Review information, rewritten 3 October 2026** (second revision, external testing only):

> **No account or sign-in is needed to use and assess this app.**
>
> An optional access code, if you wish to see a result as well: **[CODE]**
>
> ACR Companion is intended for public release on the App Store. It is a practice and reference
> companion to the ACR Platform research website, for clinicians, multidisciplinary team members,
> clinical researchers and students.
>
> Open the app and walk through all five
> screens and all twenty fields: receptor status, tumour characteristics, biomarkers, and two
> provisional assessments, ending at a review screen. This needs no code and no network connection.
>
> To reach it: opening poster → **I understand — Begin** → on **Evaluation access** choose
> **Synthetic demonstration** → the five screens → **Review**.
>
> **Returning a result is a separate, optional service.** Both live inference and the stored
> demonstration case are produced by our research reasoning service, for invited clinical reviewers
> holding an access code. Without one the app completes the whole walk-through and states that no
> result can be returned — correct behaviour, not a fault. If you would like to see a result as well,
> an optional code is: **[CODE]**
>
> The app is a research prototype under clinical evaluation. It is not a medical device, it makes no
> diagnostic claim, and every screen carries a notice saying so. It is not intended for use with real
> patients and no patient data should be entered.

**Editorial note — NOT for Apple. Do not paste anything below this line into any field.**

> **Why these were rewritten, twice.** The originals said the app "is not offered for sale or public
> download" and described it only as a research prototype. Apple read that, concluded TestFlight was
> the wrong channel, and refused the build under **Guideline 2.2 — Beta Testing** without ever opening
> it. That sentence was true of the evaluation but wrong about the product: ACR Companion **is**
> intended for App Store release.
>
> The second revision, the same day, went further. The app's function is now stated as what it
> actually is — **a practice and reference companion to the ACR Platform website**, complete and
> working with no account, no code and no network. The reasoner is disclosed but demoted to an
> optional extra. Kraken's reasoning, and it is right: claiming the reasoner as core functionality
> opens two fronts Apple cannot verify — the invite code and a backend that runs on a laptop — and
> invites a **Guideline 2.1** refusal for incomplete functionality the moment either is unavailable.
> Defined as a reference companion, nothing is missing and there is no 2.1 case to answer.
>
> **The reasoner is disclosed, not hidden.** The app contains a visible access screen and a reviewer
> will find it; undisclosed functionality is its own refusal. It is named in all three texts as an
> optional service for invited clinical reviewers.

**D6 — the tester group. Done, 20 September 2026.** The internal group is named `CRIL`. **The public
link stays switched off.** A public link would make the build available to anyone holding the URL,
which is exactly what must not happen.

**D7 — "Beta App Description", rewritten 3 October 2026** (second revision; added 1 October). A
separate field from D4, on the same Test Information page. D4 says what to *do*; this says what the
app *is*. It is shown to testers in TestFlight, so it is written for them, not for Apple:

> ACR Companion is a practice and reference companion to the ACR Platform, a clinical research
> website for breast cancer assessment, developed by Cornerstone Research International Ltd with
> University College Dublin, Ireland, and Zhengzhou University, People's Republic of China.
>
> It guides you through five structured screens covering the twenty assessment parameters used in the
> pathway — receptor status, tumour characteristics and biomarkers — explaining what each one is and
> how they relate to one another. It is a way to learn and rehearse the assessment, in eight
> languages.
>
> It is intended for release on the App Store for clinicians, multidisciplinary team members,
> clinical researchers and students.
>
> **The whole walk-through works without an account, without a code and without a network
> connection**: all five screens, all twenty fields, every explanation, and the reviewer manual in
> eight languages.
>
> Returning an assessment result is a separate service. Invited clinical reviewers can be given an
> access code that connects the app to our research reasoning service, for live inference or for a
> stored demonstration case. Without a code the app completes the walk-through as designed and says that no
> result can be returned.
>
> It is a research prototype under evaluation. It is not a medical device, it makes no diagnostic
> claim, and it must not be used in the care of any patient. No patient data should be nor allow entered at any
> point.

**On the other fields of that page:** screenshots and an app category belong to the **App Store
listing**, not to Beta App Review, and are not required for external testing. If App Store Connect
asks for them, check that the page really is Test Information. Fill only what Apple marks as
required; leave the rest empty rather than inventing content.

**On a licence agreement:** none is supplied. Apple's standard licence covers a TestFlight build, and
the app's own terms are published at `https://www.acragent.com/terms.html` and linked in the app. Do
not confuse this with the **Program License Agreement** at A2, which is Apple's agreement with CRIL
as a developer and was accepted long ago.

---

## 7. Phase E — inviting one reviewer

**Route in force today: internal testing.** External testing is treated as closed after two refusals
under Guideline 2.2 on 2 and 3 October 2026; a reply was sent in the rejection thread and no answer
had arrived by 5 October. (This paragraph previously said external was blocked pending the privacy
page — that was published on 30 September and is no longer the obstacle.) An internal tester must hold a user account on the Apple team — that is Apple's rule,
not a choice — so every reviewer invited this way sees the ACR Companion app record in App Store
Connect. Limits: **100 internal testers per app, 30 devices each.** No Apple review, so a reviewer can
be running the app within minutes.

Everything in E2 to E4 happens at **[appstoreconnect.apple.com](https://appstoreconnect.apple.com)**,
signed in as Kraken. Apple moves these labels from time to time; the names below are what they read
in September 2026.

**E1 — collect two things from the reviewer, in writing.** Their **full name**, and the **e-mail
address of their Apple Account**. It must be the address their Apple Account already uses, or one
they are willing to create an Apple Account with — an invitation sent to any other address cannot be
accepted. Nothing else about them is needed. Record the person in the private reviewer list outside
this repository; **no reviewer name, e-mail or hospital ever goes into the repository.**

**E2 — invite them onto the team.**
**Users and Access** (top of the page) → the **Users** tab → the **+** button.

- **First name**, **Last name**, **Email** — exactly as given in E1.
- **Role: Customer Support.** This is the lightest role Apple allows for a TestFlight tester. Do not
  choose Admin, App Manager or Developer for a reviewer.
- **Apps: Selected Apps only → tick ACR Companion.** Never "All Apps".
- Leave **Access to Certificates, Identifiers & Profiles** and any cloud signing option **unticked**.
- **Invite.**

The reviewer receives an e-mail from Apple and must accept it and sign in before they can be added as
a tester. Until they do, they appear as **Pending** on the Users tab. If the invitation lapses, use
the same page to send it again.

**E3 — add them to the tester group.**
**Apps** → **ACR Companion** → the **TestFlight** tab → under **Internal Testing** in the left
sidebar, the **`CRIL`** group → **Testers** → **+** → tick the reviewer → **Add**.

**E4 — make sure a build is attached to the group.** In the same group, **Builds** must list
**0.6.7 (50)**. If it does not, **+** → select it. Apple e-mails the tester as soon as a build is
attached.

> **It must be Build 50, not Build 49.** The gateway pins `ACR_EXPECTED_CLIENT_BUILD_ID` to
> `mob-v0.6.7+50`, and `session-store.js` lets a *previous* build keep an existing session but
> **never pair a new device**. A reviewer on Build 49 would install and run the demonstration mode
> perfectly, then be refused at E7 with a 403 `CLIENT_BUILD_MISMATCH` the moment they entered their
> invite code — and nothing on screen would explain why. Build 50 being marked **Rejected** does not
> affect this: that applies to external testing only.

**E5 — the reviewer installs the app.** They install Apple's **TestFlight** app from the App Store
(iOS 14 or later), open Apple's e-mail on the iPhone, tap **View in TestFlight**, then **Install**.
**If they still have a cabled development build of ACR Companion, they delete it first** — iOS
refuses to install over a copy signed with a different profile, and the old stored session goes with
it.

**E6 — issue the gateway invite code.** This has nothing to do with Apple. With T1 to T4 running,
**Claude** runs, on Kraken's request:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db \
ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
  node src/auth/invite-admin.js issue --org ZZU --label reviewer-03 --issued-by Kraken
```

> **Both environment variables are required.** Without them the tool falls back to the Build 45
> paths (`~/.acr-gateway/build45-*`), where an empty database still sits. It would issue a
> perfectly valid-looking code that the live gateway then rejects, with nothing to say why.

`--org` must be one of `ZZU`, `UCD`, `HKU`, `CRIL`, `TEST`. `--label` takes letters, digits, `-` and
`_` only, up to 64 characters: use a number, never a person's name. The code is printed **once**, is
stored nowhere, and is never written to a file, a report or a commit. Losing it costs nothing — issue
another.

**E7 — deliver the code and confirm.** Kraken sends the code through the agreed private channel, not
in the same e-mail as the TestFlight invitation. The reviewer enters it within **7 days**; the
session then lasts **30 days** and is bound to that one device. A second device, or the WeChat
mini-program, needs its own code. In App Store Connect the tester's status moves to **Installed** once
they open the build, which is the only confirmation Apple gives.

## 8. Phase X — external testing

**Route in force from 29 September 2026.** The four legal pages are live on `www.acragent.com`, which
was the only thing blocking this route. External reviewers are invited **by e-mail address alone**:
they hold no account on the Apple team, see nothing but the app, and cannot reach the app record.
Limits: **10,000 external testers, 30 devices each.**

External testing replaces Phase E for everyone outside CRIL. Phase E stays in this document for the
internal route, which is still the right choice for CRIL's own people and needs no Apple review.

**X1 — confirm the privacy page still resolves.** `https://www.acragent.com/privacy.html` must return
a page, not an error. Apple re-checks the URL, and a dead link fails the review. Verified live on
29 September 2026, together with `terms.html`, `ethics.html` and `accessibility.html`.

**X2 — fill in the test information.** TestFlight tab → **Test Information**. Feedback e-mail
`info@acragent.com`, marketing URL `https://www.acragent.com`, privacy policy URL
`https://www.acragent.com/privacy.html`. Paste the "What to test" text from **D4**, and the "Beta App
Description" text from **D7** — they are two different fields and two different drafts. These fields
are required for external testing and are not asked for on the internal route.

**X3 — the review notes, and an optional code.** Put the text drafted at **D5** into **App Review
Information**. Issue a gateway invite code (**E6**, `--org CRIL --label apple-review-01`) and put it
in the notes as an **optional** extra, in the words D5 uses.

> **Leave "Sign-In required" unticked.** The app needs no account: all five screens and all twenty
> fields work with no code and no network. Ticking that box tells Apple the app is gated when it is
> not, and it was ticked on the refused submission of 1 October. The code belongs in the Notes,
> described as optional — not in the user name and password fields.

> **If the code is offered, keep T1 to T4 up for the whole review window.** A reviewer who is given a
> code, tries it, and meets a dead service forms a worse impression than one who was never offered
> it. A code is redeemed within 7 days and binds to the first device, so issue a fresh one for any
> resubmission.

**X4 — create the external group.** TestFlight → **External Testing** → **+**. Name it for the
institution, e.g. `ZZU External`. **Leave the public link switched off.** A public link makes the
build installable by anyone holding the URL, which is exactly what must not happen.

**X5 — submit the build for Beta App Review.** Attach the current build — **0.6.7 (50)** — and submit.
**24 to 48 hours.** Required once per **version string**, not per build: later builds of 0.6.7 reach
external testers without a further review unless the change is substantial.

> **Keep T1 to T4 up for the whole review window.** Apple's reviewer will open the app and sign in.
> If the backend is down they reject it for "unable to sign in". T1 and T2 are Kraken's to start;
> Claude may start T3 and T4.

**X6 — once approved, add the reviewers.** Take each name and Apple Account address from the review
queue at `https://www.blockenergy.net/ios-review.php`, then in the external group → **Testers** →
**+** → **Add New Testers**, by e-mail address. There is no Users and Access step, no role and no
team membership: **E2 does not apply on this route.** Apple e-mails each tester as soon as a build is
attached to the group.

**X7 — the reviewer installs the app.** Exactly as **E5**: Apple's **TestFlight** app from the App
Store, then **View in TestFlight** → **Install** from Apple's e-mail. **Any older ACR Companion is
deleted first** — iOS refuses to install over a copy signed with a different profile, and the stored
session goes with it.

**X8 — deliver the invite code, then mark them invited.** Exactly as **E6** and **E7**: the code goes
through the agreed private channel, never in the same message as Apple's invitation. Then set the
person to **Invited** in `ios-review.php`, so the queue shows at a glance who is still waiting.

### The review queue

Requests arrive from the download page and are held in `~/sites/private/ios-requests.json` on the
blockenergy.net server. `https://www.blockenergy.net/ios-review.php` is the human interface to it:
sign in with an ACR Platform account that is listed in the `ios_admins` table, mark each request
**Approved — external**, **Approved — internal** or **Declined**, and mark **Invited** once Apple has
actually sent the invitation. Nothing is deleted; every change is recorded in
`~/sites/private/ios-reviews.log`. The **Reviewers** tab of the same page controls who may open it.

**Nothing in that queue reaches Apple on its own.** Adding a tester stays a deliberate human action in
App Store Connect.

---

## 9. Phase F — while the evaluation is running

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

## 10. What must not happen

- No **Submit for Review** for the App Store, and no public TestFlight link, at any time.
- No tester added who is not on Kraken's approved list.
- The `.p8`, the `.p12`, the issuer ID and any invite code are never committed, never published and
  never quoted in a report.
- Xcode must never renumber the build: the gateway accepts one exact client identity.
- No capability is added to the App ID unless the app genuinely needs it.

---

## 11. Every later build

1. Bump the build number in `app.json` (version only when the app really changes version).
2. Update `ACR_EXPECTED_CLIENT_BUILD_ID` and move the old value into `ACR_PREVIOUS_CLIENT_BUILD_IDS`.
3. `scripts/ios-testflight.sh` — preflight, archive, upload.
4. Add the processed build to the tester group. Internal testers get it at once; external testers get
   it after Beta App Review, which is quick for a build that only changes the build number, and is
   **not** needed again within the same version string unless the change is substantial.

---

## 12. Open risks

| Risk | Likelihood | What it would look like | Mitigation |
|---|---|---|---|
| **Guideline 2.2 — the app does not look bound for public release** | **happened, 2 Oct 2026** | Refused without the app being opened; the reason is the submitted notes, not the build | The notes must state that App Store release is intended and that the demo mode needs no code. D4, D5 and D7 rewritten 3 October. **This row was missing when the first submission went in** — the table anticipated a clinical objection and not a distribution-model one |
| Beta App Review queries the clinical nature of the app (App Store guidelines 1.4.1, 5.1.1) — external route only | moderate, and more likely now the notes describe clinicians as the audience | Rejection asking for regulatory documentation or a claim to be removed | The not-a-medical-device wording in D5 and D7 is written for this. If it is still queried: keep the evaluation on **internal** testers, where no review takes place |
| Resubmitting externally without changing the notes | — | Apple's refusal warns that apps misusing TestFlight "may risk being removed from the program" | Never resubmit the same notes. Change something real first |
| The backend is down when Apple's reviewer opens the app | **high, if not planned for** | Rejection for "unable to sign in" or a non-functional app | Keep T1–T4 up for the whole review window, and say so in the review notes |
| ~~Privacy policy URL not published~~ | **closed, 29 Sept 2026** | External testing could not be started at all | The four legal pages are live on `www.acragent.com`. Re-check the URL before each submission (X1) |
| Internal reviewer sees the app record in App Store Connect | certain, on the internal route only | A ZZU reviewer holds a Customer Support account on the team | Now avoidable: invite outside reviewers through **Phase X**, where no team account exists. Move anyone already on the internal route |
| Apple's reviewer has no invite code | **high, if X3 is skipped** | Beta App Review rejected, reading as though the app cannot sign in | Put a live code in the App Review notes at X3, and check it has not lapsed before resubmitting |
| A reviewer's Apple address differs from their website account | moderate | The TestFlight invitation goes to a mailbox they do not watch | The download page asks for the Apple address separately; `ios-review.php` shows both, and re-opens an approval if the address later changes |
| **EU Digital Services Act — trader status not declared** | **notice received, 6 Oct 2026** | App Store Connect refuses new submissions for EU distribution, and apps already on the EU App Store are removed | **Does not affect this project today.** Apple's own page excludes TestFlight: *"If you don't distribute apps on the App Store in the EU (for example you only distribute apps through alternative distribution, or TestFlight, or on the App Store only outside the EU), you're not acting as a trader on the App Store."* ACR Companion has never had an App Store listing, so there is nothing to remove. The declaration must still be answered to clear the notice. **Check the membership type first** (App Store Connect ▸ Membership): on an *Individual* account, declaring trader publishes a personal address, phone and e-mail on the public product page; on an *Organization* account it publishes the company address from the D-U-N-S record. Settle this before any public release |
| Bundle identifier regretted later | low | Cannot be changed; a new app record and every tester re-invited | Take DEC-1 deliberately, now |
| Distribution certificate or `.p8` lost | low | No upload possible until replaced; the `.p8` cannot be re-downloaded | Back both up to `~/.acr-signing` on the day they are created |
| Build expiry passes unnoticed | moderate | Reviewers locked out silently at 90 days — Build 49 stops opening around **19 December 2026**, Build 50 around **1 January 2027** | Diary both dates now; upload a fresh build before the earlier one (§11) |
