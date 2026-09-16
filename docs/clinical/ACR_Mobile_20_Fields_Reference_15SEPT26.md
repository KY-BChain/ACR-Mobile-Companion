# ACR Companion v0.6.5 (build 46): the 20 assessment fields

**Date:** 15 September 2026
**Status:** describes the app as built. Nothing here is clinically approved. It is written for confirmation by the clinical partners (ZZU, UCD, HKU) before the field-check enhancement (§5).
**Not covered:** the patient ID. The app creates it automatically for each assessment (`mob-` plus a random code). It is never typed, never reused and holds no personal information.

---

## Summary

| Question | Short answer |
|---|---|
| 1. Is tier 1 the same as "mandatory fields"? | **Not quite.** "Required" is an entry rule in the app. The **tier** is T1's own grading after submission: <br>• **Tier 1 (blocked):** any of 8 fields is missing: ER, PR, HER2, Ki-67, grade, tumour size, nodal status, age. <br>• **Tier 2 (biomarker only):** stage or ECOG is missing. <br>• **Tier 3 (full):** all 10 are present. <br>The app enforces only 4 of the 10 (§1). |
| 2. Which fields are mandatory? | **Four must hold a value:** ER, PR, HER2 and Ki-67. The Bayesian switch is always On or Off. **The other 15 are optional.** |
| 3. Ranges | See the table in §2. Each numeric field has an enforced minimum and, where one exists, a maximum. CA 15-3, CEA and tumour size have **no maximum**. |
| 4. Initial values | **Steps 1–3 open pre-filled with a sample case** (13 fields). **P1 and P2 open blank.** T1 cannot tell a pre-filled value from one the clinician chose (§2, note A). |
| 5. Relationships | The app checks **no** relationship between fields today. §4 lists proposed checks for T1, and §5 how the Result screen would highlight them. |
| Risk and the website's "%" | T1's risk is a word (LOW, INTERMEDIATE, HIGH) from a points score; it has no percentage. The "%" on the website is the **Bayesian Recommendation Confidence**, which the app already shows. The website displays a risk that T1 withholds for incomplete cases, and it does not colour the risk (§3a). |

---

## 1. Required fields and tiers are different things

**In the app**, a field is either:
- **required**: the Next button stays disabled until it holds a valid value (4 fields); or
- **optional**: it may be left blank and is sent as "no value" (15 fields).

The Bayesian switch is the 20th field and always holds On or Off.

**In T1**, after submission, the reasoner grades completeness and returns four things:
- a **tier** (1, 2 or 3);
- the **missing fields**;
- the **number of rules blocked**;
- a **warning line**.

It also withholds the headline **Risk** at tier 1 and 2, so the app shows "—".

Recorded results for the same synthetic case (Gate 1, 9 Sept 2026):

| Case | Tier | Rules blocked | T1's warning | Headline risk |
|---|---|---|---|---|
| All 20 fields entered | **3** | 0 | "✅ FULL ASSESSMENT — All data complete." | INTERMEDIATE |
| The 7 P1/P2 fields left blank | **1** | 64 | "❌ ASSESSMENT BLOCKED — Essential biomarker data missing or invalid: tumorSize" | — (withheld) |

**T1's tier rules**, read from the platform source (`ReasonerService`, commit `33daead`):

| Tier | T1's label | When | Rules inactive | Headline risk |
|---|---|---|---|---|
| **1** | ❌ ASSESSMENT BLOCKED | Any of these 8 is missing: **ER, PR, HER2, Ki-67, grade, tumour size, nodal status, age** (an age of 0 also counts as missing) | 64 | Withheld (—) |
| **2** | 🔴 BIOMARKER ASSESSMENT ONLY | All 8 present, but **stage** or **ECOG** is missing | 58 | Withheld (—) |
| **3** | ✅ FULL ASSESSMENT | All 10 present | 0 | Shown |

T1 checks tier 1 first. A case missing both tumour size and ECOG therefore reports tier 1 and names only the tier 1 field.

