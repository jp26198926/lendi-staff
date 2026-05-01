/**
 * Server Settings Screen
 * Allows users to configure the server API URL
 *
 * Priority Order:
 * 1. Custom URL (configured here)
 * 2. EXPO_PUBLIC_API_URL from .env (fallback)
 */

import { API_CONFIG } from "@/constants/AppConfig";
import { ZentyalColors } from "@/constants/theme";
import { getItemAsync, setItemAsync } from "@/utils/secureStorage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
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

const STORAGE_KEY = "server-api-url";

export default function ServerSettingsScreen() {
  const [apiUrl, setApiUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedUrl();
  }, []);

  /**
   * Load previously saved API URL
   */
  async function loadSavedUrl() {
    try {
      const savedUrl = await getItemAsync(STORAGE_KEY);
      if (savedUrl) {
        setApiUrl(savedUrl);
      }
    } catch (error) {
      console.error("Failed to load saved URL:", error);
    }
  }

  /**
   * Validate and save the API URL
   */
  async function handleSave() {
    if (!apiUrl.trim()) {
      Alert.alert("Error", "Please enter a valid API URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(apiUrl);
    } catch {
      Alert.alert(
        "Error",
        "Please enter a valid URL (e.g., http://localhost:3000)",
      );
      return;
    }

    try {
      setLoading(true);
      await setItemAsync(STORAGE_KEY, apiUrl.trim());
      Alert.alert(
        "Success",
        "Server URL saved successfully. Please restart the app for changes to take effect.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save URL",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Reset to default URL
   */
  async function handleReset() {
    Alert.alert(
      "Reset to Default",
      "This will clear the custom server URL. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await setItemAsync(STORAGE_KEY, "");
              setApiUrl("");
              Alert.alert("Success", "Server URL has been reset");
            } catch {
              Alert.alert("Error", "Failed to reset URL");
            }
          },
        },
      ],
    );
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={ZentyalColors.primary}
            />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="server" size={48} color={ZentyalColors.primary} />
            <Text style={styles.title}>Server Settings</Text>
            <Text style={styles.subtitle}>
              Configure the API server URL for your LENDI application
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle"
              size={20}
              color={ZentyalColors.info}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Default URL (from .env): </Text>
                {API_CONFIG.BASE_URL}
              </Text>
              <Text style={styles.infoSubtext}>
                Custom URL will override the default
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Server API URL</Text>
            <TextInput
              style={styles.input}
              placeholder="http://localhost:3000"
              placeholderTextColor={ZentyalColors.gray}
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              keyboardType="url"
              editable={!loading}
            />

            <Text style={styles.hint}>
              Examples:{"\n"}• http://localhost:3000 (Web){"\n"}•
              http://192.168.1.100:3000 (Mobile - Local Network){"\n"}•
              https://api.yourdomain.com (Production)
            </Text>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              disabled={loading}
            >
              <Ionicons name="refresh" size={20} color={ZentyalColors.danger} />
              <Text style={styles.resetButtonText}>Reset to Default</Text>
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
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: ZentyalColors.primary,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: ZentyalColors.primary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffe0b2",
    marginBottom: 24,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: ZentyalColors.dark,
    lineHeight: 18,
  },
  infoLabel: {
    fontWeight: "600",
  },
  infoSubtext: {
    fontSize: 11,
    color: ZentyalColors.gray,
    marginTop: 4,
    fontStyle: "italic",
  },
  subtitle: {
    fontSize: 14,
    color: ZentyalColors.gray,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: ZentyalColors.dark,
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
  hint: {
    fontSize: 12,
    color: ZentyalColors.gray,
    lineHeight: 18,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: ZentyalColors.primary,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: ZentyalColors.danger,
  },
  resetButtonText: {
    color: ZentyalColors.danger,
    fontSize: 16,
    fontWeight: "600",
  },
});
