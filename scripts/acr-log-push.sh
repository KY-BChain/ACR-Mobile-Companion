#!/bin/zsh
# Push gateway activity to the monitor page on www.blockenergy.net.
#
#   scripts/acr-log-push.sh            run until Ctrl+C, pushing every 60 s
#   scripts/acr-log-push.sh once       push once and stop
#   scripts/acr-log-push.sh status     show what it would push, send nothing
#
# The gateway (T3) writes its log to ~/.acr-gateway/logs/ on this machine. The
# ISP cannot read that, so this sends the interesting lines up. It reads the
# log, nothing more: it never writes to it, never touches T1 to T4, and stopping
# it affects no service.
#
# The shared key lives in ~/.acr-gateway/log-push.key on this machine and in
# ~/sites/private/log-ingest.key on the server. The two must match.

set -u

# Both sites. mobile-review.php — and its T3 traffic tab — runs on each of
# them, and each has its OWN sites/private/, so a push to one leaves the other
# tab showing nothing. The same key must therefore be installed on both.
# Comment a line out to stop pushing to that site.
ENDPOINTS=(
  "https://www.acragent.com/api/log-ingest.php"
  "https://www.blockenergy.net/api/log-ingest.php"
)
KEY_FILE="$HOME/.acr-gateway/log-push.key"
LOG_DIR="$HOME/.acr-gateway/logs"
INTERVAL=60
WINDOW=400          # how many recent lines to offer each time; the server
                    # discards what it already holds, so overlap is harmless

mode="${1:-loop}"

say()  { print -P "%F{cyan}$(date '+%H:%M:%S')%f  $*"; }
ok()   { print -P "%F{cyan}$(date '+%H:%M:%S')%f  %F{green}✔%f $*"; }
bad()  { print -P "%F{cyan}$(date '+%H:%M:%S')%f  %F{red}✘%f $*"; }
die()  { bad "$*"; exit 1; }

[[ -r "$KEY_FILE" ]] || die "no key at $KEY_FILE — create it, and put the same value in ~/sites/private/log-ingest.key on the server"
KEY=$(tr -d '\n\r' < "$KEY_FILE")
[[ -n "$KEY" ]] || die "the key file is empty"

# The live log is the newest one. A restart of T3 creates a new file, so this
# is resolved every time round rather than once at startup.
current_log() { ls -t "$LOG_DIR"/gateway-*.log 2>/dev/null | head -1 }

code_of() { curl -s -o /dev/null --max-time 10 -w '%{http_code}' "$@" 2>/dev/null || print 000 }

service_codes() {
  print -r -- "{\"t1\":$(code_of http://localhost:8080/api/infer/health),\
\"t2\":$(code_of https://api.acragent.com/api/infer/health),\
\"t3\":$(code_of -H 'Host: mobile-gateway-review.acragent.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1:3001/m/v1/live),\
\"t4\":$(code_of https://mobile-gateway-review.acragent.com/m/v1/live)}"
}

push_once() {
  local log; log=$(current_log)
  [[ -n "$log" && -r "$log" ]] || { bad "no readable gateway log in $LOG_DIR"; return 1 }

  # Only the lines worth showing. Health probes are left out: they are the
  # monitor's own traffic and would bury the device activity.
  local payload
  payload=$(
    tail -n "$WINDOW" "$log" \
      | grep -E '"route":"/m/v1/(auth/redeem|auth/refresh|infer|demo/infer)"|"event":"inference\.complete"|"event":"request\.error"' \
      | python3 -c '
import json,sys
lines=[l.rstrip("\n") for l in sys.stdin if l.strip().startswith("{")]
print(json.dumps({"lines":lines}))' 2>/dev/null
  )
  [[ -n "$payload" ]] || payload='{"lines":[]}'

  # Attach the current service codes and the log name, for the heartbeat.
  payload=$(print -r -- "$payload" | python3 -c "
import json,sys
d=json.load(sys.stdin)
d['services']=json.loads('''$(service_codes)''')
d['log_file']='$(basename "$log")'
print(json.dumps(d))" 2>/dev/null) || return 1

  local n; n=$(print -r -- "$payload" | python3 -c 'import json,sys;print(len(json.load(sys.stdin)["lines"]))' 2>/dev/null)

  if [[ "$mode" == "status" ]]; then
    say "log        : $(basename "$log")"
    say "lines ready: ${n:-0}"
    say "services   : $(service_codes)"
    for e in "${ENDPOINTS[@]}"; do say "endpoint   : $e  (nothing sent in status mode)"; done
    return 0
  fi

  # Each site is pushed to and reported on separately: one site being
  # unreachable must not hide a success on the other, nor stop the loop.
  local reply site code out added held failures=0
  for endpoint in "${ENDPOINTS[@]}"; do
    site="${${endpoint#https://}%%/*}"
    # One request only. The status code is appended on its own line and split
    # off, so the payload is never posted twice — which would both waste a push
    # and make the second reply report "0 new".
    out=$(curl -s --max-time 25 -X POST "$endpoint" \
            -H "X-ACR-Key: $KEY" -H 'Content-Type: application/json' \
            --data-binary "$payload" -w '\n%{http_code}' 2>/dev/null)
    code="${out##*$'\n'}"
    reply="${out%$'\n'*}"

    if print -r -- "$reply" | grep -q '"success":true'; then
      added=$(print -r -- "$reply" | sed -n 's/.*"added":\([0-9]*\).*/\1/p')
      held=$(print -r -- "$reply"  | sed -n 's/.*"held":\([0-9]*\).*/\1/p')
      ok "$site — ${added:-0} new, ${held:-?} held (offered ${n:-0})"
    else
      # The common failures say nothing useful on their own, so name the cause.
      case "$code" in
        404) bad "$site — api/log-ingest.php is not on this server. Upload it." ;;
        401) bad "$site — key refused. sites/private/log-ingest.key must match ~/.acr-gateway/log-push.key on THIS site." ;;
        500) bad "$site — the endpoint errored. Check sites/private/ exists and is writable." ;;
        000) bad "$site — no reply. Network, or the host is down." ;;
        *)   bad "$site — HTTP ${code:-?}: ${reply:-no reply}" ;;
      esac
      failures=$(( failures + 1 ))
    fi
  done
  (( failures == ${#ENDPOINTS[@]} )) && return 1
  return 0
}

case "$mode" in
  once|status) push_once ;;
  loop)
    say "pushing to ${#ENDPOINTS[@]} site(s) every ${INTERVAL}s — Ctrl+C to stop"
    for e in "${ENDPOINTS[@]}"; do say "  $e"; done
    say "this reads the log only; it never touches T1 to T4"
    while true; do
      push_once
      sleep "$INTERVAL"
    done
    ;;
  *) die "usage: acr-log-push.sh [loop|once|status]" ;;
esac
