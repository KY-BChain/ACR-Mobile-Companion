# ACR Companion (version 0.6.6): user manual for reviewers

**Date:** 17 September 2026
**Status:** DRAFT, for Kraken (CRIL) to approve before it is sent to reviewers.
**For:** invited clinical reviewers and review testers.
**Chinese version:** ACR_Companion_User_Manual_ZH-CN_17SEPT26.

---

## 1. Before you read on

- **Synthetic data only.** Never enter a real patient's details, not even coded or pseudonymised ones. The app asks for no name or hospital number.
- **Not for clinical use.** Results are decision support for evaluation. They must not be used to diagnose or treat anyone.
- **The app contains no clinical rules.** Everything you see in a result comes from the ACR Platform. The app collects your entries, sends them securely and shows the answer.
- **How the rules work** (subtype, risk, treatment lines, Bayesian confidence) is explained in the companion document *ACR Companion — review and test list for ZZU reviewers*. This manual explains how to use the app.

In this manual, **bold words** are the names of buttons and screens exactly as they appear in English.

---

## 2. What you need

| | |
|---|---|
| Phone | An Android phone, or an iPhone |
| Invite code | A personal code sent to you by CRIL. Keep it private |
| Internet | Wi-Fi or mobile data, to get results |
| Language | English (UK), 简体中文, Français, Deutsch, Русский, العربية, 한국어 or 日本語. Only English and Chinese have been checked so far; the other translations are drafts |

---

## 3. Installing the app

**CRIL will tell you how to obtain the app for your phone.** Install only the file or link CRIL sends you.

**Android**
1. Open the installation file (ending in `.apk`) that CRIL sent you.
2. If the phone asks, allow installation from this source (for example, your browser or file manager). Some phones, such as Xiaomi and Samsung, show an extra security prompt: choose to continue.
3. When installation finishes, open **ACR Companion**.

**iPhone**
iPhone installation is arranged separately by CRIL. The first time the app is opened, the iPhone may ask you to trust the developer: go to *Settings → General → VPN & Device Management* and trust it.

If an earlier version is already installed, CRIL will tell you whether to update over it or to remove it first.

---

## 4. The screens at a glance

| Order | Screen | What you do there |
|---|---|---|
| — | **Evaluation access** | Connect with your invite code; choose Live platform or Synthetic demonstration |
| — | Welcome (**Before you begin**) | Read the notices; change the language; open **About** |
| 1 of 5 | **Receptor status** | ER, PR, HER2, Ki-67 |
| 2 of 5 | **Tumour characteristics** | Stage, grade, histology, nodal status, age |
| 3 of 5 | **Biomarkers and surgery** | CA 15-3, CEA, surgery date, Bayesian option |
| 4 of 5 | **Core contract fields** | Tumour size, gender |
| 5 of 5 | **Additional contract fields** | ECOG, PD-L1, HER2-low, LVEF, treatment intent |
| — | **Review** | Check everything, then **Submit** |
| — | **Assessment result** | Read the result |

Each entry screen shows *Step n of 5* at the top, with **Back** and **Next** at the bottom.

---

## 5. Opening the app and choosing a language

1. Open the app. It starts on **Evaluation access**.
2. To change the language, tap **Back** to reach the Welcome screen, tap **Language** and choose. Every screen follows your choice; Arabic reads right to left.
3. The Welcome screen also has **About**, which describes the ACR Platform and shows the app's version.
4. If you stay on the Welcome screen for a few seconds, a one-page introduction poster appears. Swipe sideways for the **Privacy & Cookies** notice, where **READ DETAILS** opens this manual on the phone. Swipe up to continue.
5. Tap **I understand — Begin** to go back to **Evaluation access**.

---

## 6. Connecting for the first time

1. On **Evaluation access**, type your invite code in **Invite code**.
2. Tap **Connect securely**.
3. A message confirms: *"Invite Code accepted and paired with this mobile device and this mobile device only. For 30 days."* It also shows the pairing date and the expiry date (in UTC). Tap **Continue**.
4. Tap **Next** to start an assessment.

**Please note:**
- **Your code works on one phone only.** The first phone it is entered on is paired with it. On any other phone the app says *"Incorrect device used."*
- **Access lasts 30 days** from pairing. After that the app says *"Invite Code Expired. Request a refreshed one."* Ask CRIL for a new code.
- **You only enter the code once.** Afterwards the app reconnects by itself whenever it is opened. You would enter it again only after **Disconnect access** (see section 12), and the 30 days do not restart.
- The code itself is never stored on the phone.

### The connection panel
**Connection evidence** on the same screen shows:
- **Gateway:** **Connected**, **Server not connected** or **Checking…**
- **Baseline attestation:** **VERIFIED** means the ACR Platform is exactly the approved version, and live results can be produced. **MISMATCH** or **UNAVAILABLE** means live results are blocked.

---

## 7. Live platform or Synthetic demonstration

Choose under **Delivery mode** before you start:

