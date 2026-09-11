'use strict';

function createMetadataLogger(sink = () => {}) {
  return Object.freeze({
    emit(event, metadata = {}) {
      const allowed = {};
      for (const key of ['requestId', 'route', 'method', 'status', 'code', 'durationMs', 'resultMode', 'reasoningMode', 'scheme']) {
        if (metadata[key] !== undefined) allowed[key] = metadata[key];
      }
      // Backlog §10.4 "redact correlation data": keep only an 8-character prefix
      // of the request id — enough to correlate lines within one incident window,
      // not a stable identifier linkable to a device or session over time.
      if (typeof allowed.requestId === 'string') allowed.requestId = `${allowed.requestId.slice(0, 8)}…`;
      sink(Object.freeze({ event, ...allowed }));
    },
  });
}

/**
 * Structured stdout sink for production (F-1). One JSON line per event. The
 * logger's allow-list is the privacy boundary: only the metadata keys above can
 * ever reach this sink, so no body, token, patient value or result is written.
 */
function stdoutSink(event) {
  process.stdout.write(`${JSON.stringify({ ts: new Date().toISOString(), ...event })}\n`);
}

module.exports = { createMetadataLogger, stdoutSink };
