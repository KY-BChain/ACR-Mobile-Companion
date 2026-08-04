/**
 * Inference API — /m/v1/infer
 * ACR-DD-014 §6.5: submit one synthetic assessment
 */

import { apiFetch } from './client';
import type { AssessmentRequest, AssessmentResponse } from '../types/api';

export async function submitAssessment(
  request: AssessmentRequest,
): Promise<AssessmentResponse> {
  return apiFetch<AssessmentResponse>('/m/v1/infer', {
    method: 'POST',
    headers: {
      'X-ACR-Contract': 'acr.cds.v1',
      'X-Request-ID': request.requestId,
    },
    body: JSON.stringify(request),
  });
}
