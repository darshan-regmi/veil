import { Platform, LayoutAnimation, StatusBar } from "react-native";

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceElevated: string;
  ink: string;
  inkSecondary: string;
  meta: string;
  metaLight: string;
  hairline: string;
  accent: string;
  accentSoft: string;
  success: string;
  error: string;
  overlay: string;
  ripple: string;
  onInk: string;
  white: string;
}

export const LIGHT_COLORS: ThemeColors = {
  bg: "#FFFFFF",
  surface: "#FAFAF9",
  surfaceElevated: "#F4F4F2",
  ink: "#0A0A0A",
  inkSecondary: "#3F3F3F",
  meta: "#6B6B6B",
  metaLight: "#9A9A9A",
  hairline: "#E5E5E5",
  accent: "#C84B31",
  accentSoft: "#FBE9E4",
  success: "#0F8C56",
  error: "#B83A2A",
  overlay: "rgba(10,10,10,0.55)",
  ripple: "rgba(10,10,10,0.06)",
  onInk: "#FFFFFF",
  white: "#FFFFFF",
};

export const DARK_COLORS: ThemeColors = {
  bg: "#0F0F10",
  surface: "#18181B",
  surfaceElevated: "#232327",
  ink: "#F0EDE6",
  inkSecondary: "#C5C0B8",
  meta: "#8E8985",
  metaLight: "#5C5856",
  hairline: "#2A2A2E",
  accent: "#E66B4D",
  accentSoft: "#3A1A12",
  success: "#4EBC85",
  error: "#E66B5C",
  overlay: "rgba(0,0,0,0.72)",
  ripple: "rgba(255,255,255,0.08)",
  onInk: "#0F0F10",
  white: "#FFFFFF",
};

export const FONTS = {
  regular: "LibreBaskerville-Regular",
  italic: "LibreBaskerville-Italic",
  bold: "LibreBaskerville-Bold",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const SHADOWS = {
  card: Platform.select({
    ios: {
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
    default: {},
  }),
  elevated: Platform.select({
    ios: {
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  modal: Platform.select({
    ios: {
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
    },
    android: { elevation: 12 },
    default: {},
  }),
} as const;

export const DIMENSIONS = {
  headerIconSize: 22,
  searchIconSize: 18,
  emptyIconSize: 56,
  headerHeight: 60,
  accentRuleWidth: 32,
  accentRuleHeight: 2,
} as const;

export const TIMING = {
  searchDebounce: 80,
  autoRefreshInterval: 300000,
  successMessageDuration: 2500,
  scrollTopThreshold: 600,
} as const;

export const FLATLIST_CONFIG = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 6,
  updateCellsBatchingPeriod: 50,
  windowSize: 9,
  removeClippedSubviews: Platform.OS === "android",
} as const;

export const ANIMATION_CONFIG = {
  layoutPreset: LayoutAnimation.Presets.easeInEaseOut,
} as const;

export const STATUSBAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;

export const READING_SIZES = {
  min: 16,
  max: 24,
  default: 18,
  step: 1,
} as const;

export const LINE_HEIGHTS = {
  compact: 1.4,
  standard: 1.6,
  relaxed: 1.85,
} as const;
