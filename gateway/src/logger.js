'use strict';

function createMetadataLogger(sink = () => {}) {
  return Object.freeze({
    emit(event, metadata = {}) {
      const allowed = {};
      for (const key of ['requestId', 'route', 'method', 'status', 'code', 'durationMs', 'resultMode', 'reasoningMode']) {
        if (metadata[key] !== undefined) allowed[key] = metadata[key];
      }
      sink(Object.freeze({ event, ...allowed }));
    },
  });
}

module.exports = { createMetadataLogger };
