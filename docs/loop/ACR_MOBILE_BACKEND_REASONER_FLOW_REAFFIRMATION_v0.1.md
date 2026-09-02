# ACR Mobile backend reasoner-flow reaffirmation v0.1

Status: **SOURCE CORRECTED; INDEPENDENT RE-REVIEW AND LIVE H-SIM EVIDENCE PENDING**
Session: `acr-mobile-cds-parity-v1.6-20260831T074903Z`
Source authority: canonical ACR Platform `main` at `33daead3223605a44c4b1175bd656d2a5039bfa6`
Scope: synthetic evaluation only; no patient database access and no clinical-engine change.

## Finding

Build 44 uses one clinical engine: the existing Spring Boot Ontology/SWRL/Openllet platform. The mobile app sends all twenty captured facts through the local authenticated gateway; the gateway validates and translates them, then calls the same public hybrid API route used by the corporate demonstration website. Neither the mobile app nor gateway calculates a subtype, treatment, risk, rule, confidence or recommendation. Exact local synthetic replay is a separately selected delivery mode and preserves captured provenance while truthfully reporting that no current reasoner execution occurred.

The source flow is reaffirmed and supports local implementation/testing. Runtime status, exact fixture capture, same-route live comparison and normal-versus-fallback output comparison remain pending the ordered simulator online review. The current services-off state is an expected availability baseline, not an engine failure.

## Actual service ownership and route

The two back-office processes documented in MODE 2 — HYBRID DEMO are:

1. Spring Boot reasoner/Ontolator, from `ACR-Ontology-Interface`, started with `mvn spring-boot:run -Dspring-boot.run.profiles=hybrid`, listening on local port 8080. Readiness is established by the `Started EngineApplication` log followed by `/api/ontolator/status`, `/api/ontolator/manifest` and `/api/infer/health`.
2. Cloudflare tunnel `acr-api`, started only after Spring readiness with `cloudflared tunnel run --url http://localhost:8080 acr-api`. Public readiness uses the same status/manifest/health paths at `https://api.acragent.com`.

The public path is:

`www.acragent.com/acr_pathway.html` → `ACRApi.mapToBackendPayload()` → `POST https://api.acragent.com/api/infer` → Cloudflare `acr-api` → `http://localhost:8080/api/infer` → `InferenceController` → `ReasonerService`.

The Build 44 mobile candidate is configured to use:

`ACR Companion` → authenticated local gateway at `http://192.168.1.94:3001` → the exact `https://api.acragent.com/api/infer` route for Live mode. Local Synthetic Demo is explicit and does not silently replace Live.

The gateway is not currently listening. Its ordinary H-SIM production launch must explicitly set `ACR_GATEWAY_HOST=192.168.1.94`, `ACR_ALLOW_PRIVATE_LAN=true`, the fixed port, verified HTTPS upstream and exact status/manifest/health evidence routes; the gateway defaults to loopback and refuses an unapproved non-loopback listener. Connection and the observed **Server not connected** → connected transition therefore remain H-SIM evidence, not a present-tense operational claim. The app has no embedded classifier. The hosted website itself remains available, but its current installed failure path can invoke `runEmbeddedInference()`. The isolated Phase E proposal removes that behaviour; it is not deployed and is not evidence that the public site changed.

## Frozen-source and ordinary-runtime accounting

At Phase A, the platform manifest covered 23 canonical source/config/web assets and a separate manifest covered the 3 installed hybrid ontology assets. On 31 August 2026 the same manifests were independently rechecked:

| Boundary | Frozen identity | Current result |
| --- | --- | --- |
| Platform Git | `33daead3223605a44c4b1175bd656d2a5039bfa6`, identical upstream | Unchanged; only the two pre-existing untracked Mobile App review documents remain |
| Canonical manifest | SHA-256 `cad1e522f9862bed66ae9e6b37c794eecf53f1c520a14af5bfefb71aba615b05` | 23/23 files match |
| Installed hybrid manifest | SHA-256 `211e1a3ec5ed83f7ce83c4acc145090c055228f26b9b5ac1382abf8840136c34` | 3/3 files match |
| Ontology OWL | `b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1` | Canonical and installed copies match |
| SWRL rules | `122d635f536962671ab4e16e079e81eb56c2efd639b74400566c25b298634b94` | Canonical and installed copies match |
| SQWRL queries | `65761e96f45f9b719b8697829382e3e08d41db8357c44bd9321aa0391aef3f01` | Canonical and installed copies match |