**What this means for the app:**
- ER, PR, HER2 and Ki-67 are required in the app, so they are always present.
- **Six fields T1 needs are optional in the app:** grade, nodal status, age and tumour size (tier 1), and stage and ECOG (tier 2).
- Grade, nodal status, age and stage start pre-filled from the sample case. **Tumour size and ECOG start blank.**
- So filling Steps 1–3 and skipping P1 and P2 gives **tier 1**, because tumour size is missing. Entering tumour size but not ECOG gives **tier 2**. Either way the Risk line shows "—", which explains the "—" seen in testing.
- **The other 10 fields never change the tier:** histology, CA 15-3, CEA, surgery date, the Bayesian switch, gender, PD-L1, HER2-low, LVEF and treatment intent.
- The Result screen lists missing fields by T1's internal names, such as `histologicGrade` and `overallStageGroup`, not "Grade" and "Stage". This is a small wording fix for a later build.

---

## 2. The 20 fields: entry rules, ranges and initial values

"Tier 1/2 for T1" marks an optional field T1 needs for a full assessment (§1); the four required fields are tier 1 as well. "Blocks Next" means the screen will not move on until the value is valid. A blank optional field is sent as *no value*, never as zero. A zero that is typed is kept as zero.

| # | Screen | Field | Status | Entry | Allowed values or range | Starts as | Blocks Next when |
|---|---|---|---|---|---|---|---|
| 1 | Step 1 | ER status | **Required** | Two buttons | Positive · Negative | Positive | Never (always set) |
| 2 | Step 1 | PR status | **Required** | Two buttons | Positive · Negative | Positive | Never (always set) |
| 3 | Step 1 | HER2 status | **Required** | Two buttons | Positive · Negative (no equivocal/2+ option, C45-06) | Negative | Never (always set) |
| 4 | Step 1 | Ki-67 (%) | **Required** | Number | **0 – 100**; decimals allowed | 25 | Blank or outside 0–100 |
| 5 | Step 2 | Stage | Optional; **tier 2 for T1** | Choice | — · 0 · I · IA · IB · II · IIA · IIB · III · IIIA · IIIB · IIIC · IV | II | Never |
| 6 | Step 2 | Grade | Optional; **tier 1 for T1** | Choice | — · 1 · 2 · 3 | 2 | Never |
| 7 | Step 2 | Histological subtype | Optional | Choice | — · IDC · ILC · DCIS · Paget's disease | IDC | Never |
| 8 | Step 2 | Nodal status | Optional; **tier 1 for T1** | Choice | — · N0 · N1 · N2 · N3 | N0 | Never |
| 9 | Step 2 | Age (years) | Optional; **tier 1 for T1** | Number | **18 – 120**, whole years | 52 | Not a whole number from 18 to 120 |
| 10 | Step 3 | CA 15-3 (U/mL) | Optional | Number | **0 or more**, no maximum. Hint: reference threshold 35.0 | 40.0 | Negative or not a number |
| 11 | Step 3 | CEA (ng/mL) | Optional | Number | **0 or more**, no maximum. Hint: reference threshold 5.0 | 6.0 | Negative or not a number |
| 12 | Step 3 | Surgery date | Optional | Typed text | A real calendar date, **YYYY-MM-DD**. Future dates are allowed and passed to T1 unchanged | 2026-03-14 | Not a real date |
| 13 | Step 3 | Bayesian enhancement | **Always set** | Switch | On · Off | On | Never |
| 14 | P1 | Tumour size | Optional; **tier 1 for T1** | Number | **Greater than 0**, no maximum. **Unit not decided** (C45-01) | Blank | Zero, negative or not a number |
| 15 | P1 | Gender | Optional | Choice | — · Female · Male · Other · Unknown | Blank | Never |
| 16 | P2 | ECOG score | Optional; **tier 2 for T1** | Number | **0 – 4**, whole number | Blank | Not a whole number from 0 to 4 |
| 17 | P2 | PD-L1 status | Optional | Choice | — · Positive · Negative · Not tested | Blank | Never |
| 18 | P2 | HER2-low | Optional | Choice | — · Positive · Negative · Unknown | Blank | Never |
| 19 | P2 | LVEF (%) | Optional | Number | **0 – 100**; decimals allowed | Blank | Outside 0–100 or not a number |
| 20 | P2 | Treatment intent | Optional | Choice | — · Neoadjuvant · Adjuvant · Unspecified | Blank | Never |

**Notes**

