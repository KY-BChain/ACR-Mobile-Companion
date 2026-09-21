# Phase A — the Apple account, click by click (A1 to A7)

Companion to [IOS_TESTFLIGHT_PROCEDURE.md](IOS_TESTFLIGHT_PROCEDURE.md) §3. That document says *what*
must exist and *why*; this one says *where to click*. **Every step here is Kraken's.** Claude has no
access to the Apple account and must never be given the Apple ID, its password or a two-factor code.

### One set of identifiers, used everywhere

[IOS_TESTFLIGHT_PROCEDURE.md](IOS_TESTFLIGHT_PROCEDURE.md) is the whole journey — account, repository
changes, build and upload, App Store Connect, inviting reviewers, running the evaluation. **This**
document expands one part of it, its Phase A, into click-by-click detail.

**A1 to A7 mean the same thing in both documents, and in anything said about them.** The procedure
states what each one is for; this document states where to click. There is no second numbering.

> **Do not renumber these.** They are referred to by name in the other document, in the build script's
> messages and in conversation. If a step is ever added, give it the next free number rather than
> shifting the others.

**Before starting:** sign in at [appstoreconnect.apple.com](https://appstoreconnect.apple.com) and at
[developer.apple.com/account](https://developer.apple.com/account) in the same browser. Both use the
same Apple ID. You are the **Account Holder**, which matters: three of these seven steps can only be
done by the Account Holder.

**Total time:** about 40 minutes, of which roughly 10 is waiting for Apple.

> **Progress, 19 September 2026.** **A1, A2, A3 and A4 are complete and verified.** Xcode's record now
> reads `teamType = Individual`, and the provisioning profile for `com.acragent.companion` issued at
> 12:05 on 19 September runs to **19 September 2027** — a full year, where the free account gave seven
> days. **A5, A6 and A7 remain.**

---

## A1 — Confirm the membership is live (2 min)

**Where:** [developer.apple.com/account](https://developer.apple.com/account) → **Membership details**.

It must show the programme as active, an expiry a year out, and **Team ID X9QB4QT8NH**. The Team ID
does not change when a Personal Team becomes a paid one, which is why nothing in the Xcode project
needed editing for the team.

> **Payment taken is not the same as enrolled.** On 18 September the membership details showed the
> payment and a one-year expiry while the enrolment was still incomplete, because a revised agreement
> was waiting to be signed. Nothing downstream worked until it was. If anything below behaves as though
> you are still on the free account, come back and check A2.

---

## A2 — Accept the Program License Agreement (5 min)

**Where:** App Store Connect → **Business** in the top row of icons.

If **Business** is not in the top row, you are signed in with a different Apple ID, or the membership
has not finished activating — wait and reload before doing anything else.

1. Open the **Agreements** tab.
2. Find the row **Apple Developer Program License Agreement**.
3. If the Status column says anything other than **Active** — usually "Pending Agreement" with a
   yellow banner at the top of the page — click **View and Agree to Terms**.
4. Tick the box confirming you have read it, then **Agree**.
5. Reload. The status must now read **Active**.

**Do not** fill in Tax forms or Bank Accounts. Those rows apply to paid apps. This app is free and is
never published, so they stay empty for ever.

> **Why this is first.** An unaccepted agreement does not produce a sensible error later. Uploads fail
> with an authorisation message that says nothing about agreements, and the cause is easy to miss.

> **What happened here, 18–19 September 2026.** Membership details already showed the payment taken and
> an expiry a year out, yet the enrolment was **not** complete, because a revised agreement was waiting
> to be signed. Nothing downstream worked until it was. Payment accepted does not mean enrolled.

---

## A3 — Make Xcode see the paid team (5 min)

**Where:** Xcode → **Settings…** (⌘,) → **Accounts**.

1. Select your Apple ID in the left column.
2. Look at the team list on the right. It must read **Kraken YU**, with Role **Agent**.
3. If it still reads **Kraken YU (Personal Team)**:
   - select the Apple ID, click **–** at the bottom left to remove it,
   - click **+** → **Apple ID** → sign in again, completing two-factor,
   - the team list rebuilds, now showing the paid team.
4. Click **Download Manual Profiles** once, to clear out anything stale.

> **Expect to need point 3.** On this Mac, opening the Accounts pane did **not** refresh anything, twice.
> Xcode holds a cached record of the membership and only rewrites it when the account re-authenticates.
> Removing and re-adding the Apple ID is the reliable route, and it is safe: it signs Xcode out and
> discards the cache, but deletes nothing from the keychain and nothing at Apple.

**Check it worked** — in Terminal:

```zsh
security cms -D -i ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles/*.mobileprovision \
  | plutil -p - | grep -E "TeamName|ExpirationDate"
```

An expiry roughly **twelve months** out means the paid membership is in force. An expiry seven days
out means Xcode is still treating this as a Personal Team — repeat point 3.

The decisive check is Xcode's own record of the membership. **Quit Xcode first** — it writes its
settings on quit — then:

```zsh
defaults read com.apple.dt.Xcode IDEProvisioningTeamByIdentifier
```

| Reads | Means |
|---|---|
| `teamType = "Personal Team"`, `isFreeProvisioningTeam = 1` | still the free account; repeat point 3 |
| `{ }` (empty) | the cache was cleared; Xcode rewrites it the next time it signs a project |
| `teamType = Individual`, `isFreeProvisioningTeam = 0` | **done** |

---

## A4 — Register the App ID (5 min)

**Where:** [developer.apple.com/account](https://developer.apple.com/account) → **Certificates, IDs &
Profiles** → **Identifiers** in the left column.

1. Click the blue **+** beside the "Identifiers" heading.
2. **Register a new identifier** → select **App IDs** → **Continue**.
3. Select type **App** → **Continue**.
4. **Description:** `ACR Companion`
   Letters, numbers and spaces only — no brackets, no full stops, no hyphens. This is an internal
   label; nobody outside the account sees it.
5. **Bundle ID:** select **Explicit** (not Wildcard) and type exactly:
   ```
   com.acragent.companion
   ```
   Copy and paste it. A typo here is permanent.
6. **Capabilities:** leave every box **unticked**. Apple pre-ticks one or two on some accounts —
   untick them. The app's entitlements file is empty and every capability left on is something Apple
   may later ask you to justify.
7. **Continue** → check the summary → **Register**.

The identifier now appears in the list. It cannot be deleted once a build has used it.

---

## A5 — Create and back up the distribution certificate (10 min)

### A5a — create it

**Where:** Xcode → **Settings…** → **Accounts** → select the team → **Manage Certificates…**
(bottom right).

1. Click **+** at the bottom left of the sheet.
2. Choose **Apple Distribution**.
3. Wait a few seconds. A row appears, dated today, named for you.
4. **Done**.

**Check it worked:**

```zsh
security find-identity -v -p codesigning | grep "Apple Distribution"
```

One line should come back. Before this step there was only `Apple Development: kyu4eu@gmail.com`.

### A5b — back it up the same day

Apple never gives you the private key again. If this Mac is lost or the keychain is wiped, the
certificate is dead and TestFlight builds stop until a new one is issued — and Apple allows only
**two distribution certificates per account**, so this is not something to redo casually.

**Where:** **Keychain Access** → **login** keychain → **My Certificates** category.

1. Find **Apple Distribution: Kraken YU (X9QB4QT8NH)**.
2. Click the ▸ arrow beside it to confirm a **private key** is nested underneath. If there is no key
   underneath, the export is worthless — the certificate was created elsewhere.
3. Right-click the certificate → **Export "Apple Distribution: …"**.
4. File format: **Personal Information Exchange (.p12)**.
5. Save as: `acr-companion-distribution.p12`, into `~/.acr-signing`
   (in the Save dialog press ⇧⌘G and type `~/.acr-signing`).
6. Set a strong password when asked, and keep it wherever the Android release key's password is kept.
7. macOS then asks for your **Mac login password** to release the key. That is expected.

```zsh
chmod 600 ~/.acr-signing/acr-companion-distribution.p12
ls -l ~/.acr-signing/
```

**Prove the backup can be reopened** — a backup nobody has ever tested is not a backup:

```zsh
/usr/bin/openssl pkcs12 -in ~/.acr-signing/acr-companion-distribution.p12 -nokeys -noout
```

Enter the password you just set. **No output and no error means it is sound.** Nothing is written and
nothing is displayed.

> **Use `/usr/bin/openssl`, Apple's own build.** Keychain Access still writes `.p12` files with
> RC2-40-CBC, an algorithm OpenSSL 3 moved into a "legacy" provider it does not load by default. A
> plain `openssl` on this Mac is version 3 and fails with
> `digital envelope routines:inner_evp_generic_fetch:unsupported … RC2-40-CBC`. **That error means the
> tool declined the algorithm, not that the file is damaged.** Either use Apple's build as above, or
> add `-legacy`:
>
> ```zsh
> openssl pkcs12 -legacy -in ~/.acr-signing/acr-companion-distribution.p12 -nokeys -noout
> ```
>
> The distinction to remember: `invalid password?` means the file was read and only the password was
> wrong. `unsupported` means the algorithm was refused before the file was ever examined.
>
> **Restoring on another Mac:** import through **Keychain Access**, which handles RC2 natively. The
> `-legacy` flag matters only when reading the file with OpenSSL.

---

## A6 — Create the App Store Connect API key (10 min)

This is the key that does not exist yet. It is what lets the build script upload without a password
and without your Apple ID ever being handed to a tool.

**Where:** in a **web browser** — not Xcode, and not developer.apple.com.
Sign in at [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Users and Access** →
the **Integrations** tab along the top → **App Store Connect API** in the left column →
the **Team Keys** tab.

> Only the Account Holder sees **Team Keys**. If you see only "Individual Keys", you are not signed in
> as the Account Holder. An Individual Key would also work, but a Team Key survives a change of person.

**Two different identifiers come out of this step. They are not the same thing:**

| | What it is | Where it appears | Looks like |
|---|---|---|---|
| **Issuer ID** | one per **team**, shared by every key | above the keys table — **only once at least one key exists** | `69a6de70-1234-47e3-e053-5b8c7c11a4d1` (36 characters, with hyphens) |
| **Key ID** | one per **key** | on that key's own row | `2X9QB4QT8N` (10 characters, no hyphens) |

1. If the page shows a **Request Access** button, click it and accept. Accounts that have never used
   the API see this first. It is immediate, not an application. **On a page with no keys yet there is
   no Issuer ID on screen** — it appears at step 6.
2. Click **+** (or **Generate API Key**).
3. **Name:** `ACR Companion upload`
4. **Access:** **App Manager**.
   Not Admin — App Manager can upload builds and manage TestFlight, and nothing else.
5. **Generate**.
6. The table now exists, and **both identifiers are on screen together**:
   - the **Issuer ID** above the table — copy it;
   - the **KEY ID** on the new row, 10 characters — copy it.
7. In the row, click **Download API Key**.

> **This download happens once, ever.** There is no second chance, no re-download, no recovery. If it
> is lost, the key must be revoked and a new one generated. The file lands in `~/Downloads` as
> `AuthKey_<KEYID>.p8`.

8. Immediately, in Terminal — substituting your real Key ID and Issuer ID:

```zsh
mkdir -p ~/.acr-signing
mv ~/Downloads/AuthKey_*.p8 ~/.acr-signing/
chmod 600 ~/.acr-signing/AuthKey_*.p8

cat > ~/.acr-signing/appstore-connect.env <<'EOF'
ASC_KEY_ID=PASTE_THE_10_CHARACTER_KEY_ID
ASC_ISSUER_ID=PASTE_THE_ISSUER_UUID
EOF
chmod 600 ~/.acr-signing/appstore-connect.env
```

**Keep the file name exactly `AuthKey_<KEYID>.p8`.** The build script finds the key by building that
name from `ASC_KEY_ID`; renaming it breaks the upload.

**Check it worked:**

```zsh
source ~/.acr-signing/appstore-connect.env && ls -l ~/.acr-signing/AuthKey_${ASC_KEY_ID}.p8
```

A file listed as `-rw-------` means everything is in place. "No such file" means the Key ID in the
`.env` does not match the file name.

> **Never** commit, e-mail, screenshot or paste the `.p8`, the `.p12` or their passwords. The Issuer
> ID and Key ID alone are not secrets, but the `.p8` with them is a complete upload credential.

---

## A7 — Create the app record (5 min)

**Where:** App Store Connect → **Apps** → the blue **+** → **New App**.

| Field | What to enter | Note |
|---|---|---|
| **Platforms** | tick **iOS** only | not macOS, not tvOS |
| **Name** | `ACR Companion` | max 30 characters; **must be unique across the entire App Store** |
| **Primary Language** | **English (U.K.)** | matches the manual and the app's default locale |
| **Bundle ID** | `com.acragent.companion` | appears in the dropdown only after A4 |
| **SKU** | `ACR-COMPANION-001` | your own reference; never shown to anyone; cannot be changed |
| **User Access** | **Full Access** | limited access is for large teams |

Click **Create**.

**If you get "The App Name you entered is already being used":** someone else has reserved it.
Use `ACR Companion (CRIL)`. Only testers ever see this name — the name under the icon on the phone is
set inside the app and stays "ACR Companion" either way.

> **Creating the record publishes nothing.** The app sits in "Prepare for Submission" indefinitely.
> Nothing reaches the App Store unless somebody presses *Submit for Review*, which is not part of this
> procedure and should not be pressed.

---

## When A1 to A7 are all done

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion
scripts/ios-testflight.sh preflight
```

Expected, with the external drive plugged in:

```
✔ /Volumes/AndroidDev mounted
✔ bundle identifier com.acragent.companion
✔ Xcode project agrees with app.json, team X9QB4QT8NH
✔ Apple Distribution certificate present
✔ App Store Connect API key <KEYID> readable, issuer set
✔ one gateway origin, no LAN origin
✔ export compliance declared, privacy manifest present
✔ export options will not renumber the build
✔ gateway reachable at https://mobile-gateway-review.acragent.com (200)

✔ preflight passed — safe to archive
```

Tell Claude, and the Build 49 work begins.

---

## If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| No **Business** icon in App Store Connect | Not the Account Holder, or membership still activating | Check the Apple ID; wait and reload |
| Team still shows **(Personal Team)** | Xcode is caching the old membership | Remove and re-add the Apple ID (A3, point 3) |
| **Manage Certificates** has no **Apple Distribution** option | Xcode is still on the Personal Team | Finish A3 first |
| "You already have a current Distribution certificate" | One exists on another Mac | Export the `.p12` from that Mac instead of creating a second |
| No **Team Keys** tab | Not signed in as Account Holder | Sign in as the Account Holder |
| `.p8` downloaded but lost | It cannot be recovered | Revoke the key in App Store Connect and generate a new one; nothing else is harmed |
| Bundle ID missing from the New App dropdown | A4 not finished, or a Wildcard ID was made | Re-register as **Explicit** |
| Upload later fails with an authorisation error | A2 was skipped or a new agreement appeared | Re-check Business → Agreements |
