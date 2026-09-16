'use strict';

/**
 * Build 46 — device pairing (Kraken, 13 September 2026).
 *
 * One invite code pairs with one device. The random install identifier held in
 * the device's secure keystore stands in for the IMEI, which neither iOS nor
 * Android 10+ lets an app read. The fixed 30-day term runs from pairing. The
 * paired device may enter its code again; any other device is told "Incorrect
 * device used"; an expired code says so. Also the 45 → 46 changeover.
 */

const request = require('supertest');
const { createApp } = require('../src/app');
const { loadConfig } = require('../src/config');
const { createAuthFixture } = require('./auth-helpers');
const { openAuthDatabase } = require('../src/auth/db');
const { sessions: listSessions } = require('../src/auth/invite-admin');
const L = require('../src/auth/lifetimes');
const { evidence, mobileRequest } = require('./helpers');

const BUILD = 'mob-v0.6.5+46';
const PREVIOUS = 'mob-v0.6.5+45';
const PHONE = 'paired-phone-install-binding';
const OTHER = 'other-phone-install-binding';
const DAY = 24 * 60 * 60 * 1000;
const START = Date.parse('2026-09-13T10:20:30Z');

let fixture;
let clock;

beforeEach(() => {
  clock = START;
  fixture = createAuthFixture({ expectedClientBuildId: BUILD, now: () => clock });
});
afterEach(() => fixture.cleanup());

const advance = (ms) => { clock += ms; };
const redeem = (code, device = PHONE, build = BUILD) => fixture.service.redeem(code, device, build);
function caught(fn) {
  try { fn(); return null; } catch (error) { return error; }
}
function withDb(fn) {
  const ctx = openAuthDatabase({ storePath: fixture.storePath, pepperPath: fixture.pepperPath });
  try { return fn(ctx); } finally { ctx.db.close(); }
}

describe('first pairing', () => {
  test('returns the pairing time and the fixed term, which runs from pairing, not from issue', () => {
    const code = fixture.issueInvite();
    advance(3 * DAY);
    const issued = redeem(code);
    expect(issued.pairing).toBe('NEW');
    expect(issued.pairedAt).toBe(new Date(clock).toISOString());
    expect(issued.sessionDays).toBe(30);
    expect(Date.parse(issued.refreshExpiresAt)).toBe(clock + L.SESSION_MS);
  });

  test('the admin listing records the invite, the build and the pairing time as DDMMYY-HHMMSS (UTC)', () => {
    redeem(fixture.issueInvite({ label: 'reviewer-stamp' }));
    const [row] = withDb((ctx) => listSessions(ctx, { now: clock }));
    expect(row).toMatchObject({ label: 'reviewer-stamp', pairedUtc: '130926-102030', build: BUILD, live: true });
    // The device appears only as its keyed hash inside the database, never in the listing.
    expect(JSON.stringify(row)).not.toContain(PHONE);
  });
});

describe('the paired device enters its code again', () => {
  test('signs in on the same session: the expiry does not move and earlier tokens stop working', () => {
    const code = fixture.issueInvite();
    const first = redeem(code);
    advance(10 * DAY);
    const again = redeem(code);
    expect(again.pairing).toBe('EXISTING');
    expect(again.pairedAt).toBe(first.pairedAt);
    expect(again.refreshExpiresAt).toBe(first.refreshExpiresAt);
    expect(caught(() => fixture.service.refresh(first.refreshToken, PHONE, BUILD)).code).toBe('AUTHENTICATION_REQUIRED');
    expect(fixture.service.refresh(again.refreshToken, PHONE, BUILD).accessToken).toBeTruthy();
    expect(withDb((ctx) => ctx.db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n)).toBe(1);
  });

  test('still works after the 7-day activation window, inside the 30 days', () => {
    const code = fixture.issueInvite();
    redeem(code);
    advance(L.INVITE_ACTIVATION_MS + DAY);
    expect(redeem(code).pairing).toBe('EXISTING');
  });
});

describe('another device enters a paired code', () => {
  test('is told "Incorrect device used" (403), gets no tokens, and the paired phone is unaffected', () => {
    const code = fixture.issueInvite();
    const issued = redeem(code);
    const error = caught(() => redeem(code, OTHER));
    expect(error.code).toBe('DEVICE_NOT_AUTHORISED');
    expect(error.status).toBe(403);
    expect(error.message).toMatch(/^Incorrect device used/);
    expect(fixture.service.refresh(issued.refreshToken, PHONE, BUILD).accessToken).toBeTruthy();
    expect(withDb((ctx) => ctx.db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n)).toBe(1);
  });

  test('a wrong or unknown code is still the generic INVITE_INVALID (AT-12 unchanged)', () => {
    const code = fixture.issueInvite();
    redeem(code);
    const [prefix, selector] = code.split('-');
    expect(caught(() => redeem(`${prefix}-${selector}-ZZZZZZZZZZZZ`, OTHER)).code).toBe('INVITE_INVALID');
    expect(caught(() => redeem('ACR45-ZZZZZZZZ-ZZZZZZZZZZZZ', OTHER)).code).toBe('INVITE_INVALID');
  });

  test('answers to a correct code do not count towards the rate limit', () => {
    const code = fixture.issueInvite();
    redeem(code);
    for (let i = 0; i < L.AUTH_ATTEMPT_MAX + 5; i += 1) {
      expect(caught(() => redeem(code, OTHER)).code).toBe('DEVICE_NOT_AUTHORISED');
    }
    expect(redeem(code).pairing).toBe('EXISTING');
  });
});

