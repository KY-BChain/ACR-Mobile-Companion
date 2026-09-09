'use strict';

const crypto = require('crypto');
const { GatewayError } = require('./errors');

class InMemoryAuthService {
  constructor({ now = () => Date.now(), inviteCodeSha256 = null, expectedClientBuildId = 'mob-v0.6.5+45' } = {}) {
    this.now = now;
    this.accessTokens = new Map();
    this.refreshTokens = new Map();
    this.families = new Map();
    this.inviteCodeSha256 = inviteCodeSha256;
    this.expectedClientBuildId = expectedClientBuildId;
  }

  redeem(inviteCode, deviceBinding, clientBuildId) {
    if (!this.inviteCodeSha256) {
      throw new GatewayError('INVITE_CONFIGURATION_REQUIRED', 'Invite redemption is not configured.', 503);
    }
    const actualHash = crypto.createHash('sha256').update(inviteCode, 'utf8').digest();
    const expectedHash = Buffer.from(this.inviteCodeSha256, 'hex');
    if (actualHash.length !== expectedHash.length || !crypto.timingSafeEqual(actualHash, expectedHash)) {
      throw new GatewayError('INVITE_INVALID', 'Invite credential is invalid.', 401);
    }
    if (clientBuildId !== this.expectedClientBuildId) {
      throw new GatewayError('CLIENT_BUILD_MISMATCH', 'Client build is not authorised for this gateway.', 403);
    }
    if (typeof deviceBinding !== 'string' || deviceBinding.length < 8 || deviceBinding.length > 256) {
      throw new GatewayError('DEVICE_BINDING_MISMATCH', 'Device binding is invalid.', 403);
    }
    const familyId = crypto.randomUUID();
    this.families.set(familyId, { revoked: false, deviceBinding, clientBuildId });
    return this.rotateIntoFamily(familyId);
  }

  rotateIntoFamily(familyId) {
    const issuedAt = this.now();
    const accessToken = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();
    this.accessTokens.set(accessToken, { familyId, expiresAt: issuedAt + 15 * 60 * 1000 });
    this.refreshTokens.set(refreshToken, { familyId, expiresAt: issuedAt + 30 * 24 * 60 * 60 * 1000, used: false });
    return {
      tokenType: 'Bearer',
      accessToken,
      expiresIn: 900,
      refreshToken,
      refreshExpiresAt: new Date(issuedAt + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  refresh(refreshToken, deviceBinding, clientBuildId) {
    const record = this.refreshTokens.get(refreshToken);
    const family = record && this.families.get(record.familyId);
    if (!record || !family || family.revoked || record.expiresAt <= this.now()) {
      throw new GatewayError('AUTHENTICATION_REQUIRED', 'Refresh token is invalid or expired.', 401);
    }
    this.enforceBinding(family, deviceBinding, clientBuildId);
    if (record.used) {
      family.revoked = true;
      throw new GatewayError('TOKEN_REUSE_DETECTED', 'Refresh token reuse revoked this token family.', 409);
    }
    record.used = true;
    return this.rotateIntoFamily(record.familyId);
  }

  enforceBinding(family, deviceBinding, clientBuildId) {
    if (deviceBinding !== family.deviceBinding) {
      throw new GatewayError('DEVICE_BINDING_MISMATCH', 'Bearer credential is not bound to this device.', 403);
    }
    if (clientBuildId !== family.clientBuildId || clientBuildId !== this.expectedClientBuildId) {
      throw new GatewayError('CLIENT_BUILD_MISMATCH', 'Bearer credential is not bound to this client build.', 403);
    }
  }

  authenticate(header, deviceBinding, clientBuildId) {
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      throw new GatewayError('AUTHENTICATION_REQUIRED', 'Access token required.', 401);
    }
    const token = header.slice(7);
    const record = this.accessTokens.get(token);
    const family = record && this.families.get(record.familyId);
    if (!record || !family || family.revoked || record.expiresAt <= this.now()) {
      throw new GatewayError('AUTHENTICATION_REQUIRED', 'Access token is invalid or expired.', 401);
    }
    this.enforceBinding(family, deviceBinding, clientBuildId);
    return record.familyId;
  }
}

module.exports = { InMemoryAuthService };
