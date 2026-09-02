# ACR Mobile CDS Parity — Autonomous Codex Parent/Child Execution Loop v1.6

**Task:** ACR-MOBILE-CDS-PARITY-LOOP-001
**Status:** FOR KRAKEN REVIEW — NOT EXECUTED
**Supersedes:** v1.0–v1.5 and their conflicting chat amendments. This complete revision implements Kraken's ordered simulator-review and physical-device handovers.
**Current application baseline:** ACR Companion v0.5.1 (Build 43).
**Proposed next test identity:** ACR Companion v0.6.0 (Build 44), unless verified current metadata already requires a later monotonic identity.
**Authority:** Kraken owns scope, architecture decisions, acceptance and release.

This is the complete execution programme for local Codex and its actual subagents. Preserve Build 43; understand the current website/API and the two required local back-office services; implement the mock server and SAME-route API interface; produce Build 44 first on the existing iPhone 16e simulator; PAUSE for Kraken's offline/online inspection; only then request the unlocked iPhone 13 and build/install its standalone Release. After iOS checks, ask Kraken to unplug it and confirm. Only then request AndroidDev and the unlocked Samsung S8, build/install Android, and return the final package for review of both physical phones.

Kraken starts the two back-office services for online review. Codex identifies the established commands, reuses healthy services and verifies actual connectivity; it does not start/stop those shared services without Kraken's separate direct instruction. Missing services do not prevent source-based implementation or local tests. Required live evidence must be completed before physical installation; staged pending checks are not PASS. Paid VPS/ISP deployment is outside this Loop.

On `EXECUTE LOOP v1.6 GO`, use actual implementer and independent-reviewer agents, bounded repair, saved state and the mandatory human pauses below. This Markdown programme is not a shell script. Do not return only another plan; do not confuse unattended operation with permission to skip Kraken's checkpoints.

## 1. Controlling inputs and outputs

Read BOTH files completely before starting:

```text
/Users/Kraken/DAPP/acr-mobile-companion-extended/docs/ACR_MOBILE_CDS_PARITY_WHAT_WHY_HOW_v1.6.md
/Users/Kraken/DAPP/acr-mobile-companion-extended/docs/ACR_MOBILE_CDS_PARITY_AUTONOMOUS_CODEX_LOOP_v1.6.md
```

This Loop controls execution detail. The companion explains the same scope; any material contradiction between them is a blocker, not permission to choose the more permissive text.

Working locations:

```text
MOBILE_REPO=/Users/Kraken/DAPP/acr-mobile-companion
GATEWAY_REPO=/Users/Kraken/DAPP/acr-mobile-companion-extended
PLATFORM_REPO=/Users/Kraken/DAPP/acr-platform
PLATFORM_GUIDE=/Users/Kraken/DAPP/ACR-platform-ARCHIVE-preSPG/docs/ACR_Platform_Operations_Guide_v2.2.0_29MAY26.md
DOCS=/Users/Kraken/DAPP/acr-mobile-companion-extended/docs
ANDROID_VOLUME=/Volumes/AndroidDev
ARCHIVE=/Users/Kraken/DAPP/acr-mobile-companion-extended/docs/archive
```

Only the v1.6 pair directly under `DOCS` controls this execution. Kraken has created `DOCS/archive/` for older documents. Verify that location; treat its contents as historical reference only. Do not move/delete archived files, execute superseded loops, or require a missing v1.2 download. If an old evidence document was moved, find it in this project archive rather than declaring it missing. No archive reorganisation is authorised.

All new user-facing implementation/review documents go directly under `DOCS`, not the historical investigation subdirectory or `archive/`. Required generated outputs are:

```text
ACR_MOBILE_BACKEND_REASONER_FLOW_REAFFIRMATION_v0.1.md
ACR_MOBILE_FUNCTIONAL_FLOW_FOR_CLINICAL_REVIEW_v0.1.md
ACR_MOBILE_CDS_PARITY_EXECUTION_EVIDENCE_v1.6.md
ACR_MOBILE_CDS_PARITY_LOOP_STATE_v1.6.json
ACR_MOBILE_CDS_PARITY_LOOP_JOURNAL_v1.6.jsonl
```

The first two are OUTPUTS, not prerequisites. Create the backend record in Phase F and the clinician companion in Phase I. Preserve an existing output, if present: inspect it and update with explicit provenance rather than overwriting unrelated work.

Use an ignored, session-specific directory below `GATEWAY_REPO/.acr-loop/v1.6/` for disposable logs, isolated platform copies, source snapshots and agent return packets. Keep final artefacts in a separate explicit resolved-version/build directory under the existing project evidence/distribution location; if none exists, use `GATEWAY_REPO/.acr-artifacts/<resolved-version-build>/<session-id>/` (default `v0.6.0-build44`). Both locations must be excluded from Git without rewriting an existing ignore policy. Never place credentials in either directory.

## 2. Objective and non-negotiable boundaries

Build the first working mobile–gateway–ACR Platform interface using the same back-office connection as the current web application at `www.acragent.com`. Preserve the sponsor's product attribution: Ontolator — © BlockEnergy / CRIL, the connected Ontology/SWRL reasoning component. Discover the actual two locally hosted service/process identities and route from code, scripts, operations guide and runtime evidence; do not guess that a transport tunnel is a reasoning engine. All facts from all five mobile assessment screens must be transported. The gateway and mobile perform NO clinical inference. The existing platform owns ontology, SWRL/SQWRL, Openllet, Java fallback, custom ACR-SWRL, clinical aggregation and optional Bayes.

For identical canonical patient facts, Bayesian setting, platform revision, ontology/rule assets and evaluation-time context, website and mobile must receive identical substantive CDS output and explanation. Neither copied fallback logic nor a different mobile rule implementation is permitted.

Four outcomes must remain distinct:

| Outcome | resultMode | reasoningMode | Behaviour |
| --- | --- | --- | --- |
| Platform Openllet execution | LIVE_REASONER | OPENLLET_SWRL | Preserve platform output |
| Platform-owned Java fallback | PLATFORM_FALLBACK | JAVA_HARDCODED_FALLBACK | Preserve platform output; label fallback |
| Exact synthetic fixture replay | LOCAL_SYNTHETIC_DEMO | NOT_EXECUTED | Replay captured synthetic result; label no current inference |
| Unreachable, timed-out or invalid service | No result | No claimed execution | Structured error; never automatic mock fallback |

Preserve subtype, fired-rule IDs/descriptions, inferences, recommendations/supporting rules, warnings, Bayesian values and ontology/rule identity. Only enumerated transport identifiers/timestamps and truthful execution-source metadata may differ. Do not remove substantive fields to manufacture equality.

Synthetic request/response fixture files and synthetic test evidence are explicitly permitted. Live patient data is forbidden. Runtime assessment payloads/results must not be intentionally persisted by mobile or gateway or written to their logs. The fixture exception does not authorise logging user-entered requests, copying patient databases or generating fixtures from real patients.

No clinical acceptance is inferred from previous traces, agent review, successful builds or this document. Historical Build 43 UI acceptance remains historical; the new implementation returns to Kraken for review.

## 3. Mutation, credential and network authority

### Permitted after v1.6 GO

- Read all three workspaces and applicable `AGENTS.md` instructions; preserve existing user changes.
- Modify scoped mobile transport, validation, presentation, version metadata and tests; use existing mobile dependencies.
- Implement gateway source, schemas, types, synthetic fixtures and tests. Install/pin only required gateway dependencies in its actual package root and record lockfile changes.
- Create local implementation branches where appropriate. If extended remains non-Git, initialise local version control without a commit or remote; preserve a verified pre-edit source snapshot first.
- Reuse healthy required local services and inspect the established startup procedure. Kraken starts missing back-office services for online review; request that action at the relevant live-test checkpoint. Start/restart a shared service or existing tunnel only if Kraken explicitly delegates that action in the local session. Inspect/use the existing website and configured reasoner route with synthetic inputs. No new tunnel, DNS, hostname or public exposure. Start the newly implemented task-owned mock/gateway within its stated binding limits. Native builds/installations require the stage-specific human gates.
- Use existing-account Xcode automatic signing, including renewal/replacement of an expired Personal Team development profile/certificate and ordinary registration of the authorised iPhone. This is permitted normal build behaviour, not an unauthorised change of signing design.
- Make narrowly scoped platform FRONTEND request-mapping/failure-path changes and test-only additions in an isolated source copy only. Return its diff; never deploy or copy changes into the canonical checkout.
- Perform the bounded housekeeping in Phase J after preserving final artefacts.

### Forbidden

- Any commit, push, merge, tag, remote creation, deployment, public upload, TestFlight, app-store/Play/Firebase distribution, OTA activation or external clinician distribution. There is NO gateway-baseline-commit exception in v1.6.
- Any source, clinical-engine, ontology/rule, persistent configuration, patient-database or Git-metadata change in the canonical `PLATFORM_REPO`. If Kraken explicitly delegates starting the established installation, only its existing procedure is permitted. Before starting, identify ordinary nonclinical runtime log/cache/output paths; use existing supported overrides to task-owned paths where available. If the established startup command necessarily compiles unchanged backend source, allow only its identified normal generated build outputs and verify the source/assets remain unchanged. This is not permission to deploy a changed backend. Injected test-only changes use a separate source copy, never `git worktree add` against the canonical repository. Record normal runtime/build writes separately from frozen source integrity.
- Any production change to ontology, SWRL/SQWRL, Openllet, Java fallback, ACR-SWRL, risk/treatment aggregation, recommendation content or Bayes, including in the isolated copy.
- Expo Prebuild, regeneration/deletion of native projects, mobile npm/yarn/pnpm/Pod installation or upgrade, global package installation, Xcode/SDK/JDK/Gradle upgrade, EAS/cloud build or downloading simulator/Android system images.
- New signing team/account, paid-programme enrolment, capability/entitlement changes, changing bundle/application IDs, silent tracked signing edits, certificate/private-key export, or requests for passwords/2FA codes in chat.
- Android emulator/AVD creation, download or launch; SDK/cache relocation, copying ADB elsewhere or persistent PATH changes.
- Real-patient access/assessment, arbitrary production endpoints, changes to `/opt/acr` or existing deployment configuration, VPS/ISP deployment, new tunnel/DNS setup, broad cleanup, automatic downgrade/uninstall or erasure of device data. Synthetic requests through the verified existing website/reasoner route are explicitly permitted after confirming compatible endpoint persistence/logging behaviour.

