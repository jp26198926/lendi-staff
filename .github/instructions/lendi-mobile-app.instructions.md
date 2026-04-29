---
description: "Use when working on LENDI mobile app, lending application frontend, Expo React Native development, mobile app authentication, API integration with NextJS backend, or implementing Zentyal theme colors. Applies to loan management, client management, payment processing mobile interfaces."
applyTo: "lendi/**"
---

# Expo Version Warning

⚠️ **This is NOT the Expo you know.**

This project uses Expo SDK 54+ with breaking changes. APIs, conventions, and file structure differ significantly from older versions and may differ from your training data.

**REQUIRED BEFORE ANY CODE CHANGES:**

1. Check `node_modules/expo-router/` documentation for routing patterns
2. Verify package versions in `package.json` before suggesting APIs
3. Read deprecation warnings in terminal output
4. Test configurations before assuming they work

Common SDK 54+ breaking changes:

- `expo-router` now requires `expo-router/entry` in entry point (NOT `App.tsx`)
- Path alias (@/) configured in `tsconfig.json` paths
- React peer dependency conflicts are common - use `--legacy-peer-deps` flag
- Many packages moved to peer dependencies - install explicitly

# LENDI Mobile App Development Guidelines

LENDI is a mobile frontend for a lending application backend built with NextJS. Follow these conventions to ensure consistency with the backend API and branding.

## Project Information

- **App Name:** LENDI
- **Backend:** NextJS at `C:\FILES\PROGRAM\NEXTJS\lending-app` (planned integration)
  - **Important:** Always reference backend codebase for exact API data structures
  - **Dashboard API:** `C:\FILES\PROGRAM\NEXTJS\lending-app\app\api\admin\dashboard\route.ts`
  - **Backend Structure:** API routes in `/app/api/`, Models in `/models/`, Utils in `/lib/`
- **Framework:** Expo SDK 54+ (54.0.33) + React Native 0.81.5
- **React Version:** 19.1.0 (SDK 54 ships with this, do NOT upgrade to 19.2.5)
- **Language:** TypeScript (strict mode enabled)
- **Routing:** expo-router 6.0.23 (file-based routing)
- **Build Type:** Development Build (supports custom native modules)
- **Backend API Base:** Configure via `EXPO_PUBLIC_API_URL` in `.env` (to be created)

### Current Project State

✅ **Completed:**

