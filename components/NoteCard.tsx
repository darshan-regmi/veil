import React, { useCallback, useMemo, useRef, useEffect, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Share,
  Alert,
  Platform,
  Animated,
  Pressable,
  ActionSheetIOS,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  FONTS,
  SPACING,
  RADIUS,
  DIMENSIONS,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { PoemNote } from "@/utils/storage";

interface NoteCardProps {
  note: PoemNote;
  onPress?: () => void;
  onShare?: (note: PoemNote) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const PREVIEW_LENGTH = 180;
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
};

const getPreviewText = (content: string): string => {
  if (!content) return "";
  const cleaned = content.trim();
  if (cleaned.length <= PREVIEW_LENGTH) return cleaned;
  const truncated = cleaned.slice(0, PREVIEW_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  return truncated.slice(0, lastSpace > 0 ? lastSpace : PREVIEW_LENGTH).trimEnd() + "…";
};

const wordCount = (content: string): number =>
  content.trim().split(/\s+/).filter(Boolean).length;

const readingMinutes = (words: number): number =>
  Math.max(1, Math.ceil(words / 200));

const NoteCard = memo(function NoteCard({
  note,
  onPress,
  onShare,
  isFavorite = false,
  onToggleFavorite,
}: NoteCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const formattedDate = useMemo(() => formatDate(note.createdAt), [note.createdAt]);
  const previewText = useMemo(() => getPreviewText(note.content), [note.content]);
  const words = useMemo(() => wordCount(note.content), [note.content]);
  const minutes = useMemo(() => readingMinutes(words), [words]);

  const metaLine = [
    formattedDate,
    `${words} words`,
    `${minutes} min`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  const handleShare = useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const result = await Share.share(
        {
          message: `${note.title}\n\n${note.content}\n\n— Veil`,
          title: note.title,
        },
        { dialogTitle: `Share "${note.title}"` }
      );
      if (result.action === Share.sharedAction && onShare) onShare(note);
    } catch {
      if (Platform.OS === "ios") {
        Alert.alert("Share Failed", "Unable to share this poem.");
      }
    }
  }, [note, onShare]);

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(note.content);
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Copied", "Poem copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy poem");
    }
  }, [note.content]);

  const handleToggleFavorite = useCallback(() => {
    if (!onToggleFavorite) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleFavorite(note.id);
  }, [note.id, onToggleFavorite]);

  const showActionSheet = useCallback(() => {
    const favoriteLabel = isFavorite ? "Remove from favorites" : "Add to favorites";
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", favoriteLabel, "Copy poem", "Share poem"],
          cancelButtonIndex: 0,
          title: note.title,
        },
        (i) => {
          if (i === 1) handleToggleFavorite();
          else if (i === 2) handleCopy();
          else if (i === 3) handleShare();
        }
      );
    } else {
      Alert.alert(note.title, undefined, [
        { text: favoriteLabel, onPress: handleToggleFavorite },
        { text: "Copy poem", onPress: handleCopy },
        { text: "Share poem", onPress: handleShare },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }, [note.title, isFavorite, handleToggleFavorite, handleCopy, handleShare]);

  const handleCardPress = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  }, [onPress]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.985,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        style={styles.container}
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={showActionSheet}
        delayLongPress={350}
        android_ripple={{ color: colors.ripple, borderless: false }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Poem: ${note.title}`}
      >
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {note.title}
        </Text>

        <View style={styles.accentRule} />

        <Text style={styles.meta}>{metaLine}</Text>

        <Text style={styles.preview} numberOfLines={3} ellipsizeMode="tail">
          {previewText}
        </Text>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Pressable
            onPress={handleToggleFavorite}
            hitSlop={HIT_SLOP}
            style={styles.bookmarkButton}
            accessible
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Feather
              name="bookmark"
              size={16}
              color={isFavorite ? colors.accent : colors.metaLight}
            />
          </Pressable>
          <Text style={styles.cta}>READ</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

export default NoteCard;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardWrapper: {
      marginBottom: SPACING.md,
      marginHorizontal: SPACING.xl,
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.hairline,
      padding: SPACING["2xl"],
      overflow: "hidden",
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: 22,
      fontWeight: "700",
      lineHeight: 28,
      letterSpacing: -0.3,
      color: colors.ink,
    },
    accentRule: {
      width: DIMENSIONS.accentRuleWidth,
      height: DIMENSIONS.accentRuleHeight,
      backgroundColor: colors.accent,
      marginTop: 10,
      marginBottom: 14,
    },
    meta: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.meta,
      fontWeight: "400",
    },
    preview: {
      fontFamily: FONTS.italic,
      fontSize: 15,
      lineHeight: 24,
      color: colors.inkSecondary,
      marginTop: 14,
      fontWeight: "400",
    },
    divider: {
      height: 1,
      backgroundColor: colors.hairline,
      marginTop: SPACING.xl,
      marginBottom: SPACING.md,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    bookmarkButton: {
      padding: 2,
    },
    cta: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.5,
      color: colors.ink,
    },
  });
