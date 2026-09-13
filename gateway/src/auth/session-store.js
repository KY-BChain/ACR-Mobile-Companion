'use strict';

const crypto = require('crypto');
const { GatewayError } = require('../errors');
const { openAuthDatabase, audit } = require('./db');
const L = require('./lifetimes');
const {
  parseInviteCode, inviteVerifier, keyedDigest, newToken, safeEqualHex,
} = require('./crypto');
const { assertNotBlocked, recordAuthFailure, clearAuthFailures } = require('./rate-limit');

const DAY_MS = 24 * 60 * 60 * 1000;

const inviteExpired = () => new GatewayError('INVITE_EXPIRED', 'Invite Code Expired. Request a refreshed one.', 401);

/** Shown to the evaluator on pairing: when it happened and the fixed term. */
function pairingDetails(pairing, pairedAt) {
  return { pairing, pairedAt: new Date(pairedAt).toISOString(), sessionDays: Math.round(L.SESSION_MS / DAY_MS) };
}

/**
 * Build 45 authentication service (G10-0 §2, §4).
 *
 * Drop-in replacement for the Build 44 InMemoryAuthService: same three methods
 * (redeem / refresh / authenticate), same acr.error.v1 error codes, so app.js
 * integration is unchanged apart from construction.
 *
 * Every decision is re-read from SQLite on every call. Nothing is cached in
 * process memory, which is what makes revocation immediate (AUTH-06) and
 * restart recovery honest (AUTH-10): a restarted process trusts nothing it did
 * not read from disk, and never resurrects a session it cannot re-validate.
 */
class SqliteAuthService {
  constructor({ storePath, pepperPath, expectedClientBuildId, previousClientBuildIds = [], now = () => Date.now() }) {
    if (!expectedClientBuildId) throw new Error('expectedClientBuildId is required');
    const { db, pepper } = openAuthDatabase({ storePath, pepperPath });
    this.db = db;
    this.pepper = pepper;
    this.expectedClientBuildId = expectedClientBuildId;
    this.previousClientBuildIds = Object.freeze(previousClientBuildIds.filter((id) => id !== expectedClientBuildId));
    this.now = now;
  }

  close() { this.db.close(); }

  // -- helpers -------------------------------------------------------------

  /** Remove expired rows. Cheap, and keeps AT-04/AT-05 deterministic. */
  sweep(now) {
    this.db.prepare('DELETE FROM access_tokens WHERE expires_at <= ?').run(now);
    this.db.prepare('DELETE FROM refresh_tokens WHERE expires_at <= ?').run(now);
  }

  /**
   * Uniform binding failure — never reveals which dimension mismatched.
   *
   * Build 46 changeover: the current build may use a session recorded under a
   * listed previous build (refresh then moves it forward); a previous build may
   * use only a session still recorded under its own build, so a session never
   * moves backwards.
   */
  assertBinding(session, deviceBinding, clientBuildId) {
    const currentBuild = clientBuildId === this.expectedClientBuildId
      && (session.client_build_id === this.expectedClientBuildId
        || this.previousClientBuildIds.includes(session.client_build_id));
    const previousBuild = this.previousClientBuildIds.includes(clientBuildId)
      && session.client_build_id === clientBuildId;
    if (typeof clientBuildId !== 'string' || !(currentBuild || previousBuild)) {
      throw new GatewayError('CLIENT_BUILD_MISMATCH', 'Client build is not authorised for this gateway.', 403);
    }
    if (typeof deviceBinding !== 'string' || deviceBinding.length < 8 || deviceBinding.length > 256
        || !safeEqualHex(keyedDigest(deviceBinding, this.pepper), session.device_binding_hash)) {
      throw new GatewayError('DEVICE_BINDING_MISMATCH', 'Device binding is invalid.', 403);
    }
  }

  /** A session usable right now, or null. Re-checks invitation state too. */
  liveSession(sessionId, now) {
    const row = this.db.prepare(`
      SELECT s.*, i.revoked_at AS invite_revoked_at
        FROM sessions s JOIN invitations i ON i.id = s.invitation_id
       WHERE s.id = ?`).get(sessionId);
    if (!row) return null;
    if (row.revoked_at !== null || row.invite_revoked_at !== null) return null;
    if (row.expires_at <= now) return null;
    return row;
  }

