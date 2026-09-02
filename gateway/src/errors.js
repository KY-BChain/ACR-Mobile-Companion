'use strict';

class GatewayError extends Error {
  constructor(code, message, status, retryable = false, outcome = 'NOT_SUBMITTED', fieldErrors = []) {
    super(message);
    this.name = 'GatewayError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.outcome = outcome;
    this.fieldErrors = fieldErrors;
  }
}

function errorEnvelope(error, requestId) {
  const safe = error instanceof GatewayError
    ? error
    : new GatewayError('SERVICE_UNAVAILABLE', 'An unexpected gateway error occurred.', 500, true);
  return {
    contract: 'acr.error.v1',
    requestId,
    error: {
      code: safe.code,
      message: safe.message,
      retryable: safe.retryable,
      outcome: safe.outcome,
      fieldErrors: safe.fieldErrors,
    },
  };
}

module.exports = { GatewayError, errorEnvelope };
