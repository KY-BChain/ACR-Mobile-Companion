'use strict';

const { GatewayError } = require('../errors');
const { audit } = require('./db');
const L = require('./lifetimes');

/**
 * Persisted rate limiting (AUTH-08, AT-09, AT-11).
 *
 * Held in SQLite rather than in memory, so a restart cannot clear a lockout.
 * The in-memory design this replaces made AT-09 ("10 failures in 1 minute
 * blocks for 5 minutes") and AT-11 ("restart; sessions remain valid") pull in
 * opposite directions: a restart both preserved sessions and erased the block.
 *
 * Applied ahead of authentication so brute force never reaches scrypt.
 *
 * Local limiting is a safety fuse only. Because cloudflared is the local peer,
 * every request arrives from loopback and per-reviewer IP limiting must be
 * proven at the Cloudflare edge — recorded as a residual blocker in the
 * 3 September review and carried into the Gate 10 evidence package.
 */

/** Count a failed authentication attempt against a subject; block on threshold. */
function recordAuthFailure(db, subject, now) {
  const bucket = `auth:${subject}`;
  const row = db.prepare('SELECT * FROM rate_limits WHERE bucket = ?').get(bucket);

  if (!row || now - row.window_start >= L.AUTH_ATTEMPT_WINDOW_MS) {
    db.prepare(`INSERT INTO rate_limits (bucket, count, window_start, blocked_until)
                VALUES (?, 1, ?, NULL)
                ON CONFLICT(bucket) DO UPDATE SET count = 1, window_start = ?, blocked_until = NULL`)
      .run(bucket, now, now);
    return;
  }

  const count = row.count + 1;
  const blockedUntil = count >= L.AUTH_ATTEMPT_MAX ? now + L.AUTH_BLOCK_MS : row.blocked_until;
  db.prepare('UPDATE rate_limits SET count = ?, blocked_until = ? WHERE bucket = ?')
    .run(count, blockedUntil, bucket);

  if (count === L.AUTH_ATTEMPT_MAX) {
    audit(db, { at: now, event: 'RATE_LIMIT_BLOCK', detail: 'AUTH_ATTEMPTS' });
  }
}

/** Clear a subject's failure record after a successful authentication. */
function clearAuthFailures(db, subject) {
  db.prepare('DELETE FROM rate_limits WHERE bucket = ?').run(`auth:${subject}`);
}

/** Throws RATE_LIMITED if the subject is currently blocked. */
function assertNotBlocked(db, subject, now) {
  const row = db.prepare('SELECT blocked_until FROM rate_limits WHERE bucket = ?').get(`auth:${subject}`);
  if (row && row.blocked_until !== null && row.blocked_until > now) {
    throw new GatewayError(
      'RATE_LIMITED', 'Too many attempts. Try again later.', 429, true, 'NOT_SUBMITTED',
    );
  }
}

/** Coarse per-window fuse above the per-subject limit. */
function assertGeneralLimit(db, routeClass, now) {
  const window = Math.floor(now / L.GENERAL_WINDOW_MS);
  const bucket = `general:${routeClass}:${window}`;
  db.prepare(`INSERT INTO rate_limits (bucket, count, window_start, blocked_until)
              VALUES (?, 1, ?, NULL)
              ON CONFLICT(bucket) DO UPDATE SET count = count + 1`).run(bucket, now);
  const row = db.prepare('SELECT count FROM rate_limits WHERE bucket = ?').get(bucket);
  db.prepare('DELETE FROM rate_limits WHERE bucket LIKE ? AND bucket != ?')
    .run(`general:${routeClass}:%`, bucket);
  if (row.count > L.GENERAL_MAX) {
    throw new GatewayError(
      'RATE_LIMITED', 'Too many requests. Try again later.', 429, true, 'NOT_SUBMITTED',
    );
  }
}

/**
 * Express middleware applied before the routes, and therefore before any
 * credential verification work.
 */
function createRateLimitMiddleware({ db, now = () => Date.now() }) {
  return (req, res, next) => {
    try {
      const at = now();
      const isAuthRoute = req.path === '/m/v1/auth/redeem' || req.path === '/m/v1/auth/refresh';
      assertGeneralLimit(db, isAuthRoute ? 'auth' : 'general', at);
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  recordAuthFailure, clearAuthFailures, assertNotBlocked, assertGeneralLimit,
  createRateLimitMiddleware,
};
