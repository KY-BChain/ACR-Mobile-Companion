#!/bin/bash
# T45-11 T4 preflight. It intentionally performs no login, DNS, tunnel or
# launchd mutation. Phase-B deployment needs a signed ADR and explicit owner GO.
set -euo pipefail

if [ "${1:-}" != "--preflight" ]; then
  echo "DEPLOYMENT BLOCKED. Use --preflight for read-only checks." >&2
  exit 78
fi

failures=0
check() {
  if "$@" >/dev/null 2>&1; then printf 'PASS  %s\n' "$*";
  else printf 'FAIL  %s\n' "$*" >&2; failures=$((failures + 1)); fi
}

check command -v cloudflared
check command -v curl
check command -v openssl
check cloudflared --version
check cloudflared tunnel --config "$(dirname "$0")/cloudflared-config.yml" ingress validate
check plutil -lint "$(dirname "$0")/com.cloudflare.cloudflared.acr-mobile-review.plist"

if [ "$failures" -ne 0 ]; then
  echo "Preflight failed: ${failures} check(s). No changes were made." >&2
  exit 1
fi
echo "Preflight passed. No changes were made and no deployment is approved."
