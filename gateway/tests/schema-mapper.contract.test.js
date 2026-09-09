'use strict';

const fs = require('fs');
const path = require('path');
const { schemas, validators, validateAssessmentRequest } = require('../src/schema');
const { mapAssessmentToPlatform, PATIENT_FIELDS } = require('../src/mapper');
const { mobileRequest } = require('./helpers');
const { loadConfig } = require('../src/config');

describe('Build 44 twenty-field request contract', () => {
  test('schema contains all 20 clinical/control fields plus generated patientId', () => {
    expect(Object.keys(schemas.requestSchema.properties.assessment.properties)).toHaveLength(21);
    expect(Object.keys(schemas.requestSchema.properties.assessment.properties)).toEqual(expect.arrayContaining([
      'erStatus', 'prStatus', 'her2Status', 'ki67', 'stage', 'grade', 'histologicalSubtype',
      'nodalStatus', 'age', 'ca153', 'cea', 'surgeryDate', 'bayesianEnhanced', 'tumorSize',
      'gender', 'ecogScore', 'pdl1Status', 'her2Low', 'lvef', 'treatmentIntent',
    ]));
  });

  test('accepts full request with meaningful zero and false values', () => expect(validators.request(mobileRequest())).toBe(true));

  test.each([
    ['ki67', -1], ['ki67', 101], ['age', 17], ['age', 121], ['tumorSize', 0],
    ['ecogScore', -1], ['ecogScore', 5], ['lvef', -1], ['lvef', 101], ['ca153', -1], ['cea', -1],
    ['stage', 'Stage II'], ['grade', '4'], ['nodalStatus', 'positive'], ['gender', 'Female'],
    ['pdl1Status', 'untested'], ['her2Low', true], ['treatmentIntent', 'curative'],
  ])('rejects invalid %s boundary/value %p', (field, value) => {
    expect(validators.request(mobileRequest({ [field]: value }))).toBe(false);
  });

  test.each(['2025-02-29', '2026-04-31', '14-03-2026'])('rejects non-actual date %s in code validation', date => {
    expect(() => validateAssessmentRequest(mobileRequest({ surgeryDate: date }))).toThrow();
  });

  test('accepts null optionals and explicit unknown/not_tested/unspecified', () => {
    const request = mobileRequest({ stage: null, grade: null, histologicalSubtype: null, nodalStatus: null,
      age: null, ca153: null, cea: null, surgeryDate: null, tumorSize: null, gender: 'unknown',
      ecogScore: null, pdl1Status: 'not_tested', her2Low: 'unknown', lvef: null, treatmentIntent: 'unspecified' });
    expect(validators.request(request)).toBe(true);
  });

  test('accepts version-shaped build for gateway binding and rejects malformed build and unknown fields', () => {
    const otherBuild = mobileRequest(); otherBuild.client.buildId = 'mob-v0.5.1+43';
    expect(validators.request(otherBuild)).toBe(true);
    const malformedBuild = mobileRequest(); malformedBuild.client.buildId = 'build-45';
    expect(validators.request(malformedBuild)).toBe(false);
    expect(validators.request(mobileRequest({ inventedFact: true }))).toBe(false);
  });
});

