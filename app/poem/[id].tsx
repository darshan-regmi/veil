import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Share2,
  BookOpen,
  Calendar,
  Clock,
} from "lucide-react-native";
import { type PoemNote } from "@/utils/storage";

/* ─── Constants ───────────────────────────────────────────── */
const COLORS = {
  background: "#FAF7F0",
  surface: "#FFFFFF",
  border: "#E8E2D5",
  primary: "#8B5A3C",
  textPrimary: "#2D2D2D",
  textSecondary: "#A0A0A0",
} as const;

const READING = {
  wordsPerMinute: 200,
  minReadTime: 1,
} as const;

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

/* ─── Utilities ───────────────────────────────────────────── */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid time";

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Invalid time";
  }
};

const getWordCount = (text: string): number => {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
};

const getLineCount = (text: string): number => {
  return text.split("\n").length;
};

const getReadingTime = (wordCount: number): string => {
  const minutes = Math.max(
    READING.minReadTime,
    Math.ceil(wordCount / READING.wordsPerMinute)
  );
  return minutes === 1 ? "1 min" : `${minutes} min`;
};

/* ─── Component ───────────────────────────────────────────── */
export default function PoemDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Parse poem from params
  const poem: PoemNote = useMemo(
    () => ({
      id: params.id as string,
      title: params.title as string,
      content: params.content as string,
      status: params.status as PoemNote["status"],
      createdAt: params.createdAt as string,
      updatedAt: params.updatedAt as string,
    }),
    [params]
  );

  // Memoize computed values
  const stats = useMemo(() => {
    const wordCount = getWordCount(poem.content);
    return {
      words: wordCount,
      lines: getLineCount(poem.content),
      readingTime: getReadingTime(wordCount),
    };
  }, [poem.content]);

  const dates = useMemo(
    () => ({
      created: {
        date: formatDate(poem.createdAt),
        time: formatTime(poem.createdAt),
      },
      updated: {
        date: formatDate(poem.updatedAt),
        time: formatTime(poem.updatedAt),
      },
      wasEdited: poem.updatedAt !== poem.createdAt,
    }),
    [poem.createdAt, poem.updatedAt]
  );

  // Event handlers
  const handleShare = useCallback(async () => {
    try {
      const result = await Share.share({
        message: `${poem.title}\n\n${poem.content}`,
        title: poem.title,
      });

      if (result.action === Share.dismissedAction) {
        // User dismissed the share dialog
        return;
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
  }, [poem.title, poem.content]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={HIT_SLOP}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={COLORS.primary} strokeWidth={1.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          hitSlop={HIT_SLOP}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Share poem"
        >
          <Share2 size={24} color={COLORS.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>{poem.title}</Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataRow}>
            <Calendar
              size={16}
              color={COLORS.textSecondary}
              strokeWidth={1.5}
            />
            <Text style={styles.metadataText}>{dates.created.date}</Text>
          </View>

          <View style={styles.metadataRow}>
            <Clock size={16} color={COLORS.textSecondary} strokeWidth={1.5} />
            <Text style={styles.metadataText}>{dates.created.time}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatItem
            icon={
              <BookOpen size={18} color={COLORS.primary} strokeWidth={1.5} />
            }
            label="Words"
            value={stats.words}
          />

          <View style={styles.statDivider} />

          <StatItem
            icon={<Text style={styles.statIcon}>¶</Text>}
            label="Lines"
            value={stats.lines}
          />

          <View style={styles.statDivider} />

          <StatItem
            icon={<Clock size={18} color={COLORS.primary} strokeWidth={1.5} />}
            label="Reading"
            value={stats.readingTime}
          />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{poem.content}</Text>
        </View>

        {/* Footer */}
        {dates.wasEdited && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Last edited on {dates.updated.date} at {dates.updated.time}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Stat Item Component ────────────────────────────────── */
interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    marginTop: Platform.select({
      android: 16,
      ios: 0,
    }),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  actionButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.textPrimary,
    lineHeight: 40,
    marginBottom: 24,
    textAlign: "center",
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 32,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    fontSize: 18,
    color: COLORS.primary,
    fontFamily: "LibreBaskerville-Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.textPrimary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  contentContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    fontSize: 18,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textPrimary,
    lineHeight: 32,
    textAlign: "left",
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
