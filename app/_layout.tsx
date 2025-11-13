import { useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { useFonts } from "expo-font";
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from "@expo-google-fonts/libre-baskerville";
import * as SplashScreen from "expo-splash-screen";

/* ─── Prevent splash screen from auto-hiding ──────────────── */
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("SplashScreen.preventAutoHideAsync error:", error);
});

/* ─── Root Layout ─────────────────────────────────────────── */
export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    "LibreBaskerville-Regular": LibreBaskerville_400Regular,
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

  // Show nothing while fonts are loading
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Log font error but continue rendering
  if (fontError) {
    console.error("Font loading error:", fontError);
  }

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
            backgroundColor: "#FAF7F0",
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="poem/[id]"
          options={{
            headerShown: false,
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            title: "Not Found",
          }}
        />
      </Stack>
      <StatusBar style="dark" backgroundColor="#FAF7F0" />
    </>
  );
}
