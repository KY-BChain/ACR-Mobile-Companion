# ACR Mobile functional flow for clinical review v0.1

**Application reviewed:** ACR Companion v0.6.0 Build 44
**Status:** controlled evaluation build; technical and owner visual inspection completed on the devices listed below
**Permitted data:** verified synthetic cases or explicitly authorised non-patient test cases only
**Not granted:** clinical acceptance, validation for diagnosis or treatment, real-patient use, external distribution or release approval

## 1. Purpose

This companion describes what Build 44 collects, what the ACR Platform does with those facts, and what a clinician should review before a later build is considered for a formal clinical study.

Build 44 demonstrates the technical route from the mobile assessment to the existing ACR Platform reasoner. It does not establish that the questions, defaults, thresholds, explanations, recommendations or Bayesian presentation are clinically sufficient. Those decisions remain with Kraken and the clinical-trial partners, including ZZU and UCD.

The governing design principle is **“Data Stays. Rules Travel.”** The app does not request names, email addresses, postal addresses, hospital numbers, contact details or emergency-contact details. It sends only the twenty bounded clinical or processing facts listed below and generated technical correlation identifiers. No real patient data is authorised for this build. Clinical facts can themselves be sensitive and must still be minimised and protected.

## 2. What happens from assessment to result

1. The user selects either **Live Platform** or **Synthetic Demonstration** before beginning the five-screen assessment.
2. The app collects twenty values. It checks their allowed form and range, represents a blank optional value as missing, and generates non-clinical request identifiers. It does not calculate a subtype, risk, recommendation or probability.
3. The gateway authenticates the evaluation session, verifies the expected platform identity, validates the request and translates the same facts into the existing platform request. It does not contain a clinical classifier or copied fallback rules.
4. In Live Platform mode, the ACR Platform first attempts its ontology and SWRL classification with Openllet. If the platform itself selects its existing Java fallback, that fallback determines the subtype instead. The gateway does not select or imitate it.
5. The platform's custom ACR-SWRL engine evaluates its separate rule catalogue. Java risk and treatment logic, clinical aggregation and completeness handling then assemble the deterministic result. These downstream stages also run after a platform-selected Java subtype fallback.
6. If Bayesian enhancement was requested, the platform may add its advisory Bayesian values after deterministic processing.
7. The gateway validates the returned structure and sends the explained platform result to the app unchanged in substance. An incomplete or invalid success is rejected rather than shown as a clinical result.
8. The app presents a clinical-first summary, followed by technical detail that is expandable and is open by default in Build 44.

Ontolator — © BlockEnergy / CRIL — is the connected Ontology/SWRL reasoning component. Openllet performs the ontology/SWRL classification. The platform-owned Java fallback is an alternative subtype-classification path when the ontology path is unavailable, invalid, exceptional or late. The custom ACR-SWRL engine evaluates additional rules. Java services assemble risk, treatment and completeness outputs. The optional Bayesian layer adds an advisory metric; it is not mobile-side reasoning.

## 3. Five screens and twenty transported facts

“Initial value” means the value shown at the start of a fresh assessment cycle. All values are editable except the generated technical identifier. The app sends all twenty fields on submission: a valid optional blank is sent as missing rather than being silently replaced by a clinical fact. Numeric zero and Boolean false are preserved.

