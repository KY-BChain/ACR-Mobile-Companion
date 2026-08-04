/**
 * ACR-DD-014 Contract Types
 * Canonical clinical assessment model for /m/v1 mobile evaluation
 */

// ─── Enums ───

export type ErStatus = 'positive' | 'negative';
export type PrStatus = 'positive' | 'negative';
export type Her2Status = 'positive' | 'negative';
export type Grade = '1' | '2' | '3';
export type NodalStatus = 'N0' | 'N1' | 'N2' | 'N3';
export type HistologicalSubtype = 'IDC' | 'ILC' | 'DCIS' | 'PAGET';
export type Stage = '0' | 'I' | 'IA' | 'IB' | 'II' | 'IIA' | 'IIB' | 'III' | 'IIIA' | 'IIIB' | 'IIIC' | 'IV';
export type VerificationState = 'VERIFIED' | 'MISMATCH' | 'UNAVAILABLE';
export type Provenance = 'ACR_NATIVE' | 'OPENLLET_NATIVE_VERIFIED';
export type Channel = 'MOBILE';
export type Environment = 'EVALUATION';

// ─── Request ───

export interface AssessmentRequest {
  contract: 'acr.cds.v1';
  requestId: string;
  assessment: AssessmentPayload;
  client: ClientMeta;
}

export interface AssessmentPayload {
  patientId: string;
  erStatus: ErStatus;
  prStatus: PrStatus;
  her2Status: Her2Status;
  ki67: number;
  stage?: Stage | null;
  grade?: Grade | null;
  histologicalSubtype?: HistologicalSubtype | null;
  nodalStatus?: NodalStatus | null;
  age?: number | null;
  ca153?: number | null;
  cea?: number | null;
  surgeryDate?: string | null; // YYYY-MM-DD
  bayesianEnhanced: boolean;
}

export interface ClientMeta {
  channel: Channel;
  buildId: string;
  environment: Environment;
}

// ─── Response ───

export interface AssessmentResponse {
  contract: 'acr.cds.v1';
  requestId: string;
  status: 'COMPLETED';
  completedAt: string;
  data: AssessmentData;
  warnings: string[];
}

export interface AssessmentData {
  molecularSubtype: MolecularSubtype;
  bayesian: BayesianResult;
  reasoning: ReasoningResult;
  recommendations: Recommendation[];
  provenance: ResponseProvenance;
}

export interface MolecularSubtype {
  code: string;
  display: string;
}

export interface BayesianResult {
  enabled: boolean;
  confidence: number;
  band: string;
}

export interface ReasoningResult {
  reasoningMode: string;
  rulesFired: FiredRule[];
  inferences: string[];
}

export interface FiredRule {
  ruleId: string;
  description: string;
  provenance: Provenance;
}

export interface Recommendation {
  code: string;
  text: string;
  ruleIds: string[];
}

export interface ResponseProvenance {
  reasonerVersion: string;
  responseContract: string;
  ontologySha256: string;
  ruleCount: number;
  queryCount: number;
  environment: Environment;
}

// ─── Attestation ───

export interface AttestationResponse {
  contract: 'acr.attestation.v1';
  verificationState: VerificationState;
  expected: BaselineEvidence;
  observed: BaselineEvidence;
  lastVerificationTimestamp: string;
  lastSuccessfulVerificationTimestamp: string;
}

export interface BaselineEvidence {
  reasonerVersion: string;
  reasoningMode: string;
  ontologySha256: string;
  ruleCount: number;
  queryCount: number;
}

// ─── Auth ───

export interface AuthRedeemRequest {
  inviteCode: string;
  deviceBinding: string;
  clientBuildId: string;
}

export interface AuthRedeemResponse {
  tokenType: 'Bearer';
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresAt: string;
}

// ─── Error ───

export interface ACRError {
  contract: 'acr.error.v1';
  requestId: string;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    outcome: 'NOT_SUBMITTED' | 'INDETERMINATE' | 'FAILED';
    fieldErrors: string[];
  };
}

// ─── App State ───

export interface AssessmentFormState {
  step1: {
    erStatus: ErStatus;
    prStatus: PrStatus;
    her2Status: Her2Status;
    ki67: string;
  };
  step2: {
    stage: Stage | null;
    grade: Grade | null;
    histologicalSubtype: HistologicalSubtype | null;
    nodalStatus: NodalStatus | null;
    age: string;
  };
  step3: {
    ca153: string;
    cea: string;
    surgeryDate: string;
    bayesianEnhanced: boolean;
  };
}

export type AppScreen =
  | 'Welcome'
  | 'Step1'
  | 'Step2'
  | 'Step3'
  | 'Review'
  | 'Result'
  | 'About'
  | 'FailClosed';
