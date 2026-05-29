import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { FONTS, SPACING, RADIUS, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found", headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Feather name="book-open" size={56} color={colors.metaLight} />
          <View style={styles.rule} />
        </View>

        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.body}>
          The page you're looking for doesn't exist or has been moved.
        </Text>

        <Link href="/" asChild>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go to library"
          >
            <Feather name="arrow-left" size={15} color={colors.onInk} />
            <Text style={styles.buttonText}>BACK TO LIBRARY</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      alignItems: "center",
      justifyContent: "center",
      padding: SPACING["3xl"],
    },
    iconWrap: {
      alignItems: "center",
    },
    rule: {
      width: 28,
      height: 2,
      backgroundColor: colors.accent,
      marginTop: SPACING.lg,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: 28,
      color: colors.ink,
      marginTop: SPACING.xl,
      marginBottom: SPACING.md,
      textAlign: "center",
      fontWeight: "700",
      letterSpacing: -0.4,
    },
    body: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.meta,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: SPACING["3xl"],
      fontWeight: "400",
      maxWidth: 280,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
      backgroundColor: colors.ink,
      paddingHorizontal: SPACING.xl,
      paddingVertical: 14,
      borderRadius: RADIUS.md,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.onInk,
      fontWeight: "700",
      letterSpacing: 0.8,
    },
  });