  /** Revoke a session and destroy its tokens. Used by admin and by replay. */
  revokeSession(sessionId, reason, now = this.now()) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('UPDATE sessions SET revoked_at = ?, revoked_reason = ? WHERE id = ? AND revoked_at IS NULL')
        .run(now, reason, sessionId);
      this.db.prepare('DELETE FROM access_tokens WHERE session_id = ?').run(sessionId);
      this.db.prepare('DELETE FROM refresh_tokens WHERE session_id = ?').run(sessionId);
      audit(this.db, { at: now, event: 'SESSION_REVOKED', sessionId, detail: reason });
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  /**
   * Issue an access/refresh pair for a session.
   *
   * The refresh token's expires_at is ALWAYS the parent session's expires_at,
   * copied from the sessions row — never now + SESSION_MS. This is the single
   * site that binds refresh expiry (G10-0 §10.2), and copying rather than
   * recomputing is what makes sliding expiry structurally impossible.
   */
  issueTokenPair(sessionId, now) {
    const session = this.db.prepare('SELECT expires_at FROM sessions WHERE id = ?').get(sessionId);
    if (!session) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Session is not available.', 401);

    const accessToken = newToken();
    const refreshToken = newToken();
    const accessExpiresAt = Math.min(now + L.ACCESS_TOKEN_MS, session.expires_at);

    this.db.prepare('INSERT INTO access_tokens (token_hash, session_id, issued_at, expires_at) VALUES (?, ?, ?, ?)')
      .run(keyedDigest(accessToken, this.pepper), sessionId, now, accessExpiresAt);
    this.db.prepare('INSERT INTO refresh_tokens (token_hash, session_id, issued_at, expires_at) VALUES (?, ?, ?, ?)')
      .run(keyedDigest(refreshToken, this.pepper), sessionId, now, session.expires_at);

    return {
      tokenType: 'Bearer',
      accessToken,
      expiresIn: Math.max(0, Math.floor((accessExpiresAt - now) / 1000)),
      refreshToken,
      refreshExpiresAt: new Date(session.expires_at).toISOString(),
    };
  }

  // -- AUTH-01 / AUTH-02: invitation redemption ----------------------------

