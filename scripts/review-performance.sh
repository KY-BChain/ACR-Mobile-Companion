#!/bin/zsh
# What the review service's own latency looks like, from T3's request log.
#
#   scripts/review-performance.sh            the last 24 hours
#   scripts/review-performance.sh --days 7   a week
#   scripts/review-performance.sh --all      everything on record
#
# WHAT THIS MEASURES, AND WHAT IT DOES NOT. durationMs is the time T3 spent on
# a request: its own work plus, for /m/v1/infer, the wait on T1. It starts when
# the request reaches this MacBook and ends when the reply leaves it.
#
# It therefore does NOT include the journey from the reviewer's phone to here:
# Hong Kong -> Cloudflare edge -> the lhr13/cdg10 tunnel connection -> this Mac,
# which is a further 150-250 ms round trip and the larger part of what a
# reviewer in Asia actually feels. A clean report here means the back end is
# keeping up; it does not prove the app feels quick in Kowloon. For that you
# need timings from the handset or Cloudflare's own analytics.
#
# Read-only. Touches nothing but the log files.

set -uo pipefail
DAYS=1
case "${1:-}" in
  --days) DAYS="${2:?--days needs a number}" ;;
  --all)  DAYS=36500 ;;
  "")     ;;
  *) print -u2 "usage: $0 [--days N | --all]"; exit 2 ;;
esac

python3 -I - "$HOME/.acr-gateway/logs" "$DAYS" <<'PY'
import json, sys, glob, os
from datetime import datetime, timedelta, timezone

logdir, days = sys.argv[1], float(sys.argv[2])
cut = datetime.now(timezone.utc) - timedelta(days=days)

rows, modes, errors = {}, {}, {}
for path in sorted(glob.glob(os.path.join(logdir, "gateway-*.log"))):
    with open(path, errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                e = json.loads(line)
            except ValueError:
                continue
            ts = e.get("ts")
            if not ts:
                continue
            try:
                when = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except ValueError:
                continue
            if when < cut:
                continue
            ev = e.get("event")
            if ev == "request.complete":
                route = e.get("route", "?")
                if route == "/m/v1/live":          # health probes, not reviewers
                    continue
                d = e.get("durationMs")
                if isinstance(d, (int, float)):
                    rows.setdefault(route, []).append(d)
            elif ev == "inference.complete":
                modes[e.get("resultMode", "?")] = modes.get(e.get("resultMode", "?"), 0) + 1
            elif ev == "request.error":
                key = f'{e.get("route","?")} {e.get("code","?")}'
                errors[key] = errors.get(key, 0) + 1

label = "all time" if days > 36000 else f"last {days:g} day(s)"
print(f"REVIEW SERVICE LATENCY — {label}")
print("(time spent on this MacBook only; excludes the trip from the phone)")
print()

if not rows:
    print("  no reviewer requests in this window")
else:
    def pct(v, p):
        v = sorted(v)
        if len(v) == 1:
            return v[0]
        i = (len(v) - 1) * p / 100
        lo, hi = int(i), min(int(i) + 1, len(v) - 1)
        return v[lo] + (v[hi] - v[lo]) * (i - lo)

    print(f"  {'route':24} {'n':>5} {'min':>7} {'median':>7} {'p90':>7} {'max':>8}")
    for route in sorted(rows, key=lambda r: -len(rows[r])):
        v = rows[route]
        print(f"  {route:24} {len(v):5d} {min(v):6.0f}m {pct(v,50):6.0f}m "
              f"{pct(v,90):6.0f}m {max(v):7.0f}m")

if modes:
    print()
    print("  reasoner results:")
    for m, n in sorted(modes.items(), key=lambda kv: -kv[1]):
        print(f"    {m:22} {n}")

print()
if errors:
    print("  errors:")
    for k, n in sorted(errors.items(), key=lambda kv: -kv[1]):
        print(f"    {k:40} {n}")
else:
    print("  errors: none")
PY
