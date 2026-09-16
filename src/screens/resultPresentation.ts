import type { AssessmentResponse } from '../types/api';

/**
 * Presentation-only grouping for the clinical-first result screen.
 * Every displayed clinical value remains an unchanged, guarded gateway value.
 */
export const TECHNICAL_DETAILS_DEFAULT_EXPANDED = true;
export const BIOMARKER_ONLY_WARNING_PREFIX = '⚠️ BIOMARKER ASSESSMENT — STAGING PENDING';

export type ResultSourceCopyKey =
  | 'result:sourceLive'
  | 'result:sourceFallback'
  | 'result:sourceDemo';

export interface ClinicalResultPresentation {
  sourceCopyKey: ResultSourceCopyKey;
  treatments: string[];
  warnings: string[];
  showBayesianSummary: boolean;
}

export function formatReturnedProbability(value: number): string {
  const percent = value > 1 ? value : value * 100;
  return `${Number(percent.toFixed(2))}%`;
}

export function buildClinicalResultPresentation(result: AssessmentResponse): ClinicalResultPresentation {
  const returnedTreatmentWarnings = result.data.deterministic.treatments.filter((item) =>
    item.startsWith(BIOMARKER_ONLY_WARNING_PREFIX),
  );
  const treatments = result.data.deterministic.treatments.filter((item) =>
    !item.startsWith(BIOMARKER_ONLY_WARNING_PREFIX),
  );
  const warnings = [...new Set([
    ...returnedTreatmentWarnings,
    result.data.dataCompleteness.warning,
    ...result.warnings,
  ].filter((item) => item.trim().length > 0))];

  const sourceCopyKey: ResultSourceCopyKey = result.resultMode === 'LIVE_REASONER'
    ? 'result:sourceLive'
    : result.resultMode === 'PLATFORM_FALLBACK'
      ? 'result:sourceFallback'
      : 'result:sourceDemo';

  return {
    sourceCopyKey,
    treatments,
    warnings,
    showBayesianSummary: result.data.bayesian.enabled,
  };
}

/**
 * Build 46 colour code for values the platform returns, mirroring the ACR
 * Platform website (acr_pathway.html colours positive red and negative
 * green): red for HIGH (and positive), green for LOW (and negative), blue for
 * everything else. Display only — it reads the returned word and never judges
 * a number, so no value is reinterpreted on the device.
 */
export type ResultValueTone = 'high' | 'low' | 'other';

/**
 * Build 47 (Kraken, 16 Sept 2026): the summary risk word is shown in the
 * reader's language. T1 returns HIGH, INTERMEDIATE or LOW; any other value is
 * shown exactly as returned. Colour still follows the returned word.
 */
export type RiskLabelKey = 'build47:riskHigh' | 'build47:riskIntermediate' | 'build47:riskLow';

export function riskLabelKey(value: string | null | undefined): RiskLabelKey | null {
  const word = String(value ?? '').trim().toUpperCase();
  if (word === 'HIGH') return 'build47:riskHigh';
  if (word === 'INTERMEDIATE') return 'build47:riskIntermediate';
  if (word === 'LOW') return 'build47:riskLow';
  return null;
}

export function resultValueTone(value: string | null | undefined): ResultValueTone {
  const word = String(value ?? '').trim().toLowerCase();
  if (word === 'high' || word === 'positive') return 'high';
  if (word === 'low' || word === 'negative') return 'low';
  return 'other';
}
