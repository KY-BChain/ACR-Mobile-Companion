#!/usr/bin/env bash
# Build 49 remote-review service: T3 (gateway, 127.0.0.1:3001) + T4 (acr-mobile-review tunnel).
#
#   scripts/build49-review-service.sh start    checked start: T1/T2 checks, then T3, then T4
#   scripts/build49-review-service.sh status   read-only health of T1-T4
#   scripts/build49-review-service.sh stop     stop T4, then T3
#
# T1 (Spring Boot, :8080) and T2 (acr-api tunnel) are only ever CHECKED. This
# script never starts, stops or restarts them.
#
# Runbook: docs/operations/BUILD49_REVIEW_SERVICE_RUNBOOK.md
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GATEWAY_DIR="$REPO_DIR/gateway"
STATE_DIR="$HOME/.acr-gateway"
AUTH_DIR="${ACR_AUTH_DIR:-${ACR45_AUTH_DIR:-$STATE_DIR/gate10}}"
RUN_DIR="$STATE_DIR/run"
LOG_DIR="$STATE_DIR/logs"
PUBLIC_HOST="mobile-gateway-review.acragent.com"
TUNNEL_NAME="acr-mobile-review"
TUNNEL_CONFIG="$HOME/.cloudflared/acr-mobile-review.yml"
PLATFORM_ORIGIN="https://api.acragent.com"
ONTOLOGY_PATH="${ACR45_ONTOLOGY_PATH:-/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl}"
PORT=3001
CLIENT_BUILD_ID="mob-v0.6.7+49"
# Build 49 changeover: a Build 48 session keeps working and moves to Build 49
# at the next refresh from the updated app. The app ID is unchanged since
# Build 47, so every phone updates in place and keeps its pairing.
# Set to "" once no Build 47 phone remains.
PREVIOUS_CLIENT_BUILD_IDS="${ACR_PREVIOUS_CLIENT_BUILD_IDS-mob-v0.6.7+48}"
# Build 49: the verified synthetic demonstration fixture, captured from
# the live platform for this build ID. Used only when the directory exists; the
# gateway refuses to start if a configured fixture fails verification.
FIXTURE_DIR="${ACR_SYNTHETIC_FIXTURE_DIR-$STATE_DIR/fixtures/demo-$CLIENT_BUILD_ID}"

ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$*"; }
bad()  { printf '  \033[31mFAIL\033[0m  %s\n' "$*"; }
note() { printf '        %s\n' "$*"; }
step() { printf '\n\033[1m%s\033[0m\n' "$*"; }
die()  { bad "$*"; printf '\nStopped at the first failed check.\n'; exit 1; }
code_of() { curl -s -o /dev/null --max-time 15 -w '%{http_code}' "$@" 2>/dev/null || true; }
gateway_pid() { lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | head -1; }
tunnel_pid()  { pgrep -f "cloudflared tunnel --config .*acr-mobile-review\.yml run $TUNNEL_NAME" | head -1; }
is_gateway()  { ps -p "$1" -o command= 2>/dev/null | grep -q 'src/listener.js'; }

use_node() {
  if ! command -v node >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
    set +u
    # shellcheck disable=SC1091
    . "$HOME/.nvm/nvm.sh" && nvm use 22 >/dev/null 2>&1
    set -u
  fi
  command -v node >/dev/null 2>&1 || die "node not found — install Node 22.5+ (nvm install 22)"
  node -e 'require("node:sqlite")' >/dev/null 2>&1 || die "node $(node --version) has no node:sqlite — Node 22.5+ is required"
  ok "Node $(node --version) with node:sqlite"
}

check_files() {
  local f
  for f in "$GATEWAY_DIR/src/listener.js" "$GATEWAY_DIR/node_modules" "$AUTH_DIR/auth.db" \
           "$AUTH_DIR/pepper.bin" "$TUNNEL_CONFIG" "$ONTOLOGY_PATH"; do
    [ -e "$f" ] || die "missing: $f"
  done
  [ "$(stat -f '%Lp' "$AUTH_DIR/pepper.bin")" = 600 ] || die "$AUTH_DIR/pepper.bin must be owner-only (chmod 600)"
  command -v cloudflared >/dev/null 2>&1 || die "cloudflared is not installed"
  ok "gateway code, auth store, pepper (0600), tunnel config and ontology present"
}

