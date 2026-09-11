'use strict';

const { loadConfig } = require('./config');
const { createApp } = require('./app');
const { loadFixtureBundle } = require('./fixture-loader');
const { createMetadataLogger, stdoutSink } = require('./logger');

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
  // F-1: production writes allow-listed metadata to stdout. The library default
  // remains a no-op so tests and embedders choose their own sink.
  const server = startListener({ config, logger: createMetadataLogger(stdoutSink) });
  server.on('listening', () => process.stdout.write(`ACR gateway listening on ${config.host}:${config.port}\n`));
}

module.exports = { startListener };
