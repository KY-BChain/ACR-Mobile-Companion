# ACR Companion (version 0.6.7): how the app works — review and test list for ZZU reviewers

**Date:** 20 September 2026
**Status:** approved by CRIL for the ZZU review. Not for public distribution.
**For:** ZZU clinical reviewers and review testers.
**Test data:** synthetic cases only. Do not enter any real patient's details. The app asks for no name or hospital number, and gives each assessment a random reference instead.
**Not for clinical use:** the app is an evaluation of decision support. Its results must not be used to treat a patient.

---

## How to use this document

The document explains, step by step, what the ACR Companion app does (**Part B**) and the clinical rules on the ACR Platform that decide what it shows (**Part C**). **Part D** answers one question already raised about tumour size. **Part E** is a set of synthetic test cases with the result we expect. **Part F** lists the clinical questions this review is asked to answer.

Each numbered step ends with a confirmation box. Please mark one and add a comment where needed:

> ☐ **Confirmed** — works as described and is clinically acceptable
> ☐ **Needs change** — please describe
> ☐ **Not agreed** — please explain
> Comment:

A step can work exactly as described and still be clinically wrong. Please tell us in either case.

---

## Part A — Before you start

| | |
|---|---|
| Phones | Android (any recent phone) or iPhone |
| Access | A personal invite code from CRIL. It pairs with the first phone it is entered on, for 30 days |
| Connection | Internet access. The app talks only to the ACR evaluation service; it holds no clinical rules itself |
| Languages | English, 简体中文, Français, Deutsch, Русский, العربية, 한국어, 日本語. **Only English and Chinese have been checked; the other translations are drafts** |
| Your records | Please note the phone model, the language used, and the time of each test |

---

## Part B — The app, step by step (logical flow)

### B1. Opening the app and choosing a language
The app opens with a title poster, then the Welcome screen, where the language can be changed. All screens follow the chosen language; Arabic reads right to left.

**Test:** open the app, choose 简体中文, then English.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B2. Evaluation access and the invite code
On **Evaluation access** you enter your invite code and tap **Connect securely**.
- The **first** phone to use a code is paired with it. A pop-up says: *"Invite Code accepted and paired with this mobile device and this mobile device only. For 30 days."*
- The same phone can enter its own code again, for example after **Disconnect access**. The 30 days do not restart.
- Another phone using the same code is refused: *"Incorrect device used."*
- After 30 days: *"Invite Code Expired. Request a refreshed one."*
- Once paired, the phone reconnects by itself each time the app is opened, with no code.

**Test:** enter your code; check the pop-up; close and reopen the app and check that no code is asked for.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B3. Live platform or Synthetic demonstration
On the same screen you choose how results are produced:
- **Live platform**: your entries are sent to the ACR Platform, which runs the clinical rules now.
- **Synthetic demonstration** (shown in amber): no rules are run. The app loads one fixed demonstration case, and the service shows a result recorded earlier from the live platform for exactly that case. If any demonstration value is changed, no result is returned and Review warns you in red.

