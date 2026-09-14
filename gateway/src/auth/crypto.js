'use strict';

const crypto = require('crypto');
const { ORG_PATTERN } = require('./organisations');

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

/**
 * Generate a full invitation code. With an organisation tag (Build 46 Part A):
 * ACR-<ORG>-<selector>-<secret>. Without one, the legacy ACR45-<selector>-<secret>.
 */
function generateInviteCode(org = null) {
  const selector = randomCode(SELECTOR_LENGTH);
  const secret = randomCode(SECRET_LENGTH);
  const code = org ? `ACR-${org}-${selector}-${secret}` : `ACR45-${selector}-${secret}`;
  return { selector, secret, code };
}

/**
 * Codes are typed by hand, so they are read case-insensitively, and the
 * letters the alphabet never uses are read as the digits they resemble:
 * O as 0, I and L as 1 (Crockford base32 decoding). Applied to the selector
 * and secret only; the organisation tag is plain capitals.
 */
function normaliseCodePart(part) {
  return part.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');
}

const SELECTOR_RE = new RegExp(`^[${ALPHABET}]{${SELECTOR_LENGTH}}$`);
const SECRET_RE = new RegExp(`^[${ALPHABET}]{${SECRET_LENGTH}}$`);

/**
 * Split a presented code into { org, selector, secret }; org is null for a
 * legacy ACR45 code. Accepts ACR-<ORG>-<8>-<12> and ACR45-<8>-<12>, in any
 * case and with surrounding spaces. Returns null for anything else, so a
 * malformed code costs no cryptographic work (AT-18).
 */
function parseInviteCode(value) {
  if (typeof value !== 'string' || value.length > 64) return null;
  const parts = value.trim().split('-');
  let org = null;
  let selectorPart;
  let secretPart;
  if (parts.length === 3 && parts[0].toUpperCase() === 'ACR45') {
    [, selectorPart, secretPart] = parts;
  } else if (parts.length === 4 && parts[0].toUpperCase() === 'ACR') {
    org = parts[1].toUpperCase();
    if (!ORG_PATTERN.test(org)) return null;
    [, , selectorPart, secretPart] = parts;
  } else {
    return null;
  }
  const selector = normaliseCodePart(selectorPart);
  const secret = normaliseCodePart(secretPart);
  if (!SELECTOR_RE.test(selector) || !SECRET_RE.test(secret)) return null;
  return { org, selector, secret };
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
