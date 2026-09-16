import type { AssessmentFormState, P1State, P2State } from '../types/api';

/**
 * The synthetic sample case the assessment opens with. Steps 1–3 are the stored
 * e2e fixture (e2e/fixtures/luminal-b-request.json). Build 47 (M9) marks any of
 * these values the clinician has not changed on the Review screen.
 */
export const SAMPLE_FORM: AssessmentFormState = {
  step1: { erStatus: 'positive', prStatus: 'positive', her2Status: 'negative', ki67: '25' },
  step2: { stage: 'II', grade: '2', histologicalSubtype: 'IDC', nodalStatus: 'N0', age: '52' },
  step3: { ca153: '40.0', cea: '6.0', surgeryDate: '2026-03-14', bayesianEnhanced: true },
};
export const BLANK_P1: P1State = { tumorSize: '', gender: '' };
export const BLANK_P2: P2State = { ecogScore: '', pdl1Status: '', her2Low: '', lvef: '', treatmentIntent: '' };

/**
 * Build 47 (M12): the synthetic demonstration case — the sample above plus the
 * seven values of the reviewed Gate 1 complete fixture (Gate1EvidenceT4501T4502
 * completeFixturePatient). The gateway replays its captured result only for an
 * exact match of all 20 values, so "Synthetic demo" loads this case.
 */
export const DEMO_P1: P1State = { tumorSize: '22', gender: 'female' };
export const DEMO_P2: P2State = { ecogScore: '1', pdl1Status: 'negative', her2Low: 'positive', lvef: '60', treatmentIntent: 'adjuvant' };

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** All 20 values still equal the demonstration case. */
export function matchesDemoCase(form: AssessmentFormState, p1: P1State, p2: P2State): boolean {
  return same(form, SAMPLE_FORM) && same(p1, DEMO_P1) && same(p2, DEMO_P2);
}

/** Steps 1–3 fields the Review screen marks as unchanged sample values. */
export const SAMPLE_MARKED_FIELDS = Object.freeze([
  'erStatus', 'prStatus', 'her2Status', 'ki67',
  'stage', 'grade', 'histologicalSubtype', 'nodalStatus', 'age',
  'ca153', 'cea', 'surgeryDate',
] as const);
