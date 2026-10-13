# ACR user account registration — what it is, how it works, how to run it

Version 2.0 — 12 October 2026. Version 1.0 covered registration only; this adds how a
mobile app is requested, approved and issued.

This describes the module as rebuilt on 10–11 October 2026 and now live on both
**acragent.com** and **blockenergy.net**. It replaces the earlier description, which existed
only in conversation and was never written down.

---

## What it is, in plain English

A visitor who wants to evaluate ACR needs an account on the website. The module is the thing
that creates that account and lets them sign in again afterwards.

It does three jobs:

- **It proves the e-mail address is real.** The visitor is sent a six-digit code and has to
  type it back. Without that, anyone could register under anyone else's address.
- **It creates the account**, storing the e-mail address and a password the visitor chooses.
- **It tells us someone has registered**, by e-mailing the enquiry to `info@acragent.com`.

An account is also the gate for everything else: since 12 October 2026 a reviewer must hold one
before they can ask for either mobile app, because the account's verified e-mail address is where
the codes are sent. That part is described under *Requesting a mobile app* below.

### One account belongs to one website

Each site keeps its own account list, in its own file. An account created on acragent.com
cannot sign in on blockenergy.net, and never will unless we deliberately build a shared account
service. This is expected behaviour, not a fault. A reviewer who needs both must register twice.

---

## Why it was rebuilt

Worth recording, because two of the three faults were invisible from the outside and could
easily be reintroduced.

| Fault | Effect |
|---|---|
| `emailjs-com`, the browser library sending the mail, was withdrawn by its supplier | No code ever arrived; registration stopped dead |
| The account record was written with a text value in a column that only accepts whole numbers | Even with a code in hand, the account could never be created |
| The six-digit code was being saved as the account password | Anyone who did get through had a password they never chose and could not guess later |

The third fault is the reason a password field now exists on the form. There wasn't one before.

---

## The logical flow

```
  Visitor fills in the form on ACR-contact.html
  (institution, e-mail, password, research interests)
            |
            v
  Browser asks the server for a code
  POST api/auth.php?action=request-code
            |
            +--> Is the address already registered?  --> yes: "sign in instead", stop
            +--> Was a code sent under a minute ago? --> yes: "wait a minute", stop
            |
            v
  Server invents a six-digit code and e-mails it
            |
            +--> the e-mail did NOT go --> nothing is saved, visitor is told, stop
            |
            v
  Server stores a one-way scramble of the code, with a three-minute expiry
  The browser is never told the code
            |
            v
  Visitor types the six digits
  POST api/auth.php?action=register  (e-mail, password, code, institution, interests)
            |
            +--> no code on file     --> "ask for a code first"
            +--> 5 wrong tries used  --> "ask for a new code"
            +--> past three minutes  --> "that code has expired"
            +--> digits do not match --> "that code is not right", wrong-try counter +1
            |
            v
  Account created. Password stored scrambled, never as typed.
  The code is deleted — it works once and once only.
            |
            v
  Enquiry e-mailed to info@acragent.com (best effort — see below)
            |
            v
  Visitor can now sign in: POST api/auth.php?action=login
  Server returns a session token, which the browser keeps.
  download.html reads that token to decide whether the iPhone request is allowed.
```

### Two points in that flow that matter

**The code never reaches the browser.** The old design sent the code to the page and let the
page check it, which means anyone who knew how to open a browser's developer tools could read
it. Now the server keeps only a one-way scramble of the code and does the comparison itself.
There is nothing in the page to find.

**Nothing is stored until the e-mail has actually gone.** If sending fails, the server saves no
code at all and says so. The alternative — storing a code for a message that never arrived —
leaves the visitor typing digits into a form waiting for different ones, with no way to tell
what went wrong.

**The enquiry notification is best effort, deliberately.** If the account is created but the
notification to `info@acragent.com` fails, the visitor is still told they succeeded, because
they did. Failing to post our own internal notice is not their problem. The failure is written
to the log instead.

---

## Requesting a mobile app, and how it is approved

Added 12 October 2026. Before that, download codes were issued by hand over SSH and sent out of
band; the iPhone had a request form but Android had none.

### The flow

```
  Signed-in account holder opens the Mobile app button
  (bottom right of the research interface, only once signed in)
            |
            v
  Chooses iPhone or Android
            |
            +-- not signed in --> "Sign in first", with a link to register
            |
            v
  POST api/mobile-request.php   {platform, and for iPhone the Apple address}
            |
            v
  One live request per account PER PLATFORM, written to the shared queue.
  A re-submission never resets a decision already made.
            |
            v
  An administrator decides, by hand, in mobile-review.php
            |
            +-- Android approved --> a download code is generated, e-mailed to
            |                        the account address, and registered
            |
            +-- iPhone approved ----> external (the default) or internal, and
            |                        which TestFlight group, recorded
            |
            +-- declined ----------> recorded, and never silently reopened
            |
            v
  An invite code is sent separately, from the gateway (see below)
```

