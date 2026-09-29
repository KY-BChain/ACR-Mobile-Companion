# ACR Companion for Android — download from www.blockenergy.net behind a code

**Applies to:** v0.6.7 (Build 49) · signed with CRIL's release key · hosting by **Register365**, Linux
**Download domain:** **www.blockenergy.net** · `www.acragent.com` is not used for the download
**Written:** 28 September 2026 · **Updated:** 29 September 2026, as built
**Status: built and live on www.blockenergy.net, 29 September 2026.** The APK is published behind
the download code and has been downloaded end to end. AD1 (open registration) is **deliberately
deferred** to a later phase: the app itself refuses to work without a 30-day invite code, and a
reviewer who only walks the five screens never reaches the back end.

**Day-to-day use is not in this document.** To issue a download code or an invite code, see
[Issue an invite code v0.5-21SEPT26.md](Issue%20an%20invite%20code%20v0.5-21SEPT26.md) — steps D1 to
D6 and I1 to I5. This document records how the system was built and how to verify it.

**As built:**

| | |
|---|---|
| Download domain | `www.blockenergy.net` (Linux, nginx in front of Apache, PHP 7.4) |
| Web folder | `~/sites/blockenergy.net/` |
| APK, code store, log | `~/sites/private/` — outside the web folder, mode 700 |
| The file | `ACRCompanion-v0.6.7-build49.apk`, 73,212,634 bytes |
| SHA-256 | `7767e54b941ed4517059b534f6fe297c88bb3fa67e070762d771e20ae4a2e9a6` |
| Signing key | `65a04dbb…49a815fc` — CRIL's release key, same as Builds 47 and 48 |
| Gate | `api/download.php` · page `download.html` · issuer `~/sites/private/make-download-code.php` |
| Button | `acr-owl.html`, bottom right, shown to signed-in visitors (`DOWNLOAD_READY = true`) |
| Also on that page | an opt-in request for iOS TestFlight access, recorded in `~/sites/private/ios-requests.json` |

**Identifiers:** every step in this document is `AD1`, `AD2`, … There is no second numbering scheme.
Do not renumber.

---

## 0. What this is, and what it is not

Android has no TestFlight. Outside the Play Store there is exactly one way to put the app on a
reviewer's phone without a cable: publish the signed **APK** file and let the reviewer install it
themselves ("sideloading"). This document covers hosting that file at `www.acragent.com` so that only
a logged-in partner can download it.

This is **not** a Play Store release, and nothing here puts the app on Google Play. It suits ZZU
because phones in China have no Google services at all.

**What does not change:** the app still refuses to work without an invite code, the trial banner still
appears on every screen, and no real patient data is ever used. The website login only controls who
can obtain the file; the invite code still controls who can use the app.

---

## 1. Who does what

| Work | Kraken | Register365 | Claude |
|---|---|---|---|
| Hosting account, FTP credentials, support tickets | **all of it** | answers the questions in AD4 | — |
| Fixing the registration hole (AD1) | approves | — | **writes the change** |
| Building and signing the APK | present at the machine | — | **runs the build** |
| The download gate (PHP) and the download page | approves; uploads by FTP | — | **writes them** |
| Verifying the live site afterwards | runs the checks in AD11 | — | states what to expect |
| Reviewer instructions in Chinese | approves and sends | — | drafts |

---

## 2. The steps

### AD1 — Close the registration hole. **Blocker. Nothing else matters until this is done.**

`api/auth.php?action=register` creates an account for **any** e-mail address and password that is
posted to it. There is no server-side check of any kind: the one-time code is sent and compared in the
browser, so anyone who calls the endpoint directly skips it entirely. Every new account is given the
role `partner`.

Anyone who can read the page source — which is everyone — can therefore create a working login. A
download "protected" by that login is not protected at all.

Two further items in the same file:

- `scripts/auth.js` ends with a working test account printed into the public JavaScript
  (`test@blockenergy.eu` / `BlockEnergy888`) and a `createTestUser()` function that calls the open
  registration endpoint. Both must go.
- Session tokens are stored one per user in `users.session_token` with no expiry column, so a token
  never becomes invalid on its own.

**Choose one before hosting anything:**

- **Closed registration.** Remove the `register` action from `api/auth.php` entirely. Kraken creates
  each partner account by hand with a script, and sends the password privately. Fewest moving parts,
  and right for a group of about ten reviewers.
