# Privacy policy for www.acragent.com — findings and action plan

**Written:** 18 September 2026 · **Status:** for review. **Nothing has been changed on the website, and
nothing has been copied into `/Users/Kraken/DAPP/ACR-platform`, which stays read-only.**

**Why this exists:** Apple requires a privacy policy URL before ACR Companion can go to external
TestFlight testers ([IOS_TESTFLIGHT_PROCEDURE.md](IOS_TESTFLIGHT_PROCEDURE.md) §6, D3). The site has
carried a dead "Privacy Policy" link in its footer since it was built. One page settles both.

---

## 1. Scan of ACR-platform — where the website actually lives

`/Users/Kraken/DAPP/ACR-platform` is 766 MB across 60 top-level entries. Website code exists in
**exactly four places**, and nowhere else:

| Directory | Size | What it is |
|---|---|---|
| `acr-test-website/` | 2.8 MB | **the working copy** — has `governance_*.php`, `tests/`, `users.db`, `data/.htaccess` |
| `Final_FTP_v2_2_1/website/` | 2.1 MB | **the deployment bundle that matches what is live** (3 June 2026) |
| `Final_FTP_v2_2_0/website/` | 2.1 MB | superseded (27 May 2026) |
| `Final_FTP_v2_1_2/website/` | 98 MB | superseded (21 May 2026); also carries `backend`, `runtime`, `traces` |

Nothing else in the repository holds web pages. `docs/Mobile_App` has four HTML/PHP files, which are
design documents. `ACR-Ontology-Interface` is the Maven reasoner module. The only other `index.html`
files sit inside `fl-sim/.venv` and belong to third-party Python packages (Ray and NVFlare
dashboards) — not the website.

### 1.1 Correction: the live site is **v2_2_1**, not v2_1_2

You said `Final_FTP_v2_1_2` is what is public. It is not. I fetched three files from
www.acragent.com and compared them with each local copy — differing lines:

| File fetched live | v2_1_2 | v2_2_0 | v2_2_1 | acr-test-website |
|---|---|---|---|---|
| `acr_pathway.html` | 116 | 116 | **0** | **0** |
| `acr-owl.html` | 4 | **0** | **0** | **0** |
| `lang/en.json` | 31 | **0** | **0** | **0** |

`index.html` is byte-identical in all four copies, which is why it looks as though any of them could
be live — the live version differs from all of them only by the two lines Cloudflare injects at the
edge to obfuscate the e-mail address. The other pages settle it.

**Consequence: `Final_FTP_v2_1_2` must not be used as the basis for any edit.** Publishing from it
would roll back `acr_pathway.html` by 116 lines and every language file.

**Recommended working rule:** change `acr-test-website/`, then cut a new `Final_FTP_v2_2_2/website/`
from it for upload, exactly as v2_2_1 was cut before. `acr-test-website` and `Final_FTP_v2_2_1`
differ only by development-only files (`governance_*.php`, `tests/`, `users.db`, `.htaccess`,
`.DS_Store`) which must not be published.

---

## 2. What the website actually does with data — verified, not assumed

Everything in the draft policy comes from reading the code, not from a template:

| Claim in the policy | How it was verified |
|---|---|
| No cookies | No `document.cookie` anywhere in the site |
| No analytics, no advertising, no tracking | The only external hosts referenced are `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`, `api.acragent.com`, `acr.blockenergy.eu`, `github.com` |
| Browser storage only, never sent to us | `localStorage`: `selectedLanguage`, `acrDatabase` (synthetic case data); `sessionStorage`: `user`, `walletToken` |
| Cloudflare processes IP and request metadata | The site is served through Cloudflare; the live page shows Cloudflare's e-mail-obfuscation rewrite |
| Contact form sends a one-time code by e-mail | `scripts/contact.js` uses EmailJS (`emailjs.send('ACR-Outlook', 'contact_otp', …)`) |
| The assistant panel sends nothing | `scripts/DeepSeek-chat.js` is 70 lines and contains no network call — the comment on line 28 says *"Simulate AI response (in real implementation, this would call an API)"* |
| Demonstration entries are not stored | Submissions go to `api.acragent.com` for inference |

---

## 3. What I propose to publish

### 3.1 The URL

```
https://www.acragent.com/privacy.html
```

This is the URL to give Apple. It currently returns 404, confirmed.

**Why a separate page, not a section of `index.html`:** Apple's field wants a direct link to a policy,
and a reviewer must reach the text without scrolling a long marketing page or running JavaScript.
A separate page is also what the footer link on every page has always pointed at — `href="#"`, a dead
link on `index.html`, `ACR-contact.html` and `acr-owl.html`. This fills it.

The mobile app section has the anchor `#app`, so the in-app notice can link straight to it later.

### 3.2 The files, drafted and staged in this repository

Staged in [docs/website/](../website/), not copied anywhere:

| File | What it is |
|---|---|
| `privacy.html` | the page — header, footer, language switcher and stylesheet all taken from `ACR-contact.html`, so it looks like the rest of the site |
| `lang/privacy-en.json` | 55 translation keys, **generated from the page itself** so the two cannot disagree |
| `language-switcher.js.proposed` + `language-switcher.diff` | a **five-line** addition, shown below |

```diff
  const isOwlPage = window.location.href.includes('acr-owl.html');
+ const isPrivacyPage = window.location.href.includes('privacy.html');

  if (isContactPage) {
      translationFile = `lang/contact-${lang}.json`;
+ } else if (isPrivacyPage) {
+     translationFile = `lang/privacy-${lang}.json`;
  } else if (isOwlPage) {
```

### 3.3 What the page says

| Section | Content |
|---|---|
| 1. Who we are | CRIL as controller, the NovaUCD address, `info@acragent.com`, and what BlockEnergy ACR is |
| 2. This website | cookies (none), browser storage, Cloudflare, the two CDNs, the contact form, the demonstration pages, the assistant panel |
| 3. The mobile application | **the same text as section 15 of the reviewer manual**, which is the notice already inside the app |
| 4. Your rights | access, correction, deletion, restriction, objection, portability; one-month reply; Data Protection Commission |
| 5. Changes | published here, dated |

### 3.4 Eight languages

The site is eight-language and so is the app, so the page is built with `data-translate` keys from the
start. **English is ready; the other seven are not.** The switcher already falls back to English when
a language file is missing — I confirmed the live server returns a clean 404 for an absent file, which
is what triggers the fallback. So the page can be published in English today and gain the other seven
later without a single change to the HTML.

> **One thing I had to fix while drafting.** The site's switcher assigns `el.textContent`, which
> destroys any HTML inside a translated element. Three paragraphs in my first draft contained `<strong>`
> and a `mailto:` link and would have been flattened the moment anyone changed language. Every
> translated element is now a leaf node, verified mechanically.

---

## 4. Five things that need your decision

| # | Issue | Recommendation |
|---|---|---|
| **1** | **Legal basis.** The manual says "to be confirmed by legal review". A published policy cannot say that. I have drafted *legitimate interests, Article 6(1)(f), participation voluntary and by invitation*, marked in the HTML source with a `LEGAL REVIEW GATE` comment | **Gate: do not publish until CRIL's legal reviewer confirms.** The same wording must then go into manual section 15 in all eight languages |
| **2** | **Two different contact addresses.** The site shows `acr@blockenergy.eu`; the app, the manual and this policy use `info@acragent.com` | Use `info@acragent.com` for data protection. Decide separately whether the site's general contact address should also change |
| **3** | **Who controls the website.** The site brands itself "BlockEnergy ACR, a research initiative of CRIL & UCD Ireland, and Zhengzhou University". The policy names CRIL alone as controller | Confirm CRIL is the controller for `acragent.com`. If UCD or ZZU are joint controllers, the policy must say so and name the arrangement |
| **4** | **The HIPAA badge.** The footer of every page claims HIPAA compliance. HIPAA is US healthcare law; the app was never intended for the US market, and a privacy policy silent on HIPAA sitting directly above a HIPAA badge is a visible inconsistency a regulator or an App Review reader would notice | Remove the badge, or substantiate it. My draft footer omits it — **this is a decision, not something I should quietly change site-wide** |
| **5** | **The assistant panel is labelled "DeepSeek AI Research Assistant" but sends nothing anywhere.** No privacy problem, but a visitor could reasonably believe they are talking to a third-party AI and type something sensitive | Rename it to something like "ACR Research Assistant (demonstration)", or connect it properly. Out of scope here; raised because I found it |

---

## 5. The plan, in order

Nothing below is done yet. Steps marked **Kraken** cannot be done by Claude.

### Stage 1 — decide (Kraken)

1. Answer the five questions in §4. The legal basis is the only hard gate.
2. Confirm the working rule in §1.1: edit `acr-test-website`, publish from a new `Final_FTP_v2_2_2`.

### Stage 2 — build (Claude, about 30 minutes, after Stage 1)

3. Apply your answers to `docs/website/privacy.html` and regenerate `lang/privacy-en.json`.
4. On your authorisation, copy into `acr-test-website/`: `privacy.html`, `lang/privacy-en.json`, and
   the patched `scripts/language-switcher.js`.
5. Change the footer link from `href="#"` to `href="privacy.html"` in the three pages that have it.
   Three one-line edits, but the markup is not identical in all three — `acr-owl.html` carries an extra
   `data-translate="privacy"` attribute, so a blind find-and-replace across the site misses it:

   | Page | Current markup |
   |---|---|
   | `index.html` | `<a href="#" tabindex="0">Privacy Policy</a>` |
   | `ACR-contact.html` | `<a href="#" tabindex="0">Privacy Policy</a>` |
   | `acr-owl.html` | `<a href="#" tabindex="0" data-translate="privacy">Privacy Policy</a>` |