| Screen | Field and clinical meaning | Initial value and editability | Allowed value and app validation | Entry status and missing behaviour | Current backend use |
| --- | --- | --- | --- | --- | --- |
| 1 — receptors | **ER status**: oestrogen-receptor status | Positive; editable | Positive or negative | Required on screen and by the mobile contract; cannot be blank | Openllet and Java-fallback subtype input; biomarker/evidence output; Bayesian likelihood when enabled |
| 1 — receptors | **PR status**: progesterone-receptor status | Positive; editable | Positive or negative | Required on screen and by the mobile contract; cannot be blank | Openllet and Java-fallback subtype input; biomarker/evidence output; Bayesian likelihood when enabled |
| 1 — receptors | **HER2 status** | Negative; editable | Positive or negative | Required on screen and by the mobile contract; cannot be blank | Openllet and Java-fallback subtype input; subtype treatment, biomarker/evidence and Bayesian likelihood |
| 1 — receptors | **Ki-67**: proliferation index | 25%; editable | Finite number from 0 to 100 inclusive | Required on screen and by the mobile contract; blank is invalid | Openllet and Java-fallback subtype input; Java risk; custom rule RD-2 above its rule threshold; evidence/completeness and Bayesian bands |
| 2 — tumour | **Stage** | II; editable | 0, I, IA, IB, II, IIA, IIB, III, IIIA, IIIB, IIIC or IV | Optional on screen and contract; blank becomes missing | Java risk/treatment and completeness; controls stage-present/absent clinical-output branches. The app does not derive stage |
| 2 — tumour | **Grade** | 2; editable | 1, 2 or 3 | Optional on screen and contract; blank becomes missing | Openllet input, Java risk, completeness and Bayesian likelihood |
| 2 — tumour | **Histological subtype** | IDC; editable | IDC, ILC, DCIS or Paget | Optional on screen and contract; blank becomes missing | Per-request ontology fact; custom rules RD-1, RD-1b, RD-2 and RD-3; influences in-situ versus full clinical-output branches |
| 2 — tumour | **Nodal status** | N0; editable | N0, N1, N2 or N3 | Optional on screen and contract; blank becomes missing | Converted by the platform into a node-positive fact for custom rule RD-3; contributes to completeness. The N0–N3 mapping remains provisional for clinical review |
| 2 — tumour | **Age** | 52 years; editable | Blank or integer from 18 to 120 inclusive | Optional on screen and contract; blank becomes missing | Openllet input, Java risk, completeness and Bayesian age prior |
| 3 — markers and date | **CA 15-3** | 40.0 U/mL; editable | Blank or finite number of at least zero | Optional on screen and contract; blank becomes missing; zero remains zero | Per-request ontology marker fact; custom rule RE3 and possible RE4-2; can appear in fired-rule evidence |
| 3 — markers and date | **CEA** | 6.0; editable | Blank or finite number of at least zero. Build 44 does not present a governed unit for this field | Optional on screen and contract; blank becomes missing; zero remains zero | Per-request ontology marker fact; custom rule RE4-1 and possible RE4-2; can appear in fired-rule evidence |
| 3 — markers and date | **Surgery date** | 14 March 2026; editable | Blank or a real calendar date in year-month-day form; a future date is transported unchanged | Optional on screen and contract; blank becomes missing | Per-request date/interval facts; custom rules R33/R34 and date recommendation assembly. The platform's current date supplies evaluation context |
| 3 — processing choice | **Bayesian enhancement** | On; editable | On or off | Always required by the mobile contract; false is preserved | Selects whether the platform adds the Bayesian advisory object after deterministic processing; it does not select the subtype engine |
| 4 — provisional P1 | **Tumour size** | Blank; editable | Blank or finite number greater than zero | Optional on screen and contract; blank becomes missing. **The unit is unresolved and no conversion is performed** | Java risk threshold above 20 and completeness. Unit, useful range and minimum-case requirement need clinical decision |
| 4 — provisional P1 | **Gender** | Blank; editable | Female, male, other or unknown | Optional on screen and contract; blank becomes missing; explicit unknown remains distinct at transport | Transported and received, but no active consumer was found in the present reasoner, custom-rule, aggregation or Bayesian path |
| 5 — provisional P2 | **ECOG performance score** | Blank; editable | Blank or integer 0, 1, 2, 3 or 4 | Optional on screen and contract; blank becomes missing; zero remains zero | Java risk Rule B, performance-adjusted treatment and completeness |
| 5 — provisional P2 | **PD-L1 status** | Blank; editable | Positive, negative or not tested | Optional on screen and contract; blank becomes missing; not tested is transported distinctly | Positive/negative can influence the TNBC treatment branch; no active clinical-output consumer was found for not tested |
| 5 — provisional P2 | **HER2-low** | Blank; editable | Positive, negative or unknown | Optional on screen and contract; blank becomes missing | Positive maps to true and negative to false for a metastatic-stage T-DXd branch. Blank and explicit unknown both become null at the platform boundary, so this is a known lossy mapping requiring clinical review |
| 5 — provisional P2 | **LVEF**: left-ventricular ejection fraction | Blank; editable | Blank or finite percentage from 0 to 100 inclusive | Optional on screen and contract; blank becomes missing; zero remains zero | Cardiology recommendation when the subtype is HER2-positive and LVEF is below 55; included in evidence |
| 5 — provisional P2 | **Treatment intent** | Blank; editable | Neoadjuvant, adjuvant or unspecified | Optional on screen and contract; blank becomes missing; unspecified is transported distinctly | Neoadjuvant and adjuvant affect Java treatment context; no active clinical-output consumer was found for unspecified |

