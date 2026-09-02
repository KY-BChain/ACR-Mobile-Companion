'use strict';

const { GatewayError } = require('./errors');
const { mapAssessmentToPlatform } = require('./mapper');
const { validatePlatformSuccess, resultModeFor } = require('./upstream-validator');
const { parseInferUrl } = require('./config');

class PlatformAdapter {
  constructor({ upstreamInferUrl, timeoutMs, fetchImpl = globalThis.fetch }) {
    this.upstreamInferUrl = parseInferUrl(upstreamInferUrl, 'upstreamInferUrl');
    this.timeoutMs = timeoutMs;
    this.fetchImpl = fetchImpl;
  }

  async infer(mobileRequest) {
    if (!this.upstreamInferUrl) {
      throw new GatewayError('UPSTREAM_NOT_CONFIGURED', 'No verified upstream inference URL is configured.', 503, false, 'NOT_SUBMITTED');
    }
    if (typeof this.fetchImpl !== 'function') {
      throw new GatewayError('SERVICE_UNAVAILABLE', 'HTTP transport is unavailable.', 503, true, 'NOT_SUBMITTED');
    }
    const platformRequest = mapAssessmentToPlatform(mobileRequest);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let response;
    try {
      response = await this.fetchImpl(this.upstreamInferUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(platformRequest),
        signal: controller.signal,
      });
    } catch (error) {
      if (error && (error.name === 'AbortError' || controller.signal.aborted)) {
        throw new GatewayError('UPSTREAM_TIMEOUT', 'The reasoner request timed out; its outcome is indeterminate.', 504, false, 'INDETERMINATE');
      }
      throw new GatewayError('SERVICE_UNAVAILABLE', 'The configured reasoner service is unavailable.', 503, true, 'NOT_SUBMITTED');
    } finally {
      clearTimeout(timer);
    }
    if (!response || !response.ok) {
      throw new GatewayError('UPSTREAM_HTTP_ERROR', 'The reasoner service returned an unsuccessful HTTP status.', 502, true, 'FAILED');
    }
    let platformResponse;
    try {
      platformResponse = await response.json();
    } catch {
      throw new GatewayError('INVALID_UPSTREAM_RESPONSE', 'The reasoner returned non-JSON content.', 502, false, 'FAILED');
    }
    validatePlatformSuccess(platformResponse, {
      patientId: platformRequest.patientData.patientId,
      bayesianEnhanced: platformRequest.bayesianEnhanced,
    });
    const reasoningMode = platformResponse.data.reasoningMode;
    return {
      contract: 'acr.cds.v1',
      requestId: mobileRequest.requestId,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      resultMode: resultModeFor(reasoningMode),
      reasoningMode,
      data: platformResponse.data,
      platformResponse,
      delivery: {
        source: 'CONFIGURED_PLATFORM',
        currentExecution: true,
        capturedPlatform: null,
      },
      warnings: [],
    };
  }
}

module.exports = { PlatformAdapter };
