#!/bin/zsh
# ACR services — one command for the full stack, in order, each step checked healthy
# before the next starts:
#
#   T1  ACR Platform (Spring Boot, :8080)          → ACR Platform website back end
#   T2  acr-api tunnel → api.acragent.com           → website traffic to T1
#   T3  Build 47 gateway, 127.0.0.1:3001            → ACR Companion mobile app
#   T4  acr-mobile-review tunnel                    → mobile-gateway-review.acragent.com
#
#   scripts/acr-services.sh start       start whatever is not running, T1 → T2 → T3+T4
#   scripts/acr-services.sh status      read-only health of T1–T4
#   scripts/acr-services.sh stop        stop T4+T3, then T2, then T1
#   scripts/acr-services.sh preflight   read-only: tools, folders and ports, nothing started
#
# T3+T4 are started and stopped by scripts/build47-review-service.sh (its seven checks),
# which also keeps the Mac awake for as long as the gateway runs.
# T1 and T2 run in the background with their logs in ~/.acr-gateway/logs/; they no longer
# need their own Terminal windows. A service already running and healthy is left as it is.
#
# Written for Kraken to run (16 September 2026). Runbook:
# docs/operations/BUILD47_REVIEW_SERVICE_RUNBOOK.md

emulate -L zsh
setopt PIPE_FAIL

REPO_DIR="${0:A:h:h}"
PLATFORM_DIR="${ACR_PLATFORM_DIR:-/Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface}"
REVIEW_SCRIPT="$REPO_DIR/scripts/build47-review-service.sh"
STATE_DIR="$HOME/.acr-gateway"
LOG_DIR="$STATE_DIR/logs"
RUN_DIR="$STATE_DIR/run"
PLATFORM_LOCAL="http://localhost:8080"
PLATFORM_PUBLIC="https://api.acragent.com"
REVIEW_PUBLIC="https://mobile-gateway-review.acragent.com"
T1_TIMEOUT="${T1_TIMEOUT:-300}"    # seconds for Spring Boot and the ontology to load
T2_TIMEOUT="${T2_TIMEOUT:-120}"    # seconds for the tunnel to serve api.acragent.com
T1_MATCH='spring-boot:run.*-Dspring-boot.run.profiles=hybrid'
T2_MATCH='cloudflared tunnel run --url http://localhost:8080 acr-api'

ok()   { print -P "  %F{green}PASS%f  $*"; }
bad()  { print -P "  %F{red}FAIL%f  $*"; }
note() { print "        $*"; }
step() { print -P "\n%B$*%b"; }
die()  { bad "$*"; print "\nStopped. Nothing after this step was started."; exit 1; }
code_of() { curl -s -o /dev/null --max-time 10 -w '%{http_code}' "$@" 2>/dev/null || print 000; }
listener_pid() { lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null | head -1; }
t2_pid() { pgrep -f "$T2_MATCH" | head -1; }
utc() { date -u +%Y%m%dT%H%M%SZ; }

# T1 is ready when the three routes the website and the gateway's attestation use all answer.
t1_ready() {
  [[ "$(code_of $PLATFORM_LOCAL/api/infer/health)" == 200 \
    && "$(code_of $PLATFORM_LOCAL/api/ontolator/status)" == 200 \
    && "$(code_of $PLATFORM_LOCAL/api/ontolator/manifest)" == 200 ]]
}

preflight() {
  step "0. Preflight (read-only)"
  local tool rc=0
  for tool in mvn cloudflared curl lsof caffeinate; do
    if command -v $tool >/dev/null 2>&1; then ok "$tool: $(command -v $tool)"
    else bad "$tool not found on PATH — run this from your normal Terminal"; rc=1; fi
  done
  if [[ -x /usr/libexec/java_home ]] && /usr/libexec/java_home -v 21 >/dev/null 2>&1; then ok "JDK 21: $(/usr/libexec/java_home -v 21)"
  else bad "JDK 21 not found"; rc=1; fi
  [[ -f "$PLATFORM_DIR/pom.xml" ]] && ok "platform: $PLATFORM_DIR" || { bad "platform pom.xml not found in $PLATFORM_DIR"; rc=1; }
  [[ -x "$REVIEW_SCRIPT" ]] && ok "review service script: $REVIEW_SCRIPT" || { bad "not executable: $REVIEW_SCRIPT"; rc=1; }
  [[ -f "$HOME/.cloudflared/acr-mobile-review.yml" && -f "$HOME/.cloudflared/cert.pem" ]] && ok "Cloudflare tunnel configuration present" || { bad "~/.cloudflared configuration incomplete"; rc=1; }
  mkdir -p "$LOG_DIR" "$RUN_DIR" && chmod 700 "$STATE_DIR" "$LOG_DIR" "$RUN_DIR" && ok "logs: $LOG_DIR"
  local p
  for p in 8080 3001; do
    local pid=$(listener_pid $p)
    if [[ -n "$pid" ]]; then note "port $p in use by PID $pid ($(ps -o comm= -p $pid 2>/dev/null)) — kept if it is the healthy service"
    else ok "port $p free"; fi
  done
  return $rc
}

