/**
 * Profile/Menu Screen
 * Displays user information and app settings
 */

import { ZentyalColors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Full user profile interface (from backend)
interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleId: {
    _id: string;
    role: string;
  };
  rate: number;
  cashWithdrawable: number;
  capitalContribution: number;
  profitEarned: number;
  totalWithdrawn: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfileScreen() {
  const { user, logout, biometricEnabled, enableBiometric, disableBiometric } =
    useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  /**
   * Fetch full profile data from backend
   */
  async function fetchProfile() {
    try {
      const response = await apiRequest<{
        message: string;
        data: UserProfile;
      }>("/api/profile");
      setProfile(response.data);
    } catch (error) {
      // If session expired (401), redirect to login
      if (error instanceof Error && error.message.includes("Session expired")) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Failed to load profile",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle pull-to-refresh
   */
  async function handleRefresh() {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }

  // Check if user is authenticated, redirect to login if not
  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, redirecting to login");
      router.replace("/login");
      return;
    }
    fetchProfile();
  }, [user]);

  /**
   * Format currency (Philippine Peso)
   */
  function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Handle logout
   */
  async function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (error: unknown) {
            Alert.alert(
              "Error",
              error instanceof Error ? error.message : "Failed to logout",
            );
          }
        },
      },
    ]);
  }

  /**
   * Toggle biometric authentication
   */
  async function handleBiometricToggle(value: boolean) {
    setBiometricLoading(true);
    try {
      if (value) {
        await enableBiometric();
        Alert.alert("Success", "Biometric authentication enabled");
      } else {
        await disableBiometric();
        Alert.alert("Success", "Biometric authentication disabled");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to toggle biometric authentication",
      );
    } finally {
      setBiometricLoading(false);
    }
  }

  /**
   * Handle change password
   */
  function handleChangePassword() {
    Alert.alert("Change Password", "This feature will be implemented soon");
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZentyalColors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[ZentyalColors.primary]}
          tintColor={ZentyalColors.primary}
        />
      }
    >
      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {profile?.firstName?.[0]?.toUpperCase() || "U"}
            {profile?.lastName?.[0]?.toUpperCase() || ""}
          </Text>
        </View>
        <Text style={styles.userName}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={styles.userEmail}>{profile?.email}</Text>
        <Text style={styles.userPhone}>{profile?.phone}</Text>
        <View style={styles.roleChip}>
          <Text style={styles.roleText}>
            {typeof profile?.roleId === "object"
              ? profile?.roleId.role
              : "User"}
          </Text>
        </View>
      </View>

      {/* Financial Overview */}
      {profile && (
        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.financialGrid}>
            <FinancialCard
              icon="wallet"
              label="Withdrawable Cash"
              value={formatCurrency(profile.cashWithdrawable)}
              color={ZentyalColors.success}
            />
            <FinancialCard
              icon="cash"
              label="Capital Contribution"
              value={formatCurrency(profile.capitalContribution)}
              color={ZentyalColors.primary}
            />
            <FinancialCard
              icon="trending-up"
              label="Profit Earned"
              value={formatCurrency(profile.profitEarned)}
              color={ZentyalColors.accent}
            />
            <FinancialCard
              icon="arrow-down"
              label="Total Withdrawn"
              value={formatCurrency(profile.totalWithdrawn)}
              color={ZentyalColors.info}
            />
            <FinancialCard
              icon="stats-chart"
              label="Rate"
              value={`${profile.rate}%`}
              color={ZentyalColors.warning}
              fullWidth
            />
          </View>
        </View>
      )}

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <MenuItem
          icon="finger-print"
          label="Biometric Authentication"
          rightComponent={
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={biometricLoading}
              trackColor={{ false: "#ccc", true: ZentyalColors.primary }}
              thumbColor="#fff"
            />
          }
        />

        <MenuItem
          icon="key"
          label="Change Password"
          onPress={handleChangePassword}
          showChevron
        />
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <MenuItem
          icon="notifications"
          label="Notifications"
          onPress={() => Alert.alert("Notifications", "Feature coming soon")}
          showChevron
        />

        <MenuItem
          icon="moon"
          label="Dark Mode"
          rightComponent={
            <Switch
              value={false}
              onValueChange={() =>
                Alert.alert("Dark Mode", "Feature coming soon")
              }
              trackColor={{ false: "#ccc", true: ZentyalColors.primary }}
              thumbColor="#fff"
            />
          }
        />

        <MenuItem
          icon="language"
          label="Language"
          onPress={() => Alert.alert("Language", "Feature coming soon")}
          showChevron
        />
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <MenuItem
          icon="information-circle"
          label="About LENDI"
          onPress={() =>
            Alert.alert("LENDI", "Lending Management System v1.0.0")
          }
          showChevron
        />

        <MenuItem
          icon="document-text"
          label="Terms & Conditions"
          onPress={() => Alert.alert("Terms", "Feature coming soon")}
          showChevron
        />

        <MenuItem
          icon="shield-checkmark"
          label="Privacy Policy"
          onPress={() => Alert.alert("Privacy", "Feature coming soon")}
          showChevron
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

/**
 * Menu Item Component
 */
interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
}

function MenuItem({
  icon,
  label,
  onPress,
  showChevron,
  rightComponent,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={22} color={ZentyalColors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {rightComponent}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={ZentyalColors.gray}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Financial Card Component
 */
interface FinancialCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  fullWidth?: boolean;
}

function FinancialCard({
  icon,
  label,
  value,
  color,
  fullWidth,
}: FinancialCardProps) {
  return (
    <View style={[styles.financialCard, fullWidth && styles.financialCardFull]}>
      <View
        style={[
          styles.financialIconContainer,
          { backgroundColor: color + "20" },
        ]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.financialContent}>
        <Text style={styles.financialLabel}>{label}</Text>
        <Text style={styles.financialValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZentyalColors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ZentyalColors.light,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: ZentyalColors.gray,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: ZentyalColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: ZentyalColors.gray,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: ZentyalColors.gray,
    marginBottom: 12,
  },
  roleChip: {
    backgroundColor: ZentyalColors.primary + "20",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: ZentyalColors.primary,
    textTransform: "uppercase",
  },
  financialSection: {
    marginBottom: 24,
  },
  financialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  financialCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  financialCardFull: {
    width: "100%",
  },
  financialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  financialContent: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 12,
    color: ZentyalColors.gray,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: ZentyalColors.dark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ZentyalColors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    color: ZentyalColors.dark,
    fontWeight: "500",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutButton: {
    backgroundColor: ZentyalColors.danger,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  versionText: {
    fontSize: 12,
    color: ZentyalColors.gray,
    textAlign: "center",
    marginTop: 24,
  },
});
