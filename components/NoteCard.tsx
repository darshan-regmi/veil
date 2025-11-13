import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from "react-native";
import { MoreVertical, Share2 } from "lucide-react-native";
import { type PoemNote } from "@/utils/storage";

/* ─── Constants ───────────────────────────────────────────── */
const PREVIEW_LENGTH = 150;
const ICON_SIZE = { menu: 20, share: 16 };
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const COLORS = {
  background: "#FFFFFF",
  border: "#E8E2D5",
  title: "#2D2D2D",
  content: "#5D5D5D",
  date: "#000000FF",
  icon: "#A0A0A0",
  iconActive: "#8B5A3C",
} as const;

/* ─── Types ───────────────────────────────────────────────── */
interface NoteCardProps {
  note: PoemNote;
  onPress?: () => void;
  onShare?: (note: PoemNote) => void;
}

/* ─── Utilities ───────────────────────────────────────────── */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

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
  if (!content) return "";
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trimEnd() + "...";
};

/* ─── Component ───────────────────────────────────────────── */
export default function NoteCard({ note, onPress, onShare }: NoteCardProps) {
  // Memoize computed values
  const formattedDate = useMemo(
    () => formatDate(note.createdAt),
    [note.createdAt]
  );
  const previewText = useMemo(
    () => getPreviewText(note.content),
    [note.content]
  );

  const handleShare = useCallback(async () => {
    try {
      const result = await Share.share({
        message: `${note.title}\n\n${note.content}`,
        title: note.title,
      });

      // Call optional callback
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
  }, [note, onShare]);

  const showActionSheet = useCallback(() => {
    Alert.alert(
      note.title,
      "Choose an action",
      [
        {
          text: "Share",
          onPress: handleShare,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  }, [note.title, handleShare]);

  const handleCardPress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleCardPress}
      activeOpacity={0.7}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Poem: ${note.title}`}
      accessibilityHint="Double tap to view full poem"
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {note.title}
        </Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={showActionSheet}
          hitSlop={HIT_SLOP}
          accessible
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <MoreVertical
            size={ICON_SIZE.menu}
            color={COLORS.icon}
            strokeWidth={1.5}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.content} numberOfLines={4} ellipsizeMode="tail">
        {previewText}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            hitSlop={HIT_SLOP}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Share poem"
          >
            <Share2
              size={ICON_SIZE.share}
              color={COLORS.iconActive}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.title,
    lineHeight: 24,
    marginRight: 12,
  },
  menuButton: {
    padding: 4,
  },
  content: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.content,
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.date,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
});
