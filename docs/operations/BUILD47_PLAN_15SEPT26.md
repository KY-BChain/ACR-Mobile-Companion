# Build 47 plan: fixing the logical flow before the clinical ask

**Date:** 15 September 2026
**Status:** proposed plan, for Kraken's approval. Nothing here is implemented.
**Based on:** `docs/clinical/ACR_MOBILE_MSP_LOGICAL_FLOW_FINDINGS_15SEPT26.md` (the findings) and `docs/clinical/ACR_Mobile_20_Fields_Reference_15SEPT26.md` (the fields reference).
**Principle:** fix the plumbing first, then ask the clinicians. When ZZU/UCD see the app, an incomplete case should already be explained clearly and be easy to complete. The clinical partners are then asked only the questions that genuinely need clinical judgement, not to work around defects that are ours to fix.

---

## 0. The plan at a glance

| Phase | What | Who decides | Depends on | Ships as |
|---|---|---|---|---|
| **1** | Mobile-only fixes: navigation, labelling, factual notices | Kraken | Nothing | **Build 47** (recommended version 0.6.6) |
| **2** | Platform reconciliation: T1 reports completeness accurately and in a structured form | Kraken and the platform owner | Separate authorisation for platform changes | A platform release, preceded by **Build 48** (0.7.0), which accepts the new fields |
| **3** | The clinical ask: four questions only | ZZU / UCD (HKU if involved) | Build 47 on the phones; ideally phase 2 under way | Build 49 and later, once the answers arrive |

**Rule for phase 1:** an item qualifies only if it changes presentation or navigation, and meets all of these:
- every clinical value shown is still T1's, unchanged;
- no new clinical wording;
- no change to the request or response format;
- any new text states only facts about what T1 did or needs. "Risk is withheld until Tumour size is entered" qualifies. "Obtain imaging" does not.

---

## Phase 1 — Build 47 (mobile only)

### 1.1 Items

Sizes are relative: **S** = a few lines in one screen; **M** = several files, including new text in 8 languages.

| ID | Change | Fixes (findings ref.) | Size |
|---|---|---|---|
| **M1** | **"Complete missing fields" button** on the Result screen when tier is 1 or 2. It opens the screen holding the first missing field, **with every value kept**. The clinician then continues to Review and submits again: a new request ID, the same patient ID (the gateway allows this). Walkthrough mode is unaffected. | I-B, B3: today both Result buttons clear all 20 fields | M |
| **M2** | **Field-name mapping.** T1's internal names become the app's labels plus the screen number: `tumorSize` → "Tumour size (screen 4 of 5)", `histologicGrade` → "Grade (screen 2)", `overallStageGroup` → "Stage (screen 2)", `ecogScore` → "ECOG (screen 5)", and likewise for `nodalStatus`, `age`, `erStatus`, `prStatus`, `her2Status`, `ki67`. An unrecognised name is shown unchanged, so a future T1 field is never hidden. | I-A.1: raw names shown | S |
| **M3** | **One factual completeness notice**, localised, at the top of the warnings. It is built from `tier` and `missingFields`. Example: "Full assessment not reached. The platform needs: Tumour size (screen 4). Risk is withheld until it is entered." T1's own lines (❌ / 🔴 / ⚠️) stay visible directly beneath under "Platform message", unchanged; **no T1 text is removed**. Merging or rewording T1's lines is left to phases 2 and 3. | B5: English-only T1 text; I-C: two overlapping warnings | M |
| **M4** | **Risk line at tier 1/2** reads "Risk: withheld until Tumour size is entered" (the missing fields named), in neutral grey, instead of "—" in blue. | I-B | S |
| **M5** | **Grey out the "Deterministic risk field"** in Technical details whenever the headline risk is withheld, labelled "(not an assessed risk)", with no red/green colour. Already recorded as a Build 47 item. | OBS-4 | S |
| **M6** | **"Rules blocked"**: remove it from the Information completeness card. Keep it in Technical details, labelled "platform's fixed figure for this tier". | I-A.1: constant shown as a count | S |
| **M7** | **Pre-submission notice on Review.** List any blank fields among the ten T1 needs for a full assessment, each with a "Go to screen N" link. Submission stays allowed. The ten-field list copies T1's rule at commit `33daead`, so a new verifier pins it and must be re-checked whenever T1 changes. | B6; B3 | M |
| **M8** | **"Needed for a full assessment" marker** on the six optional fields T1 needs: grade, nodal status, age and stage (screen 2), tumour size (screen 4), ECOG (screen 5). Required status, units and the "Provisional" banner stay unchanged; those are clinical questions (phase 3). | B4 | S |
| **M9** | **Sample values marked on Review.** A value unchanged since the screen opened is marked "sample value — not changed". Whether the trial build should open blank instead is Kraken's decision (§4); it is a product choice, not a clinical one. | B2 | M |
| **M10** | **Translations.** New strings in all 8 locales. The 7 non-English versions are drafts, as in Build 46. zh-CN matters most for ZZU and should be checked before the clinical ask goes out. | B5 | with M3–M9 |
| **M11** | *(optional, carried over)* When a saved session exists but the gateway is down, show "Signed in on this device — waiting for the server" instead of an empty invite field. | Build 46 follow-up | S |
| **M12** | *(optional)* Make "Synthetic demo" work on the review service by allow-listing the existing tier 3 synthetic fixture (`e2e/fixtures`), so a clinician can see what a complete result looks like. This is gateway configuration only; no app change. | B8 | S |

