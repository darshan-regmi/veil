import React, { memo, useRef, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  FONTS,
  SPACING,
  DIMENSIONS,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const EmptyState = memo(function EmptyState({
  hasSearchQuery,
  variant = "library",
}: {
  hasSearchQuery?: boolean;
  variant?: "library" | "favorites" | "offline";
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  let icon: keyof typeof Feather.glyphMap = "book-open";
  let title = "No poems yet";
  let body = "";

  if (hasSearchQuery) {
    icon = "search";
    title = "Nothing matched";
    body = "Try different keywords or check your spelling.";
  } else if (variant === "favorites") {
    icon = "bookmark";
    title = "No favorites yet";
    body = "Tap the bookmark icon on any poem to save it here.";
  } else if (variant === "offline") {
    icon = "cloud-off";
    title = "You're offline";
    body = "Connect to load fresh poems. Cached ones still work.";
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.iconWrap}>
        <Feather name={icon} size={DIMENSIONS.emptyIconSize} color={colors.metaLight} />
        <View style={styles.rule} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </Animated.View>
  );
});

export default EmptyState;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SPACING["3xl"],
      paddingTop: SPACING["4xl"],
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
      fontSize: 15,
      color: colors.meta,
      textAlign: "center",
      lineHeight: 22,
      fontWeight: "400",
      maxWidth: 280,
    },
  });
