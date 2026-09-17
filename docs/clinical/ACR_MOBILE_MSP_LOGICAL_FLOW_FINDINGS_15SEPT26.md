# ACR Mobile — MSP Logical-Flow Findings

**Date:** 15 September 2026
**Executes:** `ACR_MOBILE_MSP_LOGICAL_FLOW_INVESTIGATION_v1_0.md`
**Status:** findings and a provisional proposal. **For Kraken's review only.** Nothing here has been implemented, and no clinical threshold, staging rule or recommendation wording is set. Where this document sorts fields into "pathway-timing" or "data-entry" gaps, that sorting is CRIL's starting suggestion for ZZU/UCD/HKU to correct.
**Sources:** mobile repository at branch `feature/mobile-v0.6.5-build46`; platform checkout `33daead` (read-only, unchanged); website `Final_FTP_v2_2_1/website/acr_pathway.html`.

> **Update, 17 September 2026.** Build 47 (v0.6.6) shipped the mobile-only fixes from Part III and passed on three phones. **Resolved in the app:**
> - B3: "Complete missing fields" returns to the screen with values kept.
> - I-A.1: the platform's field names are translated into app labels.
> - B5: a localised completeness notice.
> - B6: Review lists blank needed fields, in red.
> - B2: sample values are marked.
> - B4: "needed for a full assessment" markers.
> - The deterministic risk is greyed out while withheld, and "Rules blocked" moved to Technical details.
>
> **Still open (platform or clinical):**
> - the gate mismatch (I-C);
> - English-only platform wording;
> - `rulesBlocked` being a constant;
> - the silent future-surgery-date guard;
> - HER2 equivocal.
>
> **New platform findings (17 September):**
> - The Java backup classifier splits Luminal A/B at Ki-67 > 20 (the ontology uses 14) and calls every HER2+ case HER2-enriched.
> - The Bayesian "classification confidence" is the top of its own five groups and can refer to a different subtype from the one shown.
> - Marker and DCIS red-flag rules appear only under Technical details.
> - R17a/R17b are applied without the T2 condition.
>
> The reviewer-facing account and test list for ZZU is `ACR_Companion_ZZU_Review_and_Test_List_17SEPT26.md`.

---

## Headline findings

1. **T1 does not block anything.** "❌ ASSESSMENT BLOCKED" is a label on the completeness block. For a tier 1 case T1 still returns the molecular subtype, the treatment list, the biomarkers, the fired rules and the Bayesian confidence. The only value it withholds is the headline risk. The app shows all of this, so the clinician sees a full-looking result headed by a warning that says it is blocked. The wording overstates what happened.
2. **The platform already has a staged result, keyed on stage, not tumour size.** `ClinicalOutputAssembler` has three branches: in-situ, "biomarker only" (stage absent), and full. The biomarker-only branch is a "preliminary indication" in everything but name: it keeps subtype-only treatments, removes stage-dependent ones, and prepends a "STAGING PENDING" notice. The tier gate and this branch use different fields, so they disagree (§I-C).
3. **A missing tumour size costs exactly two things:** the headline risk (tumour size over 20 adds 2 points to the risk score) and the tier 1 label. No SWRL rule reads tumour size. Everything else in the result is unaffected.
4. **The Result screen offers no way to add the missing value.** Both buttons ("New assessment", "Done") clear every field. A clinician who sees "missing: tumorSize" must re-enter all 20 fields to add one. Nothing on the Result screen says which screen holds tumour size. This is the most concrete flow defect found, and it is mobile-only.
5. **In practice tier 1 is always "tumorSize".** Steps 1–3 open pre-filled (grade 2, N0, age 52, stage II), so the four other tier 1 fields are never blank unless the clinician clears them. The only tier fields that start blank are tumour size (P1) and ECOG (P2), on the two screens labelled "EVALUATION ONLY · PROVISIONAL FIELDS". The screen labelling tells the clinician the least about the field that matters most.

---

## Part I — The "Assessment Blocked" path, mapped

### I-A.1 The tier fields, confirmed against the platform source

`ReasonerService.assessDataCompleteness` (lines 1203–1236) is the only tier logic. The list in the fields-reference document is complete and current:

