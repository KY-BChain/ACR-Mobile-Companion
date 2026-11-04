#!/bin/zsh
#
#   scripts/acr-services.sh          start T1, T2, T3 + T4, then the T5L sync, each after the last is healthy
#   scripts/acr-services.sh stop     stop them in reverse: T5L sync, T4, T3, then T2 and T1 on your word
#
# Claude never starts or stops T1 or T2. The stop action asks you to confirm
# before it signals them, so closing the platform is always your decision.

REPO_DIR="${0:A:h:h}"
# Two T1 versions until T1 v2.1 is approved (Kraken, 29 Oct 2026); the start asks which one serves the platform.
T1_LIVE_DIR="/Users/Kraken/DAPP/ACR-T1-live-pre-v2.1/ACR-Ontology-Interface"
T1_V21_DIR="/Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface"
PLATFORM_DIR=""
REVIEW_SCRIPT="$REPO_DIR/scripts/build50-review-service.sh"
# T5L sync: imports T1 v2.1's two outboxes into the local T5L record every T5L_WATCH seconds.
# Paths come from t5l/config.json. The live T1 before v2.1 writes no outbox, so T5L runs only with v2.1.
T5L_DIR="/Users/Kraken/DAPP/ACR-platform"
T5L_PY="/usr/bin/python3"
T5L_WATCH=60
T1_WAIT=300
T2_WAIT=120
T3_WAIT=150

say()  { print -P "%F{cyan}$(date +%H:%M:%S)%f  $*"; }
ok()   { print -P "%F{cyan}$(date +%H:%M:%S)%f  %F{green}✔%f $*"; }
fail() { print -P "%F{cyan}$(date +%H:%M:%S)%f  %F{red}✘%f $*"; print -P "\n%F{red}Stopped at this step. Nothing after it was started.%f"; exit 1; }
section() { print -P "\n%B$*%b"; }
code_of() { curl -s -o /dev/null --max-time 10 -w '%{http_code}' "$@" 2>/dev/null || print 000; }
listening() { lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null | head -1; }
t1_ready() {
  [[ "$(code_of http://localhost:8080/api/infer/health)" == 200 \
    && "$(code_of http://localhost:8080/api/ontolator/status)" == 200 \
    && "$(code_of http://localhost:8080/api/ontolator/manifest)" == 200 ]]
}
open_window() {
  osascript - "$1" "$2" >/dev/null <<'APPLESCRIPT'
on run argv
  tell application "Terminal"
    activate
    set newTab to do script (item 2 of argv)
    set custom title of newTab to (item 1 of argv)
  end tell
end run
APPLESCRIPT
}

t2_pid() { pgrep -f 'cloudflared tunnel run --url http://localhost:8080 acr-api' | head -1; }
t5l_pid() { pgrep -f 't5l.sync --watch' | head -1; }
t1_pid() { listening 8080; }
t1_dir_of() { lsof -a -p "$1" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p'; }
t1_name() {
  case "$1" in
    "$T1_LIVE_DIR") print "T1 live (before v2.1)" ;;
    "$T1_V21_DIR")  print "T1 v2.1 (under review)" ;;
    *)              print "T1 from $1" ;;
  esac
}
# Waits for Kraken's choice; ACR_T1=live or ACR_T1=v2.1 answers it in advance.
choose_t1() {
  local ans="${ACR_T1:-}"
  if [[ -z "$ans" ]]; then
    print -P "\n%BWhich T1 serves the ACR Platform (websites and both phone apps)?%b"
    print "  1  T1 live (before v2.1)   $T1_LIVE_DIR"
    print "  2  T1 v2.1 (under review)  $T1_V21_DIR"
    read -r "ans?Choose 1 or 2: "
  fi
  case "$ans" in
    1|live) PLATFORM_DIR="$T1_LIVE_DIR" ;;
    2|v2.1) PLATFORM_DIR="$T1_V21_DIR" ;;
    *) print -P "%F{red}No T1 chosen — nothing was started.%f"; exit 2 ;;
  esac
  ok "Chosen: $(t1_name "$PLATFORM_DIR")"
}

