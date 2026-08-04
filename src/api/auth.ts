/**
 * Auth API — /m/v1/auth/*
 * ACR-DD-014 §6.3
 */

import { apiFetch } from './client';
import type { AuthRedeemRequest, AuthRedeemResponse } from '../types/api';

export async function redeemInvite(
  inviteCode: string,
  deviceBinding: string,
  clientBuildId: string,
): Promise<AuthRedeemResponse> {
  const body: AuthRedeemRequest = {
    inviteCode,
    deviceBinding,
    clientBuildId,
  };
  return apiFetch<AuthRedeemResponse>('/m/v1/auth/redeem', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function refreshToken(refreshToken: string): Promise<AuthRedeemResponse> {
  return apiFetch<AuthRedeemResponse>('/m/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