6. Serve `acr-test-website` locally and check the page renders, the footer link works from all three
   pages, the language selector falls back to English, and the accessibility controls still work.

### Stage 3 — review (Kraken)

> **A preview is already running.** Claude copied the live site into a scratch folder, added the draft
> page and wired the three footer links, and served it locally — nothing in `ACR-platform` was touched.
> See §5.1.

7. Open the local page and read it as a stranger would. This is a legal document under CRIL's name;
   my drafting is a starting point, not an opinion.
8. Legal reviewer signs off the basis wording and, if they wish, the whole page.

### Stage 4 — publish (Kraken)

9. Claude cuts `Final_FTP_v2_2_2/website/` from `acr-test-website`, excluding the development-only
   files listed in §1.1, with a manifest like the earlier bundles.
10. **You** upload it. Claude has no access to the hosting.
11. Verify from a browser and from the command line:
    ```zsh
    curl -s -o /dev/null -w '%{http_code}\n' https://www.acragent.com/privacy.html   # expect 200
    ```
12. Check the live page in one non-English language to confirm the English fallback behaves.

### Stage 5 — connect it up (Claude, then Kraken)

13. Give Apple the URL in App Store Connect → App Privacy and TestFlight test information.
14. Change manual section 15's closing line — *"Full privacy policy available from CRIL on request"* —
    to the URL, in **all eight languages**, regenerate the in-app manual content, rebuild the two
    `.docx` files, and re-run `tests/legal/verify.js`. This lands in Build 49 with the TestFlight work.

### Stage 6 — the other seven languages (**required**, per Kraken 19 September)

15. Translate the page into the other seven languages, from the manual's section 15 where the text
    overlaps, and have them reviewed before publication. The page needs no change to accept them:
    drop in `lang/privacy-<code>.json` and they work. Originally listed as optional; Kraken has asked
    for all eight, matching the site and the app.

---

## 5.1 The preview now running

```
http://127.0.0.1:8099/privacy.html
```

A copy of the live site with the draft page dropped in and the three footer links wired, served from a
scratch folder. `/Users/Kraken/DAPP/ACR-platform` is untouched. To stop it:

```zsh
pkill -f "http.server 8099"
```

---

## 5.2 Amendments requested after Kraken's first review, 19 September 2026

Work to begin Monday 21 September at the earliest.

| # | Requested | Status |
|---|---|---|
| A | Correct the website address and the e-mail address throughout | **Waiting on Kraken** for the exact values. The draft uses `www.acragent.com` and `info@acragent.com` from manual section 15; the live site's contact section says `acr@blockenergy.eu` and `acr.blockenergy.eu`. Decision §4.2 |
| B | All eight languages, not English alone | Accepted — Stage 6 promoted from optional to required |
| C | A cookie confirmation/selection at the start of the website and the app | **See below — recommend a notice, not a consent gate** |

### On C, the cookie banner

The requirement bites where information is stored on or read from a person's device **without consent**,
with an exemption for what is strictly necessary for a service the user explicitly asked for.

What this site does, verified in the code:

- **no cookies at all** — no `document.cookie` anywhere;
- **no analytics, advertising, tracking pixels or profiling**;
- local storage holds the **language the user chose**, the **synthetic case data they typed** so a reload
  does not lose it, and a **sign-in marker** in the restricted areas.

User-set interface preferences such as language, and authentication, are the standard examples of the
exemption — the Article 29 Working Party opinion on consent exemptions names language preference
explicitly. Retaining data the user typed is functionality they requested by typing it.

A consent gate would therefore ask permission for things needing none, and a banner announcing cookies
on a site that sets none is itself inaccurate.

**Recommended instead:** a short first-visit **notice** — one line stating that the site sets no cookies
and does not track, linking to `privacy.html`, dismissible and remembered in local storage.

**The app already has this.** The Privacy & Cookies page rotates into view during the opening sequence,
before any clinical screen, in all eight languages, with READ DETAILS into the full notice. Build 48
shipped it.

**When real consent becomes necessary:** as soon as analytics are added, or the "DeepSeek AI" panel is
connected to a real service and begins sending what people type to a third party. Build the mechanism
then, gating those specific things.

**This is a legal call.** Put it to the legal reviewer together with the legal-basis wording — the same
conversation, one meeting rather than two.

---

## 6. What this unblocks

Once the URL returns 200, the external TestFlight route is clear: test information can be completed,
the private tester group can be opened to the ZZU, UCD and HKU reviewers, and Beta App Review has a
policy to read — which, for an app of this kind, is one of the things a reviewer will look for.

Internal TestFlight testing needs none of this and can proceed in parallel.