Preserve Build 43 BEFORE changing its source or overwriting any existing build output: record its accepted source revision, make a verified recoverable source snapshot (including relevant uncommitted baseline files if any), and copy/hash existing Build 43 APK/iOS artefacts and evidence into a separate protected directory, using the existing evidence location or `GATEWAY_REPO/.acr-artifacts/v0.5.1-build43/<session-id>/`. Keep accepted baseline branch/history unchanged; implement Build 44 on a development branch. Report missing historical binaries honestly. Verify the snapshot and existing artefact copies before new builds overwrite old output locations. Planned Build 44 installation replaces the installed app on each phone; preservation means recoverable Build 43 source/artefacts, not two simultaneous apps with the same ID. Never erase its protected package during housekeeping.

An approval or authentication prompt is a real pause. Do not bypass it, weaken permissions or manufacture credentials. Existing Apple provisioning communication and scoped gateway dependency downloads are permitted through configured tools, subject to actual environment permissions.

## 4. Recovered Build 43 procedure — mandatory baseline

Locate and read the relevant local copies, searching project docs if necessary:

- `MOB-P1P2-IOS-STANDALONE-001.md`, particularly its authority and automatic-signing sections.
- `MOB-V0.5.1-IOS-ANDROID-SYNC-001-Evidence-Report.md` and its controlling build instruction if present.
- Existing mobile `ios/`, `android/`, `app.json`, `src/config/appIdentity.ts`, version/poster/RTL/P1P2 verifiers and project build scripts.
- Prior gateway/fallback trace evidence as implementation leads, not sponsor acceptance.

Use the following recovered facts as the starting build contract, then verify current paths/settings without resetting, upgrading or reconfiguring them:

| Item | Proven setup to preserve |
| --- | --- |
| Native iOS | `ios/ACRCompanion.xcworkspace`, scheme `ACRCompanion`; existing Pods and native project |
| Simulator | Existing iPhone 16e simulator, recorded iOS 26.3.1; Debug with project-local Metro |
| Physical iOS | Directly connected iPhone 13, iOS 26.6.1; Release/iphoneos, Metro stopped |
| Provisioning | Existing automatic signing; Build 43 used `-allowProvisioningUpdates`; renewal permitted |
| iOS identifier | `com.anonymous.acr-mobile-companion` |
| Android target | Samsung SM-G950F / Galaxy S8, recorded Android 9/API 28; physical device only |
| External SDK | `ANDROID_HOME` and `ANDROID_SDK_ROOT`: `/Volumes/AndroidDev/android-sdk` |
| External Gradle cache | `GRADLE_USER_HOME=/Volumes/AndroidDev/.gradle` |
| ADB | `/Volumes/AndroidDev/android-sdk/platform-tools/adb` — the established available client |
| APK output | `/Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/app-release.apk` — remains inside mobile repository |
| Android build | Existing Gradle wrapper, `app:assembleRelease`; no daemon, one worker, no parallel/configure-on-demand |
| Recorded toolchain | Gradle 8.8, Temurin Java 21, 2 GiB Gradle heap; SDK 34, Build Tools 34.0.0, NDK 26.1.10909125, CMake 3.22.1 |
| Android signing | Existing Release signing design used Android Debug certificate with v1/v2 verification; preserve and disclose test-only posture |
| Standalone | JS/assets embedded; no Expo Go or development launcher; Metro absent for both physical platforms |

The external drive is required for Android build, audit, installation AND launch verification, because ADB resides on it. Do not move APK output or caches to another disk as an assumed optimisation. AndroidDev need not be mounted to implement the gateway or complete the earlier iOS stages. Check it again immediately before Android work and throughout that work.

Historical simulator UUIDs, device identifiers, session SHAs and profile expiration dates are evidence, not commands to reset the machine. Old documents' session-specific branch, no-edit and stop-after-iOS instructions are historical scope, not controlling instructions for this new integrated implementation. Preserve their proven build mechanics under this v1.6 authority. Identify the actual current device destinations. An expired OLD profile alone is not a blocker: follow the permitted automatic renewal process and inspect the newly built profile.

Historical Android build duration was 4m 6s for Build 43, with cached tasks. This is evidence, not a duration promise for the new interface.

## 5. Actual agents, ownership and dispatch

The MAIN Codex thread is the parent/coordinator, not the sole implementer wearing multiple role names. It must spawn distinct child threads using the native delegation tools actually exposed in the local Codex session, retain their returned IDs, dispatch bounded tasks, collect returns and send defects back to the owning child.

Start by spawning the build-baseline child for Phase A. A successful child return demonstrates working delegation; no artificial probe or extra report is needed. If agent tools are genuinely unavailable, return `BLOCKED_AGENT_ORCHESTRATION` with observed capability evidence. Do not silently downgrade to a single-agent run, install an orchestration framework or change Codex account/configuration.

| Role | Actual work/ownership | Review relationship |
| --- | --- | --- |
| Parent | Scope, dispatch, path grants, state/journal, snapshots, resource lock, integration and final return | Never grants Kraken acceptance |
| Build-baseline/build executor | Recover build settings, identify the two-service procedure and actual web route; verify Kraken-started services; execute serial native builds/artefact checks | Independent reviewer checks its evidence |
| Backend/contract analyst | Read-only canonical backend/field analysis; propose contract; Phase F evidence | Separate reviewer checks source references and mapping |
| Gateway implementer | Scoped gateway/schema/type/test files, including exact fixture replay | Reviewer independently exercises contracts and failures |
| Mobile implementer | Scoped active mobile transport/UI/tests/version metadata | Reviewer checks five-screen path and regressions |
| Frontend/test implementer | Only allowlisted isolated platform frontend/test files and parity harness | Reviewer checks backend remains unchanged |
| Independent reviewer | Read-only source/diff/artefact review; independent test reruns in granted test-output locations | Must not implement the change being reviewed |
| Clinician-document writer | Phase I document from frozen final code, backend mapping and test evidence | Reviewer checks every claim against evidence |

Use roles only when their gate needs them, not seven continuously active workers. Maximum THREE concurrent child threads, at most ONE source-writing child at a time and ONE heavy local process at a time. Read-only analyses can overlap. Review a writer's fixed snapshot after it returns; do not review moving source. Reuse suitable child threads within one role to conserve context; never reuse an implementer as its own independent reviewer.

Children do not create further agents, change their own scope or commit. Parent must grant exact writable paths for each task. If a child needs a shared file or another repository, it returns a scope request; parent grants only authority already in this document or stops for Kraken. Parent must not independently edit a child's owned file while that child is active.

### Required child task envelope

For each dispatch, fill in and send this envelope plus the relevant phase requirements:

```text
TASK_ID / PARENT_SESSION_ID / PHASE / ATTEMPT:
ROLE AND OBJECTIVE:
BASELINE_SOURCE_SNAPSHOT_ID:
READ LOCATIONS AND CANONICAL EVIDENCE:
EXACT WRITABLE PATHS (or READ ONLY):
REQUIRED ACTIONS AND TESTS:
PASS CONDITIONS:
FORBIDDEN ACTIONS / STOP CONDITIONS:
RESOURCE LEASE (none, test, or native-build):
RETURN PACKET PATH:
Return results and evidence to the parent. Do not advance another phase.
```

Each child returns: actual thread/task ID, input snapshot ID, changed-file inventory, commands/exit codes/test counts, output/artefact paths, failed criteria, exceptions, and `EVIDENCE_READY`, `REPAIR_REQUIRED` or `BLOCKED`. A statement of confidence without underlying evidence is not a passing return.

### Parent gate algorithm — execute, do not merely describe

1. Confirm dependencies, grant exact file ownership and dispatch the assigned child.
2. Collect the child return; verify source snapshot, file inventory and resource release.
3. Freeze/hash the relevant resulting source and artefacts; dispatch a DISTINCT reviewer against that snapshot.
4. Reviewer reads actual source/diff and independently runs proportionate checks, not just the implementer's report.
5. If technical gate criteria pass, append evidence and reviewer ID to the journal. Advance automatically only if the next task is eligible AND every required human gate for it is recorded. Reviewer PASS never substitutes for simulator approval, device connection or unplug confirmation.
6. If a repairable failure occurs, assign it to the responsible implementation child; rerun the failed check, then affected regressions; reviewer rechecks the repaired snapshot before progression.
7. If a repair affects an earlier gate, invalidate that gate and all dependent evidence. Reverify; never retain a green status for old source.
8. At a planned human gate, checkpoint the exact WAITING status and ask once for the needed action; yield the turn. Do not poll endlessly, impose an acceptance timeout, consume repair rounds for waiting, or advance on silence. If blocked by scope, safety, credentials, defective hardware or budget, preserve work and report the precise blocker. A normal planned handover is WAITING, not a failed build.

Evidence-led improvement: the reviewer records each verified defect, root cause, correction, affected regressions and reusable check in the existing journal. Later child tasks must read relevant findings and apply them. This is shared project evidence and adaptation, not model retraining or permission to alter the clinical engine, build procedure, scope or human gates.

