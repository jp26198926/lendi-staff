/**
 * Login Screen
 * Allows users to authenticate with email/password and biometric
 */

import LendiLogo from "@/components/LendiLogo";
import { ZentyalColors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const { login, authenticateWithBiometric, biometricEnabled } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Handle email/password login
   */
  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await login(email, password, rememberMe);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Invalid credentials",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle biometric authentication
   */
  async function handleBiometricLogin() {
    try {
      setLoading(true);
      const success = await authenticateWithBiometric();
      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Authentication Failed", "Please try again");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Biometric authentication failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <LendiLogo size={120} />
          <Text style={styles.title}>LENDI</Text>
          <Text style={styles.subtitle}>Liklik Loan Tasol</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={ZentyalColors.gray}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={ZentyalColors.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={ZentyalColors.gray}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={loading}
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={24}
                color={ZentyalColors.primary}
              />
              <Text style={styles.checkboxLabel}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
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
                <Ionicons
                  name="finger-print"
                  size={32}
                  color={ZentyalColors.primary}
                />
                <Text style={styles.biometricText}>Use Biometric</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.serverSettingsButton}
              onPress={() => router.push("/server-settings")}
              disabled={loading}
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={ZentyalColors.gray}
              />
              <Text style={styles.serverSettingsText}>Server Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZentyalColors.light,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: ZentyalColors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: ZentyalColors.gray,
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordToggle: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: ZentyalColors.dark,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  biometricButton: {
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  biometricText: {
    fontSize: 16,
    color: ZentyalColors.primary,
  },
  serverSettingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  serverSettingsText: {
    fontSize: 14,
    color: ZentyalColors.gray,
  },
});
