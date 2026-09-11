# Build 45 — Gate 11 Evidence: Frozen Snapshot and Full Regression (T45-06)

**Authority:** `ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_1.md` §11
**Date:** 11 September 2026
**Result: `G_COMPLETE = false`.** The mobile, gateway and acceptance regression is fully
green at the frozen snapshot. The platform baseline is 292/310; the remaining 18
non-passes are **not** relabelled. G11-03 (independent review) is outstanding. **T45-06
is not closed by this session.**

---

## G11-01 — Frozen snapshot

| Item | Value |
|---|---|
| Frozen commit | **`6ff07acd0d242ba06a22be568b965b842b761cb1`** (`feature/mobile-v0.6.5-build45`) |
| Contents | everything through Gate 10, plus the `ExpoSecureStore` pod integration |
| Platform source under test | canonical SHA **`33daead3223605a44c4b1175bd656d2a5039bfa6`** |

One commit follows the freeze: **P13**, the `patch-package` fix to
`expo-localization`'s iOS Swift source. It changes no JavaScript, TypeScript or gateway
code, and was needed only to compile the Gate 12 iOS build. `verify:mobile` 26/26 and
`typecheck:active` were re-run after it and still pass.

## G11-02 — Mobile, gateway and acceptance regression at the frozen snapshot

| Family | Result |
|---|---|
| Gateway Jest (includes the acceptance suite) | **197 / 197** |
| Acceptance tests AT-01 – AT-19 | **35 / 35 cases**, every AT-ID represented |
| Gateway end-to-end | **4 / 4** |
| T45-11 module suite | **5 / 5** |
| `verify:mobile` | **26 / 26** assertions |
| `typecheck:active` | **PASS** |
| Live integration (Gate 10, re-confirmed behind the new `api.acragent.com` allow-list) | **PASS** — `VERIFIED`, `LIVE_REASONER`, identical clinical output |

`verify:mobile` reports one `LIMITATION` line: rendered responsiveness and visual
direction need simulator or device review. That is Gate 12 work, not a failure.

**Count reconciliation.** Loop v1.0 targeted "157/157 gateway tests". The frozen snapshot
has **197 gateway Jest + 4 e2e + 5 module = 206**. The growth comes from the T45-11
hardening in `b3376e36` (+5), the Gate 3 hostname tests (+3), the Gate 10 auth rewrite and
acceptance suite (+35 acceptance cases, with the retired Build 44 invite tests
re-derived), and the P2 TLS-required test (+1).

**Recommendation (P8).** Add `typecheck:active` to the mandatory family. At Gate 3 it was
found failing at HEAD, even though `verify:mobile` was green, because `verify:mobile` does
not run `tsc`.

## G11-02 — Platform test baseline (fresh; the original 79/79 is NOT RECOVERABLE)

The historic "79/79 targeted platform tests" figure and `G-COMPLETE-REVIEW-001` could
not be recovered (Gate 0 reconciliation). Per Loop v1.1 G11-02, a fresh baseline was
established instead of inventing a replacement figure.

**Method.** A fresh local clone of the canonical checkout (`git clone --no-hardlinks`,
detached at `33daead3`) at
`/Users/Kraken/DAPP/REVIEW-WORKTREES/acr-platform-build45-gate11-baseline`. A clone,
rather than another worktree, adds no metadata to the canonical repository. The full
platform suite was run offline with `mvn -o test` under JDK 21.0.11. The canonical checkout
was byte-identical before and after (HEAD `33daead3`, tracked diff empty).

| Result | Count |
|---|---|
| Tests run | **310** (35 test classes) |
| Passed | **292** |
| Skipped | 1 (`PerformanceIntegrationTest`) |
| **Not passing** | **18** |

**Every reasoning, rules, Bayes and contract family passes**, including those on the
mobile inference path: `MobS000InferResponseContractTest` 6/6, `InferenceContractV22Test`
4/4, `BayesianEnhancerV22Test` 15/15, `BayesianEnhancerTest` 20/20,
`SWRLRulesV22CoverageTest` 17/17, `ReasoningFixtureValidationV22Test` 25/25,
`ReasoningFixtureValidationTest` 13/13, `ReasonerServiceRiskLevelTest` 12/12, the CF-26
provenance regressions 9/9 and 2/2, `SprintEValidationTest` 22/22, and
`OntolatorEndpointsIntegrationTest` 13/13.

**The 18 non-passes are environment-dependent and all share one cause.**

| Tests | Cause |
|---|---|
| `PatientRepositoryTest` ×7, `ImagingStudyRepositoryTest` ×10, `DBBackedIntegrationV22Test` ×1 | The platform's local SQLite database (`src/main/resources/data/acr_database.db`) is gitignored, so a clone does not contain it |

**The database was deliberately not copied into the test clone.** It holds patient-shaped
tables whose data provenance is not recorded in the schema. Copying it into a test
environment is blocked pending a data-classification decision by the platform owner
(Loop v1.1 §0.3: no real-patient data may enter any test).

One further non-pass was **recovered legitimately**: `FileIntegrityValidationTest`
failed only because the runtime `ontology/breast-cancer/logs/` directory — gitignored in
canonical too — was absent from the clone. With that empty directory created it passes
**6/6**. No test source and no data was changed.

## PASS criteria

| Criterion (Loop v1.1 §11) | Status |
|---|---|
| Every mandatory check family passes against a fresh or recovered baseline | **NOT MET** — 18 DB-backed platform tests have not been run. The mandatory family cannot be identified, since the 79-test list is unrecoverable. |
| No failed check relabelled pending | Held — the 18 are reported as not passing |
| Independent reviewer (G11-03) | **Outstanding** — cannot be the implementing session |

**`G_COMPLETE = false`.**

To close T45-06, Kraken needs to:
1. decide the database's data classification — if it is synthetic, the 18 tests can run
   against a copy in the clone;
2. identify, or accept a definition of, the mandatory platform family;
3. appoint an independent reviewer to review this evidence against the frozen snapshot.

## Carried risks

- **P6 — `firedRules[]` order changes fixture SHA-256.** It makes any live fixture
  re-capture non-reproducible byte for byte. It originates in the platform, and the gateway
  deliberately does not reorder it (backlog §7 Stage C).
- **P7 — the stored e2e fixture covers 14 of 21 fields.** It is a Build 43 mock that is not
  eligible for replay. A complete, captured synthetic fixture should replace it before
  any replay-based evaluation.
- **T45-07 — 250 legacy TypeScript diagnostics.** All of them are in
  `src/screens/archived/`, `src/i18n/locales/v1/` and the unused `LanguageSelector` — files
  `App.tsx` never reaches. The maintained boundary is `tsconfig.active.json`, which checks
  exactly the reachable graph at full strictness. That satisfies T45-07's second option
  ("a maintained exclusion boundary without weakening strictness"), subject to Kraken's
  acceptance.

---

**END OF GATE 11 EVIDENCE**