**Deliberately excluded from phase 1** (each needs T1 or the clinicians):
- changing T1's "BLOCKED" wording;
- making any field required;
- units;
- a HER2 "pending ISH" state;
- stage or nodal definitions;
- any "preliminary indication" wording.

### 1.2 Tests

**Automated**
- Update the eight affected verifiers: `tests/mobile/verify.js`, `tests/mobile/resultPresentation.verify.js`, `tests/mobile/offlineWalkthrough.verify.js`, `tests/p1p2/verify.js`, `tests/rtl/verify.js`, `tests/gate7/verify.js`, `tests/contract/verify.js`, `tests/version/verify.js`.
- New checks:
  - the field-name map covers all ten T1 names;
  - the ten-field list matches T1's `assessDataCompleteness`;
  - "Complete missing fields" keeps every value;
  - no T1 text is dropped from the Result screen.
- The gateway suite (231) and the end-to-end suite (4) are unaffected unless M12 is included.

**Device acceptance, on all three phones (Build 46 procedure)**
1. Open a new assessment, keep the sample values, leave screens 4 and 5 blank, and submit. Expect: tier 1, notice naming "Tumour size (screen 4)", risk "withheld", deterministic risk greyed out.
2. Press "Complete missing fields". Expect screen 4 with all values intact. Enter a tumour size and submit. Expect tier 2, naming "ECOG (screen 5)".
3. Enter ECOG and submit. Expect tier 3 with the risk shown in colour.
4. Repeat step 1 in zh-CN and ar-SA (right-to-left layout).
5. Check that the walkthrough and Disconnect behave as in Build 46.

### 1.3 Timing

- **iPhone profile.** The Personal Team profile expires **18 September, 23:15 UTC**. If Build 47 is not on the iPhone by then, rebuild Build 46 first (runbook §8).
- **Android A–C** (release key, final app ID, split APKs) are independent of this plan. If combined with Build 47, all three phones need a fresh install and re-pairing, which is the one moment for it anyway. The decision is Kraken's (§4).

---

## Phase 2 — Platform reconciliation (plumbing only)

**Scope rule.** T1 reports what it already decides, accurately, completely and in a structured form. Phase 2 does **not** change which fields trigger which tier or branch, and adds no clinical content; that is the seam question in phase 3.

| ID | Change in T1 | Why |
|---|---|---|
| **P1** | List **all** missing tier fields at once. The tier stays the first one failed. | Today tier 1 hides tier 2 gaps, so the clinician finds them one round at a time |
| **P2** | The tier 2 label names only the field actually missing (stage, ECOG, or both). | Today it says "Stage and ECOG required" even when stage is present |
| **P3** | **Structured completeness:** a state code and reason codes (e.g. `TIER_1_ESSENTIAL_MISSING`), plus the assembler branch (`FULL` / `BIOMARKER_ONLY` / `IN_SITU`) as a field. | The app then translates codes instead of showing English text, and stops detecting the biomarker-only branch by matching the "⚠️ BIOMARKER ASSESSMENT" prefix |
| **P4** | `rulesBlocked`: count the rules actually inactive, or remove the field. | A constant presented as a count |
| **P5** | Apply T1's own tier 1/2 risk suppression to the nested deterministic risk as well, or rename that field so it cannot be read as an assessed risk. | OBS-4: a blocked case carries "LOW" |
| **P6** | Return a notice code when a future surgery date is ignored. | The date is dropped silently |
| **P7** | **Website:** read `dataCompleteness`; stop showing the deterministic risk at tier 1/2; retire the page's own risk-source label and in-page risk calculation. | Fields reference §3a; findings I-C |