The initial values are synthetic convenience values, not clinically endorsed defaults. In particular, the defaults must not be interpreted as a suggested patient profile.

## 4. Requiredness and data sufficiency

The current implementation has four different notions of “required”, which must not be treated as interchangeable:

- **Screen-required:** ER, PR, HER2 and Ki-67 must be present to leave the first screen. All other clinical fields are labelled optional; Bayesian enhancement is always represented as an on/off processing choice.
- **Contract-required:** the generated technical patient identifier, ER, PR, HER2, Ki-67 and Bayesian choice must be present. The other clinical properties may be missing. The current app nevertheless includes every property in its outgoing assessment, using null for an optional blank.
- **Platform-required or defaulted:** the platform receives all twenty values. Missing optional facts can change completeness, block rules or reduce the usefulness of the result. Platform current date supplies evaluation context when applicable. Build 44 evidence does not establish one clinically sufficient minimum dataset. The physical review found that omitted tumour size could prevent a useful result despite its optional screen label.
- **Clinician-required:** not yet decided. Clinical partners must define the minimum dataset for each intended use, whether stage and tumour size are optional for entry or inference, and when an incomplete case should produce no result rather than a limited result.

The platform DTO also has properties that this mobile assessment deliberately does not collect, including personal/contact details, imaging data, pregnancy status, residual disease, follow-up interval, biopsy date and treatment-start date. Build 44 does not invent values for them. Some absent clinical properties have active platform branches, so clinical partners must decide whether they are outside the intended mobile use case or need governed collection in a future version.

Generated or derived values are limited to technical request identifiers, a request-local patient individual, fixed analysis/build identity, execution-time date context and platform-derived facts such as node-positive status and the returned subtype. The generated `mob-…` identifier is a random technical correlation value, not a medical-record identifier and not a patient lookup key.

## 5. Result presentation

The clinical-first section presents:

- the returned molecular subtype and returned risk grade, or a dash when the platform supplies no usable grade;
- warnings and context returned by the platform;
- information completeness, missing fields and blocked-rule count;
- returned treatment options;
- returned biomarkers; and
- a Bayesian confidence summary only when the backend marks Bayesian output as enabled.

The app does not invent a High, Medium or Low risk label when the returned risk field is absent. Build 44 also does not yet apply clinically governed risk colours. The physical review observed a dash for risk and requested website-equivalent colour coding, such as red for High and green for Low. The authoritative risk source, grade vocabulary, colour mapping, non-colour accessibility cue and incomplete-result behaviour are Build 45 clinical decisions.

The technical section is optional for the reader and open by default in Build 44. It exposes delivery mode, reasoning mode, whether current inference occurred, returned deterministic data, treatments, biomarkers, fired rules, their labels and provenance, evidence, trace, completeness, Bayesian detail, and current or captured platform identity. It is intended to make provenance inspectable; it must not displace the plain clinical summary.

The source can format an enabled backend Bayesian value as a percentage, but the physical Build 44 review did not display the expected patient-facing percentage. This remains a Build 45 requirement. Any future percentage must come from a valid Bayes-enabled backend response and needs approved wording, rounding, placement and unavailable/off states. It must not be described as the percentage certainty of a deterministic SWRL rule firing or as a calibrated diagnostic probability without calibration evidence.

## 6. Four distinct result and failure behaviours

