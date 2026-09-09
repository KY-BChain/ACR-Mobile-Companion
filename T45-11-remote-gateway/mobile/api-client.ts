/** Build 45 client candidate. Integrate into src/api/client.ts; do not keep two clients. */
import type { ACRError, AssessmentRequest, AssessmentResponse, AttestationResponse, AuthRedeemResponse, DeliveryChoice, ErrorCode } from '../../src/types/api';
import { parseAssessmentResponse, parseAttestation } from '../../src/api/responseGuard';
import { generateDeviceBinding } from '../../src/utils/uuid';

type FetchLike = typeof fetch;
export interface InstallationProofStore {
  get(): Promise<string | null>;
  set(value: string): Promise<void>;
}
export interface Build45ClientConfig {
  baseUrl: 'https://mobile-gateway-review.acragent.com';
  buildIdentity: `mob-v${string}+${number}`;
  proofStore: InstallationProofStore;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}

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

export class Build45APIError extends Error {
  constructor(public code: ErrorCode, message: string, public statusCode: number,
    public retryable: boolean, public outcome: 'NOT_SUBMITTED' | 'INDETERMINATE' | 'FAILED', public fieldErrors: string[] = []) {
    super(message); this.name = 'Build45APIError';
  }
}

export class Build45APIClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private accessExpiresAt = 0;
  private refreshExpiresAt = 0;
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;
  private proof: string | null = null;
  private refreshInFlight: Promise<void> | null = null;

  constructor(private readonly config: Build45ClientConfig) {
    if (config.baseUrl !== 'https://mobile-gateway-review.acragent.com' || !/^mob-v\d+\.\d+\.\d+\+\d+$/.test(config.buildIdentity)) throw new Error('Invalid immutable Build 45 transport configuration');
    this.fetchImpl = config.fetchImpl || fetch;
    this.timeoutMs = config.timeoutMs || 12000;
  }

  private async installationProof(): Promise<string> {
    if (this.proof) return this.proof;
    const stored = await this.config.proofStore.get();
    if (stored && /^[A-Za-z0-9._~-]{16,256}$/.test(stored)) return (this.proof = stored);
    const created = generateDeviceBinding();
    await this.config.proofStore.set(created);
    return (this.proof = created);
  }

  private async send(path: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await this.fetchImpl(`${this.config.baseUrl}/m/v1${path}`, { ...options, signal: controller.signal });
    } catch {
      throw new Build45APIError('SERVICE_UNAVAILABLE', 'Server not connected.', 0, true, 'NOT_SUBMITTED');
    } finally { clearTimeout(timer); }
  }

  private async parseError(response: Response): Promise<Build45APIError> {
    let envelope: ACRError | null = null;
    try { envelope = await response.json() as ACRError; } catch { /* safe generic below */ }
    const error = envelope?.contract === 'acr.error.v1' ? envelope.error : null;
    const code = error && ERROR_CODES.has(error.code) ? error.code : 'SERVICE_UNAVAILABLE';
    return new Build45APIError(code, error?.message || 'The gateway returned an unavailable response.', response.status,
      error?.retryable ?? false, error?.outcome || 'FAILED',
      Array.isArray(error?.fieldErrors) ? error.fieldErrors.filter((value): value is string => typeof value === 'string') : []);
  }

  private baseHeaders(): Record<string, string> { return { Accept: 'application/json', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }; }
  private async protectedHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
    if (!this.accessToken) throw new Build45APIError('AUTHENTICATION_REQUIRED', 'Evaluation access is required.', 0, false, 'NOT_SUBMITTED');
    return { ...this.baseHeaders(), Authorization: `Bearer ${this.accessToken}`, 'X-Device-Binding': await this.installationProof(),
      'X-Client-Build-ID': this.config.buildIdentity, ...extra };
  }

  private acceptTokens(tokens: AuthRedeemResponse): void {
    const expiry = Date.parse(tokens?.refreshExpiresAt);
    if (tokens?.tokenType !== 'Bearer' || !tokens.accessToken || !tokens.refreshToken || !Number.isInteger(tokens.expiresIn)
        || tokens.expiresIn <= 0 || !Number.isFinite(expiry) || expiry <= Date.now()) {
      this.clearSession(); throw new Build45APIError('SERVICE_UNAVAILABLE', 'Gateway returned an invalid session.', 0, false, 'FAILED');
    }
    this.accessToken = tokens.accessToken; this.refreshToken = tokens.refreshToken;
    this.accessExpiresAt = Date.now() + tokens.expiresIn * 1000; this.refreshExpiresAt = expiry;
  }

  clearSession(): void { this.accessToken = null; this.refreshToken = null; this.accessExpiresAt = 0; this.refreshExpiresAt = 0; }

  async checkLive(): Promise<'UP'> {
    const response = await this.send('/live', { method: 'GET', headers: { Accept: 'application/json', 'Cache-Control': 'no-store' } });
    const value = response.ok ? await response.json() as { status?: unknown } : null;
    if (!response.ok || value?.status !== 'UP') throw response.ok
      ? new Build45APIError('SERVICE_UNAVAILABLE', 'Server not connected.', response.status, true, 'NOT_SUBMITTED') : await this.parseError(response);
    return 'UP';
  }

  async redeemInvite(inviteCode: string): Promise<void> {
    this.clearSession();
    const response = await this.send('/auth/redeem', { method: 'POST', headers: this.baseHeaders(), body: JSON.stringify({
      inviteCode, deviceBinding: await this.installationProof(), clientBuildId: this.config.buildIdentity,
    }) });
    if (!response.ok) throw await this.parseError(response);
    this.acceptTokens(await response.json() as AuthRedeemResponse);
  }

  private async refreshOnce(): Promise<void> {
    if (!this.refreshToken || Date.now() >= this.refreshExpiresAt) { this.clearSession(); throw new Build45APIError('AUTHENTICATION_REQUIRED', 'Evaluation access expired.', 0, false, 'NOT_SUBMITTED'); }
    const response = await this.send('/auth/refresh', { method: 'POST', headers: this.baseHeaders(), body: JSON.stringify({
      refreshToken: this.refreshToken, deviceBinding: await this.installationProof(), clientBuildId: this.config.buildIdentity,
    }) });
    if (!response.ok) { this.clearSession(); throw await this.parseError(response); }
    this.acceptTokens(await response.json() as AuthRedeemResponse);
  }

  private refresh(): Promise<void> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = this.refreshOnce().finally(() => { this.refreshInFlight = null; });
    return this.refreshInFlight;
  }

  private async protectedResponse(path: string, options: RequestInit, extra: Record<string, string> = {}): Promise<Response> {
    if (!this.refreshToken || Date.now() >= this.refreshExpiresAt) throw new Build45APIError('AUTHENTICATION_REQUIRED', 'Evaluation access is required.', 0, false, 'NOT_SUBMITTED');
    if (Date.now() >= this.accessExpiresAt - 30000) await this.refresh();
    let response = await this.send(path, { ...options, headers: await this.protectedHeaders(extra) });
    if (response.status === 401) { await this.refresh(); response = await this.send(path, { ...options, headers: await this.protectedHeaders(extra) }); }
    if (!response.ok) {
      const error = await this.parseError(response);
      if (SESSION_INVALIDATING_CODES.has(error.code)) this.clearSession();
      throw error;
    }
    return response;
  }

  async checkAttestation(): Promise<AttestationResponse> {
    const response = await this.protectedResponse('/attestation', { method: 'GET' });
    try { return parseAttestation(await response.json()); } catch { throw new Build45APIError('INVALID_UPSTREAM_RESPONSE', 'Baseline verification response was invalid.', 0, false, 'FAILED'); }
  }

  async submit(request: AssessmentRequest, choice: DeliveryChoice): Promise<AssessmentResponse> {
    const path = choice === 'SYNTHETIC_DEMO' ? '/demo/infer' : '/infer';
    const response = await this.protectedResponse(path, { method: 'POST', body: JSON.stringify(request) },
      { 'X-ACR-Contract': 'acr.cds.v1', 'X-Request-ID': request.requestId });
    try { return parseAssessmentResponse(await response.json(), request, choice); }
    catch { throw new Build45APIError('INVALID_UPSTREAM_RESPONSE', 'Gateway returned an invalid result.', 0, false, 'FAILED'); }
  }
}
