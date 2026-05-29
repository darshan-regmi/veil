import { useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { useFonts } from "expo-font";
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_400Regular_Italic,
  LibreBaskerville_700Bold,
} from "@expo-google-fonts/libre-baskerville";
import * as SplashScreen from "expo-splash-screen";
import {
  ThemeProvider,
  useTheme,
} from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ReadingSettingsProvider } from "@/contexts/ReadingSettingsContext";

SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("SplashScreen.preventAutoHideAsync error:", error);
});

function ThemedStack() {
  const { colors, effective } = useTheme();
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.select({
            ios: "default",
            android: "slide_from_right",
          }),
          contentStyle: {
            backgroundColor: colors.bg,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="poem/[id]"
          options={{
            headerShown: false,
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
      </Stack>
      <StatusBar style={effective === "dark" ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    "LibreBaskerville-Regular": LibreBaskerville_400Regular,
    "LibreBaskerville-Italic": LibreBaskerville_400Regular_Italic,
    "LibreBaskerville-Bold": LibreBaskerville_700Bold,
  });

  const hideSplashScreen = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (error) {
      console.warn("Error hiding splash screen:", error);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      hideSplashScreen();
    }
  }, [fontsLoaded, fontError, hideSplashScreen]);

  if (!fontsLoaded && !fontError) return null;
  if (fontError) console.error("Font loading error:", fontError);

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <ReadingSettingsProvider>
          <ThemedStack />
        </ReadingSettingsProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