- **Invitation-only registration.** Registration requires a code issued by Kraken, checked in PHP.
  More work, only worth it if the list of partners grows.

**Verification:** from a terminal, a POST to the register endpoint must be refused. Kraken then
confirms no unexpected accounts exist in `users.db`.

### AD2 — Decide what a reviewer downloads

One file: `ACRCompanion-v0.6.7-build49.apk`, about 60–80 MB. Not an `.aab` — that format is for the
Play Store only and cannot be installed on a phone.

### AD3 — Build and sign the APK

Claude runs the release build from the repository at Build 49, then verifies the signature against
CRIL's release key fingerprint (`65:A0:4D:…:15:FC`, recorded in
[BUILD47_ANDROID_RELEASE_SIGNING.md](BUILD47_ANDROID_RELEASE_SIGNING.md)) and records:

- the exact file name and size;
- the **SHA-256 checksum of the APK file**, which goes on the download page so a reviewer can confirm
  they received the file intact;
- `versionCode 49`, `versionName 0.6.7`, client identity `mob-v0.6.7+49`.

The APK must be the same signed artefact for every reviewer. Never rebuild "a fresh copy" for one
person: a different file with the same version number is exactly how a support problem starts.

### AD4 — Hosting facts, and what is still open

**Known (Kraken, 28 September 2026):**

| | |
|---|---|
| Hosting | **Linux**. Windows/IIS 8.5 is available if ever needed — not needed for this |
| Web server | **nginx** (confirmed from the live response headers) |
| PHP | **7.4** |
| Bandwidth | 30 GB allocated, 15 GB quota |
| Download domain | **www.blockenergy.net** |

**What those facts change:**

- **nginx ignores `.htaccess`.** On Apache a folder can be protected with a file dropped next to it;
  on nginx it cannot. Protection has to come either from storing the APK **outside the web folder**
  (AD5) or from an nginx rule that Register365 must add for you. Do not rely on an `.htaccess` file:
  it will sit there looking reassuring and do nothing.
- **PHP 7.4 has had no security updates since November 2022.** Ask Register365 to move the account to
  **PHP 8.1 or later**; it is normally a setting in the control panel. The download gate will be
  written to run on 7.4 either way, but a public site handling logins should not stay on it.
- **Bandwidth is comfortable but not unlimited.** At an APK of about 60 MB, a 15 GB monthly quota is
  roughly 250 downloads; at 80 MB, about 190. Ten reviewers cannot exhaust that. A public link
  could, which is one more reason the file is never linked publicly.

**Still to ask Register365:**

- **Do `www.blockenergy.net` and `www.acragent.com` share the same document root?** This is the
  important one — see AD5.
- **Can files be stored above the web folder and still be read by PHP?** If yes, AD5 is
  straightforward. If no, Register365 must add an nginx rule denying direct access to the folder.
- **Is SFTP or FTPS available?** Plain FTP sends the password in clear text.
- **Is there a limit on how long a PHP script may run**, or on response size, that would cut off a
  60–80 MB download?

### AD5 — Settle the two-domain question, then decide where the file lives

**The two sites are the same site.** `www.blockenergy.net` serves the same pages as
`www.acragent.com` — the same `index.html`, the same `scripts/auth.js`, the same `api/auth.php`. The
only difference between the two live home pages is the few bytes Cloudflare rewrites in e-mail links
on the acragent side. blockenergy.net is answered directly by the ISP's nginx, with **no Cloudflare
in front of it**.

Two consequences:

- **"Leave acragent.com untouched" may not be possible.** If both domains point at one folder on the
  server, anything uploaded for blockenergy.net appears on acragent.com as well. **Confirm before
  uploading:** put a file such as `hosting-test.txt` in the web folder, then open it on both domains.
  Appears on both → one shared folder, and the download page and gate will be reachable from
  acragent.com too, so they must be safe to expose there. Appears on only one → two separate spaces,
  and the plan works as you intend.
- **blockenergy.net has no Cloudflare protection**: no rate limiting or filtering in front of the
  login and download. The gate in AD7 must therefore do its own throttling, and the login hole in
  AD1 matters just as much here — the same vulnerable `api/auth.php` is already live on this domain.

**Where the file goes:** outside the web folder, e.g. `../private/acr-companion-build49.apk`,
readable only by the PHP gate. If Register365 does not allow that, a folder inside the site with an
nginx deny rule they add for you — verified in AD11, never assumed.

### AD6 — Directory listing and MIME type

