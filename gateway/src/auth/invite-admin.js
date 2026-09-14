#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { openAuthDatabase, audit } = require('./db');
const L = require('./lifetimes');
const { generateInviteCode, newSalt, inviteVerifier, redactSessionId } = require('./crypto');
const { ORGANISATIONS, isKnownOrganisation } = require('./organisations');

/**
 * T45-08 invitation administration (G10-0 §10.3, Q3).
 *
 * Deliberately a local, owner-only CLI operating directly on the SQLite file.
 * There is NO network administration endpoint: issuing and revoking access are
 * the highest-value operations in the system, and not exposing them removes
 * that attack surface entirely rather than defending it. AT-16 ("the revocation
 * endpoint rejects requests that are not properly authorised") is therefore
 * satisfied because no such endpoint exists — recorded explicitly in the Gate 10
 * evidence rather than quietly marked inapplicable.
 *
 * The plaintext invitation code is printed exactly once, at issue, and is never
 * written to the database, a log or a report.
 */

function defaultPaths() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return {
    storePath: process.env.ACR_AUTH_STORE_PATH || path.join(home, '.acr-gateway', 'build45-auth.db'),
    pepperPath: process.env.ACR_AUTH_PEPPER_PATH || path.join(home, '.acr-gateway', 'build45-pepper.bin'),
  };
}

