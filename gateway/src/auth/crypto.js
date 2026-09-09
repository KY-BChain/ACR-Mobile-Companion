'use strict';

const crypto = require('crypto');

/**
 * Cryptographic primitives for Build 45 authentication (G10-0 §3, §4.1).
 *
 * Two deliberately different constructions:
 *
 *  - Invitation secrets are human-entered and therefore low-entropy, so they get
 *    scrypt with a per-invitation salt and the server pepper (AUTH-12).
 *  - Access and refresh tokens are 256-bit random values, so they get a keyed
 *    HMAC digest (AUTH-13). A slow hash would buy nothing against that entropy
 *    and would only add latency to every request.
 *
 * Both are compared with crypto.timingSafeEqual over equal-length buffers
 * (AUTH-11).
 */

/** scrypt cost parameters. N=16384 keeps a single verification near ~50ms. */
const SCRYPT = Object.freeze({ N: 16384, r: 8, p: 1 });
const SCRYPT_KEYLEN = 32;
const SALT_BYTES = 16;
const TOKEN_BYTES = 32;

/**
 * Crockford base32 without I, L, O and U — chosen so a code read aloud or
 * copied by hand cannot be ambiguous.
 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const SELECTOR_LENGTH = 8;
const SECRET_LENGTH = 12;

/** Uniform random string over ALPHABET, rejection-sampled to avoid modulo bias. */
function randomCode(length) {
  const out = [];
  const limit = 256 - (256 % ALPHABET.length);
  while (out.length < length) {
    for (const byte of crypto.randomBytes(length * 2)) {
      if (byte >= limit) continue;
      out.push(ALPHABET[byte % ALPHABET.length]);
      if (out.length === length) break;
    }
  }
  return out.join('');
}

/** Generate a full invitation code: ACR45-<selector>-<secret>. */
function generateInviteCode() {
  const selector = randomCode(SELECTOR_LENGTH);
  const secret = randomCode(SECRET_LENGTH);
  return { selector, secret, code: `ACR45-${selector}-${secret}` };
}

/**
 * Split a presented code into its selector and secret halves.
 * Returns null for anything that is not exactly the expected shape, so a
 * malformed code costs no cryptographic work (AT-18).
 */
function parseInviteCode(value) {
  if (typeof value !== 'string' || value.length !== 6 + SELECTOR_LENGTH + 1 + SECRET_LENGTH) return null;
  const match = new RegExp(
    `^ACR45-([${ALPHABET}]{${SELECTOR_LENGTH}})-([${ALPHABET}]{${SECRET_LENGTH}})$`,
  ).exec(value);
  return match ? { selector: match[1], secret: match[2] } : null;
}

function newSalt() {
  return crypto.randomBytes(SALT_BYTES).toString('hex');
}

/** scrypt(secret ‖ pepper, salt) — AUTH-12. */
function inviteVerifier(secret, saltHex, pepper) {
  const input = Buffer.concat([Buffer.from(secret, 'utf8'), pepper]);
  return crypto.scryptSync(input, Buffer.from(saltHex, 'hex'), SCRYPT_KEYLEN, SCRYPT).toString('hex');
}

/** Keyed digest for high-entropy secrets — AUTH-13. */
function keyedDigest(secret, pepper) {
  return crypto.createHmac('sha256', pepper).update(String(secret), 'utf8').digest('hex');
}

/** A fresh 256-bit token, URL-safe. */
function newToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('base64url');
}

/** Constant-time hex comparison — AUTH-11, AT-12. */
function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return bufA.length === bufB.length && bufA.length > 0 && crypto.timingSafeEqual(bufA, bufB);
}

/** Redact a session id for audit output — AUTH-09. */
function redactSessionId(sessionId) {
  return typeof sessionId === 'string' && sessionId.length >= 8 ? `${sessionId.slice(0, 8)}…` : null;
}

module.exports = {
  ALPHABET,
  SELECTOR_LENGTH,
  SECRET_LENGTH,
  SCRYPT,
  generateInviteCode,
  parseInviteCode,
  newSalt,
  inviteVerifier,
  keyedDigest,
  newToken,
  safeEqualHex,
  redactSessionId,
};
