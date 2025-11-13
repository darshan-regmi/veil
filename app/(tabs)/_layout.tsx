import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { BookOpen } from "lucide-react-native";

/* ─── Constants ───────────────────────────────────────────── */
const COLORS = {
  background: "#FAF7F0",
  border: "#E8E2D5",
  active: "#8B5A3C",
  inactive: "#A0A0A0",
} as const;

const TAB_BAR_HEIGHT = Platform.select({
  ios: 88,
  android: 64,
  default: 64,
});

const TAB_BAR_PADDING_BOTTOM = Platform.select({
  ios: 34, // Account for iOS home indicator
  android: 8,
  default: 8,
});

const ICON_SIZE = 24;

/* ─── Tab Layout ──────────────────────────────────────────── */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none",
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT,
          paddingBottom: TAB_BAR_PADDING_BOTTOM,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarLabelStyle: {
          fontFamily: "LibreBaskerville-Regular",
          fontSize: 12,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Library",
          tabBarIcon: ({ color, focused }) => (
            <BookOpen
              size={ICON_SIZE}
              color={color}
              strokeWidth={focused ? 2 : 1.5}
            />
          ),
          tabBarAccessibilityLabel: "View poem library",
        }}
      />
    </Tabs>
  );
}
