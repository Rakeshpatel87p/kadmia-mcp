// Kadmia API client - auth and fetch helpers

import { KADMIA_API_BASE, ADMIN_SECRET } from "../config.js";
import type { TokenResponse } from "../types/index.js";

// Get auth token from Kadmia API
export async function getKadmiaToken(uid: string): Promise<string> {
  if (!ADMIN_SECRET) {
    throw new Error("KADMIA_ADMIN_SECRET environment variable is required");
  }

  const response = await fetch(`${KADMIA_API_BASE}/token/service`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": ADMIN_SECRET,
    },
    body: JSON.stringify({ uid }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as TokenResponse;
  return data.token;
}

// Authenticated fetch wrapper for Kadmia API
export async function kadmiaFetch<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${KADMIA_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Kadmia API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