# Hold the Mac awake for as long as a given process lives.
#
#   -i  no idle system sleep        -m  no disk idle sleep
#   -s  no system sleep on AC power
#
# Deliberately NO -d: that would also keep the SCREEN on, and this machine runs
# for days at a time. The display is left free to sleep, which is what
# PreventUserIdleDisplaySleep 0 in `pmset -g assertions` confirms.
#
# -w ties the assertion to that PID, so it releases itself when the service
# stops and never outlives what it was protecting.
#
# WHY HERE AS WELL AS IN THE REVIEW SCRIPT. build50-review-service.sh already
# does this for the gateway (T3). That left a gap: stopping T3 while T1 and T2
# kept running released the only assertion, the Mac could then sleep, and the
# website's back end would go down with it. This one is tied to T1.
keep_awake() {
  local pid="$1" label="$2"
  [[ -z "$pid" ]] && return 0
  if pgrep -f "caffeinate -ims -w $pid" >/dev/null 2>&1; then
    ok "Mac already held awake for $label"
    return 0
  fi
  caffeinate -ims -w "$pid" >/dev/null 2>&1 &
  ok "Mac held awake while $label runs — the screen may still sleep"
}

stop_all() {
  print -P "%BACR services — stop in reverse: T5L sync → T4 → T3 → T2 → T1%b  ($(date '+%d %b %Y %H:%M'))"

  section "T5L — local CDS results record (sync)"
  local sp="$(t5l_pid)"
  if [[ -n "$sp" ]]; then
    # Ctrl+C equivalent. Each import pass is its own SQLite transaction, so an
    # interrupted pass leaves nothing half-written; the next start carries on
    # from the saved outbox offsets.
    kill -INT "$sp" 2>/dev/null
    for i in $(seq 1 10); do [[ -z "$(t5l_pid)" ]] && break; sleep 1; done
    [[ -z "$(t5l_pid)" ]] && ok "T5L sync stopped" || fail "T5L sync did not stop — use Ctrl+C in its window"
  else
    ok "T5L sync is already stopped"
  fi

  section "T4 + T3 — mobile app review service"
  if [[ -n "$(listening 3001)" ]]; then
    "$REVIEW_SCRIPT" stop || fail "The review service script did not stop cleanly"
  else
    ok "T3 and T4 are already stopped"
  fi

  section "T2 — acr-api tunnel, and T1 — ACR Platform"
  local tp="$(t2_pid)" ip="$(t1_pid)"
  if [[ -z "$tp" && -z "$ip" ]]; then
    ok "T1 and T2 are already stopped"
    section "All services are stopped"
    return 0
  fi
  [[ -n "$tp" ]] && say "T2 tunnel running (PID $tp)" || say "T2 is already stopped"
  [[ -n "$ip" ]] && say "T1 platform running on port 8080 (PID $ip)" || say "T1 is already stopped"
  print -P "%F{yellow}The ACR Platform website loses its back end the moment T2 and T1 stop.%f"
  if read -q "REPLY?Stop T2 and then T1 now? [y/N] "; then
    print ""
  else
    print ""
    say "T1 and T2 left running. Stop them with Ctrl+C in their own windows when you are ready."
    return 0
  fi

  if [[ -n "$tp" ]]; then
    kill -INT "$tp" 2>/dev/null
    for i in $(seq 1 15); do [[ -z "$(t2_pid)" ]] && break; sleep 1; done
    [[ -z "$(t2_pid)" ]] && ok "T2 stopped" || fail "T2 did not stop — use Ctrl+C in its window"
  fi
  if [[ -n "$ip" ]]; then
    kill -INT "$ip" 2>/dev/null
    for i in $(seq 1 30); do [[ -z "$(t1_pid)" ]] && break; sleep 2; done
    [[ -z "$(t1_pid)" ]] && ok "T1 stopped, port 8080 free" || fail "T1 did not stop — use Ctrl+C in its window"
  fi

  section "All services are stopped"
  ok "port 3001 free · port 8080 free"
  say "The Terminal windows stay open; close them when you wish."
  return 0
}

case "${1:-start}" in
  stop) stop_all; exit $? ;;
  start) ;;
  *) print "Usage: ${0:t} [start|stop]"; exit 2 ;;
