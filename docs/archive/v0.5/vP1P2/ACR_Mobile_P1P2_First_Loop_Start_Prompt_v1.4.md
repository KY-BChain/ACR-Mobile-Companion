# MOB-P1P2-FIRST-LOOP-001 — VS Code Codex Start Prompt v1.4

Paste the text below into a new **local** Codex chat while VS Code has `/Users/Kraken/DAPP/acr-mobile-companion/` open as the workspace folder and `feature/mobile-v0.5-p1-p2` selected.

```text
Work only in /Users/Kraken/DAPP/acr-mobile-companion/ as the sole coding agent for this checkout.

Execute MOB-P1P2-FIRST-LOOP-001 exactly as defined in:
vP1P2/ACR_Mobile_P1P2_First_Loop_Codex_Task_v1.4.md

Start K0 now and continue autonomously through K1, K2, K3 and K4 while that instruction permits.

First verify the Git root, public origin KY-BChain/ACR-Mobile-Companion, current feature branch, clean working tree, full local HEAD, full origin/main SHA and 0/0 ahead-behind position at the branch point. Then inspect and prove the existing React Native/Expo build architecture and current three-screen business behaviour before editing.

Preserve the existing stack. Do not install or upgrade dependencies, modify package or lock files, run Expo Prebuild, change native/configuration/API/Result files, or execute vP1P2/apply-v0.5-update.sh against the working tree.

Treat the generator and its 16 embedded outputs only as reference candidates. Compare them with the live repository and implement minimal patches. The active locale files are src/i18n/locales/*.json, with en-GB.json as the source/template. Do not create src/locales/.

Use these current provisional demo values: gender = female, male, other, unknown or empty; pdl1Status = positive, negative, not_tested or empty; her2Low = positive, negative, unknown or empty; treatmentIntent = neoadjuvant, adjuvant, unspecified or empty; ecogScore = integer 0–4 or empty. Keep them strongly typed, selectable and clearable as specified, with no default. Empty gender may show a pending warning but must not block P1 to P2. Keep the nodal warning visible but non-blocking in this UI-only flow. Tumour size may be empty; if entered it must be finite and greater than zero and display “unit pending”. LVEF may be empty; if entered it must be finite and 0–100 inclusive. Invalid non-empty numeric values block navigation or Review. These values await later clinical-partner review and are not API wire values. Keep P1/P2 in memory only and exclude them from the API request, attestation, reasoner processing and Result derivation.

Also extend the existing AboutScreen.tsx, reached from the Home/Welcome screen's existing About action, into the five internally paginated About pages specified in v1.4. Use labels About 1 of 5 through About 5 of 5, not P1/P2. Preserve the existing About route, build/service/attestation/data-handling information and live unavailable-state behaviour. Localise every page in all eight active locales. Cancel or Close must return to Welcome without changing assessment, attestation or language state.

Use this exact English (UK) source meaning:

About 1 of 5 — What the ACR Platform is
Title: What the ACR Platform is
Text: ACR Platform is an investigational clinical decision-support platform. Clinical partners and clinical-trials experts guide the clinical facts collected and review its governed medical knowledge model and decision-support rules. It supports clinical judgement; it does not replace diagnosis, treatment decisions or the responsible clinician.

About 2 of 5 — How it works
Title: How ACR works
Text: An authorised user enters approved structured clinical facts. The companion app sends only the approved assessment request to the connected ACR service. The ACR Platform applies its ontology and clinician-reviewed SWRL rules through the Openllet reasoner. It returns decision-support results with the rules that fired and reasoning provenance for review. Where enabled, the optional Bayesian layer can add a confidence estimate without replacing the rule-based explanation.

About 3 of 5 — Data Stays. Rules Travel.
Title: Data Stays. Rules Travel.
Text: In a clinical deployment, ACR is designed so patient data remains within authorised clinical infrastructure while governed knowledge and rules are deployed to where the data is held. This mobile demo uses synthetic data only and does not demonstrate a production patient-data connection.

About 4 of 5 — Explainability and this demo
Title: Explainability and safety
Text: ACR results are decision support only. The app can show recommendations, fired rules, reasoning mode and baseline identity so the result can be reviewed. P1 and P2 are provisional demo fields in this version and are not sent to the API or used to produce the Result. Do not enter real, coded or pseudonymised patient information.

About 5 of 5 — Build and verified baseline
Retain the existing application, service, baseline-attestation and data-handling cards. Do not hard-code new version, gateway, reasoner, hash or verification claims.

Add or update available verification. If no test runner exists, use only a narrowly scoped zero-dependency approach under tests/p1p2/ with the installed Node.js/TypeScript toolchain. Do not add dependencies.

You may perform one git fetch --prune origin for remote-read verification when approval is available. Do not pull, merge, rebase, reset, stash, discard, commit, tag, push, create a pull request, sign, package, install on a physical device or deploy.

Use at most three evidence-driven correction cycles. Stop only in a legal terminal state from the v1.4 Implementation Task. On success, return READY_FOR_KRAKEN_SIMULATOR_REVIEW with the complete evidence report and uncommitted changed-file inventory.
```
