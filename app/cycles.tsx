/**
 * Cycles Management Screen
 * View and manage all payment cycles across all loans
 */

import { ZentyalColors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * Interfaces
 */
interface Payment {
  _id: string;
  paymentNo: string;
  amount: number;
  datePaid: string;
  remarks?: string;
  status: string;
  createdAt: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface Cycle {
  _id: string;
  loanId: {
    _id: string;
    loanNo: string;
    clientId: {
      _id: string;
      firstName: string;
      middleName?: string;
      lastName: string;
    };
    principal: number;
    interestRate: number;
    terms: string;
    status: string;
  };
  cycleCount: number;
  principal: number;
  interestRate: number;
  interestAmount: number;
  totalDue: number;
  totalPaid: number;
  balance: number;
  profitExpected: number;
  profitEarned: number;
  profitRemaining: number;
  dateDue: string;
  status: "Active" | "Completed" | "Expired" | "Cancelled";
  autoCreated?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Loan {
  _id: string;
  loanNo: string;
  clientId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  principal: number;
  interestRate: number;
  terms: "Weekly" | "Fortnightly" | "Monthly";
  status: string;
}

export default function CyclesScreen() {
  const { user, hasPermission } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [filteredCycles, setFilteredCycles] = useState<Cycle[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingCycle, setDeletingCycle] = useState<Cycle | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [paymentsModalVisible, setPaymentsModalVisible] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);

  // Add form state
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [dateDue, setDateDue] = useState<Date>(new Date());
  const [showLoanDropdown, setShowLoanDropdown] = useState(false);
  const [showAddDatePicker, setShowAddDatePicker] = useState(false);

  // Edit form state
  const [editDateDue, setEditDateDue] = useState<Date>(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  const PAGE_PATH = "/admin/cycle";

  /**
   * Check permissions and load data
   */
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!hasPermission(PAGE_PATH, "Access")) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to access this page",
        [{ text: "OK", onPress: () => router.back() }],
      );
      return;
    }
    fetchData();
  }, [user]);

  /**
   * Apply filters whenever cycles, statusFilter, or searchQuery changes
   */
  useEffect(() => {
    applyFilters();
  }, [cycles, statusFilter, searchQuery]);

  /**
   * Fetch all data
   */
  async function fetchData() {
    try {
      await Promise.all([fetchCycles(), fetchLoans()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetch all cycles
   */
  async function fetchCycles() {
    try {
      const response = await apiRequest<Cycle[]>("/api/admin/cycle");
      setCycles(response || []);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load cycles",
      );
      setCycles([]);
    }
  }

  /**
   * Fetch loans for reference
   */
  async function fetchLoans() {
    try {
      const response = await apiRequest<Loan[]>("/api/admin/loan");
      setLoans(response || []);
    } catch (error) {
      console.error("Error fetching loans:", error);
      setLoans([]);
    }
  }

  /**
   * Handle pull-to-refresh
   */
  async function handleRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  /**
   * Apply filters to cycles list
   */
  function applyFilters() {
    let filtered = [...cycles];

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((cycle) => cycle.status === statusFilter);
    }

    // Search filter (by loan number or client name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((cycle) => {
        const loanNo = cycle.loanId.loanNo.toLowerCase();
        const clientName = getClientFullName(
          cycle.loanId.clientId,
        ).toLowerCase();
        return loanNo.includes(query) || clientName.includes(query);
      });
    }

    setFilteredCycles(filtered);
  }

  /**
   * Get client full name
   */
  function getClientFullName(client: {
    firstName: string;
    middleName?: string;
    lastName: string;
  }): string {
    const middle = client.middleName ? ` ${client.middleName} ` : " ";
    return `${client.firstName}${middle}${client.lastName}`;
  }

  /**
   * Format currency
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
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Get status color
   */
  function getStatusColor(status: string): string {
    switch (status) {
      case "Active":
        return ZentyalColors.success;
      case "Completed":
        return ZentyalColors.info;
      case "Expired":
        return ZentyalColors.danger;
      case "Cancelled":
        return ZentyalColors.gray;
      default:
        return ZentyalColors.dark;
    }
  }

  /**
   * Check if cycle is overdue
   */
  function isOverdue(cycle: Cycle): boolean {
    if (cycle.status !== "Active") return false;
    const dueDate = new Date(cycle.dateDue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  /**
   * Open edit cycle modal
   */
  function handleEditCycle(cycle: Cycle) {
    if (!hasPermission(PAGE_PATH, "Edit")) {
      Alert.alert("Access Denied", "You don't have permission to edit cycles");
      return;
    }

    setEditingCycle(cycle);
    setEditDateDue(new Date(cycle.dateDue));
    setEditModalVisible(true);
  }

  /**
   * Handle update cycle
   */
  async function handleUpdateCycle() {
    if (!editingCycle) return;

    if (!editDateDue) {
      Alert.alert("Validation Error", "Please select a due date");
      return;
    }

    try {
      await apiRequest(`/api/admin/cycle/${editingCycle._id}`, {
        method: "PUT",
        body: JSON.stringify({
          dateDue: editDateDue.toISOString().split("T")[0],
        }),
      });

      Alert.alert("Success", "Cycle due date updated successfully");
      setEditModalVisible(false);
      setEditingCycle(null);
      await fetchCycles();
    } catch (error) {
      console.error("Error updating cycle:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to update cycle. Please try again.",
      );
    }
  }

  /**
   * Open add cycle modal
   */
  function handleAdd() {
    if (!hasPermission(PAGE_PATH, "Add")) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to create cycles",
      );
      return;
    }

    // Check if there are active loans without active cycles
    const activeLoans = loans.filter((loan) => loan.status === "Active");
    if (activeLoans.length === 0) {
      Alert.alert(
        "No Active Loans",
        "There are no active loans. Please create a loan first.",
      );
      return;
    }

    setSelectedLoanId("");
    setPrincipal("");
    setInterestRate("");
    setDateDue(new Date());
    setShowLoanDropdown(false);
    setAddModalVisible(true);
  }

  /**
   * Handle create cycle
   */
  async function handleCreateCycle() {
    // Validate required fields
    if (!selectedLoanId || !principal || !interestRate) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    const principalNum = parseFloat(principal);
    const interestRateNum = parseFloat(interestRate);

    if (isNaN(principalNum) || principalNum <= 0) {
      Alert.alert("Validation Error", "Principal must be a positive number");
      return;
    }

    if (isNaN(interestRateNum) || interestRateNum < 0) {
      Alert.alert(
        "Validation Error",
        "Interest rate must be a non-negative number",
      );
      return;
    }

    // Check if loan already has active cycle
    const hasActiveCycle = cycles.some(
      (cycle) =>
        cycle.loanId._id === selectedLoanId && cycle.status === "Active",
    );

    if (hasActiveCycle) {
      Alert.alert(
        "Active Cycle Exists",
        "This loan already has an active cycle. Please complete or cancel it first.",
      );
      return;
    }

    try {
      setLoading(true);

      // Calculate derived fields
      const interestAmount = (principalNum * interestRateNum) / 100;
      const totalDue = principalNum + interestAmount;

      // Get next cycle count for this loan
      const loanCycles = cycles.filter((c) => c.loanId._id === selectedLoanId);
      const nextCycleCount =
        loanCycles.length > 0
          ? Math.max(...loanCycles.map((c) => c.cycleCount)) + 1
          : 1;

      const cycleData = {
        loanId: selectedLoanId,
        cycleCount: nextCycleCount,
        principal: principalNum,
        interestRate: interestRateNum,
        interestAmount,
        totalDue,
        dateDue: dateDue.toISOString().split("T")[0],
        status: "Active",
      };

      await apiRequest("/api/admin/cycle", {
        method: "POST",
        body: JSON.stringify(cycleData),
      });

      Alert.alert("Success", "Cycle created successfully");
      setAddModalVisible(false);
      await fetchCycles();
    } catch (error) {
      console.error("Error creating cycle:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create cycle. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle delete cycle
   */
  function handleDelete(cycle: Cycle) {
    if (!hasPermission(PAGE_PATH, "Delete")) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to delete cycles",
      );
      return;
    }

    if (cycle.status === "Completed") {
      Alert.alert(
        "Cannot Delete",
        "Completed cycles cannot be deleted. They are part of the financial records.",
      );
      return;
    }

    if (cycle.status === "Cancelled") {
      Alert.alert("Already Cancelled", "This cycle is already cancelled");
      return;
    }

    setDeletingCycle(cycle);
    setDeleteReason("");
    setDeleteModalVisible(true);
  }

  /**
   * Fetch payments for a specific cycle
   */
  async function fetchPaymentsForCycle(cycleId: string) {
    try {
      setLoadingPayments(true);
      const response = await apiRequest<Payment[]>(
        `/api/admin/payment?cycleId=${cycleId}`,
      );
      setPayments(response || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load payments",
      );
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  }

  /**
   * Open payments modal (history + record)
   */
  function handleOpenPayments(cycle: Cycle) {
    setSelectedCycle(cycle);
    setPaymentAmount("");
    setPaymentDate(new Date());
    setPaymentRemarks("");
    setPaymentsModalVisible(true);
    fetchPaymentsForCycle(cycle._id);
  }

  /**
   * Handle submit payment
   */
  async function handleSubmitPayment() {
    if (!selectedCycle) return;

    if (!hasPermission(PAGE_PATH, "Edit")) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to record payments",
      );
      return;
    }

    if (selectedCycle.status !== "Active") {
      Alert.alert(
        "Cannot Record Payment",
        "Payments can only be recorded for active cycles",
      );
      return;
    }

    if (!paymentAmount) {
      Alert.alert("Validation Error", "Please enter payment amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Validation Error", "Amount must be greater than 0");
      return;
    }

    if (amount > selectedCycle.balance) {
      Alert.alert(
        "Warning",
        `Payment amount (${formatCurrency(amount)}) exceeds remaining balance (${formatCurrency(selectedCycle.balance)}). Continue anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: () => processPayment(amount) },
        ],
      );
    } else {
      await processPayment(amount);
    }
  }

  /**
   * Process payment submission
   */
  async function processPayment(amount: number) {
    if (!selectedCycle) return;

    try {
      setLoading(true);

      const paymentData = {
        loanId: selectedCycle.loanId._id,
        cycleId: selectedCycle._id,
        amount,
        datePaid: paymentDate.toISOString().split("T")[0],
        remarks: paymentRemarks.trim() || undefined,
        status: "Completed",
      };

      await apiRequest("/api/admin/payment", {
        method: "POST",
        body: JSON.stringify(paymentData),
      });

      Alert.alert("Success", "Payment recorded successfully");

      // Clear form and refresh data
      setPaymentAmount("");
      setPaymentRemarks("");
      setPaymentDate(new Date());
      await fetchCycles();
      await fetchPaymentsForCycle(selectedCycle._id);
    } catch (error) {
      console.error("Error recording payment:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to record payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Process delete cycle
   */
  async function processDelete() {
    if (!deletingCycle) return;

    if (!deleteReason.trim()) {
      Alert.alert("Error", "Cancellation reason is required");
      return;
    }

    try {
      setLoading(true);
      setDeleteModalVisible(false);

      await apiRequest(`/api/admin/cycle/${deletingCycle._id}`, {
        method: "DELETE",
        body: JSON.stringify({ reason: deleteReason }),
      });

      Alert.alert("Success", "Cycle cancelled successfully");
      setDeletingCycle(null);
      setDeleteReason("");
      await fetchCycles();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to cancel cycle",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Render cycle card
   */
  function renderCycleCard({ item }: { item: Cycle }) {
    const overdue = isOverdue(item);
    const clientName = getClientFullName(item.loanId.clientId);

    return (
      <View style={styles.cycleCard}>
        {/* Header */}
        <View style={styles.cycleHeader}>
          <View style={styles.cycleHeaderLeft}>
            <Text style={styles.cycleLoanNo}>{item.loanId.loanNo}</Text>
            <Text style={styles.cycleClientName}>{clientName}</Text>
          </View>
          <View style={styles.cycleHeaderRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
            </View>
            {overdue && (
              <View style={styles.overdueBadge}>
                <Ionicons name="alert-circle" size={16} color="#fff" />
                <Text style={styles.overdueText}>OVERDUE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Cycle Info */}
        <View style={styles.cycleInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cycle:</Text>
            <Text style={styles.infoValue}>#{item.cycleCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Due Date:</Text>
            <Text style={[styles.infoValue, overdue && styles.overdueDate]}>
              {formatDate(item.dateDue)}
            </Text>
          </View>
        </View>

        {/* Financial Details */}
        <View style={styles.financialGrid}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Principal</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(item.principal)}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Interest</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(item.interestAmount)}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Total Due</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(item.totalDue)}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Balance</Text>
            <Text
              style={[
                styles.financialValue,
                item.balance > 0 ? styles.balanceDue : styles.balancePaid,
              ]}
            >
              {formatCurrency(item.balance)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.historyButton]}
            onPress={() => handleOpenPayments(item)}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={ZentyalColors.info}
            />
            <Text style={styles.historyButtonText}>Payments</Text>
          </TouchableOpacity>
          {item.status === "Active" && hasPermission(PAGE_PATH, "Edit") && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditCycle(item)}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={ZentyalColors.primary}
              />
              <Text style={styles.actionButtonText}>Update</Text>
            </TouchableOpacity>
          )}
          {item.status === "Active" && hasPermission(PAGE_PATH, "Delete") && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={ZentyalColors.danger}
              />
              <Text style={styles.deleteButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  /**
   * Render empty state
   */
  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="repeat-outline" size={64} color={ZentyalColors.gray} />
        <Text style={styles.emptyText}>No cycles found</Text>
        <Text style={styles.emptySubtext}>
          {statusFilter !== "All"
            ? `No ${statusFilter.toLowerCase()} cycles`
            : "Cycles will appear here when loans are created"}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZentyalColors.primary} />
        <Text style={styles.loadingText}>Loading cycles...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Loan Cycles</Text>
        {hasPermission(PAGE_PATH, "Add") && (
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={ZentyalColors.gray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by loan number or client name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={ZentyalColors.gray}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={ZentyalColors.gray}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {["All", "Active", "Completed", "Expired", "Cancelled"].map(
            (status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  statusFilter === status && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    statusFilter === status && styles.filterChipTextActive,
                  ]}
                >
                  {status}
                </Text>
                {status !== "All" && (
                  <Text
                    style={[
                      styles.filterChipCount,
                      statusFilter === status && styles.filterChipCountActive,
                    ]}
                  >
                    {cycles.filter((c) => c.status === status).length}
                  </Text>
                )}
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>

      {/* Cycles List */}
      <FlatList
        data={filteredCycles}
        renderItem={renderCycleCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[ZentyalColors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* Edit Cycle Modal */}
      <Modal
        visible={editModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlayCentered}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContentCentered}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Due Date</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={ZentyalColors.dark} />
              </TouchableOpacity>
            </View>

            {editingCycle && (
              <>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    Loan: {editingCycle.loanId.loanNo}
                  </Text>
                  <Text style={styles.modalInfoText}>
                    Cycle #{editingCycle.cycleCount}
                  </Text>
                  <Text style={styles.modalInfoText}>
                    Current Due Date: {formatDate(editingCycle.dateDue)}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    New Due Date <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowEditDatePicker(true)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={ZentyalColors.gray}
                      style={styles.datePickerIcon}
                    />
                    <Text style={styles.datePickerText}>
                      {formatDate(editDateDue.toISOString())}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={ZentyalColors.gray}
                      style={styles.datePickerChevron}
                    />
                  </TouchableOpacity>
                  {showEditDatePicker && (
                    <DateTimePicker
                      value={editDateDue}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        setShowEditDatePicker(Platform.OS === "ios");
                        if (selectedDate) {
                          setEditDateDue(selectedDate);
                        }
                      }}
                    />
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateCycle}
                  >
                    <Text style={styles.saveButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Cycle Modal */}
      <Modal
        visible={addModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlayCentered}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContentCentered}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Cycle</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={ZentyalColors.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Loan <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerContainer}
                  onPress={() => setShowLoanDropdown(!showLoanDropdown)}
                >
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={ZentyalColors.gray}
                    style={styles.pickerIcon}
                  />
                  <Text
                    style={[
                      styles.pickerText,
                      !selectedLoanId && styles.pickerPlaceholder,
                    ]}
                  >
                    {selectedLoanId
                      ? loans.find((l) => l._id === selectedLoanId)?.loanNo ||
                        "Select Loan"
                      : "Select Loan"}
                  </Text>
                  <Ionicons
                    name={showLoanDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={ZentyalColors.gray}
                    style={styles.pickerChevron}
                  />
                </TouchableOpacity>
                {showLoanDropdown && (
                  <ScrollView
                    style={styles.loanList}
                    nestedScrollEnabled={true}
                  >
                    {loans
                      .filter((loan) => loan.status === "Active")
                      .map((loan) => {
                        const hasActiveCycle = cycles.some(
                          (c) =>
                            c.loanId._id === loan._id && c.status === "Active",
                        );
                        return (
                          <TouchableOpacity
                            key={loan._id}
                            style={[
                              styles.loanItem,
                              selectedLoanId === loan._id &&
                                styles.loanItemSelected,
                              hasActiveCycle && styles.loanItemDisabled,
                            ]}
                            onPress={() => {
                              if (!hasActiveCycle) {
                                setSelectedLoanId(loan._id);
                                setPrincipal(loan.principal.toString());
                                setInterestRate(loan.interestRate.toString());
                                setShowLoanDropdown(false);
                              } else {
                                Alert.alert(
                                  "Active Cycle Exists",
                                  "This loan already has an active cycle.",
                                );
                              }
                            }}
                            disabled={hasActiveCycle}
                          >
                            <View style={styles.loanItemContent}>
                              <Text style={styles.loanNo}>{loan.loanNo}</Text>
                              <Text style={styles.clientName}>
                                {loan.clientId.firstName}{" "}
                                {loan.clientId.middleName &&
                                  `${loan.clientId.middleName} `}
                                {loan.clientId.lastName}
                              </Text>
                            </View>
                            {hasActiveCycle && (
                              <Text style={styles.activeBadge}>
                                Has Active Cycle
                              </Text>
                            )}
                            {selectedLoanId === loan._id && (
                              <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={ZentyalColors.primary}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Principal Amount <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={principal}
                  onChangeText={setPrincipal}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Interest Rate (%) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={interestRate}
                  onChangeText={setInterestRate}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Due Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowAddDatePicker(true)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={ZentyalColors.gray}
                    style={styles.datePickerIcon}
                  />
                  <Text style={styles.datePickerText}>
                    {formatDate(dateDue.toISOString())}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={ZentyalColors.gray}
                    style={styles.datePickerChevron}
                  />
                </TouchableOpacity>
                {showAddDatePicker && (
                  <DateTimePicker
                    value={dateDue}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowAddDatePicker(Platform.OS === "ios");
                      if (selectedDate) {
                        setDateDue(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreateCycle}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Cycle Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlayCentered}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContentCentered}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={48} color={ZentyalColors.danger} />
              <Text style={styles.deleteModalTitle}>Cancel Cycle</Text>
              <Text style={styles.deleteModalSubtitle}>
                Are you sure you want to cancel this cycle? This action cannot
                be undone.
              </Text>
            </View>

            {deletingCycle && (
              <>
                <ScrollView style={styles.modalScroll}>
                  <View style={styles.deleteModalInfo}>
                    <Text style={styles.deleteModalInfoText}>
                      Loan: {deletingCycle.loanId.loanNo}
                    </Text>
                    <Text style={styles.deleteModalInfoText}>
                      Cycle #{deletingCycle.cycleCount}
                    </Text>
                    <Text style={styles.deleteModalInfoText}>
                      Amount: {formatCurrency(deletingCycle.totalDue)}
                    </Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>
                      Reason for Cancellation{" "}
                      <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter reason for cancellation..."
                      value={deleteReason}
                      onChangeText={setDeleteReason}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setDeleteModalVisible(false);
                      setDeletingCycle(null);
                      setDeleteReason("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>No, Keep It</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteConfirmButton}
                    onPress={processDelete}
                  >
                    <Text style={styles.deleteConfirmButtonText}>
                      Yes, Cancel Cycle
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Payments Modal (History + Record) */}
      <Modal
        visible={paymentsModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPaymentsModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlayCentered}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContentCentered}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payments</Text>
              <TouchableOpacity
                onPress={() => setPaymentsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={ZentyalColors.dark} />
              </TouchableOpacity>
            </View>

            {selectedCycle && (
              <>
                <ScrollView style={styles.modalScroll}>
                  {/* Cycle Info */}
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoText}>
                      Loan: {selectedCycle.loanId.loanNo}
                    </Text>
                    <Text style={styles.modalInfoText}>
                      Cycle #{selectedCycle.cycleCount}
                    </Text>
                    <Text style={styles.modalInfoText}>
                      Total Due: {formatCurrency(selectedCycle.totalDue)}
                    </Text>
                    <Text style={styles.modalInfoText}>
                      Total Paid: {formatCurrency(selectedCycle.totalPaid)}
                    </Text>
                    <Text
                      style={[styles.modalInfoText, styles.balanceHighlight]}
                    >
                      Balance: {formatCurrency(selectedCycle.balance)}
                    </Text>
                  </View>

                  {/* Payment History Section */}
                  <View style={styles.sectionDivider}>
                    <Text style={styles.sectionTitle}>Payment History</Text>
                  </View>

                  {loadingPayments ? (
                    <View style={styles.loadingPayments}>
                      <ActivityIndicator
                        size="large"
                        color={ZentyalColors.primary}
                      />
                      <Text style={styles.loadingText}>
                        Loading payments...
                      </Text>
                    </View>
                  ) : payments.length > 0 ? (
                    <View style={styles.paymentsListContainer}>
                      {payments.map((payment) => (
                        <View key={payment._id} style={styles.paymentCard}>
                          <View style={styles.paymentHeader}>
                            <View style={styles.paymentHeaderLeft}>
                              <Text style={styles.paymentNo}>
                                {payment.paymentNo}
                              </Text>
                              <Text style={styles.paymentDate}>
                                {formatDate(payment.datePaid)}
                              </Text>
                            </View>
                            <View style={styles.paymentHeaderRight}>
                              <Text style={styles.paymentAmount}>
                                {formatCurrency(payment.amount)}
                              </Text>
                              <View
                                style={[
                                  styles.paymentStatusBadge,
                                  payment.status === "Completed"
                                    ? styles.completedBadge
                                    : styles.cancelledBadge,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.paymentStatusText,
                                    payment.status === "Completed"
                                      ? styles.completedText
                                      : styles.cancelledText,
                                  ]}
                                >
                                  {payment.status}
                                </Text>
                              </View>
                            </View>
                          </View>
                          {payment.remarks && (
                            <Text style={styles.paymentRemarks}>
                              {payment.remarks}
                            </Text>
                          )}
                          {payment.createdBy && (
                            <Text style={styles.paymentCreatedBy}>
                              Recorded by: {payment.createdBy.firstName}{" "}
                              {payment.createdBy.lastName}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyPayments}>
                      <Ionicons
                        name="receipt-outline"
                        size={48}
                        color={ZentyalColors.gray}
                      />
                      <Text style={styles.emptyPaymentsText}>
                        No payments recorded yet
                      </Text>
                    </View>
                  )}

                  {/* Record Payment Section */}
                  {selectedCycle.status === "Active" &&
                    hasPermission(PAGE_PATH, "Edit") && (
                      <>
                        <View style={styles.sectionDivider}>
                          <Text style={styles.sectionTitle}>
                            Record New Payment
                          </Text>
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.label}>
                            Payment Amount{" "}
                            <Text style={styles.required}>*</Text>
                          </Text>
                          <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            value={paymentAmount}
                            onChangeText={setPaymentAmount}
                            keyboardType="decimal-pad"
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.label}>
                            Date Paid <Text style={styles.required}>*</Text>
                          </Text>
                          <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowPaymentDatePicker(true)}
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={20}
                              color={ZentyalColors.gray}
                              style={styles.datePickerIcon}
                            />
                            <Text style={styles.datePickerText}>
                              {formatDate(paymentDate.toISOString())}
                            </Text>
                            <Ionicons
                              name="chevron-down"
                              size={20}
                              color={ZentyalColors.gray}
                              style={styles.datePickerChevron}
                            />
                          </TouchableOpacity>
                          {showPaymentDatePicker && (
                            <DateTimePicker
                              value={paymentDate}
                              mode="date"
                              display={
                                Platform.OS === "ios" ? "spinner" : "default"
                              }
                              onChange={(event, selectedDate) => {
                                setShowPaymentDatePicker(Platform.OS === "ios");
                                if (selectedDate) {
                                  setPaymentDate(selectedDate);
                                }
                              }}
                            />
                          )}
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.label}>Remarks (Optional)</Text>
                          <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter payment notes or remarks..."
                            value={paymentRemarks}
                            onChangeText={setPaymentRemarks}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                          />
                        </View>
                      </>
                    )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setPaymentsModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>
                  {selectedCycle.status === "Active" &&
                    hasPermission(PAGE_PATH, "Edit") && (
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSubmitPayment}
                      >
                        <Text style={styles.saveButtonText}>
                          Record Payment
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ZentyalColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ZentyalColors.light,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: ZentyalColors.dark,
  },
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterScroll: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: ZentyalColors.light,
  },
  filterChipActive: {
    backgroundColor: ZentyalColors.primary,
    borderColor: ZentyalColors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: ZentyalColors.gray,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  filterChipCount: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: ZentyalColors.gray,
  },
  filterChipCountActive: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  cycleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cycleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cycleHeaderLeft: {
    flex: 1,
  },
  cycleLoanNo: {
    fontSize: 16,
    fontWeight: "600",
    color: ZentyalColors.primary,
    marginBottom: 4,
  },
  cycleClientName: {
    fontSize: 14,
    color: ZentyalColors.gray,
  },
  cycleHeaderRight: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ZentyalColors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 4,
  },
  cycleInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: ZentyalColors.gray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: ZentyalColors.dark,
  },
  overdueDate: {
    color: ZentyalColors.danger,
    fontWeight: "600",
  },
  financialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ZentyalColors.light,
  },
  financialItem: {
    width: "50%",
    marginBottom: 12,
  },
  financialLabel: {
    fontSize: 12,
    color: ZentyalColors.gray,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "600",
    color: ZentyalColors.dark,
  },
  balanceDue: {
    color: ZentyalColors.danger,
  },
  balancePaid: {
    color: ZentyalColors.success,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: ZentyalColors.primary + "10",
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.primary,
  },
  deleteButton: {
    backgroundColor: ZentyalColors.danger + "10",
  },
  deleteButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.danger,
  },
  paymentButton: {
    backgroundColor: ZentyalColors.success + "10",
  },
  paymentButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.success,
  },
  balanceHighlight: {
    fontWeight: "700",
    color: ZentyalColors.primary,
    fontSize: 15,
  },
  historyButton: {
    backgroundColor: ZentyalColors.info + "10",
  },
  historyButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.info,
  },
  loadingPayments: {
    paddingVertical: 40,
    alignItems: "center",
  },
  sectionDivider: {
    marginTop: 20,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: ZentyalColors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: ZentyalColors.dark,
  },
  paymentsListContainer: {
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ZentyalColors.light,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentHeaderLeft: {
    flex: 1,
  },
  paymentHeaderRight: {
    alignItems: "flex-end",
  },
  paymentNo: {
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 13,
    color: ZentyalColors.gray,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: ZentyalColors.success,
    marginBottom: 4,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedBadge: {
    backgroundColor: ZentyalColors.success + "20",
  },
  cancelledBadge: {
    backgroundColor: ZentyalColors.gray + "20",
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  completedText: {
    color: ZentyalColors.success,
  },
  cancelledText: {
    color: ZentyalColors.gray,
  },
  paymentRemarks: {
    fontSize: 13,
    color: ZentyalColors.dark,
    fontStyle: "italic",
    marginBottom: 8,
    lineHeight: 18,
  },
  paymentCreatedBy: {
    fontSize: 12,
    color: ZentyalColors.gray,
  },
  emptyPayments: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyPaymentsText: {
    fontSize: 14,
    color: ZentyalColors.gray,
    marginTop: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: ZentyalColors.primary + "10",
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.primary,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: ZentyalColors.gray,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalContentCentered: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    maxHeight: "85%",
    width: "90%",
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ZentyalColors.dark,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalInfo: {
    backgroundColor: ZentyalColors.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalInfoText: {
    fontSize: 14,
    color: ZentyalColors.dark,
    marginBottom: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginBottom: 8,
  },
  required: {
    color: ZentyalColors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: ZentyalColors.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: ZentyalColors.dark,
    backgroundColor: "#fff",
  },
  hint: {
    fontSize: 12,
    color: ZentyalColors.gray,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ZentyalColors.gray,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: ZentyalColors.gray,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: ZentyalColors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalScroll: {
    maxHeight: 400,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: ZentyalColors.light,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingVertical: 2,
  },
  pickerIcon: {
    marginLeft: 12,
  },
  pickerInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: ZentyalColors.dark,
  },
  pickerText: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: ZentyalColors.dark,
  },
  pickerPlaceholder: {
    color: ZentyalColors.gray,
  },
  pickerChevron: {
    marginRight: 12,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: ZentyalColors.light,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingVertical: 2,
  },
  datePickerIcon: {
    marginLeft: 12,
  },
  datePickerText: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: ZentyalColors.dark,
  },
  datePickerChevron: {
    marginRight: 12,
  },
  loanList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: ZentyalColors.light,
    borderRadius: 8,
    marginTop: 8,
  },
  loanItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.light,
  },
  loanItemSelected: {
    backgroundColor: ZentyalColors.primary + "10",
  },
  loanItemDisabled: {
    opacity: 0.5,
  },
  loanItemContent: {
    flex: 1,
  },
  loanNo: {
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 12,
    color: ZentyalColors.gray,
  },
  activeBadge: {
    fontSize: 10,
    color: ZentyalColors.warning,
    fontWeight: "600",
    marginRight: 8,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  deleteModalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginTop: 12,
    marginBottom: 8,
  },
  deleteModalSubtitle: {
    fontSize: 14,
    color: ZentyalColors.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  deleteModalInfo: {
    backgroundColor: ZentyalColors.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  deleteModalInfoText: {
    fontSize: 14,
    color: ZentyalColors.dark,
    marginBottom: 4,
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: ZentyalColors.danger,
    alignItems: "center",
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
