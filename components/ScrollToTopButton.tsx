import React, { memo, useRef, useEffect, useMemo } from "react";
import { Text, StyleSheet, Platform, Animated, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FONTS, SPACING, RADIUS, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const ScrollToTopButton = memo(function ScrollToTopButton({
  onPress,
  bottomInset,
}: {
  onPress: () => void;
  bottomInset: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomInset + 24,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Scroll to top"
      >
        <Feather name="arrow-up" size={14} color={colors.onInk} />
        <Text style={styles.label}>TOP</Text>
      </Pressable>
    </Animated.View>
  );
});

export default ScrollToTopButton;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      alignSelf: "center",
      zIndex: 100,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: colors.ink,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: RADIUS.full,
      ...Platform.select({
        ios: {
          shadowColor: "#0A0A0A",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
        },
        android: { elevation: 6 },
      }),
    },
    pillPressed: {
      opacity: 0.85,
    },
    label: {
      fontFamily: FONTS.bold,
      fontSize: 12,
      fontWeight: "700",
      color: colors.onInk,
      letterSpacing: 0.8,
    },
  });
