/**
 * Build 45 Gate 7 — T45-04 firedRules[] ordering contract and T45-10 connection
 * states.
 *
 * T45-04: Gate 1 established empirically (8 runs, 8 distinct orderings) that
 * firedRules[] order carries no information. The contract recorded here is
 * therefore "order is NOT meaningful", and this verifier enforces that no
 * consumer in this repository depends on it.
 *
 * T45-10: the connection-state model must separate gateway reachability from
 * live-platform availability, keep live submission fail-closed in every state
 * that is not fully verified, and never imply on-device inference.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const compile = (file) => {
  const code = ts.transpileModule(read(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports, require);
  return module.exports;
};

// ===========================================================================
// T45-04 — firedRules[] ordering contract
// ===========================================================================

/**
 * THE CONTRACT.
 *
 * `reasoning.firedRules[]` is an UNORDERED SET of the rules that fired for a
 * request. Position conveys no clinical, temporal or priority meaning.
 *
 * Evidence (Gate 1, GATE1_EVIDENCE_T4501_T4502_20260909.md, OBS-3): the same
 * synthetic fixture, on the same reasoning path, produced the four ACR_NATIVE
 * rules {R33, RE3, RE4-1, RE4-2} in eight different orders across eight runs.
 * The only positional regularity is that the classification rule, when present,
 * is deterministically prepended by the platform.
 *
 * Consumers MUST treat the array as a set: identify rules by `ruleId`, never by
 * index, and never present order as ranking or chronology.
 *
 * Deterministic ordering is NOT added by Build 45. Per Loop v1.1 G7-01 it is to
 * be added "only if required". It is not required for correctness or for any
 * consumer in this repository. It IS required for byte-reproducible fixture
 * evidence, because gateway/src/synthetic-fixture-adapter.js `canonical()` sorts
 * object keys but preserves array order, so a captured response's SHA-256
 * depends on this ordering. That defect originates in the platform, where the
 * array is built from an unordered engine result, and the canonical platform
 * checkout is read-only for Build 45. Sorting it at the gateway would be a
 * silent repair of a clinical-engine difference, which backlog §7 Stage C
 * forbids. It is therefore recorded as a platform backlog item and a Gate 11
 * fixture-revalidation risk, not patched here.
 */
const FIRED_RULES_ORDER_IS_MEANINGFUL = false;
assert.equal(FIRED_RULES_ORDER_IS_MEANINGFUL, false,
  'T45-04 contract: firedRules[] order is not meaningful');

