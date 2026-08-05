/**
 * ACR Mobile Companion API Client
 * Compliant with ACR-DD-014 v0.1 — /m/v1 gateway
 * 
 * Constraints:
 * - No clinical data in logs, headers, or URLs
 * - Attestation must be VERIFIED before infer
 * - Request ID is UUIDv4, header must match body
 * - No auto-retry on INDETERMINATE
 * - Tokens do not contain clinical values
 */

import 'react-native-get-random-values'; // polyfill for crypto.getRandomValues
import { v4 as uuidv4 } from 'uuid';

// ACR-DD-014: Base URL for your local VPS
const API_BASE_URL = 'https://your-vps-domain.com'; // TODO: Update with your actual VPS URL

// ACR-DD-014: Contract identifiers
const CONTRACT_CDS = 'acr.cds.v1';
const CONTRACT_ATTESTATION = 'acr.attestation.v1';
const CONTRACT_ERROR = 'acr.error.v1';

// ACR-DD-014: Security headers
const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-ACR-Contract': CONTRACT_CDS,
  'Cache-Control': 'no-store',
};

// Token storage (in-memory only per ACR-DD-014 §11.3)
let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry: Date | null = null;

// Types from ACR-DD-014
export interface AttestationResponse {
  contract: string;
  verificationState: 'VERIFIED' | 'MISMATCH' | 'UNAVAILABLE';
  expected: {
    reasonerVersion: string;
    reasoningMode: string;
    ontologySha256: string;
    ruleCount: number;
    queryCount: number;
  };
  observed: {
    reasonerVersion: string | null;
    reasoningMode: string | null;
    ontologySha256: string | null;
    ruleCount: number | null;
    queryCount: number | null;
  };
  lastVerificationTimestamp: string;
  lastSuccessfulVerificationTimestamp: string | null;
}

export interface InferRequest {
  contract: string;
  requestId: string;
  assessment: {
    patientId: string;
    erStatus: 'positive' | 'negative';
    prStatus: 'positive' | 'negative';
    her2Status: 'positive' | 'negative';
    ki67: number;
    stage?: string | null;
    grade?: '1' | '2' | '3' | null;
    histologicalSubtype?: 'IDC' | 'ILC' | 'DCIS' | 'PAGET' | null;
    nodalStatus?: 'N0' | 'N1' | 'N2' | 'N3' | null;
    age?: number | null;
    ca153?: number | null;
    cea?: number | null;
    surgeryDate?: string | null;
    bayesianEnhanced: boolean;
  };
  client: {
    channel: 'MOBILE';
    buildId: string;
    environment: 'EVALUATION';
  };
}

export interface InferResponse {
  contract: string;
  requestId: string;
  status: 'COMPLETED';
  completedAt: string;
  data: {
    molecularSubtype: {
      code: string;
      display: string;
    };
    bayesian: {
      enabled: boolean;
      confidence: number;
      band: string;
    };
    reasoning: {
      reasoningMode: string;
      rulesFired: Array<{
        ruleId: string;
        description: string;
        provenance: 'ACR_NATIVE' | 'OPENLLET_NATIVE_VERIFIED';
      }>;
      inferences: string[];
    };
    recommendations: Array<{
      code: string;
      text: string;
      ruleIds: string[];
    }>;
    provenance: {
      reasonerVersion: string;
      responseContract: string;
      ontologySha256: string;
      ruleCount: number;
      queryCount: number;
      environment: string;
    };
  };
  warnings: string[];
}

export interface ErrorResponse {
  contract: string;
  requestId: string;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    outcome: 'NOT_SUBMITTED' | 'INDETERMINATE' | 'FAILED';
    fieldErrors: string[];
  };
}

// ACR-DD-014 §4.3: Generate fresh request ID
const generateRequestId = (): string => uuidv4();

// ACR-DD-014 §5.2: Generate fresh patient ID
const generatePatientId = (): string => `mob-${uuidv4()}`;

