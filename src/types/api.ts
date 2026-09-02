/** Build 44 mobile/gateway transport types. No clinical inference lives here. */

export type ErStatus = 'positive' | 'negative';
export type PrStatus = 'positive' | 'negative';
export type Her2Status = 'positive' | 'negative';
export type Grade = '1' | '2' | '3';
export type NodalStatus = 'N0' | 'N1' | 'N2' | 'N3';
export type HistologicalSubtype = 'IDC' | 'ILC' | 'DCIS' | 'PAGET';
export type Stage = '0' | 'I' | 'IA' | 'IB' | 'II' | 'IIA' | 'IIB' | 'III' | 'IIIA' | 'IIIB' | 'IIIC' | 'IV';
export type VerificationState = 'VERIFIED' | 'MISMATCH' | 'UNAVAILABLE';
export type PlatformReasoningMode = 'OPENLLET_SWRL' | 'JAVA_HARDCODED_FALLBACK';
export type DeliveryReasoningMode = PlatformReasoningMode | 'NOT_EXECUTED';
export type ResultMode = 'LIVE_REASONER' | 'PLATFORM_FALLBACK' | 'LOCAL_SYNTHETIC_DEMO';
export type DeliveryChoice = 'LIVE_PLATFORM' | 'SYNTHETIC_DEMO';
export type CanonicalSubtype = 'LuminalA' | 'LuminalB_HER2Negative' | 'LuminalB_HER2Positive' | 'HER2Enriched' | 'TripleNegative' | 'NormalLike' | 'Unknown';
export type ProvisionalGender = '' | 'female' | 'male' | 'other' | 'unknown';
export type ProvisionalStatus = '' | 'positive' | 'negative' | 'not_tested';
export type ProvisionalHer2Low = '' | 'positive' | 'negative' | 'unknown';
export type TreatmentIntent = '' | 'neoadjuvant' | 'adjuvant' | 'unspecified';

export interface AssessmentFormState {
  step1: { erStatus: ErStatus; prStatus: PrStatus; her2Status: Her2Status; ki67: string };
  step2: { stage: Stage | null; grade: Grade | null; histologicalSubtype: HistologicalSubtype | null; nodalStatus: NodalStatus | null; age: string };
  step3: { ca153: string; cea: string; surgeryDate: string; bayesianEnhanced: boolean };
}
export interface P1State { tumorSize: string; gender: ProvisionalGender }
export interface P2State { ecogScore: string; pdl1Status: ProvisionalStatus; her2Low: ProvisionalHer2Low; lvef: string; treatmentIntent: TreatmentIntent }