**Test:** select Synthetic demonstration and check that the button turns amber.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B4. Screen 1 of 5 — receptors
ER, PR and HER2 (Positive / Negative) and Ki-67 (%). **These four are required**: Next stays disabled until Ki-67 is a number from 0 to 100. The app also shows the random assessment reference here.
- There is **no "HER2 2+, ISH pending" choice** (see Part F).
- The hint reads *"Luminal A < 14, Luminal B ≥ 14"*. It is guidance only; the platform decides the subtype.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B5. Screen 2 of 5 — tumour
Stage (0 to IV, with sub-stages), grade (1–3), histological subtype (IDC, ILC, DCIS, Paget's disease), nodal status (N0–N3) and age (18–120). All are optional. Stage, grade, nodal status and age are marked **"needed for a full assessment"** (see C4).

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B6. Screen 3 of 5 — blood markers, surgery date and Bayesian option
CA 15-3 (U/mL), CEA (ng/mL), surgery date (YYYY-MM-DD; future dates allowed) and **Bayesian enhancement On/Off**. All optional.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B7. Screen 4 of 5 — tumour size and gender; Screen 5 of 5 — further fields
- **Screen 4:** tumour size (a number above 0; **the unit is not yet decided**, see Part F) and gender.
- **Screen 5:** ECOG (0–4), PD-L1 (positive / negative / not tested), HER2-low (positive / negative / unknown), LVEF (%, 0–100) and treatment intent (neoadjuvant / adjuvant / unspecified).
- These two screens are labelled "Evaluation only · provisional fields". Tumour size and ECOG are marked "needed for a full assessment".
- After typing a number, the keyboard closes with **Done** (iPhone) or the keyboard's ✓ key (Android), so Next and Review are never hidden.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B8. Sample values when a new assessment starts
To make testing quicker, screens 1–3 open **already filled** with one synthetic sample case: ER+, PR+, HER2−, Ki-67 25, stage II, grade 2, IDC, N0, age 52, CA 15-3 40.0, CEA 6.0, surgery 2026-03-14, Bayesian On. Screens 4 and 5 open empty. Any sample value you have not changed is marked on Review as *"sample value, not changed"*.

**Question for you:** for trial use, should screens 1–3 open empty instead?

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B9. Review
Review lists every value before anything is sent.
- **Red box, "Needed for a full assessment":** lists blank values the platform needs, each with a "Go to …" link to its screen. You may still submit.
- **Red box, "Demonstration case changed":** appears in demonstration mode when a value was changed.
- **Baseline:** shows whether the platform's identity has been verified (see B10).

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B10. Submitting: the safety check first
Before a live assessment is sent, the service checks that the platform is exactly the approved version: reasoner v2.2, the approved ontology fingerprint, and the approved number of rules. If anything differs, or the platform cannot be reached, **no result is shown**. A stop screen explains why ("Server not connected", or "does not match the accepted baseline"). The app never falls back silently to a demonstration result.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B11. The result screen
From top to bottom:
1. **Clinical summary:** molecular subtype, and **Risk** in your language (English HIGH / INTERMEDIATE / LOW; Chinese 高危 / 中危 / 低危). Red is high, green is low, blue anything else.
2. **"Full assessment not reached"**, only for incomplete cases (B12).
3. **Warnings and context:** the platform's own completeness message, unchanged, in English.
4. **Information completeness:** the completeness level (tier) and any missing values, with their screen numbers.
5. **Treatment options returned**, exactly as the platform wrote them.
6. **Biomarker results returned.**
7. **Classification confidence** (when Bayesian is On): see C7, which explains an important limitation.
8. **Technical details** (open by default): fired rules, reasoning trace, raw values and platform version.

The result is kept only while the screen is open. Nothing is stored on the phone.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B12. An incomplete case
If the platform needs a value you left blank:
- The summary says **"Full assessment not reached"** and names the value and its screen, for example *"Tumour size (screen 4 of 5)"*.
- Risk reads **"withheld — needs Tumour size"**.
- Under Technical details, the platform's internal "deterministic risk" is greyed out and labelled *"(not an assessed risk)"*.
- **Complete missing fields** opens that screen with **everything you entered kept**. You add the value and submit again.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### B13. Ending, disconnecting and losing the connection
- **New assessment** and **Done** clear all entries and return to Evaluation access. The phone stays signed in.
- **Disconnect access** asks first: *"You'll need to re-enter the invite code again."*
- **Without the connection:** a signed-in phone shows *"Signed in on this device — waiting for the server"* with **Retry check**. The connection is re-checked within about 10 seconds and every time the app is reopened.
- **Offline walkthrough:** a paired phone can walk through the five screens without a connection. No result is produced.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

---

## Part C — The clinical flow on the ACR Platform

The app contains **no clinical rules**. Every subtype, risk, treatment line, alert and probability comes from the ACR Platform, which works in two parts:
- **the deterministic part:** the ACR ontology with SWRL rules, run by the Openllet reasoner, plus the platform's Java rules;
- **the optional Bayesian module.**

### C1. Molecular subtype: ontology rules R1–R6 (the normal path)
These are the rules ZZU reviewed in version 2.1. The app sends ER, PR and HER2 as positive or negative, and Ki-67 as a number.

| Rule | Condition | Subtype |
|---|---|---|
| R1 | ER+, PR+, HER2−, Ki-67 **< 14** | Luminal A |
| R2 | ER+, HER2−, Ki-67 **≥ 14** | Luminal B HER2− |
| R3 | ER+, HER2−, PR− | Luminal B HER2− |
| R4 | HER2+, ER−, PR− | HER2-enriched |
| R5 | ER−, PR−, HER2− | Triple negative |
| R6 | ER+, HER2+ | Luminal B HER2+ |

**Not covered by R1–R6:** ER− with PR+ (any HER2). Such cases go to the backup path in C2.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### C2. Molecular subtype: the backup path
If the reasoner fails, takes longer than 5 seconds, or finds no matching rule, the platform uses a simpler Java classification. The result's Technical details then show **"JAVA_HARDCODED_FALLBACK"** instead of "OPENLLET_SWRL". **It does not match R1–R6 in two ways:**

| Case | Ontology rules | Backup path |
|---|---|---|
| ER+ or PR+, HER2−, Ki-67 between 14 and 20 | Luminal B (R2) | **Luminal A**: the backup's cut-off is Ki-67 **> 20** |
| ER+, HER2+ | Luminal B HER2+ (R6) | **HER2-enriched**: every HER2+ case |
| ER−, PR+, HER2− | no rule | Luminal A or B by Ki-67 > 20 |

In ZZU's v2.1 review, R2 was marked *"Clarify Ki-67 threshold (14% vs 20%)"*. The question is still open.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### C3. In-situ disease and blood-marker rules (R65–R71)

| Rule | Condition | What the app shows |
|---|---|---|
| RD-1 | Histology DCIS | Treatment options replaced by one line: *"In-situ diagnosis (DCIS): primary surgical pathway. Adjuvant systemic therapy options pending invasive component confirmation."* |
| RD-1b | Histology Paget's disease | The same, for Paget's disease |
| RD-2 | DCIS and Ki-67 > 20 | Invasive-component review flag. **Shown only under Technical details → Fired rules** |
| RD-3 | DCIS and any positive node (N1–N3) | The same, only under Technical details |
| RE3 | CA 15-3 > 35 U/mL | Alert fired. **Only under Technical details** |
| RE4-1 | CEA > 5 ng/mL | Alert fired. **Only under Technical details** |
| RE4-2 | Both raised | Higher-priority alert. **Only under Technical details** |

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### C4. Completeness: when a full assessment is possible
The platform grades every case into one of three tiers, in this order:

| Tier | When | Platform message | Effect |
|---|---|---|---|
| 1 | Any of **ER, PR, HER2, Ki-67, grade, tumour size, nodal status, age** is missing | ❌ ASSESSMENT BLOCKED | Risk withheld |
| 2 | All eight present, but **stage** or **ECOG** missing | 🔴 BIOMARKER ASSESSMENT ONLY | Risk withheld |
| 3 | All ten present | ✅ FULL ASSESSMENT | Risk shown |

Despite the word "BLOCKED", the platform **still returns** the subtype, treatment lines, biomarkers and Bayesian result at tier 1 and 2. **Only the risk is withheld.** The other ten fields (histology, markers, surgery date, Bayesian option, gender, PD-L1, HER2-low, LVEF, treatment intent) never change the tier.

**When stage is missing,** the platform also adds *"⚠️ BIOMARKER ASSESSMENT — STAGING PENDING … The treatment options below are subtype-specific and apply regardless of stage"*, and removes stage-dependent treatment lines.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### C5. Risk
A points score, then three adjustments. **Risk is always a word, never a percentage.**

| Factor | Points |
|---|---|
| Age 50 or over | +1 |
| Tumour size over 20 | +2 |
| Ki-67 over 30 | +2 |
| Grade 3 | +2 |
| Triple negative or HER2-enriched | +2 |

**0–1 = LOW, 2–4 = INTERMEDIATE, 5 or more = HIGH.** Then, in order:

1. **Rule C (stage and subtype).** The platform counts triple negative, HER2-enriched and Luminal B HER2+ as higher-risk subtypes.
   - Stage III: a higher-risk subtype becomes HIGH; any other LOW becomes INTERMEDIATE.
   - Stage II: LOW becomes INTERMEDIATE for a higher-risk subtype.
   - Stage I: LOW becomes INTERMEDIATE for Luminal B.
2. **Rule A:** stage III or IV → HIGH.
3. **Rule B:** ECOG 2 or more raises the level by one step.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### C6. Treatment lines
**The treatment lines come from the platform's Java rules, keyed on the subtype.** The ontology's treatment, MDT and staging rules (R7–R32 and later) **did not fire in any recorded test**, because they need values the app does not collect: T and M categories, IHC scores, BI-RADS, and similar.

| Subtype | Base line(s) |
|---|---|
| Luminal A | Endocrine therapy (Tamoxifen or Aromatase Inhibitor) |
| Luminal B HER2− | Chemotherapy + Endocrine therapy |
| Luminal B HER2+ | HER2-targeted therapy (Trastuzumab) + Endocrine therapy |
| HER2-enriched | HER2-targeted therapy (Trastuzumab) · Chemotherapy |
| Triple negative | Chemotherapy · Consider immunotherapy (PD-L1 evaluation recommended) |

**Added lines:**
- **PD-L1** (triple negative only): positive → *"Pembrolizumab (PD-L1 positive TNBC, IO eligibility)"*; negative → *"Chemotherapy-only pathway (PD-L1 negative TNBC — IO not indicated)"*.
- **HER2-low positive and stage IV:** *"Trastuzumab deruxtecan (T-DXd) — HER2-low metastatic pathway"*.
- **ECOG 2 or more:** *"Performance-adjusted dosing (ECOG n — consider dose reduction or best supportive care)"*.
- **HER2-positive subtype with LVEF below 55:** *"Cardiology consult before/during HER2 therapy (LVEF n% — cardiotoxicity risk)"*.
- **Treatment intent:**
  - Luminal B HER2−, neoadjuvant → *"Neoadjuvant chemotherapy + endocrine therapy (R17a — Luminal B T2 pre-surgery)"*.
  - Luminal B HER2−, adjuvant → *"Adjuvant chemotherapy + endocrine therapy (R17b — Luminal B T2 post-surgery)"*. **These say "T2", but the platform checks neither tumour size nor stage.**
  - Other subtypes → *"Neoadjuvant / Adjuvant treatment context flagged"*.
- **Surgery date** (R33, R34), counted from the day of the assessment:
  - up to 2 years → *"Follow-up cadence: every 3-4 months clinical + annual imaging"*;
  - 2–5 years → *"every 6 months clinical + annual imaging"*;
  - a future surgery date is ignored, with no message.

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

### C7. The Bayesian module (optional)
When Bayesian enhancement is On:
- **Step 1, prior:** the platform starts from a probability for each of **five** groups (Luminal A, Luminal B, HER2-enriched, triple negative, normal-like), chosen by age band: under 40, 40–49, 50–59, 60–69, 70 and over. A missing age is treated as 40–49.
- **Step 2, likelihoods:** it multiplies in fixed likelihood values for ER, PR and HER2; Ki-67 below 14, 14–30 or above 30; and grade 1 or grade 3 (grade 2 has no effect).
- **Step 3, result:** it shows the resulting probability for each group. **"Classification confidence" is the highest of these probabilities.**
- **Step 4, range:** the "uncertainty" range is that value plus or minus a margin of 3% to 15%, larger when the top two groups are close. It is a rule of thumb, not a statistical interval.

**Important limitations for your review:**
1. **The Bayesian module does not use the subtype the rules decided.** Its highest group can differ from it. In the demonstration case (Part E, test E1) the result is **Luminal B HER2−**, but the 60.02% "classification confidence" is the Bayesian probability of **Luminal A**; Luminal B is about 36%.
2. **It does not separate Luminal B HER2− from HER2+,** and it ignores stage, nodes, tumour size and all other fields.
3. **The prior and likelihood values are fixed in the platform's code,** labelled "based on epidemiological data", with no stated source. They have not been calibrated against patient outcomes.
4. **Turning it Off never changes the subtype, risk or treatment lines.**

> ☐ Confirmed ☐ Needs change ☐ Not agreed · Comment:

---

## Part D — The tumour size question

**Question** (Kraken, CRIL, 16 September 2026): *leaving tumour size empty in the app prevents the CDS result. Is this A, the app's logical flow; B, a clinical flow; or C, built into the ACR ontology SWRL Openllet reasoner back end?*

**Answer:**
- **It is C, with one correction.** The rule is in the platform back end, but in the platform's Java completeness check (C4), not in the SWRL rules or the Openllet reasoner. No SWRL rule reads tumour size.
- **It is not A.** The app blocks nothing. A blank tumour size is sent as "no value", and Version 0.6.7 only explains the platform's decision and offers the way back to screen 4.
- **It blocks less than the word "BLOCKED" suggests.** The platform still returns the subtype, treatment lines, biomarkers and Bayesian result. It withholds only the **risk**, because tumour size over 20 is part of the risk score (C5).
- **Where B applies:** treating tumour size as essential is a **clinical judgement** written into that check. Whether a patient who has not yet had imaging should be blocked, or given a preliminary result, is a clinical decision for ZZU (Part F, question F1). Changing it would be a platform change, not an app change.

> ☐ Agreed ☐ Not agreed · Comment:

---

## Part E — Test cases (synthetic)

**Starting point:** start every test from the **demonstration case** unless it says otherwise: the screens 1–3 sample (B8) plus tumour size 22, female, ECOG 1, PD-L1 negative, HER2-low positive, LVEF 60, adjuvant. Use **Live platform**, and change only what each test lists. Subtypes appear in the app as written in the platform: *LuminalA, LuminalB_HER2Negative, LuminalB_HER2Positive, HER2Enriched, TripleNegative*.

| # | Change from the demonstration case | Expected result | Result as seen | ☐ Pass ☐ Fail |
|---|---|---|---|---|
| E1 | None | Tier 3 · LuminalB_HER2Negative · **INTERMEDIATE** · Chemotherapy + Endocrine therapy; Adjuvant chemotherapy + endocrine therapy (R17b); follow-up every 3–4 months · confidence about 60% (Luminal A, see C7) | | |
| E2 | Tumour size and ECOG left **blank** | Tier 1 · "Full assessment not reached", Tumour size (screen 4) · Risk withheld · subtype and treatment lines still shown | | |
| E3 | From E2, tap **Complete missing fields**, enter tumour size 22, submit | Screen 4 opens with values kept · Tier 2 · ECOG score (screen 5) needed · Risk withheld | | |
| E4 | ECOG **3** | Tier 3 · Risk **HIGH** (Rule B) · extra line "Performance-adjusted dosing (ECOG 3 …)" | | |
| E5 | Ki-67 **10** | **LuminalA** (R1) · Endocrine therapy · "Adjuvant treatment context flagged" · Risk INTERMEDIATE | | |
| E6 | Ki-67 **17** | **LuminalB_HER2Negative** (R2, Ki-67 ≥ 14) · Technical details show OPENLLET_SWRL. Note: the backup path would call this Luminal A (C2) | | |
| E7 | ER−, PR−, HER2−, grade 3, PD-L1 **positive** | **TripleNegative** · Risk **HIGH** · Chemotherapy; Consider immunotherapy; Pembrolizumab (PD-L1 positive TNBC) | | |
| E8 | HER2 **positive**, HER2-low **negative**, LVEF **50** | **LuminalB_HER2Positive** (R6) · Trastuzumab + Endocrine therapy · Cardiology consult (LVEF 50%) · Risk INTERMEDIATE | | |
| E9 | Histology **DCIS**, stage **0** | Treatment options show only "In-situ diagnosis (DCIS): primary surgical pathway…" · RD-1 and RD-2 under Fired rules | | |
| E10 | Stage **IV**, treatment intent **unspecified** | Risk **HIGH** (Rule A) · T-DXd HER2-low metastatic line | | |
| E11 | Stage **blank** | Tier 2 · stage needed (screen 2) · "BIOMARKER ASSESSMENT — STAGING PENDING" · Risk withheld | | |
| E12 | CA 15-3 **20**, CEA **3** (normal) | RE3, RE4-1 and RE4-2 no longer under Fired rules. With the sample values (40 and 6) they fire, but appear only under Technical details | | |
| E13 | Bayesian **Off** | "Bayesian enhancement was not used" · subtype, risk and treatment lines as E1 | | |
| E14 | Choose **Synthetic demonstration**, submit unchanged; then change one value | First: recorded E1 result, labelled synthetic · Second: red "Demonstration case changed" on Review, no result | | |
| E15 | Language **简体中文**, repeat E1 and E4 | Risk shows **中危**, then **高危**; colours unchanged | | |

---

## Part F — Clinical questions for ZZU

These questions need your clinical judgement. Our suggested starting point is given in each case; please accept, change or reject it.

| # | Question | CRIL's suggestion |
|---|---|---|
| F1 | **Incomplete cases.** When pathology (ER, PR, HER2, Ki-67) is available, may tumour size, nodal status, stage or ECOG legitimately still be unknown, for example before imaging? Should such a case get a "preliminary result, pending [the missing test]" instead of "blocked"? What may that result say? | Tumour size, nodal status and stage can be pending; grade, age and ECOG should be known. A preliminary result names the missing data and gives no next-procedure advice |
| F2 | **Ki-67 threshold.** Is Luminal A/B split at 14 (ontology rules R1/R2) or 20 (backup path, and RD-2)? This repeats ZZU's own v2.1 note | One threshold everywhere, chosen by ZZU |
| F3 | **HER2-positive with ER-positive.** The ontology says Luminal B HER2+ (R6); the backup path says HER2-enriched. Which is right? And ER− with PR+: which subtype? | Follow R6; add a rule for ER−/PR+ |
| F4 | **HER2 equivocal.** Should the app offer "HER2 2+, ISH pending"? What should the platform then do? | Offer it; withhold the subtype until ISH |
| F5 | **Staging.** Does "stage" mean AJCC 8th anatomic or prognostic stage? Are tumour size and nodal status clinical (before surgery) or pathological? | Clinical stage at the point of use, named on screen |
| F6 | **Tumour size unit.** Millimetres? Precision and plausible range? | Millimetres, whole numbers |
| F7 | **Bayesian confidence.** Is a percentage acceptable when it may belong to a different subtype from the one shown (C7)? Should it be shown for the shown subtype only, relabelled, or hidden? | Show it only when it refers to the displayed subtype, with a clear label |
| F8 | **Alerts shown only under Technical details:** CA 15-3 or CEA raised (RE3, RE4), and DCIS with Ki-67 > 20 or positive nodes (RD-2, RD-3). Should they appear in the clinical summary? | Yes, in the Warnings box |
| F9 | **R17a/R17b say "Luminal B T2"** but are applied without checking tumour size or stage, even at stage IV. Acceptable? | Apply only when the stage and size conditions are met |
| F10 | **Treatment and MDT rules** (R7–R32 and later) cannot fire from the app's 20 fields. Is the platform's simpler subtype-based treatment list (C6) acceptable for this evaluation, or must further fields be added? | Keep for evaluation; add fields only by agreed priority |
| F11 | **Sample values** on screens 1–3 (B8): keep for testing, or open empty for trial use? | Open empty for trial use |
| F12 | **Risk colours:** red HIGH, green LOW, blue INTERMEDIATE. Acceptable? | As shown |

**Signed for ZZU:** ____________________ **Role:** ____________________ **Date:** ____________

---

*Prepared by CRIL from the ACR Companion app version 0.6.7 (build 49) and the ACR Platform as tested on 20 September 2026 (reasoner v2.2, 71 logical / 76 loaded rules). Detailed technical records are held by CRIL.*