Repair budget: retain the v1.3 maximum of THREE evidence-driven repair rounds after first-pass work. On a failed independent review, freeze the currently known defect batch, increment the global counter and open that round. Give each affected owner at most one bounded repair task for that batch, followed by its local tests and independent review. The round closes when those reviewer returns arrive. Any further corrective dispatch after the round closes requires the next round; newly discovered defects cannot be added indefinitely to an old round. Routine edits inside an owner's initial task or its one bounded repair task are not separately counted rounds. A remaining defect after round 3 returns `BLOCKED_REPAIR_BUDGET`. Counters and frozen batches survive resumption; source reversion, agent replacement or phase re-entry never resets them. Maximum two retries of an unchanged command for a clearly transient environment error; permission/authentication failures are never retried around a restriction.

## 6. Durable state, review identity and resource controls

Before source edits, parent creates the state and journal under `DOCS`. State must at least record:

```json
{
  "instructionVersion": "1.6",
  "sessionId": "assigned-at-start",
  "status": "IN_PROGRESS",
  "currentPhase": "A",
  "repairRound": 0,
  "baselines": {},
  "sourceSnapshotId": null,
  "build43Preservation": {},
  "serviceRoute": {},
  "serviceOwnershipAndRuntimePaths": {},
  "agents": {},
  "gates": {},
  "resourceLease": null,
  "taskOwnedProcesses": [],
  "artifacts": [],
  "humanChecksPending": [],
  "humanGates": {},
  "pendingLiveChecks": [],
  "keepAwake": {},
  "reviewFindings": [],
  "blockedReason": null,
  "nextAction": null
}
```

Use atomic state replacement and append-only journal events. Record UTC time, phase, owner/reviewer IDs, relevant snapshot, check result and next action. Never include patient payloads, passwords, full device serials or private signing details. Checkpoint after each child return/review and before/after native build stages.

Because commits are prohibited, use an evidence manifest of actual relevant source/config/test file hashes plus Git HEAD/diff/untracked inventory as the review/build identity. Include gateway, mobile and isolated platform source identities and version metadata. Exclude runtime logs, the evolving journal, device IDs, signing cache and generated build products from the source digest; hash artefacts separately. An unstaged implementation can be reviewed reproducibly without falsely claiming a commit exists.

Before modifying non-Git gateway files, preserve an exact allowlisted source/config/test snapshot and hash manifest, excluding secrets, databases, dependencies and generated data. Preserve pre-existing dirty files separately; never discard them. Do not restore snapshots automatically over later user edits.

The parent grants a single resource lease before Maven, native builds or other heavy test work. Record owner thread, process/session ID, command, output directory and phase. No concurrent Xcode, Gradle, Maven or simulator build. Healthy existing website/reasoner services are not competing build jobs: preserve them; limit task build concurrency and diagnose actual memory pressure rather than shutting shared services down. A reviewer uses the existing build artefact when inspecting metadata; it does not launch a competing rebuild. Keep the simulator, its Metro session and the task gateway available throughout WAITING_FOR_SIMULATOR_REVIEW. Shut down the simulator and stop project Metro only AFTER Kraken completes simulator review and permits the iPhone stage, preserving its app before physical/Android heavy work.

On compaction, disconnect or resumed session: read state and journal, verify source/artefact hashes and actual live processes, recover child returns where possible, and resume the first incomplete valid gate. Do not restart from Phase A, create another branch or duplicate an ongoing build. An apparently stale lease is released only after checking its recorded process. Never kill unrelated processes.

If a local command produces no progress for ten minutes, inspect its process/log and available resources. Do not confuse a quiet compiler with a hang. If progress cannot be established, checkpoint and stop that task-owned process gracefully; return a blocker rather than waiting indefinitely.

### MacBook awake and resumable human pauses

Verify AC power and the user's no-sleep arrangement at start. Keep the lid open. Inspect existing power assertions; preserve a suitable user-owned assertion. If none exists, use the installed macOS `caffeinate` supported flags, for example `caffeinate -i -s`, as a separately tracked task-owned process; verify its assertion/PID. Do not change persistent power settings, disable screen locking/security, require sudo, or claim this prevents lid-close sleep, power loss or session/authentication interruption.

Keep the assertion and required review processes available at planned human pauses; record them in state so a resumed turn does not duplicate them. No long blocking sleeps or repeated device polling: ask, checkpoint and yield. At final handoff or cancellation, release only this Loop's own keep-awake assertion and explain that normal sleep policy then applies; never stop the user's no-sleep process. Expected unattended progress ends at simulator review (or an earlier genuine access/service dependency), not automatically after both physical installations.

## 7. Execution schedule

Every technical stage has a distinct reviewer return. Mandatory human gates follow Kraken's order:

| Kraken step | Execution stage | Required outcome / stop |
| --- | --- | --- |
| 2.1 | A | Read current pair fully; verify docs/archive; preserve Build 43, build conditions and no-sleep arrangement |
| 2.2 | A1 | Verify existing web/API mapping and identify both service/startup paths; runtime status stated truthfully |
| 2.3 | B–G | Implement all-five-screen contract, mock/gateway and mobile connection; F backend reaffirmation; local tests and available live tests |
| 2.4 first | H-SIM | Build/install/launch existing iPhone 16e; independent review; STOP for Kraken's offline/online simulator inspection and service startup |
| 2.4 next | H-IOS-READY → H-IOS | Only after simulator approval: request unlocked iPhone 13/iOS 26.6.1; verify connection, build/sign/install/launch |
| 2.5 | H-IOS-DISCONNECT | Ask Kraken to unplug iPhone 13 and confirm standalone relaunch; STOP until confirmed |
| 2.6 | H-ANDROID-READY | Only after iOS completion: ask for mounted AndroidDev and unlocked, USB-authorised S8; verify both before Android work |
| 2.7 | H-ANDROID | Build/audit/install/launch Android Build 44 on S8; separate reviewer; no emulator |
| 2.8 | I–J and final | Clinician companion, bounded housekeeping, final report; invite Kraken to review BOTH physical Build 44 apps |
| 2.9 throughout | Independent reviewer | Cross-reference actual source, tests, signatures, artefacts and stage evidence; retain findings for subsequent stages |

Technical detail remains B contract, C gateway/mock, D mobile, E isolated frontend parity proposals, F read-only backend reaffirmation, G tests. These are implementation tasks, not separate approval paperwork.

Mandatory resumable waiting states:

| State | May resume only when |
| --- | --- |
| WAITING_FOR_BACKOFFICE_SERVICES | Kraken confirms starting the services and Codex verifies actual route/readiness; source/local work may precede this gate |
| WAITING_FOR_SIMULATOR_REVIEW | Required simulator offline/mock and online checks completed; Kraken explicitly permits the iPhone stage for the reviewed source/configuration |
| WAITING_FOR_IPHONE_CONNECTION | Requested unlocked iPhone 13 is connected and usable; any trust/signing prompt resolved by Kraken |
| WAITING_FOR_IPHONE_DISCONNECTION | Kraken confirms USB unplug and standalone relaunch; iOS technical evidence is complete |
| WAITING_FOR_ANDROID_CONNECTION | After the unplug gate, Kraken confirms AndroidDev/S8 connection and Codex verifies actual mount/device authorisation |

Record each human response, timestamp, relevant source/configuration/artefact identity and next authorised action; do not store private device IDs. Natural-language approval is sufficient; no magic phrase is required. A generic resume, already-connected cable, automated reviewer PASS, elapsed time or silence is not human acceptance. A response may satisfy several currently eligible requested actions, never a future unrequested gate. Invalidate affected approvals when a repair changes what Kraken inspected; retest/rebuild and request renewed review before proceeding. Final clinical/product acceptance remains with Kraken.

## 8. Phase A — protect the current baseline and recover build conditions

1. Read applicable workspace instructions. Record actual repositories/package roots, branches, HEADs, upstream references and dirty/untracked state. Do not fetch, pull, reset, clean or switch to a historical SHA.
2. Known leads: mobile branch `feature/mobile-v0.5.1-cross-platform-sync`, later recorded HEAD `d32ab22b6fc301710c47eb9667d1261e80e361bf`; platform trace HEAD `33daead3223605a44c4b1175bd656d2a5039bfa6`. Reconcile these with current evidence. Documentation-only additions are not a reason to discard work or request a fresh SHA from Kraken.
3. Verify current application identity v0.5.1/43 from `app.json`, native metadata and preserved artefacts. Do not repeat the superseded v0.4.1 ambiguity. A later legitimate baseline must be reported and preserved, not overwritten. Resolve the next monotonic `targetVersion` and `targetBuild` once, defaulting to `0.6.0`/`44`, and record them in state. All subsequent source metadata, builds, artefact directories/names and reports use that resolved identity; a necessary later change invalidates affected tests/builds.
4. Locate the actual gateway package root. Do not assume whether it is `gateway/` or a nested historical `acr-mobile-companion/extended/gateway/` tree; record one active root and deactivate duplicate execution paths through deliberate scoped edits later.
5. Recover the Build 43 instructions/report and compare the table in section 4 with installed toolchain, SDK/cache paths, symlinks, native settings and build scripts. Preserve the existing route; do not create new build tooling. If a historical document is absent, use its recovered facts here plus current source/tooling evidence; missing duplicate documentation alone is not a blocker.
6. Verify installed dependencies, Pods, workspace/scheme, Gradle wrapper and current low-memory settings. Record free space on internal storage and AndroidDev when mounted. Do not require all devices/AndroidDev at this early gate or allocate a new simulator. Do not impose an invented fixed free-space threshold; use actual prior outputs, current capacity and tooling requirements.
7. Record full current TypeScript diagnostics and the four existing verifier results. Build 43 had 261 unchanged pre-existing typecheck diagnostics; this is historical evidence, not a green check or a quota. Capture actual current errors and active-source ownership.
8. Preserve a recoverable mobile/gateway baseline. Create uniquely named local implementation branches only where safe; never overwrite an existing branch. For non-Git extended, initialise without commit and preserve the source snapshot described above.
9. Capture a content manifest of canonical source/config/ontology/rule files, including pre-existing changes. Use `GIT_OPTIONAL_LOCKS=0` for Git reads; do not modify index or metadata. Do not inspect patient DB records. Identify the source/assets of the ACTUAL installed reasoner, not just checkout HEAD. An exact-source synthetic-only isolated test copy may support compilation, forced-fallback tests or frontend proposals, but cannot replace existing-route connectivity/parity evidence. Investigate any installed-binary/source mismatch; do not silently rebuild/deploy a different engine.
10. Execute A1 below. Record the frontend, both required local services, backend endpoint and existing transport hops. Configure mobile/gateway to this verified route using controlled build-time settings. Do not add TLS bypasses, hidden endpoint selection, guessed ports/URLs or a new public tunnel.

