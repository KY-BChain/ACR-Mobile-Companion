# ACR Mobile CDS Parity Loop v1.6 — Consolidated Execution Evidence

**Closed:** 2 September 2026
**Terminal state:** `IMPLEMENTATION_BUILDS_AND_CLINICIAN_PACKAGE_READY_FOR_KRAKEN_REVIEW`
**Application:** ACR Companion v0.6.0 Build 44
**Use boundary:** controlled synthetic or explicitly authorised non-patient evaluation only

## 1. Outcome

Build 44 was implemented from the preserved Build 43 baseline. The mobile app now transports the complete five-screen contract through a thin authenticated gateway to the existing ACR Platform `/api/infer` backend. Ontology, SWRL/Openllet, platform Java aggregation and optional Bayes remain platform-owned. The gateway validates, authenticates, maps and transports; it contains no clinical classifier or copied fallback.

Kraken completed and reported successful visual and online checks on:

- iPhone 16e/iOS 26.3 simulator, including renewed approval after the clinical-first refinement;
- physical iPhone 13/iOS 26.6.1, including USB/Metro-free standalone relaunch;
- physical Samsung S8/SM-G950F; and
- physical Xiaomi MIX Fold 2.

These are technical/evaluation observations, not clinical acceptance, release approval or distribution authority.

## 2. Source and Git evidence

| Item | Evidence |
| --- | --- |
| Preserved Build 43 mobile baseline | `d32ab22b6fc301710c47eb9667d1261e80e361bf` |
| Build 44 branch | `feature/mobile-v0.6.0-build44-cds-parity` |
| Unified Build 44 source commit | `119a2e5ab4c9d84da9632847e9fbec5dab764d75` |
| Existing public remote | `https://github.com/KY-BChain/ACR-Mobile-Companion.git` |
| Online status | Branch pushed and configured to track `origin/feature/mobile-v0.6.0-build44-cds-parity` |
| Source scope | React Native/TypeScript, native iOS and Android projects, gateway, schemas, fixtures, end-to-end tests and review documents |
| Generated dependency correction | 32,494 tracked `node_modules` files removed; package lockfiles retained |

Kraken's 2 September instruction expressly authorised local Git/GitHub finalisation and online push. That later authority superseded the Loop's original no-commit/no-push boundary for source preservation only. No merge, release tag, pull request, deployment, app-store action or distribution was performed.

## 3. Test and route evidence

- Mobile `npm run verify:mobile`: PASS.
- Active TypeScript `npm run typecheck:active`: PASS.
- Gateway Jest: 5 suites, 153 tests, all PASS.
- Gateway end-to-end: 4 tests, all PASS.
- Gateway tests first encountered sandbox `listen EPERM`; the unchanged suite passed outside the restricted sandbox where localhost binding was permitted.
- Existing Mode 2 Spring Boot hybrid and Cloudflare `acr-api` route were observed working for both the website and mobile same-backend path.
- Observed attestation: reasoner v2.2, `OPENLLET_SWRL`, ontology SHA-256 `b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1`, counts 71 logical / 76 physical / 76 active / 76 loaded / 27 queries.
- Human three-phone online review: all six prescribed steps reported PASS; services were then stopped and listeners cleared.

`G_COMPLETE=false` remains truthful. Kraken expressly deferred the unresolved same-case Openllet-versus-Java-fallback execution, forced BayesianEnhancer failure, and platform operational-log privacy repair to v0.6.5 Build 45. The complete technical and clinical work is specified in `ACR_MOBILE_BUILD45_TECHNICAL_CLINICAL_REVIEW_BACKLOG_v0.1.md`.

## 4. Native artifacts

| Artifact | SHA-256 | Status |
| --- | --- | --- |
| Build 44 Android APK | `20ec9ce8002ae1758610897bd32c840fb960e03df3ead4e297f506af21ce5a04` | Installed and visually reviewed on S8 and MIX Fold 2 |
| Build 44 signed iPhoneOS app ZIP | `e9a2e3405de9347a42930faed8ba57a8a9693c7eeed94d71cb64988b595a1220` | Contains signed Release `.app`; installed and reviewed on iPhone 13; not an App Store IPA |
| Preserved Build 43 Android APK | `fdf3f294ccd696598797a9efe7f873afd94e5d621c45fb719a55a4fb47fe898e` | Prior accepted artifact retained |

The critical external backup is `/Volumes/AndroidDev/ACR-Mobile-Companion-Build44-Critical-20260902`. Its original manifest passed all SHA-256 checks. Additional exact committed-source preservation was added:

- `source/acr-mobile-companion-build44-final-all-refs.bundle`, SHA-256 `fab8c0c279a7be1b0a643989e6875203a8b95d4347e71c453d7783a2494f7c9d`;
- `source/acr-mobile-companion-build44-final-119a2e5a.tar.gz`, SHA-256 `e63e80db229031c7f749247fc68c6bd39e0a1af46067bab569eccb32047d3e92`.

The final bundle verified as complete history and the source gzip passed integrity checking.

## 5. Housekeeping and recovery

Before deletion, Build 44 source was preserved in the external working-source archives, the verified Git bundle, the exact committed-source archive and the online GitHub branch. The following reproducible material was then removed:

- obsolete iPhone 13 iOS 26.6 `(23G71)` device support; current iOS 26.6.1 `(23G83)` support remains;
- completed iPhone SE and iPhone 16e simulator devices;
- internal Gradle caches/wrappers/JDK cache/daemons;
- project CocoaPods, Android build/Gradle, Expo and gateway dependency caches;
- the mobile `node_modules` tree, also removed from version control.

System free space increased from 2.8 GiB immediately before deletion to 15 GiB afterward. All removed items are reproducible from retained source, lockfiles, installed toolchains or Xcode downloads. No application source, native project, schema, fixture, test, governing document, accepted artifact, signing material, external Android SDK or external Gradle cache was deleted.

## 6. Closure and next release

Build 44 is technically complete under Kraken's explicit Phase G deferral and has been inspected on both required physical platforms plus the additional Xiaomi device. Remaining clinical semantics—including authoritative risk grade, tumour-size/stage optionality, governed colour coding, and backend Bayesian percentage presentation—are not invented in Build 44.

Build 45 must complete T45-01 through T45-12, including Phase G, privacy-safe platform logging, clinical/web presentation parity, distinct gateway-versus-platform connectivity, per-invitee governance and an independently reviewed HTTPS remote-review design. A future merge, distribution route, new tunnel/deployment, clinical acceptance and real-patient use each require separate authority.
