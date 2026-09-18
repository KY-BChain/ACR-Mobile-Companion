'use strict';

/**
 * Build 45 authentication lifetimes (G10-0 §10.2).
 *
 * SESSION_MS is read in exactly two places: createSession(), which anchors a
 * session at the evaluator's own redemption, and the invite-admin CLI when it
 * reports a projected expiry. issueTokenPair() never reads it — a refresh
 * token's expiry is always copied from its parent session row, so expiry cannot
 * slide across rotations (G10-0 §10.4).
 */
const ACCESS_TOKEN_MS = 15 * 60 * 1000;                 // AUTH-02, AUTH-14
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;            // AUTH-02, AUTH-14
const INVITE_ACTIVATION_MS = 7 * 24 * 60 * 60 * 1000;   // AUTH-01
// Build 48: the privacy notice promises that records are deleted 30 days after
// they stop being current. `acr-invite purge` enforces it.
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/** AT-09: 10 failed attempts in 1 minute blocks further attempts for 5 minutes. */
const AUTH_ATTEMPT_WINDOW_MS = 60 * 1000;
const AUTH_ATTEMPT_MAX = 10;
const AUTH_BLOCK_MS = 5 * 60 * 1000;

/** A coarse safety fuse above the per-subject auth limit. */
const GENERAL_WINDOW_MS = 5 * 60 * 1000;
const GENERAL_MAX = 300;

module.exports = Object.freeze({
  RETENTION_MS,
  ACCESS_TOKEN_MS,
  SESSION_MS,
  INVITE_ACTIVATION_MS,
  AUTH_ATTEMPT_WINDOW_MS,
  AUTH_ATTEMPT_MAX,
  AUTH_BLOCK_MS,
  GENERAL_WINDOW_MS,
  GENERAL_MAX,
});