esac

print -P "%BACR services — T1 → T2 → T3 + T4%b  ($(date '+%d %b %Y %H:%M'))"
choose_t1

section "Checks"
command -v mvn >/dev/null && ok "Maven found" || fail "Maven (mvn) not found"
command -v cloudflared >/dev/null && ok "cloudflared found" || fail "cloudflared not found"
[[ -f "$PLATFORM_DIR/pom.xml" ]] && ok "ACR Platform folder found" || fail "ACR Platform folder not found: $PLATFORM_DIR"
[[ -x "$REVIEW_SCRIPT" ]] && ok "Build 50 review service script found" || fail "Review service script not found: $REVIEW_SCRIPT"

section "T1 — ACR Platform (Spring Boot, port 8080)"
if t1_ready; then
  running="$(t1_dir_of "$(t1_pid)")"
  ok "T1 is already running and healthy — not started again: $(t1_name "$running")"
  [[ "$running" == "$PLATFORM_DIR" ]] || fail "The running T1 is not the one chosen — stop it first (scripts/acr-services.sh stop), then start again"
else
  [[ -n "$(listening 8080)" ]] && fail "Port 8080 is in use but T1 is not healthy — check the program on port 8080 first"
  open_window "T1 · $(t1_name "$PLATFORM_DIR")" "cd '$PLATFORM_DIR' && mvn spring-boot:run -Dspring-boot.run.profiles=hybrid" || fail "Could not open the T1 Terminal window"
  ok "T1 window opened — starting Spring Boot and loading the ontology"
  waited=0
  until t1_ready; do
    (( waited >= T1_WAIT )) && fail "T1 not healthy after ${T1_WAIT}s — see the T1 window"
    sleep 5; (( waited += 5 ))
    (( waited % 20 == 0 )) && say "  waiting for T1… ${waited}s (health $(code_of http://localhost:8080/api/infer/health))"
  done
  ok "T1 healthy after ${waited}s — health, status and manifest all 200"
fi
keep_awake "$(t1_pid)" "T1"

section "T2 — acr-api tunnel (api.acragent.com)"
if [[ -n "$(pgrep -f 'cloudflared tunnel run --url http://localhost:8080 acr-api')" && "$(code_of https://api.acragent.com/api/infer/health)" == 200 ]]; then
  ok "T2 is already running and healthy — not started again"
else
  if [[ -z "$(pgrep -f 'cloudflared tunnel run --url http://localhost:8080 acr-api')" ]]; then
    open_window "T2 · acr-api tunnel" "cloudflared tunnel run --url http://localhost:8080 acr-api" || fail "Could not open the T2 Terminal window"
    ok "T2 window opened — connecting the tunnel"
  else
    say "T2 tunnel is running but not yet serving — waiting"
  fi
  waited=0
  until [[ "$(code_of https://api.acragent.com/api/infer/health)" == 200 ]]; do
    (( waited >= T2_WAIT )) && fail "api.acragent.com not healthy after ${T2_WAIT}s — see the T2 window"
    sleep 3; (( waited += 3 ))
    (( waited % 15 == 0 )) && say "  waiting for T2… ${waited}s (api.acragent.com $(code_of https://api.acragent.com/api/infer/health))"
  done
  ok "T2 healthy after ${waited}s — https://api.acragent.com/api/infer/health 200"
fi
[[ "$(code_of -I https://api.acragent.com/api/patients)" == 403 ]] && ok "Website protection active (non-inference path refused)" \
  || fail "Website protection rule NOT active on api.acragent.com — restore the Cloudflare rule before continuing"

section "T3 + T4 — mobile app gateway and review tunnel"
if [[ -n "$(listening 3001)" && "$(code_of https://mobile-gateway-review.acragent.com/m/v1/live)" == 200 ]]; then
  ok "T3 and T4 are already running and healthy — not started again"
