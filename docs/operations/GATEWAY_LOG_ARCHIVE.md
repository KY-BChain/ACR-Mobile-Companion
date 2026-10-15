# Gateway log archive — for review before implementation

**Status:** built and tested, **not yet run against the real logs** and **not scheduled**.
Awaiting Kraken's approval.
**Script:** `scripts/archive-gateway-logs.sh`
**Date:** 14 October 2026

---

## 1. The problem this solves

T3, the mobile gateway, writes one line of JSON per request to
`~/.acr-gateway/logs/gateway-<stamp>.log`. A restart of T3 closes that file and opens a
new one. The same happens for T4's tunnel log.

Two facts, established on 14 October 2026:

| | Finding |
|---|---|
| On this MacBook | 21 gateway logs and 21 tunnel logs, 2.1 MB, back to 12 September. **Nothing prunes them and nothing copies them off the machine** except Time Machine. |
| On each website | `api/log-ingest.php` holds a rolling **4,000 lines** and silently discards the rest — roughly a fortnight. |

So the website's copy is a *window*, not an archive: it forgets. For anything older than
about a fortnight, this MacBook is the sole record of who paired, when, and what the
reasoner answered. That is not a sound position for an audit trail, and the log directory
grows without limit, if slowly — about 25 MB a year at current traffic.

## 2. What the script does

One gzipped tar per calendar month, written to the external drive:

```
/Volumes/AndroidDev/acr-gateway-backups/logs/
    2026-09.tar.gz
    2026-10.tar.gz
    README.txt
```

A log's month is taken from **its own filename**, not from the file's modification time,
because a copy or a restore would change the latter.

**The live log is never touched.** The newest `gateway-*.log` and the newest `tunnel-*.log`
are still open by T3 and T4, so they are excluded and left in place. Only closed files are
archived, and only after their contents have been verified inside the bundle.

**No service is started, stopped or signalled.** The script reads the log directory and
writes to the drive. T1 to T4 are not involved.

## 3. Order of operations — why it is safe

Each month is handled in this order, and a failure at any point leaves the logs where they
are:

| | Step | On failure |
|---|---|---|
| S1 | Build the new bundle in a temporary file, from the existing bundle (if any) plus the newly closed logs | nothing removed |
| S2 | Count the `.log` members inside the temporary bundle and compare with what should be there | **aborts, nothing removed** |
| S3 | Move the temporary bundle into place | nothing removed |
| S4 | Only now, delete the archived files from the log directory | — |

A month already archived gets its new files **added**, by rebuilding from the old bundle.
Appending to a `.tar.gz` is not possible, so this is done deliberately rather than by
accident.

## 4. Retention

Twelve monthly bundles by default, matching the three-generation convention used by
`backup-gateway-auth.sh` but longer, because this is the audit record rather than a
recovery copy. Override with `--keep 24`.

At the compression observed in testing — 2.1 MB of logs to 108 KB of bundles, about
nineteen to one, because JSON lines repeat heavily — twelve months will occupy a few
megabytes.

## 5. Operational steps

| | Step |
|---|---|
| A1 | Attach `/Volumes/AndroidDev`. |
| A2 | `cd ~/DAPP/acr-mobile-companion` |
| A3 | `scripts/archive-gateway-logs.sh --dry-run` — read what it intends to do. Nothing is written. |
| A4 | `scripts/archive-gateway-logs.sh` — archive. |
| A5 | Confirm the two live logs remain in `~/.acr-gateway/logs/`, and that the month's bundle exists on the drive. |

To read a month back:

```
tar -xzf /Volumes/AndroidDev/acr-gateway-backups/logs/2026-09.tar.gz -C /tmp/look
```

Options: `--dest <path>` to write elsewhere, `--keep <n>` for a different retention,
`--dry-run` to change nothing.

## 6. When to run it

Monthly is enough at present traffic. It is safe to run at any time, including while T1 to
T4 are up and a reviewer is working, because the live log is excluded and nothing is
signalled.

It cannot be a `cron` job in a Claude session — those die with the session. It is either
run by hand after the drive is attached, or added to a `launchd` agent. **Recommendation:
by hand for now**, since the drive is not always mounted and a scheduled job that silently
fails to find it is worse than no job.

## 7. Evidence from testing

Run against **copies** of the 42 real log files in a scratch directory, so the live logs
were never at risk:

```
2026-09 — 26 file(s)   archived and removed 26 file(s) — 100K
2026-10 — 14 file(s)   archived and removed 14 file(s) —  12K
Done. 40 log file(s) archived; 2 monthly bundle(s) held, keeping 12.

left in the log directory:
  gateway-20261014T065916Z.log      the live gateway log
  tunnel-20261014T065916Z.log       the live tunnel log
```

| | Check | Result |
|---|---|---|
| T1 | Live files excluded | both kept in place |
| T2 | Restored file byte-identical to the original | SHA-256 matched |
| T3 | Bundle holds every file of that month | 26 of 26 |
| T4 | Re-run after a further log closed — added, not replaced | 2026-10 went from 14 to 15 members |
| T5 | Dry run writes and removes nothing | confirmed |
| T6 | Refuses when the drive is absent | `FAILED: /Volumes/AndroidDev is not mounted` |

## 8. What this does not do

- It does not archive the **websites'** `gateway-activity.jsonl`. That file is a rolling
  window of what was pushed, already capped, and is not the record.
- It does not encrypt the bundles. They go to the same unencrypted drive as the rest of
  `acr-gateway-backups/`. The logs name no patient and hold no credential — routes,
  timings, status codes and truncated request ids — but they do show when each reviewer
  was active.
- It does not de-duplicate. A log archived twice would appear once, because the bundle is
  keyed by filename.

## 9. For Kraken to decide

| | Question | Default if you say nothing |
|---|---|---|
| D1 | Retention — twelve months, or longer? | 12 |
| D2 | By hand, or a `launchd` agent? | by hand |
| D3 | Should the bundles sit on the encrypted SSD instead, once that exists? | no — stay on AndroidDev with the other archives |
