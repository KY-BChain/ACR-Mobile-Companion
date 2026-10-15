#!/bin/zsh
# Is anything happening on the review service? Run before stopping T1-T4, and
# after starting them for a quick picture.
#
# WHERE TO LOOK, AND WHY. A reviewer's phone reaches T4 (tunnel) -> T3 (node
# gateway, 127.0.0.1:3001) -> T1 (reasoner, :8080). T2 carries website traffic
# to T1 and never sees the app. The two cloudflared processes log tunnel
# connections, never requests, so their output cannot answer this question.
#
# Nor can TCP connection counts: cloudflared multiplexes every reviewer request
# over a few long-lived HTTP/2 connections to T3, so the count says nothing
# about requests in flight. T3's own request log is the only honest source, and
# it is what this script reads.

L="$HOME/.acr-gateway/logs"
DB="$HOME/.acr-gateway/gate10/auth.db"
REVIEWER_ROUTES='/m/v1/(auth/redeem|auth/refresh|infer|demo/infer|attestation)'

# Newest log first, so "latest" really is the latest.
logs=( ${(f)"$(ls -t $L/gateway-*.log 2>/dev/null)"} )

print -- "SERVICES"
for probe in "T1 reasoner:8080" "T3 gateway:3001"; do
  label="${probe%:*}"; port="${probe##*:}"
  if lsof -nP -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1; then
    print -- "  $label  listening on :$port"
  else
    print -- "  $label  NOT LISTENING on :$port"
  fi
done
for t in "T2 acr-api tunnel:acr-api" "T4 mobile-review tunnel:acr-mobile-review"; do
  label="${t%:*}"; name="${t##*:}"
  pgrep -f "cloudflared.*$name" >/dev/null 2>&1 \
    && print -- "  $label  running" \
    || print -- "  $label  NOT RUNNING"
done

print -- ""
print -- "REVIEWER REQUESTS  (from T3's log; /m/v1/live probes ignored)"
if (( ${#logs} == 0 )); then
  print -- "  no gateway log found"
else
  now=$(date +%s)
  for window in 5 60 1440; do
    cut=$(( now - window * 60 ))
    n=$(cat $logs 2>/dev/null \
        | grep -E "\"route\":\"$REVIEWER_ROUTES\"" \
        | sed -n 's/.*"ts":"\([^"]*\)\..*/\1/p' \
        | while read -r ts; do
            s=$(date -jf '%Y-%m-%dT%H:%M:%S' "$ts" +%s 2>/dev/null) || continue
            (( s >= cut )) && print x
          done | wc -l | tr -d ' ')
    case $window in
      5)    print -- "  last 5 minutes : $n" ;;
      60)   print -- "  last hour      : $n" ;;
      1440) print -- "  last 24 hours  : $n" ;;
    esac
  done

  print -- ""
  print -- "  most recent:"
  cat $logs 2>/dev/null \
    | grep -E "\"route\":\"$REVIEWER_ROUTES\"" \
    | sed -n 's/.*"ts":"\([^"]*\)".*"route":"\([^"]*\)".*"status":\([0-9]*\).*/\1 \2 \3/p' \
    | sort | tail -3 \
    | while read -r ts route code; do
        age=$(( ( $(date +%s) - $(date -jf '%Y-%m-%dT%H:%M:%S' "${ts%.*}" +%s 2>/dev/null) ) / 60 ))
        printf "    %s UTC  %-20s %s  (%d min ago)\n" "${ts%.*}" "$route" "$code" "$age"
      done
  [[ -z "$(cat $logs 2>/dev/null | grep -E "\"route\":\"$REVIEWER_ROUTES\"")" ]] && print -- "    none recorded"

  print -- ""
  printf "  pairings (auth/redeem) all time : %s\n" \
    "$(cat $logs 2>/dev/null | grep -c '"route":"/m/v1/auth/redeem"')"
  printf "  inferences completed all time   : %s\n" \
    "$(cat $logs 2>/dev/null | grep -c '"event":"inference.complete"')"
fi

print -- ""
print -- "LIVE SESSIONS"
sqlite3 "$DB" "
SELECT '  ' || client_build_id || '   expires ' ||
       datetime(expires_at/1000,'unixepoch','localtime')
FROM sessions
WHERE revoked_at IS NULL
  AND expires_at/1000 > CAST(strftime('%s','now') AS INTEGER)
ORDER BY expires_at;" 2>/dev/null || print -- "  (could not read the store)"
