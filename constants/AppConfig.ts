/**
 * App Configuration Constants
 * Includes API config, storage keys, enums, and pagination settings
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
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
