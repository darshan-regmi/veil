import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FONTS } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const TAB_BAR_HEIGHT = Platform.select({
  ios: 88,
  android: 64,
  default: 64,
});

const TAB_BAR_PADDING_BOTTOM = Platform.select({
  ios: 34,
  android: 8,
  default: 8,
});

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none",
          backgroundColor: colors.bg,
          borderTopColor: colors.hairline,
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT,
          paddingBottom: TAB_BAR_PADDING_BOTTOM,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.meta,
        tabBarLabelStyle: {
          fontFamily: FONTS.regular,
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
            <Feather
              name="book-open"
              size={22}
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
