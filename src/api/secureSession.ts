import * as SecureStore from 'expo-secure-store';
import { generateDeviceBinding } from '../utils/uuid';

/**
 * Build 45 client-side credential storage (AUTH-03, AUTH-04; G10-0 §2.2, §4.3).
 *
 * - The access token is NEVER stored here. It stays in GatewayClient memory
 *   only, exactly as AUTH-03 requires.
 * - The refresh token is held in the iOS Keychain / Android Keystore via
 *   expo-secure-store, so an evaluator keeps access across app restarts
 *   without needing a new single-use invitation.
 * - The install binding is a random identifier created once per app install
 *   and kept in the same secure store. It is what the gateway binds a session
 *   to (AUTH-04). It was previously regenerated on every launch, which bound
 *   sessions to an app launch rather than an install.
 *
 * WHEN_UNLOCKED_THIS_DEVICE_ONLY keeps both items out of iCloud Keychain sync
 * and out of device-to-device migration, so neither can follow the evaluator
 * to another device — a device change requires a new invitation, per the
 * lost-code procedure (G10-0 §10.3).
 */
export interface SessionStore {
  getInstallBinding(): Promise<string>;
  loadRefresh(): Promise<{ token: string; expiresAt: number } | null>;
  /** The saved session's expiry even when it has passed, or null when none is saved (Build 46). */
  loadRefreshExpiry(): Promise<number | null>;
  saveRefresh(token: string, expiresAt: number): Promise<void>;
  clearRefresh(): Promise<void>;
}

const BINDING_KEY = 'acr.build45.installBinding';
const REFRESH_KEY = 'acr.build45.refreshToken';
const REFRESH_EXPIRY_KEY = 'acr.build45.refreshExpiresAt';
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureSessionStore: SessionStore = {
  async getInstallBinding() {
    const existing = await SecureStore.getItemAsync(BINDING_KEY, OPTIONS);
    if (existing && existing.length >= 8 && existing.length <= 256) return existing;
    const created = generateDeviceBinding();
    await SecureStore.setItemAsync(BINDING_KEY, created, OPTIONS);
    return created;
  },

  async loadRefresh() {
    const [token, expiry] = await Promise.all([
      SecureStore.getItemAsync(REFRESH_KEY, OPTIONS),
      SecureStore.getItemAsync(REFRESH_EXPIRY_KEY, OPTIONS),
    ]);
    const expiresAt = Number(expiry);
    if (!token || !Number.isFinite(expiresAt) || Date.now() >= expiresAt) return null;
    return { token, expiresAt };
  },

  async loadRefreshExpiry() {
    const [token, expiry] = await Promise.all([
      SecureStore.getItemAsync(REFRESH_KEY, OPTIONS),
      SecureStore.getItemAsync(REFRESH_EXPIRY_KEY, OPTIONS),
    ]);
    const expiresAt = Number(expiry);
    return token && Number.isFinite(expiresAt) ? expiresAt : null;
  },

  async saveRefresh(token, expiresAt) {
    await SecureStore.setItemAsync(REFRESH_KEY, token, OPTIONS);
    await SecureStore.setItemAsync(REFRESH_EXPIRY_KEY, String(expiresAt), OPTIONS);
  },

  async clearRefresh() {
    await SecureStore.deleteItemAsync(REFRESH_KEY, OPTIONS);
    await SecureStore.deleteItemAsync(REFRESH_EXPIRY_KEY, OPTIONS);
  },
};

/** In-memory implementation for tests and non-native contexts. */
export function createMemorySessionStore(binding: string): SessionStore & {
  snapshot(): { token: string; expiresAt: number } | null;
} {
  let refresh: { token: string; expiresAt: number } | null = null;
  return {
    async getInstallBinding() { return binding; },
    async loadRefresh() { return refresh && Date.now() < refresh.expiresAt ? { ...refresh } : null; },
    async loadRefreshExpiry() { return refresh ? refresh.expiresAt : null; },
    async saveRefresh(token, expiresAt) { refresh = { token, expiresAt }; },
    async clearRefresh() { refresh = null; },
    snapshot() { return refresh ? { ...refresh } : null; },
  };
}
