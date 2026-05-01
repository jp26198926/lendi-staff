/**
 * LENDI Logo Component
 * Simple icon-based logo using Ionicons - suitable for app icon
 */

import { ZentyalColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface LendiLogoProps {
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
}

export default function LendiLogo({
  size = 120,
  backgroundColor = ZentyalColors.primary,
  iconColor = "#fff",
}: LendiLogoProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.22, // 22% rounded corners for modern app icon look
          backgroundColor: backgroundColor,
        },
      ]}
    >
      <Ionicons name="wallet" size={size * 0.6} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