### A1 — verify the current website/Ontolator route; Kraken controls service startup

1. Read current web request/health code, backend mapping and operations/startup scripts. Identify BOTH required local services: actual names, working directories, commands, dependency order, listeners and readiness checks. Trace tunnel/proxy as transport, not an inference engine. Find what drives OFFLINE/connected status.
2. Inspect existing processes/listeners without changing them. Reuse healthy services; record OFFLINE or unknown status honestly when absent. Do not start/stop the shared services or tunnel without Kraken's direct delegation. No duplicate listener.
3. Identify the actual inference URL, contract, frontend route and source/assets. With healthy services, verify synthetic inference through that exact route. Without them, complete source-backed route verification and mark runtime checks PENDING SERVICES, not PASS; continue B/C/D and local tests rather than returning only an investigation.
4. Record evidence in state/report: service commands without secrets, frontend/API URLs, transport hops, source/runtime identities, readiness and process ownership. Mobile/gateway must target the SAME deployment and applicable route, never an alternate isolated reasoner.
5. At online simulator review, ask Kraken to start the two services using the recovered existing procedure, then independently verify readiness and real synthetic inference. Complete all deferred live checks and fixture capture before permitting physical iPhone work. If earlier live execution is indispensable and no safe local progress remains, checkpoint WAITING_FOR_BACKOFFICE_SERVICES with the exact request.
6. An existing configured tunnel may be reused; ask Kraken if its startup is needed and not delegated. No new tunnel/DNS/VPS/configuration or credentials. Do not stop a healthy shared service to manufacture offline evidence.
7. Continue implementation after source-based route verification. Do not send routine findings back to ChatGPT for another planning round.

A/A1 technical continuation: preserved Build 43, verified source-backed route/service procedure and build boundaries. Runtime proof is either evidenced now or explicitly pending for the H-SIM online checkpoint. A wrong/indeterminate route, inaccessible source, unsafe required mutation or material baseline divergence is a genuine blocker; merely waiting for the planned services/phones/drive is not a reason to invent failure or delay independent code work.

## 9. Phase B — all-five-screen contract

Derive request/response semantics from active mobile state/validation, platform DTOs/`PatientData`, website mapper and gateway schemas. Build one explicit field mapping and fix schema/OpenAPI/type inconsistencies together.

| Screen | All required represented values |
| --- | --- |
| Step 1 | erStatus, prStatus, her2Status, ki67 |
| Step 2 | stage, grade, histologicalSubtype, nodalStatus, age |
| Step 3 | ca153, cea, surgeryDate, bayesianEnhanced |
| P1 | tumorSize, gender |
| P2 | ecogScore, pdl1Status, her2Low, lvef, treatmentIntent |

Every present value must travel through the request builder and gateway mapping. Preserve numeric zero and Boolean false; do not use truthiness to delete them. Define null/omission once and preserve unknown versus not-tested. Distinguish user defaults, generated identifiers and server-derived values. Do not invent patient facts missing from the five screens.

P1/P2 remain explicitly provisional for clinician review. Use best source-backed mappings now, not another clinical-approval prerequisite. Starting boundaries inherited from v1.3 are optional positive finite tumour size with the platform's evidenced unit; canonical gender enum; optional integer ECOG 0–4; canonical PD-L1 including not-tested; HER2-low positive/negative to true/false only if compatible with the nullable platform type; LVEF percentage 0–100; canonical treatment intent. Reconcile these with current enforced mobile and platform semantics; do not silently narrow an existing UI enum/range or guess a unit conversion. Escalate only a material ambiguity that cannot be mapped without clinical invention.

Record for every field: UI name, type/unit, allowed values, range enforcement, mandatory/default state, wire name/type, transformation, backend property, provisional status and evidence. Do not confuse a field existing in a DTO with an active reasoner consumer; Phase F establishes consumption.

Update request/response JSON Schemas, OpenAPI, active types and fixtures together. Repair invalid escapes, broken `$ref`/schema paths and attestation nullability where evidenced. Preserve existing authentication/attestation semantics; no stubbed or fabricated attestation.

Schema must permit both platform reasoning modes and truthful fixture replay, and reject malformed successes. Preserve backend explanation fields without reinterpretation. Map result mode in delivery metadata; preserve original backend mode. For replay, retain captured source-mode/ontology provenance separately from current `NOT_EXECUTED` delivery mode.

PASS: independent mapping review and schema tests cover all 20 fields, null/false/zero/unknown/not-tested boundaries and platform-only absence.

## 10. Phase C — implement the gateway and mock server

Implement small testable modules: app/listener composition, request validator/allowlist, platform mapper, upstream validator, `PlatformAdapter`, `SyntheticFixtureAdapter`, error mapping and metadata-only logging.

### Platform adapter

- Thin `/m/v1/infer` route to the ACTUAL existing platform inference endpoint established in A1 (known anchor `POST /api/infer`; verify URL/proxy path). Use the same running back-office installation and route as the website, not an alternate isolated reasoner.
- No guessed/default production endpoint, clinical classifier, recommendation table, Bayesian calculation or copied Java/browser fallback. Pin the verified existing route through controlled configuration.
- Explicit bounded upstream timeout/cancellation, with the configured value recorded and tested. A timeout returns an error, not a result.
- Validate complete success payload, recognised reasoning mode and required clinical/explanation structure. Reject partial/empty HTTP-200 responses as `INVALID_UPSTREAM_RESPONSE`; distinguish service unavailable and timeout.
- Preserve all substantive platform output; map only contractual transport/envelope fields. Unknown reasoning modes fail closed.
- Request errors, unsupported contract versions and upstream failures have explicit structured codes.

### Synthetic adapter

- Explicit configured synthetic route; never triggered by live-service failure.
- Exact canonical synthetic request match against an immutable fixture pair. Exclude only approved request identifiers, not clinical fields or Bayes setting.
- Use a synthetic response captured from the ACTUAL canonical installation and A1 route. An existing captured pair is usable only with verified synthetic origin, matching contract and recorded backend/assets provenance; revalidate it online before physical work. Otherwise capture after Kraken starts services. Hand-authored/stubbed results are UNIT TEST data only, never the delivered mock or a parity oracle.
- Pending-capture fixtures cannot return successful CDS output. Continue code/local testing and the simulator candidate if capture awaits services; report MOCK FIXTURE PENDING, not a working mock. Capture/revalidate during online review, rerun offline replay, and complete mock review before requesting the iPhone. No fabricated clinical output.
- Edited/unknown request returns `DEMO_FIXTURE_NOT_AVAILABLE`.
- Preserve original captured result and source provenance; wrap replay as `LOCAL_SYNTHETIC_DEMO`/`NOT_EXECUTED`. No clinical computation.

New gateway listeners default to loopback. Private-LAN binding/build-time endpoint configuration for physical tests is permitted within existing native security policy. Its upstream uses the actual website/backend route, including existing configured transport where applicable. No new public listener/tunnel, global TLS disablement or real patient data. Prove runtime gateway logs exclude request/response bodies and identifiers carrying patient facts; use metadata-only correlation.

Do not persist assessments/results. Export app separately from listener, close disposable test listeners after tests while preserving intended review services, and test malformed requests, upstream failures, timeout and fixture mismatch.

Local continuation: reviewer tests adapters/failures and no inference/logged payloads. Missing real capture/live checks stay named PENDING, never PASS; C is fully verified only when actual fixture provenance and both adapters have independent evidence, before H-IOS.

## 11. Phase D — implement mobile transport and result presentation

1. Consolidate the active API path/request builder; resolve competing client versions and missing `apiFetch`/equivalent exports. Preserve required auth/attestation.
2. Include every field from section 9, preserve defaults/nulls and validate without computing clinical conclusions.
3. Update Review to display all five-screen values, units and provisional labels. Wire submission to the real configured gateway, not an inactive client or fixed result.
4. Display complete backend subtype, explanations, fired rules, recommendations/warnings and optional Bayesian output. Guard malformed nested responses.
5. Distinguish live/platform-fallback/synthetic/unavailable presentation. Provide an explicit visible Synthetic Demonstration entry for Kraken's requested mock review, with fixed controlled routing and no inference; never select it automatically after a live error. Keep ordinary assessment on the live route. No hidden or tester-editable endpoint. The same installed Build 44 must permit both reviews without a second application identity.
6. Preserve eight languages, immediate Arabic RTL/LTR and the established Poster/Welcome/About/navigation behaviour; translate new UI labels consistently.
7. Use the existing installed mobile dependencies and native projects. Fix active imports/components within this scope rather than downloading replacement libraries. If a genuinely new dependency is indispensable, stop with the exact need.
8. Replace the OLD P1/P2 test assertions requiring request EXCLUSION with positive all-field inclusion/transport tests. Do not keep a obsolete test merely because it passed Build 43.
9. Use `app.json` as canonical identity and the existing identity helper. Synchronise native iOS/Android maintained version fields explicitly without Expo Prebuild. Use the resolved `targetVersion`/`targetBuild` from Phase A (default v0.6.0/44); do not reuse 43 for changed code.