| Tier | Trigger | Label T1 returns | `rulesBlocked` |
|---|---|---|---|
| 1 | Any of **ER, PR, HER2, Ki-67, grade, tumour size, nodal status, age** absent (age 0 also counts) | `❌ ASSESSMENT BLOCKED — Essential biomarker data missing or invalid: <names>` | 64 |
| 2 | All eight present; **stage** or **ECOG** absent | `🔴 BIOMARKER ASSESSMENT ONLY — Stage and ECOG required for treatment recommendations and risk classification. 58 clinical rules are inactive.` | 58 |
| 3 | All ten present | `✅ FULL ASSESSMENT — All data complete.` | 0 |

Three details that matter for the flow:

- **`rulesBlocked` is a constant, not a count.** The values 64, 58 and 0 are literals in the code. The app shows "Rules blocked: 64" as if it were measured.
- **Tier 1 is checked first and stops.** A case missing tumour size *and* ECOG reports tier 1 naming only `tumorSize`. Entering tumour size then reveals tier 2 naming `ecogScore`. The clinician discovers the gaps one round at a time.
- **The tier 2 label is inaccurate when only one of its two fields is missing.** With stage present and ECOG blank, T1 still says "Stage and ECOG required".
- **Missing-field names are T1's internal names:** `histologicGrade`, `overallStageGroup`, `tumorSize`, `ecogScore`, `nodalStatus`. The app prints them unchanged.

### I-A.2 What each tier field feeds, and the kind of gap its absence usually is

The middle column is fact (read from the platform source). The right-hand column is **CRIL's suggestion** of where an absence typically comes from, for the clinical partners to correct. One framing point first: the app's four required fields (ER, PR, HER2, Ki-67) are immunohistochemistry results, so the earliest point at which the app can be used at all is **after biopsy pathology is reported**. The question for each field is therefore: at that point, is the value normally known?

| Field | What T1 does with it (fact) | If absent, T1… (fact) | Suggested gap type (for clinical confirmation) |
|---|---|---|---|
| ER, PR, HER2, Ki-67 | Subtype, biomarkers, Bayes; Ki-67 also risk (over 30) and rule RD-2 | Cannot be absent: required in the app | — |
| Grade | Ontology input, risk (grade 3), Bayes | Tier 1 label; risk withheld | **Data-entry gap.** Grade comes from the same pathology report as the receptors. |
| Age | Ontology input, risk (50 or over), Bayes prior | Tier 1 label; risk withheld | **Data-entry gap.** |
| Tumour size | Risk only (over 20 adds 2 points); completeness | Tier 1 label; risk withheld. **No rule, treatment or biomarker changes** | **Pathway-timing gap possible.** Clinical size needs imaging or examination; pathological size needs surgery. Kraken's case: no mammogram yet. ZZU to confirm whether a case can reach IHC without any size estimate, and which size (clinical or pathological) the field means. |
| Nodal status | Derived to node-positive (N0 = no, N1–N3 = yes) for rule RD-3; completeness | Tier 1 label; risk withheld; RD-3 cannot fire | **Pathway-timing gap possible.** Clinical N (examination, ultrasound) may exist at presentation; pathological N needs surgery. The field does not say which it means. |
| Stage | Risk rules A and C, T-DXd branch, assembler branch, biomarkers, completeness | Tier 2 label; risk withheld; assembler removes stage-dependent treatments and prepends STAGING PENDING | **Pathway-timing gap.** Stage follows size and nodes, so it is absent whenever they are. |
| ECOG | Risk rule B (2 or more raises one step); dosing line; completeness | Tier 2 label; risk withheld; no dosing line | **Data-entry gap, most likely.** Performance status can be scored at any consultation. ZZU to confirm whether it is routinely recorded at first presentation. |

### I-B What "Assessment Blocked" shows the clinician, verbatim

For a tier 1 result on build 46 in English, top to bottom (locale keys in `src/i18n/locales/en-GB.json`; layout in `src/screens/ResultScreen.tsx`):