- Expo SDK 54 app created with blank-typescript template
- expo-router configured with file-based routing
- TypeScript strict mode enabled
- Path aliases (@/) configured in tsconfig.json
- Basic tab navigation (Home, Explore)
- Dark/Light theme support with themed components
- Standard Expo dependencies installed
- Zentyal theme colors (orange #ff6f00, yellow-green #a4c639) implemented

✅ **Recently Implemented:**

- Authentication system (AuthContext, login screen, biometric)
- API client utility
- Environment variables (.env file)
- Secure storage setup
- Dashboard screen with statistics
- Profile/Menu screen with settings
- Withdrawal process (profile page)
- User Ledger screen (transaction history)
  - Endpoint: GET /api/profile/userledger
  - Displays: CAPITAL_IN, EARNING, WITHDRAWAL transactions
  - Shows summary cards and detailed transaction list
  - Filterable by status and type
  - Supports pull-to-refresh

❌ **Not Yet Implemented:**

- Backend integration (API endpoints not live)
- Client/Loan/Payment management screens
- Role-based navigation (partially implemented)

### User Roles (Planned)

1. **Admin Users** - Full access to all features (client, loan, payment management)
2. **Regular Users** - Limited access based on role permissions
3. **Clients** - View only their own loans, make payments, view profile

## Project Setup

### Current Setup Status

The project has been initialized with:

```bash
npx create-expo-app@latest lendi --template blank-typescript
cd lendi
```

**Installed Dependencies:**

```json
{
  "@expo/vector-icons": "^15.0.3",
  "@react-navigation/bottom-tabs": "^7.4.0",
  "@react-navigation/elements": "^2.6.3",
  "@react-navigation/native": "^7.1.8",
  "expo": "~54.0.33",
  "expo-constants": "~18.0.13",
  "expo-font": "~14.0.11",
  "expo-haptics": "~15.0.8",
  "expo-image": "~3.0.11",
  "expo-linking": "~8.0.11",
  "expo-router": "~6.0.23",
  "expo-splash-screen": "~31.0.13",
  "expo-status-bar": "~3.0.9",
  "expo-symbols": "~1.0.8",
  "expo-system-ui": "~6.0.9",
  "expo-web-browser": "~15.0.10",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-native": "0.81.5",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "~4.1.1",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0",
  "react-native-web": "~0.21.0",
  "react-native-worklets": "0.5.1"
}
```

### Next Steps: Required Dependencies

**TO INSTALL:** For the full LENDI app features, you'll need:

```bash
# Authentication and storage
npx expo install expo-local-authentication expo-secure-store @react-native-async-storage/async-storage

# Note: expo-router and @expo/vector-icons already installed
```

**Note:** If you encounter peer dependency errors with ANY package, use `--legacy-peer-deps` flag.

### Entry Point Configuration

✅ **Already Configured:** The entry point is set in `package.json`:

```json
{
  "main": "expo-router/entry"
}
```

expo-router handles app initialization automatically. No `index.ts` or `App.tsx` needed at root level.

### Path Aliases (@/) Configuration

✅ **TypeScript Configured:** `tsconfig.json` already has path aliases:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Environment Variables (To Be Created)

Create `.env` file at root:

```bash
# For physical device testing, use computer's IP address instead of localhost
EXPO_PUBLIC_API_URL=http://localhost:3000
# Example for device: EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

### Starting the App

```bash
npx expo start --clear
```

**Port Issues:** If port 8081 is in use, Expo will prompt to use 8082. Accept it.

## Theme Colors (Zentyal Orange & Yellow-Green)

### Current State

✅ **Implemented:** The project now uses Zentyal brand colors in `constants/theme.ts`:

```typescript
// Zentyal Brand Colors
export const ZentyalColors = {
  dark: '#2d3748',      // Dark gray/charcoal for text
  primary: '#ff6f00',   // Primary orange (Zentyal brand color)
  accent: '#a4c639',    // Yellow-green accent
  light: '#f5f7fa',     // Light background
  gray: '#6b7280',      // Medium gray
  success: '#28a745',   // Green for success states
  warning: '#ffc107',   // Yellow for warnings
  danger: '#dc3545',    // Red for errors
  info: '#ff6f00',      // Same as primary orange
};

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#0a7ea4", // Default blue
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",
export const Colors = {
  light: {
    text: ZentyalColors.dark,
    background: ZentyalColors.light,
    tint: ZentyalColors.primary,
    icon: ZentyalColors.gray,
    tabIconDefault: ZentyalColors.gray,
    tabIconSelected: ZentyalColors.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: ZentyalColors.primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: ZentyalColors.primary,
  },
};
```

### Usage Guidelines

- **Primary actions** (buttons, CTAs): `ZentyalColors.primary` (#ff6f00)
- **Accent/highlights**: `ZentyalColors.accent` (#a4c639)
- **Backgrounds**: `ZentyalColors.light` (#f5f7fa) or theme-aware `Colors.light.background`
- **Text**: `ZentyalColors.dark` (#2d3748) for headings, `ZentyalColors.gray` (#6b7280) for body
- **Status indicators**: `success` (green), `warning` (yellow), `danger` (red)
- **Navigation bars**: Primary orange background with white text

### Import Pattern

```typescript
import { ZentyalColors } from "@/constants/theme";
```

## UI/UX Conventions

### Currency Formatting

**IMPORTANT:** Do NOT use currency symbols (₱, $, etc.) anywhere in the UI.

❌ **Wrong:**

```typescript
value={`₱${formatCurrency(amount)}`}
<Text>Available: ₱{balance}</Text>
```

✅ **Correct:**

```typescript
value={formatCurrency(amount)}
<Text>Available: {formatCurrency(balance)}</Text>
```

**Rationale:**

- Clean, minimalist UI design
- Avoids font rendering issues with special characters
- Currency context is already established (Philippine lending app)
- Numbers are more readable without symbols

**formatCurrency Function:**

```typescript
function formatCurrency(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
```

This applies to:

- All financial displays (balances, amounts, totals)
- Input placeholders and labels
- Alert messages and confirmations
- Charts and statistics
- Any monetary value in the UI

## Authentication Architecture

### Overview

❌ **Not Yet Implemented:** The following authentication system needs to be built.

LENDI will use JWT-based authentication with biometric support (Face ID/Touch ID/Fingerprint).

**Flow:**

1. User logs in with email/password → receives JWT token
2. Token stored in `expo-secure-store` (encrypted on device)
3. Token sent with every API request via Cookie header
4. Biometric auth optional (enabled after first login)
5. "Remember Me" feature keeps user logged in across app restarts

### Auth Context Structure

**Location:** `contexts/AuthContext.tsx`

```typescript
import { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { apiRequest } from '@/utils/apiClient';

// Storage keys
const TOKEN_KEY = 'auth-token';
const REMEMBER_ME_KEY = 'remember-me';
const BIOMETRIC_ENABLED_KEY = 'biometric-enabled';

interface User {
  userId: string;
  email: string;
  roleId: string;
  name?: string;
}

interface Permissions {
  [pagePath: string]: {
    Access?: boolean;
    View?: boolean;
    Add?: boolean;
    Edit?: boolean;
    Delete?: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  permissions: Permissions;
  loading: boolean;
  biometricEnabled: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  hasPermission: (page: string, permission: string) => boolean;
  authenticateWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [loading, setLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Check if biometric is enabled on mount
  useEffect(() => {
    checkBiometricStatus();
    checkRememberMe();
  }, []);

  async function checkBiometricStatus() {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    setBiometricEnabled(enabled === 'true');
  }

  async function checkRememberMe() {
    const rememberMe = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
    if (rememberMe === 'true') {
      await refreshAuth();
    } else {
      setLoading(false);
    }
  }

  async function login(email: string, password: string, rememberMe = false) {
    const response = await apiRequest<{
      message: string;
      token: string;
      user: User;
      permissions: Permissions;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token securely
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);

    // Store remember me preference
    if (rememberMe) {
      await SecureStore.setItemAsync(REMEMBER_ME_KEY, 'true');
    } else {
      await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
    }

    setUser(response.user);
    setPermissions(response.permissions);
  }

  async function logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call result
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
      setUser(null);
      setPermissions({});
    }
  }

  async function refreshAuth() {
    try {
      setLoading(true);
      const response = await apiRequest<{
        user: User;
        permissions: Permissions;
      }>('/api/auth/session');

      setUser(response.user);
      setPermissions(response.permissions);
    } catch (error) {
      console.error('Session refresh failed:', error);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
    } finally {
      setLoading(false);
    }
  }

  function hasPermission(page: string, permission: string): boolean {
    return permissions[page]?.[permission] === true;
  }

  async function authenticateWithBiometric(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access LENDI',
      fallbackLabel: 'Use password',
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      await refreshAuth();
      return true;
    }

    return false;
  }

  async function enableBiometric() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware) {
      throw new Error('Biometric hardware not available');
    }

    if (!isEnrolled) {
      throw new Error('No biometric credentials enrolled');
    }

    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    setBiometricEnabled(true);
  }

  async function disableBiometric() {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
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

// Custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Login Screen Pattern

**Location:** `app/login.tsx`

```typescript
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ZentyalColors } from '@/constants/Colors';

export default function LoginScreen() {
  const { login, authenticateWithBiometric, biometricEnabled } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password, rememberMe);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleBiometricLogin() {
    try {
      setLoading(true);
      const success = await authenticateWithBiometric();
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Authentication Failed', 'Please try again');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Biometric authentication failed'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>LENDI</Text>
        <Text style={styles.subtitle}>Lending Management System</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            disabled={loading}
          >
            <Ionicons
              name={rememberMe ? 'checkbox' : 'square-outline'}
              size={24}
              color={ZentyalColors.primary}
            />
            <Text style={styles.checkboxLabel}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Ionicons name="finger-print" size={32} color={ZentyalColors.primary} />
              <Text style={styles.biometricText}>Use Biometric</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZentyalColors.light,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: ZentyalColors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: ZentyalColors.gray,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: ZentyalColors.dark,
  },
  loginButton: {
    backgroundColor: ZentyalColors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  biometricButton: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  biometricText: {
    fontSize: 16,
    color: ZentyalColors.primary,
  },
});
```

### API Client Utility

❌ **Not Yet Implemented:** Create this utility file when ready to integrate with backend.

**Location:** `utils/apiClient.ts` (needs to be created)

```typescript
import * as SecureStore from "expo-secure-store";
import { API_CONFIG } from "@/constants/AppConfig";

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = await SecureStore.getItemAsync("auth-token");

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
```

**Usage:**

```typescript
// GET request
const clients = await apiRequest<Client[]>("/api/admin/client");

// POST request
const newClient = await apiRequest<Client>("/api/admin/client", {
  method: "POST",
  body: JSON.stringify({ name: "John Doe", email: "john@example.com" }),
});

// PUT request
const updatedClient = await apiRequest<Client>(`/api/admin/client/${id}`, {
  method: "PUT",
  body: JSON.stringify({ name: "Jane Doe" }),
});

// DELETE request
await apiRequest(`/api/admin/client/${id}`, {
  method: "DELETE",
});
```

## Backend API Integration

### API Endpoint Structure

The backend follows RESTful conventions:

```
Authentication:
POST   /api/auth/login              - Login with email/password
POST   /api/auth/logout             - Logout current session
GET    /api/auth/session            - Check session status

Admin - Client Management:
GET    /api/admin/client            - List all clients
GET    /api/admin/client/[id]       - Get single client
POST   /api/admin/client            - Create new client
PUT    /api/admin/client/[id]       - Update client
DELETE /api/admin/client/[id]       - Soft delete client

Admin - Loan Management:
GET    /api/admin/loan              - List all loans
GET    /api/admin/loan/[id]         - Get single loan
POST   /api/admin/loan              - Create new loan
PUT    /api/admin/loan/[id]         - Update loan
DELETE /api/admin/loan/[id]         - Cancel/delete loan

Admin - Payment Management:
GET    /api/admin/payment           - List all payments
GET    /api/admin/payment/[id]      - Get single payment
POST   /api/admin/payment           - Record new payment
PUT    /api/admin/payment/[id]      - Update payment
DELETE /api/admin/payment/[id]      - Delete payment

Admin - Dashboard:
GET    /api/admin/dashboard         - Get dashboard statistics

Profile:
GET    /api/profile                 - Get current user profile
POST   /api/profile/change-password - Change password
POST   /api/profile/withdraw        - Withdraw funds from user balance
GET    /api/profile/userledger      - Get user's ledger transactions (with optional filters)
```

### User Ledger API Details

**GET /api/profile/userledger**

Returns the transaction history for the current authenticated user.

**Query Parameters:**

- `status` (optional): Filter by status - "Completed" | "Cancelled"
- `type` (optional): Filter by type - "CAPITAL_IN" | "EARNING" | "WITHDRAWAL"

**Response:**

```typescript
UserLedger[] = [
  {
    _id: string;
    date: string;              // ISO date string
    amount: number;
    type: "CAPITAL_IN" | "EARNING" | "WITHDRAWAL";
    status: "Completed" | "Cancelled";
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    loanId?: {                // Optional - only for EARNING transactions
      _id: string;
      loanNo: string;
      clientId: string;
      principal: number;
      interestRate: number;
      status: string;
    };
    createdAt: string;
    updatedAt: string;
    createdBy?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }
]
```

**Usage Examples:**

```typescript
// Get all transactions
GET /api/profile/userledger

// Get only completed transactions
GET /api/profile/userledger?status=Completed

// Get only withdrawals
GET /api/profile/userledger?type=WITHDRAWAL

// Get completed earnings
GET /api/profile/userledger?status=Completed&type=EARNING
```

### Request/Response Patterns

**Login Request:**

```typescript
POST /api/auth/login
Body: {
  email: string;
  password: string;
}

Response: {
  message: string;
  token: string;
  user: {
    userId: string;
    email: string;
    roleId: string;
    name?: string;
  };
  permissions: {
    [pagePath: string]: {
      Access?: boolean;
      View?: boolean;
      Add?: boolean;
      Edit?: boolean;
      Delete?: boolean;
    };
  };
}
```

**List Request (with pagination):**

```typescript
GET /api/admin/client?page=1&limit=20

Response: {
  data: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Create/Update Request:**

```typescript
POST /api/admin/client
Body: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: ClientStatus;
}

Response: {
  message: string;
  data: Client;
}
```

**Error Response:**

```typescript
{
  error: string;
  details?: any;
}
```

### Permission Checking Pattern

Before allowing actions, check permissions:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function ClientListScreen() {
  const { hasPermission } = useAuth();

  return (
    <View>
      {/* Show Add button only if user has Add permission */}
      {hasPermission('/admin/client', 'Add') && (
        <TouchableOpacity onPress={handleAddClient}>
          <Text>Add Client</Text>
        </TouchableOpacity>
      )}

      {/* Show Edit button only if user has Edit permission */}
      {hasPermission('/admin/client', 'Edit') && (
        <TouchableOpacity onPress={handleEditClient}>
          <Text>Edit</Text>
        </TouchableOpacity>
      )}

      {/* Show Delete button only if user has Delete permission */}
      {hasPermission('/admin/client', 'Delete') && (
        <TouchableOpacity onPress={handleDeleteClient}>
          <Text>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

## Data Models & TypeScript Interfaces

**Location:** Define types in relevant screen files or create `types/` directory

### Status Enums

**Location:** `constants/AppConfig.ts`

```typescript
export enum ClientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
}

