/**
 * ACR API Client
 * /m/v1 mobile evaluation channel
 * ACR-DD-014 §6
 */

import type { ACRError } from '../types/api';

const BASE_URL = 'https://api.acragent.com'; // Replace with actual gateway

class ACRAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryable: boolean,
    public outcome: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-store',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ACRError | null = null;
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    const error = errorData?.error;
    throw new ACRAPIError(
      error?.code || `HTTP_${response.status}`,
      error?.message || `Request failed with status ${response.status}`,
      error?.retryable ?? false,
      error?.outcome || 'FAILED',
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export { apiFetch, ACRAPIError };
