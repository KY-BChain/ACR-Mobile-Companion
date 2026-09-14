'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

/**
 * SQLite auth store (G10-0 §3, AUTH-10).
 *
 * WAL plus synchronous=FULL gives durability and lets a reader proceed while a
 * writer holds the lock; BEGIN IMMEDIATE (used by the session store) serialises
 * writers, which is what makes refresh rotation race-free (AT-17).
 *
 * The pepper lives in a separate owner-only file so that a copy of the database
 * alone cannot verify any credential.
 */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS invitations (
  id              TEXT PRIMARY KEY,
  selector        TEXT NOT NULL UNIQUE,
  verifier_hash   TEXT NOT NULL,
  salt            TEXT NOT NULL,
  label           TEXT NOT NULL,
  issued_by       TEXT NOT NULL,
  issued_at       INTEGER NOT NULL,
  expires_at      INTEGER NOT NULL,
  max_redemptions INTEGER NOT NULL DEFAULT 1,
  redemptions     INTEGER NOT NULL DEFAULT 0,
  revoked_at      INTEGER,
  revoked_reason  TEXT,
  org             TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id                  TEXT PRIMARY KEY,
  invitation_id       TEXT NOT NULL REFERENCES invitations(id),
  device_binding_hash TEXT NOT NULL,
  client_build_id     TEXT NOT NULL,
  created_at          INTEGER NOT NULL,
  expires_at          INTEGER NOT NULL,
  revoked_at          INTEGER,
  revoked_reason      TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_invitation ON sessions(invitation_id);

CREATE TABLE IF NOT EXISTS access_tokens (
  token_hash TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  issued_at  INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_access_session ON access_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_access_expiry  ON access_tokens(expires_at);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_hash    TEXT PRIMARY KEY,
  session_id    TEXT NOT NULL REFERENCES sessions(id),
  issued_at     INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  consumed_at   INTEGER,
  superseded_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_refresh_session ON refresh_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_refresh_expiry  ON refresh_tokens(expires_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket        TEXT PRIMARY KEY,
  count         INTEGER NOT NULL,
  window_start  INTEGER NOT NULL,
  blocked_until INTEGER
);

CREATE TABLE IF NOT EXISTS audit (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  at               INTEGER NOT NULL,
  event            TEXT NOT NULL,
  session_id       TEXT,
  invitation_label TEXT,
  detail           TEXT
);
`;

/** Events permitted in the audit table. Free text is never stored. */
const AUDIT_EVENTS = Object.freeze([
  'INVITE_ISSUED', 'INVITE_REDEEMED', 'INVITE_REVOKED',
  'REFRESH_ROTATED', 'REUSE_DETECTED',
  'SESSION_REVOKED', 'RATE_LIMIT_BLOCK',
  'INVITE_REENTERED', 'CLIENT_BUILD_UPGRADED',
]);

/** Constrained vocabulary for audit.detail — never free text (AUTH-09). */
const AUDIT_DETAILS = Object.freeze([
  'ADMIN', 'LOST', 'COMPROMISE_SUSPECTED', 'REUSE_DETECTED',
  'INVITE_REVOKED', 'EXPIRED', 'AUTH_ATTEMPTS', 'GENERAL',
]);

function assertOwnerOnlyFile(filePath) {
  const stat = fs.statSync(filePath);
  if ((stat.mode & 0o077) !== 0) {
    throw new Error(`${filePath} must not be readable or writable by group or others`);
  }
  if (stat.uid !== process.getuid()) {
    throw new Error(`${filePath} must be owned by the running user`);
  }
}

/**
 * Open (creating if needed) the auth store and load the pepper.
 * Both paths must be absolute and distinct, and both must be owner-only.
 */
function openAuthDatabase({ storePath, pepperPath }) {
  if (!storePath || !path.isAbsolute(storePath)) throw new Error('Auth store path must be absolute');
  if (!pepperPath || !path.isAbsolute(pepperPath)) throw new Error('Auth pepper path must be absolute');
  if (path.resolve(storePath) === path.resolve(pepperPath)) {
    throw new Error('Auth store and pepper must be different files');
  }

  fs.mkdirSync(path.dirname(storePath), { recursive: true, mode: 0o700 });
  if (!fs.existsSync(storePath)) fs.writeFileSync(storePath, '', { mode: 0o600 });
  fs.chmodSync(storePath, 0o600);
  assertOwnerOnlyFile(storePath);

  if (!fs.existsSync(pepperPath)) {
    throw new Error(`Auth pepper not found at ${pepperPath}; create it with acr-invite init`);
  }
  fs.chmodSync(pepperPath, 0o600);
  assertOwnerOnlyFile(pepperPath);
  const pepper = fs.readFileSync(pepperPath);
  if (pepper.length < 32) throw new Error('Auth pepper must contain at least 32 random bytes');

  const db = new DatabaseSync(storePath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = FULL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  // Build 46 Part A: stores created before organisation tags gain the column.
  // Existing invitations keep org NULL, so their ACR45 codes still verify.
  const invitationColumns = db.prepare('PRAGMA table_info(invitations)').all().map((column) => column.name);
  if (!invitationColumns.includes('org')) db.exec('ALTER TABLE invitations ADD COLUMN org TEXT');
  return { db, pepper };
}

/** Append a constrained audit row. Never accepts free text. */
function audit(db, { at, event, sessionId = null, label = null, detail = null }) {
  if (!AUDIT_EVENTS.includes(event)) throw new Error(`Unknown audit event ${event}`);
  if (detail !== null && !AUDIT_DETAILS.includes(detail)) throw new Error(`Unknown audit detail ${detail}`);
  db.prepare('INSERT INTO audit (at, event, session_id, invitation_label, detail) VALUES (?, ?, ?, ?, ?)')
    .run(at, event, sessionId, label, detail);
}

module.exports = { openAuthDatabase, audit, AUDIT_EVENTS, AUDIT_DETAILS, SCHEMA, assertOwnerOnlyFile };