export enum LoanStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DELETED = "DELETED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum LoanType {
  PERSONAL = "PERSONAL",
  BUSINESS = "BUSINESS",
  EDUCATION = "EDUCATION",
  MORTGAGE = "MORTGAGE",
}
```

### Audit Fields

All entities from backend include audit trail:

```typescript
interface AuditFields {
  createdBy: string;
  updatedBy: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletedReason?: string | null;
}
```

### Entity Interfaces

```typescript
interface Client extends AuditFields {
  clientId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: ClientStatus;
}

interface Loan extends AuditFields {
  loanId: string;
  clientId: string;
  amount: number;
  interestRate: number;
  term: number; // in months
  startDate: string;
  endDate: string;
  status: LoanStatus;
  type: LoanType;
  balance: number; // Remaining balance
  client?: Client; // Populated in some endpoints
}

interface Payment extends AuditFields {
  paymentId: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  status: PaymentStatus;
  method: string; // e.g., "CASH", "BANK_TRANSFER", "CARD"
  reference?: string;
  notes?: string;
  loan?: Loan; // Populated in some endpoints
}

interface User {
  userId: string;
  email: string;
  roleId: string;
  name?: string;
  phone?: string;
  status: string;
}

interface Role {
  roleId: string;
  name: string;
  description?: string;
}

