'use strict';

const { loadConfig } = require('./config');
const { createApp } = require('./app');
const { loadFixtureBundle } = require('./fixture-loader');

function startListener(options = {}) {
  const config = options.config || loadConfig(options.env);
  const fixture = options.fixture === undefined ? loadFixtureBundle({
    directory: config.fixtureDirectory,
    approvedEvidence: config.expectedEvidence,
    approvedCaptureRoute: config.upstreamInferUrl,
    now: options.fixtureNow,
    fsImpl: options.fixtureFsImpl,
  }) : options.fixture;
  const app = options.app || createApp({ ...options, config, fixture });
  return app.listen(config.port, config.host);
}

if (require.main === module) {
  const config = loadConfig();
  const server = startListener({ config });
  server.on('listening', () => process.stdout.write(`ACR gateway listening on ${config.host}:${config.port}\n`));
}

module.exports = { startListener };
