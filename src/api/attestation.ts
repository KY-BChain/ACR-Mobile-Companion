/**
 * Attestation API — /m/v1/attestation
 * ACR-DD-014 §6.4: fail-closed if MISMATCH or UNAVAILABLE
 */

import { apiFetch } from './client';
import type { AttestationResponse } from '../types/api';

export async function checkAttestation(): Promise<AttestationResponse> {
  return apiFetch<AttestationResponse>('/m/v1/attestation', {
    method: 'GET',
    headers: {
      'X-ACR-Contract': 'acr.cds.v1',
    },
  });
}
