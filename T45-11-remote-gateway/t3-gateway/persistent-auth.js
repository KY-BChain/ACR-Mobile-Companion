'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { GatewayError } = require('../../gateway/src/errors');

const ACCESS_MS = 15 * 60 * 1000;
const REFRESH_MS = 30 * 24 * 60 * 60 * 1000;
const SCRYPT = Object.freeze({ N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });

function secretHash(secret, pepper) {
  return crypto.createHmac('sha256', pepper).update(secret, 'utf8').digest('hex');
}

function inviteHash(code, salt, pepper) {
  return crypto.scryptSync(Buffer.concat([Buffer.from(code, 'utf8'), pepper]), salt, 32, SCRYPT).toString('hex');
}

function safeEqualHex(actual, expected) {
  if (!/^[0-9a-f]{64}$/i.test(expected || '')) return false;
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function assertOwnerFile(filePath, mode, fsImpl = fs) {
  const stat = fsImpl.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${path.basename(filePath)} must be a regular non-symlink file`);
  if (typeof process.getuid === 'function' && stat.uid !== process.getuid()) throw new Error(`${path.basename(filePath)} must be owned by the T3 user`);
  if ((stat.mode & 0o077) !== 0 || (stat.mode & 0o700) !== mode) {
    throw new Error(`${path.basename(filePath)} must have mode ${mode.toString(8)}`);
  }
}

function atomicWrite(filePath, value, fsImpl = fs) {
  const temporary = `${filePath}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  fsImpl.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  fsImpl.renameSync(temporary, filePath);
  fsImpl.chmodSync(filePath, 0o600);
}

function plainObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function validTime(value) { return Number.isInteger(value) && value >= 0; }
function validateState(value) {
  if (!plainObject(value) || value.version !== 1 || !Array.isArray(value.invites) || value.invites.length > 100
      || !plainObject(value.families) || !plainObject(value.access) || !plainObject(value.refresh)) return false;
  if (!value.invites.every(item => plainObject(item) && /^[0-9a-f-]{36}$/i.test(item.id)
      && /^[A-Za-z0-9._-]{1,40}$/.test(item.label) && /^[0-9a-f]{32}$/i.test(item.salt)
      && /^[0-9a-f]{64}$/i.test(item.hash) && validTime(item.createdAt) && validTime(item.expiresAt)
      && Number.isInteger(item.maxRedemptions) && item.maxRedemptions >= 1 && item.maxRedemptions <= 10
      && Number.isInteger(item.redemptions) && item.redemptions >= 0 && item.redemptions <= item.maxRedemptions
      && (item.revokedAt === null || validTime(item.revokedAt)))) return false;
  if (!Object.entries(value.families).every(([id, item]) => /^[0-9a-f-]{36}$/i.test(id) && plainObject(item)
      && /^[0-9a-f-]{36}$/i.test(item.inviteId) && /^[0-9a-f]{64}$/i.test(item.deviceBindingHash)
      && /^mob-v\d+\.\d+\.\d+\+\d+$/.test(item.clientBuildId) && validTime(item.createdAt)
      && (item.revokedAt === null || validTime(item.revokedAt)))) return false;
  if (!Object.entries(value.access).every(([hash, item]) => /^[0-9a-f]{64}$/i.test(hash) && plainObject(item)
      && /^[0-9a-f-]{36}$/i.test(item.familyId) && validTime(item.expiresAt))) return false;
  return Object.entries(value.refresh).every(([hash, item]) => /^[0-9a-f]{64}$/i.test(hash) && plainObject(item)
    && /^[0-9a-f-]{36}$/i.test(item.familyId) && validTime(item.expiresAt)
    && (item.usedAt === null || validTime(item.usedAt)));
}

class PersistentAuthService {
  constructor({ storePath, pepperPath, expectedClientBuildId, now = () => Date.now(), fsImpl = fs }) {
    if (!path.isAbsolute(storePath || '') || !path.isAbsolute(pepperPath || '')) throw new Error('Auth store and pepper paths must be absolute');
    if (storePath === pepperPath) throw new Error('Auth store and pepper paths must be different');
    const directory = fsImpl.lstatSync(path.dirname(storePath));
    if (!directory.isDirectory() || directory.isSymbolicLink() || (directory.mode & 0o077) !== 0
        || (typeof process.getuid === 'function' && directory.uid !== process.getuid())) {
      throw new Error('Auth directory must be owner-only, owned by T3, and not a symlink');
    }
    if (!/^mob-v\d+\.\d+\.\d+\+\d+$/.test(expectedClientBuildId || '')) throw new Error('Expected client build ID is invalid');
    assertOwnerFile(storePath, 0o600, fsImpl);
    assertOwnerFile(pepperPath, 0o600, fsImpl);
    this.storePath = storePath;
    this.pepper = fsImpl.readFileSync(pepperPath);
    if (this.pepper.length < 32) throw new Error('Auth pepper must contain at least 32 random bytes');
    this.expectedClientBuildId = expectedClientBuildId;
    this.now = now;
    this.fs = fsImpl;
    this.state = this.read();
  }

  read() {
    const value = JSON.parse(this.fs.readFileSync(this.storePath, 'utf8'));
    if (!validateState(value)) throw new Error('Auth store format is invalid');
    return value;
  }

  save() { atomicWrite(this.storePath, this.state, this.fs); }
  reload() { this.state = this.read(); }

  clean() {
    const now = this.now();
    let changed = false;
    for (const [key, record] of Object.entries(this.state.access)) if (record.expiresAt <= now) { delete this.state.access[key]; changed = true; }
    for (const [key, record] of Object.entries(this.state.refresh)) if (record.expiresAt <= now) { delete this.state.refresh[key]; changed = true; }
    if (changed) this.save();
  }

  enforceProof(deviceBinding, clientBuildId) {
    if (clientBuildId !== this.expectedClientBuildId) throw new GatewayError('CLIENT_BUILD_MISMATCH', 'Client build is not authorised for this gateway.', 403);
    if (typeof deviceBinding !== 'string' || deviceBinding.length < 16 || deviceBinding.length > 256
        || !/^[A-Za-z0-9._~-]+$/.test(deviceBinding)) {
      throw new GatewayError('DEVICE_BINDING_MISMATCH', 'App-installation proof is invalid.', 403);
    }
  }

  redeem(inviteCode, deviceBinding, clientBuildId) {
    this.reload();
    this.enforceProof(deviceBinding, clientBuildId);
    if (typeof inviteCode !== 'string' || inviteCode.length < 20 || inviteCode.length > 128) {
      throw new GatewayError('INVITE_INVALID', 'Invite credential is invalid.', 401);
    }
    const now = this.now();
    let match = null;
    for (const invite of this.state.invites.filter(item => !item.revokedAt && item.expiresAt > now && item.redemptions < item.maxRedemptions)) {
      const actual = inviteHash(inviteCode, Buffer.from(invite.salt, 'hex'), this.pepper);
      if (safeEqualHex(actual, invite.hash)) match = invite;
    }
    if (!match || match.revokedAt || match.expiresAt <= now || match.redemptions >= match.maxRedemptions) {
      throw new GatewayError('INVITE_INVALID', 'Invite credential is invalid or unavailable.', 401);
    }
    match.redemptions += 1;
    const familyId = crypto.randomUUID();
    this.state.families[familyId] = { inviteId: match.id, deviceBindingHash: secretHash(deviceBinding, this.pepper), clientBuildId, createdAt: now, revokedAt: null };
    const result = this.rotateIntoFamily(familyId);
    this.save();
    return result;
  }

  rotateIntoFamily(familyId) {
    const issuedAt = this.now();
    const accessToken = crypto.randomBytes(32).toString('base64url');
    const refreshToken = crypto.randomBytes(32).toString('base64url');
    this.state.access[secretHash(accessToken, this.pepper)] = { familyId, expiresAt: issuedAt + ACCESS_MS };
    this.state.refresh[secretHash(refreshToken, this.pepper)] = { familyId, expiresAt: issuedAt + REFRESH_MS, usedAt: null };
    return { tokenType: 'Bearer', accessToken, expiresIn: ACCESS_MS / 1000, refreshToken, refreshExpiresAt: new Date(issuedAt + REFRESH_MS).toISOString() };
  }

  familyFor(record) { return record && this.state.families[record.familyId]; }

  enforceFamily(family, deviceBinding, clientBuildId) {
    if (!family || family.revokedAt) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Access session is invalid or expired.', 401);
    if (family.deviceBindingHash !== secretHash(deviceBinding || '', this.pepper)) throw new GatewayError('DEVICE_BINDING_MISMATCH', 'Access session is not bound to this app installation.', 403);
    if (family.clientBuildId !== clientBuildId || clientBuildId !== this.expectedClientBuildId) throw new GatewayError('CLIENT_BUILD_MISMATCH', 'Access session is not bound to this client build.', 403);
  }

  authenticate(header, deviceBinding, clientBuildId) {
    this.reload();
    this.clean();
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Access token required.', 401);
    const record = this.state.access[secretHash(header.slice(7), this.pepper)];
    if (!record || record.expiresAt <= this.now()) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Access token is invalid or expired.', 401);
    const family = this.familyFor(record);
    this.enforceFamily(family, deviceBinding, clientBuildId);
    return record.familyId;
  }

  refresh(refreshToken, deviceBinding, clientBuildId) {
    this.reload();
    this.clean();
    const key = typeof refreshToken === 'string' ? secretHash(refreshToken, this.pepper) : '';
    const record = this.state.refresh[key];
    const family = this.familyFor(record);
    if (!record || !family || family.revokedAt || record.expiresAt <= this.now()) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Refresh token is invalid or expired.', 401);
    this.enforceFamily(family, deviceBinding, clientBuildId);
    if (record.usedAt) {
      family.revokedAt = this.now();
      this.save();
      throw new GatewayError('TOKEN_REUSE_DETECTED', 'Refresh token reuse revoked this token family.', 409);
    }
    record.usedAt = this.now();
    const result = this.rotateIntoFamily(record.familyId);
    this.save();
    return result;
  }
}

function initialiseAuthFiles({ storePath, pepperPath, fsImpl = fs }) {
  const directory = path.dirname(storePath);
  if (directory !== path.dirname(pepperPath)) throw new Error('Store and pepper must share one protected directory');
  if (!fsImpl.existsSync(directory)) fsImpl.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const directoryStat = fsImpl.lstatSync(directory);
  if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink()
      || (typeof process.getuid === 'function' && directoryStat.uid !== process.getuid())
      || fsImpl.realpathSync(directory) !== path.resolve(directory)) throw new Error('Auth directory is unsafe');
  fsImpl.chmodSync(directory, 0o700);
  if (fsImpl.existsSync(pepperPath)) assertOwnerFile(pepperPath, 0o600, fsImpl);
  if (fsImpl.existsSync(storePath)) assertOwnerFile(storePath, 0o600, fsImpl);
  if (!fsImpl.existsSync(pepperPath)) fsImpl.writeFileSync(pepperPath, crypto.randomBytes(64), { flag: 'wx', mode: 0o600 });
  if (!fsImpl.existsSync(storePath)) atomicWrite(storePath, { version: 1, invites: [], families: {}, access: {}, refresh: {} }, fsImpl);
  assertOwnerFile(pepperPath, 0o600, fsImpl);
  assertOwnerFile(storePath, 0o600, fsImpl);
}

module.exports = { PersistentAuthService, initialiseAuthFiles, inviteHash, atomicWrite, validateState, ACCESS_MS, REFRESH_MS, SCRYPT };