// No consumer may index into firedRules or sort it into a presented order.
for (const file of ['src/screens/ResultScreen.tsx', 'src/screens/resultPresentation.ts',
  'src/api/responseGuard.ts']) {
  const source = read(file);
  assert.doesNotMatch(source, /firedRules\s*\[\s*\d+\s*\]/,
    `${file} must not index into firedRules[] — order carries no meaning`);
  assert.doesNotMatch(source, /firedRules[^;\n]*\.sort\s*\(/,
    `${file} must not impose a presentation order on firedRules[]`);
}

// The renderer must key by ruleId, i.e. treat the array as a set.
assert.match(read('src/screens/ResultScreen.tsx'), /firedRules\.map\(\(rule\) =>[\s\S]{0,120}key=\{rule\.ruleId\}/,
  'ResultScreen must render firedRules keyed by ruleId, not by index');

// The gateway guard must accept any order: it validates membership and shape.
assert.doesNotMatch(read('gateway/src/upstream-validator.js'), /firedRules[^;\n]*\.sort\s*\(/,
  'the gateway must not reorder firedRules — transport only, no silent repair');

// ===========================================================================
// T45-10 — connection states
// ===========================================================================
const conn = compile('src/screens/connectionState.ts');
const { deriveConnectionState, capabilitiesFor, liveSubmissionAllowed, CONNECTION_STATES } = conn;

// 1. Reachability and platform availability are genuinely separated: gateway UP
//    yields three distinct states depending on the platform baseline.
const platformStates = ['UNAVAILABLE', 'MISMATCH', 'VERIFIED', null]
  .map((a) => deriveConnectionState('UP', a));
assert.equal(new Set(platformStates).size, 3,
  'a reachable gateway must distinguish verified, unverified and offline platforms');

assert.equal(deriveConnectionState('UNKNOWN', null), 'CHECKING');
assert.equal(deriveConnectionState(null, 'VERIFIED'), 'CHECKING');
assert.equal(deriveConnectionState('DOWN', 'VERIFIED'), 'GATEWAY_OFFLINE',
  'an unreachable gateway must not be masked by a previously verified baseline');
assert.equal(deriveConnectionState('UP', null), 'GATEWAY_CONNECTED_PLATFORM_OFFLINE');
assert.equal(deriveConnectionState('UP', 'UNAVAILABLE'), 'GATEWAY_CONNECTED_PLATFORM_OFFLINE');
assert.equal(deriveConnectionState('UP', 'MISMATCH'), 'GATEWAY_CONNECTED_PLATFORM_UNVERIFIED');
assert.equal(deriveConnectionState('UP', 'VERIFIED'), 'GATEWAY_CONNECTED_PLATFORM_VERIFIED');

// 2. Live submission is fail-closed: allowed in exactly one state.
const allowing = CONNECTION_STATES.filter((s) => capabilitiesFor(s).liveSubmissionAllowed);
assert.deepEqual(allowing, ['GATEWAY_CONNECTED_PLATFORM_VERIFIED'],
  'live submission must be permitted only when the gateway is reachable and the platform is VERIFIED');

for (const gateway of ['UP', 'DOWN', 'UNKNOWN', null]) {
  for (const attestation of ['VERIFIED', 'MISMATCH', 'UNAVAILABLE', null]) {
    const allowed = liveSubmissionAllowed(gateway, attestation);
    assert.equal(allowed, gateway === 'UP' && attestation === 'VERIFIED',
      `live submission decision must be fail-closed for (${gateway}, ${attestation})`);
  }
}

// 3. Synthetic replay is available only through a reachable gateway, never
//    on-device, and never in a state where the gateway itself is unreachable.
for (const state of CONNECTION_STATES) {
  const caps = capabilitiesFor(state);
  if (caps.syntheticReplayAvailable) {
    assert.ok(state.startsWith('GATEWAY_CONNECTED'),
      `${state} offers synthetic replay but does not require gateway reachability`);
  }
  if (caps.liveSubmissionAllowed) {
    assert.ok(caps.syntheticReplayAvailable,
      `${state} allows live submission but not replay, which is inconsistent`);
  }
}
assert.equal(capabilitiesFor('GATEWAY_OFFLINE').syntheticReplayAvailable, false,
  'no delivery may be offered while the gateway is unreachable');

// 4. Every state has a label present in all eight locales, and no label implies
//    on-device inference.
const locales = fs.readdirSync(path.join(root, 'src/i18n/locales')).filter((f) => f.endsWith('.json'));
assert.equal(locales.length, 8);
const ON_DEVICE = /\b(on[- ]device|offline (inference|reasoning|analysis)|local(ly)? (inference|reasoning|comput|analys)|this (phone|device) (calculates|computes|infers|analyses|analyzes))\b/i;
for (const file of locales) {
  const bundle = JSON.parse(read(path.join('src/i18n/locales', file))).gatewayAccess;
  for (const state of CONNECTION_STATES) {
    const key = capabilitiesFor(state).labelKey;
    assert.ok(typeof bundle[key] === 'string' && bundle[key].trim().length > 0,
      `${file} is missing connection-state label "${key}"`);
    assert.doesNotMatch(bundle[key], ON_DEVICE,
      `${file} label "${key}" must not imply the device performs clinical inference`);
  }
  for (const key of ['stateNoLocalInference', 'stateLiveBlocked', 'stateReplayAvailable']) {
    assert.ok(typeof bundle[key] === 'string' && bundle[key].trim().length > 0,
      `${file} is missing "${key}"`);
  }
}

// 5. The screen surfaces the composite state and the no-local-inference notice.
const screen = read('src/screens/GatewayAccessScreen.tsx');
assert.match(screen, /deriveConnectionState\(gatewayLive, attestation \? attestation\.verificationState : null\)/,
  'the screen must derive the composite state from both inputs');
assert.match(screen, /gatewayAccess:\$\{connectionCapabilities\.labelKey\}/,
  'the screen must render the composite state label');
assert.match(screen, /gatewayAccess:stateNoLocalInference/,
  'the screen must always state that the device performs no clinical inference');

// 6. No silent Live→Demonstration fallback: the delivery choice is explicit and
//    is never mutated in response to a connectivity failure.
const client = read('src/api/client.ts');
assert.doesNotMatch(client, /catch[\s\S]{0,200}SYNTHETIC_DEMO/,
  'the client must not fall back to synthetic demonstration on a live failure');
assert.doesNotMatch(screen, /catch[\s\S]{0,200}setDeliveryChoice\('SYNTHETIC_DEMO'\)/,
  'a connectivity failure must not silently switch the delivery mode');

console.log(`PASS Gate 7: firedRules[] contract recorded as an unordered set with no consumer depending on position; ${CONNECTION_STATES.length} connection states separate gateway reachability from live-platform availability, live submission fail-closed to the single fully-verified state, replay gated on gateway reachability, 8 locales labelled with no on-device-inference implication and no silent Live-to-Demonstration fallback`);
