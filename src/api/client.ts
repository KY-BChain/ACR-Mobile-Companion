import { MOBILE_BUILD_ID } from '../config/appIdentity';
import { GATEWAY_API_BASE } from '../config/gateway';
import type { ACRError, AssessmentRequest, AssessmentResponse, AttestationResponse, AuthRedeemResponse, DeliveryChoice, ErrorCode, FailureState, PairingNotice } from '../types/api';
import { generateRequestId } from '../utils/uuid';
import { parseAssessmentResponse, parseAttestation } from './responseGuard';
import { secureSessionStore, type SessionStore } from './secureSession';

type FetchLike = typeof fetch;

const ERROR_CODES = new Set<ErrorCode>([
  'SCHEMA_INVALID', 'REQUEST_ID_MISMATCH', 'AUTHENTICATION_REQUIRED', 'INVITE_CONFIGURATION_REQUIRED', 'INVITE_INVALID',
  'INVITE_EXPIRED', 'DEVICE_NOT_AUTHORISED', 'DEVICE_BINDING_MISMATCH', 'CLIENT_BUILD_MISMATCH', 'AUTHORISED_SCOPE_REQUIRED', 'TOKEN_REUSE_DETECTED',
  'PAYLOAD_TOO_LARGE', 'CLINICAL_INPUT_REJECTED', 'RATE_LIMITED', 'ATTESTATION_MISMATCH', 'ATTESTATION_UNAVAILABLE',
  'UPSTREAM_NOT_CONFIGURED', 'UPSTREAM_TIMEOUT', 'UPSTREAM_HTTP_ERROR', 'INVALID_UPSTREAM_RESPONSE',
  'BAYESIAN_ENHANCEMENT_UNAVAILABLE', 'DEMO_FIXTURE_NOT_AVAILABLE', 'SERVICE_UNAVAILABLE',
  'INFERENCE_OUTCOME_INDETERMINATE', 'INFERENCE_FAILED', 'TLS_REQUIRED', 'MISDIRECTED_REQUEST',
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

/** Build 47: the reachability check gives up after 10 seconds. */
export const LIVE_CHECK_TIMEOUT_MS = 10_000;

export class GatewayClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private accessExpiresAt = 0;
  private refreshExpiresAt = 0;

  private installBinding: string | null = null;
  private pendingClear: Promise<void> = Promise.resolve();

  /**
   * AUTH-03 / AUTH-04: the access token lives only in this object's memory; the
   * refresh token and the per-install binding live in the Keychain/Keystore via
   * the injected SessionStore.
   */
  constructor(private fetchImpl: FetchLike = fetch, private store: SessionStore = secureSessionStore) {}

  hasSession(): boolean { return this.accessToken !== null && this.refreshToken !== null && Date.now() < this.refreshExpiresAt; }
  clearSession(): void {
    this.accessToken = null; this.refreshToken = null; this.accessExpiresAt = 0; this.refreshExpiresAt = 0;
    // Remove the persisted refresh token too. Any later save awaits this, so a
    // slow delete can never wipe a token issued after it.
    this.pendingClear = this.store.clearRefresh().catch(() => undefined);
  }

  /** The per-install binding, created once and then read from secure storage. */
  private async binding(): Promise<string> {
    if (!this.installBinding) this.installBinding = await this.store.getInstallBinding();
    return this.installBinding;
  }

  private async persistRefresh(): Promise<void> {
    await this.pendingClear;
    if (!this.refreshToken) return;
    // A secure-storage failure degrades to a memory-only session (the Build 44
    // behaviour); it never fails an otherwise valid sign-in.
    await this.store.saveRefresh(this.refreshToken, this.refreshExpiresAt).catch(() => undefined);
  }

  private refreshing: Promise<void> | null = null;
  private restoring: Promise<boolean> | null = null;

  /**
   * Re-establish access after an app restart from the persisted refresh token,
   * without a new invitation. Returns false when there is nothing to restore or
   * the gateway cannot be reached (the token is kept), and clears everything
   * when the gateway refuses the token. Never falls back to synthetic delivery
   * (AUTH-15). Single-flight: overlapping callers share one attempt, so a stored
   * token is never loaded and presented twice.
   */
  restoreSession(): Promise<boolean> {
    if (!this.restoring) this.restoring = this.restoreFromStore().finally(() => { this.restoring = null; });
    return this.restoring;
  }

  private async restoreFromStore(): Promise<boolean> {
    if (this.hasSession()) return true;
    const saved = await this.store.loadRefresh().catch(() => null);
    if (!saved) return false;
    this.refreshToken = saved.token;
    this.refreshExpiresAt = saved.expiresAt;
    try {
      await this.refreshAccess();
      return this.hasSession();
    } catch {
      return false;
    }
  }

  private async send(path: string, options: RequestInit, timeoutMs?: number): Promise<Response> {
    // Build 47: a request can be given a time limit, so a phone that changes
    // network mid-request reports "not connected" instead of checking forever.
    const controller = timeoutMs ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      return await this.fetchImpl(`${GATEWAY_API_BASE}${path}`, controller ? { ...options, signal: controller.signal } : options);
    } catch {
      throw new GatewayError('SERVICE_UNAVAILABLE', 'Server not connected.', true, 'NOT_SUBMITTED');
    } finally {
      if (timer) clearTimeout(timer);
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

  private protectedHeaders(binding: string, extra: Record<string, string> = {}): Record<string, string> {
    if (!this.accessToken) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Evaluation access is required.', false, 'NOT_SUBMITTED');
    return {
      ...this.baseHeaders(), Authorization: `Bearer ${this.accessToken}`,
      'X-Device-Binding': binding, 'X-Client-Build-ID': MOBILE_BUILD_ID, ...extra,
    };
  }

  async checkLive(): Promise<'UP'> {
    const response = await this.send('/live', { method: 'GET', headers: { Accept: 'application/json', 'Cache-Control': 'no-store' } }, LIVE_CHECK_TIMEOUT_MS);
    if (!response.ok) throw await this.errorFrom(response);
    const body = await response.json() as { status?: unknown };
    if (body?.status !== 'UP') throw new GatewayError('SERVICE_UNAVAILABLE', 'Server not connected.', true, 'NOT_SUBMITTED');
    return 'UP';
  }

  /**
   * Build 46: whether this device holds a saved evaluation session, judged from
   * the expiry saved with it — no network needed, so it also answers offline.
   * ACTIVE allows the offline walkthrough; EXPIRED shows the expired-invite
   * message; NONE means no code is paired here (or access was disconnected).
   * An offline phone cannot learn of a revocation until it is next online.
   */
  async savedAccessStatus(): Promise<'NONE' | 'ACTIVE' | 'EXPIRED'> {
    if (this.hasSession()) return 'ACTIVE';
    await this.pendingClear;
    const expiresAt = await this.store.loadRefreshExpiry().catch(() => null);
    if (expiresAt === null) return 'NONE';
    return Date.now() < expiresAt ? 'ACTIVE' : 'EXPIRED';
  }

  async redeemInvite(inviteCode: string): Promise<PairingNotice> {
    this.clearSession();
    const deviceBinding = await this.binding();
    const response = await this.send('/auth/redeem', {
      method: 'POST', headers: this.baseHeaders(),
      body: JSON.stringify({ inviteCode, deviceBinding, clientBuildId: MOBILE_BUILD_ID }),
    });
    if (!response.ok) throw await this.errorFrom(response);
    const tokens = await response.json() as AuthRedeemResponse;
    this.acceptTokens(tokens);
    await this.persistRefresh();
    // The term shown to the evaluator is the one the gateway set, so changing
    // SESSION_MS there needs no app rebuild.
    const days = tokens.sessionDays;
    return {
      pairing: tokens.pairing === 'EXISTING' ? 'EXISTING' : 'NEW',
      pairedAt: typeof tokens.pairedAt === 'string' && Number.isFinite(Date.parse(tokens.pairedAt)) ? tokens.pairedAt : new Date().toISOString(),
      expiresAt: tokens.refreshExpiresAt,
      sessionDays: typeof days === 'number' && Number.isInteger(days) && days > 0 ? days : Math.round((this.refreshExpiresAt - Date.now()) / 86_400_000),
    };
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

  /**
   * One refresh at a time. Refresh tokens rotate on every use, so two
   * overlapping refreshes would present the same token twice and the gateway
   * would revoke the whole token family as a replay (AT-11).
   */
  private refreshAccess(): Promise<void> {
    if (!this.refreshing) this.refreshing = this.rotateRefresh().finally(() => { this.refreshing = null; });
    return this.refreshing;
  }

  private async rotateRefresh(): Promise<void> {
    if (!this.refreshToken || Date.now() >= this.refreshExpiresAt) { this.clearSession(); throw new GatewayError('AUTHENTICATION_REQUIRED', 'Evaluation access has expired.', false, 'NOT_SUBMITTED'); }
    const currentRefreshToken = this.refreshToken;
    let rotated = false;
    try {
      const deviceBinding = await this.binding();
      const response = await this.send('/auth/refresh', {
        method: 'POST', headers: this.baseHeaders(),
        body: JSON.stringify({ refreshToken: currentRefreshToken, deviceBinding, clientBuildId: MOBILE_BUILD_ID }),
      });
      if (!response.ok) throw await this.errorFrom(response);
      rotated = true;
      this.acceptTokens(await response.json() as AuthRedeemResponse);
      await this.persistRefresh();
    } catch (error) {
      // The session ends when the gateway refused the token, or accepted and
      // rotated it (a 200 whose body was unusable leaves the old token spent).
      // A transport, server or rate-limit failure changes nothing, so the
      // persisted refresh token survives and access returns once the gateway
      // is reachable (Gate 12 device finding: an offline launch wiped the
      // session). If a lost response had in fact rotated the token, the next
      // presentation is refused as reuse and the gateway revokes the family —
      // the same end state as clearing here, decided by the gateway's defence.
      if (rotated || (error instanceof GatewayError && SESSION_INVALIDATING_CODES.has(error.code))) this.clearSession();
      throw error;
    }
  }

  private async protectedResponse(path: string, options: RequestInit, extraHeaders: Record<string, string> = {}): Promise<Response> {
    if (!this.hasSession()) throw new GatewayError('AUTHENTICATION_REQUIRED', 'Evaluation access is required.', false, 'NOT_SUBMITTED');
    if (Date.now() >= this.accessExpiresAt - 30_000) await this.refreshAccess();
    const binding = await this.binding();
    let response = await this.send(path, { ...options, headers: this.protectedHeaders(binding, extraHeaders) });
    if (response.status === 401) {
      const firstError = await this.errorFrom(response);
      if (firstError.code !== 'AUTHENTICATION_REQUIRED') throw firstError;
      await this.refreshAccess();
      response = await this.send(path, { ...options, headers: this.protectedHeaders(binding, extraHeaders) });
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