PASS: reviewer exercises active request construction, mocks transport only where labelled, checks rendered fields/modes, all locale regressions and the actual active import graph.

## 12. Phase E — website/mobile parity without backend modification

Prepare/reuse a session-local, hash-verified source copy only for proposed frontend changes and controlled test injection, with separate synthetic outputs/configuration. Phase C route capture uses the existing installation, not this copy. Reverify its clinical source/assets before narrow frontend/test write grants. Do not register canonical worktrees, copy patient DB/secrets or modify `/opt/acr`.

In that isolated copy ONLY:

- Build the canonical web request from the actual PHP/JavaScript mapping, with synthetic inputs rather than exported patient records.
- Map shared facts identically. Include available fields already supplied by website data/accepted backend contract; do not invent unavailable data.
- Contain the legacy browser `runEmbeddedInference`/`generateRecommendation` failure path so an ordinary API/JSON/HTTP failure cannot create divergent clinical results. Show unavailable or enter only an explicitly selected synthetic replay.
- Do not retain an independent browser classifier as if it were canonical clinical fallback. Any retained legacy demonstration path must be unreachable from ordinary CDS failure and excluded from parity claims.
- Update maintained frontend copies only when their actual build/package use is proved. Keep all clinical production modules byte-identical.

Return the isolated frontend/test diff for Kraken; do not merge, deploy or change the user's working platform. If modifications require frozen backend logic, block rather than compensate in gateway/mobile.

Separate actual installed-website behaviour from the proposed isolated frontend correction. An isolated fix is NOT evidence that the unchanged website has been repaired. Record both observations distinctly; do not provoke an outage on shared services to test failures. If the actual website's embedded fallback creates a substantive client-parity discrepancy that prevents required acceptance, preserve completed interface code and return `BLOCKED_EXISTING_PLATFORM_PARITY_FAILURE` for Kraken's direct decision. Do not claim actual-site parity from the proposed copy or deploy the proposal without authority.

PASS: reviewer verifies frozen canonical platform source/assets unchanged, allowlisted diff only, equivalent web request and safe failure behaviour in the isolated proposal. Actual installed-site observations and any discrepancy are reported separately; an isolated PASS does not prove a live-site repair.

## 13. Phase F — backend functional-flow reaffirmation

Reaffirm from canonical source AND the actual service/route identified in A1. This phase remains between E and final tests G. Normal synthetic integration uses the established installation and allowlisted runtime paths; injected/failure tests that could disturb it use an isolated copy. Canonical clinical source/assets remain unchanged throughout.

Trace actual responsibilities and ordering of controller/DTO mapping, `PatientData`, ontology population/readiness, `OntologyLoader`, `ReasonerService`, Openllet/SWRL classification or Java fallback, `ACRSWRLEngine`, clinical aggregation/`ClinicalOutputAssembler`, optional `BayesianEnhancer`, result assembly, fired-rule explanation and provenance. Names are source anchors; record actual successors if renamed.

Answer:

1. Which stage determines subtype and from which inputs?
2. What actually triggers normal versus Java fallback, including readiness and elapsed-time behaviour? Distinguish timeout detection from cancellation.
3. Which downstream custom-rule, aggregation and Bayes stages run after fallback?
4. Which rules are executed by which engine, with actual IDs/count evidence?
5. Where are explanations, warnings, risks, recommendations and supporting rules assembled?
6. What Bayes consumes/adds and how its failure is represented; do not call the metric calibrated diagnostic certainty without evidence.
7. Whether any exception emits a partial HTTP-200 response; test gateway rejection. This condition alone need not block if valid normal paths work and rejection is correct.
8. Whether normal/fallback results are consistent for the chosen same-fact fixtures; report a discrepancy rather than repairing the engine.

Map every mobile field plus generated identifiers and platform-only/derived fields to:

| Column | Required evidence |
| --- | --- |
| Incoming property | Actual DTO/PatientData property/type |
| Conversion/default | Source-backed unit/enum/null/derived handling |
| Ontology population | Actual property/individual/fact or none |
| Normal/fallback consumer | Exact Openllet/SWRL and Java use |
| Custom-rule consumer | Rule IDs and active use |
| Aggregation/Bayes consumer | Actual output influence |
| Evidence | Source path/symbol/line and relevant test |

Use `NO ACTIVE CONSUMER FOUND` where appropriate, not a claim that all fields influence inference. Mark unresolved clinical sufficiency `CLINICAL DECISION REQUIRED — ZZU/UCD`; provisional technical transport still proceeds where unambiguous.

Create `DOCS/ACR_MOBILE_BACKEND_REASONER_FLOW_REAFFIRMATION_v0.1.md`. Include both local services, startup/health/OFFLINE-to-connected behaviour, actual web/mobile route, before/after frozen source hashes and separately accounted ordinary runtime outputs—not only Git status. Reviewer independently validates the execution sequence and a complete 20-field consumer matrix.

PASS for source reaffirmation: evidence supports G tests and later clinician document; frozen canonical source/assets unchanged. Runtime observations may remain explicitly pending services until H-SIM online review and must then update this record. Expected services-off status is not an engine failure. A proved backend defect or required clinical-engine change is a blocker, never a reason for a different mobile engine.

## 14. Phase G — real-backend parity, safety and regression

Use the ACTUAL installed two-service/web route established in A1 for successful synthetic integration/client-parity tests. An isolated server or mock cannot prove that connection. Use exact-source isolated execution only for failure/fallback injection that would disturb shared services. Keep frozen sources/assets unchanged, allowing only identified ordinary runtime outputs; no real-patient DB access. Schedule heavy builds without shutting down pre-existing shared services. If Kraken has not yet started services, complete local/schema/negative tests and record each unperformed live/fixture/engine comparison as PENDING SERVICES. H-SIM candidate build may proceed, but these checks must complete at its online review before H-IOS. Actual unsafe execution or proved defects still block; preserve code.

The independent reviewer reruns the decisive comparisons. The same source snapshot must be used by producer and reviewer; saved reports alone do not prove parity.

### Required test matrix

| Test family | Required checks |
| --- | --- |
| Field transport | All 20 present values arrive; null/unknown/not-tested/false/zero handled; invalid values rejected; no invented platform facts |
| Canonical requests | Web mapper and mobile/gateway produce identical full canonical facts for comparable synthetic cases; document unavailable facts separately |
| Same-route parity | Working website/direct endpoint vs gateway/mobile using the SAME installed backend/route; same facts/Bayes/assets/evaluation context. Include actual installed-route tests, not just isolated harnesses |
| Cross-engine consistency | Compare Openllet vs existing platform Java fallback for the same fixtures; report differences separately; do not hide or repair them |
| Bayes | Enabled/disabled cases, exact returned values/explanations, failure behaviour |
| Fixture replay | Real platform capture vs exact replay; truthful captured and current provenance; edited/unknown input refused |
| Web/mobile failure | Gateway/mobile failures yield errors, never mock inference. Report installed website behaviour separately from isolated frontend fixes; no claim the live site is fixed until its actual behaviour is evidenced. Follow Phase E's discrepancy blocker when required |
| Privacy | Sentinel synthetic fields absent from runtime logs/storage; approved fixture files are the explicit exception |
| UI/regression | Poster, Welcome timer/modal behaviour, About/version, all five screens, Review/Result, eight languages, Arabic RTL/LTR |

A comparable parity case must actually use the same complete canonical facts. A missing web fact is not permission to drop the corresponding mobile fact from the comparator. Test missing-data behaviour separately. Control date-derived evaluation context through existing test facilities, or prove both executions used the same context; never modify production reasoning or discard substantive differences.

Compare subtype, rule IDs/descriptions, inferences, warning/recommendation content/supporting rules, Bayes values and ontology/rule identity. Explicitly enumerate transport-only exclusions. Preserve meaningful ordering where the contract specifies it; do not sort away priority differences. Test expected result/reasoning/source mode independently. Cross-engine inconsistency remains a release blocker as in v1.3, while its diagnosis stays separate from client-parity failure.

Force fallback only through existing triggers or isolated test-only facilities. Never add a production switch or replace the clinical oracle with expected values generated by the gateway under test.

Run gateway contract/schema/boundary/integration suites and the active mobile TypeScript graph. Record full-repository typecheck too. Every active/changed-source diagnostic must be resolved; no new diagnostics are permitted. Proven unrelated inactive legacy diagnostics may remain only as explicitly itemised baseline carry-forward, with reviewer evidence of inactivity. Never label a failing full-repository command PASS, suppress active errors, weaken strictness or exclude active imports to reach green. If a clean active graph cannot be demonstrated, block.

Rerun `tests/poster/verify.js`, `tests/version/verify.js`, `tests/rtl/verify.js` and the revised `tests/p1p2/verify.js`, plus existing relevant platform tests in isolation. Lint is run only if installed/configured; otherwise report NOT AVAILABLE without installing tooling.

G_LOCAL_VERIFIED permits an H-SIM candidate when source/local/safety checks pass and the only remaining checks genuinely await services/fixture capture. List each pending check. G_COMPLETE requires independent real-route parity, fixture and applicable engine/Bayes evidence; it is mandatory before H-IOS. No failed check may be relabelled pending. Freeze candidate source for H-SIM and re-freeze the final common snapshot after any service-dependent work/repair; rerun affected checks and simulator review.

## 15. Phase H — serial build and physical-device programme

