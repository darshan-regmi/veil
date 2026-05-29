import React, { memo, useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { RADIUS, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

const RandomPoemButton = memo(function RandomPoemButton({
  onPress,
  disabled,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handle = useCallback(() => {
    if (disabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [disabled, onPress]);

  return (
    <Pressable
      onPress={handle}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Open a random poem"
    >
      <Feather name="shuffle" size={18} color={colors.ink} />
    </Pressable>
  );
});

export default RandomPoemButton;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      width: 38,
      height: 38,
      borderRadius: RADIUS.full,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    pressed: {
      backgroundColor: colors.surfaceElevated,
    },
    disabled: {
      opacity: 0.4,
    },
  });