/** Create the pepper if absent. Never regenerates an existing one. */
function init({ pepperPath }) {
  if (fs.existsSync(pepperPath)) {
    return { created: false, pepperPath };
  }
  fs.mkdirSync(path.dirname(pepperPath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(pepperPath, crypto.randomBytes(32), { mode: 0o600 });
  return { created: true, pepperPath };
}

function issue({ db, pepper }, { label, issuedBy, org = null, maxRedemptions = 1, now = Date.now() }) {
  if (!label || !issuedBy) throw new Error('--label and --issued-by are required');
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(label)) {
    throw new Error('--label must be a short non-clinical identifier, e.g. reviewer-03');
  }
  // Build 46 Part A: the organisation tag must be on the fixed list. Callers
  // that pass none get a legacy ACR45 code (tests, existing tooling); the CLI
  // always requires --org.
  if (org !== null && !isKnownOrganisation(org)) {
    throw new Error(`--org must be a known organisation: ${ORGANISATIONS.join(', ')}`);
  }
  const { selector, secret, code } = generateInviteCode(org);
  const salt = newSalt();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO invitations
      (id, selector, verifier_hash, salt, label, issued_by, issued_at, expires_at, max_redemptions, redemptions, org)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`).run(
    id, selector, inviteVerifier(secret, salt, pepper), salt, label, issuedBy,
    now, now + L.INVITE_ACTIVATION_MS, maxRedemptions, org,
  );
  audit(db, { at: now, event: 'INVITE_ISSUED', label });
  return {
    code,
    org,
    label,
    issuedBy,
    activationExpiresAt: new Date(now + L.INVITE_ACTIVATION_MS).toISOString(),
    projectedSessionExpiryIfRedeemedNow: new Date(now + L.SESSION_MS).toISOString(),
  };
}

/**
 * Revoke an invitation and cascade to every session created from it.
 * Revocation precedes any re-issue, so a lost code cannot run in parallel with
 * its replacement (G10-0 §10.3 step 2).
 */
function revoke({ db }, { label, reason = 'ADMIN', now = Date.now() }) {
  const invitations = db.prepare('SELECT * FROM invitations WHERE label = ? AND revoked_at IS NULL').all(label);
  if (invitations.length === 0) return { revokedInvitations: 0, revokedSessions: 0 };

  db.exec('BEGIN IMMEDIATE');
  try {
    let revokedSessions = 0;
    for (const invitation of invitations) {
      db.prepare('UPDATE invitations SET revoked_at = ?, revoked_reason = ? WHERE id = ?')
        .run(now, reason, invitation.id);
      audit(db, { at: now, event: 'INVITE_REVOKED', label: invitation.label, detail: reason });

      for (const session of db.prepare('SELECT id FROM sessions WHERE invitation_id = ? AND revoked_at IS NULL')
        .all(invitation.id)) {
        db.prepare('UPDATE sessions SET revoked_at = ?, revoked_reason = ? WHERE id = ?')
          .run(now, reason, session.id);
        db.prepare('DELETE FROM access_tokens WHERE session_id = ?').run(session.id);
        db.prepare('DELETE FROM refresh_tokens WHERE session_id = ?').run(session.id);
        audit(db, { at: now, event: 'SESSION_REVOKED', sessionId: session.id, detail: reason });
        revokedSessions += 1;
      }
    }
    db.exec('COMMIT');
    return { revokedInvitations: invitations.length, revokedSessions };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/** Non-clinical status listing. Never prints codes, tokens or hashes. */
function list({ db }, { now = Date.now() } = {}) {
  return db.prepare(`
    SELECT i.org, i.label, i.issued_by, i.issued_at, i.expires_at, i.redemptions, i.max_redemptions,
           i.revoked_at, i.revoked_reason,
           (SELECT COUNT(*) FROM sessions s WHERE s.invitation_id = i.id AND s.revoked_at IS NULL
              AND s.expires_at > ?) AS live_sessions
      FROM invitations i ORDER BY i.issued_at DESC`).all(now);
}

/** DDMMYY-HHMMSS in UTC — the Build 46 pairing-record format. */
function pairingStamp(ms) {
  const d = new Date(ms);
  const two = (n) => String(n).padStart(2, '0');
  return `${two(d.getUTCDate())}${two(d.getUTCMonth() + 1)}${two(d.getUTCFullYear() % 100)}-`
    + `${two(d.getUTCHours())}${two(d.getUTCMinutes())}${two(d.getUTCSeconds())}`;
}

/**
 * One row per paired device: the invite (by label — the code itself is never
 * stored), the device (by its hashed install identifier, never shown), and
 * when they were paired. The 30-day term runs from the pairing time.
 */
function sessions({ db }, { now = Date.now() } = {}) {
  return db.prepare(`
    SELECT s.id, i.org, i.label, s.client_build_id, s.created_at, s.expires_at, s.revoked_at, s.revoked_reason
      FROM sessions s JOIN invitations i ON i.id = s.invitation_id
     ORDER BY s.created_at DESC`).all().map((row) => ({
    session: redactSessionId(row.id),
    org: row.org,
    label: row.label,
    pairedUtc: pairingStamp(row.created_at),
    build: row.client_build_id,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
    live: row.revoked_at === null && row.expires_at > now,
    revokedReason: row.revoked_reason,
  }));
}

function arg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function main() {
  const command = process.argv[2];
  const paths = defaultPaths();

  if (command === 'init') {
    const result = init(paths);
    console.log(result.created
      ? `Pepper created at ${result.pepperPath} (mode 0600). Back it up securely; losing it invalidates every credential.`
      : `Pepper already exists at ${result.pepperPath}; not regenerated.`);
    return;
  }

  const ctx = openAuthDatabase(paths);
  try {
    switch (command) {
      case 'issue': {
        const org = arg('--org');
        if (!org) throw new Error(`--org is required: one of ${ORGANISATIONS.join(', ')}`);
        const result = issue(ctx, {
          org,
          label: arg('--label'),
          issuedBy: arg('--issued-by'),
          maxRedemptions: Number(arg('--max-redemptions') || 1),
        });
        console.log('Invitation issued. The code below is shown ONCE and is not stored anywhere.');
        console.log(`  code:              ${result.code}`);
        console.log(`  organisation:      ${result.org}`);
        console.log(`  label:             ${result.label}`);
        console.log(`  issued by:         ${result.issuedBy}`);
        console.log(`  activation until:  ${result.activationExpiresAt}`);
        console.log(`  session would end: ${result.projectedSessionExpiryIfRedeemedNow}`);
        console.log('Deliver it through the approved private channel. Do not record it.');
        break;
      }
      case 'revoke': {
        const result = revoke(ctx, { label: arg('--label'), reason: arg('--reason') || 'ADMIN' });
        console.log(`Revoked ${result.revokedInvitations} invitation(s) and ${result.revokedSessions} session(s).`);
        break;
      }
      case 'list':
        console.table(list(ctx));
        break;
      case 'sessions':
        console.table(sessions(ctx));
        break;
      default:
        console.log(`Usage: acr-invite <init|issue|revoke|list|sessions> [--org ${ORGANISATIONS.join('|')}] [--label X] [--issued-by Y] [--reason LOST]`);
        process.exitCode = 1;
    }
  } finally {
    ctx.db.close();
  }
}

if (require.main === module) main();

module.exports = { init, issue, revoke, list, sessions, defaultPaths };