describe('expiry', () => {
  test('after 30 days the code reports INVITE_EXPIRED on the paired device and on any other', () => {
    const code = fixture.issueInvite();
    redeem(code);
    advance(L.SESSION_MS + 1);
    for (const device of [PHONE, OTHER]) {
      const error = caught(() => redeem(code, device));
      expect(error.code).toBe('INVITE_EXPIRED');
      expect(error.status).toBe(401);
      expect(error.message).toBe('Invite Code Expired. Request a refreshed one.');
    }
  });

  test('an unused code past its 7-day activation window reports INVITE_EXPIRED', () => {
    const code = fixture.issueInvite();
    advance(L.INVITE_ACTIVATION_MS + 1);
    expect(caught(() => redeem(code)).code).toBe('INVITE_EXPIRED');
  });

  test('a revoked code stays the generic INVITE_INVALID, on every device', () => {
    const code = fixture.issueInvite({ label: 'reviewer-revoked' });
    redeem(code);
    fixture.revokeInvite('reviewer-revoked', 'LOST');
    expect(caught(() => redeem(code)).code).toBe('INVITE_INVALID');
    expect(caught(() => redeem(code, OTHER)).code).toBe('INVITE_INVALID');
  });
});

describe('Build 46 changeover (option a)', () => {
  let old;
  let service;
  beforeEach(() => {
    old = createAuthFixture({ expectedClientBuildId: PREVIOUS, now: () => clock });
  });
  afterEach(() => {
    if (service) service.close();
    service = null;
    old.cleanup();
  });

  test('a Build 45 session keeps working, moves to 46 on the first 46 refresh, and never moves back', () => {
    const issued = old.service.redeem(old.issueInvite(), PHONE, PREVIOUS);
    service = old.reopen({ expectedClientBuildId: BUILD, previousClientBuildIds: [PREVIOUS] });

    const stillOld = service.refresh(issued.refreshToken, PHONE, PREVIOUS);
    const updated = service.refresh(stillOld.refreshToken, PHONE, BUILD);
    expect(service.authenticate(`Bearer ${updated.accessToken}`, PHONE, BUILD)).toBeTruthy();
    expect(updated.refreshExpiresAt).toBe(issued.refreshExpiresAt);
    expect(caught(() => service.authenticate(`Bearer ${updated.accessToken}`, PHONE, PREVIOUS)).code).toBe('CLIENT_BUILD_MISMATCH');
    expect(caught(() => service.refresh(updated.refreshToken, PHONE, PREVIOUS)).code).toBe('CLIENT_BUILD_MISMATCH');
    // The refused downgrade consumed nothing: the updated app carries on.
    expect(service.refresh(updated.refreshToken, PHONE, BUILD).accessToken).toBeTruthy();
    const events = service.db.prepare('SELECT event FROM audit').all().map((row) => row.event);
    expect(events).toContain('CLIENT_BUILD_UPGRADED');
  });

  test('without the changeover setting a Build 45 session is refused, exactly as before', () => {
    const issued = old.service.redeem(old.issueInvite(), PHONE, PREVIOUS);
    service = old.reopen({ expectedClientBuildId: BUILD });
    expect(caught(() => service.refresh(issued.refreshToken, PHONE, BUILD)).code).toBe('CLIENT_BUILD_MISMATCH');
  });

  test('a previous build can never pair a device', () => {
    service = old.reopen({ expectedClientBuildId: BUILD, previousClientBuildIds: [PREVIOUS] });
    expect(caught(() => service.redeem(old.issueInvite(), PHONE, PREVIOUS)).code).toBe('CLIENT_BUILD_MISMATCH');
  });

  test('configuration: the previous-build list is optional and validated', () => {
    expect(loadConfig({}).previousClientBuildIds).toEqual([]);
    expect(loadConfig({ ACR_PREVIOUS_CLIENT_BUILD_IDS: ` ${PREVIOUS} ` }).previousClientBuildIds).toEqual([PREVIOUS]);
    expect(() => loadConfig({ ACR_PREVIOUS_CLIENT_BUILD_IDS: 'forty-five' })).toThrow(/ACR_PREVIOUS_CLIENT_BUILD_IDS/);
    expect(() => loadConfig({ ACR_EXPECTED_CLIENT_BUILD_ID: BUILD, ACR_PREVIOUS_CLIENT_BUILD_IDS: BUILD })).toThrow(/must not repeat the current build/);
  });

  test('an assessment body must name the same build as its authenticated header', async () => {
    const issued = old.service.redeem(old.issueInvite(), PHONE, PREVIOUS);
    service = old.reopen({ expectedClientBuildId: BUILD, previousClientBuildIds: [PREVIOUS] });
    const updated = service.refresh(issued.refreshToken, PHONE, BUILD);
    const app = createApp({
      config: {
        upstreamInferUrl: null, upstreamTimeoutMs: 1000, allowedOrigin: false, expectedEvidence: evidence,
        expectedClientBuildId: BUILD, previousClientBuildIds: [PREVIOUS], evidence: {},
      },
      authService: service,
      evidenceProbe: async () => ({ ...evidence }),
    });
    const send = (body) => request(app).post('/m/v1/infer')
      .set('Authorization', `Bearer ${updated.accessToken}`)
      .set('X-Device-Binding', PHONE).set('X-Client-Build-ID', BUILD)
      .set('X-ACR-Contract', 'acr.cds.v1').set('X-Request-ID', body.requestId)
      .send(body);

    const staleBody = mobileRequest();
    expect(staleBody.client.buildId).toBe(PREVIOUS);
    const refused = await send(staleBody);
    expect(refused.status).toBe(403);
    expect(refused.body.error.code).toBe('CLIENT_BUILD_MISMATCH');

    const matching = await send({ ...staleBody, client: { ...staleBody.client, buildId: BUILD } });
    expect(matching.body.error ? matching.body.error.code : null).not.toBe('CLIENT_BUILD_MISMATCH');
  });
});