No service has yet been started in this session. The platform checkout nevertheless contains these pre-existing ignored/ordinary outputs, none created by this session:

| Pre-H-SIM path | Baseline inventory | Latest observed modification | Handling |
| --- | ---: | --- | --- |
| `ACR-Ontology-Interface/target` | 552 files, approximately 12 MiB | 30 August 2026 | Pre-existing Maven output; inventory before/after H-SIM |
| `runtime` | 2 database files, approximately 2.9 MiB | 25 July 2026 | Pre-existing runtime data; do not read/hash patient content as clinical evidence |
| `logs` | 3 files, approximately 2.4 MiB | 13 April 2026 | Pre-existing logs; inventory changes separately |

When MODE 2 starts at H-SIM, this section must record before/after path inventories and distinguish changed/new ordinary runtime outputs from frozen canonical source/assets. The 23/23 and 3/3 manifests must be repeated after live/capture work.

## Canonical execution sequence

1. `InferenceController` accepts `InferenceRequestDTO(patientData, bayesianEnhanced, analysisVersion)` and delegates to `ReasonerService.performInference`.
2. `ReasonerService.performOWLSWRLReasoningWithMode` attempts the ontology pass only when the loaded SWRL count is non-zero. The primary pass asserts ER, PR, HER2, Ki-67, grade and age, classifies with Openllet/SWRL, and reads the inferred subtype.
3. Invalid/missing ontology subtype, zero available SWRL axioms, an exception, or an elapsed duration above 5 seconds selects the platform Java subtype fallback. The elapsed check occurs after synchronous completion: it detects a late result but does not cancel or interrupt the work.
4. Independently of the subtype engine, `ACRSWRLEngine.execute` builds a per-request ontology, asserts its supported date/marker/nodal/histology facts and evaluates the custom rule catalogue to a fixpoint. The frozen baseline is 71 logical rules, 76 physical rules, 76 active, 76 loaded and 27 SQWRL queries.
5. `ReasonerService` normalises the public subtype, calculates Java risk, creates subtype/clinical treatments and biomarkers, and appends date-rule treatments.
6. `ClinicalOutputAssembler.apply` handles in-situ, biomarker-only and full/stage-aware output branches. It consumes already fired custom-rule results; it does not perform a second subtype classification.
7. `BayesianEnhancer` receives the deterministic subtype parameter but uses it only in logging; it has no computational effect on the prior, likelihood, posterior, confidence or bounds. The calculation consumes the age prior plus ER, PR, HER2, Ki-67 and grade likelihoods. It adds an advisory confidence/posterior/bounds object. There is no evidence that this is calibrated diagnostic certainty. Its internal catch returns a disabled Bayesian result.
8. `ReasonerService` assembles textual rules, structured fired rules, evidence, trace and completeness. Openllet does not expose a fired-rule callback here; classification rule provenance is derived by the service from subtype/mode, while custom-engine fired-rule entries come from actual `ACRSWRLRuleResult` records.
9. A broad `ReasonerService` exception catch creates an empty deterministic object and disabled Bayes, which the controller may still wrap as HTTP 200 success. Build 44 gateway validation rejects this partial-success shape and returns no clinical data.

Normal and Java fallback differ only at the subtype-classification step. Custom rules, Java risk/treatment generation, clinical aggregation, optional Bayes, explanations and completeness continue downstream in both modes. A proved difference for the same valid facts will be reported; the gateway will not repair or reinterpret it.

## Twenty-field consumer matrix