| Situation | What Build 44 reports | Clinical interpretation |
| --- | --- | --- |
| Normal live reasoning | Live result; Openllet/SWRL reasoning; current execution | The platform ran now and returned the explained result |
| Platform Java fallback | Platform fallback result; Java fallback reasoning; current execution | The platform itself used its existing fallback for subtype classification; downstream custom rules, aggregation and optional Bayes still ran |
| Explicit Synthetic Demonstration | Verified synthetic demonstration; no current execution | An exact, immutable response previously captured from the real platform is replayed only for its matching synthetic request. It is not a fresh inference and does not prove present platform availability |
| Gateway, platform, timeout or invalid response | No clinical result; a structured unavailable, failed or indeterminate state | The app does not silently switch from Live to Demonstration and does not calculate a local answer |

An edited or different request has no verified fixture and is refused rather than paired with an invented result. Fired-rule descriptions, recommendations, warnings and supporting evidence come from the platform response or, in Demonstration mode, from the exact captured platform response. The mobile and gateway do not author them.

## 7. Website and mobile parity

Build 44 Live Platform uses the same ACR Platform inference route as the corporate demonstration website. Controlled tests established substantive direct-to-gateway parity for complete synthetic Bayes-on and Bayes-off cases, and exact fixture replay was independently checked. The final owner inspection also exercised controlled synthetic Live Platform submissions on the physical iPhone 13, Samsung S8 and Xiaomi MIX Fold 2 while the existing platform services and mobile gateway were available.

This does not prove complete website/mobile clinical parity:

- the website currently exposes fewer comparable controls than the mobile app;
- the same-case comparison must control all canonical facts, Bayesian setting, platform/rule assets and evaluation-time context;
- a website-missing fact cannot be dropped from the mobile case merely to create equality;
- ordering of returned fired-rule entries varied between otherwise identical platform executions and has no agreed ordering contract;
- a same-fixture Openllet-versus-Java-fallback comparison remains outstanding; and
- the Build 44 app does not yet mirror the website's full patient-facing result wording and clinically governed colour treatment.

## 8. Build 44 evidence and limits

Build 44 was installed and observed as follows:

- **iPhone 16e simulator:** renewed owner approval after the clinical-first result change and a full nine-step visual inspection.
- **iPhone 13:** Release installation, Metro-free launch, owner visual inspection, full five-screen Live Platform submission and result, explicit Synthetic Demonstration replay, and unplugged standalone relaunch were reported as passed. With the platform services off, live submission failed closed while the separately reachable gateway remained visible.
- **Samsung Galaxy S8:** the audited Build 44 Android package was installed over Build 43, launched without Metro or an emulator, and passed the owner's visual inspection.
- **Xiaomi MIX Fold 2:** the same audited Android package was installed without rebuilding or clearing app data, launched standalone, and passed the owner's visual inspection.
- **Three-phone online check:** the owner reported all six inspection steps passed on the physical iPhone 13, Samsung S8 and Xiaomi MIX Fold 2 using controlled synthetic/non-patient submissions. The same two platform services also supported the web demonstration during that review.

These are technical and human-observation results, not clinical validation. Interactive observations were made by Kraken; automated checks do not substitute for those observations.

Mandatory Phase G remains **incomplete: `G_COMPLETE=false`**. Kraken expressly allowed physical Build 44 inspection as an owner-directed exception and deferred the following to Build 45:

- same-fixture Openllet/SWRL versus Java-fallback execution;
- a forced Bayesian-enhancer failure and its fail-closed handling;
- removal of generated identifiers, submitted clinical/processing facts and derived clinical/result values from platform operational logs, including the reviewed INFO paths in `InferenceController`, `ReasonerService`, `BayesianEnhancer`, `ACRSWRLAuditLogger` and `ClinicalOutputAssembler`;
- the fired-rule ordering contract and complete website/mobile fact-parity design; and
- renewed independent Phase G review on the Build 45 snapshot.

The exception does not authorise real-patient use, clinical acceptance, distribution, deployment or release.

## 9. Privacy and retention boundary

Build 44 mobile assessment state is in memory for the current cycle and is reset when the cycle ends; it is not designed as a patient record. The gateway is designed not to persist assessment bodies or clinical results and to use metadata-only operational logging. Approved immutable synthetic fixtures are the explicit test-evidence exception.

