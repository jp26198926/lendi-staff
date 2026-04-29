/**
 * Tabs Layout
 * Main navigation for authenticated users
 */

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { ZentyalColors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { user, hasPermission } = useAuth();
  const isClient = user?.roleId === "client";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ZentyalColors.primary,
        tabBarInactiveTintColor: ZentyalColors.gray,
        headerShown: true,
        headerStyle: {
          backgroundColor: ZentyalColors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
      }}
    >
      {/* Dashboard Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Loans Tab */}
      <Tabs.Screen
        name="loans"
        options={{
          title: "Loans",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              size={24}
              color={color}
            />
          ),
          href: null, // Hide for now until implemented
        }}
      />

      {/* Clients Tab (Admin/Users only) */}
      {!isClient && hasPermission("/admin/client", "Access") && (
        <Tabs.Screen
          name="clients"
          options={{
            title: "Clients",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={24}
                color={color}
              />
            ),
            href: null, // Hide for now until implemented
          }}
        />
      )}

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hide Explore Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
