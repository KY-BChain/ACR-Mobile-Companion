'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PersistentAuthService, initialiseAuthFiles, inviteHash, atomicWrite } = require('../t3-gateway/persistent-auth');

const BUILD = 'mob-v0.6.5+45';
const PROOF = 'install-proof-0123456789abcdef';

function fixture() {
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'acr-t45-auth-'));
  const storePath = path.join(directory, 'auth.json');
  const pepperPath = path.join(directory, 'pepper.bin');
  initialiseAuthFiles({ storePath, pepperPath });
  const state = JSON.parse(fs.readFileSync(storePath));
  const code = `ACR45-${crypto.randomBytes(24).toString('base64url')}`;
  const salt = crypto.randomBytes(16);
  state.invites.push({ id: crypto.randomUUID(), label: 'test-01', salt: salt.toString('hex'),
    hash: inviteHash(code, salt, fs.readFileSync(pepperPath)), createdAt: 1000,
    expiresAt: 5000000, maxRedemptions: 1, redemptions: 0, revokedAt: null });
  atomicWrite(storePath, state);
  return { directory, storePath, pepperPath, code };
}

test('persistent invitation, install proof, rotation and restart recovery', () => {
  const item = fixture();
  try {
    let now = 2000;
    const service = new PersistentAuthService({ ...item, expectedClientBuildId: BUILD, now: () => now });
    assert.throws(() => service.redeem('ACR45-wrong-value-that-is-long', PROOF, BUILD), { code: 'INVITE_INVALID' });
    assert.throws(() => service.redeem(item.code, 'short', BUILD), { code: 'DEVICE_BINDING_MISMATCH' });
    assert.throws(() => service.redeem(item.code, PROOF, 'mob-v0.6.0+44'), { code: 'CLIENT_BUILD_MISMATCH' });
    const first = service.redeem(item.code, PROOF, BUILD);
    assert.equal(service.authenticate(`Bearer ${first.accessToken}`, PROOF, BUILD).length, 36);
    assert.throws(() => service.redeem(item.code, PROOF, BUILD), { code: 'INVITE_INVALID' });

    const restarted = new PersistentAuthService({ ...item, expectedClientBuildId: BUILD, now: () => now });
    assert.doesNotThrow(() => restarted.authenticate(`Bearer ${first.accessToken}`, PROOF, BUILD));
    const second = restarted.refresh(first.refreshToken, PROOF, BUILD);
    assert.throws(() => restarted.refresh(first.refreshToken, PROOF, BUILD), { code: 'TOKEN_REUSE_DETECTED' });
    assert.throws(() => restarted.authenticate(`Bearer ${second.accessToken}`, PROOF, BUILD), { code: 'AUTHENTICATION_REQUIRED' });

    const thirdFixture = fixture();
    try {
      const live = new PersistentAuthService({ ...thirdFixture, expectedClientBuildId: BUILD, now: () => now });
      const session = live.redeem(thirdFixture.code, PROOF, BUILD);
      const external = JSON.parse(fs.readFileSync(thirdFixture.storePath));
      Object.values(external.families)[0].revokedAt = now;
      atomicWrite(thirdFixture.storePath, external);
      assert.throws(() => live.authenticate(`Bearer ${session.accessToken}`, PROOF, BUILD), { code: 'AUTHENTICATION_REQUIRED' });
    } finally { fs.rmSync(thirdFixture.directory, { recursive: true, force: true }); }
    const storedText = fs.readFileSync(item.storePath, 'utf8');
    assert.equal(storedText.includes(item.code), false);
    assert.equal(storedText.includes(first.accessToken), false);
    assert.equal(storedText.includes(PROOF), false);
    assert.equal(fs.statSync(item.storePath).mode & 0o777, 0o600);
    assert.equal(fs.statSync(item.pepperPath).mode & 0o777, 0o600);
  } finally { fs.rmSync(item.directory, { recursive: true, force: true }); }
});
