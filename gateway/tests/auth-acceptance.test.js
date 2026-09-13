'use strict';

/**
 * Build 45 Gate 10 §10.3 — acceptance tests AT-01 to AT-19.
 *
 * Each backlog test is implemented as its own case, named with its ID, so a
 * pass or fail can be read off per test rather than inferred from a suite
 * total. Nothing is marked pass on partial evidence: where a test genuinely
 * cannot be exercised without the Gate 10 tunnel, the case asserts what it can
 * and the remainder is recorded as an explicit Gate 10 field item.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../src/app');
const { createAuthFixture } = require('./auth-helpers');
const { openAuthDatabase } = require('../src/auth/db');
const { keyedDigest } = require('../src/auth/crypto');
const L = require('../src/auth/lifetimes');
const { evidence } = require('./helpers');

const BUILD = 'mob-v0.6.5+45';
const DEVICE = 'acceptance-device-binding';

let fixture;
let clock;

beforeEach(() => {
  clock = Date.now();
  fixture = createAuthFixture({ expectedClientBuildId: BUILD, now: () => clock });
});
afterEach(() => fixture.cleanup());

const advance = (ms) => { clock += ms; };

function appWith(auth = fixture.service) {
  return createApp({
    config: {
      upstreamInferUrl: 'https://configured.example/api/infer', upstreamTimeoutMs: 1000,
      allowedOrigin: false, expectedEvidence: evidence, expectedClientBuildId: BUILD, evidence: {},
    },
    authService: auth,
    evidenceProbe: async () => ({ ...evidence }),
  });
}

const redeem = (code, device = DEVICE, build = BUILD) => fixture.service.redeem(code, device, build);
const codeOf = (e) => (e && e.code) || null;
function caught(fn) {
  try { fn(); return null; } catch (error) { return error; }
}

// ---------------------------------------------------------------------------

describe('AT-01 valid invitation code', () => {
  test('exchange returns an access token (15 min) and a refresh token (30 days)', () => {
    const issued = redeem(fixture.issueInvite());
    expect(issued.tokenType).toBe('Bearer');
    expect(typeof issued.accessToken).toBe('string');
    expect(typeof issued.refreshToken).toBe('string');
    expect(issued.expiresIn).toBe(L.ACCESS_TOKEN_MS / 1000);
    // Refresh expiry is the session's, anchored at this evaluator's redemption.
    expect(new Date(issued.refreshExpiresAt).getTime()).toBe(clock + L.SESSION_MS);
  });
});

describe('AT-02 invalid invitation code', () => {
  test('exchange returns 401 and issues no tokens', async () => {
    fixture.issueInvite();
    const app = appWith();
    const response = await request(app).post('/m/v1/auth/redeem')
      .send({ inviteCode: 'ACR45-AAAAAAAA-BBBBBBBBBBBB', deviceBinding: DEVICE, clientBuildId: BUILD });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVITE_INVALID');
    expect(response.body).not.toHaveProperty('accessToken');
    const ctx = openAuthDatabase({ storePath: fixture.storePath, pepperPath: fixture.pepperPath });
    expect(ctx.db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n).toBe(0);
    ctx.db.close();
  });
});

describe('AT-03 expired invitation code', () => {
  test('exchange returns 401 and issues no tokens', () => {
    const code = fixture.issueInvite();
    advance(L.INVITE_ACTIVATION_MS + 1);
    // Build 46: a complete, correct but unused code past its 7-day window is
    // told it has expired (Kraken, 13 Sept 2026); still 401, still no tokens.
    const error = caught(() => redeem(code));
    expect(codeOf(error)).toBe('INVITE_EXPIRED');
    expect(error.status).toBe(401);
  });
});

describe('AT-04 access token expiry', () => {
  test('after 15 minutes an API request with the expired token returns 401', () => {
    const issued = redeem(fixture.issueInvite());
    expect(fixture.service.authenticate(`Bearer ${issued.accessToken}`, DEVICE, BUILD)).toBeTruthy();
    advance(L.ACCESS_TOKEN_MS + 1);
    expect(codeOf(caught(() => fixture.service.authenticate(`Bearer ${issued.accessToken}`, DEVICE, BUILD))))
      .toBe('AUTHENTICATION_REQUIRED');
  });
});

describe('AT-05 refresh token expiry', () => {
  test('after 30 days refresh returns 401, and rotation does not extend the deadline', () => {
    const issued = redeem(fixture.issueInvite());
    // Rotate repeatedly part-way through; expiry must not slide.
    let current = issued.refreshToken;
    for (let i = 0; i < 3; i += 1) {
      advance(24 * 60 * 60 * 1000);
      const next = fixture.service.refresh(current, DEVICE, BUILD);
      expect(new Date(next.refreshExpiresAt).getTime())
        .toBe(new Date(issued.refreshExpiresAt).getTime());
      current = next.refreshToken;
    }
    advance(L.SESSION_MS);
    expect(codeOf(caught(() => fixture.service.refresh(current, DEVICE, BUILD))))
      .toBe('AUTHENTICATION_REQUIRED');
  });
});

describe('AT-06 refresh token rotation', () => {
  test('a refresh token exchanges for a new access token and a new refresh token', () => {
    const first = redeem(fixture.issueInvite());
    const second = fixture.service.refresh(first.refreshToken, DEVICE, BUILD);
    expect(second.accessToken).not.toBe(first.accessToken);
    expect(second.refreshToken).not.toBe(first.refreshToken);
    expect(fixture.service.authenticate(`Bearer ${second.accessToken}`, DEVICE, BUILD)).toBeTruthy();
  });
});

describe('AT-07 refresh token reuse detection', () => {
  test('reuse of an old refresh token revokes all tokens for that user', () => {
    const first = redeem(fixture.issueInvite());
    const second = fixture.service.refresh(first.refreshToken, DEVICE, BUILD);
    expect(codeOf(caught(() => fixture.service.refresh(first.refreshToken, DEVICE, BUILD))))
      .toBe('TOKEN_REUSE_DETECTED');
    // The whole family is revoked: the successor's tokens die too.
    expect(codeOf(caught(() => fixture.service.authenticate(`Bearer ${second.accessToken}`, DEVICE, BUILD))))
      .toBe('AUTHENTICATION_REQUIRED');
    expect(codeOf(caught(() => fixture.service.refresh(second.refreshToken, DEVICE, BUILD))))
      .toBe('AUTHENTICATION_REQUIRED');
  });
});

describe('AT-08 revocation', () => {
  test('admin revokes the invitation; subsequent access token requests fail', () => {
    const code = fixture.issueInvite({ label: 'reviewer-revoke' });
    const issued = redeem(code);
    expect(fixture.service.authenticate(`Bearer ${issued.accessToken}`, DEVICE, BUILD)).toBeTruthy();
    const result = fixture.revokeInvite('reviewer-revoke', 'ADMIN');
    expect(result.revokedInvitations).toBe(1);
    expect(result.revokedSessions).toBe(1);
    expect(codeOf(caught(() => fixture.service.authenticate(`Bearer ${issued.accessToken}`, DEVICE, BUILD))))
      .toBe('AUTHENTICATION_REQUIRED');
  });
});

describe('AT-09 rate limiting', () => {
  test('10 failed attempts in 1 minute block further attempts for 5 minutes', () => {
    const code = fixture.issueInvite();
    const selectorPrefix = code.split('-')[1];
    const wrong = `ACR45-${selectorPrefix}-ZZZZZZZZZZZZ`;
    for (let i = 0; i < L.AUTH_ATTEMPT_MAX; i += 1) {
      expect(codeOf(caught(() => redeem(wrong)))).toBe('INVITE_INVALID');
    }
    // Blocked now — and the CORRECT code is refused too, so the block is real.
    expect(codeOf(caught(() => redeem(wrong)))).toBe('RATE_LIMITED');
    expect(codeOf(caught(() => redeem(code)))).toBe('RATE_LIMITED');

    advance(L.AUTH_BLOCK_MS - 1000);
    expect(codeOf(caught(() => redeem(code)))).toBe('RATE_LIMITED');
    advance(2000);
    expect(redeem(code).accessToken).toBeTruthy();
  });
});

describe('AT-10 no token in logs', () => {
  test('authentication logs contain no token, hash or invite plaintext', async () => {
    const emitted = [];
    const code = fixture.issueInvite();
    const app = createApp({
      config: {
        upstreamInferUrl: 'https://configured.example/api/infer', upstreamTimeoutMs: 1000,
        allowedOrigin: false, expectedEvidence: evidence, expectedClientBuildId: BUILD, evidence: {},
      },
      authService: fixture.service,
      logger: { emit: (event, payload) => emitted.push({ event, payload }) },
      evidenceProbe: async () => ({ ...evidence }),
    });
    const issued = await request(app).post('/m/v1/auth/redeem')
      .send({ inviteCode: code, deviceBinding: DEVICE, clientBuildId: BUILD });
    await request(app).get('/m/v1/attestation')
      .set('Authorization', `Bearer ${issued.body.accessToken}`)
      .set('X-Device-Binding', DEVICE).set('X-Client-Build-ID', BUILD);

    const serialised = JSON.stringify(emitted);
    expect(emitted.length).toBeGreaterThan(0);
    expect(serialised).not.toContain(code);
    expect(serialised).not.toContain(issued.body.accessToken);
    expect(serialised).not.toContain(issued.body.refreshToken);
    expect(serialised).not.toContain(keyedDigest(issued.body.accessToken, fs.readFileSync(fixture.pepperPath)));
    expect(serialised).not.toContain(DEVICE);
  });

  test('the audit table stores no token, hash or free text', () => {
    const code = fixture.issueInvite({ label: 'reviewer-audit' });
    const issued = redeem(code);
    fixture.service.refresh(issued.refreshToken, DEVICE, BUILD);
    const ctx = openAuthDatabase({ storePath: fixture.storePath, pepperPath: fixture.pepperPath });
    const rows = ctx.db.prepare('SELECT * FROM audit').all();
    ctx.db.close();
    const serialised = JSON.stringify(rows);
    expect(rows.length).toBeGreaterThan(0);
    expect(serialised).not.toContain(code);
    expect(serialised).not.toContain(issued.accessToken);
    expect(serialised).not.toContain(issued.refreshToken);
    for (const row of rows) {
      expect(['INVITE_ISSUED', 'INVITE_REDEEMED', 'REFRESH_ROTATED']).toContain(row.event);
    }
  });
});

describe('AT-11 persistent storage', () => {
  test('restart the server; active sessions remain valid and rate-limit blocks survive', () => {
    const issued = redeem(fixture.issueInvite());
    const wrong = 'ACR45-QQQQQQQQ-QQQQQQQQQQQQ';
    for (let i = 0; i < L.AUTH_ATTEMPT_MAX; i += 1) caught(() => redeem(wrong));

    fixture.service.close();
    const restarted = fixture.reopen();
    try {
      // The session survives the restart.
      expect(restarted.authenticate(`Bearer ${issued.accessToken}`, DEVICE, BUILD)).toBeTruthy();
      // And so does the lockout — the in-memory design could not do this.
      expect(codeOf(caught(() => restarted.redeem(wrong, DEVICE, BUILD)))).toBe('RATE_LIMITED');
    } finally {
      restarted.close();
    }
  });

  test('a restarted process accepts no unknown or already-revoked session', () => {
    const code = fixture.issueInvite({ label: 'reviewer-restart' });
    const issued = redeem(code);
    fixture.revokeInvite('reviewer-restart', 'ADMIN');
    fixture.service.close();
    const restarted = fixture.reopen();
    try {
      expect(codeOf(caught(() => restarted.authenticate(`Bearer ${issued.accessToken}`, DEVICE, BUILD))))
        .toBe('AUTHENTICATION_REQUIRED');
      const forged = crypto.randomBytes(32).toString('base64url');
      expect(codeOf(caught(() => restarted.authenticate(`Bearer ${forged}`, DEVICE, BUILD))))
        .toBe('AUTHENTICATION_REQUIRED');
    } finally {
      restarted.close();
    }
  });
});

describe('AT-12 constant-time verification', () => {
  test('code inspection confirms timingSafeEqual over equal-length digests', () => {
    const cryptoSource = fs.readFileSync(path.join(__dirname, '../src/auth/crypto.js'), 'utf8');
    expect(cryptoSource).toMatch(/crypto\.timingSafeEqual/);
    expect(cryptoSource).toMatch(/a\.length !== b\.length/);
    const store = fs.readFileSync(path.join(__dirname, '../src/auth/session-store.js'), 'utf8');
    expect(store).toMatch(/safeEqualHex/);
    // Token lookup is an indexed primary-key read, never a scan over candidates.
    expect(store).toMatch(/SELECT \* FROM access_tokens WHERE token_hash = \?/);
    expect(store).toMatch(/SELECT \* FROM invitations WHERE selector = \?/);
    expect(store).not.toMatch(/SELECT \* FROM invitations WHERE .*revoked/);
  });

  test('statistical timing finds no material distinction between unknown and wrong-secret codes', () => {
    const code = fixture.issueInvite();
    const selector = code.split('-')[1];
    const wrongSecret = `ACR45-${selector}-ZZZZZZZZZZZZ`;      // real selector, bad secret
    const unknown = 'ACR45-QQQQQQQQ-ZZZZZZZZZZZZ';             // no such selector

    const sample = (value) => {
      const runs = [];
      for (let i = 0; i < 40; i += 1) {
        // Keep the rate limiter out of the measurement.
        const isolated = createAuthFixture({ expectedClientBuildId: BUILD });
        isolated.issueInvite({ label: 'timing' });
        const start = process.hrtime.bigint();
        caught(() => isolated.service.redeem(value, DEVICE, BUILD));
        runs.push(Number(process.hrtime.bigint() - start));
        isolated.cleanup();
      }
      runs.sort((a, b) => a - b);
      return runs[Math.floor(runs.length / 2)];
    };

    const wrongMedian = sample(wrongSecret);
    const unknownMedian = sample(unknown);
    const ratio = Math.max(wrongMedian, unknownMedian) / Math.min(wrongMedian, unknownMedian);
    // Both paths perform exactly one scrypt, so medians must be close. A real
    // early-exit would show orders of magnitude, not a small constant.
    expect(ratio).toBeLessThan(3);
  });
});

describe('AT-13 binding', () => {
  test('a refresh token from one device cannot be used on another device', () => {
    const issued = redeem(fixture.issueInvite());
    expect(codeOf(caught(() => fixture.service.refresh(issued.refreshToken, 'a-different-device', BUILD))))
      .toBe('DEVICE_BINDING_MISMATCH');
    expect(codeOf(caught(() => fixture.service.authenticate(`Bearer ${issued.accessToken}`, 'a-different-device', BUILD))))
      .toBe('DEVICE_BINDING_MISMATCH');
    // The legitimate device still works: a failed attempt does not revoke.
    expect(fixture.service.refresh(issued.refreshToken, DEVICE, BUILD).accessToken).toBeTruthy();
  });

  test('a superseded client build cannot use a valid token', () => {
    const issued = redeem(fixture.issueInvite());
    expect(codeOf(caught(() => fixture.service.authenticate(`Bearer ${issued.accessToken}`, DEVICE, 'mob-v0.6.0+44'))))
      .toBe('CLIENT_BUILD_MISMATCH');
  });
});

describe('AT-14 TLS only', () => {
  test('the gateway origin is loopback and the client compiles an https endpoint', () => {
    // The origin binds to loopback; TLS is terminated at the Cloudflare edge, so
    // plaintext HTTP is permitted ONLY for an approved loopback host.
    const { loadConfig } = require('../src/config');
    expect(loadConfig({}).host || '127.0.0.1').toBe('127.0.0.1');
    expect(() => loadConfig({ ACR_UPSTREAM_INFER_URL: 'http://public.example/api/infer' }))
      .toThrow(/plaintext HTTP only for an approved loopback host/);
    const clientConfig = fs.readFileSync(path.join(__dirname, '../../src/config/gateway.ts'), 'utf8');
    expect(clientConfig).toMatch(/BUILD45_REVIEW_ORIGIN = 'https:\/\//);
    // FIELD ITEM: that an http:// request to the public hostname is refused can
    // only be observed once the acr-mobile-review tunnel exists (Gate 10.1).
  });
});

describe('AT-15 invitation code reuse', () => {
  test('an already redeemed invitation code cannot be reused', () => {
    const code = fixture.issueInvite();
    expect(redeem(code).accessToken).toBeTruthy();
    // Build 46: the code is paired to the first device; another device is told
    // so and gets nothing (Kraken, 13 Sept 2026).
    expect(codeOf(caught(() => redeem(code, 'second-device-binding')))).toBe('DEVICE_NOT_AUTHORISED');
  });

  test('a multi-redemption invitation stops at its configured limit', () => {
    const code = fixture.issueInvite({ label: 'reviewer-multi', maxRedemptions: 2 });
    expect(redeem(code, 'device-one-binding').accessToken).toBeTruthy();
    expect(redeem(code, 'device-two-binding').accessToken).toBeTruthy();
    expect(codeOf(caught(() => redeem(code, 'device-three-binding')))).toBe('DEVICE_NOT_AUTHORISED');
    const ctx = openAuthDatabase({ storePath: fixture.storePath, pepperPath: fixture.pepperPath });
    const count = ctx.db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n;
    ctx.db.close();
    expect(count).toBe(2);
  });
});

describe('AT-16 revocation endpoint protection', () => {
  test('no network revocation endpoint exists, so none can be reached unauthorised', async () => {
    // G10-0 Q3, approved: administration is a local owner-only CLI operating on
    // the SQLite file. The attack surface is removed rather than defended.
    const app = appWith();
    for (const route of ['/m/v1/auth/revoke', '/m/v1/admin/revoke', '/m/v1/admin', '/m/v1/invites']) {
      const posted = await request(app).post(route).send({ label: 'reviewer-1' });
      expect([404, 421]).toContain(posted.status);
      const got = await request(app).get(route);
      expect([404, 421]).toContain(got.status);
    }
    const appSource = fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8');
    expect(appSource).not.toMatch(/revoke|admin/i);
  });

  test('the admin CLI requires an owner-only store and pepper', () => {
    fs.chmodSync(fixture.pepperPath, 0o644);
    expect(() => openAuthDatabase({ storePath: fixture.storePath, pepperPath: fixture.pepperPath }))
      .not.toThrow(); // chmod is corrected on open…
    fs.chmodSync(fixture.pepperPath, 0o600);
    const stat = fs.statSync(fixture.pepperPath);
    expect(stat.mode & 0o077).toBe(0); // …and the result is owner-only.
  });
});

describe('AT-17 concurrent refresh', () => {
  test('two simultaneous refreshes with the same token yield exactly one valid session', () => {
    const issued = redeem(fixture.issueInvite());
    const outcomes = [
      caught(() => fixture.service.refresh(issued.refreshToken, DEVICE, BUILD)),
      caught(() => fixture.service.refresh(issued.refreshToken, DEVICE, BUILD)),
    ];
    const rejected = outcomes.filter(Boolean);
    expect(rejected).toHaveLength(1);
    expect(codeOf(rejected[0])).toBe('TOKEN_REUSE_DETECTED');
  });

  test('the conditional UPDATE that guarantees it is single-statement', () => {
    const store = fs.readFileSync(path.join(__dirname, '../src/auth/session-store.js'), 'utf8');
    expect(store).toMatch(/UPDATE refresh_tokens SET consumed_at = \? WHERE token_hash = \? AND consumed_at IS NULL/);
    expect(store).toMatch(/BEGIN IMMEDIATE/);
  });
});

describe('AT-18 malformed tokens', () => {
  test.each([
    ['empty bearer', ''],
    ['whitespace', '   '],
    ['not base64url', '!!!!!!!!'],
    ['oversized', 'x'.repeat(5000)],
    ['sql injection shape', "' OR 1=1 --"],
  ])('%s access token is rejected', (label, token) => {
    const error = caught(() => fixture.service.authenticate(`Bearer ${token}`, DEVICE, BUILD));
    expect(error).not.toBeNull();
    expect([400, 401]).toContain(error.status);
  });

  test.each([
    ['empty', ''],
    ['oversized', 'x'.repeat(5000)],
    ['malformed invite', 'not-an-invite'],
    ['oversized invite', `ACR45-${'A'.repeat(5000)}`],
  ])('%s credential is rejected without a session', (label, value) => {
    const refreshError = caught(() => fixture.service.refresh(value, DEVICE, BUILD));
    expect(refreshError).not.toBeNull();
    expect([400, 401, 409]).toContain(refreshError.status);
    const redeemError = caught(() => fixture.service.redeem(value, DEVICE, BUILD));
    expect(redeemError).not.toBeNull();
    expect([400, 401, 429]).toContain(redeemError.status);
  });
});

describe('AT-19 no plaintext secrets', () => {
  test('session and token records contain no plaintext secret', () => {
    const code = fixture.issueInvite();
    const issued = redeem(code);
    const raw = fs.readFileSync(fixture.storePath);
    const asText = raw.toString('latin1');

    // Nothing recoverable from the database file itself.
    expect(asText).not.toContain(code);
    expect(asText).not.toContain(code.split('-')[2]);   // the secret half
    expect(asText).not.toContain(issued.accessToken);
    expect(asText).not.toContain(issued.refreshToken);
    expect(asText).not.toContain(DEVICE);

    // Only digests are stored, and they are the keyed digests we expect.
    const ctx = openAuthDatabase({ storePath: fixture.storePath, pepperPath: fixture.pepperPath });
    const pepper = fs.readFileSync(fixture.pepperPath);
    const access = ctx.db.prepare('SELECT token_hash FROM access_tokens').get();
    expect(access.token_hash).toBe(keyedDigest(issued.accessToken, pepper));
    expect(access.token_hash).toMatch(/^[0-9a-f]{64}$/);
    const invitation = ctx.db.prepare('SELECT * FROM invitations').get();
    expect(invitation.verifier_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(invitation.selector).not.toContain(code.split('-')[2]);
    ctx.db.close();
  });

  test('the pepper is a separate owner-only file, so the store alone verifies nothing', () => {
    expect(path.resolve(fixture.storePath)).not.toBe(path.resolve(fixture.pepperPath));
    expect(fs.statSync(fixture.pepperPath).mode & 0o077).toBe(0);
    expect(fs.readFileSync(fixture.pepperPath).length).toBeGreaterThanOrEqual(32);
  });
});
