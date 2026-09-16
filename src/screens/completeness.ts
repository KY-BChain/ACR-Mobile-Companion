import type { AssessmentFormState, P1State, P2State } from '../types/api';

/**
 * Build 47 (M1, M2, M7): the ten values T1 needs for a full assessment, in the
 * order T1 checks them — ReasonerService.assessDataCompleteness at platform
 * 33daead: tier 1 first, then tier 2. This copies a platform rule, so
 * tests/mobile/completeness.verify.js pins it; re-check it whenever T1 changes.
 * Presence only: nothing here judges a value.
 */
export type EntryRoute = 'Step1' | 'Step2' | 'Step3' | 'P1' | 'P2';

export const ENTRY_SCREEN_COUNT = 5;

export interface FullAssessmentField {
  /** The name T1 returns in dataCompleteness.missingFields. */
  platformName: string;
  labelKey: string;
  route: EntryRoute;
  screen: number;
  tier: 1 | 2;
  isBlank: (form: AssessmentFormState, p1: P1State, p2: P2State) => boolean;
}

const blank = (value: string) => value.trim() === '';

export const FULL_ASSESSMENT_FIELDS: readonly FullAssessmentField[] = Object.freeze([
  { platformName: 'erStatus', labelKey: 'receptors:erStatus', route: 'Step1', screen: 1, tier: 1, isBlank: (form) => !form.step1.erStatus },
  { platformName: 'prStatus', labelKey: 'receptors:prStatus', route: 'Step1', screen: 1, tier: 1, isBlank: (form) => !form.step1.prStatus },
  { platformName: 'her2Status', labelKey: 'receptors:her2Status', route: 'Step1', screen: 1, tier: 1, isBlank: (form) => !form.step1.her2Status },
  { platformName: 'ki67', labelKey: 'receptors:ki67', route: 'Step1', screen: 1, tier: 1, isBlank: (form) => blank(form.step1.ki67) },
  { platformName: 'histologicGrade', labelKey: 'tumour:grade', route: 'Step2', screen: 2, tier: 1, isBlank: (form) => form.step2.grade === null },
  { platformName: 'tumorSize', labelKey: 'p1:tumorSize', route: 'P1', screen: 4, tier: 1, isBlank: (_form, p1) => blank(p1.tumorSize) },
  { platformName: 'nodalStatus', labelKey: 'tumour:nodalStatus', route: 'Step2', screen: 2, tier: 1, isBlank: (form) => form.step2.nodalStatus === null },
  { platformName: 'age', labelKey: 'tumour:age', route: 'Step2', screen: 2, tier: 1, isBlank: (form) => blank(form.step2.age) },
  { platformName: 'overallStageGroup', labelKey: 'tumour:stage', route: 'Step2', screen: 2, tier: 2, isBlank: (form) => form.step2.stage === null },
  { platformName: 'ecogScore', labelKey: 'p2:ecogScore', route: 'P2', screen: 5, tier: 2, isBlank: (_form, _p1, p2) => blank(p2.ecogScore) },
]);

const ROUTE_ORDER: readonly EntryRoute[] = ['Step1', 'Step2', 'Step3', 'P1', 'P2'];

/** The app field behind a name T1 returns, or null for a name this build does not know. */
export function fullAssessmentField(platformName: string): FullAssessmentField | null {
  return FULL_ASSESSMENT_FIELDS.find((field) => field.platformName === platformName) ?? null;
}

/** Values T1 needs for a full assessment that are blank right now (Review screen, M7). */
export function blankFullAssessmentFields(form: AssessmentFormState, p1: P1State, p2: P2State): FullAssessmentField[] {
  return FULL_ASSESSMENT_FIELDS.filter((field) => field.isBlank(form, p1, p2));
}

/** The earliest entry screen holding a missing field (M1); Step 1 when none is recognised. */
export function firstEntryRoute(missingFields: readonly string[]): EntryRoute {
  const routes = missingFields.map(fullAssessmentField).filter((field): field is FullAssessmentField => field !== null).map((field) => field.route);
  return ROUTE_ORDER.find((route) => routes.includes(route)) ?? 'Step1';
}

/** T1 withheld the headline risk because the case is incomplete (M4, M5). */
export function isRiskWithheld(data: { riskLevel: string | null; dataCompleteness: { tier: number } }): boolean {
  return data.riskLevel === null && data.dataCompleteness.tier < 3;
}
