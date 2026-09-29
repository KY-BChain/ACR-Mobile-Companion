# Issuing codes to a reviewer

**Updated:** 29 September 2026 · **Applies to:** v0.6.7 (Build 49)

A reviewer needs **two** codes, and they are not interchangeable. Issue them in this order, and send
them in **two separate messages**.

| | **Download code** | **Invite code** |
|---|---|---|
| What it unlocks | getting the Android APK file | using the app, once installed |
| Where it is typed | on the website, in a browser | in the app, on the phone |
| Who issues it | the server at blockenergy.net | the review gateway on Kraken's MacBook |
| Steps below | **D1 to D6** | **I1 to I5** |
| Without it | no file to install | the app installs but refuses to run |
| Not needed for | iOS reviewers — Apple delivers the app itself | nobody; every install needs one |

**Identifiers:** download-code steps are `D1…`, invite-code steps are `I1…`. There is no other
numbering in this document. Do not renumber.

---

## Part D — the download code (Android only)

Issued on the web server, over SSH. Nothing to do with Apple, and nothing to do with the gateway.

### D1 — Connect to the server

```zsh
ssh 3hioi-5tb-hostingcom@3hioi5.ssh.tb-hosting.com
```

Wait for the password prompt to appear before typing, and type the password on its own. Pasting
several lines at once feeds the following lines to the prompt as if they were the password, and the
connection closes.

### D2 — Issue the code

```zsh
php ~/sites/private/make-download-code.php --label zzu-reviewer-01 --org ZZU --days 14 --max 3
```

| Option | Meaning | Rules |
|---|---|---|
| `--label` | which reviewer, for your records | letters, digits, `-` and `_` only, up to 64 characters. **Never a person's real name** — use a number and keep the who-is-who list privately |
| `--org` | the organisation tag | one of `ZZU`, `UCD`, `HKU`, `CRIL`, `TEST` |
| `--days` | how long the code lasts | 1 to 90; **14 if left out** |
| `--max` | how many downloads it allows | 1 to 20; **3 if left out**. Three covers a failed download and a second phone |

### D3 — Copy the code it prints

```
      5GUF-TBE9S36HVSEN
```

It is printed **once** and stored only as a hash, so it can never be recovered or looked up. If it is
lost, issue another — it costs nothing. The alphabet leaves out O, 0, I, 1 and L, because these codes
get read aloud and retyped.

### D4 — Send it to the reviewer, privately

Through the agreed private channel, **never in the same message as the invite code**, and never
alongside a link that would let a stranger use both.

### D5 — What the reviewer then does

1. Signs in at `www.blockenergy.net` with their website account.
2. Clicks the **Android app** button, bottom right of the page they land on.
3. Types the download code and downloads `ACRCompanion-v0.6.7-build49.apk` (about 70 MB).
4. Uninstalls any older ACR Companion first — Android refuses to install over an app signed with a
   different key.
5. Opens the file, allows the browser to install unknown apps when prompted, and accepts the warning
   that the app did not come from a store.
6. Opens ACR Companion and enters the **invite code** from Part I.

The page shows the file's size and SHA-256 checksum, read from the file itself, so a careful reviewer
can confirm the download arrived intact. For Build 49 that checksum is
`7767e54b941ed4517059b534f6fe297c88bb3fa67e070762d771e20ae4a2e9a6`.

### D6 — Check, and cancel if you need to

```zsh
php ~/sites/private/make-download-code.php --list
php ~/sites/private/make-download-code.php --revoke 5GUF
```

`--list` shows every code with its label, organisation, expiry, and how many of its downloads are
used. `--revoke` takes the **first four characters** and stops that code immediately.

Every download and every refusal is recorded in `~/sites/private/downloads.log`: time, what happened,
which label, and the IP address. The code itself is never written to the log.

**The gate also protects itself:** eight wrong codes from the same address in fifteen minutes and it
stops answering for a while.

### When a new build replaces this one

Put the new APK in `~/sites/private/android/` and **delete the old one**. The gate publishes whichever
`.apk` in that folder is newest, and the download page reads the name, size and checksum from the file
itself — so no page needs editing. Existing download codes keep working and will fetch the new file.

---

## Part I — the invite code (every install, on every platform)

Issued by the review gateway on Kraken's MacBook. Our own gateway checks it; it has nothing to do with
Apple, Google or WeChat.

### I1 — Start the services

```zsh
/Users/Kraken/DAPP/acr-mobile-companion/scripts/acr-services.sh start
```

Wait until T1 to T4 all show as running. A code can be issued without them, but nobody can redeem it
until they are up.

### I2 — Open a new Terminal window and go to the gateway folder

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
```

### I3 — Issue the code — all three lines

```zsh
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db \
ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
  node src/auth/invite-admin.js issue --org ZZU --label zzu-reviewer-01 --issued-by Kraken
```

### I4 — Copy the code it prints

It appears once and is stored nowhere. Lost means reissue.

### I5 — The reviewer redeems it

In the app, or on the invite screen of the WeChat mini-program. It must be redeemed within **7 days**.
The session then lasts **30 days** and is bound to that one device.

### Rules the tool enforces

- **`--org`** must be one of **ZZU, UCD, HKU, CRIL, TEST**.
- **`--label`** takes letters, numbers, `-` and `_`, up to 64 characters. Never a person's real name.
- **Each code works once, on one install.** A reviewer using both the app and the mini-program needs
  two codes; a second device needs a second code.
- **Leave out either `ACR_AUTH_…` line and the tool still prints a code, but the code will not work.**
  Without them it writes to an old, empty database and produces a valid-looking code the live gateway
  rejects, with nothing to say why. Always copy all three lines.

### Two notes for the WeChat mini-program

- The mini-program identifies itself to the gateway as the iOS/Android app (`mob-v0.6.7+49`, channel
  MOBILE, set in `config/appIdentity.js`). That is why a standard code works. Whether it should have
  its own identity is still an open decision.
- **In WeChat DevTools:** switch off domain checking in the project settings. **On a phone:**
  `mobile-gateway-review.acragent.com` must first be registered in the mini-program's admin console.
