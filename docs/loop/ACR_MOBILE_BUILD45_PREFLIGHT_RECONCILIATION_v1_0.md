# ACR Mobile Build 45 — Pre-Flight Reconciliation Script v1.0

**Status:** EXECUTABLE — investigate, auto-resolve where safe, escalate where not
**Trigger:** Loop v1.0 Gate 0 pre-flight HARD STOP, session of 9 September 2026 (`GATE0_PREFLIGHT_LOG_20260909.md`)
**Purpose:** Resolve Conflicts A–E and the seven open questions so Loop v1.0 Pre-Flight (P-01–P-10) can be re-run to a clean PASS or a single, well-evidenced escalation to Kraken.
**Authority:** This script does not replace Loop v1.0. It is a one-time bridge session. Loop v1.0 remains sole execution authority for Gates 1–12 once pre-flight passes.

---

## 0. Rules for this session

- Everything in **Part I (Investigation)** is read-only. No file is created, moved, or modified except the evidence log this script writes.
- Everything in **Part II (Environment Remediation)** touches machine/tool configuration only — never repository content.
- Everything in **Part III (Decision Matrix)** is either an **AUTO-RESOLVE** (safe, mechanical, executed and logged) or a **HARD STOP** (reported, not executed, waits for Kraken).
- All absolute prohibitions from Loop v1.0 §0.3 remain in force throughout this session (no canonical-platform changes, no push, no tunnel other than `acr-mobile-review` created/activated, no real-patient data, no distribution action).
- Write one evidence file: `docs/build45-preflight/GATE0_RECONCILIATION_LOG_<date>.md`. Do not overwrite the 9 September log — append this as a new file.

---

## Part I — Investigation (read-only)

### I-A. Tunnel `acr-mobile-gateway-t4` activation status (→ Conflict A)

1. Run `cloudflared tunnel list` (read-only) and check whether `acr-mobile-gateway-t4` appears as an existing tunnel ID in the local Cloudflare credentials/config, and whether it has ever routed traffic (check `~/.cloudflared/` for a credentials JSON matching that tunnel name/ID, and its file modification date).
2. Attempt a DNS lookup only (`dig mobile.acragent.com` or equivalent) — do not connect. Record whether the hostname resolves and to what.
3. Record findings: **NEVER ACTIVATED** (no credentials file, no DNS record) vs **POSSIBLY LIVE** (credentials exist and/or DNS resolves).

### I-B. Provenance of `b3376e36` and the T45-11 module (→ Conflict D)

1. `git log --follow --diff-filter=A -- gateway/src/app.js gateway/src/config.js gateway/src/evidence-probe.js` (and equivalent for the T45-11 module files) to find the **first** commit that introduced each, not just the most recent.
2. `git log -p b3376e36 -- gateway/ schemas/ src/api/requestBuilder.ts src/types/api.ts` to read the actual diff content and any commit message detail beyond the one-line summary.
3. `git log --all --oneline -- T45-11-remote-gateway/` to establish whether this module was authored inside this repo's history or imported/copied in as a completed unit (a single large added commit vs incremental authorship is a strong signal of the latter).
4. Check for any co-located design/review doc committed alongside these changes (README, ADR, commit body) that states who/what produced the module and whether it was reviewed.
5. Record findings as a provenance summary: author(s)/session identity if determinable from commit metadata, whether history shows incremental authorship or bulk import, and whether any review evidence is co-located.

### I-C. Repo layout confirmation (→ Conflict C)

1. Confirm `acr-mobile-companion-extended` has zero commits (`git log` returns empty / unborn HEAD) — already found true on 9 September; re-confirm current state only, do not act.
2. Confirm `acr-mobile-companion` commit `119a2e5a` is reachable on the current default branch and matches the preserved Build 44 evidence description ("gateway, schemas, fixtures, end-to-end tests" scope) by listing its changed-file set.

### I-D. Competing plan documents (→ Conflict E)