The current platform has a broader operational-log privacy issue. Reviewed INFO paths can emit the generated synthetic correlation identifier in `InferenceController`, `ReasonerService`, `BayesianEnhancer` and `ACRSWRLAuditLogger`, and can emit derived subtype, reasoning-mode or Bayesian-confidence/result values through `ReasonerService` and `ClinicalOutputAssembler`. The identifier is not a name or medical-record number, and the reviewed cases were synthetic/non-patient, but routine operational telemetry must not contain identifiers, submitted facts or derived clinical/result values. Removal/redaction plus sentinel runtime tests across success and exception paths is mandatory Build 45 work. This build must not be used with real patient information.

Any future trial must define where the originating clinical record stays, which bounded facts may travel, lawful basis and consent where applicable, authorised access, retention and deletion, incident response, and whether separately governed adjudication evidence is permitted. Operational app, gateway, tunnel and platform logs must not contain the twenty clinical facts, results, access tokens or invitation-code plaintext.

## 10. Clinical partner review checklist

Mark one decision for each row and add comments. A blank row means no decision has been made.

| Review question | ACCEPT | CHANGE REQUIRED | NOT ASSESSABLE | COMMENTS |
| --- | :---: | :---: | :---: | --- |
| Intended user and intended use are explicit and safe | ☐ | ☐ | ☐ | |
| Meaning and vocabulary of all twenty fields are correct | ☐ | ☐ | ☐ | |
| Units are correct, including CEA and the unresolved tumour-size unit | ☐ | ☐ | ☐ | |
| Numeric ranges and enum choices are clinically appropriate | ☐ | ☐ | ☐ | |
| Synthetic initial values should remain, change or be removed | ☐ | ☐ | ☐ | |
| Required/optional labels match the minimum clinically sufficient dataset | ☐ | ☐ | ☐ | |
| Missing, unknown, not-tested and unspecified states remain clinically distinct where needed | ☐ | ☐ | ☐ | |
| Tumour size, stage and nodal facts have an approved relationship without mobile-side staging | ☐ | ☐ | ☐ | |
| HER2-low mapping is sufficiently expressive and non-lossy | ☐ | ☐ | ☐ | |
| Fields with no active consumer should remain, be explained or be removed | ☐ | ☐ | ☐ | |
| Platform-only pregnancy, residual-disease, follow-up and date facts are correctly excluded or should be added | ☐ | ☐ | ☐ | |
| Subtype and risk wording use the authoritative backend fields | ☐ | ☐ | ☐ | |
| Risk colours, contrast and non-colour cues are safe for High, Medium, Low and unknown/incomplete states | ☐ | ☐ | ☐ | |
| Completeness, missing facts and blocked rules are understandable and actionable | ☐ | ☐ | ☐ | |
| Explanations, fired-rule descriptions and provenance are understandable and sufficient | ☐ | ☐ | ☐ | |
| Treatment and follow-up recommendations have appropriate qualification, contraindication checks and escalation language | ☐ | ☐ | ☐ | |
| Bayesian metric name, percentage conversion, rounding and uncertainty wording are acceptable | ☐ | ☐ | ☐ | |
| Bayesian output is clearly separate from deterministic SWRL inference and does not overstate certainty | ☐ | ☐ | ☐ | |
| Live, platform fallback, verified synthetic replay and unavailable labels cannot be confused | ☐ | ☐ | ☐ | |
| The same complete synthetic case gives substantively equivalent website and mobile output | ☐ | ☐ | ☐ | |
| The proposed synthetic reference-case set and independent clinical adjudication method are adequate | ☐ | ☐ | ☐ | |
| Data Stays. Rules Travel, data minimisation, retention and deletion controls are adequate | ☐ | ☐ | ☐ | |
| Safety stop rules and discrepancy severity categories are defined | ☐ | ☐ | ☐ | |

## 11. Decision record

This document is ready for Kraken and clinical-partner review only. It records the implemented Build 44 flow and its known limits. Completion of the checklist, formal clinical validation, distribution-route approval and release approval are separate future decisions.