export interface AssessmentPayload {
  patientId: string; erStatus: ErStatus; prStatus: PrStatus; her2Status: Her2Status; ki67: number;
  stage: Stage | null; grade: Grade | null; histologicalSubtype: HistologicalSubtype | null; nodalStatus: NodalStatus | null;
  age: number | null; ca153: number | null; cea: number | null; surgeryDate: string | null; bayesianEnhanced: boolean;
  tumorSize: number | null; gender: Exclude<ProvisionalGender, ''> | null; ecogScore: number | null;
  pdl1Status: Exclude<ProvisionalStatus, ''> | null; her2Low: Exclude<ProvisionalHer2Low, ''> | null;
  lvef: number | null; treatmentIntent: Exclude<TreatmentIntent, ''> | null;
}
export interface AssessmentRequest {
  contract: 'acr.cds.v1'; requestId: string; assessment: AssessmentPayload;
  client: { channel: 'MOBILE'; buildId: 'mob-v0.6.0+44'; environment: 'EVALUATION' };
}
export interface ExpectedEvidence {
  reasonerVersion: string; reasoningMode: string; ontologySha256: string;
  logicalRuleCount: number; physicalRuleCount: number; activeRuleCount: number; loadedRuleCount: number; queryCount: number;
}
export interface ObservedEvidence {
  reasonerVersion: string | null; reasoningMode: string | null; ontologySha256: string | null;
  logicalRuleCount: number | null; physicalRuleCount: number | null; activeRuleCount: number | null; loadedRuleCount: number | null; queryCount: number | null;
}
export interface AttestationResponse {
  contract: 'acr.attestation.v1'; verificationState: VerificationState; expected: ExpectedEvidence; observed: ObservedEvidence;
  lastVerificationTimestamp: string; lastSuccessfulVerificationTimestamp: string | null;
}
export interface FiredRule { ruleId: string; label: string; provenance: string; status: 'FIRED' }
export interface PlatformData {
  patientId: string; timestamp: string; molecularSubtype: CanonicalSubtype;
  deterministic: { molecularSubtype: CanonicalSubtype; riskLevel: string | null; treatments: string[]; biomarkers: Record<string, string>; reasoningMode: PlatformReasoningMode };
  bayesian: { confidence: number; posterior: Record<string, number>; uncertaintyBounds: [number, number]; enabled: boolean };
  reasoning: { rulesFired: string[]; firedRules: FiredRule[]; evidence: string[]; trace: string };
  riskLevel: string | null;
  dataCompleteness: { tier: 1 | 2 | 3; missingFields: string[]; rulesBlocked: number; warning: string };
  reasoningMode: PlatformReasoningMode;
}
export interface PlatformResponse { success: true; message: string; data: PlatformData; executionTimeMs: number; apiVersion: string; timestamp: string }
export interface CapturedProvenance extends ExpectedEvidence { reasoningMode: PlatformReasoningMode; capturedAt: string; captureRoute: string }
export interface AssessmentResponse {
  contract: 'acr.cds.v1'; requestId: string; status: 'COMPLETED'; completedAt: string;
  resultMode: ResultMode; reasoningMode: DeliveryReasoningMode; data: PlatformData; platformResponse: PlatformResponse | null;
  delivery: {
    source: 'CONFIGURED_PLATFORM' | 'VERIFIED_SYNTHETIC_FIXTURE'; currentExecution: boolean;
    currentVerificationState: VerificationState; currentPlatformEvidence: ObservedEvidence;
    capturedPlatform: null | { response: PlatformResponse; reasoningMode: PlatformReasoningMode; provenance: CapturedProvenance };
  };
  warnings: string[];
}
export interface AuthRedeemResponse { tokenType: 'Bearer'; accessToken: string; expiresIn: number; refreshToken: string; refreshExpiresAt: string }
export type ErrorCode =
  | 'SCHEMA_INVALID' | 'REQUEST_ID_MISMATCH' | 'AUTHENTICATION_REQUIRED' | 'INVITE_CONFIGURATION_REQUIRED' | 'INVITE_INVALID'
  | 'DEVICE_BINDING_MISMATCH' | 'CLIENT_BUILD_MISMATCH' | 'AUTHORISED_SCOPE_REQUIRED' | 'TOKEN_REUSE_DETECTED'
  | 'PAYLOAD_TOO_LARGE' | 'CLINICAL_INPUT_REJECTED' | 'RATE_LIMITED' | 'ATTESTATION_MISMATCH' | 'ATTESTATION_UNAVAILABLE'
  | 'UPSTREAM_NOT_CONFIGURED' | 'UPSTREAM_TIMEOUT' | 'UPSTREAM_HTTP_ERROR' | 'INVALID_UPSTREAM_RESPONSE'
  | 'BAYESIAN_ENHANCEMENT_UNAVAILABLE' | 'DEMO_FIXTURE_NOT_AVAILABLE' | 'SERVICE_UNAVAILABLE'
  | 'INFERENCE_OUTCOME_INDETERMINATE' | 'INFERENCE_FAILED';
export interface ACRError { contract: 'acr.error.v1'; requestId: string; error: FailureState }
export interface FailureState { code: ErrorCode; message: string; retryable: boolean; outcome: 'NOT_SUBMITTED' | 'INDETERMINATE' | 'FAILED'; fieldErrors: string[] }
