/**
 * App Configuration Constants
 * Includes API config, storage keys, enums, and pagination settings
 */

// API Configuration
// NOTE: BASE_URL is the DEFAULT/FALLBACK URL from environment variables
// Users can override this by configuring a custom URL in Server Settings
export const API_CONFIG = {
  // Use localhost for web, your computer's IP for mobile
  // This is only used as a fallback if no custom URL is configured
  BASE_URL: (() => {
    // if (Platform.OS === "web") {
    //   return process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
    // }
    // For mobile devices (iOS/Android), use your computer's local IP
    return process.env.EXPO_PUBLIC_API_URL || "http://10.10.1.136:3000";
  })(),
  TIMEOUT: 30000, // 30 seconds
};

// Secure Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth-token",
  REMEMBER_ME: "remember-me",
  BIOMETRIC_ENABLED: "biometric-enabled",
  CACHED_DASHBOARD: "dashboard-data",
  CACHED_CLIENTS: "clients-list",
  CACHED_LOANS: "loans-list",
  SERVER_API_URL: "server-api-url",
};

// Pagination Settings
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Client Status Enum
export enum ClientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
}

// Loan Status Enum
export enum LoanStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DELETED = "DELETED",
}

// Payment Status Enum
export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

// Loan Type Enum
export enum LoanType {
  PERSONAL = "PERSONAL",
  BUSINESS = "BUSINESS",
  EDUCATION = "EDUCATION",
  MORTGAGE = "MORTGAGE",
}