- **A. The pre-filled sample case.** Steps 1–3 open with a demonstration case.
  - A clinician who presses Next without changing a field sends the sample value as if it had been entered. T1 cannot tell the difference.
  - The sample's CA 15-3 (40.0) and CEA (6.0) are above their reference thresholds (35.0 and 5.0). An untouched sample therefore fires T1's tumour-marker rules.
  - **Decision needed:** should the trial build open Steps 1–3 blank instead?
- **B. The gateway re-checks every value** against the same ranges before T1 sees it. An out-of-range value can never reach the reasoner.
- **C. Two kinds of "no value" become the same.** For HER2-low, blank and "Unknown" both reach T1 as *no value* (C45-06).
- **D. Units.** The Step 3 labels and the Review screen show U/mL for CA 15-3 and ng/mL for CEA; confirm both. Tumour size shows no unit ("raw value · unit pending" on Review). T1 compares tumour size with 20 in its risk calculation, which suggests millimetres, but this is not decided (C45-01).

---

## 3. How T1 uses each field

This shows what the reasoner does with each value today, from the Build 44 source review. "No effect" means no use was found in the current reasoning path.

| # | Field | What T1 uses it for |
|---|---|---|
| 1–3 | ER, PR, HER2 | Molecular subtype (ontology reasoner and Java fallback); biomarker list; Bayesian confidence. HER2 also selects subtype treatments |
| 4 | Ki-67 | Subtype; risk; rule RD-2 (above 20); completeness; Bayesian bands. The ontology pass rounds it down to a whole number |
| 5 | Stage | Risk, treatments and completeness; switches between the full result and "staging pending" |
| 6 | Grade | Subtype input; risk; completeness; Bayesian confidence |
| 7 | Histological subtype | Rules RD-1, RD-1b, RD-2, RD-3; switches between the in-situ and full results |
| 8 | Nodal status | T1 derives node-positive (N0 = no; N1–N3 = yes) for rule RD-3; completeness |
| 9 | Age | Subtype input; risk (50 or over); completeness; Bayesian prior. The only demographic field T1 uses |
| 10 | CA 15-3 | Rule RE3; with a high CEA, rule RE4-2 |
| 11 | CEA | Rule RE4-1; with a high CA 15-3, rule RE4-2 |
| 12 | Surgery date | Follow-up timing rules R33/R34. T1 guards against future dates |
| 13 | Bayesian enhancement | Adds the confidence percentages; **does not change** subtype, risk or treatment |
| 14 | Tumour size | Risk (threshold 20); **completeness, and blocks the assessment when missing** |
| 15 | Gender | **No effect** (C45-07) |
| 16 | ECOG | Risk; performance-adjusted treatment; completeness |
| 17 | PD-L1 | Triple-negative treatment (Positive/Negative only; "Not tested" has no effect) |
| 18 | HER2-low | The trastuzumab deruxtecan (T-DXd) option when HER2-low and metastatic stage |
| 19 | LVEF | A cardiology recommendation when HER2-positive and LVEF is below 55 |
| 20 | Treatment intent | Treatment context for Neoadjuvant/Adjuvant ("Unspecified" has no effect) |

---

## 3a. Risk: how T1 works it out, and how the website shows it

**T1's risk is a word, never a percentage.** It comes from a points score (`ReasonerService.calculateRiskLevel`):

| Factor | Points |
|---|---|
| Age 50 or over | +1 |
| Tumour size over 20 | +2 |
| Ki-67 over 30 | +2 |
| Grade 3 | +2 |
| Subtype triple-negative or HER2-enriched | +2 |

**0–1 points = LOW, 2–4 = INTERMEDIATE, 5 or more = HIGH.** Three adjustments follow, in this order:
- **Rule C (stage and subtype).**
  - Stage III: the subtypes T1 lists as high-risk become HIGH; otherwise LOW becomes INTERMEDIATE.
  - Stage II: LOW becomes INTERMEDIATE for those high-risk subtypes.
  - Stage I: LOW becomes INTERMEDIATE for Luminal B.
- **Rule A (stage):** stage III or IV → HIGH.
- **Rule B (ECOG):** ECOG 2 or more raises the level by one step.

T1 always calculates this value (the "deterministic risk"), then withholds it from the headline at tier 1 and 2.

**How the ACR Platform website (`acr_pathway.html`, v2.2.1) differs from the app:**

