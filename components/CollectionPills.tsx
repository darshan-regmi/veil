import React, { memo, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { FONTS, SPACING, RADIUS, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const Pill = memo(function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && !active && styles.pillPressed,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
});

interface Props {
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}

const CollectionPills = memo(function CollectionPills({
  tags,
  selected,
  onSelect,
}: Props) {
  const handleSelect = useCallback(
    (tag: string | null) => {
      if (Platform.OS !== "web") {
        Haptics.selectionAsync();
      }
      onSelect(tag);
    },
    [onSelect]
  );

  if (tags.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={containerStyles.row}
    >
      <Pill label="All" active={selected === null} onPress={() => handleSelect(null)} />
      {tags.map((tag) => (
        <Pill
          key={tag}
          label={tag}
          active={selected === tag}
          onPress={() => handleSelect(tag)}
        />
      ))}
    </ScrollView>
  );
});

export default CollectionPills;

const containerStyles = StyleSheet.create({
  row: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
});

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.hairline,
      backgroundColor: "transparent",
    },
    pillActive: {
      backgroundColor: colors.ink,
      borderColor: colors.ink,
    },
    pillPressed: {
      opacity: 0.55,
    },
    pillText: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.ink,
      fontWeight: "400",
    },
    pillTextActive: {
      color: colors.onInk,
    },
  });
