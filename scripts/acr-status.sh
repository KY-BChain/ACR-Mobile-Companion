#!/bin/zsh
#
#   scripts/acr-status.sh     check T1, T2, T3 and T4 without changing anything
#
# Read-only: it sends health requests and lists processes. It never starts, stops
# or signals a service. To start a service that is down, use acr-services.sh.
# Exit status is 0 when every check passes, 1 otherwise.

ok()   { print -P "  %F{green}✔%f $*"; }
bad()  { print -P "  %F{red}✘%f $*"; failed=1; }
code_of() { curl -s -o /dev/null --max-time 10 -w '%{http_code}' "$@" 2>/dev/null || print 000; }
expect() { local want="$1" label="$2"; shift 2; local got="$(code_of "$@")"
  [[ "$got" == "$want" ]] && ok "$label ($got)" || bad "$label (got $got, expected $want)"; }
uptime_of() { local pid="$(pgrep -f "$1" | head -1)"
  [[ -n "$pid" ]] && print "PID $pid, up $(ps -o etime= -p "$pid" | tr -d ' ')" || print "no process"; }

failed=0
print -P "%BACR services status%b  ($(date '+%d %b %Y %H:%M'))"

print -P "\n%BT1 — ACR Platform, port 8080%b  [$(uptime_of 'java.*ACR-Ontology-Interface/target/classes')]"
expect 200 "inference health"  http://localhost:8080/api/infer/health
expect 200 "ontolator status"  http://localhost:8080/api/ontolator/status
expect 200 "ontolator manifest" http://localhost:8080/api/ontolator/manifest

print -P "\n%BT2 — acr-api tunnel, api.acragent.com%b  [$(uptime_of 'cloudflared tunnel run --url http://localhost:8080 acr-api')]"
expect 200 "public inference health" https://api.acragent.com/api/infer/health
expect 403 "website protection (non-inference path refused)" -I https://api.acragent.com/api/patients

print -P "\n%BT3 + T4 — gateway and acr-mobile-review tunnel%b"
print "  T3 [$(uptime_of 'node src/listener.js')]  T4 [$(uptime_of 'acr-mobile-review')]"
expect 200 "mobile gateway (HTTPS)" https://mobile-gateway-review.acragent.com/m/v1/live
expect 403 "mobile gateway refuses plain HTTP" http://mobile-gateway-review.acragent.com/m/v1/live

print
(( failed )) && print -P "%F{red}One or more checks failed.%f Nothing was changed." || print -P "%F{green}All four services are up and serving normally.%f"
exit $failed
