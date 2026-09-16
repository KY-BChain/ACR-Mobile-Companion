# ACR Mobile — MSP Logical-Flow Investigation v1.0

**Status:** EXECUTABLE — investigate, document, propose. No clinical decision is made in
this session; no clinical threshold, staging rule, or recommendation content is set.
**Trigger:** Kraken's finding, 15 September 2026 — a patient who has not yet had a
mammogram has no tumour-size value, and the current design responds with "Assessment
Blocked" rather than a staged, data-appropriate response. This is a logical-flow defect
in how the platform handles *legitimately incomplete, pre-procedure* data — not the same
problem as the field-relationship contradiction checks already proposed in
`ACR_Mobile_20_Fields_Reference_15SEPT26.md` §4–5, which address values that conflict
with each other. This investigation addresses values that are **absent because the
clinical pathway hasn't reached that point yet.**
**Authority:** CRIL identifies and proposes; ZZU/UCD/HKU decide. Nothing in this document
is sent to any clinical partner until Kraken reviews the output.
**Goal:** reach a Minimum Standard Product (MSP) state — the mobile app's behaviour under
incomplete, real-world, pre-procedure data is logically sound and clearly explained —
before any clinical-partner handover letter goes out.

---

## 0. Framing, so this doesn't drift into a clinical decision

CRIL is not a clinical-trial expert. Nothing in this investigation should:
- invent a clinical urgency scale, a recommended-next-procedure wording, or a risk
  threshold;
- change T1's actual risk/tier calculation logic;
- present a proposed fix to ZZU/UCD as if it were already decided.

What this investigation **should** produce: a clear, evidenced map of where the current
design assumes complete data that a real patient may not yet have, a description of the
logical gap this creates, and a **draft proposal** — framed explicitly as CRIL's
suggested default behaviour, pending clinical review — for how the app could respond
instead. The proposal's job is to give ZZU/UCD something concrete to react to (accept,
amend, reject), not to pre-empt their judgement.

---

## Part I — Map the "Assessment Blocked" problem precisely

### I-A. Every path to a blocked or degraded result

1. From `ReasonerService` (already partly documented in
   `ACR_Mobile_20_Fields_Reference_15SEPT26.md` §1): list every field whose absence
   contributes to tier 1 (blocked) or tier 2 (biomarker-only) status. Confirm the
   existing list (ER, PR, HER2, Ki-67, grade, tumour size, nodal status, age → tier 1;
   stage, ECOG → tier 2) is complete and current.
