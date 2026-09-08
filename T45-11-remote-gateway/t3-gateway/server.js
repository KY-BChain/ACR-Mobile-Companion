#!/usr/bin/env node
'use strict';

const { createApp } = require('../../gateway/src/app');
const { loadConfig } = require('../../gateway/src/config');
const { loadFixtureBundle } = require('../../gateway/src/fixture-loader');
const { PersistentAuthService } = require('./persistent-auth');
const { createRateLimiter } = require('./rate-limit');

function buildApp(env = process.env) {
  const config = loadConfig(env);
  if (!['127.0.0.1', '::1'].includes(config.host)) throw new Error('T45-11 remote gateway must bind to loopback only');
  if (!env.ACR_AUTH_STORE_PATH || !env.ACR_AUTH_PEPPER_PATH) throw new Error('Persistent T45-08 auth paths are required');
  const authService = new PersistentAuthService({
    storePath: env.ACR_AUTH_STORE_PATH,
    pepperPath: env.ACR_AUTH_PEPPER_PATH,
    expectedClientBuildId: config.expectedClientBuildId,
  });
  const fixture = loadFixtureBundle({
    directory: config.fixtureDirectory,
    approvedEvidence: config.expectedEvidence,
    approvedCaptureRoute: config.upstreamInferUrl,
  });
  return { app: createApp({ config, authService, fixture, preRouteMiddleware: createRateLimiter() }), config };
}

function start(env = process.env) {
  const { app, config } = buildApp(env);
  const server = app.listen(config.port, config.host);
  server.on('listening', () => process.stdout.write(`ACR T3 Build 45 candidate listening on ${config.host}:${config.port}\n`));
  return server;
}

if (require.main === module) start();
module.exports = { buildApp, start };