1. Read `docs/loop/ACR_MOBILE_BUILD45_FULL_IMPLEMENTATION_PLAN_v1.0.md` and `v1.1.md` in full.
2. Produce a short structural comparison against `ACR_MOBILE_BUILD45_TECHNICAL_CLINICAL_REVIEW_BACKLOG_v0.5.md` and `ACR_MOBILE_BUILD45_AUTONOMOUS_EXECUTION_LOOP_v1_0.md`: list any requirement, blocker, or gate present in the plan docs that is **not** represented in the backlog/Loop pair.
3. Record why v1.1 cites predecessor SHA `ab8140d2` where the preserved evidence and backlog cite `119a2e5a` — check the plan doc's own date/commit history to determine if it predates the evidence correction (i.e., is stale) or reflects a different, undocumented lineage.

### I-E. Gate 11 count recovery

1. Check whether `.acr-loop/` still exists on disk (gitignored ≠ deleted): `ls -la .acr-loop/v1.6/` if present.
2. If present, locate and read `G-COMPLETE-REVIEW-001/review.md` and any file establishing the `79/79` targeted platform test figure. If absent from disk entirely, record as **NOT RECOVERABLE** rather than guessing at a replacement figure.
3. Record the current actual test count at HEAD (already known: gateway 158/158, e2e 4/4 = 162 total per 9 September log) as the candidate corrected baseline, pending Part III decision.

---

## Part II — Environment Remediation (safe, auto-execute)

These do not touch repository content and carry no governance ambiguity. Execute all, record results.

