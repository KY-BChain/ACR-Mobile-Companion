'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { SqliteAuthService } = require('../src/auth/session-store');
const { openAuthDatabase } = require('../src/auth/db');
const { issue, revoke, init } = require('../src/auth/invite-admin');

/**
 * Test scaffolding for the Build 45 SQLite auth store.
 *
 * Each call gets its own temporary directory, so tests never share state and
 * never touch the operator's real store at ~/.acr-gateway.
 */
function createAuthFixture({ expectedClientBuildId = 'mob-v0.6.5+45', now = () => Date.now() } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acr-auth-'));
  const storePath = path.join(dir, 'auth.db');
  const pepperPath = path.join(dir, 'pepper.bin');
  init({ pepperPath });

  const service = new SqliteAuthService({ storePath, pepperPath, expectedClientBuildId, now });

  return {
    dir,
    storePath,
    pepperPath,
    service,
    /** Issue an invitation and return its one-time plaintext code. */
    issueInvite(options = {}) {
      const ctx = openAuthDatabase({ storePath, pepperPath });
      try {
        return issue(ctx, {
          label: options.label || `reviewer-${crypto.randomBytes(3).toString('hex')}`,
          issuedBy: options.issuedBy || 'kraken',
          maxRedemptions: options.maxRedemptions || 1,
          now: options.now || now(),
        }).code;
      } finally {
        ctx.db.close();
      }
    },
    revokeInvite(label, reason = 'ADMIN') {
      const ctx = openAuthDatabase({ storePath, pepperPath });
      try {
        return revoke(ctx, { label, reason, now: now() });
      } finally {
        ctx.db.close();
      }
    },
    /** Reopen as a separate service instance — used to prove restart recovery. */
    reopen(overrides = {}) {
      return new SqliteAuthService({
        storePath, pepperPath, expectedClientBuildId, now, ...overrides,
      });
    },
    cleanup() {
      try { service.close(); } catch { /* already closed */ }
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

module.exports = { createAuthFixture };