# Read-only. Returns non-zero if T1/T2 are not ready or the edge allow-list is missing.
check_platform() {
  local rc=0 c
  c=$(code_of http://localhost:8080/api/infer/health)
  if [ "$c" = 200 ]; then ok "T1 platform local health: 200"
  else bad "T1 platform local health: $c — start T1 first (this script never starts T1)"; rc=1; fi
  if pgrep -f 'cloudflared.*acr-api' >/dev/null; then ok "T2 acr-api connector running"
  else bad "T2 acr-api connector not running — start T2 first (this script never starts T2)"; rc=1; fi
  c=$(code_of "$PLATFORM_ORIGIN/api/infer/health")
  if [ "$c" = 200 ]; then
    ok "T2 public health: 200"
    # Header-only probe: the edge allow-list must refuse non-inference paths.
    c=$(code_of -I "$PLATFORM_ORIGIN/api/patients")
    if [ "$c" = 403 ]; then ok "edge allow-list active: non-inference platform path refused (403)"
    else bad "edge allow-list NOT active: non-inference path answered $c — restore the Cloudflare WAF rule before any review traffic"; rc=1; fi
  else bad "T2 public health: $c"; rc=1; fi
  return $rc
}

stop_services() {
  local tp gp
  tp=$(tunnel_pid)
  if [ -n "$tp" ]; then kill "$tp" && ok "T4 tunnel stopped (PID $tp)"; else note "T4 tunnel was not running"; fi
  gp=$(gateway_pid)
  if [ -n "$gp" ]; then
    if is_gateway "$gp"; then kill "$gp" && ok "T3 gateway stopped (PID $gp)"
    else bad "port $PORT is held by another program (PID $gp) — not touched"; fi
  else note "T3 gateway was not running"; fi
  rm -f "$RUN_DIR/gateway.pid" "$RUN_DIR/tunnel.pid"
}

start() {
  local c gp tp i stamp glog tlog
  step "Build 49 review service — checked start ($(date -u +%FT%TZ))"

  step "1. Prerequisites"
  check_files
  use_node

  step "2. T1 / T2 (read-only)"
  check_platform || die "T1 / T2 are not ready — fix them first"

  step "3. Port $PORT"
  gp=$(gateway_pid)
  if [ -n "$gp" ]; then
    if is_gateway "$gp"; then die "a gateway is already running (PID $gp) — run 'status', or 'stop' first"
    else die "port $PORT is used by another program (PID $gp)"; fi
  fi
  ok "port $PORT is free"

  step "4. Start T3 gateway (loopback only)"
  mkdir -p "$RUN_DIR" "$LOG_DIR" && chmod 700 "$STATE_DIR" "$RUN_DIR" "$LOG_DIR"
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  glog="$LOG_DIR/gateway-$stamp.log"
  local fixture_env=()
  if [ -n "$FIXTURE_DIR" ] && [ -d "$FIXTURE_DIR" ]; then
    fixture_env=(ACR_SYNTHETIC_FIXTURE_DIR="$FIXTURE_DIR")
    ok "synthetic demo fixture: $FIXTURE_DIR"
  else
    note "no synthetic demo fixture for $CLIENT_BUILD_ID — Synthetic demo will answer 'unavailable'"
  fi
  ( cd "$GATEWAY_DIR" && exec env ${fixture_env[@]+"${fixture_env[@]}"} \
      ACR_GATEWAY_HOST=127.0.0.1 ACR_GATEWAY_PORT="$PORT" \
      ACR_EXPECTED_CLIENT_BUILD_ID="$CLIENT_BUILD_ID" \
      ACR_PREVIOUS_CLIENT_BUILD_IDS="$PREVIOUS_CLIENT_BUILD_IDS" \
      ACR_PUBLIC_HOSTNAME="$PUBLIC_HOST" \
      ACR_UPSTREAM_INFER_URL="$PLATFORM_ORIGIN/api/infer" \
      ACR_EVIDENCE_HEALTH_URL="$PLATFORM_ORIGIN/api/infer/health" \
      ACR_EVIDENCE_STATUS_URL="$PLATFORM_ORIGIN/api/ontolator/status" \
      ACR_EVIDENCE_MANIFEST_URL="$PLATFORM_ORIGIN/api/ontolator/manifest" \
      ACR_EVIDENCE_ONTOLOGY_PATH="$ONTOLOGY_PATH" \
      ACR_UPSTREAM_TIMEOUT_MS=8000 \
      ACR_AUTH_STORE_PATH="$AUTH_DIR/auth.db" \
      ACR_AUTH_PEPPER_PATH="$AUTH_DIR/pepper.bin" \
      nohup node src/listener.js ) >"$glog" 2>&1 &
  echo $! >"$RUN_DIR/gateway.pid"
  for i in $(seq 1 20); do [ -n "$(gateway_pid)" ] && break; sleep 1; done
  gp=$(gateway_pid)
  [ -n "$gp" ] || { tail -5 "$glog"; die "gateway did not start — see $glog"; }
  ok "gateway listening on 127.0.0.1:$PORT (PID $gp)"
  note "log: $glog"

  step "5. Local gateway checks"
  c=$(code_of -H "Host: $PUBLIC_HOST" -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT/m/v1/live")
  [ "$c" = 200 ] || { stop_services; die "local check with edge headers returned $c (expected 200)"; }
  ok "local request as the edge forwards it: 200"
  c=$(code_of "http://127.0.0.1:$PORT/m/v1/live")
  case "$c" in
    403|421) ok "local request without edge headers refused ($c) — TLS / host backstop active" ;;
    *) stop_services; die "local request without edge headers returned $c (expected 403 or 421)" ;;
  esac

  step "6. Start T4 tunnel ($TUNNEL_NAME)"
  tp=$(tunnel_pid)
  if [ -n "$tp" ]; then ok "tunnel already running (PID $tp)"
  else
    tlog="$LOG_DIR/tunnel-$stamp.log"
    nohup cloudflared tunnel --config "$TUNNEL_CONFIG" run "$TUNNEL_NAME" >"$tlog" 2>&1 &
    echo $! >"$RUN_DIR/tunnel.pid"
    ok "tunnel started (PID $!)"
    note "log: $tlog"
  fi

  step "7. Public checks"
  c=000
  for i in $(seq 1 20); do
    c=$(code_of "https://$PUBLIC_HOST/m/v1/live"); [ "$c" = 200 ] && break; sleep 3
  done
  [ "$c" = 200 ] || { stop_services; die "public HTTPS returned $c after 60 s (530 = tunnel not connected)"; }
  ok "public HTTPS /m/v1/live: 200"
  c=$(code_of "http://$PUBLIC_HOST/m/v1/live")
  [ "$c" = 403 ] || { stop_services; die "public HTTP returned $c — cleartext is NOT blocked at the edge (AT-14). Service stopped; restore the WAF rule"; }
  ok "public HTTP refused at the edge: 403"
  c=$(code_of "https://$PUBLIC_HOST/m/v1/not-a-route")
  [ "$c" = 404 ] && ok "unknown route denied by the tunnel ingress: 404" || bad "unknown route returned $c (expected 404)"

  caffeinate -ims -w "$gp" >/dev/null 2>&1 &
  ok "Mac kept awake while the gateway runs"

  step "Service is up."
  note "Phones: open ACR Companion — it reconnects by itself (no invite code) and shows VERIFIED."
  note "The first assessment after the platform has been idle may time out once; retry."
  note "Stop with: scripts/build49-review-service.sh stop"
}

