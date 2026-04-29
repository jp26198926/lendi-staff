/**
 * All Money Transactions Screen
 * Displays all ledger entries from the system
 * Admin only
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
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Ledger entry interface
interface LedgerEntry {
  _id: string;
  date: string;
  amount: number;
  type: "Capital In" | "Loan Release" | "Repayment" | "Expense" | "Withdrawal";
  direction: "In" | "Out";
  status: "Completed" | "Cancelled";
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  loanId?: {
    _id: string;
    loanNo: string;
    clientId: {
      _id: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      email: string;
    };
    principal: number;
    interestRate: number;
    terms: number;
    status: string;
  };
  cycleId?: {
    _id: string;
    cycleCount: number;
    totalDue: number;
    balance: number;
    dateDue: string;
    status: string;
  };
  paymentId?: {
    _id: string;
    paymentNo: string;
    amount: number;
    datePaid: string;
    status: string;
  };
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch ledgers from backend
   */
  async function fetchLedgers() {
    try {
      const response = await apiRequest<LedgerEntry[]>("/api/admin/ledger");
      setLedgers(response);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load transactions",
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
    await fetchLedgers();
    setRefreshing(false);
  }

  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchLedgers();
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
   * Format date
   */
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  /**
   * Get type color
   */
  function getTypeColor(type: string): string {
    switch (type) {
      case "Capital In":
        return ZentyalColors.primary;
      case "Loan Release":
        return ZentyalColors.warning;
      case "Repayment":
        return ZentyalColors.success;
      case "Expense":
        return ZentyalColors.danger;
      case "Withdrawal":
        return ZentyalColors.info;
      default:
        return ZentyalColors.gray;
    }
  }

  /**
   * Get type icon
   */
  function getTypeIcon(type: string): keyof typeof Ionicons.glyphMap {
    switch (type) {
      case "Capital In":
        return "add-circle";
      case "Loan Release":
        return "send";
      case "Repayment":
        return "checkmark-circle";
      case "Expense":
        return "card";
      case "Withdrawal":
        return "arrow-down-circle";
      default:
        return "cash";
    }
  }

  /**
   * Calculate total In and Out
   */
  function calculateTotals() {
    const completedLedgers = ledgers.filter((l) => l.status === "Completed");
    const totalIn = completedLedgers
      .filter((l) => l.direction === "In")
      .reduce((sum, l) => sum + l.amount, 0);
    const totalOut = completedLedgers
      .filter((l) => l.direction === "Out")
      .reduce((sum, l) => sum + l.amount, 0);
    return { totalIn, totalOut, netCash: totalIn - totalOut };
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZentyalColors.primary} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  const totals = calculateTotals();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={ZentyalColors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Money Transactions</Text>
        <View style={styles.headerSpacer} />
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
            <Text style={styles.summaryLabel}>Total In</Text>
            <Text
              style={[styles.summaryValue, { color: ZentyalColors.success }]}
            >
              +{formatCurrency(totals.totalIn)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Out</Text>
            <Text
              style={[styles.summaryValue, { color: ZentyalColors.danger }]}
            >
              -{formatCurrency(totals.totalOut)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardFull]}>
            <Text style={styles.summaryLabel}>Net Cash Flow</Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    totals.netCash >= 0
                      ? ZentyalColors.success
                      : ZentyalColors.danger,
                },
              ]}
            >
              {totals.netCash >= 0 ? "+" : ""}
              {formatCurrency(totals.netCash)}
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Transactions ({ledgers.length})
          </Text>

          {ledgers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="receipt-outline"
                size={64}
                color={ZentyalColors.gray}
              />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          ) : (
            ledgers.map((ledger) => (
              <View key={ledger._id} style={styles.transactionCard}>
                {/* Header Row */}
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionHeaderLeft}>
                    <View
                      style={[
                        styles.typeIcon,
                        { backgroundColor: getTypeColor(ledger.type) + "20" },
                      ]}
                    >
                      <Ionicons
                        name={getTypeIcon(ledger.type)}
                        size={20}
                        color={getTypeColor(ledger.type)}
                      />
                    </View>
                    <View style={styles.transactionHeaderInfo}>
                      <Text style={styles.transactionType}>{ledger.type}</Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(ledger.date)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionHeaderRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            ledger.direction === "In"
                              ? ZentyalColors.success
                              : ZentyalColors.danger,
                        },
                      ]}
                    >
                      {ledger.direction === "In" ? "+" : "-"}
                      {formatCurrency(ledger.amount)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            ledger.status === "Completed"
                              ? ZentyalColors.success + "20"
                              : ZentyalColors.gray + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              ledger.status === "Completed"
                                ? ZentyalColors.success
                                : ZentyalColors.gray,
                          },
                        ]}
                      >
                        {ledger.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Details */}
                {ledger.userId && (
                  <View style={styles.transactionDetail}>
                    <Ionicons
                      name="person-outline"
                      size={14}
                      color={ZentyalColors.gray}
                    />
                    <Text style={styles.transactionDetailText}>
                      {ledger.userId.firstName} {ledger.userId.lastName}
                    </Text>
                  </View>
                )}

                {ledger.loanId && (
                  <View style={styles.transactionDetail}>
                    <Ionicons
                      name="document-text-outline"
                      size={14}
                      color={ZentyalColors.gray}
                    />
                    <Text style={styles.transactionDetailText}>
                      Loan #{ledger.loanId.loanNo} -{" "}
                      {ledger.loanId.clientId.firstName}{" "}
                      {ledger.loanId.clientId.lastName}
                    </Text>
                  </View>
                )}

                {ledger.description && (
                  <View style={styles.transactionDetail}>
                    <Ionicons
                      name="information-circle-outline"
                      size={14}
                      color={ZentyalColors.gray}
                    />
                    <Text style={styles.transactionDetailText}>
                      {ledger.description}
                    </Text>
                  </View>
                )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.gray + "20",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ZentyalColors.light,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: ZentyalColors.dark,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCardFull: {
    width: "100%",
  },
  summaryLabel: {
    fontSize: 12,
    color: ZentyalColors.gray,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: ZentyalColors.gray,
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  transactionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionHeaderInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: ZentyalColors.gray,
  },
  transactionHeaderRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  transactionDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  transactionDetailText: {
    fontSize: 13,
    color: ZentyalColors.gray,
    flex: 1,
  },
});
