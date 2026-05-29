import React, { memo, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { FONTS, SPACING, RADIUS, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { PoemNote } from "@/utils/storage";

interface Props {
  poems: PoemNote[];
  onSelect: (poem: PoemNote) => void;
}

const RecentChip = memo(function RecentChip({
  poem,
  onPress,
}: {
  poem: PoemNote;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Resume reading ${poem.title}`}
    >
      <View style={styles.rule} />
      <Text style={styles.title} numberOfLines={2}>
        {poem.title}
      </Text>
    </Pressable>
  );
});

const RecentlyReadRow = memo(function RecentlyReadRow({ poems, onSelect }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handle = useCallback(
    (p: PoemNote) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onSelect(p);
    },
    [onSelect]
  );

  if (poems.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.eyebrow}>CONTINUE READING</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {poems.slice(0, 6).map((p) => (
          <RecentChip key={p.id} poem={p} onPress={() => handle(p)} />
        ))}
      </ScrollView>
    </View>
  );
});

export default RecentlyReadRow;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: SPACING.lg,
    },
    eyebrow: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: colors.meta,
      marginHorizontal: SPACING.xl,
      marginBottom: SPACING.md,
    },
    row: {
      paddingHorizontal: SPACING.xl,
      gap: SPACING.md,
    },
    chip: {
      width: 160,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.hairline,
      backgroundColor: colors.surface,
    },
    chipPressed: {
      opacity: 0.7,
    },
    rule: {
      width: 24,
      height: 2,
      backgroundColor: colors.accent,
      marginBottom: SPACING.md,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      fontWeight: "700",
      color: colors.ink,
      lineHeight: 20,
      letterSpacing: -0.2,
    },
  });
