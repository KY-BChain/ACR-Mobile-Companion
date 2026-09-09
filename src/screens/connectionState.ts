import type { VerificationState } from '../types/api';

/**
 * Build 45 / T45-10 — connection state model.
 *
 * Gateway reachability and live-platform availability are two independent
 * facts, and Build 44 surfaced them as two separate rows the reader had to
 * combine mentally. This module derives a single named state from both, so the
 * distinction is stated rather than inferred.
 *
 * Three invariants hold for every state below:
 *
 *  1. Live submission is fail-closed. `liveSubmissionAllowed` is true only when
 *     the gateway is reachable AND the platform baseline is VERIFIED. A
 *     MISMATCH, an UNAVAILABLE baseline, an unreachable gateway or an unknown
 *     state all deny live submission.
 *  2. Verified synthetic replay may remain available while the live platform is
 *     offline, but only through the gateway — it always requires gateway
 *     reachability, and it never performs current inference.
 *  3. No state implies the device performs clinical inference. Every label
 *     describes the reachability of remote components only.
 */
export type ConnectionState =
  | 'CHECKING'
  | 'GATEWAY_OFFLINE'
  | 'GATEWAY_CONNECTED_PLATFORM_OFFLINE'
  | 'GATEWAY_CONNECTED_PLATFORM_UNVERIFIED'
  | 'GATEWAY_CONNECTED_PLATFORM_VERIFIED';

export interface ConnectionCapabilities {
  /** Live inference against the ACR Platform may be submitted. */
  liveSubmissionAllowed: boolean;
  /** Explicit verified synthetic replay may be requested through the gateway. */
  syntheticReplayAvailable: boolean;
  /** i18n key under the `gatewayAccess` namespace for the user-facing label. */
  labelKey: string;
}

export type GatewayReachability = 'UP' | 'DOWN' | 'UNKNOWN' | null;

const CAPABILITIES: Record<ConnectionState, ConnectionCapabilities> = {
  CHECKING: {
    liveSubmissionAllowed: false,
    syntheticReplayAvailable: false,
    labelKey: 'stateChecking',
  },
  GATEWAY_OFFLINE: {
    liveSubmissionAllowed: false,
    syntheticReplayAvailable: false,
    labelKey: 'stateGatewayOffline',
  },
  GATEWAY_CONNECTED_PLATFORM_OFFLINE: {
    liveSubmissionAllowed: false,
    syntheticReplayAvailable: true,
    labelKey: 'stateGatewayConnectedPlatformOffline',
  },
  GATEWAY_CONNECTED_PLATFORM_UNVERIFIED: {
    liveSubmissionAllowed: false,
    syntheticReplayAvailable: true,
    labelKey: 'stateGatewayConnectedPlatformUnverified',
  },
  GATEWAY_CONNECTED_PLATFORM_VERIFIED: {
    liveSubmissionAllowed: true,
    syntheticReplayAvailable: true,
    labelKey: 'stateGatewayConnectedPlatformVerified',
  },
};

/**
 * Derive the connection state. `attestation` is null when no baseline check has
 * completed — which is treated as platform-offline, never as available.
 */
export function deriveConnectionState(
  gatewayLive: GatewayReachability,
  attestation: VerificationState | null,
): ConnectionState {
  if (gatewayLive === null || gatewayLive === 'UNKNOWN') return 'CHECKING';
  if (gatewayLive === 'DOWN') return 'GATEWAY_OFFLINE';
  if (attestation === null || attestation === 'UNAVAILABLE') {
    return 'GATEWAY_CONNECTED_PLATFORM_OFFLINE';
  }
  if (attestation === 'MISMATCH') return 'GATEWAY_CONNECTED_PLATFORM_UNVERIFIED';
  return 'GATEWAY_CONNECTED_PLATFORM_VERIFIED';
}

export function capabilitiesFor(state: ConnectionState): ConnectionCapabilities {
  return CAPABILITIES[state];
}

/** Convenience: fail-closed live-submission decision from raw inputs. */
export function liveSubmissionAllowed(
  gatewayLive: GatewayReachability,
  attestation: VerificationState | null,
): boolean {
  return capabilitiesFor(deriveConnectionState(gatewayLive, attestation)).liveSubmissionAllowed;
}

export const CONNECTION_STATES: readonly ConnectionState[] = Object.freeze(
  Object.keys(CAPABILITIES) as ConnectionState[],
);
