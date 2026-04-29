/**
 * Manage Screen
 * Menu for managing clients, loans, cycles, and payments
 */

import { ZentyalColors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ManageScreen() {
  const { hasPermission } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage</Text>
        <Text style={styles.headerSubtitle}>
          Manage clients, loans, cycles, and payments
        </Text>
      </View>

      {/* Management Menu */}
      <View style={styles.section}>
        <MenuItem
          icon="people"
          label="Clients"
          description="Manage client information"
          onPress={() => {
            if (hasPermission("/admin/client", "Access")) {
              router.push("/clients" as any);
            } else {
              Alert.alert("Access Denied", "You don't have permission to access this page");
            }
          }}
          color={ZentyalColors.primary}
        />

        <MenuItem
          icon="cash"
          label="Loans"
          description="Manage loan applications"
          onPress={() => Alert.alert("Loans", "Coming soon")}
          color={ZentyalColors.success}
        />

        <MenuItem
          icon="repeat"
          label="Cycles"
          description="Manage payment cycles"
          onPress={() => Alert.alert("Cycles", "Coming soon")}
          color={ZentyalColors.info}
        />

        <MenuItem
          icon="card"
          label="Payments"
          description="Manage payment records"
          onPress={() => Alert.alert("Payments", "Coming soon")}
          color={ZentyalColors.warning}
        />
      </View>
    </ScrollView>
  );
}

/**
 * Menu Item Component
 */
interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  color: string;
}

function MenuItem({ icon, label, description, onPress, color }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.menuIconContainer, { backgroundColor: color + "20" }]}
      >
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={ZentyalColors.gray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZentyalColors.light,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: ZentyalColors.dark,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: ZentyalColors.gray,
    lineHeight: 20,
  },
  section: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: ZentyalColors.dark,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: ZentyalColors.gray,
  },
});
