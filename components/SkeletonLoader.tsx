import React, { memo, useRef, useEffect, useMemo } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { SPACING, RADIUS, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const SkeletonCard = memo(function SkeletonCard({
  pulseAnim,
}: {
  pulseAnim: Animated.Value;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
      <View style={styles.titleLong} />
      <View style={styles.titleShort} />
      <View style={styles.rule} />
      <View style={styles.meta} />
      <View style={styles.previewLine} />
      <View style={styles.previewLine} />
      <View style={styles.previewLineShort} />
      <View style={styles.divider} />
      <View style={styles.footer}>
        <View style={styles.bookmark} />
        <View style={styles.cta} />
      </View>
    </Animated.View>
  );
});

const SkeletonLoader = memo(function SkeletonLoader() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <>
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} pulseAnim={pulseAnim} />
      ))}
    </>
  );
});

export default SkeletonLoader;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING["2xl"],
      borderWidth: 1,
      borderColor: colors.hairline,
      marginBottom: SPACING.md,
      marginHorizontal: SPACING.xl,
    },
    titleLong: {
      height: 22,
      backgroundColor: colors.hairline,
      borderRadius: 4,
      width: "75%",
      marginBottom: 8,
    },
    titleShort: {
      height: 22,
      backgroundColor: colors.hairline,
      borderRadius: 4,
      width: "55%",
    },
    rule: {
      height: 2,
      width: 32,
      backgroundColor: colors.accent,
      marginTop: 10,
      marginBottom: 14,
      opacity: 0.5,
    },
    meta: {
      height: 12,
      backgroundColor: colors.hairline,
      borderRadius: 3,
      width: "45%",
      marginBottom: 14,
    },
    previewLine: {
      height: 14,
      backgroundColor: colors.hairline,
      borderRadius: 3,
      marginBottom: 8,
    },
    previewLineShort: {
      height: 14,
      backgroundColor: colors.hairline,
      borderRadius: 3,
      width: "65%",
    },
    divider: {
      height: 1,
      backgroundColor: colors.hairline,
      marginTop: SPACING.xl,
      marginBottom: SPACING.md,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    bookmark: {
      width: 16,
      height: 16,
      borderRadius: 2,
      backgroundColor: colors.hairline,
    },
    cta: {
      width: 40,
      height: 12,
      borderRadius: 3,
      backgroundColor: colors.hairline,
    },
  });
