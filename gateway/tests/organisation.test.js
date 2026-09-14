'use strict';

/**
 * Build 46 Part A — organisation-tagged invite codes (Kraken, 14 September 2026).
 *
 * New codes read ACR-<ORG>-<selector>-<secret>, the tag from a fixed list, so
 * the invitee's organisation shows in the code and in the admin listings. Codes
 * are read case-insensitively, with O as 0 and I/L as 1. Legacy ACR45 codes
 * keep working, and a code can never be re-tagged.
 */

const path = require('path');
const { execFileSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');
const { createAuthFixture } = require('./auth-helpers');
const { openAuthDatabase } = require('../src/auth/db');
const { list, sessions } = require('../src/auth/invite-admin');
const { parseInviteCode } = require('../src/auth/crypto');
const { ORGANISATIONS } = require('../src/auth/organisations');
const L = require('../src/auth/lifetimes');

const BUILD = 'mob-v0.6.5+46';
const PHONE = 'org-test-phone-binding';
const CODE_CHARS = '[0-9A-HJKMNP-TV-Z]';

let fixture;
let clock;

beforeEach(() => {
  clock = Date.parse('2026-09-14T09:00:00Z');
  fixture = createAuthFixture({ expectedClientBuildId: BUILD, now: () => clock });
});
afterEach(() => fixture.cleanup());

const redeem = (code, device = PHONE) => fixture.service.redeem(code, device, BUILD);
function caught(fn) {
  try { fn(); return null; } catch (error) { return error; }
}
function withDb(fn) {
  const ctx = openAuthDatabase({ storePath: fixture.storePath, pepperPath: fixture.pepperPath });
  try { return fn(ctx); } finally { ctx.db.close(); }
}

describe('issuing', () => {
  test('a tagged code reads ACR-<ORG>-<8>-<12> and the listing records the organisation', () => {
    const code = fixture.issueInvite({ org: 'ZZU', label: 'zzu-001' });
    expect(code).toMatch(new RegExp(`^ACR-ZZU-${CODE_CHARS}{8}-${CODE_CHARS}{12}$`));
    const [row] = withDb((ctx) => list(ctx, { now: clock }));
    expect(row).toMatchObject({ org: 'ZZU', label: 'zzu-001' });
  });

  test('only organisations on the fixed list can be issued', () => {
    expect(ORGANISATIONS).toEqual(expect.arrayContaining(['ZZU', 'UCD', 'HKU', 'TEST']));
    for (const org of ['ZZX', 'zzu', 'Z', 'ZZU1', '']) {
      expect(() => fixture.issueInvite({ org })).toThrow(/known organisation/);
    }
  });

  test('the command-line tool requires --org and shows the organisation', () => {
    const env = { ...process.env, ACR_AUTH_STORE_PATH: fixture.storePath, ACR_AUTH_PEPPER_PATH: fixture.pepperPath };
    const tool = path.join(__dirname, '../src/auth/invite-admin.js');
    const run = (args) => {
      try {
        return { ok: true, out: execFileSync('node', [tool, ...args], { env, encoding: 'utf8', stdio: 'pipe' }) };
      } catch (error) {
        return { ok: false, out: `${error.stdout}${error.stderr}` };
      }
    };
    const missing = run(['issue', '--label', 'cli-missing', '--issued-by', 'Kraken']);
    expect(missing.ok).toBe(false);
    expect(missing.out).toMatch(/--org is required/);
    const issued = run(['issue', '--org', 'HKU', '--label', 'hku-cli', '--issued-by', 'Kraken']);
    expect(issued.ok).toBe(true);
    expect(issued.out).toMatch(new RegExp(`code: +ACR-HKU-${CODE_CHARS}{8}-${CODE_CHARS}{12}`));
    expect(issued.out).toMatch(/organisation: +HKU/);
  });
});

describe('redeeming', () => {
  test('a tagged code pairs a device and the sessions listing shows its organisation', () => {
    const code = fixture.issueInvite({ org: 'HKU', label: 'hku-001' });
    expect(redeem(code).pairing).toBe('NEW');
    const [row] = withDb((ctx) => sessions(ctx, { now: clock }));
    expect(row).toMatchObject({ org: 'HKU', label: 'hku-001', live: true });
  });

  test('capitals, look-alike letters and surrounding spaces do not matter', () => {
    const code = fixture.issueInvite({ org: 'UCD' });
    const typed = code.toLowerCase().replace(/0/g, 'o').replace(/1/g, 'l');
    expect(redeem(`  ${typed}  `).pairing).toBe('NEW');
    expect(redeem(code.replace(/1/g, 'I')).pairing).toBe('EXISTING');
  });

  test('a swapped organisation tag is refused exactly like a wrong secret', () => {
    const code = fixture.issueInvite({ org: 'ZZU' });
    expect(caught(() => redeem(code.replace(/^ACR-ZZU-/, 'ACR-HKU-'))).code).toBe('INVITE_INVALID');
    expect(caught(() => redeem(code.replace(/^ACR-ZZU-/, 'ACR45-'))).code).toBe('INVITE_INVALID');
    expect(redeem(code).pairing).toBe('NEW');
  });

  test('swapped tags count towards the rate limit', () => {
    const code = fixture.issueInvite({ org: 'ZZU' });
    const swapped = code.replace(/^ACR-ZZU-/, 'ACR-UCD-');
    for (let i = 0; i < L.AUTH_ATTEMPT_MAX; i += 1) {
      expect(caught(() => redeem(swapped)).code).toBe('INVITE_INVALID');
    }
    expect(caught(() => redeem(code)).code).toBe('RATE_LIMITED');
  });

  test('legacy ACR45 codes keep working and cannot be re-tagged', () => {
    const legacy = fixture.issueInvite();
    expect(legacy).toMatch(/^ACR45-/);
    expect(caught(() => redeem(legacy.replace(/^ACR45-/, 'ACR-TEST-'))).code).toBe('INVITE_INVALID');
    expect(redeem(legacy.toLowerCase()).pairing).toBe('NEW');
  });
});

describe('parsing', () => {
  test.each([
    ['too short', 'ACR-ZZU-AAAAAAAA'],
    ['one-letter tag', 'ACR-Z-AAAAAAAA-BBBBBBBBBBBB'],
    ['tag with a digit', 'ACR-ZZU1-AAAAAAAA-BBBBBBBBBBBB'],
    ['short selector', 'ACR-ZZU-AAAAAAA-BBBBBBBBBBBB'],
    ['wrong prefix', 'XYZ-ZZU-AAAAAAAA-BBBBBBBBBBBB'],
    ['U is not in the alphabet', 'ACR-ZZU-AAAAAAAA-BBBBBBBBBBBU'],
    ['legacy prefix with a tag', 'ACR45-ZZU-AAAAAAAA-BBBBBBBBBBBB'],
    ['not a string', null],
    ['oversized', 'A'.repeat(200)],
  ])('rejects %s', (_name, value) => {
    expect(parseInviteCode(value)).toBeNull();
  });

  test('normalises case, look-alikes and spaces', () => {
    expect(parseInviteCode(' acr-zzu-aaaaaaao-bbbbbbbbbbbl ')).toEqual({ org: 'ZZU', selector: 'AAAAAAA0', secret: 'BBBBBBBBBBB1' });
    expect(parseInviteCode('acr45-aaaaaaai-bbbbbbbbbbbo')).toEqual({ org: null, selector: 'AAAAAAA1', secret: 'BBBBBBBBBBB0' });
  });
});

describe('existing stores', () => {
  test('a store created before tags gains the column on open, and its codes still work', () => {
    const legacy = fixture.issueInvite({ label: 'existing-phone' });
    fixture.service.close();
    const raw = new DatabaseSync(fixture.storePath);
    raw.exec('ALTER TABLE invitations DROP COLUMN org');
    expect(raw.prepare('PRAGMA table_info(invitations)').all().map((c) => c.name)).not.toContain('org');
    raw.close();

    const service = fixture.reopen();
    try {
      expect(service.db.prepare('PRAGMA table_info(invitations)').all().map((c) => c.name)).toContain('org');
      expect(service.redeem(legacy, PHONE, BUILD).pairing).toBe('NEW');
    } finally {
      service.close();
    }
  });
});