start_t1() {
  step "1. T1 — ACR Platform (Spring Boot, :8080)"
  if t1_ready; then ok "already running and healthy (PID $(listener_pid 8080)) — left as it is"; return 0; fi
  local held=$(listener_pid 8080)
  [[ -n "$held" ]] && die "port 8080 is held by PID $held ($(ps -o command= -p $held | cut -c1-80)) but the platform is not healthy — check it, then run again"

  local log="$LOG_DIR/t1-platform-$(utc).log"
  ( cd "$PLATFORM_DIR" && JAVA_HOME="$(/usr/libexec/java_home -v 21)" exec nohup mvn spring-boot:run -Dspring-boot.run.profiles=hybrid ) >"$log" 2>&1 &
  local pid=$!
  print $pid >"$RUN_DIR/t1.pid"
  ok "started mvn spring-boot:run (PID $pid)"
  note "log: $log"

  local waited=0
  while (( waited < T1_TIMEOUT )); do
    if t1_ready; then ok "healthy after ${waited}s: /api/infer/health, /api/ontolator/status and /manifest all 200"; return 0; fi
    kill -0 $pid 2>/dev/null || { tail -15 "$log"; die "T1 exited during start — see $log"; }
    sleep 5; (( waited += 5 ))
    (( waited % 30 == 0 )) && note "waiting for T1… ${waited}s (health $(code_of $PLATFORM_LOCAL/api/infer/health))"
  done
  tail -15 "$log"
  die "T1 not healthy after ${T1_TIMEOUT}s — it is still starting in the background (PID $pid); check $log, then run 'start' again"
}

start_t2() {
  step "2. T2 — acr-api tunnel → api.acragent.com"
  local pid=$(t2_pid) c
  if [[ -n "$pid" ]]; then
    c=$(code_of $PLATFORM_PUBLIC/api/infer/health)
    [[ "$c" == 200 ]] && { ok "already running and healthy (PID $pid) — left as it is"; check_edge; return; }
    note "connector running (PID $pid) but public health is $c — waiting for it to connect"
  else
    local log="$LOG_DIR/t2-acr-api-$(utc).log"
    nohup cloudflared tunnel run --url http://localhost:8080 acr-api >"$log" 2>&1 &
    pid=$!
    print $pid >"$RUN_DIR/t2.pid"
    ok "started cloudflared acr-api (PID $pid)"
    note "log: $log"
  fi

  local waited=0
  while (( waited < T2_TIMEOUT )); do
    c=$(code_of $PLATFORM_PUBLIC/api/infer/health)
    if [[ "$c" == 200 ]]; then ok "public health 200 after ${waited}s: https://api.acragent.com/api/infer/health"; check_edge; return; fi
    kill -0 $pid 2>/dev/null || die "T2 exited during start (last public status $c) — see the newest t2-acr-api log in $LOG_DIR"
    sleep 3; (( waited += 3 ))
  done
  die "api.acragent.com not healthy after ${T2_TIMEOUT}s (last status $c; 530 = tunnel not connected)"
}

# The website depends on this Cloudflare rule; the review service refuses to start without it.
check_edge() {
  local c=$(code_of -I $PLATFORM_PUBLIC/api/patients)
  [[ "$c" == 403 ]] && ok "edge allow-list active: non-inference path refused (403)" \
    || die "edge allow-list NOT active (non-inference path answered $c) — restore the Cloudflare WAF rule first"
}

