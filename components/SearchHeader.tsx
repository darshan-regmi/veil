import React, { memo, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  FONTS,
  SPACING,
  DIMENSIONS,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface SearchHeaderProps {
  value: string;
  onChangeText: (text: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const SearchHeader = memo(
  function SearchHeader({
    value,
    onChangeText,
    isFocused,
    onFocus,
    onBlur,
  }: SearchHeaderProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    const inputRef = useRef<TextInput>(null);
    const borderAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(borderAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }, [isFocused, borderAnim]);

    // Re-create interpolation when palette changes so dark mode picks up new
    // hairline/accent colors immediately.
    const borderColor = useMemo(
      () =>
        borderAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.hairline, colors.accent],
        }),
      [borderAnim, colors.hairline, colors.accent]
    );
    const borderWidth = useMemo(
      () =>
        borderAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2],
        }),
      [borderAnim]
    );

    const handleClear = useCallback(() => {
      onChangeText("");
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }, [onChangeText]);

    return (
      <Animated.View
        style={[
          styles.container,
          { borderBottomColor: borderColor, borderBottomWidth: borderWidth },
        ]}
      >
        <Feather
          name="search"
          size={DIMENSIONS.searchIconSize}
          color={isFocused ? colors.ink : colors.meta}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search poems"
          placeholderTextColor={colors.metaLight}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
          accessible
          accessibilityLabel="Search poems"
        />
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => [pressed && styles.clearPressed]}
            accessible
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Feather name="x" size={18} color={colors.meta} />
          </Pressable>
        )}
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.value === next.value && prev.isFocused === next.isFocused
);

export default SearchHeader;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 0,
      paddingVertical: SPACING.md,
      marginHorizontal: SPACING.xl,
      marginTop: SPACING.sm,
      marginBottom: SPACING.lg,
      gap: SPACING.md,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: FONTS.regular,
      color: colors.ink,
      paddingVertical: 0,
      fontWeight: "400",
      textAlignVertical: "center",
      includeFontPadding: false,
    },
    clearPressed: {
      opacity: 0.5,
    },
  });