// ACR-DD-014 §6.3: Auth redeem
export const redeemInvite = async (
  inviteCode: string,
  deviceBinding: string,
  buildId: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> => {
  const requestId = generateRequestId();
  
  const response = await fetch(`${API_BASE_URL}/m/v1/auth/redeem`, {
    method: 'POST',
    headers: {
      ...HEADERS,
      'X-Request-ID': requestId,
    },
    body: JSON.stringify({
      inviteCode,
      deviceBinding,
      clientBuildId: buildId,
    }),
  });

  if (!response.ok) {
    const error = await response.json() as ErrorResponse;
    throw new Error(error.error?.message || 'Authentication failed');
  }

  const data = await response.json();
  accessToken = data.accessToken;
  refreshToken = data.refreshToken;
  tokenExpiry = new Date(Date.now() + data.expiresIn * 1000);
  
  return data;
};

// ACR-DD-014 §6.3: Refresh token
export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshToken) throw new Error('No refresh token available');

  const requestId = generateRequestId();
  
  const response = await fetch(`${API_BASE_URL}/m/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      ...HEADERS,
      'X-Request-ID': requestId,
      'Authorization': `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    // ACR-DD-014 §6.3: Reuse detection revokes entire family
    accessToken = null;
    refreshToken = null;
    throw new Error('Session expired. Please re-authenticate.');
  }

  const data = await response.json();
  accessToken = data.accessToken;
  refreshToken = data.refreshToken;
  tokenExpiry = new Date(Date.now() + data.expiresIn * 1000);
  
  return data.accessToken;
};

// ACR-DD-014 §6.4: Attestation check
export const getAttestation = async (): Promise<AttestationResponse> => {
  if (!accessToken) throw new Error('Not authenticated');

  const requestId = generateRequestId();
  
  const response = await fetch(`${API_BASE_URL}/m/v1/attestation`, {
    method: 'GET',
    headers: {
      ...HEADERS,
      'X-Request-ID': requestId,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json() as ErrorResponse;
    throw new Error(error.error?.message || 'Attestation check failed');
  }

  return response.json();
};

// ACR-DD-014 §6.5: Submit inference
export const submitInfer = async (
  assessmentData: Omit<InferRequest['assessment'], 'patientId' | 'bayesianEnhanced'> & { bayesianEnhanced: boolean },
  buildId: string
): Promise<InferResponse> => {
  if (!accessToken) throw new Error('Not authenticated');

  // ACR-DD-014 §6.5: Attestation must be VERIFIED
  const attestation = await getAttestation();
  if (attestation.verificationState !== 'VERIFIED') {
    throw new Error(`Attestation ${attestation.verificationState}: Assessment blocked`);
  }

  const requestId = generateRequestId();
  const patientId = generatePatientId();

  const payload: InferRequest = {
    contract: CONTRACT_CDS,
    requestId,
    assessment: {
      ...assessmentData,
      patientId,
      bayesianEnhanced: assessmentData.bayesianEnhanced,
    },
    client: {
      channel: 'MOBILE',
      buildId,
      environment: 'EVALUATION',
    },
  };

  // ACR-DD-014 §4.4: Request ID in header must match body
  const response = await fetch(`${API_BASE_URL}/m/v1/infer`, {
    method: 'POST',
    headers: {
      ...HEADERS,
      'X-Request-ID': requestId,
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json() as ErrorResponse;
    
    // ACR-DD-014 §10.2: INDETERMINATE must never be auto-retried
    if (error.error?.outcome === 'INDETERMINATE') {
      throw new Error('Assessment outcome uncertain. Do not retry automatically.');
    }
    
    throw new Error(error.error?.message || 'Inference failed');
  }

  return response.json();
};

// ACR-DD-014 §6.2: Liveness check (no auth)
export const checkLive = async (): Promise<{ status: string }> => {
  const response = await fetch(`${API_BASE_URL}/m/v1/live`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

  if (!response.ok) {
    throw new Error('Service is not live');
  }

  return response.json();
};

// Utility: Clear all auth state
export const revokeSession = () => {
  accessToken = null;
  refreshToken = null;
  tokenExpiry = null;
};

// Export generators for store use
export { generateRequestId, generatePatientId };