  redeem(inviteCode, deviceBinding, clientBuildId) {
    const now = this.now();
    this.sweep(now);

    // Shape check first, so a malformed code costs no scrypt work (AT-18).
    const parsed = parseInviteCode(inviteCode);
    const invalid = () => new GatewayError('INVITE_INVALID', 'Invite credential is invalid.', 401);
    if (!parsed) throw invalid();

    // Rate limiting is applied to the selector BEFORE any scrypt work, so
    // brute force cannot burn server CPU (AUTH-08, AT-09).
    assertNotBlocked(this.db, parsed.selector, now);

    const fail = () => {
      recordAuthFailure(this.db, parsed.selector, now);
      return invalid();
    };

    // One indexed lookup, one scrypt — never a scan (AUTH-05, AUTH-08).
    const invitation = this.db.prepare('SELECT * FROM invitations WHERE selector = ?').get(parsed.selector);

    // Compute a verifier either way so a missing selector and a wrong secret
    // cost the same work and are indistinguishable (AT-12).
    const salt = invitation ? invitation.salt : '00000000000000000000000000000000';
    const candidate = inviteVerifier(parsed.secret, salt, this.pepper);
    const matches = invitation ? safeEqualHex(candidate, invitation.verifier_hash) : false;

    if (!invitation || !matches) throw fail();
    if (invitation.revoked_at !== null) throw fail();

    // Pairing and re-entry need the current build; a previous build keeps its
    // existing session during a changeover but can never pair a device.
    if (typeof clientBuildId !== 'string' || clientBuildId !== this.expectedClientBuildId) {
      throw new GatewayError('CLIENT_BUILD_MISMATCH', 'Client build is not authorised for this gateway.', 403);
    }
    if (typeof deviceBinding !== 'string' || deviceBinding.length < 8 || deviceBinding.length > 256) {
      throw new GatewayError('DEVICE_BINDING_MISMATCH', 'Device binding is invalid.', 403);
    }

    // Build 46 device pairing. The caller now holds the complete, correct
    // code, so the specific answers below give a guesser nothing: AT-12 keeps
    // unknown and wrong codes indistinguishable, and that is unchanged.
    const bindingHash = keyedDigest(deviceBinding, this.pepper);
    const sessions = this.db.prepare('SELECT * FROM sessions WHERE invitation_id = ? ORDER BY created_at DESC')
      .all(invitation.id);
    const paired = sessions.find((session) => safeEqualHex(bindingHash, session.device_binding_hash));
    if (paired) return this.reenter(invitation, paired, parsed.selector, clientBuildId, now);

    if (invitation.redemptions >= invitation.max_redemptions) {
      if (sessions.some((session) => session.revoked_at === null && session.expires_at > now)) {
        throw new GatewayError('DEVICE_NOT_AUTHORISED', 'Incorrect device used. This device is not authorised for this invite code.', 403);
      }
      if (sessions.some((session) => session.revoked_at === null)) throw inviteExpired();
      throw invalid();
    }
    // The 7-day activation window applies to an unused code only; a paired
    // device keeps its 30 days (AUTH-01).
    if (invitation.expires_at <= now) throw inviteExpired();

    this.db.exec('BEGIN IMMEDIATE');
    try {
      // Re-check the redemption count inside the transaction so two concurrent
      // redemptions of a single-use code cannot both succeed (AT-15).
      const consumed = this.db.prepare(
        'UPDATE invitations SET redemptions = redemptions + 1 WHERE id = ? AND redemptions < max_redemptions AND revoked_at IS NULL',
      ).run(invitation.id);
      if (consumed.changes !== 1) {
        this.db.exec('ROLLBACK');
        throw invalid();
      }

      const sessionId = crypto.randomUUID();
      this.db.prepare(`
        INSERT INTO sessions (id, invitation_id, device_binding_hash, client_build_id, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)`).run(
        sessionId, invitation.id, keyedDigest(deviceBinding, this.pepper),
        clientBuildId, now, now + L.SESSION_MS,
      );

      const issued = this.issueTokenPair(sessionId, now);
      audit(this.db, { at: now, event: 'INVITE_REDEEMED', sessionId, label: invitation.label });
      this.db.exec('COMMIT');
      clearAuthFailures(this.db, parsed.selector);
      return { ...issued, ...pairingDetails('NEW', now) };
    } catch (error) {
      try { this.db.exec('ROLLBACK'); } catch { /* already rolled back */ }
      throw error;
    }
  }

