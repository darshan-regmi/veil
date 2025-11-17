import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
  Platform,
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  Clipboard,
  ActionSheetIOS,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type PoemNote } from "@/utils/storage";

// Get status bar height for Android
const STATUSBAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0;

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
  ripple: "rgba(139, 90, 60, 0.1)",
} as const;

const READING = {
  wordsPerMinute: 200,
  minReadTime: 1,
} as const;

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };
const SCREEN_WIDTH = Dimensions.get("window").width;

const ANIMATION_CONFIG = {
  entrance: { duration: 500 },
  spring: { friction: 8 },
  toast: { duration: 2500 },
} as const;

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
const AnimatedIconButton = memo(function AnimatedIconButton({
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
      <Pressable
        style={({ pressed }) => [
          styles.headerButton,
          pressed && styles.headerButtonPressed,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={HIT_SLOP}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Feather name={icon as any} size={24} color={color} strokeWidth={1.8} />
      </Pressable>
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

const StatItem = memo(function StatItem({
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

/* ─── Toast Component ───────────────────────────────────── */
const Toast = memo(function Toast({
  visible,
  message,
  bottomInset,
}: {
  visible: boolean;
  message: string;
  bottomInset: number;
}) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.copiedToast,
        {
          bottom: bottomInset + 40,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Feather name="check-circle" size={18} color={COLORS.success} />
      <Text style={styles.copiedToastText}>{message}</Text>
    </Animated.View>
  );
});

/* ─── Main Component ───────────────────────────────────────── */
export default function PoemDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isLiked, setIsLiked] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        duration: ANIMATION_CONFIG.entrance.duration,
        useNativeDriver: true,
      }),
      Animated.spring(titleSlideAnim, {
        toValue: 0,
        friction: ANIMATION_CONFIG.spring.friction,
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

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setShowCopiedToast(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setShowCopiedToast(false);
    }, ANIMATION_CONFIG.toast.duration);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const shareContent = `${poem.title}\n\n${poem.content}\n\n— Created ${dates.created.date}`;

      const result = await Share.share(
        {
          message: shareContent,
          title: poem.title,
        },
        {
          dialogTitle: `Share "${poem.title}"`,
        }
      );

      if (result.action === Share.sharedAction) {
        showToast("Poem shared successfully!");
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
  }, [poem.title, poem.content, dates.created.date, showToast]);

  const handleCopy = useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }

      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(poem.content);
      } else {
        await Clipboard.setStringAsync(poem.content);
      }

      showToast("Copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy poem");
    }
  }, [poem.content, showToast]);

  const handleLike = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsLiked((prev) => !prev);
  }, []);

  const handleBack = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, [router]);

  const handleMoreOptions = useCallback(() => {
    if (Platform.OS === "ios") {
      // Native iOS Action Sheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Cancel",
            "Copy to Clipboard",
            isLiked ? "Unlike" : "Like",
            "Share",
          ],
          cancelButtonIndex: 0,
          title: poem.title,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCopy();
          } else if (buttonIndex === 2) {
            handleLike();
          } else if (buttonIndex === 3) {
            handleShare();
          }
        }
      );
    } else {
      // Android/Web Alert
      Alert.alert(
        poem.title,
        "Choose an action",
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
    }
  }, [poem.title, handleCopy, handleLike, handleShare, isLiked]);

  // Header background opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerPaddingTop = Platform.select({
    ios: insets.top > 0 ? insets.top : 16,
    android: STATUSBAR_HEIGHT + 16,
  });

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
        animated
        translucent={Platform.OS === "android"}
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: headerPaddingTop,
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
            icon="more-vertical"
            onPress={handleMoreOptions}
            accessibilityLabel="More options"
          />
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 60 },
        ]}
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

      {/* Toast */}
      <Toast
        visible={showCopiedToast}
        message="Copied to clipboard"
        bottomInset={insets.bottom}
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerButton: {
    padding: 4,
    borderRadius: 8,
  },
  headerButtonPressed: {
    backgroundColor: COLORS.ripple,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 34,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.textPrimary,
    lineHeight: 44,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -0.5,
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
    flexWrap: "wrap",
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
    fontWeight: "400",
  },
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
    fontWeight: "400",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.textPrimary,
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
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
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
  content: {
    fontSize: 17,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textPrimary,
    lineHeight: 32,
    textAlign: "left",
    fontWeight: "400",
  },
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
    fontWeight: "400",
  },
  quoteMarks: {
    position: "absolute",
    top: 40,
    right: 40,
    opacity: 0.05,
    pointerEvents: "none",
  },
  quoteMark: {
    fontSize: 120,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
  },
  copiedToast: {
    position: "absolute",
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
    fontWeight: "400",
  },
});
