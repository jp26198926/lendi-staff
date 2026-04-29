/**
 * API Client Utility
 * Handles authenticated API requests with JWT token management
 */

import { API_CONFIG, STORAGE_KEYS } from "@/constants/AppConfig";
import * as SecureStorage from "@/utils/secureStorage";

/**
 * Make an authenticated API request
 * @param endpoint - API endpoint path (e.g., '/api/auth/login')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Parsed JSON response
 * @throws Error if request fails
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  // Retrieve auth token from secure storage
  const token = await SecureStorage.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);

  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Cookie: `auth-token=${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Request failed",
    }));
    throw new Error(
      error.error || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return response.json();
}
