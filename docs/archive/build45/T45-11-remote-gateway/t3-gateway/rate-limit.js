'use strict';

const crypto = require('crypto');
const { GatewayError, errorEnvelope } = require('../../gateway/src/errors');

function createRateLimiter({ windowMs = 300000, generalMax = 300, authMax = 30, now = () => Date.now() } = {}) {
  const buckets = new Map();
  return function rateLimit(req, res, next) {
    const routeClass = req.path.startsWith('/m/v1/auth/') ? 'auth' : 'general';
    const max = routeClass === 'auth' ? authMax : generalMax;
    const window = Math.floor(now() / windowMs);
    // T4 terminates locally, so socket IP is only a supplemental global limit.
    // Edge reviewer-IP controls remain mandatory before public exposure.
    const key = `${routeClass}:${window}`;
    const count = (buckets.get(key) || 0) + 1;
    buckets.set(key, count);
    for (const candidate of buckets.keys()) if (!candidate.endsWith(`:${window}`)) buckets.delete(candidate);
    if (count > max) {
      const requestId = typeof req.headers['x-request-id'] === 'string'
        && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.headers['x-request-id'])
        ? req.headers['x-request-id'] : crypto.randomUUID();
      res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json(errorEnvelope(new GatewayError('RATE_LIMITED', 'Gateway request limit reached.', 429, true), requestId));
    }
    next();
  };
}

module.exports = { createRateLimiter };
