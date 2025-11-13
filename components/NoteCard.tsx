import React, { useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { type PoemNote } from "@/utils/storage";

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
} as const;

const ANIMATION = {
  cardPress: { scale: 0.98, duration: 100 },
  iconPress: { scale: 0.85, duration: 150 },
} as const;

/* ─── Types ───────────────────────────────────────────────── */
interface NoteCardProps {
  note: PoemNote;
  onPress?: () => void;
  onShare?: (note: PoemNote) => void;
  onLike?: (note: PoemNote) => void;
}

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

  // Remove excessive whitespace and line breaks
  const cleaned = content;

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
const AnimatedIconButton = React.memo(function AnimatedIconButton({
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
        activeOpacity={1}
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
export default function NoteCard({
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
      duration: 300,
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
      const shareContent = `${note.title}\n\n${note.content}\n\n— Written on ${formattedDate}`;

      const result = await Share.share({
        message: shareContent,
        title: note.title,
      });

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

  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev);

    // Trigger haptic feedback on native platforms
    if (Platform.OS !== "web") {
      // Add haptic feedback here if available
    }

    if (onLike) {
      onLike(note);
    }
  }, [note, onLike]);

  const showActionSheet = useCallback(() => {
    Alert.alert(
      note.title,
      `${wordCount} words • ${formattedDate}`,
      [
        {
          text: "Copy",
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(note.content);
              Alert.alert("Copied", "Poem copied to clipboard");
            } catch (error) {
              Alert.alert("Error", "Failed to copy poem");
            }
          },
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
  }, [note.title, wordCount, formattedDate, handleShare, handleLike, isLiked]);

  const handleCardPress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION.cardPress.scale,
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
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
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

          <TouchableOpacity
            style={styles.menuButton}
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
          </TouchableOpacity>
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
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
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
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.date,
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
  },
  content: {
    fontSize: 15,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.content,
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.icon,
  },
  statusDotPublished: {
    backgroundColor: COLORS.iconActive,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.content,
    textTransform: "capitalize",
  },
  actions: {
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
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
