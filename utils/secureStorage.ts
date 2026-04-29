/**
 * Cross-platform Secure Storage Utility
 * Uses SecureStore for native (iOS/Android) and AsyncStorage for web
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

/**
 * Save a key-value pair to secure storage
 */
export async function setItemAsync(
  key: string,
  value: string,
): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

/**
 * Retrieve a value from secure storage
 */
export async function getItemAsync(key: string): Promise<string | null> {
  if (isWeb) {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

/**
 * Delete a key from secure storage
 */
export async function deleteItemAsync(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}
