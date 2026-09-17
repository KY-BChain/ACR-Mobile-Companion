#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const { initialiseAuthFiles, inviteHash, atomicWrite, validateState } = require('./persistent-auth');

const storePath = process.env.ACR_AUTH_STORE_PATH;
const pepperPath = process.env.ACR_AUTH_PEPPER_PATH;
if (!storePath || !pepperPath) throw new Error('ACR_AUTH_STORE_PATH and ACR_AUTH_PEPPER_PATH are required');

function load() {
  const value = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  if (!validateState(value)) throw new Error('Auth store format is invalid');
  return value;
}
function save(state) { atomicWrite(storePath, state); }
function safeLabel(value) {
  if (!/^[A-Za-z0-9._-]{1,40}$/.test(value || '')) throw new Error('Use a non-personal pseudonymous label of 1-40 safe characters');
  return value;
}

const [command, argument] = process.argv.slice(2);
initialiseAuthFiles({ storePath, pepperPath });
const state = load();
const pepper = fs.readFileSync(pepperPath);

if (command === 'create') {
  const label = safeLabel(argument);
  const days = Number(process.env.ACR_INVITE_DAYS || 14);
  const maxRedemptions = Number(process.env.ACR_INVITE_MAX_REDEMPTIONS || 1);
  if (!Number.isInteger(days) || days < 1 || days > 90 || !Number.isInteger(maxRedemptions) || maxRedemptions < 1 || maxRedemptions > 10) {
    throw new Error('Invite days must be 1-90 and maximum redemptions 1-10');
  }
  if (state.invites.some(item => item.label === label && !item.revokedAt && item.expiresAt > Date.now())) throw new Error('An active invite already uses that label');
  const code = `ACR45-${crypto.randomBytes(24).toString('base64url')}`;
  const salt = crypto.randomBytes(16);
  const record = {
    id: crypto.randomUUID(), label, salt: salt.toString('hex'), hash: inviteHash(code, salt, pepper),
    createdAt: Date.now(), expiresAt: Date.now() + days * 86400000,
    maxRedemptions, redemptions: 0, revokedAt: null,
  };
  state.invites.push(record);
  save(state);
  process.stdout.write(`Invite ID: ${record.id}\nLabel: ${label}\nExpires: ${new Date(record.expiresAt).toISOString()}\nCode (shown once): ${code}\n`);
} else if (command === 'list') {
  for (const item of state.invites) {
    process.stdout.write(`${item.id}\t${item.label}\t${item.redemptions}/${item.maxRedemptions}\t${item.revokedAt ? 'REVOKED' : item.expiresAt <= Date.now() ? 'EXPIRED' : 'ACTIVE'}\t${new Date(item.expiresAt).toISOString()}\n`);
  }
} else if (command === 'revoke') {
  const invite = state.invites.find(item => item.id === argument);
  if (!invite) throw new Error('Invite ID not found');
  invite.revokedAt = Date.now();
  for (const family of Object.values(state.families)) if (family.inviteId === invite.id && !family.revokedAt) family.revokedAt = Date.now();
  save(state);
  process.stdout.write(`Revoked invite and sessions: ${invite.id}\n`);
} else {
  process.stderr.write('Usage: invite-admin.js create <pseudonymous-label> | list | revoke <invite-id>\n');
  process.exitCode = 64;
}