describe('canonical platform mapper', () => {
  test('maps exact wrapper and all 19 entered clinical facts plus transient patientId', () => {
    const mapped = mapAssessmentToPlatform(mobileRequest());
    expect(mapped).toEqual(expect.objectContaining({ bayesianEnhanced: false, analysisVersion: '2.2' }));
    expect(Object.keys(mapped.patientData)).toEqual(PATIENT_FIELDS);
    expect(Object.keys(mapped)).toEqual(['patientData', 'bayesianEnhanced', 'analysisVersion']);
    expect(mapped.patientData).not.toHaveProperty('bayesianEnhanced');
    expect(mapped.patientData).not.toHaveProperty('currentDate');
    expect(mapped.patientData).not.toHaveProperty('dataProvenance');
  });

  test.each(['N0', 'N1', 'N2', 'N3'])('preserves nodal stage %s unchanged', nodalStatus => {
    expect(mapAssessmentToPlatform(mobileRequest({ nodalStatus })).patientData.nodalStatus).toBe(nodalStatus);
  });

  test('preserves raw tumour number without conversion and all meaningful zeros/false', () => {
    const mapped = mapAssessmentToPlatform(mobileRequest({ tumorSize: 2.5, her2Low: 'negative' }));
    expect(mapped.patientData.tumorSize).toBe(2.5);
    expect(mapped.patientData).toEqual(expect.objectContaining({ ki67: 0, ca153: 0, cea: 0, ecogScore: 0, lvef: 0, her2Low: false }));
    expect(mapped.bayesianEnhanced).toBe(false);
  });

  test.each([['positive', true], ['negative', false], ['unknown', null], [null, null]])('maps HER2-low %p to %p with disclosed collapse', (input, output) => {
    expect(mapAssessmentToPlatform(mobileRequest({ her2Low: input })).patientData.her2Low).toBe(output);
  });

  test('maps omitted optionals to explicit null without inventing platform facts', () => {
    const minimal = mobileRequest();
    for (const field of ['stage', 'grade', 'histologicalSubtype', 'nodalStatus', 'age', 'ca153', 'cea', 'surgeryDate', 'tumorSize', 'gender', 'ecogScore', 'pdl1Status', 'her2Low', 'lvef', 'treatmentIntent']) delete minimal.assessment[field];
    const mapped = mapAssessmentToPlatform(minimal);
    for (const field of PATIENT_FIELDS.filter(field => !['patientId', 'erStatus', 'prStatus', 'her2Status', 'ki67'].includes(field))) expect(mapped.patientData[field]).toBeNull();
  });
});

