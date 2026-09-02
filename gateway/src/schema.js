'use strict';

const path = require('path');
const Ajv = require('ajv');
const { GatewayError } = require('./errors');

const SCHEMA_ROOT = path.resolve(__dirname, '../../schemas');
const requestSchema = require('../../schemas/acr.cds.v1.request.schema.json');
const responseSchema = require('../../schemas/acr.cds.v1.response.schema.json');
const attestationSchema = require('../../schemas/acr.attestation.v1.schema.json');
const errorSchema = require('../../schemas/acr.error.v1.schema.json');

function isActualIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function createAjv() {
  const ajv = new Ajv({ strict: true, allErrors: true });
  ajv.addFormat('uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  ajv.addFormat('date-time', value => !Number.isNaN(Date.parse(value)));
  ajv.addFormat('date', isActualIsoDate);
  return ajv;
}

const ajv = createAjv();
ajv.addSchema(attestationSchema);
const validators = Object.freeze({
  request: ajv.compile(requestSchema),
  response: ajv.compile(responseSchema),
  attestation: ajv.getSchema(attestationSchema.$id),
  error: ajv.compile(errorSchema),
});

function validateAssessmentRequest(value) {
  if (!validators.request(value)) {
    const fields = (validators.request.errors || []).map(error => `${error.instancePath || '/'} ${error.message}`);
    throw new GatewayError('SCHEMA_INVALID', 'Request does not conform to acr.cds.v1.', 400, false, 'NOT_SUBMITTED', fields);
  }
  if (value.assessment.surgeryDate !== null && value.assessment.surgeryDate !== undefined
      && !isActualIsoDate(value.assessment.surgeryDate)) {
    throw new GatewayError('CLINICAL_INPUT_REJECTED', 'surgeryDate must be an actual ISO calendar date.', 400, false, 'NOT_SUBMITTED', ['/assessment/surgeryDate']);
  }
  return value;
}

module.exports = {
  SCHEMA_ROOT,
  schemas: { requestSchema, responseSchema, attestationSchema, errorSchema },
  validators,
  validateAssessmentRequest,
  isActualIsoDate,
  createAjv,
};
