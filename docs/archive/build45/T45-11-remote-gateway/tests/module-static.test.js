'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('T4 paths are exact and default-denied', () => {
  const config = read('t4-tunnel/cloudflared-config.yml');
  for (const route of ['live', 'auth/redeem', 'auth/refresh', 'attestation', 'infer', 'demo/infer']) {
    assert.equal(config.includes(`path: ^/m/v1/${route}$`), true);
  }
  assert.equal((config.match(/service: http_status:404/g) || []).length, 2);
  assert.doesNotMatch(config, /max-num-upstream-conns/);
});

test('remote source uses the existing gateway contracts and loopback guard', () => {
  const server = read('t3-gateway/server.js');
  assert.match(server, /gateway\/src\/app/);
  assert.match(server, /127\.0\.0\.1/);
  assert.match(server, /PersistentAuthService/);
  assert.doesNotMatch(server, /0\.0\.0\.0/);
});

test('no populated secrets are committed in module configuration', () => {
  const env = read('t3-gateway/.env.example');
  assert.doesNotMatch(env, /(TOKEN_SECRET|PASSWORD|PRIVATE_KEY)=\S+/);
  assert.match(env, /ACR_EXPECTED_CLIENT_BUILD_ID=mob-v0\.6\.5\+45/);
});
