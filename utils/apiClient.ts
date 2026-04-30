/**
 * API Client Utility
 * Handles authenticated API requests with JWT token management
 *
 * Server URL Priority:
 * 1. Custom URL from Server Settings (user configured)
 * 2. EXPO_PUBLIC_API_URL from .env (fallback)
 * 3. Hardcoded default (http://localhost:3000 for web, http://10.10.1.136:3000 for mobile)
 */

import { API_CONFIG, STORAGE_KEYS } from "@/constants/AppConfig";
import * as SecureStorage from "@/utils/secureStorage";

// Callback for handling 401 unauthorized errors (token expiration)
let onUnauthorized: (() => void) | null = null;

/**
 * Set callback for handling unauthorized errors
 */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

/**
 * Get the current effective API base URL
 * Checks for custom URL first, then falls back to environment variable
 * @returns The current API base URL
 */
export async function getEffectiveApiUrl(): Promise<string> {
  const customServerUrl = await SecureStorage.getItemAsync(
    STORAGE_KEYS.SERVER_API_URL,
  );
  return customServerUrl || API_CONFIG.BASE_URL;
}

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

  // Get custom server URL if configured
  const customServerUrl = await SecureStorage.getItemAsync(
    STORAGE_KEYS.SERVER_API_URL,
  );
  const baseUrl = customServerUrl || API_CONFIG.BASE_URL;

  const requestHeaders = {
    "Content-Type": "application/json",
    "X-Client-Type": "mobile", // Required by backend for CORS
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: requestHeaders,
    credentials: "include", // Include cookies for web
  });

  // Handle 401 Unauthorized (token expired)
  if (response.status === 401) {
    console.error("❌ 401 Unauthorized - Session expired");
    await SecureStorage.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStorage.deleteItemAsync(STORAGE_KEYS.REMEMBER_ME);

    if (onUnauthorized) {
      onUnauthorized();
    }

    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Request failed",
    }));
    console.error(`❌ API Error (${response.status}):`, error);
    throw new Error(
      error.error || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return response.json();
}
