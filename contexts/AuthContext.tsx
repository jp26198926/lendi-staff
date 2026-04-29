/**
 * Authentication Context
 * Manages user authentication state, JWT tokens, biometric auth, and permissions
 */

import { STORAGE_KEYS } from "@/constants/AppConfig";
import { apiRequest } from "@/utils/apiClient";
import * as SecureStorage from "@/utils/secureStorage";
import * as LocalAuthentication from "expo-local-authentication";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// User interface
interface User {
  userId: string;
  email: string;
  roleId: string;
  name?: string;
}

// Permissions interface
interface Permissions {
  [pagePath: string]: {
    Access?: boolean;
    View?: boolean;
    Add?: boolean;
    Edit?: boolean;
    Delete?: boolean;
  };
}

// Auth context type
interface AuthContextType {
  user: User | null;
  permissions: Permissions;
  loading: boolean;
  biometricEnabled: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  hasPermission: (page: string, permission: string) => boolean;
  authenticateWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [loading, setLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Check biometric status and remember me on mount
  useEffect(() => {
    checkBiometricStatus();
    checkRememberMe();
  }, []);

  /**
   * Check if biometric authentication is enabled
   */
  async function checkBiometricStatus() {
    const enabled = await SecureStorage.getItemAsync(
      STORAGE_KEYS.BIOMETRIC_ENABLED,
    );
    setBiometricEnabled(enabled === "true");
  }

  /**
   * Check if user has "Remember Me" enabled and refresh auth
   */
  async function checkRememberMe() {
    const rememberMe = await SecureStorage.getItemAsync(STORAGE_KEYS.REMEMBER_ME);
    if (rememberMe === "true") {
      await refreshAuth();
    } else {
      setLoading(false);
    }
  }

  /**
   * Login with email and password
   */
  async function login(email: string, password: string, rememberMe = false) {
    const response = await apiRequest<{
      message: string;
      token: string;
      user: User;
      permissions: Permissions;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Store token securely
    await SecureStorage.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);

    // Store remember me preference
    if (rememberMe) {
      await SecureStorage.setItemAsync(STORAGE_KEYS.REMEMBER_ME, "true");
    } else {
      await SecureStorage.deleteItemAsync(STORAGE_KEYS.REMEMBER_ME);
    }

    setUser(response.user);
    setPermissions(response.permissions);
  }

  /**
   * Logout current user
   */
  async function logout() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear local storage regardless of API call result
      await SecureStorage.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStorage.deleteItemAsync(STORAGE_KEYS.REMEMBER_ME);
      setUser(null);
      setPermissions({});
    }
  }

  /**
   * Refresh authentication session
   */
  async function refreshAuth() {
    try {
      setLoading(true);
      const response = await apiRequest<{
        user: User;
        permissions: Permissions;
      }>("/api/auth/session");

      setUser(response.user);
      setPermissions(response.permissions);
    } catch (error) {
      console.error("Session refresh failed:", error);
      await SecureStorage.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStorage.deleteItemAsync(STORAGE_KEYS.REMEMBER_ME);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Check if user has a specific permission
   */
  function hasPermission(page: string, permission: string): boolean {
    return (
      permissions[page]?.[
        permission as keyof (typeof permissions)[typeof page]
      ] === true
    );
  }

  /**
   * Authenticate using biometric (Face ID/Touch ID/Fingerprint)
   */
  async function authenticateWithBiometric(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to access LENDI",
      fallbackLabel: "Use password",
      cancelLabel: "Cancel",
    });

    if (result.success) {
      await refreshAuth();
      return true;
    }

    return false;
  }

  /**
   * Enable biometric authentication
   */
  async function enableBiometric() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware) {
      throw new Error("Biometric hardware not available");
    }

    if (!isEnrolled) {
      throw new Error("No biometric credentials enrolled");
    }

    await SecureStorage.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, "true");
    setBiometricEnabled(true);
  }

  /**
   * Disable biometric authentication
   */
  async function disableBiometric() {
    await SecureStorage.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
    setBiometricEnabled(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        biometricEnabled,
        login,
        logout,
        refreshAuth,
        hasPermission,
        authenticateWithBiometric,
        enableBiometric,
        disableBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
