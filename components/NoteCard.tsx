import React, { useCallback, useMemo, useRef, useEffect, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
  Animated,
  Pressable,
  ActionSheetIOS,
  Clipboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

/* ─── Types ───────────────────────────────────────────────── */
interface PoemNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

interface NoteCardProps {
  note: PoemNote;
  onPress?: () => void;
  onShare?: (note: PoemNote) => void;
  onLike?: (note: PoemNote) => void;
}

/* ─── Constants ───────────────────────────────────────────── */
const PREVIEW_LENGTH = 180;
const ICON_SIZE = { menu: 20, share: 18, heart: 18 };
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const COLORS = {
  background: "#FFFFFF",
  border: "#E8E2D5",
  borderHover: "#D4C8B5",
  title: "#2D2D2D",
  content: "#5D5D5D",
  date: "#757575",
  icon: "#A0A0A0",
  iconActive: "#8B5A3C",
  accent: "#E8DED0",
  heartActive: "#E57373",
  ripple: "rgba(139, 90, 60, 0.1)",
} as const;

const ANIMATION = {
  cardPress: { scale: 0.98, duration: 100 },
  iconPress: { scale: 0.85, duration: 150 },
  entrance: { duration: 300 },
} as const;

/* ─── Utilities ───────────────────────────────────────────── */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Show relative time for recent poems
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    // Show full date for older poems
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

const getPreviewText = (
  content: string,
  maxLength: number = PREVIEW_LENGTH
): string => {
  if (!content) return "No content";

  const cleaned = content.trim();

  if (cleaned.length <= maxLength) return cleaned;

  // Try to break at a sentence or word boundary
  const truncated = cleaned.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastPeriod > maxLength * 0.7) {
    return truncated.slice(0, lastPeriod + 1);
  }

  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated.trimEnd() + "...";
};

const getWordCount = (content: string): number => {
  return content.trim().split(/\s+/).filter(Boolean).length;
};

/* ─── Animated Icon Button Component ───────────────────────── */
const AnimatedIconButton = memo(function AnimatedIconButton({
  icon,
  size,
  color,
  onPress,
  accessibilityLabel,
}: {
  icon: string;
  size: number;
  color: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION.iconPress.scale,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={HIT_SLOP}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Feather
          name={icon as any}
          size={size}
          color={color}
          strokeWidth={1.8}
        />
      </TouchableOpacity>
    </Animated.View>
  );
});

/* ─── Main Note Card Component ───────────────────────────── */
const NoteCard = memo(function NoteCard({
  note,
  onPress,
  onShare,
  onLike,
}: NoteCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate card entrance
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION.entrance.duration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Memoize computed values
  const formattedDate = useMemo(
    () => formatDate(note.createdAt),
    [note.createdAt]
  );

  const previewText = useMemo(
    () => getPreviewText(note.content),
    [note.content]
  );

  const wordCount = useMemo(() => getWordCount(note.content), [note.content]);

  const handleShare = useCallback(async () => {
    try {
      // Haptic feedback
      if (Platform.OS === "ios") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (Platform.OS === "android") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const shareContent = `${note.title}\n\n${note.content}\n\n— Written on ${formattedDate}`;

      const result = await Share.share(
        {
          message: shareContent,
          title: note.title,
        },
        {
          dialogTitle: `Share "${note.title}"`,
        }
      );

      if (result.action === Share.sharedAction && onShare) {
        onShare(note);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (Platform.OS === "ios") {
        Alert.alert("Share Failed", "Unable to share this poem.");
      } else {
        console.error("Share error:", errorMessage);
      }
    }
  }, [note, formattedDate, onShare]);

  const handleLike = useCallback(async () => {
    setIsLiked((prev) => !prev);

    // Haptic feedback
    if (Platform.OS === "ios") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (Platform.OS === "android") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (onLike) {
      onLike(note);
    }
  }, [note, onLike]);

  const handleCopy = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(note.content);
      } else {
        await Clipboard.setStringAsync(note.content);
      }

      // Haptic feedback
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }

      Alert.alert("Copied", "Poem copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy poem");
    }
  }, [note.content]);

  const showActionSheet = useCallback(() => {
    if (Platform.OS === "ios") {
      // Native iOS Action Sheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Copy", "Share Poem"],
          cancelButtonIndex: 0,
          title: note.title,
          message: `${wordCount} words • ${formattedDate}`,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCopy();
          } else if (buttonIndex === 2) {
            handleShare();
          }
        }
      );
    } else {
      // Android/Web Alert
      Alert.alert(
        note.title,
        `${wordCount} words • ${formattedDate}`,
        [
          {
            text: "Copy",
            onPress: handleCopy,
          },
          {
            text: "Share Poem",
            onPress: handleShare,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    }
  }, [note.title, wordCount, formattedDate, handleShare, handleCopy]);

  const handleCardPress = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  }, [onPress]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION.cardPress.scale,
      friction: 5,
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
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.container,
          pressed && Platform.OS === "android" && styles.containerPressed,
        ]}
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{
          color: COLORS.ripple,
          borderless: false,
        }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Poem: ${note.title}`}
        accessibilityHint="Double tap to read full poem"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {note.title}
            </Text>
            <View style={styles.metaInfo}>
              <Feather name="clock" size={12} color={COLORS.date} />
              <Text style={styles.metaText}>{formattedDate}</Text>
              <View style={styles.metaDot} />
              <Feather name="file-text" size={12} color={COLORS.date} />
              <Text style={styles.metaText}>{wordCount} words</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.menuButtonPressed,
            ]}
            onPress={showActionSheet}
            hitSlop={HIT_SLOP}
            accessible
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather
              name="more-vertical"
              size={ICON_SIZE.menu}
              color={COLORS.icon}
              strokeWidth={1.8}
            />
          </Pressable>
        </View>

        {/* Content Preview */}
        <Text style={styles.content} numberOfLines={4} ellipsizeMode="tail">
          {previewText}
        </Text>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <View style={styles.actions}>
            <AnimatedIconButton
              icon="share-2"
              size={ICON_SIZE.share}
              color={COLORS.iconActive}
              onPress={handleShare}
              accessibilityLabel="Share poem"
            />
          </View>
        </View>

        {/* Decorative accent line */}
        <View style={styles.accentLine} />
      </Pressable>
    </Animated.View>
  );
});

export default NoteCard;

/* ─── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 14,
  },
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  containerPressed: {
    backgroundColor: COLORS.accent,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 19,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.title,
    lineHeight: 26,
    marginBottom: 8,
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 12,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.date,
    fontWeight: "400",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.date,
    marginHorizontal: 2,
  },
  menuButton: {
    padding: 4,
    borderRadius: 8,
  },
  menuButtonPressed: {
    backgroundColor: COLORS.accent,
    opacity: 0.7,
  },
  content: {
    fontSize: 15,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.content,
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: "400",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: 36,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    ...Platform.select({
      android: {
        elevation: 1,
      },
    }),
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.iconActive,
    opacity: 0.3,
  },
});
