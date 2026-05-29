import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FONTS,
  SPACING,
  RADIUS,
  READING_SIZES,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useReadingSettings,
  type LineHeightKey,
} from "@/contexts/ReadingSettingsContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LINE_HEIGHT_OPTIONS: { key: LineHeightKey; label: string }[] = [
  { key: "compact", label: "Compact" },
  { key: "standard", label: "Standard" },
  { key: "relaxed", label: "Relaxed" },
];

const StepperButton = ({
  icon,
  onPress,
  disabled,
  colors,
  styles,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  disabled: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.stepBtn,
      pressed && !disabled && styles.stepBtnPressed,
      disabled && styles.stepBtnDisabled,
    ]}
    hitSlop={8}
  >
    <Feather name={icon} size={18} color={disabled ? colors.metaLight : colors.ink} />
  </Pressable>
);

const ReadingSettingsSheet = memo(function ReadingSettingsSheet({
  visible,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const {
    fontSize,
    lineHeight,
    readerMode,
    incrementFontSize,
    decrementFontSize,
    setLineHeight,
    setReaderMode,
  } = useReadingSettings();

  const translateY = useRef(new Animated.Value(400)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 400,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, overlayOpacity]);

  const handleStep = useCallback(
    (direction: "up" | "down") => {
      if (Platform.OS !== "web") {
        Haptics.selectionAsync();
      }
      direction === "up" ? incrementFontSize() : decrementFontSize();
    },
    [incrementFontSize, decrementFontSize]
  );

  const handleLineHeight = useCallback(
    (k: LineHeightKey) => {
      if (Platform.OS !== "web") {
        Haptics.selectionAsync();
      }
      setLineHeight(k);
    },
    [setLineHeight]
  );

  const handleReaderMode = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setReaderMode(!readerMode);
  }, [readerMode, setReaderMode]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
      >
        <View style={styles.handle} />

        <Text style={styles.eyebrow}>READING</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Text size</Text>
          <View style={styles.stepperRow}>
            <StepperButton
              icon="minus"
              onPress={() => handleStep("down")}
              disabled={fontSize <= READING_SIZES.min}
              colors={colors}
              styles={styles}
            />
            <View style={styles.previewWrap}>
              <Text style={[styles.preview, { fontSize }]}>Aa</Text>
              <Text style={styles.previewCaption}>{fontSize}pt</Text>
            </View>
            <StepperButton
              icon="plus"
              onPress={() => handleStep("up")}
              disabled={fontSize >= READING_SIZES.max}
              colors={colors}
              styles={styles}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Line spacing</Text>
          <View style={styles.segmented}>
            {LINE_HEIGHT_OPTIONS.map((opt, i) => {
              const active = lineHeight === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => handleLineHeight(opt.key)}
                  style={({ pressed }) => [
                    styles.segment,
                    i !== 0 && styles.segmentBorder,
                    active && styles.segmentActive,
                    pressed && !active && styles.segmentPressed,
                  ]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleReaderMode}
          style={({ pressed }) => [styles.toggleRow, pressed && { opacity: 0.7 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Reader Mode</Text>
            <Text style={styles.toggleHint}>
              Tap the poem to hide the chrome and immerse yourself.
            </Text>
          </View>
          <View style={[styles.toggle, readerMode && styles.toggleOn]}>
            <View style={[styles.toggleDot, readerMode && styles.toggleDotOn]} />
          </View>
        </Pressable>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.doneBtn, pressed && styles.doneBtnPressed]}
          android_ripple={{ color: "rgba(255,255,255,0.18)", borderless: false }}
        >
          <Text style={styles.doneBtnText}>DONE</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
});

export default ReadingSettingsSheet;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
    },
    sheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.bg,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      paddingHorizontal: SPACING["2xl"],
      paddingTop: SPACING.md,
    },
    handle: {
      alignSelf: "center",
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.hairline,
      marginBottom: SPACING.lg,
    },
    eyebrow: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: colors.meta,
      marginBottom: SPACING.lg,
    },
    section: {
      marginBottom: SPACING["2xl"],
    },
    label: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      fontWeight: "700",
      color: colors.ink,
      marginBottom: SPACING.md,
      letterSpacing: -0.2,
    },
    stepperRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SPACING.lg,
    },
    stepBtn: {
      width: 56,
      height: 48,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.hairline,
      alignItems: "center",
      justifyContent: "center",
    },
    stepBtnPressed: {
      backgroundColor: colors.surfaceElevated,
    },
    stepBtnDisabled: {
      opacity: 0.5,
    },
    previewWrap: {
      flex: 1,
      alignItems: "center",
    },
    preview: {
      fontFamily: FONTS.bold,
      fontWeight: "700",
      color: colors.ink,
      lineHeight: 36,
    },
    previewCaption: {
      fontFamily: FONTS.regular,
      fontSize: 11,
      color: colors.meta,
      letterSpacing: 0.6,
      marginTop: 2,
      fontWeight: "400",
    },
    segmented: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: colors.hairline,
      borderRadius: RADIUS.md,
      overflow: "hidden",
    },
    segment: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
    },
    segmentBorder: {
      borderLeftWidth: 1,
      borderLeftColor: colors.hairline,
    },
    segmentActive: {
      backgroundColor: colors.ink,
    },
    segmentPressed: {
      backgroundColor: colors.surfaceElevated,
    },
    segmentText: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.ink,
      fontWeight: "400",
    },
    segmentTextActive: {
      color: colors.onInk,
      fontFamily: FONTS.bold,
      fontWeight: "700",
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.lg,
      paddingVertical: SPACING.md,
      marginBottom: SPACING.lg,
    },
    toggleHint: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.meta,
      fontWeight: "400",
      marginTop: 2,
      lineHeight: 18,
    },
    toggle: {
      width: 44,
      height: 26,
      borderRadius: RADIUS.full,
      backgroundColor: colors.hairline,
      padding: 3,
      justifyContent: "center",
    },
    toggleOn: {
      backgroundColor: colors.accent,
    },
    toggleDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.white,
    },
    toggleDotOn: {
      transform: [{ translateX: 18 }],
    },
    doneBtn: {
      backgroundColor: colors.ink,
      paddingVertical: 14,
      borderRadius: RADIUS.md,
      alignItems: "center",
    },
    doneBtnPressed: {
      opacity: 0.85,
    },
    doneBtnText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.onInk,
      fontWeight: "700",
      letterSpacing: 0.8,
    },
  });