start_t3_t4() {
  step "3. T3 + T4 — Build 47 gateway and review tunnel"
  local gp=$(listener_pid 3001)
  if [[ -n "$gp" && "$(code_of $REVIEW_PUBLIC/m/v1/live)" == 200 ]]; then
    ok "already running and healthy (gateway PID $gp) — left as it is"; return 0
  fi
  [[ -n "$gp" ]] && die "port 3001 is held (PID $gp) but the review endpoint is not healthy — run '$REVIEW_SCRIPT status', or 'stop' then 'start'"
  "$REVIEW_SCRIPT" start || die "the review service did not start — see its output above"
}

start_all() {
  print -P "%BACR services — start ($(date -u +%FT%TZ))%b"
  preflight || die "preflight failed"
  start_t1
  start_t2
  start_t3_t4
  step "All four services are up."
  note "Website back end: $PLATFORM_PUBLIC  ·  Mobile app: $REVIEW_PUBLIC"
  note "The Mac stays awake while the gateway (T3) runs."
  note "Status: scripts/acr-services.sh status  ·  Stop everything: scripts/acr-services.sh stop"
}

status_all() {
  print -P "%BACR services — status ($(date -u +%FT%TZ))%b"
  step "T1 — ACR Platform"
  local pid=$(listener_pid 8080)
  if t1_ready; then ok "healthy (PID $pid)"
  else bad "not healthy: health $(code_of $PLATFORM_LOCAL/api/infer/health) · status $(code_of $PLATFORM_LOCAL/api/ontolator/status) · manifest $(code_of $PLATFORM_LOCAL/api/ontolator/manifest)${pid:+ · port 8080 PID $pid}"; fi
  step "T2 — acr-api tunnel"
  pid=$(t2_pid)
  local c=$(code_of $PLATFORM_PUBLIC/api/infer/health)
  [[ -n "$pid" && "$c" == 200 ]] && ok "healthy (PID $pid): api.acragent.com 200" || bad "connector ${pid:-not running} · api.acragent.com $c"
  step "T3 / T4 — review service"
  "$REVIEW_SCRIPT" status 2>&1 | sed -n '/T3 \/ T4/,$p' | tail -n +2
}

stop_pid() {  # stop_pid <label> <pid> <seconds>
  local label=$1 pid=$2 secs=$3 waited=0
  kill -TERM $pid 2>/dev/null || return 0
  while kill -0 $pid 2>/dev/null && (( waited < secs )); do sleep 1; (( waited++ )); done
  if kill -0 $pid 2>/dev/null; then bad "$label (PID $pid) still running after ${secs}s — stop it by hand: kill $pid"; return 1; fi
  ok "$label stopped (PID $pid)"
}

stop_all() {
  print -P "%BACR services — stop ($(date -u +%FT%TZ))%b"
  step "1. T4 + T3"
  "$REVIEW_SCRIPT" stop 2>&1 | grep -E "PASS|FAIL|not running|public HTTPS"

  step "2. T2 — acr-api tunnel"
  local pid=$(t2_pid)
  if [[ -n "$pid" ]]; then stop_pid "acr-api tunnel" $pid 15; else note "T2 was not running"; fi

  step "3. T1 — ACR Platform"
  local mvn_pid=$(pgrep -f "$T1_MATCH" | head -1) java_pid=$(listener_pid 8080)
  if [[ -n "$java_pid" ]] && ! ps -o command= -p $java_pid | grep -q java; then
    bad "port 8080 is held by a non-Java program (PID $java_pid) — not touched"; java_pid=""
  fi
  [[ -z "$mvn_pid" && -z "$java_pid" ]] && note "T1 was not running"
  [[ -n "$java_pid" ]] && stop_pid "platform JVM on :8080" $java_pid 45
  [[ -n "$mvn_pid" ]] && kill -0 $mvn_pid 2>/dev/null && stop_pid "mvn spring-boot:run" $mvn_pid 15
  rm -f "$RUN_DIR/t1.pid" "$RUN_DIR/t2.pid"

  step "Check"
  note "port 8080: $([[ -n $(listener_pid 8080) ]] && print 'still in use' || print free) · port 3001: $([[ -n $(listener_pid 3001) ]] && print 'still in use' || print free)"
  note "api.acragent.com: $(code_of $PLATFORM_PUBLIC/api/infer/health) · review endpoint: $(code_of $REVIEW_PUBLIC/m/v1/live)  (530 = stopped, expected)"
}

case "${1:-}" in
  start)     start_all ;;
  status)    status_all ;;
  stop)      stop_all ;;
  preflight) preflight ;;
  *) print "usage: scripts/acr-services.sh start | status | stop | preflight"; exit 2 ;;
esac