Abbreviations: `PD` = `PatientData`; `RS` = `ReasonerService`; `OPA` = primary Openllet assertion; `OPA2` = per-request `OWLPatientAssertionService`; `CRE` = `ACRSWRLEngine`; `COA` = `ClinicalOutputAssembler`; `BE` = `BayesianEnhancer`. Null means JSON null, not zero/false/unknown. Evidence line anchors refer to canonical `ACR-Ontology-Interface/src/main/java/org/acr/platform` source.

| # / incoming property | Conversion/default | Ontology population | Normal/fallback consumer | Custom-rule consumer | Aggregation/Bayes influence | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| 1 `patientData.erStatus: String` | Required `positive\|negative`; unchanged | OPA receptor fact | Openllet subtype; Java fallback subtype | None in per-request custom catalogue | Biomarker/evidence; BE likelihood | `PatientData.java:12`; `ReasonerService.java:788-851,909-936`; `BayesianEnhancer.java:280-340` |
| 2 `prStatus: String` | Required `positive\|negative`; unchanged | OPA receptor fact | Openllet subtype; Java fallback subtype | None | Biomarker/evidence; BE likelihood | Same anchors as ER |
| 3 `her2Status: String` | Required `positive\|negative`; unchanged | OPA receptor fact | Openllet subtype; Java fallback; subtype treatments | None | Biomarker/evidence; BE likelihood | `PatientData.java:14`; `ReasonerService.java:788-851,909-936,1040-1079` |
| 4 `ki67: Double` | Required `0..100`; zero preserved; primary assertion truncates to integer | OPA and OPA2 Ki-67 fact | Openllet/fallback subtype; Java risk | RD-2 (`>20`) | Evidence/completeness; BE bands | `PatientData.java:15`; `ReasonerService.java:788-851,909-980`; `OWLPatientAssertionService.java:137-149` |
| 5 `stage: String` | Nullable canonical stage; default is mobile input only | No primary/custom fact | Java risk/treatment/completeness | None | COA stage-present/absent branch; biomarker | `PatientData.java:42`; `ReasonerService.java:977-1031,1103-1107,1203-1235`; `ClinicalOutputAssembler.java:192-245` |
| 6 `grade: String` | Nullable `1\|2\|3` | OPA grade fact | Openllet input; Java risk | None | Completeness; BE likelihood | `PatientData.java:20`; `ReasonerService.java:788-851,946-980`; `BayesianEnhancer.java:280-340` |
| 7 `histologicalSubtype: String` | Nullable `IDC\|ILC\|DCIS\|PAGET`; normalised by platform | OPA2 histology fact | No primary subtype input | RD-1, RD-1b, RD-2, RD-3 | COA in-situ/full branch | `PatientData.java:64`; `OWLPatientAssertionService.java:158-163,219-237`; `ClinicalOutputAssembler.java:92-133` |
| 8 `nodalStatus: String` | Nullable N0-N3; preserved without website positive/negative collapse | OPA2 derives node-positive Boolean | No primary subtype consumer | RD-3 | Completeness | `PatientData.java:19`; `OWLPatientAssertionService.java:151-155,245-253`; `ReasonerService.java:1203-1235` |
| 9 `age: Integer` | Nullable integer `18..120`; blank→null | OPA age fact | Openllet input; Java risk `>=50` | None | Completeness; BE age prior | `PatientData.java:8`; `ReasonerService.java:788-851,946-980,1203-1235`; `BayesianEnhancer.java:246-252` |
| 10 `ca153: Double` | Nullable finite `>=0`; zero preserved | OPA2 marker fact | No primary/fallback consumer | RE3 then possible RE4-2 | Fired-rule evidence; no dedicated alert assembled | `PatientData.java:65`; `OWLPatientAssertionService.java:137-149`; `ACRSWRLEngine.java:124-209` |
| 11 `cea: Double` | Nullable finite `>=0`; zero preserved | OPA2 marker fact | No primary/fallback consumer | RE4-1 then possible RE4-2 | Fired-rule evidence; no dedicated alert assembled | `PatientData.java:66`; same custom anchors as CA15-3 |
| 12 `surgeryDate: String` | Nullable strict ISO date; platform current date is execution context | OPA2 date/interval facts | No primary/fallback consumer | R33/R34; R38 uses other platform dates | COA date recommendation | `PatientData.java:54,57`; `OWLPatientAssertionService.java:108-135`; `ClinicalOutputAssembler.java:52-66,136-190` |
| 13 wrapper `bayesianEnhanced: boolean` | Required; false preserved; not inside PD | None | Does not select subtype engine | None | Gates BE after aggregation | `InferenceRequestDTO.java:9-20`; `ReasonerService.java:270-282` |
| 14 `tumorSize: Double` | Nullable positive finite raw number; **unit unresolved; no conversion** | None | Java risk threshold `>20`; completeness | None | Risk/completeness only | `PatientData.java:18`; `ReasonerService.java:946-980,1203-1235`. **CLINICAL DECISION REQUIRED — ZZU/UCD** for unit sufficiency |
| 15 `gender: String` | Nullable `female\|male\|other\|unknown`; blank→null | None | **NO ACTIVE CONSUMER FOUND** | None | **NO ACTIVE CONSUMER FOUND** | `PatientData.java:9`; negative source search across RS/CRE/COA/BE |
| 16 `ecogScore: Integer` | Nullable integer `0..4`; zero preserved | None | Java risk Rule B and performance-adjusted treatment; completeness | None | Evidence/completeness | `PatientData.java:41`; `ReasonerService.java:993-1004,1109-1116,1203-1235` |
| 17 `pdl1Status: String` | Nullable `positive\|negative\|not_tested`; not-tested distinct | None | TNBC treatment uses positive/negative only | None | Biomarker/evidence; `not_tested`: **NO ACTIVE CLINICAL OUTPUT CONSUMER FOUND** | `PatientData.java:39`; `ReasonerService.java:246-248,293-303,1092-1101` |
| 18 `her2Low: Boolean` | Mobile positive→true, negative→false, blank/unknown→null; false preserved | None | T-DXd branch when true plus metastatic stage | None | Biomarker/evidence | `PatientData.java:40`; `ReasonerService.java:249-250,293-303,1103-1107`. Lossy unknown mapping; **CLINICAL DECISION REQUIRED — ZZU/UCD** |
| 19 `lvef: Double` | Nullable percentage `0..100`; zero preserved | None | Cardiology recommendation for HER2-positive subtype and `<55` | None | Evidence | `PatientData.java:44`; `ReasonerService.java:300,1123-1128` |
| 20 `treatmentIntent: String` | Nullable `neoadjuvant\|adjuvant\|unspecified`; unspecified distinct | None | Java treatment context for first two values | None | `unspecified`: **NO ACTIVE CLINICAL OUTPUT CONSUMER FOUND** | `PatientData.java:53`; `ReasonerService.java:1151-1178` |

