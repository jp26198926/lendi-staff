/**
 * Clients Screen
 * List and manage clients with CRUD operations
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

// Client interface
interface Client {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  status: "ACTIVE" | "DELETED";
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

export default function ClientsScreen() {
  const { user, hasPermission } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const PAGE_PATH = "/admin/client";

  /**
   * Check permissions
   */
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!hasPermission(PAGE_PATH, "Access")) {
      Alert.alert("Access Denied", "You don't have permission to access this page", [
        { text: "OK", onPress: () => router.back() }
      ]);
      return;
    }
    fetchClients();
  }, [user]);

  /**
   * Fetch clients from backend
   */
  async function fetchClients() {
    try {
      const response = await apiRequest<Client[]>("/api/admin/client");
      setClients(response);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load clients",
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
    await fetchClients();
    setRefreshing(false);
  }

  /**
   * Open add modal
   */
  function handleAdd() {
    if (!hasPermission(PAGE_PATH, "Add")) {
      Alert.alert("Access Denied", "You don't have permission to create clients");
      return;
    }
    setEditingClient(null);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setModalVisible(true);
  }

  /**
   * Open edit modal
   */
  function handleEdit(client: Client) {
    if (!hasPermission(PAGE_PATH, "Edit")) {
      Alert.alert("Access Denied", "You don't have permission to edit clients");
      return;
    }
    setEditingClient(client);
    setFirstName(client.firstName);
    setMiddleName(client.middleName || "");
    setLastName(client.lastName);
    setPhone(client.phone);
    setEmail(client.email);
    setAddress(client.address);
    setModalVisible(true);
  }

  /**
   * Handle delete
   */
  function handleDelete(client: Client) {
    if (!hasPermission(PAGE_PATH, "Delete")) {
      Alert.alert("Access Denied", "You don't have permission to delete clients");
      return;
    }

    setDeletingClient(client);
    setDeleteReason("");
    setDeleteModalVisible(true);
  }

  /**
   * Process delete
   */
  async function processDelete() {
    if (!deletingClient) return;

    if (!deleteReason.trim()) {
      Alert.alert("Error", "Deletion reason is required");
      return;
    }

    try {
      setLoading(true);
      setDeleteModalVisible(false);
      
      await apiRequest(`/api/admin/client/${deletingClient._id}`, {
        method: "DELETE",
        body: JSON.stringify({ reason: deleteReason }),
      });
      
      Alert.alert("Success", "Client deleted successfully");
      setDeletingClient(null);
      setDeleteReason("");
      await fetchClients();
    } catch (error) {
      Alert.alert(
        "Delete Failed",
        error instanceof Error ? error.message : "Failed to delete client",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save client (create or update)
   */
  async function handleSave() {
    // Validate
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setModalVisible(false);

      const clientData = {
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      };

      if (editingClient) {
        // Update
        await apiRequest(`/api/admin/client/${editingClient._id}`, {
          method: "PUT",
          body: JSON.stringify(clientData),
        });
        Alert.alert("Success", "Client updated successfully");
      } else {
        // Create
        await apiRequest("/api/admin/client", {
          method: "POST",
          body: JSON.stringify(clientData),
        });
        Alert.alert("Success", "Client created successfully");
      }

      await fetchClients();
    } catch (error) {
      Alert.alert(
        "Save Failed",
        error instanceof Error ? error.message : "Failed to save client",
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

  if (loading && clients.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZentyalColors.primary} />
        <Text style={styles.loadingText}>Loading clients...</Text>
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
        <Text style={styles.headerTitle}>Clients</Text>
        {hasPermission(PAGE_PATH, "Add") && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
          >
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
            <Text style={styles.statValue}>{clients.filter(c => c.status === "ACTIVE").length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{clients.filter(c => c.status === "DELETED").length}</Text>
            <Text style={styles.statLabel}>Deleted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{clients.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Client List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Clients ({clients.length})</Text>

          {clients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={64}
                color={ZentyalColors.gray}
              />
              <Text style={styles.emptyText}>No clients found</Text>
              {hasPermission(PAGE_PATH, "Add") && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={handleAdd}
                >
                  <Text style={styles.emptyButtonText}>Add First Client</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            clients.map((client) => (
              <View key={client._id} style={styles.clientCard}>
                <View style={styles.clientHeader}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientAvatarText}>
                      {client.firstName[0]}{client.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>
                      {client.firstName} {client.middleName ? client.middleName + " " : ""}{client.lastName}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            client.status === "ACTIVE"
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
                              client.status === "ACTIVE"
                                ? ZentyalColors.success
                                : ZentyalColors.gray,
                          },
                        ]}
                      >
                        {client.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.clientDetails}>
                  <View style={styles.clientDetail}>
                    <Ionicons
                      name="mail-outline"
                      size={14}
                      color={ZentyalColors.gray}
                    />
                    <Text style={styles.clientDetailText}>{client.email}</Text>
                  </View>
                  <View style={styles.clientDetail}>
                    <Ionicons
                      name="call-outline"
                      size={14}
                      color={ZentyalColors.gray}
                    />
                    <Text style={styles.clientDetailText}>{client.phone}</Text>
                  </View>
                  <View style={styles.clientDetail}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={ZentyalColors.gray}
                    />
                    <Text style={styles.clientDetailText}>{client.address}</Text>
                  </View>
                  <View style={styles.clientDetail}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={ZentyalColors.gray}
                    />
                    <Text style={styles.clientDetailText}>
                      Created: {formatDate(client.createdAt)}
                    </Text>
                  </View>
                </View>

                {client.status === "ACTIVE" && (
                  <View style={styles.clientActions}>
                    {hasPermission(PAGE_PATH, "Edit") && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEdit(client)}
                      >
                        <Ionicons name="create-outline" size={18} color={ZentyalColors.primary} />
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                    {hasPermission(PAGE_PATH, "Delete") && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(client)}
                      >
                        <Ionicons name="trash-outline" size={18} color={ZentyalColors.danger} />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
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
                    {editingClient ? "Edit Client" : "Add Client"}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={ZentyalColors.dark} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>First Name *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Enter first name"
                      placeholderTextColor={ZentyalColors.gray}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Middle Name</Text>
                    <TextInput
                      style={styles.formInput}
                      value={middleName}
                      onChangeText={setMiddleName}
                      placeholder="Enter middle name (optional)"
                      placeholderTextColor={ZentyalColors.gray}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Last Name *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Enter last name"
                      placeholderTextColor={ZentyalColors.gray}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Email *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter email address"
                      placeholderTextColor={ZentyalColors.gray}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Phone *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Enter phone number"
                      placeholderTextColor={ZentyalColors.gray}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Address *</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea]}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Enter address"
                      placeholderTextColor={ZentyalColors.gray}
                      multiline
                      numberOfLines={3}
                    />
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
                      {editingClient ? "Update" : "Create"}
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
                  <Text style={styles.modalTitle}>Delete Client</Text>
                  <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                    <Ionicons name="close" size={24} color={ZentyalColors.dark} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.deleteModalContent}>
                  <View style={styles.deleteWarning}>
                    <Ionicons name="warning" size={48} color={ZentyalColors.danger} />
                    <Text style={styles.deleteWarningTitle}>
                      Delete {deletingClient?.firstName} {deletingClient?.lastName}?
                    </Text>
                    <Text style={styles.deleteWarningText}>
                      This action cannot be undone. The client will be marked as deleted.
                    </Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Reason for Deletion *</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea]}
                      value={deleteReason}
                      onChangeText={setDeleteReason}
                      placeholder="Enter reason for deletion"
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
                    <Text style={styles.modalDeleteButtonText}>Delete</Text>
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
  clientCard: {
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
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ZentyalColors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clientAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: ZentyalColors.primary,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  clientDetails: {
    gap: 8,
    marginBottom: 12,
  },
  clientDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clientDetailText: {
    fontSize: 13,
    color: ZentyalColors.gray,
    flex: 1,
  },
  clientActions: {
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
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
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
});
