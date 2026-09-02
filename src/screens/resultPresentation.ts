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
