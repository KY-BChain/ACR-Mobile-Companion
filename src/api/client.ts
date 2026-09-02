import { MOBILE_BUILD_ID } from '../config/appIdentity';
import { GATEWAY_API_BASE } from '../config/gateway';
import type { ACRError, AssessmentRequest, AssessmentResponse, AttestationResponse, AuthRedeemResponse, DeliveryChoice, ErrorCode, FailureState } from '../types/api';
import { generateDeviceBinding, generateRequestId } from '../utils/uuid';
import { parseAssessmentResponse, parseAttestation } from './responseGuard';

type FetchLike = typeof fetch;
const deviceBinding = generateDeviceBinding();

const ERROR_CODES = new Set<ErrorCode>([
  'SCHEMA_INVALID', 'REQUEST_ID_MISMATCH', 'AUTHENTICATION_REQUIRED', 'INVITE_CONFIGURATION_REQUIRED', 'INVITE_INVALID',
  'DEVICE_BINDING_MISMATCH', 'CLIENT_BUILD_MISMATCH', 'AUTHORISED_SCOPE_REQUIRED', 'TOKEN_REUSE_DETECTED',
  'PAYLOAD_TOO_LARGE', 'CLINICAL_INPUT_REJECTED', 'RATE_LIMITED', 'ATTESTATION_MISMATCH', 'ATTESTATION_UNAVAILABLE',
  'UPSTREAM_NOT_CONFIGURED', 'UPSTREAM_TIMEOUT', 'UPSTREAM_HTTP_ERROR', 'INVALID_UPSTREAM_RESPONSE',
  'BAYESIAN_ENHANCEMENT_UNAVAILABLE', 'DEMO_FIXTURE_NOT_AVAILABLE', 'SERVICE_UNAVAILABLE',
  'INFERENCE_OUTCOME_INDETERMINATE', 'INFERENCE_FAILED',
]);
const SESSION_INVALIDATING_CODES = new Set<ErrorCode>([
  'AUTHENTICATION_REQUIRED', 'DEVICE_BINDING_MISMATCH', 'CLIENT_BUILD_MISMATCH', 'TOKEN_REUSE_DETECTED',
]);

export class GatewayError extends Error implements FailureState {
  constructor(
    public code: ErrorCode,
    message: string,
    public retryable = false,
    public outcome: 'NOT_SUBMITTED' | 'INDETERMINATE' | 'FAILED' = 'FAILED',
    public fieldErrors: string[] = [],
    public statusCode = 0,
  ) { super(message); }
  toFailure(): FailureState { return { code: this.code, message: this.message, retryable: this.retryable, outcome: this.outcome, fieldErrors: this.fieldErrors }; }
}