**Release order.** The response format refuses fields it does not recognise, so the mobile side must accept them first:
1. **Build 48 (0.7.0):** the schema, gateway and app accept the new optional fields and use them when present. This is safe while T1 does not yet send them.
2. **Platform release** with P1–P6, and P7 on the website.
3. **Re-attestation.** If the reasoner version changes, update the gateway's expected attestation values in the review service script in the same step, or every assessment fails closed on a baseline mismatch.
4. Device test on the three phones.

**Authorisation.** The platform checkout is canonical and read-only in this engagement. Phase 2 needs Kraken's explicit instruction, a named platform owner, and work in a separate branch or worktree with Gate 1-style evidence: before/after manifests and the dual-path parity tests.

---

## Phase 3 — The clinical ask (four questions)

By this point the app explains an incomplete case, names the missing field in the reader's language, and lets the clinician complete it in one step. What is left genuinely needs clinical judgement. Each question comes with CRIL's default so the partners can accept, amend or reject rather than draft.

| # | Question | CRIL's default, for reaction | What an answer unlocks |
|---|---|---|---|
| **Q1** | **The staged-response seam.** When pathology (ER/PR/HER2/Ki-67) is available, can each of these legitimately still be unknown: **tumour size, nodal status, stage, ECOG**? Please also confirm that **grade and age** should always be known by then. For fields that can be unknown, should the result be a "preliminary indication, pending [the missing data]", and what may it say? | Tumour size, nodal status and stage can be pending; ECOG, grade and age should be known. Preliminary wording = Build 47's factual notice, with no next-procedure advice | Which gaps route to "Preliminary" and which to "Incomplete entry"; the platform gate change (T1's tier/branch fields) and the result wording in Build 49 |
| **Q2** | **HER2 equivocal.** Should HER2 offer "2+, ISH pending"? If so, what should T1 do with it: withhold the subtype, classify with a caveat, or something else? | Add the state; T1 withholds the subtype and names the pending ISH | An ontology, rule and contract change (platform), then a third HER2 button in the app |
| **Q3** | **Staging system.** Is Stage AJCC 8th **anatomic** or **prognostic**? Are stage, tumour size and nodal status **clinical** (cTNM) or **pathological** (pTNM), or either, recorded as which? | Clinical staging at the point of use, with the system named on screen | Correct labels and hints; the stage-related relationship checks (fields reference F3–F5) become definable |
| **Q4** | **Tumour-size unit.** Millimetres? What precision, and what plausible range? | Millimetres, whole numbers, plausibility check above 200 | The unit shown on screen and on Review; confirms T1's "over 20" risk threshold means 20 mm |

**Deliberately not in this ask** (a later round, to keep this one short):
- the relationship checks F1–F12;
- risk colours (C45-04);
- confidence wording and rounding (C45-08);
- gender (C45-07);
- the full translation review;
- whether any further field should become required (partly answered by Q1).

**When to send.** After Build 47 is on the three phones and Kraken has approved the wording of the ask. Phase 2 need not be finished first. Q2–Q4 do not depend on it, and Q1's answer is implemented through phase 2's structured completeness (P3). If phase 2 has not started when Q1 is answered, it becomes the first platform item.

---

## 4. Decisions needed from Kraken now

1. **Phase 1 scope:** approve M1–M10, and say whether to include M11 and M12.
2. **Version:** 0.6.6 (build 47) for phase 1 is recommended, since it has no format change. Keep 0.7.0 for Build 48, which accepts the new completeness fields.
3. **Sample values:** mark them on Review (M9, recommended for Build 47), or open Steps 1–3 blank for the trial build. Opening blank means ER, PR and HER2 need an unselected state, which touches the required-field checks.
4. **Android A–C:** combine with Build 47, or keep separate.
5. **Phase 2:** who owns platform changes, and whether to authorise that work now or after the clinical ask.

---

## 5. Constraints that carry over unchanged

- No real-patient data in any test, log or commit; synthetic cases only.
- No EAS, cloud build or store submission. Kraken commits and pushes.
- T1 and T2 are started and stopped only by Kraken; T3 and T4 through the review service script.
- The canonical platform checkout is read-only unless phase 2 is separately authorised.
- Nothing goes to ZZU, UCD or HKU until Kraken approves it.
