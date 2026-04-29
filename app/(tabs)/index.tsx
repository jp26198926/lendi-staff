/**
 * Dashboard Screen
 * Displays lending statistics and recent activity
 */

import { ZentyalColors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  paymentCollections: {
    _id: string;
    totalAmount: number;
    count: number;
  }[];
  loanDisbursements: {
    _id: string;
    totalAmount: number;
    count: number;
  }[];
  recentActivities: {
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
  }[];
  loanStatusDistribution: {
    _id: string;
    count: number;
  }[];

  // Metadata
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch dashboard statistics
   */
  async function fetchDashboard() {
    try {
      const response = await apiRequest<{
        success: boolean;
        data: DashboardStats;
      }>("/api/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle pull-to-refresh
   */
  async function handleRefresh() {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZentyalColors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.username}>
          {user?.name || user?.email || "User"}
        </Text>
      </View>

      {/* Stats Grid */}
      {stats && (
        <View style={styles.statsGrid}>
          <StatCard
            icon="cash"
            label="Cash on Hand"
            value={`${formatCurrency(stats.cashOnHand)}`}
            subtitle="Available"
            color={ZentyalColors.success}
          />
          <StatCard
            icon="wallet"
            label="Your Withdrawable"
            value={`${formatCurrency(stats.userWithdrawableCash)}`}
            subtitle="Personal balance"
            color={ZentyalColors.info}
          />
          <StatCard
            icon="people"
            label="Total Clients"
            value={stats.totalClients}
            subtitle="Active clients"
            color={ZentyalColors.primary}
          />
          <StatCard
            icon="person"
            label="Total Staffs"
            value={stats.totalStaffs}
            subtitle="Active users"
            color={ZentyalColors.accent}
          />
          <StatCard
            icon="document-text"
            label="Active Loans"
            value={stats.activeLoans}
            subtitle="Currently running"
            color={ZentyalColors.primary}
          />
          <StatCard
            icon="trending-up"
            label="Outstanding"
            value={`${formatCurrency(stats.totalOutstanding)}`}
            subtitle="Total balance"
            color={ZentyalColors.warning}
          />
          <StatCard
            icon="calendar"
            label="This Month"
            value={`${formatCurrency(stats.collectionsThisMonth)}`}
            subtitle="Collections"
            color={ZentyalColors.success}
          />
          <StatCard
            icon="alert-circle"
            label="Overdue"
            value={stats.overdueCycles}
            subtitle="Past due date"
            color={ZentyalColors.danger}
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton icon="person-add" label="New Client" />
          <ActionButton icon="add-circle" label="New Loan" />
          <ActionButton icon="card" label="Record Payment" />
          <ActionButton icon="document-text" label="Reports" />
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  fullWidth?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
  fullWidth,
}: StatCardProps) {
  return (
    <View style={[styles.statCard, fullWidth && styles.statCardFull]}>
      <View
        style={[styles.statIconContainer, { backgroundColor: color + "20" }]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

/**
 * Action Button Component
 */
interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
  return (
    <View style={styles.actionButton}>
      <View style={styles.actionIconContainer}>
        <Ionicons name={icon} size={28} color={ZentyalColors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
  );
}

/**
 * Format currency with commas
 */
function formatCurrency(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZentyalColors.light,
  },
  contentContainer: {
    padding: 20,
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: ZentyalColors.gray,
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardFull: {
    width: "100%",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statContent: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: ZentyalColors.gray,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: ZentyalColors.dark,
  },
  statSubtitle: {
    fontSize: 11,
    color: ZentyalColors.gray,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ZentyalColors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: ZentyalColors.dark,
    textAlign: "center",
  },
});