export class GatewayClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private accessExpiresAt = 0;
  private refreshExpiresAt = 0;

  constructor(private fetchImpl: FetchLike = fetch) {}

  hasSession(): boolean { return this.accessToken !== null && this.refreshToken !== null && Date.now() < this.refreshExpiresAt; }
  clearSession(): void { this.accessToken = null; this.refreshToken = null; this.accessExpiresAt = 0; this.refreshExpiresAt = 0; }

  private async send(path: string, options: RequestInit): Promise<Response> {
    try {
      return await this.fetchImpl(`${GATEWAY_API_BASE}${path}`, options);
    } catch {
      throw new GatewayError('SERVICE_UNAVAILABLE', 'Server not connected.', true, 'NOT_SUBMITTED');
    }
  }

  private async errorFrom(response: Response): Promise<GatewayError> {
    let envelope: ACRError | null = null;
    try { envelope = await response.json() as ACRError; } catch { /* safe generic error below */ }
    const error = envelope?.contract === 'acr.error.v1' ? envelope.error : null;
    const code = error && ERROR_CODES.has(error.code) ? error.code : 'SERVICE_UNAVAILABLE';
    return new GatewayError(
      code,
      error?.message || 'The gateway returned an unavailable response.',
      error?.retryable ?? false,
      error?.outcome || 'FAILED',
      Array.isArray(error?.fieldErrors) ? error.fieldErrors.filter((item): item is string => typeof item === 'string') : [],
      response.status,
    );
  }

  private baseHeaders(): Record<string, string> {
    return { Accept: 'application/json', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  }

  private protectedHeaders(extra: Record<string, string> = {}): Record<string, string> {
    if (!this.accessToken) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Evaluation access is required.', false, 'NOT_SUBMITTED');
    return {
      ...this.baseHeaders(), Authorization: `Bearer ${this.accessToken}`,
      'X-Device-Binding': deviceBinding, 'X-Client-Build-ID': MOBILE_BUILD_ID, ...extra,
    };
  }

  async checkLive(): Promise<'UP'> {
    const response = await this.send('/live', { method: 'GET', headers: { Accept: 'application/json', 'Cache-Control': 'no-store' } });
    if (!response.ok) throw await this.errorFrom(response);
    const body = await response.json() as { status?: unknown };
    if (body?.status !== 'UP') throw new GatewayError('SERVICE_UNAVAILABLE', 'Server not connected.', true, 'NOT_SUBMITTED');
    return 'UP';
  }

  async redeemInvite(inviteCode: string): Promise<void> {
    this.clearSession();
    const response = await this.send('/auth/redeem', {
      method: 'POST', headers: this.baseHeaders(),
      body: JSON.stringify({ inviteCode, deviceBinding, clientBuildId: MOBILE_BUILD_ID }),
    });
    if (!response.ok) throw await this.errorFrom(response);
    this.acceptTokens(await response.json() as AuthRedeemResponse);
  }

  private acceptTokens(tokens: AuthRedeemResponse): void {
    const refreshExpiry = Date.parse(tokens?.refreshExpiresAt);
    if (tokens?.tokenType !== 'Bearer' || typeof tokens.accessToken !== 'string' || !tokens.accessToken
        || typeof tokens.refreshToken !== 'string' || !tokens.refreshToken
        || !Number.isInteger(tokens.expiresIn) || tokens.expiresIn <= 0 || typeof tokens.refreshExpiresAt !== 'string'
        || !Number.isFinite(refreshExpiry) || refreshExpiry <= Date.now()) {
      this.clearSession();
      throw new GatewayError('SERVICE_UNAVAILABLE', 'The gateway returned an invalid access session.', false, 'FAILED');
    }
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.accessExpiresAt = Date.now() + tokens.expiresIn * 1000;
    this.refreshExpiresAt = refreshExpiry;
  }

  private async refreshAccess(): Promise<void> {
    if (!this.refreshToken || Date.now() >= this.refreshExpiresAt) { this.clearSession(); throw new GatewayError('AUTHENTICATION_REQUIRED', 'Evaluation access has expired.', false, 'NOT_SUBMITTED'); }
    const currentRefreshToken = this.refreshToken;
    try {
      const response = await this.send('/auth/refresh', {
        method: 'POST', headers: this.baseHeaders(),
        body: JSON.stringify({ refreshToken: currentRefreshToken, deviceBinding, clientBuildId: MOBILE_BUILD_ID }),
      });
      if (!response.ok) throw await this.errorFrom(response);
      this.acceptTokens(await response.json() as AuthRedeemResponse);
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  private async protectedResponse(path: string, options: RequestInit, extraHeaders: Record<string, string> = {}): Promise<Response> {
    if (!this.hasSession()) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Evaluation access is required.', false, 'NOT_SUBMITTED');
    if (Date.now() >= this.accessExpiresAt - 30_000) await this.refreshAccess();
    let response = await this.send(path, { ...options, headers: this.protectedHeaders(extraHeaders) });
    if (response.status === 401) {
      const firstError = await this.errorFrom(response);
      if (firstError.code !== 'AUTHENTICATION_REQUIRED') throw firstError;
      await this.refreshAccess();
      response = await this.send(path, { ...options, headers: this.protectedHeaders(extraHeaders) });
      if (response.status === 401) {
        const retryError = await this.errorFrom(response);
        this.clearSession();
        throw retryError;
      }
    }
    if (response.status === 403 || response.status === 409) {
      const protectedError = await this.errorFrom(response);
      if (SESSION_INVALIDATING_CODES.has(protectedError.code)) this.clearSession();
      throw protectedError;
    }
    return response;
  }

  async checkAttestation(): Promise<AttestationResponse> {
    const response = await this.protectedResponse('/attestation', { method: 'GET' });
    if (!response.ok) throw await this.errorFrom(response);
    try { return parseAttestation(await response.json()); }
    catch { throw new GatewayError('INVALID_UPSTREAM_RESPONSE', 'Baseline verification response was invalid.', false, 'FAILED'); }
  }

  async submit(request: AssessmentRequest, choice: DeliveryChoice): Promise<AssessmentResponse> {
    const path = choice === 'SYNTHETIC_DEMO' ? '/demo/infer' : '/infer';
    const response = await this.protectedResponse(path, { method: 'POST', body: JSON.stringify(request) }, {
      'X-ACR-Contract': 'acr.cds.v1', 'X-Request-ID': request.requestId,
    });
    if (!response.ok) throw await this.errorFrom(response);
    try { return parseAssessmentResponse(await response.json(), request, choice); }
    catch { throw new GatewayError('INVALID_UPSTREAM_RESPONSE', 'The gateway returned an incomplete or mismatched result.', false, 'FAILED'); }
  }
}

export const gatewayClient = new GatewayClient();
export const toFailureState = (error: unknown): FailureState => error instanceof GatewayError
  ? error.toFailure()
  : { code: 'SERVICE_UNAVAILABLE', message: 'Server not connected.', retryable: true, outcome: 'NOT_SUBMITTED', fieldErrors: [] };
export const newRequestId = generateRequestId;