### What is decided by hand, and why

**Android** gets its download code only on approval. The code is generated on the server, e-mailed
to the address the account was verified at, and never shown on screen — so an administrator cannot
read it back out, and nor can anyone who gets hold of the queue file.

**iPhone** has a second decision: external or internal. Since Apple approved Build 50 for external
testing on 12 October 2026, **external is the default** and a pending request arrives pre-set to
it, with a note on the row saying so. Internal adds the person as a user on the Apple developer
team and is for CRIL colleagues only. The TestFlight group they were put into is recorded on the
request, so the record matches App Store Connect rather than implying it.

**Each account may hold three download codes and three invite codes.** The limit counts live codes
per ACR account, not per e-mail address used, so an iPhone reviewer cannot gain extra codes by
giving a different Apple address each time.

### Invite codes are not issued here

They come from the review gateway on Kraken's MacBook and are printed once. The admin page shows
the exact command for that reviewer, takes the code pasted back, e-mails it, and counts it. **The
code itself is never stored or logged.** This is deliberate: the gateway's key material stays on
the machine that verifies it. See `Issue an invite code v0.5-21SEPT26.md` for the command itself.

### What counts as a download

A download code is marked used the moment the file starts transferring, and that is recorded
against the account. So the register answers *who actually downloaded*, not merely who was
approved.

### Nothing on the ISP is shared between the two sites

Corrected 13 October 2026, after it was established by test. acragent.com and blockenergy.net are
**separate hosting accounts**, each with its own `sites/` tree. The FTP hosts differ, which is the
giveaway.

| | Per site? |
|---|---|
| `sites/<site>/data/users.db` — accounts and the code register | **Yes** |
| `sites/private/ios-requests.json` — the request queue | **Yes** |
| `sites/private/download-codes.json` — download-code secrets | **Yes** |
| `sites/private/mail.json`, `mail-templates/`, `ios-admins.txt` | **Yes** |

So **every private file must be uploaded to both sites**, not once. An administrator signed in on
one site sees only that site's requests and accounts, and a download code issued on one site will
not be accepted by the other.

What genuinely *is* shared sits elsewhere: the **invite-code gateway** on Kraken's MacBook, which
issues codes for reviewers on either site, and the **Apple side** — one app, one set of TestFlight
groups. The codebase is common only because the same files are uploaded to both.

## Where everything lives

On the website, inside the web folder:

| File | What it does |
|---|---|
| `ACR-contact.html` | The registration form, including the password field |
| `scripts/contact.js` | Asks for the code, runs the three-minute countdown, submits the registration |
| `api/auth.php` | All four server actions: `request-code`, `register`, `login`, `verify` |
| `api/mailer.php` | Sends mail, by either of two routes |
| `api/mobile-request.php` | Records a request for either mobile app. Replaces `api/ios-request.php` |
| `api/mobile-codes.php` | Issues download codes and keeps the register. Shared by the admin page and the download endpoint |
| `mobile-review.php` | The administrator's screen: queue, accounts, reviewers. Renamed from `ios-review.php` |
| `data/users.db` | The accounts, the short-lived verification codes, and the `mobile_codes` register |

Outside the web folder, where no browser can reach it — this is the important part:

| File | What it does |
|---|---|
| `/sites/private/mail.json` | Mailbox name, password, and the EmailJS keys. Mode 600 |
| `/sites/private/mail-templates/otp.txt` | The wording of the code e-mail. First line is the subject |
| `/sites/private/mail-templates/enquiry.txt` | The wording of the internal notification |
| `/sites/private/mail-templates/download-code.txt` | The wording of the download-code e-mail |
| `/sites/private/mail-templates/invite-code.txt` | The wording of the invite-code e-mail |
| `/sites/private/ios-requests.json` | The request queue, **shared by both sites** |
| `/sites/private/download-codes.json` | Download-code secrets, as bcrypt hashes, **shared by both sites** |

Templates sit outside the web folder so the wording can be changed by editing one file on the
server, with no deployment and no code change. Both carry `{placeholders}` which the server
fills in.

`mail.json` is **not** in the FTP package and never should be. It holds a password. It is placed
on each server by hand, once.

---

## The two ways mail can be sent

The module tries one route, and if it fails, silently tries the other.

**Primary — SMTP straight to Register365.** Our own mail provider, our own domain, no monthly
limit, no third party holding reviewers' e-mail addresses. That last point is the GDPR argument
and the reason it is primary.

**Reserve — EmailJS, going out through Outlook.** Used only when the primary fails.

Two things to keep straight:

- The reserve must stay on **Outlook**, not on Register365. Pointing both routes at the same
  mail provider means one outage takes out both, and the reserve stops being a reserve.
- EmailJS's free allowance is **200 messages a month on the account as a whole**, whichever
  service is picked inside it. Only direct SMTP escapes that ceiling.

The server records which route carried each message, and writes a log line reading
**`mail sent by the reserve transport`** whenever the reserve is used. That line was added for a
reason: during testing, the SMTP route was broken for ninety minutes and nobody noticed, because
the reserve was quietly covering for it. If that line appears in the log, the primary route is
broken and wants looking at, even though reviewers are still receiving their mail.

---

## Operational steps

### Setting up a server for the first time

**R1.** Put `mail.json` in `/sites/private/` on the server. Start from
`private-mail.json.template`, which lists every field. Fill in the mailbox password and the
EmailJS private key.

**R2.** Set its permissions so only the account that runs the website can read it:
`chmod 600 /sites/private/mail.json`.

**R3.** Create `/sites/private/mail-templates/` and copy `otp.txt` and `enquiry.txt` into it
from `private-mail-templates.template/`.

**R4.** Do R1 to R3 **on each site separately**. The two sites share nothing. This is the step
that gets forgotten, and the symptom is registration working on one site and failing on the
other.

**R5.** Register a throwaway address on the live site and confirm the code arrives. Nothing
short of a real registration tests the whole chain.

### Checking it is healthy

**R6.** Look for `mail sent by the reserve transport` in the website log. If it is there, SMTP
is failing and only the reserve is keeping things going — on a free 200-a-month allowance.

**R7.** Watch the EmailJS remaining quota on its dashboard. If it is dropping, R6 applies: the
reserve is carrying traffic it should not be carrying.

### When a visitor says no code arrived

**R8.** In order: ask them to check the spam folder; confirm they waited for the message rather
than resending repeatedly (asking again within a minute is refused outright); then look at the
log, because a failure to send is always recorded there and is always reported to the visitor
rather than hidden.

**R9.** If the address was already registered, the server says "sign in instead" and sends
nothing. That is not a fault, and it is the commonest explanation for "no code arrived".

---

### Handling a mobile app request

**R10.** Open `mobile-review.php` on the site the reviewer registered on — the banner at the top
names which site you are on. The queue shows requests from both sites; only the accounts differ.

**R11.** For **Android**: set the decision, then use *Issue download code and e-mail it*, choosing
the organisation. The code is generated, sent and registered in one step. It cannot be shown again,
so if the e-mail fails, revoke it and issue another.

**R12.** For **iPhone**: the row arrives pre-set to *approved external*. Change it to *approved
internal* only for CRIL colleagues. Choose the TestFlight group, then Save. Then add the person in
App Store Connect by hand — this page records the decision, it does not talk to Apple.

**R13.** For the **invite code**: open *Send an invite code* on the row, run the command it shows
on the MacBook with T1 to T4 running, and paste the result back. It is e-mailed and counted.

**R14.** Watch the **ACR accounts** tab for who has actually downloaded. An approval with no
download after a few days usually means the e-mail did not arrive, not that the reviewer lost
interest.

## Known limits, recorded on purpose

These are accepted for an invited evaluation on a prototype. They would not be acceptable for a
public service, and they are written down so the decision is visible rather than forgotten.

- **Sign-in still accepts a password stored unscrambled.** This predates the rebuild and exists
  so early demonstration accounts kept working. Every account created from 11 October onwards is
  stored scrambled. The fallback should be removed once the old demonstration accounts are gone.
- **Session tokens do not expire.** A token stays valid until the next sign-in replaces it.
  There is no sign-out.
- **Sign-in attempts are not rate-limited.** Requesting a code is (one a minute), and checking a
  code is (five tries), but the sign-in form itself is not.
- **`api/auth.php` allows requests from any origin.** Appropriate for a prototype whose two
  sites serve the same content; it should be narrowed before anything else uses the API.
- **`api/ios-request.php` is now dead code.** `download.html` posts to `api/mobile-request.php`
  instead. The old endpoint still works and still records an iPhone request, which is a useful
  safety net while a cached page might still be posting to it. Remove it at a later upload.
- **The docblock at the top of `api/auth.php` is out of date.** It still describes registration
  as going "via EmailJS OTP" and does not list the `request-code` action. Comment only — it has
  no effect on behaviour, and it was left alone so the live files stay byte-identical to the
  approved FTP package. Worth correcting next time that file is opened for a real change.

---

## Related documents

- `ISSUING_CODES_ONE_PAGE.md` — issuing download codes and invite codes, which this module
  does not do
- `Reviewer instructions — iOS TestFlight.md` — what a reviewer is asked to do, and where an
  account fits into it
- `acr-test-website/NOT-FOR-RELEASE.md` — the release rule, and the local sign-in test harness