interface Permissions {
  [pagePath: string]: {
    Access?: boolean;
    View?: boolean;
    Add?: boolean;
    Edit?: boolean;
    Delete?: boolean;
  };
}
```

### Dashboard Data

```typescript
interface DashboardStats {
  // Primary Metrics
  cashOnHand: number;
  userWithdrawableCash: number;
  totalClients: number;
  totalStaffs: number;

  // Secondary Metrics
  activeLoans: number;
  totalOutstanding: number;
  collectionsThisMonth: number;
  overdueCycles: number;

  // Analytics
  paymentCollections: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  loanDisbursements: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  recentActivities: Array<{
    _id: string;
    amount: number;
    datePaid: string;
    loanId: {
      loanNumber: string;
      clientId: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  loanStatusDistribution: Array<{
    _id: string;
    count: number;
  }>;

  // Metadata
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}
```

### App Configuration

**Location:** `constants/AppConfig.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  TIMEOUT: 30000, // 30 seconds
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth-token",
  REMEMBER_ME: "remember-me",
  BIOMETRIC_ENABLED: "biometric-enabled",
  CACHED_DASHBOARD: "dashboard-data",
  CACHED_CLIENTS: "clients-list",
  CACHED_LOANS: "loans-list",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
```

## Testing on Different Platforms

### Web Browser (Easiest for Development)

```bash
npx expo start
# Press 'w' to open in web browser
```

**Pros:** Fast refresh, easy debugging with browser DevTools
**Cons:** Some native features (biometric) don't work

### Android Emulator

**Requirements:**

- Android Studio installed
- Android emulator running

```bash
npx expo start
# Press 'a' to open in Android emulator
```

**Testing biometric:** Emulator supports fingerprint simulation

### iOS Simulator (macOS only)

**Requirements:**

- Xcode installed
- iOS simulator running

```bash
npx expo start
# Press 'i' to open in iOS simulator
```

**Testing biometric:** Simulator supports Face ID/Touch ID simulation

### Physical Device (Best for Final Testing)

**Using Expo Go App:**

1. Install Expo Go from App Store / Play Store
2. Start dev server:
   ```bash
   npx expo start
   ```
3. Scan QR code with:
   - iOS: Camera app
   - Android: Expo Go app

**Important for API calls:**

- Change `EXPO_PUBLIC_API_URL` to your computer's IP address
- Ensure device and computer are on same network

### Development Build (For Native Modules)

If using custom native modules (not just Expo modules):

```bash
# Create development build
npx expo run:android
# or
npx expo run:ios
```

This is NOT needed for LENDI as all dependencies are Expo modules.

## Debugging Tools

### React DevTools

```bash
npx expo start
# Press 'j' to open debugger
# Press 'shift+m' for more tools
```

### Console Logging

```typescript
console.log("Debug message:", data);
console.error("Error:", error);
console.warn("Warning:", warning);
```

View logs in terminal where `npx expo start` is running.

### Network Debugging

```typescript
// Log all API requests
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  console.log(`[API] ${options?.method || "GET"} ${endpoint}`);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);
    console.log(
      `[API] Response ${response.status}:`,
      await response.clone().json(),
    );
    return response.json();
  } catch (error) {
    console.error(`[API] Error:`, error);
    throw error;
  }
}
```

### Reactotron (Advanced)

For advanced debugging, install Reactotron:

```bash
npm install --save-dev reactotron-react-native
```

## File Naming Conventions

- **Screens:** `PascalCase.tsx` (e.g., `LoginScreen.tsx`, `ClientListScreen.tsx`)
  - Or simplified: `login.tsx`, `clients.tsx` (expo-router convention)
- **Components:** `PascalCase.tsx` (e.g., `LoanCard.tsx`, `PaymentForm.tsx`)
- **Contexts:** `PascalCaseContext.tsx` (e.g., `AuthContext.tsx`)
- **Utilities:** `camelCase.ts` (e.g., `apiClient.ts`, `formatCurrency.ts`)
- **Constants:** `PascalCase.ts` (e.g., `Colors.ts`, `AppConfig.ts`)
- **Hooks:** `useCamelCase.ts` (e.g., `useAuth.ts`, `usePermissions.ts`)
- **Types:** `PascalCaseTypes.ts` or `types.ts` (e.g., `ClientTypes.ts`)

## Common Imports Reference

```typescript
// Expo Router
import { Stack, Tabs, router, useLocalSearchParams } from "expo-router";

