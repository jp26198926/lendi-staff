/**
 * Loans Screen
 * List and manage loans with CRUD operations
 */

import { ZentyalColors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
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

// Loan interface
interface Loan {
  _id: string;
  loanNo: string;
  clientId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  principal: number;
  interestRate: number;
  terms: "Weekly" | "Fortnightly" | "Monthly";
  dateStarted: string;
  assignedStaff: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: "Active" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  deletedAt?: string;
  deletedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  deletedReason?: string;
}

interface Client {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  status: string;
}

interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
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

export default function LoansScreen() {
  const { user, hasPermission } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingLoan, setDeletingLoan] = useState<Loan | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [cyclesModalVisible, setCyclesModalVisible] = useState(false);
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [addCycleModalVisible, setAddCycleModalVisible] = useState(false);
  const [editCycleModalVisible, setEditCycleModalVisible] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);

  // Form state
  const [clientId, setClientId] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [terms, setTerms] = useState<"Weekly" | "Fortnightly" | "Monthly">(
    "Weekly",
  );
  const [dateStarted, setDateStarted] = useState("");
  const [assignedStaff, setAssignedStaff] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Cycle form state
  const [cyclePrincipal, setCyclePrincipal] = useState("");
  const [cycleInterestRate, setCycleInterestRate] = useState("");
  const [cycleDateDue, setCycleDateDue] = useState("");
  const [showCycleDatePicker, setShowCycleDatePicker] = useState(false);
  const [editCycleDateDue, setEditCycleDateDue] = useState("");
  const [showEditCycleDatePicker, setShowEditCycleDatePicker] = useState(false);

  const PAGE_PATH = "/admin/loan";

  /**
   * Check permissions
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
   * Fetch all data (loans, clients, staffs)
   */
  async function fetchData() {
    try {
      await Promise.all([fetchLoans(), fetchClients(), fetchStaffs()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetch loans from backend
   */
  async function fetchLoans() {
    try {
      const response = await apiRequest<Loan[]>("/api/admin/loan");
      setLoans(response);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load loans",
      );
    }
  }

  /**
   * Fetch clients for dropdown
   */
  async function fetchClients() {
    try {
      const response = await apiRequest<Client[]>(
        "/api/admin/client?status=ACTIVE",
      );
      setClients(response);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }

  /**
   * Fetch staff members for dropdown
   */
  async function fetchStaffs() {
    try {
      const response = await apiRequest<Staff[]>(
        "/api/admin/user?status=ACTIVE",
      );
      setStaffs(response);
    } catch (error) {
      console.error("Error fetching staff:", error);
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
   * Open add modal
   */
  function handleAdd() {
    if (!hasPermission(PAGE_PATH, "Add")) {
      Alert.alert("Access Denied", "You don't have permission to create loans");
      return;
    }
    setEditingLoan(null);
    setClientId("");
    setPrincipal("");
    setInterestRate("");
    setTerms("Weekly");
    setDateStarted(new Date().toISOString().split("T")[0]);
    setAssignedStaff("");
    setModalVisible(true);
  }

  /**
   * Open edit modal
   */
  function handleEdit(loan: Loan) {
    if (!hasPermission(PAGE_PATH, "Edit")) {
      Alert.alert("Access Denied", "You don't have permission to edit loans");
      return;
    }
    if (loan.status === "Cancelled") {
      Alert.alert("Cannot Edit", "Cancelled loans cannot be edited");
      return;
    }
    setEditingLoan(loan);
    setClientId(loan.clientId._id);
    setPrincipal(loan.principal.toString());
    setInterestRate(loan.interestRate.toString());
    setTerms(loan.terms);
    setDateStarted(new Date(loan.dateStarted).toISOString().split("T")[0]);
    setAssignedStaff(loan.assignedStaff._id);
    setModalVisible(true);
  }

  /**
   * Open cycles modal
   */
  async function handleViewCycles(loan: Loan) {
    // Check if user has permission to view cycles (Access = View/Read)
    if (!hasPermission("/admin/cycle", "Access")) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to view loan cycles",
      );
      return;
    }

    setViewingLoan(loan);
    setCyclesModalVisible(true);
    setLoadingCycles(true);
    setCycles([]); // Clear previous cycles

    try {
      const response = await apiRequest<Cycle[]>(
        `/api/admin/cycle?loanId=${loan._id}`,
      );

      if (!response || !Array.isArray(response)) {
        console.warn("⚠️ Invalid cycles response:", response);
        setCycles([]);
      } else {
        console.log(`✅ Setting ${response.length} cycles to state`);
        console.log("✅ Cycles data:", JSON.stringify(response, null, 2));
        setCycles(response);
      }
    } catch (error) {
      console.error("Error fetching cycles:", error);
      Alert.alert(
        "Error Loading Cycles",
        error instanceof Error
          ? error.message
          : "Failed to load cycles. Please try again.",
      );
      setCycles([]); // Ensure empty state on error
    } finally {
      setLoadingCycles(false);
    }
  }

  /**
   * Open add cycle modal
   */
  function handleOpenAddCycle() {
    // Check if user has permission to add cycles (Add = Create)
    if (!hasPermission("/admin/cycle", "Add")) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to add loan cycles",
      );
      return;
    }

    if (!viewingLoan) return;

    // Check for existing active cycle
    const hasActiveCycle = cycles.some((cycle) => cycle.status === "Active");
    if (hasActiveCycle) {
      Alert.alert(
        "Active Cycle Exists",
        "Cannot create a new cycle. An active cycle already exists for this loan. Please complete or cancel the existing cycle first.",
        [{ text: "OK" }],
      );
      return;
    }

    // Pre-fill with loan defaults
    setCyclePrincipal(viewingLoan.principal.toString());
    setCycleInterestRate(viewingLoan.interestRate.toString());
    setCycleDateDue("");

    setAddCycleModalVisible(true);
  }

  /**
   * Handle create cycle
   */
  async function handleCreateCycle() {
    if (!viewingLoan) return;

    // Double-check for active cycle before creating
    const hasActiveCycle = cycles.some((cycle) => cycle.status === "Active");
    if (hasActiveCycle) {
      Alert.alert(
        "Active Cycle Exists",
        "Cannot create a new cycle. An active cycle already exists for this loan. Please complete or cancel the existing cycle first.",
      );
      return;
    }

    // Validate required fields
    if (!cyclePrincipal || !cycleInterestRate || !cycleDateDue) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields (Principal, Interest Rate, Due Date)",
      );
      return;
    }

    const principalNum = parseFloat(cyclePrincipal);
    const interestRateNum = parseFloat(cycleInterestRate);

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

    try {
      // Calculate derived fields
      const interestAmount = (principalNum * interestRateNum) / 100;
      const totalDue = principalNum + interestAmount;

      // Get the next cycle count
      const nextCycleCount =
        cycles.length > 0
          ? Math.max(...cycles.map((c) => c.cycleCount)) + 1
          : 1;

      const cycleData = {
        loanId: viewingLoan._id,
        cycleCount: nextCycleCount,
        principal: principalNum,
        interestRate: interestRateNum,
        interestAmount,
        totalDue,
        dateDue: cycleDateDue,
        status: "Active",
      };

      await apiRequest("/api/admin/cycle", {
        method: "POST",
        body: JSON.stringify(cycleData),
      });

      Alert.alert("Success", "Cycle created successfully");
      setAddCycleModalVisible(false);

      // Refresh cycles list
      await handleViewCycles(viewingLoan);
    } catch (error) {
      console.error("Error creating cycle:", error);
      Alert.alert(
        "Error Creating Cycle",
        error instanceof Error
          ? error.message
          : "Failed to create cycle. Please try again.",
      );
    }
  }

  /**
   * Open edit cycle modal
   */
  function handleEditCycle(cycle: Cycle) {
    // Check if user has permission to edit cycles (Edit = Update)
    if (!hasPermission("/admin/cycle", "Edit")) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to edit loan cycles",
      );
      return;
    }

    setEditingCycle(cycle);
    setEditCycleDateDue(cycle.dateDue);
    setEditCycleModalVisible(true);
  }

  /**
   * Handle update cycle
   */
  async function handleUpdateCycle() {
    if (!editingCycle) return;

    // Validate required field
    if (!editCycleDateDue) {
      Alert.alert("Validation Error", "Please select a due date");
      return;
    }

    try {
      await apiRequest(`/api/admin/cycle/${editingCycle._id}`, {
        method: "PUT",
        body: JSON.stringify({
          dateDue: editCycleDateDue,
        }),
      });

      Alert.alert("Success", "Cycle due date updated successfully");
      setEditCycleModalVisible(false);
      setEditingCycle(null);

      // Refresh cycles list
      if (viewingLoan) {
        await handleViewCycles(viewingLoan);
      }
    } catch (error) {
      console.error("Error updating cycle:", error);
      Alert.alert(
        "Error Updating Cycle",
        error instanceof Error
          ? error.message
          : "Failed to update cycle. Please try again.",
      );
    }
  }

  /**
   * Handle delete
   */
  function handleDelete(loan: Loan) {
    if (!hasPermission(PAGE_PATH, "Delete")) {
      Alert.alert("Access Denied", "You don't have permission to cancel loans");
      return;
    }
    if (loan.status === "Cancelled") {
      Alert.alert("Already Cancelled", "This loan is already cancelled");
      return;
    }
    if (loan.status !== "Active") {
      Alert.alert("Cannot Cancel", "Only active loans can be cancelled");
      return;
    }

    setDeletingLoan(loan);
    setDeleteReason("");
    setDeleteModalVisible(true);
  }

  /**
   * Process delete
   */
  async function processDelete() {
    if (!deletingLoan) return;

    if (!deleteReason.trim()) {
      Alert.alert("Error", "Cancellation reason is required");
      return;
    }

    try {
      setLoading(true);
      setDeleteModalVisible(false);

      await apiRequest(`/api/admin/loan/${deletingLoan._id}`, {
        method: "DELETE",
        body: JSON.stringify({ reason: deleteReason }),
      });

      Alert.alert("Success", "Loan cancelled successfully");
      setDeletingLoan(null);
      setDeleteReason("");
      await fetchLoans();
    } catch (error) {
      Alert.alert(
        "Cancel Failed",
        error instanceof Error ? error.message : "Failed to cancel loan",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save loan (create or update)
   */
  async function handleSave() {
    // Validate
    if (
      !clientId ||
      !principal.trim() ||
      !interestRate.trim() ||
      !dateStarted ||
      !assignedStaff
    ) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    const principalNum = parseFloat(principal);
    const interestRateNum = parseFloat(interestRate);

    if (isNaN(principalNum) || principalNum <= 0) {
      Alert.alert("Validation Error", "Please enter a valid principal amount");
      return;
    }

    if (isNaN(interestRateNum) || interestRateNum < 0) {
      Alert.alert("Validation Error", "Please enter a valid interest rate");
      return;
    }

    try {
      setLoading(true);
      setModalVisible(false);

      const loanData = {
        clientId,
        principal: principalNum,
        interestRate: interestRateNum,
        terms,
        dateStarted,
        assignedStaff,
      };

      if (editingLoan) {
        // Update
        await apiRequest(`/api/admin/loan/${editingLoan._id}`, {
          method: "PUT",
          body: JSON.stringify(loanData),
        });
        Alert.alert("Success", "Loan updated successfully");
      } else {
        // Create
        await apiRequest("/api/admin/loan", {
          method: "POST",
          body: JSON.stringify(loanData),
        });
        Alert.alert("Success", "Loan created successfully");
      }

      await fetchLoans();
    } catch (error) {
      Alert.alert(
        "Save Failed",
        error instanceof Error ? error.message : "Failed to save loan",
      );
    } finally {
      setLoading(false);
    }
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
   * Format currency
   */
  function formatCurrency(value: number): string {
    return value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (loading && loans.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZentyalColors.primary} />
        <Text style={styles.loadingText}>Loading loans...</Text>
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
        <Text style={styles.headerTitle}>Loans</Text>
        {hasPermission(PAGE_PATH, "Add") && (
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
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
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {loans.filter((l) => l.status === "Active").length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {loans.filter((l) => l.status === "Completed").length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {loans.filter((l) => l.status === "Cancelled").length}
            </Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>

        {/* Loan List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Loans ({loans.length})</Text>

          {loans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="cash-outline"
                size={64}
                color={ZentyalColors.gray}
              />
              <Text style={styles.emptyText}>No loans found</Text>
              {hasPermission(PAGE_PATH, "Add") && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={handleAdd}
                >
                  <Text style={styles.emptyButtonText}>Add First Loan</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            loans.map((loan) => (
              <View key={loan._id} style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <View>
                    <Text style={styles.loanNo}>{loan.loanNo}</Text>
                    <Text style={styles.clientName}>
                      {loan.clientId.firstName}{" "}
                      {loan.clientId.middleName
                        ? loan.clientId.middleName + " "
                        : ""}
                      {loan.clientId.lastName}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          loan.status === "Active"
                            ? ZentyalColors.success + "20"
                            : loan.status === "Completed"
                              ? ZentyalColors.info + "20"
                              : ZentyalColors.gray + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            loan.status === "Active"
                              ? ZentyalColors.success
                              : loan.status === "Completed"
                                ? ZentyalColors.info
                                : ZentyalColors.gray,
                        },
                      ]}
                    >
                      {loan.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.loanDetails}>
                  <View style={styles.loanDetailRow}>
                    <Text style={styles.loanDetailLabel}>Principal:</Text>
                    <Text style={styles.loanDetailValue}>
                      {formatCurrency(loan.principal)}
                    </Text>
                  </View>
                  <View style={styles.loanDetailRow}>
                    <Text style={styles.loanDetailLabel}>Interest Rate:</Text>
                    <Text style={styles.loanDetailValue}>
                      {loan.interestRate}%
                    </Text>
                  </View>
                  <View style={styles.loanDetailRow}>
                    <Text style={styles.loanDetailLabel}>Terms:</Text>
                    <Text style={styles.loanDetailValue}>{loan.terms}</Text>
                  </View>
                  <View style={styles.loanDetailRow}>
                    <Text style={styles.loanDetailLabel}>Date Started:</Text>
                    <Text style={styles.loanDetailValue}>
                      {formatDate(loan.dateStarted)}
                    </Text>
                  </View>
                  <View style={styles.loanDetailRow}>
                    <Text style={styles.loanDetailLabel}>Assigned Staff:</Text>
                    <Text style={styles.loanDetailValue}>
                      {loan.assignedStaff.firstName}{" "}
                      {loan.assignedStaff.lastName}
                    </Text>
                  </View>
                </View>

                <View style={styles.loanActions}>
                  {hasPermission("/admin/cycle", "Access") && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.viewButton]}
                      onPress={() => handleViewCycles(loan)}
                    >
                      <Ionicons
                        name="list-outline"
                        size={18}
                        color={ZentyalColors.info}
                      />
                      <Text style={styles.viewButtonText}>Cycles</Text>
                    </TouchableOpacity>
                  )}
                  {loan.status === "Active" && (
                    <>
                      {hasPermission(PAGE_PATH, "Edit") && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => handleEdit(loan)}
                        >
                          <Ionicons
                            name="create-outline"
                            size={18}
                            color={ZentyalColors.primary}
                          />
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                      )}
                      {hasPermission(PAGE_PATH, "Delete") && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDelete(loan)}
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={18}
                            color={ZentyalColors.danger}
                          />
                          <Text style={styles.deleteButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlayTouchable}
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.formModalWrapper}
            >
              <View style={styles.formModalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingLoan ? "Edit Loan" : "Add Loan"}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={ZentyalColors.dark}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Client *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={clientId}
                        onValueChange={(value) => setClientId(value)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select a client" value="" />
                        {clients.map((client) => (
                          <Picker.Item
                            key={client._id}
                            label={`${client.firstName} ${client.middleName ? client.middleName + " " : ""}${client.lastName}`}
                            value={client._id}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Principal Amount *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={principal}
                      onChangeText={setPrincipal}
                      placeholder="Enter principal amount"
                      placeholderTextColor={ZentyalColors.gray}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Interest Rate (%) *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={interestRate}
                      onChangeText={setInterestRate}
                      placeholder="Enter interest rate"
                      placeholderTextColor={ZentyalColors.gray}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Terms *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={terms}
                        onValueChange={(value) => setTerms(value as any)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Weekly" value="Weekly" />
                        <Picker.Item label="Fortnightly" value="Fortnightly" />
                        <Picker.Item label="Monthly" value="Monthly" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Date Started *</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.datePickerText}>
                        {dateStarted ? formatDate(dateStarted) : "Select date"}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={ZentyalColors.gray}
                      />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={dateStarted ? new Date(dateStarted) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(Platform.OS === "ios");
                          if (selectedDate) {
                            setDateStarted(
                              selectedDate.toISOString().split("T")[0],
                            );
                          }
                        }}
                      />
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Assigned Staff *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={assignedStaff}
                        onValueChange={(value) => setAssignedStaff(value)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select a staff member" value="" />
                        {staffs.map((staff) => (
                          <Picker.Item
                            key={staff._id}
                            label={`${staff.firstName} ${staff.lastName}`}
                            value={staff._id}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={handleSave}
                  >
                    <Text style={styles.modalSaveButtonText}>
                      {editingLoan ? "Update" : "Create"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlayTouchable}
            onPress={() => setDeleteModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.deleteModalWrapper}
            >
              <View style={styles.deleteModalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Cancel Loan</Text>
                  <TouchableOpacity
                    onPress={() => setDeleteModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={ZentyalColors.dark}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.deleteModalContent}>
                  <View style={styles.deleteWarning}>
                    <Ionicons
                      name="warning"
                      size={48}
                      color={ZentyalColors.danger}
                    />
                    <Text style={styles.deleteWarningTitle}>
                      Cancel Loan {deletingLoan?.loanNo}?
                    </Text>
                    <Text style={styles.deleteWarningText}>
                      This action cannot be undone. The loan will be marked as
                      cancelled.
                    </Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>
                      Reason for Cancellation *
                    </Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea]}
                      value={deleteReason}
                      onChangeText={setDeleteReason}
                      placeholder="Enter reason for cancellation"
                      placeholderTextColor={ZentyalColors.gray}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </ScrollView>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setDeleteModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalDeleteButton]}
                    onPress={processDelete}
                  >
                    <Text style={styles.modalDeleteButtonText}>
                      Cancel Loan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Cycles Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cyclesModalVisible}
        onRequestClose={() => setCyclesModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlayTouchable}
            onPress={() => setCyclesModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.cyclesModalWrapper}
            >
              <View style={styles.cyclesModalContainer}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Loan Cycles</Text>
                    {viewingLoan && (
                      <Text style={styles.modalSubtitle}>
                        {viewingLoan.loanNo} - {viewingLoan.clientId.firstName}{" "}
                        {viewingLoan.clientId.lastName}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setCyclesModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={ZentyalColors.dark}
                    />
                  </TouchableOpacity>
                </View>

                {hasPermission("/admin/cycle", "Add") && (
                  <View style={styles.addCycleButtonContainer}>
                    <TouchableOpacity
                      style={styles.addCycleButton}
                      onPress={handleOpenAddCycle}
                    >
                      <Ionicons
                        name="add-circle"
                        size={20}
                        color={ZentyalColors.primary}
                      />
                      <Text style={styles.addCycleButtonText}>Add Cycle</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <ScrollView style={styles.cyclesModalContent}>
                  {(() => {
                    console.log(
                      `🔍 Rendering - loadingCycles: ${loadingCycles}, cycles.length: ${cycles.length}`,
                    );
                    return null;
                  })()}
                  {loadingCycles ? (
                    <View style={styles.cyclesLoadingContainer}>
                      <ActivityIndicator
                        size="large"
                        color={ZentyalColors.primary}
                      />
                      <Text style={styles.loadingText}>Loading cycles...</Text>
                    </View>
                  ) : cycles.length === 0 ? (
                    <View style={styles.emptyCyclesContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={64}
                        color={ZentyalColors.gray}
                      />
                      <Text style={styles.emptyText}>No cycles found</Text>
                    </View>
                  ) : (
                    <View style={styles.cyclesListContainer}>
                      {cycles.map((cycle, index) => (
                        <View key={cycle._id} style={styles.cycleCard}>
                          <View style={styles.cycleHeader}>
                            <Text style={styles.cycleCount}>
                              Cycle {cycle.cycleCount}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor:
                                    cycle.status === "Active"
                                      ? ZentyalColors.success + "20"
                                      : cycle.status === "Completed"
                                        ? ZentyalColors.info + "20"
                                        : cycle.status === "Expired"
                                          ? ZentyalColors.warning + "20"
                                          : ZentyalColors.gray + "20",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  {
                                    color:
                                      cycle.status === "Active"
                                        ? ZentyalColors.success
                                        : cycle.status === "Completed"
                                          ? ZentyalColors.info
                                          : cycle.status === "Expired"
                                            ? ZentyalColors.warning
                                            : ZentyalColors.gray,
                                  },
                                ]}
                              >
                                {cycle.status}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.cycleDetails}>
                            <View style={styles.loanDetailRow}>
                              <Text style={styles.loanDetailLabel}>
                                Due Date:
                              </Text>
                              <Text style={styles.loanDetailValue}>
                                {formatDate(cycle.dateDue)}
                              </Text>
                            </View>
                            <View style={styles.loanDetailRow}>
                              <Text style={styles.loanDetailLabel}>
                                Principal:
                              </Text>
                              <Text style={styles.loanDetailValue}>
                                {formatCurrency(cycle.principal)}
                              </Text>
                            </View>
                            <View style={styles.loanDetailRow}>
                              <Text style={styles.loanDetailLabel}>
                                Interest:
                              </Text>
                              <Text style={styles.loanDetailValue}>
                                {formatCurrency(cycle.interestAmount)} (
                                {cycle.interestRate}%)
                              </Text>
                            </View>
                            <View style={styles.loanDetailRow}>
                              <Text style={styles.loanDetailLabel}>
                                Total Due:
                              </Text>
                              <Text
                                style={[
                                  styles.loanDetailValue,
                                  styles.highlightValue,
                                ]}
                              >
                                {formatCurrency(cycle.totalDue)}
                              </Text>
                            </View>
                            <View style={styles.loanDetailRow}>
                              <Text style={styles.loanDetailLabel}>
                                Total Paid:
                              </Text>
                              <Text style={styles.loanDetailValue}>
                                {formatCurrency(cycle.totalPaid)}
                              </Text>
                            </View>
                            <View style={styles.loanDetailRow}>
                              <Text style={styles.loanDetailLabel}>
                                Balance:
                              </Text>
                              <Text
                                style={[
                                  styles.loanDetailValue,
                                  cycle.balance > 0 && styles.warningValue,
                                ]}
                              >
                                {formatCurrency(cycle.balance)}
                              </Text>
                            </View>
                            <View style={styles.loanDetailRow}>
                              <Text style={styles.loanDetailLabel}>
                                Profit Expected:
                              </Text>
                              <Text style={styles.loanDetailValue}>
                                {formatCurrency(cycle.profitExpected)}
                              </Text>
                            </View>
                            <View style={styles.loanDetailRow}>
                              <Text style={styles.loanDetailLabel}>
                                Profit Earned:
                              </Text>
                              <Text style={styles.loanDetailValue}>
                                {formatCurrency(cycle.profitEarned)}
                              </Text>
                            </View>
                          </View>

                          {cycle.status === "Active" && (
                            <View style={styles.cycleActions}>
                              {hasPermission("/admin/cycle", "Edit") && (
                                <TouchableOpacity
                                  style={[
                                    styles.cycleActionButton,
                                    styles.editButton,
                                  ]}
                                  onPress={() => handleEditCycle(cycle)}
                                >
                                  <Ionicons
                                    name="create-outline"
                                    size={16}
                                    color={ZentyalColors.primary}
                                  />
                                  <Text style={styles.editButtonText}>
                                    Edit
                                  </Text>
                                </TouchableOpacity>
                              )}
                              {hasPermission("/admin/cycle", "Delete") && (
                                <TouchableOpacity
                                  style={[
                                    styles.cycleActionButton,
                                    styles.deleteButton,
                                  ]}
                                  onPress={() =>
                                    Alert.alert(
                                      "Cancel Cycle",
                                      "Cycle cancellation coming soon",
                                    )
                                  }
                                >
                                  <Ionicons
                                    name="close-circle-outline"
                                    size={16}
                                    color={ZentyalColors.danger}
                                  />
                                  <Text style={styles.deleteButtonText}>
                                    Cancel
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>

                <View style={styles.cyclesModalFooter}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCloseButton]}
                    onPress={() => setCyclesModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Cycle Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addCycleModalVisible}
        onRequestClose={() => setAddCycleModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlayTouchable}
            onPress={() => setAddCycleModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.formModalWrapper}
            >
              <View style={styles.formModalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add New Cycle</Text>
                  <TouchableOpacity
                    onPress={() => setAddCycleModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={ZentyalColors.dark}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  {viewingLoan && (
                    <View
                      style={[styles.infoBox, { flexDirection: "row", gap: 8 }]}
                    >
                      <Ionicons
                        name="information-circle"
                        size={20}
                        color={ZentyalColors.info}
                      />
                      <Text style={styles.infoText}>
                        Creating cycle for: {viewingLoan.loanNo} -{" "}
                        {viewingLoan.clientId.firstName}{" "}
                        {viewingLoan.clientId.lastName}
                      </Text>
                    </View>
                  )}

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Principal Amount *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Enter principal amount"
                      placeholderTextColor={ZentyalColors.gray}
                      value={cyclePrincipal}
                      onChangeText={setCyclePrincipal}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Interest Rate (%) *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Enter interest rate"
                      placeholderTextColor={ZentyalColors.gray}
                      value={cycleInterestRate}
                      onChangeText={setCycleInterestRate}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Due Date *</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowCycleDatePicker(true)}
                    >
                      <Text
                        style={[
                          styles.datePickerText,
                          !cycleDateDue && { color: ZentyalColors.gray },
                        ]}
                      >
                        {cycleDateDue
                          ? formatDate(cycleDateDue)
                          : "Select due date"}
                      </Text>
                      <Ionicons
                        name="calendar"
                        size={20}
                        color={ZentyalColors.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  {cyclePrincipal && cycleInterestRate && (
                    <View style={styles.infoBox}>
                      <View style={styles.calculatedInfoRow}>
                        <Text style={styles.calculatedLabel}>
                          Interest Amount:
                        </Text>
                        <Text style={styles.calculatedValue}>
                          {formatCurrency(
                            (parseFloat(cyclePrincipal) *
                              parseFloat(cycleInterestRate)) /
                              100,
                          )}
                        </Text>
                      </View>
                      <View style={styles.calculatedInfoRow}>
                        <Text style={styles.calculatedLabel}>Total Due:</Text>
                        <Text
                          style={[
                            styles.calculatedValue,
                            styles.highlightValue,
                          ]}
                        >
                          {formatCurrency(
                            parseFloat(cyclePrincipal) +
                              (parseFloat(cyclePrincipal) *
                                parseFloat(cycleInterestRate)) /
                                100,
                          )}
                        </Text>
                      </View>
                    </View>
                  )}

                  {showCycleDatePicker && (
                    <DateTimePicker
                      value={cycleDateDue ? new Date(cycleDateDue) : new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        setShowCycleDatePicker(false);
                        if (selectedDate) {
                          setCycleDateDue(selectedDate.toISOString());
                        }
                      }}
                    />
                  )}
                </ScrollView>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setAddCycleModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={handleCreateCycle}
                  >
                    <Text style={styles.modalSaveButtonText}>Create Cycle</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Cycle Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editCycleModalVisible}
        onRequestClose={() => setEditCycleModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlayTouchable}
            onPress={() => setEditCycleModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.formModalWrapper}
            >
              <View style={styles.formModalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Cycle Due Date</Text>
                  <TouchableOpacity
                    onPress={() => setEditCycleModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={ZentyalColors.dark}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  {editingCycle && (
                    <View
                      style={[styles.infoBox, { flexDirection: "row", gap: 8 }]}
                    >
                      <Ionicons
                        name="information-circle"
                        size={20}
                        color={ZentyalColors.info}
                      />
                      <Text style={styles.infoText}>
                        Editing Cycle {editingCycle.cycleCount} - Only the due
                        date can be modified
                      </Text>
                    </View>
                  )}

                  {editingCycle && (
                    <View>
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>
                          Current Details (Read-only)
                        </Text>
                        <View
                          style={[
                            styles.formInput,
                            { backgroundColor: ZentyalColors.gray + "10" },
                          ]}
                        >
                          <Text style={{ color: ZentyalColors.gray }}>
                            Principal: {formatCurrency(editingCycle.principal)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.formInput,
                            {
                              backgroundColor: ZentyalColors.gray + "10",
                              marginTop: 8,
                            },
                          ]}
                        >
                          <Text style={{ color: ZentyalColors.gray }}>
                            Interest Rate: {editingCycle.interestRate}%
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.formInput,
                            {
                              backgroundColor: ZentyalColors.gray + "10",
                              marginTop: 8,
                            },
                          ]}
                        >
                          <Text style={{ color: ZentyalColors.gray }}>
                            Total Due: {formatCurrency(editingCycle.totalDue)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>
                          Due Date{" "}
                          <Text style={{ color: ZentyalColors.danger }}>*</Text>
                        </Text>
                        <TouchableOpacity
                          style={styles.datePickerButton}
                          onPress={() => setShowEditCycleDatePicker(true)}
                        >
                          <Text
                            style={[
                              styles.datePickerText,
                              !editCycleDateDue && {
                                color: ZentyalColors.gray,
                              },
                            ]}
                          >
                            {editCycleDateDue
                              ? formatDate(editCycleDateDue)
                              : "Select due date"}
                          </Text>
                          <Ionicons
                            name="calendar"
                            size={20}
                            color={ZentyalColors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {showEditCycleDatePicker && (
                    <DateTimePicker
                      value={
                        editCycleDateDue
                          ? new Date(editCycleDateDue)
                          : new Date()
                      }
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        setShowEditCycleDatePicker(false);
                        if (selectedDate) {
                          setEditCycleDateDue(selectedDate.toISOString());
                        }
                      }}
                    />
                  )}
                </ScrollView>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setEditCycleModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={handleUpdateCycle}
                  >
                    <Text style={styles.modalSaveButtonText}>
                      Update Due Date
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: ZentyalColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: ZentyalColors.gray,
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
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: ZentyalColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  loanCard: {
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
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.gray + "20",
  },
  loanNo: {
    fontSize: 16,
    fontWeight: "bold",
    color: ZentyalColors.primary,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: ZentyalColors.dark,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  loanDetails: {
    gap: 8,
    marginBottom: 12,
  },
  loanDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loanDetailLabel: {
    fontSize: 13,
    color: ZentyalColors.gray,
  },
  loanDetailValue: {
    fontSize: 13,
    color: ZentyalColors.dark,
    fontWeight: "600",
  },
  loanActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ZentyalColors.gray + "20",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: ZentyalColors.primary + "15",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.primary,
  },
  deleteButton: {
    backgroundColor: ZentyalColors.danger + "15",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.danger,
  },
  viewButton: {
    backgroundColor: ZentyalColors.info + "15",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.info,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deleteModalWrapper: {
    width: "100%",
    maxWidth: 500,
  },
  formModalWrapper: {
    width: "100%",
    maxWidth: 600,
  },
  formModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalContent: {
    padding: 20,
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.gray + "20",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ZentyalColors.dark,
  },
  addCycleButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.gray + "20",
  },
  addCycleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: ZentyalColors.primary,
    borderRadius: 12,
  },
  addCycleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  infoBox: {
    backgroundColor: ZentyalColors.info + "10",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: ZentyalColors.dark,
    lineHeight: 18,
  },
  calculatedInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  calculatedLabel: {
    fontSize: 14,
    color: ZentyalColors.dark,
    fontWeight: "500",
  },
  calculatedValue: {
    fontSize: 14,
    color: ZentyalColors.dark,
    fontWeight: "600",
  },
  modalContent: {
    padding: 20,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: ZentyalColors.gray + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: ZentyalColors.dark,
    backgroundColor: ZentyalColors.light,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: ZentyalColors.gray + "40",
    borderRadius: 12,
    backgroundColor: ZentyalColors.light,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: ZentyalColors.dark,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: ZentyalColors.gray + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: ZentyalColors.light,
  },
  datePickerText: {
    fontSize: 16,
    color: ZentyalColors.dark,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: ZentyalColors.gray + "20",
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
  modalSaveButton: {
    backgroundColor: ZentyalColors.primary,
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalDeleteButton: {
    backgroundColor: ZentyalColors.danger,
  },
  modalDeleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deleteWarning: {
    alignItems: "center",
    marginBottom: 24,
  },
  deleteWarningTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  deleteWarningText: {
    fontSize: 14,
    color: ZentyalColors.gray,
    textAlign: "center",
  },
  // Cycles Modal Styles
  cyclesModalWrapper: {
    width: "100%",
    maxWidth: 700,
  },
  cyclesModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: "90%",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: ZentyalColors.gray,
    marginTop: 4,
  },
  cyclesModalContent: {
    padding: 20,
    maxHeight: 500,
  },
  cyclesModalContentContainer: {
    padding: 20,
  },
  cyclesLoadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyCyclesContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  cyclesListContainer: {
    flexDirection: "column",
  },
  cycleCard: {
    backgroundColor: ZentyalColors.light,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: ZentyalColors.gray + "20",
    marginBottom: 12,
  },
  cycleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: ZentyalColors.gray + "20",
  },
  cycleCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: ZentyalColors.dark,
  },
  cycleDetails: {
    gap: 8,
    marginBottom: 8,
  },
  cycleActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ZentyalColors.gray + "20",
  },
  cycleActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  highlightValue: {
    fontWeight: "bold",
    color: ZentyalColors.primary,
  },
  warningValue: {
    color: ZentyalColors.danger,
    fontWeight: "bold",
  },
  cyclesModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: ZentyalColors.gray + "20",
  },
  modalCloseButton: {
    backgroundColor: ZentyalColors.light,
    borderWidth: 1,
    borderColor: ZentyalColors.gray + "40",
  },
});
