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
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
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
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          ],
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
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordModalVisible(true);
  }

  /**
   * Process change password
   */
  async function processChangePassword() {
    // Validate input
    if (!oldPassword || oldPassword.trim() === "") {
      Alert.alert("Error", "Current password is required");
      return;
    }

    if (!newPassword || newPassword.trim() === "") {
      Alert.alert("Error", "New password is required");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match");
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert(
        "Error",
        "New password must be different from current password",
      );
      return;
    }

    try {
      setLoading(true);
      setChangePasswordModalVisible(false);

      await apiRequest<{
        message: string;
      }>("/api/profile/change-password", {
        method: "POST",
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      Alert.alert(
        "Success",
        "Password changed successfully. Please login again with your new password.",
        [
          {
            text: "OK",
            onPress: async () => {
              await logout();
              router.replace("/login");
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Change Password Failed",
        error instanceof Error ? error.message : "Failed to change password",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle withdrawal
   */
  function handleWithdrawal() {
    if (!profile) return;
    setWithdrawAmount("");
    setWithdrawModalVisible(true);
  }

  /**
   * Process withdrawal
   */
  async function processWithdrawal() {
    if (!profile) return;

    // Validate input
    if (!withdrawAmount || withdrawAmount.trim() === "") {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const amount = parseFloat(withdrawAmount);

    // Check if amount is a valid number
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount greater than 0");
      return;
    }

    // Check if user has sufficient balance
    if (amount > profile.cashWithdrawable) {
      Alert.alert(
        "Insufficient Balance",
        `You only have ${formatCurrency(profile.cashWithdrawable)} available to withdraw.`,
      );
      return;
    }

    // Close modal first
    setWithdrawModalVisible(false);

    // Confirm withdrawal
    Alert.alert(
      "Confirm Withdrawal",
      `Are you sure you want to withdraw ${formatCurrency(amount)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "default",
          onPress: async () => {
            try {
              setLoading(true);

              const response = await apiRequest<{
                message: string;
                data: {
                  amount: number;
                  newCashWithdrawable: number;
                  newTotalWithdrawn: number;
                  userLedgerId: string;
                  ledgerId: string;
                };
              }>("/api/profile/withdraw", {
                method: "POST",
                body: JSON.stringify({ amount }),
              });

              // Refresh profile to get updated balances
              await fetchProfile();

              Alert.alert(
                "Success",
                `Successfully withdrew ${formatCurrency(response.data.amount)}\n\nNew balance: ${formatCurrency(response.data.newCashWithdrawable)}`,
              );
            } catch (error) {
              Alert.alert(
                "Withdrawal Failed",
                error instanceof Error
                  ? error.message
                  : "Failed to process withdrawal",
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
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
    <>
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

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.withdrawButton}
                onPress={handleWithdrawal}
                activeOpacity={0.8}
              >
                <Ionicons name="cash-outline" size={20} color="#fff" />
                <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ledgerButton}
                onPress={() => router.push("/ledger")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="list-outline"
                  size={20}
                  color={ZentyalColors.primary}
                />
                <Text style={styles.ledgerButtonText}>View Ledger</Text>
              </TouchableOpacity>
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

      {/* Withdrawal Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={withdrawModalVisible}
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Ionicons name="close" size={24} color={ZentyalColors.dark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalAvailable}>
              Available:{" "}
              {profile ? formatCurrency(profile.cashWithdrawable) : "0.00"}
            </Text>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Amount</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  style={styles.modalInput}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor={ZentyalColors.gray}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setWithdrawModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={processWithdrawal}
              >
                <Text style={styles.modalConfirmButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={changePasswordModalVisible}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => setChangePasswordModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={ZentyalColors.dark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Enter your current password and choose a new password
            </Text>

            {/* Current Password */}
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Current Password</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  style={styles.modalPasswordInput}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter current password"
                  secureTextEntry={!showOldPassword}
                  placeholderTextColor={ZentyalColors.gray}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showOldPassword ? "eye-off" : "eye"}
                    size={20}
                    color={ZentyalColors.gray}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>New Password</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  style={styles.modalPasswordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  placeholderTextColor={ZentyalColors.gray}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
                    color={ZentyalColors.gray}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>
                Must be at least 6 characters
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Confirm New Password</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  style={styles.modalPasswordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor={ZentyalColors.gray}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={ZentyalColors.gray}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setChangePasswordModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={processChangePassword}
              >
                <Text style={styles.modalConfirmButtonText}>
                  Change Password
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  withdrawButton: {
    flex: 1,
    backgroundColor: ZentyalColors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  ledgerButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: ZentyalColors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ledgerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: ZentyalColors.primary,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ZentyalColors.dark,
  },
  modalAvailable: {
    fontSize: 14,
    color: ZentyalColors.gray,
    marginBottom: 20,
  },
  modalInputContainer: {
    marginBottom: 24,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginBottom: 8,
  },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: ZentyalColors.gray + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: ZentyalColors.light,
  },
  modalInput: {
    fontSize: 18,
    fontWeight: "600",
    color: ZentyalColors.dark,
    paddingVertical: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: ZentyalColors.light,
    borderWidth: 1,
    borderColor: ZentyalColors.gray + "40",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: ZentyalColors.dark,
  },
  modalConfirmButton: {
    backgroundColor: ZentyalColors.primary,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalSubtitle: {
    fontSize: 14,
    color: ZentyalColors.gray,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalPasswordInput: {
    flex: 1,
    fontSize: 16,
    color: ZentyalColors.dark,
    paddingVertical: 14,
  },
  passwordToggle: {
    padding: 8,
  },
  passwordHint: {
    fontSize: 12,
    color: ZentyalColors.gray,
    marginTop: 6,
  },
});
