#!/bin/zsh
# Who paired, and when. Run on the MacBook only.
#
#   scripts/who-paired.sh            every pairing on record
#   scripts/who-paired.sh --days 7   the last week
#
# WHY THIS IS NOT IN THE WEBSITE'S T3 TAB. The answer needs two things that only
# exist together on this machine: T3's log, which says a pairing happened at a
# given instant, and ~/.acr-gateway/gate10/auth.db, which says which invitation
# opened a session at that instant. The log alone names nobody — by design — and
# auth.db is never pushed anywhere. Joining them here keeps the identities on
# this machine: data stays, rules travel.
#
# It answers only for PAIRINGS. A later /m/v1/infer or /m/v1/auth/refresh line
# carries nothing that ties it to a session, so there is no honest way to say
# who submitted a particular case. See the note at the end of the output.
#
# Read-only: opens auth.db in read-only mode and never writes.

set -uo pipefail
DAYS=36500
case "${1:-}" in
  --days) DAYS="${2:?--days needs a number}" ;;
  "") ;;
  *) print -u2 "usage: $0 [--days N]"; exit 2 ;;
esac

python3 -I - "$HOME/.acr-gateway/logs" "$HOME/.acr-gateway/gate10/auth.db" "$DAYS" <<'PY'
import json, glob, os, sqlite3, sys, datetime

logdir, dbpath, days = sys.argv[1], sys.argv[2], float(sys.argv[3])
cut = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)

if not os.path.exists(dbpath):
    print("no invite store — cannot attribute anything"); raise SystemExit(1)

redeems = []
for p in sorted(glob.glob(os.path.join(logdir, "gateway-*.log"))):
    for line in open(p, errors="replace"):
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            e = json.loads(line)
        except ValueError:
            continue
        # A refusal is logged twice, as request.complete AND request.error.
        # Count the complete one only, or every refusal appears in duplicate.
        if e.get("route") != "/m/v1/auth/redeem" or e.get("event") != "request.complete":
            continue
        try:
            when = datetime.datetime.fromisoformat(e["ts"].replace("Z", "+00:00"))
        except (KeyError, ValueError):
            continue
        if when >= cut:
            redeems.append((when, int(e.get("status") or 0), e.get("code") or ""))

db = sqlite3.connect(f"file:{dbpath}?mode=ro", uri=True)
sessions = db.execute("""
    SELECT s.created_at, s.expires_at, s.revoked_at, s.client_build_id, i.label, i.org
    FROM sessions s JOIN invitations i ON i.id = s.invitation_id
""").fetchall()

print(f"PAIRINGS  ({'all time' if days > 36000 else f'last {days:g} day(s)'})")
print()
print(f"  {'when (local)':20} {'org':6} {'reviewer':22} {'build':16} {'session'}")
for when, status, code in sorted(redeems):
    local = when.astimezone().strftime("%Y-%m-%d %H:%M:%S")
    if status != 200:
        print(f"  {local:20} {'—':6} {'REFUSED: ' + (code or str(status)):22}")
        continue
    t = when.timestamp()
    hit = [s for s in sessions if abs(s[0] / 1000 - t) < 3]
    if not hit:
        print(f"  {local:20} {'?':6} {'(no session matches)':22}")
        continue
    created, expires, revoked, build, label, org = hit[0]
    if revoked:
        state = "revoked"
    elif expires / 1000 > datetime.datetime.now().timestamp():
        state = "live to " + datetime.datetime.fromtimestamp(expires / 1000).strftime("%d %b")
    else:
        state = "expired"
    print(f"  {local:20} {(org or '-'):6} {(label or '(no label)')[:22]:22} {build:16} {state}")

print()
print("  A pairing is the only call that can be attributed. /m/v1/infer and")
print("  /m/v1/auth/refresh lines carry no session reference, so who submitted a")
print("  particular case cannot be said from these records.")
PY