On Linux/nginx the `web.config` in the site folder does nothing at all — it is an IIS file, and it is
only still there from an earlier Windows arrangement. Directory listing is off by default in nginx,
and `/data/` already answers **403** on both domains, so nothing needs changing. Confirm it in AD11
rather than assuming it.

The `.apk` MIME type needs no server setting either: the gate in AD7 sends the correct header itself.

### AD7 — Write the download gate

A single PHP file, for example `api/download.php`, which:

1. reads the session token the browser holds after login;
2. looks it up in `users.db` and refuses with **403** if it does not match a user;
3. records the download — who, when, which file — in a small log table;
4. sends the file with `Content-Type: application/vnd.android.package-archive`,
   `Content-Disposition: attachment`, and the correct length;
5. never accepts a file name from the URL. The file it serves is fixed in the script. A gate that
   takes `?file=` from the address bar can be talked into serving `users.db`;
6. refuses more than a few downloads per account per hour, and logs refusals. With no Cloudflare in
   front of this domain (AD5), the gate is the only thing rationing the bandwidth in AD4;
7. runs on PHP 7.4 — no syntax newer than that until the account is moved to PHP 8.

### AD8 — Write the download page

A page in the same style as the other four legal pages, reachable only after login, carrying: the
version and build number, the file size, the SHA-256 checksum, the date, the plain warning that this
is a research prototype and not a medical device, a link to the privacy policy and the terms, and a
reminder that an invite code is needed separately and is not sent by e-mail with the download.

### AD9 — Upload

By FTPS or SFTP if Register365 offers it (AD4). Upload the APK, the gate, the page and the amended
`web.config`. Check file permissions afterwards: the APK must be readable by PHP and by nothing else.

### AD10 — Sync the documents

The privacy policy, terms and ethics pages already cover the mobile application, but the download
page is new. Check that the terms' section on restricted areas still reads correctly with a download
in place, and update the next FTP package rather than editing the live site by hand.

### AD11 — Verify on the live site, in this order

1. **Logged out**, request the download URL directly **on both domains**: must return **403**, not
   the file.
2. Request the APK's own path directly (e.g. `/private/…apk`): must return **403** or **404**.
3. Visit the folder that holds it: must **not** list its contents.
4. POST to the registration endpoint: must be refused (AD1).
5. **Logged in**, download the file, then compare its SHA-256 with the value on the page. They must
   match exactly.
6. Install it on a real Android phone, redeem an invite code, and confirm the app runs.
7. Repeat checks 1 to 3 against `www.acragent.com` as well. If the two domains share a folder (AD5),
   whatever is reachable on one is reachable on the other.

Write down the result of each. If any of 1 to 4 does anything other than refuse, stop and fix it
before telling anyone the file is there.

### AD12 — Instructions for the reviewer

Android will not install a file from a browser without permission. The reviewer must, in this order:

1. sign in at `www.acragent.com` and download the file;
2. open it, and when Android says the browser is not allowed to install apps, follow the prompt to
   **allow that browser to install unknown apps**, then go back;
3. accept the warning that the app did not come from a store — expected, because it did not;
4. if Play Protect appears and offers to scan, let it, then choose install anyway;
5. open ACR Companion and enter the invite code supplied separately.

**If they already have an older ACR Companion built with a different key, they must uninstall it
first.** Android refuses to install over an app signed by another key.

This needs a Chinese version before it goes to ZZU. Phones there also vary: some manufacturers' skins
put the "unknown apps" permission in a different place, so the wording should say what to look for
rather than name one exact menu.

### AD13 — Keep a record

One line per release: version, build number, file name, SHA-256, upload date, and who was told about
it. When a new build replaces an old one, remove the old APK from the server rather than leaving both
— two files with similar names is how a reviewer ends up testing last month's build.

### AD14 — Before any wider release

Nothing goes to ZZU, UCD or HKU until Kraken approves it. The app is not for public release, and the
download page must never be linked from a page a visitor can reach without logging in.

---

## 3. What must not happen

- No APK is hosted while `api/auth.php` still accepts open registration (AD1) — it is live on
  **both** domains, so moving the download to blockenergy.net does not avoid it.
- No direct link to the APK is ever published, and no link to it appears on a public page.
- `users.db` never sits in a folder that can be listed or fetched over the web.
- The release keystore, its passwords and the FTP credentials are never committed, never published
  and never quoted in a report. They stay in `~/.acr-signing`.
- No `.aab` is published: it cannot be installed and would only confuse.
