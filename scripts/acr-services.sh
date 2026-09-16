#!/bin/zsh

REPO_DIR="${0:A:h:h}"
PLATFORM_DIR="/Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface"
REVIEW_SCRIPT="$REPO_DIR/scripts/build47-review-service.sh"
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

print -P "%BACR services — T1 → T2 → T3 + T4%b  ($(date '+%d %b %Y %H:%M'))"

section "Checks"
command -v mvn >/dev/null && ok "Maven found" || fail "Maven (mvn) not found"
command -v cloudflared >/dev/null && ok "cloudflared found" || fail "cloudflared not found"
[[ -f "$PLATFORM_DIR/pom.xml" ]] && ok "ACR Platform folder found" || fail "ACR Platform folder not found: $PLATFORM_DIR"
[[ -x "$REVIEW_SCRIPT" ]] && ok "Build 47 review service script found" || fail "Review service script not found: $REVIEW_SCRIPT"

section "T1 — ACR Platform (Spring Boot, port 8080)"
if t1_ready; then
  ok "T1 is already running and healthy — not started again"
else
  [[ -n "$(listening 8080)" ]] && fail "Port 8080 is in use but T1 is not healthy — check the program on port 8080 first"
  open_window "T1 · ACR Platform" "cd '$PLATFORM_DIR' && mvn spring-boot:run -Dspring-boot.run.profiles=hybrid" || fail "Could not open the T1 Terminal window"
  ok "T1 window opened — starting Spring Boot and loading the ontology"
  waited=0
  until t1_ready; do
    (( waited >= T1_WAIT )) && fail "T1 not healthy after ${T1_WAIT}s — see the T1 window"
    sleep 5; (( waited += 5 ))
    (( waited % 20 == 0 )) && say "  waiting for T1… ${waited}s (health $(code_of http://localhost:8080/api/infer/health))"
  done
  ok "T1 healthy after ${waited}s — health, status and manifest all 200"
fi

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
  [[ -n "$(listening 3001)" ]] && fail "Port 3001 is in use but the mobile gateway is not healthy — run: scripts/build47-review-service.sh status"
  open_window "T3 + T4 · Build 47 review service" "cd '$REPO_DIR' && scripts/build47-review-service.sh start" || fail "Could not open the T3 + T4 Terminal window"
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
  || fail "Mobile gateway answers unencrypted HTTP — stop it with: scripts/build47-review-service.sh stop"

section "All services are up"
ok "ACR Platform website back end: https://api.acragent.com"
ok "ACR Companion mobile app service: https://mobile-gateway-review.acragent.com"
ok "The MacBook stays awake while the mobile gateway (T3) runs"
print -P "\n%BTo stop, in this order:%b"
print "  1. T3 + T4:  cd $REPO_DIR && scripts/build47-review-service.sh stop"
print "  2. T2:       Ctrl+C in the 'T2 · acr-api tunnel' window"
print "  3. T1:       Ctrl+C in the 'T1 · ACR Platform' window"
