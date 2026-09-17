# MOB-P1P2-AR-RTL-FREEZE-INV-001

## Arabic selection freeze — physical iPhone Release investigation

Run this task in a **new Codex session** from the Codex panel. This is a lean,
diagnostic-only investigation. Do not implement a correction in this session.

## 1. Authority and provenance

- Owner and acceptance authority: Kraken
- Diagnostic agent: Codex
- P1/P2 and multilingual implementation agent: GitHub Copilot Chat
- Simulator visual acceptance authority: Kraken
- Clinical authority: ACR clinical partners
- Commit, push and release authority: Kraken only

## 2. Repository and baselines

Repository:

`/Users/Kraken/DAPP/acr-mobile-companion`

Required branch:

`feature/mobile-v0.5-p1-p2`

Accepted application implementation SHA:

`8196e135e600d75ae891645587ad2dc7536dc303`

Accepted physical-build baseline SHA:

`2a300a1ee67e2c1f43bf53ea01779dbe92bb9e2c`

Kraken will supply the documentation-inclusive `SESSION_BASELINE_SHA` in the
opening message after this investigation script is committed and pushed. Do
not begin unless local HEAD and the remote feature branch both equal that SHA,
the tree is clean, and the accepted build baseline is an ancestor of HEAD.

Any change between `2a300a1ee67e2c1f43bf53ea01779dbe92bb9e2c` and
`SESSION_BASELINE_SHA` must be documentation-only and limited to this file.

## 3. Observed physical-device result

- Local Release build succeeded and installed as an approximately 23.6 MB app.
- The build embedded the Hermes JavaScript bundle and assets.
- No listening Expo/Metro development server was used at runtime.
- English, French, Chinese, German, Japanese, Korean and Russian visual checks
  passed across the two About pages and five assessment pages.
- Selecting Arabic from the Home-screen language window makes the app appear
  frozen on that language window.
- Force-closing and relaunching restores normal operation.
- Arabic had worked in the earlier simulator exercise.
- Arabic is the only configured RTL locale.
- Device is an iPhone 13. Earlier records state iOS 26.6.1, while the latest
  observation states iOS 16.6.1. Query and report the actual installed iOS
  version; do not assume either value.

## 4. Objective

Determine, with evidence, whether Arabic selection causes:

1. a JavaScript/render loop;
2. a native main-thread hang;
3. a crash or watchdog termination;
4. a blocked modal or touch layer while the process remains responsive;
5. an RTL state-change/reload loop;
6. a persistence/rehydration loop;
7. another demonstrated cause.

Identify the smallest probable correction and verification plan, but do not
edit code or rebuild the app in this investigation session.

## 5. Permitted actions

Codex may:

- inspect committed source, locale, test and configuration files read-only;
- inspect the P1/P2 implementation diff and Git history;
- run existing tests, typecheck and lint commands that require no installation;
- parse and compare all eight locale JSON files;
- connect to the already installed app on the physical iPhone;
- open Xcode, Device Hub or macOS Console only when required for device logs;
- use supported Xcode command-line device and diagnostic tools;
- collect focused logs or diagnostics into a unique disposable `/tmp`
  directory;
- ask Kraken to reproduce the freeze on the physical iPhone;
- remove only the investigation's disposable `/tmp` directory after reporting.

Use `grep` if `rg` is unavailable. Do not install `ripgrep` or any other tool.

## 6. Forbidden actions

Do not:

- change any repository file;
- run Prebuild;
- install or update dependencies;
- run `pod install`;
- start Expo Go or a listening Metro server;
- rebuild or reinstall the iOS app;
- change signing, entitlements, native project settings or bundle identifier;
- reset, clean, switch, fetch, pull, merge, rebase, commit or push;
- add diagnostic instrumentation to source;
- modify Arabic wording or clinical content;
- change API, inference, ontology, SWRL/Openllet, attestation or Result code;
- expose credentials, complete device identifiers or unrelated device logs;
- claim clinical validation.

If logs are insufficient without instrumentation, report the exact missing
evidence and propose instrumentation for a separately authorised fix session.

## 7. Phase A — Baseline and resource gate

Record and verify:

- repository path;
- branch;
- `SESSION_BASELINE_SHA`;
- local HEAD and remote feature-branch SHA;
- ahead/behind `0 0`;
- clean staged and unstaged state;
- ancestry of both accepted SHAs;
- documentation-only diff from the accepted build baseline;
- actual iPhone model and iOS version;
- installed app bundle identifier and version where available;
- Developer Mode and trust/pairing state.

Stop with `BLOCKED_BASELINE` for any mismatch or unexpected repository change.

Respect the Mac's 8 GB memory limit:

- do not start a simulator;
- do not run a new build;
- do not run multiple heavy Apple tools concurrently;
- keep device-log capture focused to the reproduction interval;
- close diagnostic applications when evidence collection is complete.

## 8. Phase B — Static trace of the Arabic transition

Trace the complete call path from tapping Arabic to the resulting root render.
Report exact files, functions and relevant line numbers.

Inspect specifically:

- Home-screen language-window selection handler;
- locale store/state setter and persistence layer;
- app/root navigator re-render or key replacement;
- modal dismissal order;
- `I18nManager.isRTL`, `allowRTL`, `forceRTL` and
  `swapLeftAndRightInRTL` usage;
- any `expo-updates`, reload, restart or development-client call;
- `useEffect`, subscription or state-hydration dependencies triggered by
  locale or direction changes;
- any render-time state mutation;
- transition from RTL back to LTR as well as LTR to RTL;
- supported-locale declarations and iOS known regions;
- Arabic locale registration and fallback configuration;
- all values in `src/i18n/locales/ar-SA.json` compared with `en-GB.json` for
  missing keys, extra keys, invalid value types or malformed interpolation;
- navigation, segmented controls and About styles that branch on RTL.

React Native RTL state changes are persisted and normally take full effect on
the next application start. Treat an immediate forced direction change or
reload loop as a hypothesis to prove, not as an assumed cause.

## 9. Phase C — Existing automated evidence

Without installing anything:

1. run the repository's existing test command;
2. run the existing typecheck command;
3. run configured lint only if its dependency is already present;
4. execute or derive a locale-key/type parity check for all eight active JSON
   locale files without creating repository files;
5. identify whether any existing test covers language selection, LTR-to-RTL,
   RTL-to-LTR, persistence or app restart.

Record exact commands, exit codes and skipped checks. Do not call a skipped
check PASS.

## 10. Phase D — Physical Release reproduction and diagnostics

First reproduce without attaching an Xcode debugger, because debugging can
alter hang/watchdog behaviour.

Ask Kraken to perform one controlled reproduction:

1. force-close the ACR app;
2. launch it from its icon with Metro stopped;
3. confirm the Home screen responds in English;
4. open the language window;
5. tap Arabic once;
6. report exactly what remains visible and which controls, gestures or system
   actions still respond;
7. wait no longer than 20 seconds;
8. force-close the app if it remains unresponsive;
9. relaunch and report which locale is active.

During that interval, collect only relevant process/device evidence. Determine:

- whether the app process remains alive;
- whether CPU usage indicates a loop;
- whether the main thread is blocked;
- whether a crash, hang or watchdog diagnostic is generated;
- the last relevant React Native/Hermes/native messages;
- whether locale and RTL state persisted despite the apparent freeze.

If safe and useful, perform at most one second reproduction to confirm the
result. Do not repeatedly freeze the device.

Use Xcode Device Hub, device console logs or supported command-line device
diagnostics as appropriate. Do not require a listening Metro server for Release
logs. Store temporary captures outside the repository and quote only the
minimal relevant excerpts in the report.

## 11. Phase E — Reconciliation

Reconcile static and runtime evidence. For each candidate cause, classify:

- `EVIDENCED`;
- `SUPPORTED BUT NOT PROVEN`;
- `CONTRADICTED`;
- `NOT EVIDENCED`.

The conclusion must identify:

- expected behaviour;
- actual behaviour;
- exact reproduction;
- most likely responsible function/path;
- evidence supporting it;
- alternative explanations still open;
- smallest proposed correction scope;
- tests required before another physical Release build.

Do not implement the proposed correction.

## 12. Required report

Return:

### MOB-P1P2-AR-RTL-FREEZE-INV-001 Evidence Report

1. Terminal state
2. Baseline and repository integrity
3. Confirmed device/iOS/app details
4. Reproduction result
5. Process, hang, crash and log evidence
6. Static Arabic/RTL transition trace
7. Locale parity result
8. Existing tests/typecheck/lint results
9. Candidate-cause matrix
10. Root-cause conclusion and confidence
11. Exact proposed minimal correction
12. Required regression tests
13. Residual risks and missing evidence
14. Final Git status
15. One proposed next action; do not perform it

Use one terminal state only:

- `ROOT_CAUSE_EVIDENCED`
- `ROOT_CAUSE_PROBABLE`
- `INSUFFICIENT_RUNTIME_EVIDENCE`
- `DEFECT_NOT_REPRODUCED`
- `BLOCKED_BASELINE`
- `UNEXPECTED_REPOSITORY_MUTATION`

The session is successful when it produces an evidence-based diagnosis or an
exact statement of what evidence is still required. It is not authorised to
fix or rebuild the app.