Required order is H-SIM → KRAKEN SIMULATOR REVIEW → REQUEST IPHONE → H-IOS → KRAKEN UNPLUG/RELAUNCH → REQUEST ANDROIDDEV/S8 → H-ANDROID. Each arrow requires its stated evidence and human response. Do not run native builds concurrently. No Android emulator. Each substage has a build child return and distinct reviewer; no agent may bypass a human gate.

Before H-SIM, freeze one candidate source/configuration manifest covering all maintained version surfaces and the gateway/platform test revision. Keep live and explicit synthetic routing semantics consistent across iOS and Android; H-SIM may have named pending live evidence under G, but H-IOS may not. No source edits during a build. If code changes after a build, invalidate affected tests/artefacts and rebuild the affected platforms from the new common snapshot; do not distribute a mixed-source pair.

Set/verify the `targetVersion`/`targetBuild` resolved in Phase A (default `0.6.0`/`44`) across `app.json`, identity helper, iOS Info.plist and Xcode MARKETING_VERSION/CURRENT_PROJECT_VERSION, Android versionName/versionCode and active displayed/request build IDs. Preserve unrelated package version conventions; do not change poster artwork just because it contains a platform version.

Before each physical functional test, prove the phone's gateway reaches the SAME existing back-office/Ontolator deployment used by the website, with both local services healthy. Stop only disposable task-owned isolated test runtimes before heavy builds; do not stop shared website services/transports to reclaim memory. Reuse healthy services with recorded configuration and without source drift; ask Kraken for a required shared-service restart. Standalone means no Metro dependency; backend connectivity is still necessary for CDS. Never substitute a mock because the required backend is unreachable.

### H-SIM — existing iOS simulator

1. Build executor verifies current installed iPhone 16e simulator/runtime/destination from local tools; reuse it, do not download/create another. The recorded runtime was iOS 26.3.1; an existing supported runtime discrepancy is documented, not solved by upgrading.
2. Use existing workspace/scheme/Pods and a fresh task-specific DerivedData directory. Example command shape, with parent-verified variables assigned from actual local evidence:

```zsh
xcodebuild -quiet \
  -workspace /Users/Kraken/DAPP/acr-mobile-companion/ios/ACRCompanion.xcworkspace \
  -scheme ACRCompanion -configuration Debug -sdk iphonesimulator \
  -destination "id=${ACR_SIMULATOR_ID}" \
  -derivedDataPath "$ACR_SIM_DERIVED_DATA" build
```

3. Install over the existing simulator application without erase/uninstall. Start Metro only via the installed project-local Expo/dev-client command recovered from the runbook. Do not let npx download anything. Confirm Metro is ready before cold launching; a first launch before bundling is ready is not a source defect.
4. Exercise available simulator automation for Poster/Welcome, languages/RTL, all five screens, Review submission, result/error modes and About/version. Capture app metadata/screenshots and precise limits of what was exercised. Use existing test tooling; no new UI automation dependency installation.
5. Reviewer checks build exit, identity, source/configuration snapshot, functional tests/screenshots and named pending checks. Preserve the simulator product. Leave simulator, Metro and gateway running for Kraken.
6. Checkpoint WAITING_FOR_SIMULATOR_REVIEW and ask Kraken to inspect Build 44's new mock/API module. Do NOT request/connect/build/install the physical iPhone yet, even if already attached.
7. Review mock and unavailable behaviour first. If the back-office services are already off, ordinary live assessment must display unavailable/error without a CDS result. If they are already healthy, use controlled task-owned upstream failure simulation for the error check and label it SIMULATED UNAVAILABILITY, not an observed actual outage; never stop or request shutdown of shared services merely for a test. Explicit Synthetic Demonstration replays only a verified exact captured fixture, with LOCAL_SYNTHETIC_DEMO / NOT_EXECUTED; edited input returns DEMO_FIXTURE_NOT_AVAILABLE. The Mac mock/gateway must still be reachable: “offline” here means back-office offline, not an offline phone magically running inference. If the gateway itself is unreachable, show an error. If no verified fixture exists, disclose pending capture, inspect unavailable behaviour first, and complete demo review after capture in step 8. Remove task-only failure injection and independently verify the real configured upstream before online review; do not ship injected failure controls or change platform source.
8. If the two identified back-office services are not already healthy, ask Kraken to start them for ONLINE review and checkpoint WAITING_FOR_BACKOFFICE_SERVICES. Otherwise reuse them without another startup request. Verify both, website connected state and same-route inference; finish all C/F/G pending live evidence, capture/revalidate fixtures and rerun reviewer checks. Then repeat explicit mock review if deferred. Do not shut shared services down for the repeat; use the explicit replay route and controlled task-owned failure simulation. Mark actual services-off observations separately from simulated transport failures.
9. Kraken inspects online five-screen submission and the returned explained platform result, plus explicit mock/unavailable behaviour. Record the observed route/modes and Kraken's response. If repairs are requested, apply bounded repairs, reverify and rebuild/reinstall the simulator where affected; present the corrected snapshot for renewed review. No screenshots or reviewer verdict substitutes for Kraken's explicit permission to proceed.
10. Only after G_COMPLETE, complete mock/API evidence and Kraken's explicit simulator approval: preserve the final simulator app, stop project Metro, verify port 8081 without killing unrelated listeners, and shut down the simulator without deletion. Ask Kraken to connect the unlocked iPhone 13/iOS 26.6.1; checkpoint WAITING_FOR_IPHONE_CONNECTION.

H-SIM complete: simulator build/install/launch, reviewer checks, required offline/mock and online review, C/F/G completion and Kraken's recorded permission for physical iOS. Device absence before this point is expected. Missing essential simulator tooling remains a real blocker.

### H-IOS — iPhone 13 / iOS 26.6.1 standalone Release

1. Prerequisites: H-SIM approval for the current snapshot and G_COMPLETE. After requesting the device, wait for Kraken to connect the unlocked iPhone 13/iOS 26.6.1. Verify actual OS, pairing/trust, Developer Mode and Xcode destination. Use current identifiers and existing preparation; ask only for real trust/signing prompts. Do not treat an early attached phone as permission to skip simulator review.
2. Audit existing signing style, team/identity category, bundle identifier and entitlements WITHOUT exposing private values. Use the same existing Apple account and automatic-signing design.
3. An expired installed/previous profile triggers the established renewal build, NOT an immediate `IOS_DEVICE_SIGNING_BLOCKED` result. The original standalone instruction permits automatic profile/certificate renewal/replacement and normal development-device registration. Allow Xcode to perform that process. Do not manually delete certificates/profiles or export keys.
4. Stop project Metro and prove TCP 8081 clear before physical Release build. Build the existing workspace, with separate task-specific DerivedData:

```zsh
xcodebuild -quiet \
  -workspace /Users/Kraken/DAPP/acr-mobile-companion/ios/ACRCompanion.xcworkspace \
  -scheme ACRCompanion -configuration Release -sdk iphoneos \
  -destination "id=${ACR_XCODE_IPHONE_ID}" \
  -derivedDataPath "$ACR_IPHONE_DERIVED_DATA" \
  -allowProvisioningUpdates build
```

5. Use existing local Xcode account facilities for any normal renewal. If registration is genuinely required, use Xcode's supported registration flow for this authorised device only. If a sign-in, Keychain, trust or 2FA confirmation appears, pause with one exact action; never ask for the secret in conversation. Do not change teams, entitlement/bundle IDs or tracked signing settings. If automatic signing requires a prohibited design/configuration change, checkpoint `BLOCKED_SIGNING_CONFIGURATION_CHANGE`.
6. Audit the NEW built `.app`: name/identifier, version/build, embedded JS/assets/Hermes, signing verification and embedded profile category/current expiration. The old Build 43 expiry is not the new app's validity evidence. Record automatic renewal outcome and normal signing metadata changes separately from prohibited source/config changes.
7. Install over the existing iPhone app using installed supported Xcode/device tooling and the verified device identifier. No uninstall, data erase, forced downgrade or profile workaround.
8. Verify installed metadata and cold launch with Metro absent. No Expo Go, dev launcher or development-server dependency. Check app-specific runtime errors and the available functional path to the test gateway/existing backend.
9. Reviewer checks artefacts, newly built signing/profile evidence, source snapshot and actual launch result. Preserve signed `.app` and required evidence. Do not claim a distributable Ad Hoc/TestFlight IPA was produced.
10. After reviewer-verified install/standalone launch, ask Kraken to unplug the iPhone 13 and force-close/relaunch Build 44 without USB or Metro. Checkpoint WAITING_FOR_IPHONE_DISCONNECTION; no Android request/build yet. Record Kraken's confirmation as human-observed, not tool-observed. A wireless Xcode listing does not disprove USB removal; do not ask for reconnection solely to prove unplugging. Retain Wi-Fi/backend connectivity when testing live CDS.
11. On explicit unplug/relaunch confirmation, record iOS stage complete (not final product acceptance). Only NOW ask Kraken to connect the external USB3 drive at /Volumes/AndroidDev and the unlocked, already set-up USB-debugging-authorised Samsung S8. Checkpoint WAITING_FOR_ANDROID_CONNECTION. Already attached equipment must still be verified and the prior human gate satisfied.

PASS: Release build, valid resulting signing, install-over-existing, installed identity and Metro-free cold launch evidenced, followed by Kraken's unplug/standalone-relaunch confirmation. Automatic renewal failure requiring human authentication is a resumable blocker; stale historical expiry alone is not.

### H-ANDROID — AndroidDev, release APK, Samsung S8

1. Begin only after simulator approval, iOS technical completion, Kraken's unplug/relaunch confirmation and the subsequent Android connection request/response. Both AndroidDev and the unlocked S8 are prerequisites even for starting the Android build. Before any Android build/audit/ADB work, verify `/Volumes/AndroidDev` is an actual mounted expected external volume, not a directory created on internal storage. Check volume identity, filesystem/mount, available capacity and writable SDK/cache directories. Never create the mountpoint to conceal an absent drive. Recheck mount before build, audit, installation and final launch verification.
2. Confirm existing environment resolves exactly as below. Process-local assignments may restore this established environment; do not rewrite shell profiles/PATH or move SDK/cache contents:

```zsh
export ANDROID_HOME=/Volumes/AndroidDev/android-sdk
export ANDROID_SDK_ROOT=/Volumes/AndroidDev/android-sdk
export GRADLE_USER_HOME=/Volumes/AndroidDev/.gradle
```

3. Verify existing wrapper/JDK/SDK/build-tools/NDK/CMake selections against section 4. Preserve project-configured Java and the 2 GiB heap. Do not install missing tools, increase worker count/heap, enable parallel builds or alter ABIs to make the build easier. At the planned connection gate an absent drive/locked or unauthorised phone is WAITING_FOR_ANDROID_CONNECTION; ask once and yield. An unexpected mount/toolchain defect after connection is BLOCKED_ANDROID_ENVIRONMENT with precise evidence.
4. With the drive mounted, use its explicit ADB to identify the authorised Samsung SM-G950F/S8, unlocked and USB-debugging-authorised. Do not select another attached Android device implicitly. Target the verified serial explicitly; if ambiguity remains, ask Kraken. No Android emulator.
5. Confirm the iOS simulator is shut down and task Metro is stopped; no Xcode/Maven/other Gradle build is active. Acquire the parent build lease.
6. Run the established command from the existing `android/` directory:

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion/android
caffeinate -d -i ./gradlew app:assembleRelease \
  --no-daemon \
  --max-workers=1 \
  --no-parallel \
  --no-configure-on-demand
```

The ordinary Gradle `preBuild` lifecycle task is allowed; Expo Prebuild is forbidden. Release bundling inside Gradle is allowed; a listening Metro development server is not.

7. Capture full build result and audit the internal-source APK at:

```text
/Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/app-release.apk
```

8. Using existing tools on AndroidDev, verify `com.anonymous.acr_mobile_companion`, target version/build, min/target SDK posture, v1/v2 signatures with the unchanged existing signing design, embedded `assets/index.android.bundle`/Hermes/native libraries and required assets. Record actual byte size and SHA-256. Preserve the existing controlled-test signing posture; do not introduce Google-service requirements.
9. Install the exact audited APK over the existing S8 package:

```zsh
/Volumes/AndroidDev/android-sdk/platform-tools/adb \
  -s "$ACR_S8_SERIAL" install -r \
  /Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/app-release.apk
```

10. Require installation success, inspect installed version/build, resolve the actual launcher and cold launch with Metro stopped. Capture app-specific errors and available functional checks for the synthetic interface. Preserve app data. If a signature/version mismatch prevents replacement, stop; do not uninstall or force downgrade.
11. Independently verify the same source APK hash before/after installation. Copy to the resolved final artefact directory as `ACR-Mobile-Companion-v0.6.0-build44-android.apk` (adjust only if the verified release identity changed). Verify copy hash and record both paths.
12. Reviewer checks build/SDK/mount/device evidence, actual package/signature and installed launch results. Close only transient task test processes and task-owned ADB where safe; check no task Gradle daemon remains. Leave the two required services and configured gateway available for Kraken's local functional review, recording PIDs/status/start/stop instructions. Do not eject AndroidDev or stop unrelated ADB users.

PASS: external-drive/toolchain requirements, release APK audit, exact-APK S8 replacement and Metro-free launch all evidenced. AndroidDev remains available through installation/verification. Xiaomi was historical additional coverage; it is not a required device or new action in this Loop.

### Common device smoke and human review record

For each platform distinguish automated PASS/FAIL, NOT EVIDENCED and PENDING KRAKEN. Cover:

- Poster-first cold launch; swipe to Welcome; three-second return and repeated cycles.
- Language-modal behaviour, French/Chinese poster selection, other-locale fallback, immediate Arabic RTL→LTR.
- Both About pages and exact version/build.
- All five assessment pages; default/edit/blank/range behaviour; P1/P2 provisional marking.
- Complete Review representation, actual request-builder/gateway/backend test path and complete Result/explanation/mode/error rendering.
- No crash/freeze, local inference, silent mock fallback or Google-service dependency.
- Physical standalone launch with Metro stopped, force-close/relaunch and USB-disconnected relaunch where actually exercised.

Installed native UI automation may perform supported checks. Do not claim screenshot capture proves a gesture or that a transport-unit test proves a physical tap. If interactive UI automation is unavailable, retain an explicit manual checklist for Kraken alongside the automated transport/backend and build/install evidence. Full technical readiness never means human or clinical acceptance.

## 16. Phase I — post-build clinician companion

Begin only after the functional interface, G_COMPLETE and all H technical AND mandatory human handover gates pass. Do not generate a planning-based clinician report before the implementation works. If a mandatory build is blocked, return that blocker and do not label a draft as a completed-build companion.

Create `DOCS/ACR_MOBILE_FUNCTIONAL_FLOW_FOR_CLINICAL_REVIEW_v0.1.md` from the final source snapshot, Phase F consumer matrix, real platform/transport tests and observed build evidence. Writer is a separate child; reviewer independently traces its claims. This document goes to Kraken only.

Use everyday UK English; clinical terminology is fine. No commands, SHAs, ports or engineering investigation narrative. Include:

1. Actual version/build, test-only/synthetic-data scope and precise status of any pending manual checks.
2. Plain functional flow: five-screen facts → gateway checks/translates → platform ontology/rule processing → platform-owned fallback where selected → custom rules/aggregation → optional Bayes → unchanged explained result on mobile.
3. All 20 fields plus any additional generated/derived/platform-only fields: clinical meaning, type/unit, exact allowed values/enforced range, mandatory/optional/conditional status, exact initial/default value, editability and missing/unknown/not-tested behaviour.
4. Separate screen-required, contract-required, platform-required/defaulted and clinician-required data. The last category remains for clinical partners where not evidenced.
5. Whether each field is transported, received and actively used by which backend stage; do not imply every collected field changes a result.
6. Normal reasoner, platform Java fallback, explicit synthetic replay and service-unavailable behaviours. Explain source of fired rules/recommendations and truthful provenance.
7. Bayes output as the implemented advisory metric; do not claim validated diagnostic probability or measurable clinical certainty without calibration evidence. Later data-quality/sufficiency optimisation remains future refactoring, not invented implementation here.
8. Same-patient website/mobile parity and limits of the tested evidence.
9. Clinician checklist: meaning/units/ranges/defaults, missing data, sufficiency, explanations/recommendations, Bayes presentation, mode labels and same-case parity; columns ACCEPT / CHANGE REQUIRED / NOT ASSESSABLE / COMMENTS.

PASS: reviewer confirms document matches the working code/test evidence and distinguishes pending manual/clinical decisions. Documentation itself grants no acceptance.

## 17. Phase J — preserve, clean and verify

Only after final simulator/signed-device/Android artefacts, hashes, source identity and necessary logs are preserved:

1. Record current internal/external free capacity and sizes of task/project-specific intermediates. Do not scan unrelated personal directories.
2. Resolve each proposed cleanup path, real path, ownership and size. Reject broad roots, unresolved variables/globs, symlinks outside the authorised scope and uncertain ownership.
3. Remove only reproducible outputs created by this Loop: task-specific DerivedData intermediates, project Android build intermediates after APK preservation, task-local test coverage/temp/logs after evidence retention, and task-created Metro caches. Preserve all other material.
4. Never delete source, `.git`, schemas, fixtures, tests, docs, state/journal, final/prior accepted artefacts, dependencies, Pods, `/Volumes/AndroidDev/.gradle`, SDK/ADB/NDK/CMake, global caches, simulators, archives, certificates/profiles/keys or unrelated data.
5. Do not clean before a required dependent build/test has finished. No cache relocation, mass cache purge or external-drive eject.
6. Release only the task-owned keep-awake assertion at final handoff, preserving the user's no-sleep setting/assertion and noting normal sleep policy applies thereafter. Independently rehash Build 43 preservation and Build 44 artefacts/source manifests. Confirm frozen canonical source/assets unchanged. Stop transient test listeners and build processes, but retain the required healthy local services and gateway for Kraken's functional review; explicitly record these intended running processes and safe stop/restart instructions. Never kill shared services to make a cleanup test pass. Record deletions, recovery method, reclaimed bytes and final capacity.

If storage becomes insufficient earlier, preserve work and return a precise storage blocker; do not invoke broad cleanup outside this authority. Ambiguous cleanup candidates remain untouched and are listed briefly for later review.

## 18. Final evidence and completion gate

Parent writes one consolidated `DOCS/ACR_MOBILE_CDS_PARITY_EXECUTION_EVIDENCE_v1.6.md`. Include:

- Baseline/current source snapshot identities, branch/HEAD/diff posture and exact changed-file inventory by repository/copy.
- Actual child/reviewer IDs, gates, repair rounds, accumulated evidence-led corrections and independent verification results.
- Human handover responses/timestamps/snapshot identities: simulator approval, iPhone connection, unplug/relaunch confirmation and AndroidDev/S8 connection. Include no-sleep assertion ownership/release and archive handling.
- 20-field contract/consumer coverage and real-backend parity results, separating client parity from engine consistency.
- Commands, exit codes, counts and explicit skips/carry-forwards; active vs full-repository typecheck truth.
- Actual two-service names/startup/readiness, website OFFLINE/connected state, exact same-route synthetic integration, retained review services and safe stop/restart instructions.
- Protected Build 43 source and existing artefact paths/hashes, and separate Build 44 outputs.
- Simulator build/launch, iPhone Release/automatic provisioning/new profile validity/install/launch, and AndroidDev/Gradle/APK/S8 evidence.
- Version identity, artifact paths/sizes/hashes, signing categories and test-only distribution limits; redact private identifiers.
- Backend reaffirmation and clinician companion paths, completeness verdicts and manual tests pending Kraken.
- Canonical platform integrity, privacy/log checks, housekeeping/recovery evidence and remaining blockers.
- Proposed commit title/body per affected repository; no commit/push performed. The isolated platform diff is a proposal only.

Required final checks:

| ID | Required evidence |
| --- | --- |
| AC-01 | Actual distinct child dispatch and reviewer returns, bounded repair and durable resume state |
| AC-02 | Build 43 setup recovered; existing native projects/dependencies/identity preserved |
| AC-03 | All 20 inputs transported, correct null/zero/false semantics; P1/P2 provisional |
| AC-04 | Gateway/mobile contain no inference/copied fallback; actual platform adapter works |
| AC-05 | Real same-route web/mobile parity and separate engine-consistency/Bayes comparisons |
| AC-06 | Exact captured synthetic replay with truthful provenance; edits/errors never fabricate CDS |
| AC-07 | Invalid/malformed/partial/unknown-mode/timeout responses fail closed; metadata-only runtime logs |
| AC-08 | Required active TypeScript/tests pass; full baseline failures truthfully itemised, no hidden exclusion |
| AC-09 | Eight-language/RTL/Poster/About/five-screen regressions preserved |
| AC-10 | Frozen canonical source/assets unchanged; normal runtime writes allowlisted; only authorised isolated frontend/test proposals |
| AC-11 | iPhone 16e build/launch, Kraken offline/mock and online review, G_COMPLETE and explicit simulator approval BEFORE physical iOS |
| AC-12 | iPhone requested only after simulator approval; Release uses permitted renewal, valid signing, replacement install/Metro-free launch; Kraken confirms unplug/relaunch BEFORE Android request |
| AC-13 | AndroidDev and unlocked S8 requested after iOS completion and both verified BEFORE build; drive remains through install/launch; exact SDK/cache/ADB/low-memory route; NO emulator |
| AC-14 | Exact audited APK installed on S8; package, signature, hash and standalone launch evidenced |
| AC-15 | Common reviewed source identity and consistent maintained/built/installed application version |
| AC-16 | Final artefacts preserved, cleanup bounded, source/artefact integrity rechecked |
| AC-17 | Post-build clinician companion grounded in final implementation; manual/clinical acceptance not fabricated |
| AC-18 | No commit/push/new deployment/public distribution/unauthorised signing or dependency change |
| AC-19 | Both existing local services and working website/Ontolator route evidenced; mobile/gateway uses SAME running deployment/route; no VPS work |
| AC-20 | Build 43 source/existing artefacts preserved and hashed before Build 44 output replacement; preserved package intact afterward |

All mandatory automated/build/install checks must pass before the successful terminal state. Only remaining FINAL/manual clinical review is listed pending, never claimed accepted. Mandatory simulator approval and iPhone unplug/relaunch confirmation cannot be carried forward as pending in a successful completion. A failed or unperformed required build/install is a blocker, not a manual-review carry-forward.

At a planned handover, return its WAITING state from section 7 and the exact human action; this is resumable, not final completion or failure. Otherwise return exactly one final/blocker state:

```text
IMPLEMENTATION_BUILDS_AND_CLINICIAN_PACKAGE_READY_FOR_KRAKEN_REVIEW
BLOCKED_EXISTING_WEB_ROUTE
BLOCKED_REQUIRED_LOCAL_SERVICE
BLOCKED_AGENT_ORCHESTRATION
BLOCKED_BASELINE_DIVERGENCE
BLOCKED_REQUIRED_DEPENDENCY
BLOCKED_BACKEND_FLOW_DIVERGENCE
BLOCKED_EXISTING_PLATFORM_REASONER_FAILURE
BLOCKED_EXISTING_PLATFORM_PARITY_FAILURE
BLOCKED_FROZEN_PLATFORM_CHANGE_REQUIRED
BLOCKED_CLINICAL_MAPPING_DECISION
BLOCKED_TEST_ENVIRONMENT
BLOCKED_REPAIR_BUDGET
BLOCKED_IOS_SIMULATOR_BUILD
BLOCKED_IOS_DEVICE_OR_AUTH_ACTION
BLOCKED_SIGNING_CONFIGURATION_CHANGE
BLOCKED_IOS_RELEASE_OR_INSTALL
BLOCKED_ANDROID_ENVIRONMENT
BLOCKED_ANDROID_RELEASE_OR_INSTALL
BLOCKED_STORAGE
BLOCKED_CLINICIAN_COMPANION_INCOMPLETE
HALTED_SCOPE_OR_DATA_SAFETY_VIOLATION
```

Use a concise final response to Kraken: terminal state, completed functions, test/build verdicts, the two principal documents, artefact paths/hash, pending final review, housekeeping and proposed commits. Explicitly invite final review and inspection of Build 44 on BOTH the physical iPhone 13 and Samsung S8; distinguish the earlier simulator approval from final acceptance. Detailed evidence belongs in the file, not another lengthy chat. Stop for Kraken; do not release.

## 19. Opening and resumption instructions

Use this opening statement in the local Codex session; no separate pre-build document is required:

```text
Read completely and execute:
 /Users/Kraken/DAPP/acr-mobile-companion-extended/docs/ACR_MOBILE_CDS_PARITY_WHAT_WHY_HOW_v1.6.md
 /Users/Kraken/DAPP/acr-mobile-companion-extended/docs/ACR_MOBILE_CDS_PARITY_AUTONOMOUS_CODEX_LOOP_v1.6.md