// Expo Secure Storage
import * as SecureStore from "expo-secure-store";

// Expo Biometric
import * as LocalAuthentication from "expo-local-authentication";

// Expo Status Bar
import { StatusBar } from "expo-status-bar";

// React Native Core
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// React Hooks
import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Project Imports
import { ZentyalColors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/utils/apiClient";
import {
  API_CONFIG,
  STORAGE_KEYS,
  ClientStatus,
  LoanStatus,
} from "@/constants/AppConfig";
```

## Code Patterns & Best Practices

### Component Structure

```typescript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ZentyalColors } from '@/constants/Colors';

interface Props {
  title: string;
  onPress?: () => void;
}

export default function ComponentName({ title, onPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onPress && (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Action</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: ZentyalColors.light,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ZentyalColors.dark,
  },
  button: {
    backgroundColor: ZentyalColors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
```

### Error Handling

```typescript
import { Alert } from "react-native";

async function handleAction() {
  try {
    setLoading(true);
    const result = await apiRequest("/api/admin/client");
    // Handle success
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Error", "An unexpected error occurred");
    }
  } finally {
    setLoading(false);
  }
}
```

### Loading States

```typescript
import { ActivityIndicator } from 'react-native';
import { ZentyalColors } from '@/constants/Colors';

function ScreenContent() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZentyalColors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    // Screen content
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ZentyalColors.light,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: ZentyalColors.gray,
  },
});
```

### List Rendering with FlatList

```typescript
import { FlatList, RefreshControl } from 'react-native';

function ListScreen() {
  const [data, setData] = useState<Client[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      const clients = await apiRequest<Client[]>('/api/admin/client');
      setData(clients);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.clientId}
      renderItem={({ item }) => <ClientCard client={item} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[ZentyalColors.primary]}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No clients found</Text>
        </View>
      }
    />
  );
}
```

### Form Validation

```typescript
function validateClientForm(data: Partial<Client>): string | null {
  if (!data.name?.trim()) {
    return "Name is required";
  }

  if (!data.email?.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return "Invalid email format";
  }

  if (data.phone && !/^\d{10,15}$/.test(data.phone.replace(/\D/g, ""))) {
    return "Invalid phone number";
  }

  return null; // No errors
}

function handleSubmit() {
  const error = validateClientForm(formData);
  if (error) {
    Alert.alert("Validation Error", error);
    return;
  }

  // Submit form
  submitForm(formData);
}
```

## Troubleshooting Common Issues

### Path Alias (@/) Not Resolving

**Symptoms:** `Unable to resolve '@/contexts/AuthContext'` or similar import errors

**Solution:**

1. Verify `tsconfig.json` has paths configured:

   ```json
   {
     "compilerOptions": {
       "strict": true,
       "paths": { "@/*": ["./*"] }
     }
   }
   ```

2. Clear Metro bundler cache:
   ```bash
   npx expo start --clear
   ```

### Peer Dependency Conflicts

**Symptoms:** `ERESOLVE could not resolve` errors when installing packages

**Solution:** Use `--legacy-peer-deps` flag:

```bash
npm install <package-name> --legacy-peer-deps
```

**Why:** Expo SDK 54 uses React 19.1.0, but some packages expect React 19.2.5.

### "Unable to resolve './App'" Error

**Symptoms:** Bundler can't find `./App` in `index.ts`

**Solution:** Ensure `index.ts` uses expo-router entry:

```typescript
import "expo-router/entry";
```

Do NOT import or register App.tsx. expo-router handles app initialization.

### Port Already in Use

**Symptoms:** `Port 8081 is being used by another process`

**Solutions:**

1. Accept alternate port (e.g., 8082) when prompted
2. Or kill process using port 8081:

   ```bash
   # Windows
   netstat -ano | findstr :8081
   taskkill /PID <PID> /F

   # macOS/Linux
   lsof -ti:8081 | xargs kill -9
   ```

### Token Expiration / Unauthorized Errors

**Symptoms:** API calls return 401 Unauthorized after some time

**Solution:** Implement token refresh in AuthContext:

```typescript
async function refreshAuth() {
  try {
    const response = await apiRequest("/api/auth/session");
    setUser(response.user);
    setPermissions(response.permissions);
  } catch (error) {
    // Token invalid, clear storage and redirect to login
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
    router.replace("/login");
  }
}
```

### Biometric Authentication Not Working

**Symptoms:** Biometric prompt doesn't appear or always fails

**Solutions:**

1. Check device has biometric hardware:

   ```typescript
   const hasHardware = await LocalAuthentication.hasHardwareAsync();
   ```

2. Check biometric credentials are enrolled:

   ```typescript
   const isEnrolled = await LocalAuthentication.isEnrolledAsync();
   ```

3. Test on physical device (emulators have limited biometric support)

### Network Request Failed on Physical Device

**Symptoms:** API calls work on web but fail on Android/iOS

**Solution:** Use computer's IP address instead of localhost:

```bash
# In .env file
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

