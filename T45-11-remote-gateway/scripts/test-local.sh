#!/bin/bash
set -euo pipefail
MODULE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "${MODULE_DIR}/.." && pwd)"

node --check "${MODULE_DIR}/t3-gateway/persistent-auth.js"
node --check "${MODULE_DIR}/t3-gateway/invite-admin.js"
node --check "${MODULE_DIR}/t3-gateway/rate-limit.js"
node --check "${MODULE_DIR}/t3-gateway/server.js"
bash -n "${MODULE_DIR}/t4-tunnel/setup-cloudflared.sh"
bash -n "${MODULE_DIR}/t4-tunnel/health-check.sh"
plutil -lint "${MODULE_DIR}/t4-tunnel/com.cloudflare.cloudflared.acr-mobile-review.plist"
xmllint --noout "${MODULE_DIR}/mobile/android-network-security-config.xml"
node --test "${MODULE_DIR}/tests/persistent-auth.test.js" "${MODULE_DIR}/tests/module-static.test.js" "${MODULE_DIR}/tests/remote-app.integration.test.js"
(cd "${REPO_DIR}" && npx --no-install tsc --noEmit -p T45-11-remote-gateway/tsconfig.json)

if [ -d "${REPO_DIR}/gateway/node_modules" ]; then
  (cd "${REPO_DIR}/gateway" && npm test)
else
  echo 'SKIP gateway Jest/e2e: run (cd gateway && npm ci) first.'
fi