2. For each of those fields, state explicitly: **does its absence typically reflect a
   procedure or test not yet performed** (e.g. tumour size before imaging, nodal status
   before biopsy/surgical staging, ECOG before a clinical assessment visit), or **does
   its absence typically reflect a data-entry gap** (a value that should routinely be
   known at the point the app is used, but wasn't entered)? This distinction is the
   crux of the whole investigation — a genuinely staged-pathway gap needs a staged
   response; a data-entry gap is a UI/validation problem, not a clinical-pathway one.

### I-B. What "Assessment Blocked" currently communicates, verbatim

1. Capture the exact current UI text, screen state, and any guidance shown to the user
   when tier 1 is reached — not just the Result screen's headline, but any secondary
   text, icon, or colour.
2. State plainly whether the current design gives the clinician **any** actionable
   next step (e.g. "obtain a mammogram") or simply stops.

### I-C. Cross-reference against the platform, read-only

1. Check whether `ReasonerService` or any other platform component already contains
   *any* logic for a staged/partial response — a "preliminary" mode, a recommendation
   keyed to available-data-only, or similar — that the mobile app simply doesn't
   surface. Do not assume none exists; confirm by reading the code.
2. Check the website (`acr_pathway.html`) for the same question — does it handle an
   incomplete case any differently from what §3a of the fields-reference document
   already found (i.e., showing a risk value under a "cannot be determined" banner)?
   That finding was about risk display; this question is about whether there's any
   staged-recommendation logic anywhere in the existing codebase to build on, rather
   than starting from nothing.

---

## Part II — Search for other, similarly-shaped issues

The tumour-size/mammogram case is Kraken's example, not necessarily the only instance
of this pattern. Audit systematically, not just the one field Kraken flagged.

### II-A. For every one of the 20 (21) fields

Using the field table already built in `ACR_Mobile_20_Fields_Reference_15SEPT26.md` §2
as the base, add one more column: **"Can this value legitimately be absent because the
underlying procedure/test hasn't happened yet, at the point a clinician might first use
this app?"** Answer for all 20 fields, not only the ones already known to affect tier.
Candidates worth checking specifically, without assuming the answer in advance:
- **Nodal status** — depends on biopsy/surgical staging, same pathway-timing issue as
  tumour size.
- **HER2-low, PD-L1** — depend on specific biomarker panels that may not be ordered at
  first presentation.
- **CA 15-3, CEA** — tumour markers that may not yet be drawn.
- **Surgery date** — meaningless before a treatment plan exists; is its "optional,
  blank-allowed" status already correct, or does it silently interact with something
  else (e.g. rule R33/R34 timing logic) in a way that produces a confusing rather than
  blocked result?

### II-B. Other flow-logic issues, not limited to missing-data handling

While auditing, note (but do not fix without instruction) anything else structurally
similar to the tumour-size problem — i.e., a place where the app's binary/forced-choice
design doesn't match a real clinical timeline. Two candidates already on record, worth
folding into this same review rather than treating as separate:
- **HER2 has no equivocal/2+ state** (already flagged as C45-06) — is this the same
  underlying issue (a real intermediate clinical state the app currently can't
  represent) as the tumour-size gap, just for a categorical field instead of a numeric
  one?
- **The pre-filled sample data on Steps 1–3** (Note A) — does this interact with the
  missing-data problem in a way that makes it worse? E.g., if tumour size is blank but
  Steps 1–3 are pre-filled and unchanged, does the Result screen's messaging make clear
  *which* of the "missing" fields are genuinely missing versus which are demonstration
  values a clinician forgot to check?

---

## Part III — Draft proposal (explicitly provisional, for clinical review)

**Do not implement any of this in code during this investigation.** Produce it as a
written proposal only.

1. Propose a **staged-response model** as a default design direction: when required-for-
   full-assessment data is absent for a reason consistent with an earlier point in the
   clinical pathway (per Part I-A's classification), the app's result should distinguish
   between:
   - **"Full assessment"** (current tier 3 behaviour, unchanged);
   - **"Preliminary indication, pending [specific missing procedure/data]"** — using
     only the data available, framed explicitly as partial, with the missing data named
     — rather than a flat block;
   - **True block** — reserved for cases where the missing data reflects a data-entry
     gap rather than a legitimate pathway stage, or where T1's own reasoning genuinely
     cannot produce any safe partial output.
2. State plainly that the **content** of a "preliminary indication" (what it says, how
   it's derived from partial data, what urgency language if any is used) is not CRIL's
   to define — that's exactly the judgement ZZU/UCD's clinical-trial expertise covers.
   The proposal's job is to define *where the seam goes* — which fields' absence should
   route to "preliminary" versus "true block" — not what a preliminary result says.
3. Flag explicitly which part of this proposal is **mobile-only** (Result screen
   messaging, tier display) versus **platform work** (any change to how T1 itself
   computes or labels a partial result) — this determines whether it can ship as a
   mobile release alone or needs a platform release too, same distinction already made
   for the §4/§5 field-check proposal.

---

## Part IV — Output

Produce one document: `ACR_MOBILE_MSP_LOGICAL_FLOW_FINDINGS_<date>.md`, containing:
- Part I's complete field-by-field classification (pathway-timing gap vs data-entry
  gap), with the current UI behaviour documented verbatim;
- Part II's audit results, including any additional fields or issues found beyond
  tumour size;
- Part III's provisional proposal, clearly labelled as a starting point for clinical
  review, not a decision;
- An explicit statement of what would need to change in the mobile app alone, and what
  would need a platform-side change, to implement the proposal if accepted as-is.

This document is for Kraken's review only. It does not go to ZZU, UCD, or HKU until
Kraken decides it's ready, and the earlier drafted invitation correspondence stays on
hold until this work is reviewed.

---

**END OF DOCUMENT**