| Step | Action |
|---|---|
| E-01 | Set JDK 21 as the `jenv` local/global version for both repo directories (`jenv local 21.0.11` or equivalent in-repo, not a system-wide change unless that is the existing project convention — check `.java-version` precedent first). |
| E-02 | Install EAS CLI (`npm install -g eas-cli` or project-local equivalent — prefer project-local if a `package.json` devDependency pattern exists). |
| E-03 | Mount `/Volumes/AndroidDev` if a mount command/script exists in the repo or is a known standing procedure; if it requires physical media or credentials not available to this session, record as **BLOCKED — MANUAL ACTION REQUIRED** and stop attempting. |
| E-04 | Start/verify the `acr-api` Cloudflare tunnel process is running (`cloudflared tunnel run acr-api` or the project's existing launchd/service mechanism) **without modifying its configuration**. Confirm `api.acragent.com` returns a non-530 response afterward. If starting it requires a config change, do not make one — report and stop this step only. |

Record each step's outcome (success / blocked / needs manual action) in the evidence log.

---

## Part III — Decision Matrix

### D-A. Tunnel identity (Conflict A)

- **IF** Investigation I-A finds `acr-mobile-gateway-t4` **NEVER ACTIVATED** (no credentials, no DNS resolution to a live Cloudflare edge): **AUTO-RESOLVE.** Retarget all committed references (cloudflared config, launchd plist, setup/health scripts, iOS/Android network configs) from `acr-mobile-gateway-t4` / `mobile.acragent.com` to `acr-mobile-review` / `mobile-gateway-review.acragent.com`. Do not create or activate the tunnel itself — that remains Gate 10 under Loop v1.0. Record the full list of files changed.
- **IF** Investigation I-A finds it **POSSIBLY LIVE**: **HARD STOP.** Do not retarget or modify any reference. This is a live-infrastructure question outside this script's authority — report exact evidence (credential file path/date, DNS result) to Kraken.

### D-B. Auth store (Conflict B)

**AUTO-RESOLVE — no further investigation needed.** P-07 already confirmed `node:sqlite` functional and no suitability concern exists. Do not rewrite `persistent-auth.js` in this session — that is Gate 10 work under Loop v1.0, not pre-flight. Record in the evidence log that the JSON-store divergence is confirmed, SQLite is confirmed viable, and the rewrite is deferred to Gate 10 with no open question remaining.

### D-C. Repo layout (Conflict C)

**AUTO-RESOLVE.** Investigation I-C reconfirming zero commits in `acr-mobile-companion-extended` and `119a2e5a`'s scope in `acr-mobile-companion` is sufficient. Correct Loop v1.0 §1 in place: replace the two-repo path/branch table with a single-repo table —

```text
Mobile + gateway (single repo):
/Users/Kraken/DAPP/acr-mobile-companion

Platform (canonical, read-only):
/Users/Kraken/DAPP/acr-platform

Isolated platform evidence (Gate 1 only):
/Users/Kraken/DAPP/REVIEW-WORKTREES/acr-platform-build45-evidence

Branch:
feature/mobile-v0.6.5-build45   (single branch, replaces the two-branch plan)
```

Mark `acr-mobile-companion-extended` as **inactive/reference-only** in the corrected §1 — do not delete it, do not branch from it. This is a documentation correction to Loop v1.0 itself (tracked change, commit it with a clear message referencing this reconciliation), not a repository code change, so it is in scope for auto-resolution.

### D-D. Undeclared commit `b3376e36` and the T45-11 module (Conflict D)

**HARD STOP regardless of provenance findings.** This is the one conflict this script does not auto-resolve under any outcome, because it is a governance decision — whether unreviewed or externally-sourced code becomes the security foundation for Build 45's authentication and gateway layer — not a factual reconciliation. Present Investigation I-B's findings (provenance summary, incremental-vs-bulk-import signal, any co-located review evidence) to Kraken with a direct recommendation:

- If I-B shows clear incremental authorship inside this repo's own history with no external import signature: recommend accepting as Gate 3/10 baseline, subject to Kraken's confirmation.
- If I-B shows a bulk-import signature or unclear authorship: recommend isolating the T45-11 module on its own unmerged branch and treating Gate 3/10 as starting from Build 44 baseline, with the existing module held for separate review rather than built upon.

Do not act on either recommendation without Kraken's written decision.

### D-E. Competing plan documents (Conflict E)

- **IF** Investigation I-D finds no requirement/blocker/gate in the plan docs absent from the backlog/Loop pair, and the SHA discrepancy is explained by staleness (plan doc predates the evidence correction): **AUTO-RESOLVE.** Move both plan docs and the review doc to `docs/archive/`, with a one-line note at the top of each stating they are superseded by backlog v0.5 and Loop v1.0. Record the comparison that justified this.
- **IF** Investigation I-D finds material not covered by the backlog/Loop pair, or the SHA discrepancy is not explained by staleness: **HARD STOP.** Report the specific uncovered material to Kraken rather than archiving or merging unilaterally.

### D-F. Gate 11 count correction

**AUTO-RESOLVE for documentation, HARD STOP for the missing review record.** Correct Loop v1.0 §11 (G11-02) target from "157/157 gateway tests, 79/79 targeted platform tests" to the reconciled figures established in Investigation I-E, explicitly noting the count changed because `b3376e36` added test coverage (pending resolution of D-D — if D-D results in the T45-11 module being isolated rather than kept, the test count will need re-establishing again after that decision). If `.acr-loop/v1.6/` and `G-COMPLETE-REVIEW-001/review.md` are confirmed **NOT RECOVERABLE** from disk, record this explicitly in the corrected §11 — do not invent a replacement figure for the missing platform-test baseline; flag that Gate 11 will require Kraken to either locate an external copy or accept a freshly-established baseline at Gate 11 time.

---

## Part IV — Resume Pre-Flight

After Parts I–III complete:

1. Re-run Loop v1.0 P-01–P-10 in full against the now-corrected §1 (single repo).
2. P-08 should now reflect `acr-api` as running (per E-04) rather than HTTP 530 — if still failing, that is a genuine environment blocker, report it.
3. If **every** pre-flight step passes **except** those gated on D-D's unresolved status: proceed into **Gate 1** only (isolated backend evidence, T45-01/T45-02) — this gate does not depend on D-D and is safe to enter, since it operates in a disposable worktree and touches neither the gateway nor the T45-11 module.
4. Do **not** enter Gate 3 or Gate 10 until Kraken has issued a written decision on D-D. This is the single remaining gate to Loop v1.0 resuming in full.

---

## Session Close

Write the reconciliation evidence log. Commit locally (Loop v1.0 §0.3 — no push) any AUTO-RESOLVE changes made to Loop v1.0 §1, archived plan docs, and retargeted tunnel references, each as a separate clearly-labelled commit. State the commit hash(es). Report the single outstanding item (D-D) and, if reached, confirm Gate 1 status. End the session there — do not proceed into Gate 3/10 speculatively.

---

**END OF DOCUMENT**
