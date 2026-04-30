/**
 * User Ledger Screen
 * Displays the user's financial transaction history
 */

import { ZentyalColors } from "@/constants/theme";
import { apiRequest } from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// UserLedger type enum (from backend)
enum UserLedgerType {
  CAPITAL_IN = "CAPITAL_IN",
  EARNING = "EARNING",
  WITHDRAWAL = "WITHDRAWAL",
}

// UserLedger status enum
enum UserLedgerStatus {
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

// UserLedger interface (from backend)
interface UserLedger {
  _id: string;
  date: string;
  amount: number;
  type: UserLedgerType;
  status: UserLedgerStatus;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  loanId?: {
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

export default function LedgerScreen() {
  const [ledgers, setLedgers] = useState<UserLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filter, setFilter] = useState<{
    status?: string;
    type?: string;
  }>({});

  /**
   * Fetch user ledger records
   */
  const fetchLedgers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.type) params.append("type", filter.type);

      const queryString = params.toString();
      const endpoint = `/api/profile/userledger${queryString ? `?${queryString}` : ""}`;

      const response = await apiRequest<UserLedger[]>(endpoint);
      setLedgers(response);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load ledger history",
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  /**
   * Handle pull-to-refresh
   */
  async function handleRefresh() {
    setRefreshing(true);
    await fetchLedgers();
    setRefreshing(false);
  }

  useEffect(() => {
    fetchLedgers();
  }, [fetchLedgers]);

  /**
   * Format currency for display
   */
  function formatCurrency(value: number): string {
    return value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Format date for display
   */
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Get type color
   */
  function getTypeColor(type: UserLedgerType): string {
    switch (type) {
      case UserLedgerType.CAPITAL_IN:
        return ZentyalColors.primary;
      case UserLedgerType.EARNING:
        return ZentyalColors.success;
      case UserLedgerType.WITHDRAWAL:
        return ZentyalColors.info;
      default:
        return ZentyalColors.gray;
    }
  }

  /**
   * Get type icon
   */
  function getTypeIcon(type: UserLedgerType): keyof typeof Ionicons.glyphMap {
    switch (type) {
      case UserLedgerType.CAPITAL_IN:
        return "add-circle";
      case UserLedgerType.EARNING:
        return "trending-up";
      case UserLedgerType.WITHDRAWAL:
        return "arrow-down-circle";
      default:
        return "swap-horizontal";
    }
  }

  /**
   * Get type label
   */
  function getTypeLabel(type: UserLedgerType): string {
    switch (type) {
      case UserLedgerType.CAPITAL_IN:
        return "Capital In";
      case UserLedgerType.EARNING:
        return "Earning";
      case UserLedgerType.WITHDRAWAL:
        return "Withdrawal";
      default:
        return type;
    }
  }

  /**
   * Calculate totals by type
   */
  function calculateTotals() {
    const totals = {
      capitalIn: 0,
      earning: 0,
      withdrawal: 0,
    };

    ledgers.forEach((ledger) => {
      if (ledger.status === UserLedgerStatus.COMPLETED) {
        switch (ledger.type) {
          case UserLedgerType.CAPITAL_IN:
            totals.capitalIn += ledger.amount;
            break;
          case UserLedgerType.EARNING:
            totals.earning += ledger.amount;
            break;
          case UserLedgerType.WITHDRAWAL:
            totals.withdrawal += ledger.amount;
            break;
        }
      }
    });

    return totals;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZentyalColors.primary} />
        <Text style={styles.loadingText}>Loading ledger...</Text>
      </View>
    );
  }

  const totals = calculateTotals();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={ZentyalColors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ledger History</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
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
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons
              name="add-circle"
              size={24}
              color={ZentyalColors.primary}
            />
            <Text style={styles.summaryLabel}>Capital In</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totals.capitalIn)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons
              name="trending-up"
              size={24}
              color={ZentyalColors.success}
            />
            <Text style={styles.summaryLabel}>Earnings</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totals.earning)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons
              name="arrow-down-circle"
              size={24}
              color={ZentyalColors.info}
            />
            <Text style={styles.summaryLabel}>Withdrawals</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totals.withdrawal)}
            </Text>
          </View>
        </View>

        {/* Ledger List */}
        <View style={styles.ledgerSection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>

          {ledgers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color={ZentyalColors.gray}
              />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your transaction history will appear here
              </Text>
            </View>
          ) : (
            ledgers.map((ledger) => (
              <View key={ledger._id} style={styles.ledgerItem}>
                <View style={styles.ledgerItemLeft}>
                  <View
                    style={[
                      styles.ledgerIconContainer,
                      { backgroundColor: getTypeColor(ledger.type) + "15" },
                    ]}
                  >
                    <Ionicons
                      name={getTypeIcon(ledger.type)}
                      size={24}
                      color={getTypeColor(ledger.type)}
                    />
                  </View>
                  <View style={styles.ledgerItemDetails}>
                    <Text style={styles.ledgerItemType}>
                      {getTypeLabel(ledger.type)}
                    </Text>
                    <Text style={styles.ledgerItemDate}>
                      {formatDate(ledger.date)}
                    </Text>
                    {ledger.loanId && (
                      <Text style={styles.ledgerItemLoan}>
                        Loan: {ledger.loanId.loanNo}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.ledgerItemRight}>
                  <Text
                    style={[
                      styles.ledgerItemAmount,
                      {
                        color:
                          ledger.type === UserLedgerType.WITHDRAWAL
                            ? ZentyalColors.danger
                            : ZentyalColors.success,
                      },
                    ]}
                  >
                    {ledger.type === UserLedgerType.WITHDRAWAL ? "-" : "+"}
                    {formatCurrency(ledger.amount)}
                  </Text>
                  <Text
                    style={[
                      styles.ledgerItemStatus,
                      {
                        color:
                          ledger.status === UserLedgerStatus.COMPLETED
                            ? ZentyalColors.success
                            : ZentyalColors.gray,
                      },
                    ]}
                  >
                    {ledger.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.gray + "20",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ZentyalColors.dark,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: ZentyalColors.gray,
    marginTop: 8,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginTop: 4,
  },
  ledgerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: ZentyalColors.gray,
    marginTop: 8,
  },
  ledgerItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ledgerItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ledgerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ledgerItemDetails: {
    flex: 1,
  },
  ledgerItemType: {
    fontSize: 16,
    fontWeight: "600",
    color: ZentyalColors.dark,
  },
  ledgerItemDate: {
    fontSize: 13,
    color: ZentyalColors.gray,
    marginTop: 2,
  },
  ledgerItemLoan: {
    fontSize: 12,
    color: ZentyalColors.primary,
    marginTop: 2,
  },
  ledgerItemRight: {
    alignItems: "flex-end",
  },
  ledgerItemAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ledgerItemStatus: {
    fontSize: 12,
    marginTop: 4,
  },
});