### Generated, derived and platform-only property matrix

Build 44 does not fabricate mobile-absent DTO properties. `NO ACTIVE CONSUMER FOUND` means no use was found in the current controller/reasoner/custom-engine/assembler/Bayes path; it does not assert future clinical irrelevance.

| Incoming property/type | Conversion/default | Ontology population | Normal/fallback consumer | Custom-rule consumer | Aggregation/Bayes influence | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `patientId: String` | Mobile generates synthetic `mob-<UUIDv4>`; never a real-patient lookup in this evaluation | Used to name/correlate request-local and primary patient individuals | Echoed on result/log context; no subtype effect | Per-request identity only | Echo/correlation only; no Bayes effect | `PatientData.java:7,69-75`; `ReasonerService.java:179-184,755-762`; `ACRSWRLEngine.java:142-150` |
| Gateway `requestId: UUIDv4` | Gateway transport correlation; not a PD property | None | **NO ACTIVE CONSUMER FOUND** in platform | None | None | Build 44 gateway request/response schema and mapper |
| `analysisVersion: String` | Gateway pins `2.2`; DTO constructor otherwise defaults `2.0` | None | Accepted by controller wrapper but not passed to `ReasonerService`; **NO ACTIVE CONSUMER FOUND** | None | None | `InferenceRequestDTO.java:9-45`; `InferenceController.java:34-73` |
| `patientEmail: String` | Mobile absent; omitted, no default | None | **NO ACTIVE CONSUMER FOUND** | None | None | `PatientData.java:23,149-155`; negative consumer search |
| `addressFullText: String` | Mobile absent; omitted, no default | None | **NO ACTIVE CONSUMER FOUND** | None | None | `PatientData.java:24,157-163`; negative consumer search |
| `city: String` | Mobile absent; omitted, no default | None | **NO ACTIVE CONSUMER FOUND** | None | None | `PatientData.java:25,165-171`; negative consumer search |
| `postalCode: String` | Mobile absent; omitted, no default | None | **NO ACTIVE CONSUMER FOUND** | None | None | `PatientData.java:26,173-179`; negative consumer search |
| `country: String` | Mobile absent; omitted, no default | None | **NO ACTIVE CONSUMER FOUND** | None | None | `PatientData.java:27,181-187`; negative consumer search |
| `emergencyContactName: String` | Mobile absent; omitted, no default | None | **NO ACTIVE CONSUMER FOUND** | None | None | `PatientData.java:28,189-195`; negative consumer search |
| `emergencyContactPhone: String` | Mobile absent; omitted, no default | None | **NO ACTIVE CONSUMER FOUND** | None | None | `PatientData.java:29,197-203`; negative consumer search |
| `dataProvenance: String` | Mobile absent; gateway does not invent `demo_test`/`realworld` | None | **NO ACTIVE CONSUMER FOUND** | None | None | `PatientData.java:30,205-211`; negative consumer search |
| `consentReference: String` | Mobile absent; omitted, no default | None | **NO ACTIVE CONSUMER FOUND** | None | None | `PatientData.java:31,213-219`; negative consumer search |
| `imagingData: ImagingData` | Mobile absent; omitted, no default | None | **NO ACTIVE CONSUMER FOUND** in current CDS path | None | None | `PatientData.java:33-34,221-227`; negative consumer search |
| `pregnancyStatus: Boolean` | Mobile absent; omitted, no default | None | When true, Java treatment contraindication/warning branch | None | Response evidence; no Bayes effect | `PatientData.java:43`; `ReasonerService.java:299,1119-1121` |
| `residualDisease: String` | Mobile absent; omitted, no default | None | Java residual-disease treatment branch | None | Response evidence; no Bayes effect | `PatientData.java:45`; `ReasonerService.java:301,1131-1142` |
| `daysSinceLastFollowup: Integer` | Mobile absent; omitted, no default | None | Java surveillance output when `>180` | None | Response evidence; no Bayes effect | `PatientData.java:46`; `ReasonerService.java:302,1145-1148` |
| `biopsyDate: String` | Mobile absent; omitted, no default | OPA2 pure-ISO date fact when present | No primary/fallback subtype use | R38 interval start; actual interval is treatment start minus biopsy date | COA recomputes/formats fired R38 output; no Bayes effect | `PatientData.java:55`; `OWLPatientAssertionService.java:132-135`; `ClinicalOutputAssembler.java:165-169`; `ACR_Ontology_Full_v2_2.owl:3018-3039` |
| `treatmentStartDate: String` | Mobile absent; omitted, no default | OPA2 pure-ISO date fact when present | No primary/fallback subtype use | R38 interval end; actual interval is treatment start minus biopsy date | COA recomputes/formats fired R38 output; no Bayes effect | `PatientData.java:56`; same R38 anchors |
| `currentDate: String` | Mobile absent; platform uses `LocalDate.now()` when blank | OPA2 execution-context date fact | No primary/fallback subtype use | Reference only for R33/R34 and their future-surgery guard | COA recomputes/formats R33/R34 date output; no R38 or Bayes effect | `PatientData.java:57`; `OWLPatientAssertionService.java:108-130,257-269`; `ClinicalOutputAssembler.java:153-163,174-188` |
| Derived node-positive `Boolean` | Blank→no assertion; `N0`/`negative`/`0`→false; every other nonblank raw value→true. Build 44 gateway enum limits mobile values to N0-N3 | OPA2 `hasPositiveLymphNodes` | No primary/fallback subtype use | RD-3 | Fired-rule evidence/trace only; no dedicated assembled clinical output; no Bayes effect | `OWLPatientAssertionService.java:151-155,245-253`; `ClinicalOutputAssembler.java:97-133`; gateway request schema |
| Derived canonical public subtype/mode/classification entry | Normalised from actual primary/fallback output; no mobile default | Read from inferred property/class during primary path | Central subtype/mode output and Java treatment/risk routing | Custom rules remain separately sourced | Subtype is passed to BE for logging only with no computational Bayes effect; COA consumes the already-built deterministic result and fired Sprint-E labels, not subtype classification; classification entry is service-derived, not an Openllet callback | `ReasonerService.java:220-234,261-334,853-936,1238-1260+`; `BayesianEnhancer.java:197-235`; `ClinicalOutputAssembler.java:97-245` |
| Derived completeness/top-level risk | Platform derives tier/missing/rules-blocked; top-level risk null for Tier 1/2 | None | Java completeness assessment after inference | None | Suppresses top-level risk; deterministic risk remains and must not be presented as assessed top-level risk | `ReasonerService.java:337-347,1203-1235` |
| Platform `timestamp: String` | `Instant.now()` at request execution | None | Result metadata only; **NO ACTIVE CLINICAL CONSUMER FOUND** | None | No Bayes effect | `ReasonerService.java:182-184` |

