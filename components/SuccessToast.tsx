import React, { memo, useRef, useEffect, useMemo } from "react";
import { Text, StyleSheet, Platform, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FONTS, SPACING, RADIUS, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const SuccessToast = memo(function SuccessToast({
  visible,
  message,
  topInset,
}: {
  visible: boolean;
  message: string;
  topInset: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: topInset + 12, transform: [{ translateY }], opacity },
      ]}
    >
      <Feather name="check" size={16} color={colors.success} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

export default SuccessToast;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: SPACING.xl,
      right: SPACING.xl,
      backgroundColor: colors.bg,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      zIndex: 1000,
      borderWidth: 1,
      borderColor: colors.hairline,
      ...Platform.select({
        ios: {
          shadowColor: "#0A0A0A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: { elevation: 4 },
      }),
    },
    text: {
      fontFamily: FONTS.regular,
      fontSize: 14,
      color: colors.ink,
      flex: 1,
      fontWeight: "400",
    },
  });