  /**
   * The paired device entered its own code again — for example after its saved
   * session was lost. It gets fresh tokens on the SAME session, so the expiry
   * never moves; any tokens still outstanding for that session are destroyed.
   */
  reenter(invitation, session, selector, clientBuildId, now) {
    if (session.revoked_at !== null) {
      throw new GatewayError('INVITE_INVALID', 'Invite credential is invalid.', 401);
    }
    if (session.expires_at <= now) throw inviteExpired();

    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('DELETE FROM access_tokens WHERE session_id = ?').run(session.id);
      this.db.prepare('DELETE FROM refresh_tokens WHERE session_id = ?').run(session.id);
      if (session.client_build_id !== clientBuildId) {
        this.db.prepare('UPDATE sessions SET client_build_id = ? WHERE id = ?').run(clientBuildId, session.id);
      }
      const issued = this.issueTokenPair(session.id, now);
      audit(this.db, { at: now, event: 'INVITE_REENTERED', sessionId: session.id, label: invitation.label });
      this.db.exec('COMMIT');
      clearAuthFailures(this.db, selector);
      return { ...issued, ...pairingDetails('EXISTING', session.created_at) };
    } catch (error) {
      try { this.db.exec('ROLLBACK'); } catch { /* already rolled back */ }
      throw error;
    }
  }

  // -- AUTH-07: rotation with replay-family revocation ---------------------

  refresh(refreshToken, deviceBinding, clientBuildId) {
    const now = this.now();
    this.sweep(now);
    if (typeof refreshToken !== 'string' || refreshToken.length === 0 || refreshToken.length > 512) {
      throw new GatewayError('AUTHENTICATION_REQUIRED', 'Refresh token is invalid or expired.', 401);
    }
    const hash = keyedDigest(refreshToken, this.pepper);
    const row = this.db.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?').get(hash);
    if (!row) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Refresh token is invalid or expired.', 401);

    // Replay: the token exists but was already consumed. Revoke the whole
    // session — every access and refresh token in the family (AUTH-07).
    if (row.consumed_at !== null) {
      audit(this.db, { at: now, event: 'REUSE_DETECTED', sessionId: row.session_id, detail: 'REUSE_DETECTED' });
      this.revokeSession(row.session_id, 'REUSE_DETECTED', now);
      throw new GatewayError('TOKEN_REUSE_DETECTED', 'Refresh token reuse revoked this token family.', 409);
    }

    const session = this.liveSession(row.session_id, now);
    if (!session) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Refresh token is invalid or expired.', 401);
    if (row.expires_at <= now) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Refresh token is invalid or expired.', 401);
    this.assertBinding(session, deviceBinding, clientBuildId);

    this.db.exec('BEGIN IMMEDIATE');
    try {
      // The single conditional UPDATE that makes concurrent refresh
      // deterministic: only one caller can observe consumed_at IS NULL (AT-17).
      const claimed = this.db.prepare(
        'UPDATE refresh_tokens SET consumed_at = ? WHERE token_hash = ? AND consumed_at IS NULL',
      ).run(now, hash);
      if (claimed.changes !== 1) {
        this.db.exec('ROLLBACK');
        throw new GatewayError('TOKEN_REUSE_DETECTED', 'Refresh token reuse revoked this token family.', 409);
      }
      // Build 46 changeover: the first refresh from an updated app moves the
      // session to the current build. assertBinding() never lets it move back.
      if (session.client_build_id !== clientBuildId) {
        this.db.prepare('UPDATE sessions SET client_build_id = ? WHERE id = ?').run(clientBuildId, row.session_id);
        audit(this.db, { at: now, event: 'CLIENT_BUILD_UPGRADED', sessionId: row.session_id });
      }
      const issued = this.issueTokenPair(row.session_id, now);
      this.db.prepare('UPDATE refresh_tokens SET superseded_by = ? WHERE token_hash = ?')
        .run(keyedDigest(issued.refreshToken, this.pepper), hash);
      audit(this.db, { at: now, event: 'REFRESH_ROTATED', sessionId: row.session_id });
      this.db.exec('COMMIT');
      return issued;
    } catch (error) {
      try { this.db.exec('ROLLBACK'); } catch { /* already rolled back */ }
      throw error;
    }
  }

  // -- AUTH-03 / AUTH-04 / AUTH-14: bearer authentication ------------------

  authenticate(header, deviceBinding, clientBuildId) {
    const now = this.now();
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      throw new GatewayError('AUTHENTICATION_REQUIRED', 'Access token required.', 401);
    }
    const token = header.slice('Bearer '.length);
    if (token.length === 0 || token.length > 512) {
      throw new GatewayError('AUTHENTICATION_REQUIRED', 'Access token is invalid or expired.', 401);
    }
    const row = this.db.prepare('SELECT * FROM access_tokens WHERE token_hash = ?')
      .get(keyedDigest(token, this.pepper));
    if (!row || row.expires_at <= now) {
      throw new GatewayError('AUTHENTICATION_REQUIRED', 'Access token is invalid or expired.', 401);
    }
    const session = this.liveSession(row.session_id, now);
    if (!session) {
      throw new GatewayError('AUTHENTICATION_REQUIRED', 'Access token is invalid or expired.', 401);
    }
    this.assertBinding(session, deviceBinding, clientBuildId);
    return row.session_id;
  }
}

module.exports = { SqliteAuthService };
