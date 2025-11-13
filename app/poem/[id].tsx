import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
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
  Animated,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { type PoemNote } from "@/utils/storage";

/* ─── Constants ───────────────────────────────────────────── */
const COLORS = {
  background: "#FAF7F0",
  surface: "#FFFFFF",
  border: "#E8E2D5",
  primary: "#8B5A3C",
  primaryLight: "#A67C52",
  textPrimary: "#2D2D2D",
  textSecondary: "#757575",
  accent: "#E8DED0",
  success: "#4CAF50",
  statusDraft: "#FFA726",
  statusPublished: "#66BB6A",
} as const;

const READING = {
  wordsPerMinute: 200,
  minReadTime: 1,
} as const;

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };
const SCREEN_WIDTH = Dimensions.get("window").width;

/* ─── Utilities ───────────────────────────────────────────── */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
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
  return text.split("\n").filter((line) => line.trim().length > 0).length;
};

const getCharCount = (text: string): number => {
  return text.replace(/\s/g, "").length;
};

const getReadingTime = (wordCount: number): string => {
  const minutes = Math.max(
    READING.minReadTime,
    Math.ceil(wordCount / READING.wordsPerMinute)
  );
  return minutes === 1 ? "1 min" : `${minutes} min`;
};

/* ─── Animated Icon Button ───────────────────────────────── */
const AnimatedIconButton = React.memo(function AnimatedIconButton({
  icon,
  onPress,
  accessibilityLabel,
  color = COLORS.primary,
}: {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
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
        style={styles.headerButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={HIT_SLOP}
        activeOpacity={1}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Feather name={icon as any} size={24} color={color} strokeWidth={1.8} />
      </TouchableOpacity>
    </Animated.View>
  );
});

/* ─── Stat Item Component ────────────────────────────────── */
interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}

const StatItem = React.memo(function StatItem({
  icon,
  label,
  value,
  delay = 0,
}: StatItemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.statItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.statIconContainer}>{icon}</View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Animated.View>
  );
});