| Choice | What happens | Use it for |
|---|---|---|
| **Live platform** (blue) | Your entries are sent to the ACR Platform, which applies its clinical rules now | All real test cases |
| **Synthetic demonstration** (amber) | No rules are run. The app fills in one fixed demonstration case, and the service shows a result recorded earlier from the live platform for exactly that case | A quick look at a complete result, or when the live platform is offline |

In demonstration mode, **do not change any value**. If you do, Review shows a red **Demonstration case changed** box and no result is returned.

---

## 8. Entering a case

### General tips
- **Required fields:** only ER, PR, HER2 and Ki-67 on screen 1. **Next** stays unavailable until Ki-67 is a number from 0 to 100.
- **Everything else is optional,** but some values are marked **needed for a full assessment**. Without them the platform still answers, but withholds the risk (section 10).
- **Choices** are buttons: tap one to select it.
- **Numbers:** after typing, tap **Done** above the keyboard (iPhone) or the keyboard's tick/done key (Android) to close the keyboard.
- **Mistakes:** an invalid value is shown in red with a short explanation, for example *"Enter a value from 0 to 100."*
- **Sample values:** to save time, screens 1–3 of a new Live assessment open **already filled** with a synthetic sample case. Change them as your test requires. Screens 4 and 5 open empty.

### Screen 1 of 5 — Receptor status

| Field | Entry | |
|---|---|---|
| ER status | positive / negative | required |
| PR status | positive / negative | required |
| HER2 status | positive / negative | required |
| Ki-67 (%) | 0–100 | required |

The hint *"Luminal A < 14, Luminal B ≥ 14"* is guidance only; the platform decides the subtype. *Please note: HER2 currently offers Positive or Negative only. There is no "2+, ISH pending" (equivocal) choice yet. A case that would normally be recorded as equivocal cannot be entered as such at this time; please tell CRIL if this affects your testing.*

The screen also shows the **Session ID**, a random reference created for each assessment. It is not a patient identifier.

### Screen 2 of 5 — Tumour characteristics

| Field | Entry | |
|---|---|---|
| Stage | 0 to IV, with sub-stages | needed for a full assessment |
| Grade | 1, 2 or 3 | needed for a full assessment |
| Histological subtype | IDC, ILC, DCIS or Paget's disease | optional |
| Nodal status | N0, N1, N2 or N3 | needed for a full assessment |
| Age (years) | whole years, 18–120 | needed for a full assessment |

### Screen 3 of 5 — Biomarkers and surgery

| Field | Entry | |
|---|---|---|
| CA 15-3 (U/mL) | 0 or more | optional |
| CEA (ng/mL) | 0 or more | optional |
| Surgery date | YYYY-MM-DD (future dates are accepted) | optional |
| Bayesian enhancement | ON / OFF | optional |

### Screen 4 of 5 — Core contract fields
This screen and the next are labelled **EVALUATION ONLY · PROVISIONAL FIELDS**: their clinical definitions are still under review.

| Field | Entry | |
|---|---|---|
| Tumour size | a number above 0. **The unit is not yet decided** | needed for a full assessment |
| Gender | female / male / other / unknown | optional |

### Screen 5 of 5 — Additional contract fields

| Field | Entry | |
|---|---|---|
| ECOG score | whole number, 0–4 | needed for a full assessment |
| PD-L1 status | positive / negative / not tested | optional |
| HER2-low | positive / negative / unknown | optional |
| LVEF (%) | 0–100 | optional |
| Treatment intent | neoadjuvant / adjuvant / unspecified | optional |

Tap **Review** when finished.

---

## 9. Review and Submit

**Review** lists every value before anything is sent.

- **Red box "Needed for a full assessment":** lists values you left blank that the platform needs. Tap a **Go to …** link to jump to that screen; your other entries are kept. **You may still submit.**
- **"sample value, not changed":** marks a sample value you have not changed, so you can tell your own entries apart.
- **Delivery mode:** shows Live or Synthetic demonstration (in amber).
- **Baseline:** submission is only possible when the platform is **VERIFIED**.

Tap **Edit** to return to screen 1, or **Submit** to send the case.

When you submit a live case, the service first checks that the platform is still the approved version. If it cannot confirm this, **no result is shown**. You see **Service unavailable** with the reason, for example that the platform does not match the approved version. **Retry verification** repeats only the check; it never resubmits your case.

*Please note: the platform's own "ASSESSMENT BLOCKED" wording, which you may see inside a completed result for an incomplete case (section 10), is different. That result still shows the subtype, treatment lines and biomarkers; only the risk is withheld.*

---

## 10. Reading the result

The **Assessment result** screen shows, from top to bottom:

1. **Clinical summary:** **Molecular subtype** and **Risk**. Risk is a word in your language: HIGH, INTERMEDIATE or LOW. Red means high, green low, blue anything else. A line says where the result came from (verified live platform, or a previously recorded synthetic result).
2. **Full assessment not reached** (incomplete cases only; see below).
3. **Warnings and context:** the platform's own messages, shown unchanged, in English.
4. **Information completeness:** the completeness tier and any missing values, with their screen numbers.
5. **Treatment options returned:** exactly as the platform wrote them.
6. **Biomarker results returned.**
7. **Classification confidence:** shown when Bayesian enhancement is ON. Read the review and test list, section C7, before relying on this figure: it may refer to a different subtype from the one shown.
8. **Technical details:** fired rules, reasoning trace, raw values and the platform version.

