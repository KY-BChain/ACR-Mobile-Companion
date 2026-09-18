'use strict';

/**
 * Build 48 — retention (Kraken, 18 September 2026).
 *
 * The reviewer privacy notice promises that records are deleted 30 days after
 * they stop being current. `acr-invite purge` is what keeps that promise: it
 * removes expired or revoked invitations, their sessions and tokens, old audit
 * rows and spent rate-limit counters, and it never touches a live pairing.
 */

const { execFileSync } = require('child_process');
const path = require('path');
const { createAuthFixture } = require('./auth-helpers');
const { openAuthDatabase } = require('../src/auth/db');
const { purge, revoke, sessions } = require('../src/auth/invite-admin');
const L = require('../src/auth/lifetimes');

const BUILD = 'mob-v0.6.7+48';
const DAY = 24 * 60 * 60 * 1000;

let fixture;
let clock;

beforeEach(() => {
  clock = Date.parse('2026-09-18T09:00:00Z');
  fixture = createAuthFixture({ expectedClientBuildId: BUILD, now: () => clock });
});
afterEach(() => fixture.cleanup());

function withDb(fn) {
  const ctx = openAuthDatabase({ storePath: fixture.storePath, pepperPath: fixture.pepperPath });
  try { return fn(ctx); } finally { ctx.db.close(); }
}
const pair = (label, device) => {
  const code = fixture.issueInvite({ org: 'TEST', label });
  fixture.service.redeem(code, device, BUILD);
};

test('the retention period is the 30 days the privacy notice states', () => {
  expect(L.RETENTION_MS).toBe(30 * DAY);
});

test('a live pairing is never purged, however old the store is', () => {
  pair('live-phone', 'device-live');
  const before = withDb((ctx) => purge(ctx, { now: clock, apply: true }));
  expect(before).toMatchObject({ sessions: 0, invitations: 0, applied: true });
  expect(withDb((ctx) => sessions(ctx, { now: clock }))).toHaveLength(1);
});

test('a session expired longer than the retention period is deleted with its tokens', () => {
  pair('old-phone', 'device-old');
  // 30 days of validity, then 31 days of retention: 61 days on.
  const later = clock + 61 * DAY;
  const dry = withDb((ctx) => purge(ctx, { now: later }));
  expect(dry).toMatchObject({ sessions: 1, invitations: 1, applied: false });
  expect(withDb((ctx) => sessions(ctx, { now: later }))).toHaveLength(1);

  const applied = withDb((ctx) => purge(ctx, { now: later, apply: true }));
  expect(applied).toMatchObject({ sessions: 1, invitations: 1, applied: true });
  expect(withDb((ctx) => sessions(ctx, { now: later }))).toHaveLength(0);
  withDb((ctx) => {
    expect(ctx.db.prepare('SELECT COUNT(*) AS n FROM invitations').get().n).toBe(0);
    expect(ctx.db.prepare('SELECT COUNT(*) AS n FROM access_tokens').get().n).toBe(0);
    expect(ctx.db.prepare('SELECT COUNT(*) AS n FROM refresh_tokens').get().n).toBe(0);
    expect(ctx.db.prepare('SELECT COUNT(*) AS n FROM audit WHERE at <= ?').get(later - L.RETENTION_MS).n).toBe(0);
  });
});

test('a session expired inside the retention period is kept', () => {
  pair('recent-phone', 'device-recent');
  const later = clock + 31 * DAY; // expired yesterday, retention not yet run out
  expect(withDb((ctx) => purge(ctx, { now: later, apply: true })))
    .toMatchObject({ sessions: 0, invitations: 0 });
  expect(withDb((ctx) => sessions(ctx, { now: later }))).toHaveLength(1);
});

test('a revoked pairing is purged from its revocation, not from its expiry', () => {
  pair('revoked-phone', 'device-revoked');
  const revokedAt = clock + 2 * DAY;
  withDb((ctx) => revoke(ctx, { label: 'revoked-phone', reason: 'LOST', now: revokedAt }));
  expect(withDb((ctx) => purge(ctx, { now: revokedAt + 29 * DAY, apply: true }))).toMatchObject({ sessions: 0 });
  expect(withDb((ctx) => purge(ctx, { now: revokedAt + 31 * DAY, apply: true })))
    .toMatchObject({ sessions: 1, invitations: 1, applied: true });
});

test('an invitation keeps its record while any session of its own survives', () => {
  const start = clock;
  const code = fixture.issueInvite({ org: 'TEST', label: 'two-phones', maxRedemptions: 2 });
  fixture.service.redeem(code, 'device-a', BUILD);
  clock = start + 5 * DAY;                 // inside the 7-day activation window
  fixture.service.redeem(code, 'device-b', BUILD);
  // Each session runs 30 days from its own pairing, so on day 61 the retention
  // period has run out for the first pairing only.
  const later = start + 61 * DAY;
  const result = withDb((ctx) => purge(ctx, { now: later, apply: true }));
  expect(result.sessions).toBe(1);
  expect(result.invitations).toBe(0);
  withDb((ctx) => expect(ctx.db.prepare('SELECT COUNT(*) AS n FROM invitations').get().n).toBe(1));
});

test('the command line reports before it deletes, and deletes only with --confirm', () => {
  pair('cli-phone', 'device-cli');
  const cli = path.join(__dirname, '../src/auth/invite-admin.js');
  const env = { ...process.env, ACR_AUTH_STORE_PATH: fixture.storePath, ACR_AUTH_PEPPER_PATH: fixture.pepperPath };
  const run = (...args) => execFileSync(process.execPath, [cli, 'purge', ...args], { env, encoding: 'utf8' });

  const dry = run('--days', '1');
  expect(dry).toMatch(/Would delete/);
  expect(dry).toMatch(/Nothing was deleted\. Add --confirm to apply\./);
  expect(withDb((ctx) => sessions(ctx, { now: clock }))).toHaveLength(1);

  expect(run('--days', '9999', '--confirm')).toMatch(/Deleted/);
  expect(withDb((ctx) => sessions(ctx, { now: clock }))).toHaveLength(1); // still live, so still there

  expect(() => execFileSync(process.execPath, [cli, 'purge', '--days', '0'], { env, encoding: 'utf8', stdio: 'pipe' }))
    .toThrow(/whole number of days/);
});
