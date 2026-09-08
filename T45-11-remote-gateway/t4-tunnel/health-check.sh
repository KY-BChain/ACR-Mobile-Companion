#!/bin/bash
# Read-only T4 runtime evidence for an already owner-approved deployment.
set -u

HOSTNAME="${ACR_MOBILE_HOSTNAME:-mobile.acragent.com}"
T3_URL="${ACR_T3_URL:-http://127.0.0.1:3001}"
failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }
status() {
  curl --silent --show-error --connect-timeout 5 --max-time 12 \
    --output /dev/null --write-out '%{http_code}' "$1" 2>/dev/null || printf '000'
}

if pgrep -f 'cloudflared.*acr-mobile-gateway-t4' >/dev/null; then pass 'T4 process'; else fail 'T4 process'; fi
if [ "$(status "${T3_URL}/m/v1/live")" = 200 ]; then pass 'T3 loopback live'; else fail 'T3 loopback live'; fi
if [ "$(status "https://${HOSTNAME}/m/v1/live")" = 200 ]; then pass 'remote HTTPS live'; else fail 'remote HTTPS live'; fi
for path in /admin /x/m/v1/live /m/v1/liveevil /m/v1/live/ /m/v1/infer/extra; do
  code="$(status "https://${HOSTNAME}${path}")"
  if [ "$code" = 404 ]; then pass "deny ${path}"; else fail "deny ${path} returned ${code}"; fi
done

cert_file="$(mktemp -t acr-t45-cert.XXXXXX)" || exit 1
trap 'rm -f "$cert_file"' EXIT
if openssl s_client -connect "${HOSTNAME}:443" -servername "$HOSTNAME" -verify_hostname "$HOSTNAME" -verify_return_error </dev/null 2>/dev/null \
  | openssl x509 -outform PEM >"$cert_file" 2>/dev/null \
  && openssl x509 -in "$cert_file" -checkend 1209600 -noout >/dev/null 2>&1; then
  pass 'TLS verification and >14-day certificate life'
else
  fail 'TLS verification and >14-day certificate life'
fi

if [ "$failures" -ne 0 ]; then echo "Health check failed: ${failures} check(s)." >&2; exit 1; fi
echo 'Health check passed; auth, privacy, edge-policy and off-LAN tests remain separate gates.'