test('all schemas parse and OpenAPI local file refs resolve', () => {
  const root = path.resolve(__dirname, '../../schemas');
  for (const file of fs.readdirSync(root).filter(file => file.endsWith('.json'))) JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const openapi = JSON.parse(fs.readFileSync(path.join(root, 'm1.openapi.json'), 'utf8'));
  const refs = JSON.stringify(openapi).match(/[^\"]+\.schema\.json/g) || [];
  expect(refs.length).toBeGreaterThan(0);
  for (const ref of refs) expect(fs.existsSync(path.resolve(root, ref))).toBe(true);
});

describe('listener/upstream configuration safety', () => {
  test('defaults only the listener to loopback and never guesses an upstream URL', () => {
    const config = loadConfig({});
    expect(config.host).toBe('127.0.0.1');
    expect(config.port).toBe(3001);
    expect(config.upstreamInferUrl).toBeNull();
    expect(config.upstreamTimeoutMs).toBe(8000);
  });

  test('requires explicit private-LAN authorisation', () => {
    expect(() => loadConfig({ ACR_GATEWAY_HOST: '0.0.0.0' })).toThrow(/ACR_ALLOW_PRIVATE_LAN/);
    expect(loadConfig({ ACR_GATEWAY_HOST: '0.0.0.0', ACR_ALLOW_PRIVATE_LAN: 'true' }).host).toBe('0.0.0.0');
  });

  test.each(['ftp://example.test/api/infer', 'not-a-url'])('rejects unsafe/non-absolute upstream %s', upstream => {
    expect(() => loadConfig({ ACR_UPSTREAM_INFER_URL: upstream })).toThrow();
  });

  test('allows plaintext upstream only on loopback and requires HTTPS elsewhere', () => {
    expect(loadConfig({ ACR_UPSTREAM_INFER_URL: 'http://127.0.0.1:8080/api/infer' }).upstreamInferUrl).toBe('http://127.0.0.1:8080/api/infer');
    expect(loadConfig({ ACR_UPSTREAM_INFER_URL: 'http://localhost:8080/api/infer' }).upstreamInferUrl).toBe('http://localhost:8080/api/infer');
    expect(() => loadConfig({ ACR_UPSTREAM_INFER_URL: 'http://192.168.1.20:8080/api/infer' })).toThrow(/loopback/);
    expect(() => loadConfig({ ACR_UPSTREAM_INFER_URL: 'http://api.acragent.com/api/infer' })).toThrow(/loopback/);
    expect(loadConfig({ ACR_UPSTREAM_INFER_URL: 'https://api.acragent.com/api/infer' }).upstreamInferUrl).toBe('https://api.acragent.com/api/infer');
  });

  test('evidence endpoints require exact read-only canonical paths', () => {
    const config = loadConfig({
      ACR_UPSTREAM_INFER_URL: 'https://api.acragent.com/api/infer',
      ACR_EVIDENCE_STATUS_URL: 'https://api.acragent.com/api/ontolator/status',
      ACR_EVIDENCE_MANIFEST_URL: 'https://api.acragent.com/api/ontolator/manifest',
      ACR_EVIDENCE_HEALTH_URL: 'https://api.acragent.com/api/infer/health',
      ACR_EVIDENCE_ONTOLOGY_PATH: '/opt/acr/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl',
    });
    expect(config.evidence.statusUrl).toBe('https://api.acragent.com/api/ontolator/status');
    expect(() => loadConfig({ ACR_UPSTREAM_INFER_URL: 'https://api.acragent.com/api/infer', ACR_EVIDENCE_STATUS_URL: 'https://api.acragent.com/api/ontolator/rules' })).toThrow();
    expect(() => loadConfig({ ACR_UPSTREAM_INFER_URL: 'https://api.acragent.com/api/infer', ACR_EVIDENCE_STATUS_URL: 'https://api.acragent.com/api/ontolator/status' })).toThrow(/configured together/);
    expect(() => loadConfig({
      ACR_UPSTREAM_INFER_URL: 'https://api.acragent.com/api/infer',
      ACR_EVIDENCE_STATUS_URL: 'https://other.example/api/ontolator/status',
      ACR_EVIDENCE_MANIFEST_URL: 'https://other.example/api/ontolator/manifest',
      ACR_EVIDENCE_HEALTH_URL: 'https://other.example/api/infer/health',
      ACR_EVIDENCE_ONTOLOGY_PATH: '/opt/acr/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl',
    })).toThrow(/same verified origin/);
  });

  test('literal documented MODE2 environment is accepted and wrong documented paths/origins are rejected', () => {
    const readme = fs.readFileSync(path.resolve(__dirname, '../README.md'), 'utf8');
    const documented = Object.fromEntries([...readme.matchAll(/^(ACR_(?:UPSTREAM_INFER_URL|EVIDENCE_[A-Z_]+))=([^ \\\n]+)/gm)]
      .map(match => [match[1], match[2]]));
    const config = loadConfig(documented);
    expect(config.upstreamInferUrl).toBe('https://api.acragent.com/api/infer');
    expect(config.evidence).toEqual({
      statusUrl: 'https://api.acragent.com/api/ontolator/status',
      manifestUrl: 'https://api.acragent.com/api/ontolator/manifest',
      healthUrl: 'https://api.acragent.com/api/infer/health',
      ontologyPath: '/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl',
    });
    expect(() => loadConfig({ ...documented, ACR_EVIDENCE_STATUS_URL: 'https://api.acragent.com/api/ontology/status' })).toThrow();
    expect(() => loadConfig({ ...documented, ACR_EVIDENCE_HEALTH_URL: 'https://other.example/api/infer/health' })).toThrow(/same verified origin/);
  });

  test.each([
    ['ACR_EXPECTED_LOGICAL_RULE_COUNT', '71.5'], ['ACR_EXPECTED_PHYSICAL_RULE_COUNT', 'NaN'],
    ['ACR_EXPECTED_ACTIVE_RULE_COUNT', '-1'], ['ACR_EXPECTED_LOADED_RULE_COUNT', ''],
    ['ACR_EXPECTED_QUERY_COUNT', '27x'], ['ACR_EXPECTED_ONTOLOGY_SHA256', 'short'],
    ['ACR_EXPECTED_REASONING_MODE', 'SELF_DECLARED'], ['ACR_EXPECTED_REASONER_VERSION', '   '],
  ])('strictly rejects malformed expected evidence %s=%p', (name, value) => {
    expect(() => loadConfig({ [name]: value })).toThrow();
  });

  test('expected evidence defaults are unambiguous and fixture directory must be absolute', () => {
    expect(loadConfig({}).expectedEvidence).toEqual({
      reasonerVersion: 'v2.2', reasoningMode: 'OPENLLET_SWRL',
      ontologySha256: 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1',
      logicalRuleCount: 71, physicalRuleCount: 76, activeRuleCount: 76, loadedRuleCount: 76, queryCount: 27,
    });
    expect(() => loadConfig({ ACR_SYNTHETIC_FIXTURE_DIR: 'relative/fixture' })).toThrow(/absolute/);
  });

  test('exact canonical expected-evidence environment is accepted without rebasing Build 44', () => {
    const canonical = {
      ACR_EXPECTED_REASONER_VERSION: 'v2.2', ACR_EXPECTED_REASONING_MODE: 'OPENLLET_SWRL',
      ACR_EXPECTED_ONTOLOGY_SHA256: 'b91025862e54bc907236b68db763e95b366a43e64869a7da5ed2a00d8a8fd4a1',
      ACR_EXPECTED_LOGICAL_RULE_COUNT: '71', ACR_EXPECTED_PHYSICAL_RULE_COUNT: '76',
      ACR_EXPECTED_ACTIVE_RULE_COUNT: '76', ACR_EXPECTED_LOADED_RULE_COUNT: '76', ACR_EXPECTED_QUERY_COUNT: '27',
    };
    expect(loadConfig(canonical).expectedEvidence).toEqual(loadConfig({}).expectedEvidence);
  });

  test.each([
    ['ACR_EXPECTED_REASONER_VERSION', 'v2.3'],
    ['ACR_EXPECTED_REASONING_MODE', 'JAVA_HARDCODED_FALLBACK'],
    ['ACR_EXPECTED_ONTOLOGY_SHA256', 'a'.repeat(64)],
    ['ACR_EXPECTED_LOGICAL_RULE_COUNT', '70'],
    ['ACR_EXPECTED_PHYSICAL_RULE_COUNT', '75'],
    ['ACR_EXPECTED_ACTIVE_RULE_COUNT', '75'],
    ['ACR_EXPECTED_LOADED_RULE_COUNT', '75'],
    ['ACR_EXPECTED_QUERY_COUNT', '26'],
  ])('syntactically valid noncanonical %s cannot rebase attestation/capture/replay', (name, value) => {
    expect(() => loadConfig({ [name]: value })).toThrow(/pinned/);
  });

  test('invite policy carries no credential in configuration at all (Build 45)', () => {
    // Build 45 retires ACR_INVITE_CODE_SHA256. The single shared unsalted-SHA
    // invite is replaced by per-invitee records in the SQLite store, so no
    // credential material — hashed or otherwise — appears in configuration.
    const config = loadConfig({ ACR_INVITE_CODE_SHA256: 'a'.repeat(64) });
    expect(config).not.toHaveProperty('inviteCodeSha256');
    expect(config).not.toHaveProperty('inviteCode');
    expect(JSON.stringify(config)).not.toContain('a'.repeat(64));

    // Configuration carries where the store lives, never a secret.
    expect(config.authStorePath).toBeNull();
    expect(config.authPepperPath).toBeNull();
    const configured = loadConfig({
      ACR_AUTH_STORE_PATH: '/explicit/auth.db', ACR_AUTH_PEPPER_PATH: '/explicit/pepper.bin',
    });
    expect(configured.authStorePath).toBe('/explicit/auth.db');
    expect(configured.authPepperPath).toBe('/explicit/pepper.bin');

    // Relative paths, and a shared store/pepper file, are refused at construction.
    const { SqliteAuthService } = require('../src/auth/session-store');
    expect(() => new SqliteAuthService({
      storePath: 'relative.db', pepperPath: '/explicit/pepper.bin', expectedClientBuildId: 'mob-v0.6.5+45',
    })).toThrow(/absolute/);
    expect(() => new SqliteAuthService({
      storePath: '/explicit/same.bin', pepperPath: '/explicit/same.bin', expectedClientBuildId: 'mob-v0.6.5+45',
    })).toThrow(/different files/);
  });

  test.each(['1', '249', '30001', 'not-a-number'])('rejects unbounded/invalid timeout %s', timeout => {
    expect(() => loadConfig({ ACR_UPSTREAM_TIMEOUT_MS: timeout })).toThrow();
  });
});