| Point | Website | App (build 46) |
|---|---|---|
| Which risk it shows | T1's **deterministic** risk, as 低危 / 中危 / 高危 | T1's **headline** risk, or "—" when T1 withholds it |
| Incomplete case | Shows the "STAGING PENDING" banner, which says risk cannot be determined, **yet still shows a risk value** | Shows "—", following T1's own rule (Gate 1 OBS-4) |
| Colour of the risk value | **None** (plain dark grey). The website's red and green are on the ER/PR values | Red HIGH, green LOW, blue other (Kraken's Build 46 decision) |
| Risk source label | "Stage IV override (Rule A)" and similar, **worked out by the website itself** from stage and ECOG. It does not match T1 exactly: T1's Rule A covers stage III as well | Not shown |
| The "%" | **Recommendation Confidence**: the Bayesian confidence rounded to a whole percent (e.g. 60%), plus the top 3 subtype probabilities and a credible interval, to one decimal | The same values in the **Confidence summary** ("Classification confidence", e.g. 60.02%): every subtype probability and the uncertainty range, to two decimals |

**Conclusions:**
- **The percentage remembered from the website is the Bayesian confidence, not risk.** The app already shows it when Bayesian enhancement is On. Only the label and rounding differ (C45-08).
- **The website shows a risk that T1 itself withholds for incomplete cases.** The app's behaviour is the safer one and should not change to match. The website should be corrected in a platform release.
- **The website does not colour the risk at all.** The app's risk colours are therefore a new decision, not a mirror of the website, and belong to C45-04 for the clinical partners.
- **The app should not copy the website's own logic.** That covers the website's risk-source label and its older in-page risk calculation, which the website's embedded fallback uses when the backend call fails. Anything of this kind must come from T1.

---

## 4. Relationships between fields: proposed checks for T1

**Today, neither the app nor the gateway checks any relationship between fields.** Each field is checked only against its own range.

The checks below are **proposals for the clinical partners to accept, change or reject**. There are two kinds:
- **Contradiction:** the two values cannot both be true, so one of them is wrong.
- **Please confirm:** the combination is unusual or incomplete but possible.

**Check two things before any stage check.** First, **which staging system the Stage field means**: AJCC 8th anatomic or prognostic stage. The prognostic stage mixes in grade and receptor status and can move a case to a different group, so a combination that is impossible under anatomic staging may be valid under prognostic staging. Second, **the tumour-size unit** (C45-01).

| Ref | Fields | Relationship | Proposed kind |
|---|---|---|---|
| F1 | HER2 status + HER2-low | HER2-low applies only to HER2-negative disease. HER2 **Positive** with HER2-low **Positive** is contradictory | Contradiction |
| F2 | Histology + nodal status | Pure DCIS (in situ) is node-negative. **DCIS with N1–N3** suggests an invasive component was not recorded | Contradiction |
| F3 | Histology + stage | DCIS is stage 0, and stage 0 means in-situ disease. **DCIS with stage I or above**, or **stage 0 with IDC/ILC**, is contradictory | Contradiction |
| F4 | Stage + nodal status | Under anatomic staging, N3 without metastasis is stage IIIC: **N3 with a stage below IIIC**, or **IIIC without N3**, is contradictory. Other combinations likewise, once the staging system is fixed | Contradiction (anatomic staging only) |
| F5 | Stage + tumour size | Under anatomic staging, size limits each stage (e.g. a tumour over 50 mm cannot be stage I) | Contradiction (needs unit and staging system) |
| F6 | Stage + treatment intent | **Stage IV with Neoadjuvant or Adjuvant**: these usually describe curative treatment built around surgery | Please confirm |
| F7 | Treatment intent + surgery date | **Neoadjuvant with a surgery date in the past**: neoadjuvant treatment comes before surgery | Please confirm |
| F8 | ER + PR | **ER negative with PR positive** is uncommon, and guidelines advise confirming the result | Please confirm |
| F9 | HER2 status + LVEF | **HER2 positive with LVEF blank**: T1's cardiology check cannot run | Please confirm (missing related value) |
| F10 | Subtype + PD-L1 | **Triple-negative with PD-L1 blank**: T1's PD-L1 treatment branch cannot run | Please confirm (missing related value) |
| F11 | Stage + HER2-low | **Stage IV with HER2-low blank or Unknown**: T1's T-DXd branch cannot run | Please confirm (missing related value) |
| F12 | Single values | Plausibility limits for values that pass the range check but are unlikely, for example: <br>• LVEF under 15 or over 85; <br>• tumour size under 1 (possibly entered in cm) or over 200; <br>• a surgery date decades old; <br>• very large CA 15-3/CEA values (possible typing error). <br>**The limits are placeholders for clinicians to set** | Please confirm |