stop() {
  step "Build 49 review service — stop ($(date -u +%FT%TZ))"
  stop_services
  sleep 2
  [ -z "$(gateway_pid)" ] && ok "port $PORT free" || bad "port $PORT still in use"
  note "public HTTPS now: $(code_of "https://$PUBLIC_HOST/m/v1/live") (530 = service down, expected)"
  note "T1 and T2 were not touched."
}

status() {
  local gp tp
  step "Build 49 review service — status ($(date -u +%FT%TZ))"
  step "T1 / T2 (read-only)"
  check_platform || true
  step "T3 / T4"
  gp=$(gateway_pid); tp=$(tunnel_pid)
  if [ -n "$gp" ] && is_gateway "$gp"; then ok "T3 gateway listening on 127.0.0.1:$PORT (PID $gp)"
  elif [ -n "$gp" ]; then bad "port $PORT held by another program (PID $gp)"
  else bad "T3 gateway not running"; fi
  if [ -n "$tp" ]; then ok "T4 tunnel running (PID $tp)"; else bad "T4 tunnel not running"; fi
  note "public HTTPS /m/v1/live: $(code_of "https://$PUBLIC_HOST/m/v1/live")  (200 up · 530 tunnel down)"
  note "public HTTP  /m/v1/live: $(code_of "http://$PUBLIC_HOST/m/v1/live")  (must be 403)"
  note "logs: $LOG_DIR"
}

case "${1:-}" in
  start)  start ;;
  stop)   stop ;;
  status) status ;;
  *) printf 'usage: %s start|status|stop\n' "$0"; exit 2 ;;
esac
