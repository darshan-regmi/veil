import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  FONTS,
  SPACING,
  RADIUS,
  DIMENSIONS,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const ErrorView = memo(function ErrorView({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Feather name="alert-circle" size={DIMENSIONS.emptyIconSize} color={colors.error} />
        <View style={styles.rule} />
      </View>
      <Text style={styles.title}>Couldn't load poems</Text>
      <Text style={styles.body}>{error}</Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onRetry}
        android_ripple={{ color: "rgba(255,255,255,0.18)", borderless: false }}
      >
        <Feather name="refresh-cw" size={15} color={colors.onInk} />
        <Text style={styles.buttonText}>TRY AGAIN</Text>
      </Pressable>
    </View>
  );
});

export default ErrorView;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SPACING["3xl"],
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
      fontSize: 22,
      fontWeight: "700",
      color: colors.ink,
      marginTop: SPACING.xl,
      marginBottom: SPACING.sm,
      textAlign: "center",
      letterSpacing: -0.3,
    },
    body: {
      fontFamily: FONTS.regular,
      fontSize: 14,
      color: colors.meta,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: SPACING["2xl"],
      fontWeight: "400",
      maxWidth: 280,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: colors.ink,
      paddingHorizontal: SPACING.xl,
      paddingVertical: 12,
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
      letterSpacing: 0.5,
    },
  });