F10 uses T1's own subtype result, so the check stays with the reasoner.

---

## 5. Proposed enhancement: T1 judges the inputs, the Result screen highlights them

**The principle is unchanged: the app judges nothing.** T1 runs the agreed checks from §4 and returns its findings with the result. The Result screen shows them as a "Check these inputs" card at the top, naming each field and the finding, with the same wording in all 8 languages.

**Proposed addition to T1's result:**

```json
"inputChecks": [
  { "code": "HER2_LOW_WITH_HER2_POSITIVE", "fields": ["her2Status", "her2Low"], "kind": "CONTRADICTION" }
]
```

- **T1 returns a fixed code, not a sentence.** The app turns each code into agreed, reviewed text in the reader's language, as it does for every other message.
- **`fields`** names the inputs to highlight. **`kind`** is CONTRADICTION or CONFIRM; the colour follows the agreed warning style (C45-04).

**Release order matters.** Today the result format **refuses any field it does not recognise**. The response schema allows no extra fields, and the app checks the exact list of fields. If T1 sent `inputChecks` first, every assessment would fail safely with no result. The order must be:

1. The clinical partners approve the list of checks, the kind of each, and the wording (§6).
2. **Mobile release:** the schema, gateway and app accept the new field as optional, and the Result screen shows it. This is safe while T1 does not yet send it.
3. **Platform release:** T1 starts returning `inputChecks`. This is a platform change, outside the mobile repository.
4. Device test on the three phones, as for Build 46.

---

## 6. Decisions needed from the clinical partners

1. **Minimum dataset** (C45-02): T1 needs 10 fields for a full assessment. Six of them are optional in the app: grade, nodal status, age, tumour size, stage and ECOG. Should they become required, or stay optional with a clear notice before submission?
2. **Staging system** for the Stage field: AJCC 8th anatomic or prognostic?
3. **Units** for tumour size (C45-01), CA 15-3 and CEA, and whether the app should show them.
4. **Pre-filled sample case** (note A): keep it for demonstrations, or open Steps 1–3 blank for the trial?
5. **HER2** (C45-06): add an equivocal/2+ state? Keep "Unknown" distinct from blank for HER2-low?
6. **Gender** (C45-07): keep, explain that it has no effect, or remove?
7. **Checks F1–F12**: accept, change or reject each; set the placeholder limits in F12; approve the wording.
8. **Risk** (C45-03, C45-04, C45-08):
   - Confirm the headline risk (not the deterministic one) as the risk shown.
   - Approve risk colours, which the website does not use, including INTERMEDIATE (blue today).
   - Approve the confidence wording ("Recommendation Confidence" on the website, "Classification confidence" in the app) and its rounding.

---

### Sources in this repository

- Entry rules and initial values: `src/screens/Step1ReceptorsScreen.tsx`, `Step2TumourScreen.tsx`, `Step3MarkersScreen.tsx`, `P1Screen.tsx`, `P2Screen.tsx`, `src/store/assessmentStore.ts` and `src/utils/provisionalValidation.ts`.
- Gateway ranges: `schemas/acr.cds.v1.request.schema.json`.
- How T1 uses each field: `docs/loop/ACR_MOBILE_BACKEND_REASONER_FLOW_REAFFIRMATION_v0.1.md` (twenty-field consumer matrix).
- Tier evidence: `docs/build45-evidence/gate1/GATE1_EVIDENCE_T4501_T4502_20260909.md`, §3.2 and OBS-4.
- Open clinical questions C45-01 to C45-11: `docs/loop/ACR_MOBILE_BUILD45_TECHNICAL_CLINICAL_REVIEW_BACKLOG_v0.1.md`.
- T1's tier and risk rules: platform `ACR-Ontology-Interface/src/main/java/org/acr/platform/service/ReasonerService.java` (`assessDataCompleteness`, `calculateRiskLevel`, and the tier 1/2 risk suppression), commit `33daead`, read-only.
- Website display: platform `Final_FTP_v2_2_1/website/acr_pathway.html` (identical to `acr-test-website/acr_pathway.html`).