else
  [[ -n "$(listening 3001)" ]] && fail "Port 3001 is in use but the mobile gateway is not healthy — run: scripts/build50-review-service.sh status"
  open_window "T3 + T4 · Build 50 review service" "cd '$REPO_DIR' && scripts/build50-review-service.sh start" || fail "Could not open the T3 + T4 Terminal window"
  ok "T3 + T4 window opened — running the seven service checks"
  waited=0
  until [[ -n "$(listening 3001)" && "$(code_of https://mobile-gateway-review.acragent.com/m/v1/live)" == 200 ]]; do
    (( waited >= T3_WAIT )) && fail "Mobile gateway not healthy after ${T3_WAIT}s — see the T3 + T4 window"
    sleep 5; (( waited += 5 ))
    (( waited % 20 == 0 )) && say "  waiting for T3 + T4… ${waited}s"
  done
  ok "T3 + T4 healthy after ${waited}s — https://mobile-gateway-review.acragent.com 200"
fi
[[ "$(code_of http://mobile-gateway-review.acragent.com/m/v1/live)" == 403 ]] && ok "Mobile gateway refuses unencrypted HTTP (403)" \
  || fail "Mobile gateway answers unencrypted HTTP — stop it with: scripts/build50-review-service.sh stop"

section "T5L — local CDS results record (sync every ${T5L_WATCH}s)"
if [[ "$PLATFORM_DIR" != "$T1_V21_DIR" ]]; then
  say "Skipped: the live T1 before v2.1 writes no outbox, so there is nothing for T5L to import."
elif [[ -n "$(t5l_pid)" ]]; then
  ok "T5L sync is already running (PID $(t5l_pid)) — not started again"
else
  [[ -f "$T5L_DIR/t5l/config.json" ]] || fail "T5L config not found: $T5L_DIR/t5l/config.json"
  # One pass first, here, so a fault shows now rather than in a window nobody reads.
  first="$(cd "$T5L_DIR" && "$T5L_PY" -m t5l.sync 2>&1)" || fail "T5L sync pass failed: $(print -r -- "$first" | tail -1)"
  ok "T5L first pass: ${first#SYNC }"
  open_window "T5L · sync every ${T5L_WATCH}s" "cd '$T5L_DIR' && '$T5L_PY' -m t5l.sync --watch $T5L_WATCH" || fail "Could not open the T5L Terminal window"
  for i in $(seq 1 10); do [[ -n "$(t5l_pid)" ]] && break; sleep 1; done
  [[ -n "$(t5l_pid)" ]] && ok "T5L sync running (PID $(t5l_pid)) — record: $(sed -n 's/.*"db": *"\([^"]*\)".*/\1/p' "$T5L_DIR/t5l/config.json")" \
    || fail "T5L sync window opened but the sync is not running — see the T5L window"
fi

section "All services are up"
ok "ACR Platform website back end: https://api.acragent.com"
ok "ACR Companion mobile app service: https://mobile-gateway-review.acragent.com"
ok "The MacBook stays awake while T1 and the mobile gateway (T3) run"
say "The screen is still free to sleep — only the machine is held awake."
say "Keep it on mains power: the -s assertion does not apply on battery, and a"
say "closed lid sleeps the Mac whatever caffeinate says."
print -P "\n%BTo stop everything in order:%b  $REPO_DIR/scripts/acr-services.sh stop"
print "  or by hand:"
print "  1. T5L:      Ctrl+C in the 'T5L · sync' window"
print "  2. T3 + T4:  cd $REPO_DIR && scripts/build50-review-service.sh stop"
print "  3. T2:       Ctrl+C in the 'T2 · acr-api tunnel' window"
print "  4. T1:       Ctrl+C in the 'T1 · ACR Platform' window"

section "Quick status — scripts/quiet-check.sh"
say "Reads the four services and T3's own log, and shows the last reviewer activity"
say "and the live sessions. Read-only: it changes nothing and contacts no reviewer."
"$REPO_DIR/scripts/quiet-check.sh"

section "T3 traffic tab — scripts/acr-log-push.sh once"
say "Sends the latest T3 gateway activity to www.acragent.com and www.blockenergy.net,"
say "so the T3 traffic tab in mobile-review.php shows current data. One push, then it"
say "exits. Reads the log only; it never touches T1 to T4. Run it again before viewing"
say "the tab later: cd $REPO_DIR && scripts/acr-log-push.sh once"
"$REPO_DIR/scripts/acr-log-push.sh" once