docs/archive/ contains superseded reference documents; do not execute them.
Use actual implementation agents and a separate independent reviewer.
Keep the Mac awake, preserve Build 43, verify the existing web/API route,
and implement the mock server and same-backend API interface for Build 44.

Build the iPhone 16e simulator FIRST, then STOP for my offline/mock and
online inspection. I start the two back-office services. Complete required
live checks and obtain my simulator approval before requesting my unlocked
iPhone 13/iOS 26.6.1. Build/install/check it, then ask me to unplug and
confirm standalone relaunch. Only then request AndroidDev and my unlocked
Samsung S8; verify both before Android build/install. NO Android emulator.

Report final evidence and invite my review of BOTH physical Build 44 apps.
No commit, push, new deployment, distribution or invented acceptance.
Follow all human pauses; do not stop at another planning-only report.

EXECUTE LOOP v1.6 GO
```

Resume after an interruption with `RESUME LOOP v1.6` and your answer to the recorded human request. Codex must read saved state/journal, verify source/artefacts/processes and resume the first eligible incomplete gate. A bare resume does not supply missing approval or device confirmation. Do not restart, discard work, reset repair counters or duplicate a live build.

## 20. Evidence and revision record

This revision retains the original standalone instruction's automatic-provisioning renewal and the actual Build 43 sync procedure. Local Codex verifies their current application; no Mac execution or application build is claimed by this document-preparation session.

Native agent tools must be actually available in the local Codex session. Do not replace missing tools with role-playing, install a custom daemon or invent an API. The independent reviewer checks fixed source/artefact evidence and returns corrections to the parent; human checkpoints remain Kraken's authority.

Retained boundaries include all 20 fields, no mobile/gateway clinical inference, truthful provenance, protected canonical clinical source/assets, exact external Android SDK/cache/ADB and internal APK output, existing native projects and signing renewal, no Android emulator/Expo Prebuild, serial builds, recoverable Build 43, no commits/deployment/publication and post-build clinician documentation.

v1.6 implements Kraken's ordered steps 2.1–2.9: archive-aware current inputs; keep-awake ownership; source/local progress while services await Kraken; simulator offline/mock and online inspection as a mandatory stop; explicit simulator approval before iPhone request; unplug/relaunch confirmation before AndroidDev/S8 request; both Android prerequisites before build; final invitation to inspect both phones; and a separate reviewer carrying verified lessons between stages. All validation here is document-only. Runtime/source/build evidence must come from local Codex.

## 21. Execution closure — 2 September 2026

This Loop is conclusively closed with terminal state:

```text
IMPLEMENTATION_BUILDS_AND_CLINICIAN_PACKAGE_READY_FOR_KRAKEN_REVIEW
```

Build 44 v0.6.0 was built and inspected on the iPhone 16e simulator, physical iPhone 13/iOS 26.6.1, Samsung S8/SM-G950F and Xiaomi MIX Fold 2. Kraken reported the prescribed offline/online and physical visual checks PASS, including the iPhone USB/Metro-free standalone relaunch. This records technical evaluation only and does not invent clinical, release or distribution acceptance.

Phase G remains `G_COMPLETE=false` under Kraken's explicit owner-directed deferral to v0.6.5 Build 45. The uncompleted engine-comparison, forced-Bayes-failure and operational-log privacy work is mandatory in `ACR_MOBILE_BUILD45_TECHNICAL_CLINICAL_REVIEW_BACKLOG_v0.1.md`.

The reviewed source was committed as `119a2e5ab4c9d84da9632847e9fbec5dab764d75` on `feature/mobile-v0.6.0-build44-cds-parity` and pushed to the existing public `KY-BChain/ACR-Mobile-Companion` repository after Kraken's later explicit Git/GitHub preservation authority. This superseded the original no-commit/no-push restriction only for source preservation. No merge, deployment, distribution, release tag or new tunnel was performed.

Final artifact hashes, test counts, physical-review limits, external backup identities and bounded housekeeping are recorded in `ACR_MOBILE_CDS_PARITY_EXECUTION_EVIDENCE_v1.6.md`. Build 43 remains preserved. Build 44 remains for controlled synthetic or explicitly authorised non-patient evaluation only.
