/**
 * LENDI App Theme Colors - Zentyal Brand
 *
 * Primary Brand Colors:
 * - Orange (#ff6f00) - Primary actions, CTAs, navigation
 * - Yellow-Green (#a4c639) - Accent color for highlights
 */

import { Platform } from "react-native";

/**
 * Zentyal Brand Colors
 * These colors match the backend lending application theme
 */
export const ZentyalColors = {
  dark: "#2d3748", // Dark gray/charcoal for text
  primary: "#ff6f00", // Primary orange (Zentyal brand color)
  accent: "#a4c639", // Yellow-green accent
  light: "#f5f7fa", // Light background
  gray: "#6b7280", // Medium gray
  success: "#28a745", // Green for success states
  warning: "#ffc107", // Yellow for warnings
  danger: "#dc3545", // Red for errors
  info: "#ff6f00", // Same as primary orange
};

/**
 * Theme-aware color definitions for light and dark modes
 */
export const Colors = {
  light: {
    text: ZentyalColors.dark,
    background: ZentyalColors.light,
    tint: ZentyalColors.primary,
    icon: ZentyalColors.gray,
    tabIconDefault: ZentyalColors.gray,
    tabIconSelected: ZentyalColors.primary,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: ZentyalColors.primary,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: ZentyalColors.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
