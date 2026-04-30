import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

import { ZentyalColors } from "@/constants/theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Configure Android navigation bar for immersive experience
    if (Platform.OS === "android") {
      // Make navigation bar translucent instead of hiding completely
      NavigationBar.setPositionAsync("absolute");
      NavigationBar.setBackgroundColorAsync("#00000001"); // Nearly transparent
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: ZentyalColors.primary,
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />

          <Stack.Screen
            name="clients"
            options={{ title: "Manage", headerShown: false }}
          />

          <Stack.Screen
            name="ledger"
            options={{ title: "User Ledger", headerShown: false }}
          />

          <Stack.Screen
            name="loans"
            options={{ title: "Loans", headerShown: false }}
          />

          <Stack.Screen
            name="transactions"
            options={{ title: "Transactions", headerShown: false }}
          />

          <Stack.Screen
            name="cycles"
            options={{ title: "Loan Cycles", headerShown: false }}
          />

          <Stack.Screen
            name="payments"
            options={{ title: "Payments", headerShown: false }}
          />
        </Stack>
        <StatusBar style="light" backgroundColor={ZentyalColors.primary} />
      </ThemeProvider>
    </AuthProvider>
  );
}