| Position | Element | Exact text or content |
|---|---|---|
| Header | Title, subtitle | "Assessment result" · "Live Openllet/SWRL result" |
| Banner | Transparency line | "Clinical transparency: outputs are decision support only, generated by a validated rule base. Clinical judgement remains with the clinician." |
| 1 | Dark heading | "Clinical summary" · "Result returned by the verified live ACR Platform." |
| 2 | Subtype box (blue border) | "Molecular subtype" · e.g. **LuminalB_HER2Negative** (blue) · "Risk: **—**" |
| 3 | Amber box | "Warnings and context" · "❌ ASSESSMENT BLOCKED — Essential biomarker data missing or invalid: tumorSize" (T1's text, **English in every language**) |
| 4 | Card | "Information completeness" · Tier **1** · Rules blocked **64** · Missing fields · "• tumorSize" |
| 5 | Card | "Treatment options returned" · the subtype treatments, e.g. "• Chemotherapy + Endocrine therapy", plus any ECOG, LVEF, intent or follow-up lines |
| 6 | Card | "Biomarker results returned" · ER, PR, HER2, Ki67, Stage, PD-L1, HER2-low as returned |
| 7 | Card | "Classification confidence" · e.g. 60.02%, uncertainty range, posterior per subtype |
| 8 | Toggle, open by default | "▼ Technical details" · "Hide reasoning and provenance" |
| 9 | Card | "Result identity" · … · "Displayed risk —" · "**Deterministic risk field LOW**" (green) · … |
| 10–16 | Cards | Treatments, Biomarkers, Fired rules and provenance, Evidence and trace, Data completeness (repeats tier, rules blocked, missing fields, warnings), Bayesian enhancement, Current platform evidence, Retention |
| Footer | Two buttons | "New assessment" · "Done". **Both clear all 20 fields** and return to the access screen. |

**Actionable next step offered: none.** No text says what tumour size is, which screen it is on, or that entering it would produce a risk. No button returns to the entry screens with the values kept. The only guidance is T1's one-line English string. The retention note ("Leaving this screen clears the assessment") is accurate and makes the problem explicit.

Three secondary signals reinforce the wrong message:
- The "❌" and the word "BLOCKED" sit directly above a complete list of treatments, so the screen contradicts itself.
- "Deterministic risk field LOW" is shown in green two cards below (Build 47 item, already recorded).
- "Rules blocked: 64" is a constant (I-A.1).

### I-C Existing staged logic in the platform and website

**Platform, `ClinicalOutputAssembler.apply` (read in full):**

| Branch | Trigger | Effect on the treatment list |
|---|---|---|
| In-situ | Rule RD-1 (DCIS) or RD-1b (Paget's) fired | Replaced by one line: "In-situ diagnosis (DCIS): primary surgical pathway. Adjuvant systemic therapy options pending invasive component confirmation." |
| **Biomarker only** | **Stage absent** (ECOG deliberately not part of this gate) | Prepends "⚠️ BIOMARKER ASSESSMENT — STAGING PENDING / Molecular subtype has been classified. Risk level cannot be determined until staging and ECOG data are provided. The treatment options below are subtype-specific and apply regardless of stage. Stage-specific recommendations will appear when staging data is entered." Removes stage-dependent lines (today only the T-DXd line). |
| Full | Stage present, not in-situ | No change |

This is the foundation the investigation asked about: **T1 already produces a partial, named-gap result.** It is keyed on one field (stage), it is delivered as a treatment-list entry rather than a structured flag, and the app already moves it into the warnings box.

**The two gates disagree**, because they read different fields:

| Case | Tier label | Assembler branch | What the clinician sees in the app |
|---|---|---|---|
| Stage present, tumour size blank | ❌ BLOCKED (tier 1) | Full — stage-dependent treatments included | "Blocked" above a full treatment list, risk withheld |
| Stage blank, everything else present | 🔴 BIOMARKER ONLY (tier 2) | Biomarker only | **Two overlapping warnings** (🔴 and ⚠️) saying similar things |
| Stage present, ECOG blank | 🔴 "Stage and ECOG required" (tier 2) | Full | A warning that names a field that is present |
| Tumour size and ECOG blank | ❌ BLOCKED naming tumorSize only | Full or biomarker-only depending on stage | The ECOG gap is hidden until the next round |

No other partial-result mechanism exists: the controller exposes only `POST /api/infer`, `/api/infer/health` and `/api/infer/batch`; the result model has no "preliminary" field; the only other partial path is the exception catch, which the gateway already refuses.

**Website (`acr_pathway.html`):** it has **zero references** to `dataCompleteness`, `missingFields` or `rulesBlocked`. It ignores T1's tier entirely. Its "STAGING PENDING" banner is its own, computed in the page from stage and ECOG before the call; it shows the deterministic risk regardless (already recorded in the fields reference §3a); and its Rule D / E3 / E4 alerts are computed in the page, not taken from T1. There is nothing on the website to build on for this problem; if anything, the app is ahead, because it shows the tier at all.

---

## Part II — Other fields and issues of the same shape

### II-A All 20 fields: can the value legitimately be absent at first use?

"Silent" means T1 returns no message and simply does not run the related rule or line. Gap type is CRIL's suggestion for clinical confirmation.

| # | Field | Absent at first use because a procedure hasn't happened? (suggested) | What T1 does when absent | Flow problem? |
|---|---|---|---|---|
| 1–4 | ER, PR, HER2, Ki-67 | No: required; the app cannot be used before IHC | — | No |
| 5 | Stage | **Yes**, until size and nodes are known | Tier 2 + assembler biomarker-only branch | Yes: two overlapping warnings; risk withheld |
| 6 | Grade | No: same pathology report as IHC | Tier 1 | Only if the clinician clears the pre-filled "2" |
| 7 | Histological subtype | No: same pathology report | Silent (RD rules and in-situ branch cannot fire) | No message that the in-situ check was skipped |
| 8 | Nodal status | **Possibly** (clinical vs pathological N) | Tier 1; RD-3 cannot fire | Yes: the field's meaning (cN or pN) is undefined |
| 9 | Age | No | Tier 1 | No |
| 10 | CA 15-3 | **Yes**: separate blood test | Silent | No: correct behaviour |
| 11 | CEA | **Yes**: separate blood test | Silent | No: correct behaviour |
| 12 | Surgery date | **Yes**: absent before surgery, by definition | Silent (R33/R34 cannot fire) | See note S below |
| 13 | Bayesian switch | Always set | — | No |
| 14 | Tumour size | **Yes** (Kraken's case) | Tier 1; risk withheld; nothing else | **Yes: the trigger case** |
| 15 | Gender | Irrelevant: no consumer | Silent | No (C45-07) |
| 16 | ECOG | Unlikely: scorable at any visit | Tier 2; no dosing line | Yes: label wording; hidden behind tier 1 |
| 17 | PD-L1 | **Yes**: separate assay, usually ordered for TNBC | Silent; the TNBC branch adds neither the PD-L1-positive nor the PD-L1-negative line | Note P below |
| 18 | HER2-low | Usually no: derived from the same HER2 IHC score (0 / 1+ / 2+ ISH-negative) | Silent | Reporting gap rather than test gap; "Unknown" and blank are the same to T1 (C45-06) |
| 19 | LVEF | **Yes**: echocardiogram ordered before HER2 or anthracycline therapy | Silent; no cardiology line even for HER2-positive | Note L below |
| 20 | Treatment intent | **Yes**: set at the treatment-planning meeting | Silent | No: correct behaviour |

**Note S, surgery date.** The app's hint says "Future dates are permitted and submitted unchanged: the B3 guard is the reasoner's responsibility." The reasoner's guard (`OWLPatientAssertionService`, lines 116–130) **silently does not assert** a surgery date later than the assessment date, so R33/R34 do not fire and the result carries no sign that a date was ignored. A planned (future) surgery date is a legitimate pre-surgery state, and today it is indistinguishable from no date. Not a block, but a silent drop of the same shape.

**Note P, PD-L1.** T1's own subtype-only treatment for triple-negative already reads "Consider immunotherapy (PD-L1 evaluation recommended)". So for the one subtype where PD-L1 matters, T1 already names the missing test. This is a small existing example of the "pending [procedure]" pattern the proposal asks for, and it comes from the platform, not the app.

**Note L, LVEF.** For a HER2-positive subtype with LVEF blank, T1 says nothing. Whether "LVEF not yet measured" should be surfaced is a clinical question; the point here is that the absence is silent while the tumour-size absence is loud, with no principle behind the difference.

### II-B Other flow-logic issues of the same shape

**B1. HER2 equivocal (C45-06): same shape, categorical.** The app forces Positive or Negative. A 2+ result awaiting ISH is a real intermediate state that the app cannot represent; the website maps 2+ to null and lets the backend decide. Because HER2 is required, a clinician with a pending ISH cannot use the app at all, or must guess. This is the tumour-size problem in categorical form: a value that legitimately does not exist yet, with no "pending" option.

**B2. The pre-filled sample makes the missing-data problem worse in two ways.**
- The Result screen can only ever name P1/P2 fields as missing. Grade, nodal status, age and stage are pre-filled, so T1 sees them as present. An unchanged "N0 / stage II / grade 2 / age 52" is sent as real data and never appears in "Missing fields".
- The Review screen shows all values in the same style, with no mark for "unchanged since the app opened". So neither the Review nor the Result screen can tell the clinician which values are genuinely theirs.

**B3. No return path with values kept (I-B).** Adding one missing field means re-entering twenty. This exists independently of T1.

**B4. The tier fields are on the screens marked "Provisional".** P1 and P2 carry the banner "EVALUATION ONLY · PROVISIONAL FIELDS", the label "Optional", and hints such as "Unit pending". A clinician reading these will reasonably skip them, and skipping them guarantees a tier 1 or tier 2 result.

**B5. T1's completeness text is English-only.** The app shows T1's `warning` string unchanged in all eight languages. For a zh-CN trial at ZZU, the one line that explains the "—" risk is in English with emoji. The app has `tier` and `missingFields` as data, so it could compose a localised message itself, but that replaces T1's wording and needs a decision.

**B6. No pre-submission notice.** The tier rules are pure presence checks on ten fields. The Review screen could say "Three fields the platform needs for a full assessment are blank: Tumour size, ECOG, Stage" before submission. This is a presence check, not a clinical judgement, but it duplicates T1's list on the device, so it is a decision, not a given.

**B7. Nodal status flattens to yes/no.** T1 derives node-positive from N0–N3 (already flagged as B4 in the reaffirmation record). N1, N2 and N3 are identical to every rule. The app's four-way choice implies a precision T1 does not use. Not a missing-data issue, but the same "the form promises more than the reasoner reads" shape as gender.

**B8. Demo mode cannot stand in.** The review service script sets no `ACR_SYNTHETIC_FIXTURE_DIR`, so "Synthetic demo" on the phones always fails closed with "The verified synthetic fixture is unavailable." Harmless for the trial, but a clinician trying to see what a complete result looks like has no way to.

---

## Part III — Provisional proposal (for clinical review; not a decision)

### III-1 A three-state result

| State | Proposed trigger (the seam) | What the result shows |
|---|---|---|
| **Full assessment** | Tier 3 | Unchanged from today |
| **Preliminary indication, pending [named data]** | Every missing tier field is one that can legitimately be absent at this point in the pathway (CRIL's suggestion: **tumour size, nodal status, stage**; ECOG and the others per ZZU's answer in I-A.2) | Subtype, subtype-only treatments, biomarkers and confidence, as T1 already returns them; a **single** notice naming the missing data in the app's language; the risk line reads "pending [data]" rather than "—"; a button back to the screen that holds the missing field with all values kept |
| **Incomplete entry** (the true block) | A missing tier field that should be known (CRIL's suggestion: grade, age; possibly ECOG), or T1's exception path | As today's fail-closed screen, but naming the fields and offering the same return button |

The seam is defined by **which fields** route to which state. That is the part CRIL can propose. **What a preliminary indication says, how it is derived from partial data, and any urgency or next-procedure wording, are ZZU/UCD's to define.** The phrases "pending imaging" or "obtain a mammogram" appear nowhere in this proposal for that reason.

### III-2 Where the seam does not need new clinical logic

T1 already returns everything the preliminary state needs: `tier`, `missingFields`, the subtype-only treatment list (assembler biomarker-only branch), and the withheld risk. The proposal changes how those are **labelled and navigated**, not how they are computed. The one exception is the gate mismatch in I-C, which is platform logic.

### III-3 Mobile-only versus platform work

**Can ship as a mobile release alone (no change to T1, no schema change):**

| Item | Change |
|---|---|
| Return path | A "Add missing values" button on the Result screen that navigates to the relevant screen without `resetCycle()`; the store already keeps the form until reset |
| Missing-field labels | Map T1's names to the app's field labels and screen names (`tumorSize` → "Tumour size (screen 4)") |
| Single notice | Replace the raw ❌/🔴 string and the duplicated ⚠️ entry with one composed, localised notice built from `tier` and `missingFields`; keep T1's original string in Technical details |
| Risk line | "Risk: pending [fields]" at tier 1/2 instead of "—" (wording for clinical approval) |
| Pre-submission notice | List blank tier fields on the Review screen (presence check only; decision needed, B6) |
| Screen labelling | Remove or reword "Provisional / Optional / Unit pending" on tumour size and ECOG once units and required status are decided (C45-01, C45-02) |
| Pre-filled sample | Open Steps 1–3 blank, or mark unchanged values on Review (decision from the fields reference, note A) |
| Rules blocked | Hide the number or label it as T1's fixed tier figure |
| Deterministic risk | Grey out when headline risk is null (Build 47, recorded) |

**Needs a platform release (changes T1 or the contract), and then the mobile schema/guard must be relaxed first, as for the field-check proposal:**

| Item | Change |
|---|---|
| Gate alignment | Make the tier and the assembler branch read the same fields, or make the tier 2 label accurate when only one field is missing |
| Tier semantics | Report all missing tier fields at once, not tier 1 first; consider a structured `completeness.state` (FULL / PRELIMINARY / INCOMPLETE) with reason codes instead of a free-text English label |
| "BLOCKED" wording | Only T1 can change its string; the app can only hide or replace it |
| `rulesBlocked` | Count, or remove |
| Surgery date guard | Return a notice when a future date is ignored (Note S) |
| HER2 equivocal | A third HER2 state needs ontology, rule and contract work (C45-06) |
| Website | Read `dataCompleteness`; stop showing deterministic risk at tier 1/2 (fields reference §3a) |

### III-4 Suggested order

1. Kraken reviews this document; decides which questions go to ZZU (I-A.2 gap types, III-1 seam, the wording of a preliminary notice, the pre-filled sample).
2. Mobile-only items that need no clinical wording (return path, field-label mapping, rules-blocked label, deterministic-risk grey-out) can be built as Build 47 without waiting.
3. Items that change what the clinician is told (single notice text, risk "pending" wording, pre-submission notice) wait for ZZU's answers.
4. Platform items are raised separately with the platform owner; none is needed for the mobile release in step 2.

---

## What this investigation did not do

- It did not open the ontology or SWRL files; rule consumption is taken from the Build 44 reaffirmation record and confirmed against the Java that asserts facts.
- It did not test a phone. The verbatim screen in I-B is read from the source and the English locale file, not from a screenshot.
- It did not judge any clinical question. Every "suggested" label above is open.

**Sources**
- Platform, read-only at `33daead`: `service/ReasonerService.java` (196–360, 940–1032, 1040–1181, 1203–1236), `service/ClinicalOutputAssembler.java` (whole file), `swrl/OWLPatientAssertionService.java` (96–165), `controller/InferenceController.java` (mappings), `model/InferenceResult.java`, `model/DataCompleteness.java`.
- Website: `Final_FTP_v2_2_1/website/acr_pathway.html` (728–762, 1322–1403, 1404–1530, 2256–2283).
- Mobile: `src/screens/ResultScreen.tsx`, `ReviewScreen.tsx`, `FailClosedScreen.tsx`, `P1Screen.tsx`, `P2Screen.tsx`, `resultPresentation.ts`, `src/store/assessmentStore.ts`, `src/i18n/locales/en-GB.json`, `gateway/src/upstream-validator.js`, `scripts/build46-review-service.sh`.
- Prior records: `docs/clinical/ACR_Mobile_20_Fields_Reference_15SEPT26.md`; `docs/archive/build44/ACR_MOBILE_BACKEND_REASONER_FLOW_REAFFIRMATION_v0.1.md`; `docs/archive/build45/build45-evidence/gate1/GATE1_EVIDENCE_T4501_T4502_20260909.md`.
