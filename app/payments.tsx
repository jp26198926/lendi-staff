/**
 * Payments Screen
 * Manage payment records with CRUD operations
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

const PAGE_PATH = "/admin/payment";

// Payment Status
enum PaymentStatus {
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

// Interfaces
interface Client {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
}

interface Loan {
  _id: string;
  loanNo: string;
  clientId: Client;
  principal: number;
  interestRate: number;
  terms: number;
  status: string;
}

interface Cycle {
  _id: string;
  cycleCount: number;
  totalDue: number;
  totalPaid: number;
  balance: number;
  dateDue: string;
  status: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Payment {
  _id: string;
  paymentNo: string;
  loanId: Loan;
  cycleId: Cycle;
  amount: number;
  datePaid: string;
  remarks?: string;
  status: PaymentStatus;
  createdAt: string;
  createdBy?: User;
  updatedBy?: User;
  deletedBy?: User;
  deletedReason?: string;
}

export default function PaymentsScreen() {
  const { hasPermission } = useAuth();

  // State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  // Form States
  const [loans, setLoans] = useState<Loan[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [amount, setAmount] = useState("");
  const [datePaid, setDatePaid] = useState(new Date());
  const [remarks, setRemarks] = useState("");
  const [showLoanDropdown, setShowLoanDropdown] = useState(false);
  const [showCycleDropdown, setShowCycleDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Delete States
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // View States
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);

  // Fetch Payments
  const fetchPayments = async () => {
    try {
      const response = await apiRequest<Payment[]>("/api/admin/payment");
      setPayments(response);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      Alert.alert("Error", "Failed to fetch payments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Loans (for dropdown)
  const fetchLoans = async () => {
    try {
      const response = await apiRequest<Loan[]>("/api/admin/loan");
      setLoans(response);
    } catch (error: any) {
      console.error("Error fetching loans:", error);
    }
  };

  // Fetch Cycles for selected loan
  const fetchCyclesForLoan = async (loanId: string) => {
    try {
      const response = await apiRequest<Cycle[]>(`/api/admin/cycle?loanId=${loanId}`);
      // Only show active cycles for new payments
      const activeCycles = response.filter(
        (cycle: Cycle) => cycle.status === "Active",
      );
      setCycles(activeCycles);
    } catch (error: any) {
      console.error("Error fetching cycles:", error);
    }
  };

  // Initial load
  useEffect(() => {
    if (!hasPermission(PAGE_PATH, "Access")) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to access this page",
        [{ text: "OK", onPress: () => router.back() }],
      );
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchPayments(), fetchLoans()]);
  };

  // Apply Filters
  useEffect(() => {
    applyFilters();
  }, [payments, statusFilter, searchQuery]);

  const applyFilters = () => {
    let filtered = [...payments];

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.paymentNo.toLowerCase().includes(query) ||
          payment.loanId.loanNo.toLowerCase().includes(query) ||
          `${payment.loanId.clientId.firstName} ${payment.loanId.clientId.lastName}`
            .toLowerCase()
            .includes(query),
      );
    }

    setFilteredPayments(filtered);
  };

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  // Status counts
  const statusCounts = {
    All: payments.length,
    Completed: payments.filter((p) => p.status === PaymentStatus.COMPLETED)
      .length,
    Cancelled: payments.filter((p) => p.status === PaymentStatus.CANCELLED)
      .length,
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle Add Payment
  const handleAdd = () => {
    if (!hasPermission(PAGE_PATH, "Add")) {
      Alert.alert(
        "Permission Denied",
        "You don't have permission to add payments",
      );
      return;
    }
    // Reset form
    setSelectedLoanId("");
    setSelectedCycleId("");
    setAmount("");
    setDatePaid(new Date());
    setRemarks("");
    setCycles([]);
    setAddModalVisible(true);
  };

  // Handle Create Payment
  const handleCreatePayment = async () => {
    if (!selectedLoanId || !selectedCycleId || !amount) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Validation Error", "Please enter a valid amount");
      return;
    }

    try {
      const payload = {
        loanId: selectedLoanId,
        cycleId: selectedCycleId,
        amount: numAmount,
        datePaid: datePaid.toISOString().split("T")[0],
        remarks: remarks.trim() || undefined,
        status: PaymentStatus.COMPLETED,
      };

      await apiRequest("/api/admin/payment", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      Alert.alert("Success", "Payment recorded successfully");
      setAddModalVisible(false);
      fetchPayments();
    } catch (error: any) {
      console.error("Error creating payment:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to create payment",
      );
    }
  };

  // Handle Delete Payment
  const handleDelete = (payment: Payment) => {
    if (!hasPermission(PAGE_PATH, "Delete")) {
      Alert.alert(
        "Permission Denied",
        "You don't have permission to delete payments",
      );
      return;
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      Alert.alert("Already Cancelled", "This payment is already cancelled");
      return;
    }

    setDeletingPayment(payment);
    setDeleteReason("");
    setDeleteModalVisible(true);
  };

  // Process Delete
  const processDelete = async () => {
    if (!deletingPayment) return;

    if (!deleteReason.trim()) {
      Alert.alert("Validation Error", "Please provide a cancellation reason");
      return;
    }

    try {
      await apiRequest(`/api/admin/payment/${deletingPayment._id}`, {
        method: "DELETE",
        body: JSON.stringify({ reason: deleteReason }),
      });

      Alert.alert("Success", "Payment cancelled successfully");
      setDeleteModalVisible(false);
      fetchPayments();
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to cancel payment",
      );
    }
  };

  // Handle View Payment
  const handleView = (payment: Payment) => {
    setViewingPayment(payment);
    setViewModalVisible(true);
  };

  // Handle Loan Selection
  const handleLoanSelect = (loanId: string) => {
    setSelectedLoanId(loanId);
    setSelectedCycleId("");
    setShowLoanDropdown(false);
    fetchCyclesForLoan(loanId);
  };

  // Render Payment Card
  const renderPaymentCard = (payment: Payment) => {
    const statusColor =
      payment.status === PaymentStatus.COMPLETED
        ? ZentyalColors.success
        : ZentyalColors.gray;

    return (
      <TouchableOpacity
        key={payment._id}
        style={styles.card}
        onPress={() => handleView(payment)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.paymentNo}>{payment.paymentNo}</Text>
            <Text style={styles.loanNo}>{payment.loanId.loanNo}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {payment.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={ZentyalColors.gray}
            />
            <Text style={styles.infoText}>
              {payment.loanId.clientId.firstName}{" "}
              {payment.loanId.clientId.lastName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="repeat-outline"
              size={16}
              color={ZentyalColors.gray}
            />
            <Text style={styles.infoText}>
              Cycle #{payment.cycleId.cycleCount}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={ZentyalColors.gray}
            />
            <Text style={styles.infoText}>{formatDate(payment.datePaid)}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount Paid:</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(payment.amount)}
            </Text>
          </View>

          {payment.remarks && (
            <View style={styles.remarksContainer}>
              <Text style={styles.remarksLabel}>Remarks:</Text>
              <Text style={styles.remarksText} numberOfLines={2}>
                {payment.remarks}
              </Text>
            </View>
          )}
        </View>

        {payment.status === PaymentStatus.COMPLETED && (
          <View style={styles.cardActions}>
            {hasPermission(PAGE_PATH, "Delete") && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(payment)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZentyalColors.primary} />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payments</Text>
          <Text style={styles.headerSubtitle}>
            {filteredPayments.length} payment
            {filteredPayments.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {hasPermission(PAGE_PATH, "Add") && (
          <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={ZentyalColors.gray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by payment no, loan no, or client..."
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

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {Object.entries(statusCounts).map(([status, count]) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === status && styles.filterTextActive,
              ]}
            >
              {status} ({count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Payments List */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ZentyalColors.primary}
          />
        }
      >
        {filteredPayments.length > 0 ? (
          filteredPayments.map(renderPaymentCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={64}
              color={ZentyalColors.gray}
            />
            <Text style={styles.emptyText}>No payments found</Text>
            {statusFilter !== "All" && (
              <TouchableOpacity onPress={() => setStatusFilter("All")}>
                <Text style={styles.clearFilterText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Payment Modal */}
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
              <Text style={styles.modalTitle}>Record Payment</Text>
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
                  Select Loan <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowLoanDropdown(!showLoanDropdown)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !selectedLoanId && styles.dropdownPlaceholder,
                    ]}
                  >
                    {selectedLoanId
                      ? loans.find((l) => l._id === selectedLoanId)?.loanNo
                      : "Select a loan"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={ZentyalColors.gray}
                  />
                </TouchableOpacity>
                {showLoanDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={styles.dropdownScroll}>
                      {loans.map((loan) => (
                        <TouchableOpacity
                          key={loan._id}
                          style={styles.dropdownItem}
                          onPress={() => handleLoanSelect(loan._id)}
                        >
                          <Text style={styles.dropdownItemText}>
                            {loan.loanNo} -{" "}
                            {`${loan.clientId.firstName} ${loan.clientId.lastName}`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {selectedLoanId && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Select Cycle <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowCycleDropdown(!showCycleDropdown)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !selectedCycleId && styles.dropdownPlaceholder,
                      ]}
                    >
                      {selectedCycleId
                        ? `Cycle #${cycles.find((c) => c._id === selectedCycleId)?.cycleCount} - Balance: ${formatCurrency(cycles.find((c) => c._id === selectedCycleId)?.balance || 0)}`
                        : "Select a cycle"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={ZentyalColors.gray}
                    />
                  </TouchableOpacity>
                  {showCycleDropdown && (
                    <View style={styles.dropdownList}>
                      <ScrollView style={styles.dropdownScroll}>
                        {cycles.length > 0 ? (
                          cycles.map((cycle) => (
                            <TouchableOpacity
                              key={cycle._id}
                              style={styles.dropdownItem}
                              onPress={() => {
                                setSelectedCycleId(cycle._id);
                                setShowCycleDropdown(false);
                              }}
                            >
                              <Text style={styles.dropdownItemText}>
                                Cycle #{cycle.cycleCount} - Balance:{" "}
                                {formatCurrency(cycle.balance)}
                              </Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={styles.dropdownEmpty}>
                            <Text style={styles.dropdownEmptyText}>
                              No active cycles found for this loan
                            </Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Payment Amount <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Date Paid <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={ZentyalColors.gray}
                    style={styles.datePickerIcon}
                  />
                  <Text style={styles.datePickerText}>
                    {formatDate(datePaid.toISOString())}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={ZentyalColors.gray}
                    style={styles.datePickerChevron}
                  />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={datePaid}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === "ios");
                      if (selectedDate) {
                        setDatePaid(selectedDate);
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
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
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
                onPress={handleCreatePayment}
              >
                <Text style={styles.saveButtonText}>Record Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete/Cancel Payment Modal */}
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel Payment</Text>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={ZentyalColors.dark} />
              </TouchableOpacity>
            </View>

            {deletingPayment && (
              <>
                <ScrollView style={styles.modalScroll}>
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoText}>
                      Payment: {deletingPayment.paymentNo}
                    </Text>
                    <Text style={styles.modalInfoText}>
                      Amount: {formatCurrency(deletingPayment.amount)}
                    </Text>
                    <Text style={styles.modalInfoText}>
                      Date: {formatDate(deletingPayment.datePaid)}
                    </Text>
                  </View>

                  <View style={styles.warningBox}>
                    <Ionicons
                      name="warning"
                      size={24}
                      color={ZentyalColors.danger}
                    />
                    <Text style={styles.warningText}>
                      Cancelling this payment will reverse all cycle and loan
                      calculations. This action cannot be undone.
                    </Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>
                      Cancellation Reason <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter reason for cancelling this payment..."
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
                    onPress={() => setDeleteModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Keep Payment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, styles.dangerButton]}
                    onPress={processDelete}
                  >
                    <Text style={styles.saveButtonText}>Cancel Payment</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* View Payment Modal */}
      <Modal
        visible={viewModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalOverlayCentered}>
          <View style={styles.modalContentCentered}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Details</Text>
              <TouchableOpacity
                onPress={() => setViewModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={ZentyalColors.dark} />
              </TouchableOpacity>
            </View>

            {viewingPayment && (
              <>
                <ScrollView style={styles.modalScroll}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Payment Information
                    </Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment No:</Text>
                      <Text style={styles.detailValue}>
                        {viewingPayment.paymentNo}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              (viewingPayment.status === PaymentStatus.COMPLETED
                                ? ZentyalColors.success
                                : ZentyalColors.gray) + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                viewingPayment.status ===
                                PaymentStatus.COMPLETED
                                  ? ZentyalColors.success
                                  : ZentyalColors.gray,
                            },
                          ]}
                        >
                          {viewingPayment.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>
                      <Text
                        style={[styles.detailValue, styles.amountHighlight]}
                      >
                        {formatCurrency(viewingPayment.amount)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date Paid:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(viewingPayment.datePaid)}
                      </Text>
                    </View>
                    {viewingPayment.remarks && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Remarks:</Text>
                        <Text style={styles.detailValue}>
                          {viewingPayment.remarks}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Loan & Cycle Information
                    </Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Loan No:</Text>
                      <Text style={styles.detailValue}>
                        {viewingPayment.loanId.loanNo}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Client:</Text>
                      <Text style={styles.detailValue}>
                        {viewingPayment.loanId.clientId.firstName}{" "}
                        {viewingPayment.loanId.clientId.lastName}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cycle:</Text>
                      <Text style={styles.detailValue}>
                        #{viewingPayment.cycleId.cycleCount}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cycle Balance:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(viewingPayment.cycleId.balance)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Audit Trail</Text>
                    {viewingPayment.createdBy && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Created By:</Text>
                        <Text style={styles.detailValue}>
                          {viewingPayment.createdBy.firstName}{" "}
                          {viewingPayment.createdBy.lastName}
                        </Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created At:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(viewingPayment.createdAt)}
                      </Text>
                    </View>
                    {viewingPayment.updatedBy && (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Updated By:</Text>
                          <Text style={styles.detailValue}>
                            {viewingPayment.updatedBy.firstName}{" "}
                            {viewingPayment.updatedBy.lastName}
                          </Text>
                        </View>
                      </>
                    )}
                    {viewingPayment.status === PaymentStatus.CANCELLED && (
                      <>
                        {viewingPayment.deletedBy && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Cancelled By:
                            </Text>
                            <Text style={styles.detailValue}>
                              {viewingPayment.deletedBy.firstName}{" "}
                              {viewingPayment.deletedBy.lastName}
                            </Text>
                          </View>
                        )}
                        {viewingPayment.deletedReason && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Reason:</Text>
                            <Text style={styles.detailValue}>
                              {viewingPayment.deletedReason}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { flex: 1 }]}
                    onPress={() => setViewModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.light,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: ZentyalColors.dark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: ZentyalColors.gray,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: ZentyalColors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ZentyalColors.light,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: ZentyalColors.dark,
  },
  filterContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
    maxHeight: 40,
  },
  filterButton: {
    paddingHorizontal: 16,
    height: 36,
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: ZentyalColors.light,
  },
  filterButtonActive: {
    backgroundColor: ZentyalColors.primary,
    borderColor: ZentyalColors.primary,
  },
  filterText: {
    fontSize: 14,
    color: ZentyalColors.dark,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  list: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ZentyalColors.light,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  paymentNo: {
    fontSize: 18,
    fontWeight: "700",
    color: ZentyalColors.dark,
    marginBottom: 4,
  },
  loanNo: {
    fontSize: 14,
    color: ZentyalColors.gray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: ZentyalColors.dark,
    marginLeft: 8,
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ZentyalColors.light,
  },
  amountLabel: {
    fontSize: 14,
    color: ZentyalColors.gray,
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "700",
    color: ZentyalColors.success,
  },
  remarksContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ZentyalColors.light,
  },
  remarksLabel: {
    fontSize: 12,
    color: ZentyalColors.gray,
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 14,
    color: ZentyalColors.dark,
    fontStyle: "italic",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ZentyalColors.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: ZentyalColors.info,
  },
  deleteButton: {
    backgroundColor: ZentyalColors.danger,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: ZentyalColors.gray,
    marginTop: 16,
  },
  clearFilterText: {
    fontSize: 16,
    color: ZentyalColors.primary,
    marginTop: 12,
    textDecorationLine: "underline",
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentCentered: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: ZentyalColors.dark,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: 400,
    padding: 20,
  },
  modalInfo: {
    backgroundColor: ZentyalColors.light,
    padding: 16,
    borderRadius: 12,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: ZentyalColors.dark,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: ZentyalColors.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: ZentyalColors.dark,
  },
  dropdownPlaceholder: {
    color: ZentyalColors.gray,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: ZentyalColors.light,
    borderRadius: 12,
    backgroundColor: "#fff",
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.light,
  },
  dropdownItemText: {
    fontSize: 14,
    color: ZentyalColors.dark,
  },
  dropdownEmpty: {
    padding: 20,
    alignItems: "center",
  },
  dropdownEmptyText: {
    fontSize: 14,
    color: ZentyalColors.gray,
    textAlign: "center",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: ZentyalColors.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  datePickerIcon: {
    marginRight: 8,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: ZentyalColors.dark,
  },
  datePickerChevron: {
    marginLeft: 8,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: ZentyalColors.danger + "10",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: ZentyalColors.danger,
    marginLeft: 12,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: ZentyalColors.light,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ZentyalColors.light,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: ZentyalColors.dark,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: ZentyalColors.primary,
    alignItems: "center",
  },
  dangerButton: {
    backgroundColor: ZentyalColors.danger,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: ZentyalColors.dark,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.light,
  },
  detailLabel: {
    fontSize: 14,
    color: ZentyalColors.gray,
    fontWeight: "500",
    width: "40%",
  },
  detailValue: {
    fontSize: 14,
    color: ZentyalColors.dark,
    fontWeight: "600",
    width: "60%",
    textAlign: "right",
  },
  amountHighlight: {
    color: ZentyalColors.success,
    fontSize: 16,
    fontWeight: "700",
  },
});