/* ─── Action Button Component ───────────────────────────────── */
const ActionButton = React.memo(function ActionButton({
  icon,
  label,
  onPress,
  variant = "primary",
}: {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          variant === "secondary" && styles.actionButtonSecondary,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Feather
          name={icon as any}
          size={18}
          color={variant === "primary" ? COLORS.surface : COLORS.primary}
          strokeWidth={1.8}
        />
        <Text
          style={[
            styles.actionButtonText,
            variant === "secondary" && styles.actionButtonTextSecondary,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

/* ─── Main Component ───────────────────────────────────────── */
export default function PoemDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isLiked, setIsLiked] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Animations
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(-30)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;

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

  const stats = useMemo(() => {
    const wordCount = getWordCount(poem.content);
    const charCount = getCharCount(poem.content);
    return {
      words: wordCount,
      lines: getLineCount(poem.content),
      characters: charCount,
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

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(titleSlideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(contentFadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [titleFadeAnim, titleSlideAnim, contentFadeAnim]);

  const handleShare = useCallback(async () => {
    try {
      const shareContent = `${poem.title}\n\n${poem.content}\n\n— Created ${dates.created.date}`;

      const result = await Share.share({
        message: shareContent,
        title: poem.title,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert("Success", "Poem shared successfully!");
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
  }, [poem.title, poem.content, dates.created.date]);

  const handleCopy = useCallback(() => {
    // In a real app, you'd use Clipboard API here
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
    Alert.alert("Copied!", "Poem copied to clipboard");
  }, []);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMoreOptions = useCallback(() => {
    Alert.alert(
      poem.title,
      "More options",
      [
        {
          text: "Copy to Clipboard",
          onPress: handleCopy,
        },
        {
          text: isLiked ? "Unlike" : "Like",
          onPress: handleLike,
        },
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
  }, [poem.title, handleCopy, handleLike, handleShare, isLiked]);

  // Header background opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ["transparent", COLORS.surface],
            }),
            borderBottomColor: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ["transparent", COLORS.border],
            }),
          },
        ]}
      >
        <AnimatedIconButton
          icon="arrow-left"
          onPress={handleBack}
          accessibilityLabel="Go back"
        />
        <View style={styles.headerActions}>
          <AnimatedIconButton
            icon={isLiked ? "heart" : "heart"}
            onPress={handleLike}
            accessibilityLabel={isLiked ? "Unlike poem" : "Like poem"}
            color={isLiked ? "#E57373" : COLORS.primary}
          />
          <AnimatedIconButton
            icon="more-vertical"
            onPress={handleMoreOptions}
            accessibilityLabel="More options"
          />
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >

        {/* Title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleFadeAnim,
              transform: [{ translateY: titleSlideAnim }],
            },
          ]}
        >
          {poem.title}
        </Animated.Text>

        {/* Metadata */}
        <Animated.View
          style={[
            styles.metadata,
            {
              opacity: titleFadeAnim,
            },
          ]}
        >
          <View style={styles.metadataRow}>
            <Feather name="calendar" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metadataText}>{dates.created.date}</Text>
          </View>
          <View style={styles.metadataDot} />
          <View style={styles.metadataRow}>
            <Feather name="clock" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metadataText}>{dates.created.time}</Text>
          </View>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatItem
            icon={<Feather name="book-open" size={20} color={COLORS.primary} />}
            label="Words"
            value={stats.words}
            delay={100}
          />
          <View style={styles.statDivider} />
          <StatItem
            icon={<Feather name="list" size={20} color={COLORS.primary} />}
            label="Lines"
            value={stats.lines}
            delay={200}
          />
          <View style={styles.statDivider} />
          <StatItem
            icon={<Feather name="clock" size={20} color={COLORS.primary} />}
            label="Reading"
            value={stats.readingTime}
            delay={300}
          />
        </View>

        {/* Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: contentFadeAnim,
            },
          ]}
        >
          <View style={styles.contentHeader}>
            <Feather name="feather" size={20} color={COLORS.primary} />
            <Text style={styles.contentHeaderText}>Poem</Text>
          </View>
          <Text style={styles.content}>{poem.content}</Text>
        </Animated.View>

        {/* Footer */}
        {dates.wasEdited && (
          <View style={styles.footer}>
            <Feather name="edit-2" size={14} color={COLORS.textSecondary} />
            <Text style={styles.footerText}>
              Last edited {dates.updated.date} at {dates.updated.time}
            </Text>
          </View>
        )}

        {/* Decorative Quote Marks */}
        <View style={styles.quoteMarks}>
          <Text style={styles.quoteMark}>"</Text>
        </View>
      </Animated.ScrollView>

      {/* Copied Toast */}
      {showCopiedToast && (
        <Animated.View style={styles.copiedToast}>
          <Feather name="check-circle" size={18} color={COLORS.success} />
          <Text style={styles.copiedToastText}>Copied to clipboard</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  // ====== ROOT ======
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ====== HEADER ======
  header: {
    marginTop: Platform.select({ android: 16, ios: 0 }),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },

  // ====== SCROLL VIEW ======
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },

  // ====== STATUS BADGE ======
  statusBadge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusBadgePublished: { backgroundColor: "#E8F5E9" },
  statusBadgeDraft: { backgroundColor: "#FFF3E0" },
  statusText: {
    fontSize: 12,
    fontFamily: "LibreBaskerville-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusTextPublished: { color: COLORS.statusPublished },
  statusTextDraft: { color: COLORS.statusDraft },

  // ====== TITLE ======
  title: {
    fontSize: 34,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.textPrimary,
    lineHeight: 44,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  // ====== METADATA ======
  metadata: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metadataDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textSecondary,
  },
  metadataText: {
    fontSize: 13,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
  },

  // ====== STATS ======
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 36,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.textPrimary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },

  // ====== CONTENT ======
  contentContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contentHeaderText: {
    fontSize: 14,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  content: {
    fontSize: 17,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textPrimary,
    lineHeight: 32,
    textAlign: "left",
  },

  // ====== ADDITIONAL STATS ======
  additionalStats: {
    alignItems: "center",
    marginBottom: 24,
  },
  additionalStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  additionalStatText: {
    fontSize: 13,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
  },

  // ====== ACTIONS ======
  actionsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
    }),
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 15,
    letterSpacing: 0.4,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.surface,
    textAlign: "center",
    paddingHorizontal: 6,
  },
  actionButtonTextSecondary: { color: COLORS.primary },

  // ====== FOOTER ======
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 24,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // ====== DECORATION ======
  quoteMarks: {
    position: "absolute",
    top: 40,
    right: 40,
    opacity: 0.05,
  },
  quoteMark: {
    fontSize: 120,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
  },

  // ====== TOAST ======
  copiedToast: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.success,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  copiedToastText: {
    fontSize: 14,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textPrimary,
    flex: 1,
  },
});