**Find your IP:**

```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### TypeScript Errors After Adding New Files

**Solution:** Restart TypeScript server in VS Code:

1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

### Metro Bundler Stuck on "Building JavaScript bundle"

**Solutions:**

1. Clear cache and restart:

   ```bash
   npx expo start --clear
   ```

2. Delete `.expo` folder and restart:

   ```bash
   rm -rf .expo
   npx expo start
   ```

3. Clear npm cache:
   ```bash
   npm cache clean --force
   npx expo start --clear
   ```

## Navigation Structure with expo-router

### Root Layout

**Location:** `app/_layout.tsx`

```typescript
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { ZentyalColors } from '@/constants/Colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={ZentyalColors.primary} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: ZentyalColors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
```

### Entry Screen (Auth Check)

**Location:** `app/index.tsx`

```typescript
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ZentyalColors } from '@/constants/Colors';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={ZentyalColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ZentyalColors.light,
  },
});
```

### Tabs Layout (Role-Based Navigation)

**Location:** `app/(tabs)/_layout.tsx`

```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ZentyalColors } from '@/constants/Colors';

export default function TabsLayout() {
  const { user, hasPermission } = useAuth();

  // Client users see different tabs
  const isClient = user?.roleId === 'client';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ZentyalColors.primary,
        tabBarInactiveTintColor: ZentyalColors.gray,
        headerStyle: {
          backgroundColor: ZentyalColors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {!isClient && hasPermission('/admin/client', 'Access') && (
        <Tabs.Screen
          name="clients"
          options={{
            title: 'Clients',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
      )}

      <Tabs.Screen
        name="loans"
        options={{
          title: 'Loans',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
          ),
        }}
      />

      {!isClient && hasPermission('/admin/payment', 'Access') && (
        <Tabs.Screen
          name="payments"
          options={{
            title: 'Payments',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card" size={size} color={color} />
            ),
          }}
        />
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Recommended File Structure

**Current Structure (✅ = exists, ❌ = needs to be created):**

````
✅ app/
  ✅ _layout.tsx              # Root layout with AuthProvider
  ✅ modal.tsx                # Sample modal screen
  ✅ index.tsx                # Entry/splash screen with auth redirect
  ✅ login.tsx                # Login screen with biometric support
  ✅ (tabs)/                  # Tab navigation (protected)
    ✅ _layout.tsx            # Tabs layout with role-based rendering
    ✅ index.tsx              # Dashboard with statistics
    ✅ explore.tsx            # Legacy explore screen (hidden)
    ✅ profile.tsx            # Profile/menu screen with settings
  ❌ clients.tsx              # Client list (admin/users only) (TO CREATE)
  ❌ loans.tsx                # Loan list (TO CREATE)
  ❌ payments.tsx             # Payment list (admin/users only) (TO CREATE)
  ❌ clients/                 # Client management screens (TO CREATE)
    ❌ [id].tsx              # Client detail
    ❌ add.tsx               # Add client form
    ❌ edit/[id].tsx         # Edit client form
  ❌ loans/                   # Loan management screens (TO CREATE)
    ❌ [id].tsx              # Loan detail
    ❌ add.tsx               # Add loan form
    ❌ edit/[id].tsx         # Edit loan form
  ❌ payments/                # Payment screens (TO CREATE)
    ❌ [id].tsx              # Payment detail
    ❌ add.tsx               # Add payment form

✅ components/
  ✅ external-link.tsx        # Sample component
  ✅ haptic-tab.tsx           # Haptic feedback tab
  ✅ hello-wave.tsx           # Sample component
  ✅ parallax-scroll-view.tsx # Sample component
  ✅ themed-text.tsx          # Themed text component
  ✅ themed-view.tsx          # Themed view component
  ✅ ui/
    ✅ collapsible.tsx        # Collapsible component
    ✅ icon-symbol.tsx        # Icon symbol component

✅ constants/
  ✅ theme.ts                 # Theme colors with Zentyal colors
  ✅ AppConfig.ts             # App configuration, enums, storage keys

✅ hooks/
  ✅ use-color-scheme.ts      # Color scheme hook
  ✅ use-theme-color.ts       # Theme color hook

✅ contexts/
  ✅ AuthContext.tsx          # Authentication state management

✅ utils/
  ✅ apiClient.ts             # API request utility

✅ assets/
  ✅ images/                  # Image assets

✅ scripts/
  ✅ reset-project.js         # Reset project script

✅ app.json                   # Expo configuration
✅ package.json               # Dependencies
✅ tsconfig.json              # TypeScript configuration
✅ expo-env.d.ts              # Expo environment types
❌ .env                       # TO CREATE (environment variables)
✅ .env                       # Environment variables

## Accessibility

- Use `accessibilityLabel` for all interactive elements
- Ensure color contrast meets WCAG AA standards
- Support screen readers
- Add haptic feedback for important actions

## Testing Conventions

- Use Jest + React Native Testing Library
- Test file naming: `ComponentName.test.tsx`
- Mock API calls using MSW or jest.mock
- Test permission-based rendering

## Common Imports

```typescript
// Expo
import { Stack, Tabs, router } from "expo-router";
import * as SecureStore from "expo-secure-store";

// React Native
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";

// Project
import { ZentyalColors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/utils/apiClient";
````

## Offline Support & Caching

**Strategy:** Cache read-only data (dashboard, lists) for offline viewing

**Required Package:** `@react-native-async-storage/async-storage`

### Cache Utility Pattern

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./apiClient";

export async function fetchWithCache<T>(
  cacheKey: string,
  apiEndpoint: string,
  maxAge: number = 5 * 60 * 1000, // 5 minutes default
): Promise<T> {
  try {
    // Try to fetch fresh data
    const fresh = await apiRequest<T>(apiEndpoint);

    // Cache successful response
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: fresh,
        timestamp: Date.now(),
      }),
    );

    return fresh;
  } catch (error) {
    // If offline, try to use cached data
    const cached = await AsyncStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age < maxAge) {
        console.log(`Using cached data (${Math.round(age / 1000)}s old)`);
        return data;
      } else {
        console.warn("Cached data expired, throwing error");
      }
    }

    // No cache or expired, re-throw error
    throw error;
  }
}

// Usage
const clients = await fetchWithCache<Client[]>(
  STORAGE_KEYS.CACHED_CLIENTS,
  "/api/admin/client",
  10 * 60 * 1000, // 10 minutes
);
```

### What to Cache

✅ **DO cache:**

- Dashboard statistics (short TTL)
- Client lists (medium TTL)
- Loan lists (medium TTL)
- User profile data (long TTL)
- Dropdown options / reference data (long TTL)

❌ **DON'T cache:**

- Payment operations (always require online)
- Create/Update/Delete operations
- Real-time financial data
- Authentication tokens (use SecureStore instead)

### Cache Invalidation

```typescript
// Clear specific cache
await AsyncStorage.removeItem(STORAGE_KEYS.CACHED_CLIENTS);

// Clear all cache
await AsyncStorage.clear();

// Clear cache on logout
async function logout() {
  await apiRequest("/api/auth/logout", { method: "POST" });
  await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  await AsyncStorage.clear(); // Clear all cached data
}
```

## Best Practices

### 1. Permission Checks

Always check permissions before showing admin features:

```typescript
const { hasPermission } = useAuth();

{hasPermission('/admin/client', 'Add') && (
  <TouchableOpacity onPress={handleAdd}>
    <Text>Add Client</Text>
  </TouchableOpacity>
)}
```

### 2. TypeScript Strictness

- NO `any` types - use proper interfaces
- Enable strict mode in `tsconfig.json`
- Define all prop types with `interface`
- Use type guards for runtime checks

```typescript
// Good
interface Props {
  client: Client;
  onPress: (id: string) => void;
}

// Bad
function Component({ client, onPress }: any) {}
```

### 3. Error Handling

- Always wrap API calls in try-catch
- Show user-friendly error messages
- Log errors for debugging
- Handle network failures gracefully

```typescript
try {
  await apiRequest("/api/admin/client");
} catch (error) {
  console.error("API Error:", error);
  Alert.alert(
    "Error",
    error instanceof Error ? error.message : "Something went wrong",
  );
}
```

### 4. Loading States

- Show loading indicators for all async operations
- Disable buttons during loading
- Provide feedback for long operations

```typescript
const [loading, setLoading] = useState(false);

async function handleAction() {
  setLoading(true);
  try {
    await apiRequest('/api/admin/client');
  } finally {
    setLoading(false);
  }
}

return (
  <TouchableOpacity disabled={loading} onPress={handleAction}>
    {loading ? <ActivityIndicator /> : <Text>Submit</Text>}
  </TouchableOpacity>
);
```

### 5. Form Validation

- Validate on client-side before API calls
- Show clear error messages
- Validate as user types (real-time feedback)
- Disable submit until valid

### 6. Consistent Styling

- ALWAYS use Zentyal colors from `constants/Colors.ts`
- Use consistent spacing (8, 12, 16, 20, 24)
- Use consistent font sizes (12, 14, 16, 18, 20, 24)
- Follow Material Design / iOS Human Interface Guidelines

### 7. Optimistic Updates

Update UI immediately, rollback on error:

```typescript
async function handleDelete(clientId: string) {
  // Optimistically update UI
  setClients(clients.filter((c) => c.clientId !== clientId));

  try {
    await apiRequest(`/api/admin/client/${clientId}`, { method: "DELETE" });
  } catch (error) {
    // Rollback on error
    Alert.alert("Error", "Failed to delete client");
    await fetchClients(); // Refresh from server
  }
}
```

### 8. Soft Delete Pattern

Mark as deleted, don't remove from UI immediately:

```typescript
async function handleDelete(client: Client) {
  const updatedClient = { ...client, status: ClientStatus.DELETED };
  await apiRequest(`/api/admin/client/${client.clientId}`, {
    method: "PUT",
    body: JSON.stringify(updatedClient),
  });
}
```

### 9. Biometric Authentication

- Offer after first successful login
- Make it optional (user preference)
- Provide fallback to password
- Check hardware availability before enabling

### 10. Remember Me Feature

- Store preference in SecureStore
- Auto-refresh auth on app launch
- Clear on logout

## Security Guidelines

### 1. Secure Storage

✅ **Use SecureStore for:**

- Authentication tokens
- Biometric preferences
- User credentials (if "Remember Me")

❌ **Never use AsyncStorage for:**

- Passwords
- Authentication tokens
- Personal identification numbers

### 2. Input Validation

- Validate all user inputs
- Sanitize data before display
- Use parameterized queries on backend
- Prevent SQL injection / XSS

### 3. HTTPS in Production

```typescript
// constants/AppConfig.ts
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? "http://localhost:3000" // Development
    : "https://api.lendi.com", // Production (HTTPS)
};
```

### 4. Token Management

- Store tokens in SecureStore (encrypted)
- Send via Cookie header (not Authorization header for session cookies)
- Handle token expiration gracefully
- Clear tokens on logout

### 5. Data Sanitization

```typescript
// Sanitize user input before display
function sanitize(text: string): string {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

### 6. Certificate Pinning (Advanced)

For production apps handling sensitive financial data, implement certificate pinning to prevent man-in-the-middle attacks.

## Performance Optimization

### 1. Use React.memo for Expensive Components

```typescript
const ClientCard = React.memo(({ client }: { client: Client }) => {
  return (
    <View style={styles.card}>
      <Text>{client.name}</Text>
    </View>
  );
});
```

### 2. Implement Pagination

```typescript
const [page, setPage] = useState(1);
const [clients, setClients] = useState<Client[]>([]);
const [hasMore, setHasMore] = useState(true);

async function loadMore() {
  if (!hasMore) return;

  const response = await apiRequest<{ data: Client[]; pagination: any }>(
    `/api/admin/client?page=${page}&limit=20`
  );

  setClients([...clients, ...response.data]);
  setPage(page + 1);
  setHasMore(response.pagination.page < response.pagination.totalPages);
}

<FlatList
  data={clients}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  // ...
/>
```

### 3. Lazy Load Images

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  placeholder={require('./placeholder.png')}
  contentFit="cover"
  transition={200}
/>
```

### 4. Debounce Search Inputs

```typescript
import { useState, useEffect } from 'react';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm) {
      performSearch(debouncedTerm);
    }
  }, [debouncedTerm]);

  return (
    <TextInput
      value={searchTerm}
      onChangeText={setSearchTerm}
      placeholder="Search..."
    />
  );
}
```

### 5. Use useMemo and useCallback

```typescript
const filteredClients = useMemo(() => {
  return clients.filter((c) => c.status === ClientStatus.ACTIVE);
}, [clients]);

const handlePress = useCallback((clientId: string) => {
  router.push(`/clients/${clientId}`);
}, []);
```

### 6. Optimize FlatList

```typescript
<FlatList
  data={clients}
  keyExtractor={(item) => item.clientId}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={5}
/>
```

## Icons & Assets

### Using Expo Vector Icons

```typescript
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="home" size={24} color={ZentyalColors.primary} />
<Ionicons name="person" size={24} color={ZentyalColors.gray} />
<Ionicons name="cash" size={24} color={ZentyalColors.success} />
```

**Common icons:**

- `home` - Dashboard
- `people` - Clients
- `cash` - Loans
- `card` - Payments
- `person` - Profile
- `settings` - Settings
- `add` - Add new
- `trash` - Delete
- `pencil` - Edit
- `checkmark` - Success
- `close` - Cancel
- `arrow-back` - Back button
- `finger-print` - Biometric

### Image Optimization

- Compress images before adding to `assets/`
- Use WebP format when possible
- Use SVG for logos and icons
- Provide @2x and @3x variants for different screen densities

## Accessibility

- Add `accessibilityLabel` to all touchable elements
- Ensure color contrast meets WCAG AA standards (4.5:1 for text)
- Support screen readers
- Add haptic feedback for important actions
- Test with TalkBack (Android) and VoiceOver (iOS)

```typescript
<TouchableOpacity
  accessibilityLabel="Delete client"
  accessibilityHint="Double tap to delete this client"
  onPress={handleDelete}
>
  <Ionicons name="trash" size={24} />
</TouchableOpacity>
```

## Next Steps After Setup

1. **Test authentication flow**
   - Login with test credentials
   - Enable biometric authentication
   - Test "Remember Me" feature
   - Test logout

2. **Implement dashboard**
   - Fetch statistics from `/api/admin/dashboard`
   - Display role-appropriate content
   - Add pull-to-refresh

3. **Build CRUD screens**
   - Client management (list, add, edit, delete)
   - Loan management
   - Payment processing

4. **Add offline support**
   - Implement cache for lists
   - Handle network errors gracefully

5. **Test on physical device**
   - Update API URL to computer IP
   - Test biometric authentication
   - Test on both Android and iOS

6. **Production preparation**
   - Update API URL to production
   - Enable HTTPS
   - Test with production backend
   - Build release version

---

## Quick Reference: Implementation Checklist

### ✅ Already Completed

- [x] Project created with `npx create-expo-app@latest`
- [x] expo-router configured with file-based routing
- [x] TypeScript configured with path aliases (tsconfig.json)
- [x] Basic tab navigation (Home, Explore)
- [x] Dark/Light theme support
- [x] Standard Expo components and hooks
- [x] Entry point configured in package.json
- [x] Zentyal theme colors implemented (constants/theme.ts)
- [x] Install authentication dependencies (`expo-secure-store`, `expo-local-authentication`, `@react-native-async-storage/async-storage`)
- [x] Create .env file with API configuration
- [x] Create constants/AppConfig.ts with enums and config
- [x] Create contexts/AuthContext.tsx
- [x] Create utils/apiClient.ts
- [x] Create app/index.tsx (splash/auth check screen)
- [x] Create app/login.tsx
- [x] Update app/\_layout.tsx with AuthProvider
- [x] Update app/(tabs)/\_layout.tsx with role-based navigation
- [x] Create app/(tabs)/profile.tsx
- [x] Implement dashboard screen (app/(tabs)/index.tsx)

### ❌ To Be Implemented

- [ ] Create client management screens (app/clients/)
- [ ] Create loan management screens (app/loans/)
- [ ] Create payment management screens (app/payments/)
- [ ] Test authentication flow
- [ ] Test biometric authentication
- [ ] Test "Remember Me" feature
- [ ] Test API integration with backend
- [ ] Test on physical device
- [ ] Implement offline caching (optional)

### Quick Start Command

```bash
npx expo start --clear
```

**Port Issues:** If port 8081 is in use, Expo will prompt to use 8082. Accept it.

---

**Remember:** This version of Expo may differ from your training data. Always verify APIs and patterns against the actual packages installed in `node_modules/` before implementing.