### When a case is incomplete
If you left out a value the platform needs:
- **Full assessment not reached** names the missing values and their screens, for example *"Tumour size (screen 4 of 5)"*.
- **Risk** reads *"withheld — needs …"*.
- The subtype, treatment options and biomarkers are **still shown**.
- Tap **Complete missing fields**. The app opens the screen with the first missing value, **keeping everything you entered**. Add the value, go to **Review** and submit again.

### The result is not saved
The result exists only while the screen is open. Nothing is written to the phone's storage. If you need a record, note the values by hand, or take a screenshot where your organisation allows it.

---

## 11. Starting another assessment

Tap **New assessment** or **Done**. All entries are cleared and the app returns to **Evaluation access**, still connected. Tap **Next** to begin.

---

## 12. Disconnecting

On **Evaluation access**, tap **Disconnect access**. The app asks you to confirm: *"You'll need to re-enter the invite code again."* Tap **Disconnect**. Do this only if CRIL asks you to, or if you are handing the phone to someone else.

---

## 13. Messages and what to do

| What you see | What it means | What to do |
|---|---|---|
| **Checking…** | The app is contacting the service | Wait up to about 10 seconds |
| **Signed in on this device** — *"Waiting for the server…"* | You are paired, but the service cannot be reached | Check your internet; tap **Retry check**. No invite code is needed |
| **Server not connected** | The ACR evaluation service is offline | Try later, or tell CRIL. You can still use **Synthetic demonstration** if offered |
| **Gateway connected — Live Platform offline** | The service is up but the ACR Platform is not | Use **Synthetic demonstration**, or try later |
| **Service unavailable** / **MISMATCH** | The platform is not the approved version | Do not continue with live tests; tell CRIL |
| *"Incorrect device used."* | The code is paired with another phone | Use your paired phone, or ask CRIL for a new code |
| *"Invite Code Expired. Request a refreshed one."* | The 30 days have passed | Ask CRIL for a new code |
| **Demonstration case changed** (red) | A demonstration value was altered | Put it back, or switch to **Live platform** |
| **The verified synthetic fixture is unavailable.** | No recorded demonstration is available | Use **Live platform**; or, on a paired phone, **Walk through all five screens** to look at the screens without a result |
| *"Too many requests…"* | Too many attempts in a short time | Wait a few minutes |
| *"The assessment outcome is uncertain."* | The answer did not arrive clearly | Do not resubmit repeatedly; note the time and tell CRIL |

---

## 14. Your data and privacy

- The invite code is never stored. Your session and a random installation identifier are kept only in the phone's secure keystore and are removed when you disconnect.
- Case entries and results are held in memory only, and cleared when the assessment ends.
- The app has no analytics and no advertising, and cannot be updated over the air: every change is a new, reviewed version.
- The service records technical events (for example, time and outcome of a request) to keep it secure; it does not record clinical values.

---

## 15. Legal notice: GDPR and cookies

*Covers this app only. The ACR Platform website has its own notice.*

### Cookies
This app uses no cookies, web beacons or tracking technology.

### Data protection
Controller: Cornerstone Research International Ltd (CRIL), c/o NovaUCD, Belfield Innovation Park, University College Dublin, Dublin 4, D04 V2P1, Ireland. E-mail: info@acragent.com · www.acragent.com

- Data collected: invite label and organisation tag; a random device identifier created by the app (held only in hashed form); pairing and expiry dates; app version; security events and request records (time, route, outcome — never content).
- Network data: your IP address is processed by our network provider, Cloudflare, to deliver and protect the service.
- Not collected: your name or contact details, or any patient data. Synthetic case entries are processed only to return a result and are not stored.
- Purpose: running and securing this invited evaluation.
- Legal basis: to be confirmed by legal review.
- Recipients: Cloudflare, Inc., which may process data outside your country.
- Retention: access ends 30 days after pairing, or on revocation; records are deleted 30 days after the evaluation ends. CRIL may amend this period.
- Your rights: access, correction, deletion, restriction and objection — contact CRIL (section 16). EU/EEA/UK: you may complain to your data protection authority.

*Full privacy policy available from CRIL on request.*

---

## 16. Reporting a problem or a comment

Please send your findings to CRIL with:
- the phone model and operating system version;
- the app version (**About**);
- the language used;
- the date and time;
- what you entered (synthetic values only), what you expected and what you saw;
- a screenshot, if helpful.

Clinical comments on the rules themselves belong in the *review and test list*.

---

## 17. Terms used

| Term | Meaning |
|---|---|
| ACR Platform | The server that holds the medical knowledge model and rules, and produces results |
| Gateway | The secure service between the app and the ACR Platform |
| Baseline / attestation | The check that the platform is exactly the approved version |
| Tier | How complete the case is: 1 or 2 means risk is withheld; 3 is a full assessment |
| Synthetic | Invented test data, not from any patient |
| Bayesian enhancement | An optional probability estimate added to the rule-based result |
