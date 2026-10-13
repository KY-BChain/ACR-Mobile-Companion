# Issuing codes to a reviewer — one page

**Written:** 10 October 2026. A quick card, not the procedure. It deliberately carries **no build
number and no checksum**, so it cannot go stale. Those live in the two documents below, which are
the authority whenever this page and they disagree.

| What | Where the full steps are |
|---|---|
| Download code (Android) | `Issue an invite code v0.5-21SEPT26.md` — **Part D, steps D1 to D6** |
| Invite code (both platforms) | `Issue an invite code v0.5-21SEPT26.md` — **Part I**, and `IOS_TESTFLIGHT_PROCEDURE.md` **§7, E6** |
| Adding an iPhone reviewer to Apple | `IOS_TESTFLIGHT_PROCEDURE.md` — **§7, E1 to E7** |
| Publishing a new APK | `ANDROID_ISP_DISTRIBUTION.md` — **AD2, AD3, AD9, AD11** |

---

## Before either code — the reviewer needs an ACR account

Everyone gets an ACR Platform account first: an e-mail address and password, from **Join Research
Network** on `www.acragent.com`. That account is the record of who they are. Codes are issued
against it, never to a stranger.

For iPhone they also give **the e-mail address of their Apple Account**, which may be a different
address. Both are recorded against the request. Apple does not check the name, but the address must
be a real Apple Account or the invitation cannot be accepted.

---

## 1. Download code — Android only

Run **on the ISP server over SSH**, not on the MacBook.

```sh
php ~/sites/private/make-download-code.php --label <short-id> --org <ZZU|UCD|HKU|CRIL|TEST>
```

Options: `--days 14` `--max 3` · `--list` to see what is outstanding · `--revoke <selector>` to cancel one.

- `--org` is the institution. `--label` is **your own private reference**, never the person's name —
  letters, digits, `-` and `_` only. Keep the real mapping somewhere private.
- Printed **once**, stored only as a hash. Lost means issue another; it costs nothing.
- The reviewer signs in on the website, chooses **Android**, and types the code.

## 2. Invite code — every install, both platforms

Run **on the MacBook**, with T1 to T4 up. Kraken starts the services.

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db \
ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
  node src/auth/invite-admin.js issue --org <ORG> --label <short-id> --issued-by Kraken
```

> **Both environment variables are required.** Without them the tool falls back to the Build 45
> paths and issues a valid-looking code the live gateway then rejects, saying nothing useful.

- Redeem within **7 days**; the session then lasts **30 days** and binds to **one device**.
  A second device, or the WeChat mini-program, needs its own code.
- `… invite-admin.js list` shows every code, its redemptions and live sessions. No secrets are stored.
- **The app must be the build the gateway expects.** An older build keeps an existing session alive
  but can never pair a new device — it fails with `CLIENT_BUILD_MISMATCH` (403) and nothing on
  screen explains why. Check the expected build in the current `scripts/build<N>-review-service.sh`.

---

## Order, and what never goes in writing

1. Reviewer gets an ACR account · 2. download code (Android) **or** Apple invitation (iPhone, E1–E7)
· 3. they install · 4. invite code, sent **separately** · 5. they redeem it within 7 days.

Never send the download code and the invite code in the same message. Never put either in Git, in a
report, or in a document. Neither is ever recovered — only reissued.

It was already documented, in one place covering both:

Download code	Issue an invite code v0.5-21SEPT26.md — Part D, D1–D6
Invite code	same document, Part I — and IOS_TESTFLIGHT_PROCEDURE.md §7, E6
I kept those identifiers rather than invent new ones, so the card points at D1–D6 and E6 instead of renumbering.