## Mode and output truth

| Delivery | Result mode | Current reasoning mode | Required provenance |
| --- | --- | --- | --- |
| Live primary ontology | `LIVE_REASONER` | `OPENLLET_SWRL` | Current status/manifest/health plus local ontology hash |
| Live platform fallback | `PLATFORM_FALLBACK` | `JAVA_HARDCODED_FALLBACK` | Same current attestation; downstream stages still run |
| Exact local synthetic replay | `LOCAL_SYNTHETIC_DEMO` | `NOT_EXECUTED` | Reviewed capture request/response/hash/count/mode retained separately; current execution false |

The Build 44 response preserves the platform's patient/timestamp, deterministic subtype/risk/treatments/biomarkers/mode, Bayesian enabled/confidence/posterior/bounds, reasoning rules/evidence/trace, top-level risk/completeness/mode and warnings. Clients must not supply explanations or clinical defaults missing from that response.

## Evidence and remaining live gates

Source evidence is the backend analyst record at `.acr-loop/v1.6/acr-mobile-cds-parity-v1.6-20260831T074903Z/analysis/BF-BACKEND-CONTRACT-001/backend-contract-analysis.md`, the independently accepted `BF-REVIEW-002` packet, canonical classes named above, and the frozen manifests recorded here.

The following are deliberately not claimed yet and must be appended during H-SIM online review:

- T1/T2 readiness and before/after ordinary runtime-output inventory;
- observed `v2.2 / OPENLLET_SWRL / ontology hash / 71/76/76/76/27` attestation;
- exact same-route synthetic request/response and reviewed fixture capture;
- live primary versus platform fallback consistency for chosen same-fact fixtures;
- website/mobile canonical-request comparison, including the website's five unavailable facts;
- gateway rejection of the platform catch-generated partial HTTP-200 shape against the actual service;
- repeated 23/23 and 3/3 frozen-manifest checks after live work.

This record does not approve clinical sufficiency, deployment or release. Tumour-size unit and HER2-low unknown semantics remain explicit ZZU/UCD clinical decisions. Canonical source also still labels B4 nodal-status → `hasPositiveLymphNodes` Boolean derivation and B5 pure-ISO surgery-date value shape as provisional pending ZZU/UCD sign-off (`OWLPatientAssertionService.java:40-51`). These disclosures do not stop exact unambiguous technical transport and do not authorise a backend change.
