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
  Share,
  Alert,
  Platform,
  Animated,
  Pressable,
  StatusBar,
  ActionSheetIOS,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { captureRef } from "react-native-view-shot";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type PoemNote } from "@/utils/storage";
import {
  FONTS,
  SPACING,
  RADIUS,
  STATUSBAR_HEIGHT,
  LINE_HEIGHTS,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useReadingSettings } from "@/contexts/ReadingSettingsContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import ReadingSettingsSheet from "@/components/ReadingSettingsSheet";
import ShareCard from "@/components/ShareCard";

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const wordCount = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

const readingMin = (words: number): number =>
  Math.max(1, Math.ceil(words / 200));

// "Read" semantics: must be on screen this long AND either scrolled past
// READ_SCROLL_THRESHOLD or the content fit on a single screen (no scrolling).
const READ_DWELL_MS = 6000;
const READ_SCROLL_THRESHOLD = 0.6;
const READ_CHECK_INTERVAL_MS = 500;

// Strip filesystem-unsafe chars and cap length so the saved share image gets
// a recognizable name like "Midnight Letter.png".
const sanitizeFilename = (title: string): string => {
  const cleaned = title.replace(/[^a-zA-Z0-9 \-_]/g, "").trim().slice(0, 80);
  return cleaned || "poem";
};

const IconBtn = memo(function IconBtn({
  icon,
  onPress,
  accessibilityLabel,
  tint,
  styles,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  tint: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Feather name={icon} size={20} color={tint} strokeWidth={1.8} />
    </Pressable>
  );
});

export default function PoemDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, effective } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const contentHeightRef = useRef(1);
  const containerHeightRef = useRef(1);
  const [progressPct, setProgressPct] = useState(0);

  const { fontSize, lineHeight, readerMode } = useReadingSettings();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { markViewed } = useReadingHistory();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [shareGenerating, setShareGenerating] = useState(false);
  const chromeOpacity = useRef(new Animated.Value(1)).current;

  const shareCardRef = useRef<View>(null);
  const shareCardLaidOutRef = useRef(false);

  // "Read" gate refs — kept in refs so polling interval reads fresh values
  // without re-subscribing on every scroll event.
  const screenOpenedAtRef = useRef<number>(Date.now());
  const scrollPctRef = useRef(0);
  const hasMarkedReadRef = useRef(false);

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

  useEffect(() => {
    screenOpenedAtRef.current = Date.now();
    scrollPctRef.current = 0;
    hasMarkedReadRef.current = false;
  }, [poem.id]);

  useEffect(() => {
    if (!poem.id) return;
    const interval = setInterval(() => {
      if (hasMarkedReadRef.current) return;
      const dwellMs = Date.now() - screenOpenedAtRef.current;
      if (dwellMs < READ_DWELL_MS) return;

      const contentH = contentHeightRef.current;
      const containerH = containerHeightRef.current;
      const fitsOnScreen = contentH > 1 && containerH > 1 && contentH <= containerH;
      const scrolledEnough =
        fitsOnScreen || scrollPctRef.current >= READ_SCROLL_THRESHOLD;
      if (!scrolledEnough) return;

      hasMarkedReadRef.current = true;
      markViewed(poem.id);
    }, READ_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poem.id, markViewed]);

  const stats = useMemo(() => {
    const w = wordCount(poem.content);
    return {
      words: w,
      minutes: readingMin(w),
      date: formatDate(poem.createdAt),
    };
  }, [poem.content, poem.createdAt]);

  const wasEdited = useMemo(
    () => poem.updatedAt && poem.updatedAt !== poem.createdAt,
    [poem.updatedAt, poem.createdAt]
  );

  const showToast = useCallback((msg: string) => {
    Alert.alert("", msg);
  }, []);

  const handleShareText = useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await Share.share(
        {
          message: `${poem.title}\n\n${poem.content}\n\n— Veil`,
          title: poem.title,
        },
        { dialogTitle: `Share "${poem.title}"` }
      );
    } catch {}
  }, [poem]);

  const waitForShareCardReady = useCallback(async () => {
    const start = Date.now();
    while (!shareCardLaidOutRef.current && Date.now() - start < 1500) {
      await new Promise((r) => setTimeout(r, 30));
    }
  }, []);

  const handleShareImage = useCallback(async () => {
    if (shareGenerating) return;
    setShareGenerating(true);
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await waitForShareCardReady();
      if (!shareCardRef.current) {
        throw new Error("Share card not mounted");
      }
      const tmpUri = await captureRef(shareCardRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      // Copy the tmpfile to cacheDirectory/<sanitized-title>.png so the
      // share sheet (and the file the recipient saves) carries a recognizable
      // filename instead of a random tmp hash.
      const targetUri =
        FileSystem.cacheDirectory + sanitizeFilename(poem.title) + ".png";
      await FileSystem.deleteAsync(targetUri, { idempotent: true });
      await FileSystem.copyAsync({ from: tmpUri, to: targetUri });

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        await Share.share({ url: targetUri, message: poem.title });
      } else {
        await Sharing.shareAsync(targetUri, {
          mimeType: "image/png",
          dialogTitle: `Share "${poem.title}"`,
          UTI: "public.png",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not generate image";
      console.warn("[share-as-image]", err);
      showToast(message);
    } finally {
      setShareGenerating(false);
    }
  }, [poem.title, shareGenerating, showToast, waitForShareCardReady]);

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(poem.content);
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showToast("Copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy poem");
    }
  }, [poem.content, showToast]);

  const favorited = isFavorite(poem.id);
  const handleFavorite = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(poem.id);
  }, [poem.id, toggleFavorite]);

  const handleBack = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, [router]);

  const openShareSheet = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Share as text", "Share as image", "Copy to clipboard"],
          cancelButtonIndex: 0,
          title: poem.title,
        },
        (i) => {
          if (i === 1) handleShareText();
          else if (i === 2) handleShareImage();
          else if (i === 3) handleCopy();
        }
      );
    } else {
      Alert.alert(poem.title, undefined, [
        { text: "Share as text", onPress: handleShareText },
        { text: "Share as image", onPress: handleShareImage },
        { text: "Copy to clipboard", onPress: handleCopy },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }, [poem.title, handleShareText, handleShareImage, handleCopy]);

  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      scrollY.setValue(offsetY);
      const denom = Math.max(
        1,
        contentHeightRef.current - containerHeightRef.current
      );
      const pct = Math.max(0, Math.min(1, offsetY / denom));
      scrollPctRef.current = pct;
      setProgressPct(pct);
    },
    [scrollY]
  );

  const toggleChrome = useCallback(() => {
    const next = !chromeVisible;
    setChromeVisible(next);
    Animated.timing(chromeOpacity, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [chromeVisible, chromeOpacity]);

  const headerPaddingTop = Platform.select({
    ios: insets.top > 0 ? insets.top : SPACING.md,
    android: STATUSBAR_HEIGHT + SPACING.md,
  });

  const lineHeightValue = LINE_HEIGHTS[lineHeight];

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.bg}
        barStyle={effective === "dark" ? "light-content" : "dark-content"}
        animated
        translucent={Platform.OS === "android"}
        hidden={readerMode && !chromeVisible}
      />

      <Animated.View
        style={[
          styles.progressBarWrap,
          { paddingTop: Platform.OS === "android" ? STATUSBAR_HEIGHT : 0 },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.progressBar, { width: `${progressPct * 100}%` }]} />
      </Animated.View>

      <Animated.View
        style={[
          styles.header,
          { paddingTop: headerPaddingTop, opacity: chromeOpacity },
        ]}
        pointerEvents={chromeVisible ? "auto" : "none"}
      >
        <IconBtn
          icon="arrow-left"
          onPress={handleBack}
          accessibilityLabel="Go back"
          tint={colors.ink}
          styles={styles}
        />
        <View style={styles.headerActions}>
          <IconBtn
            icon="type"
            onPress={() => setSettingsVisible(true)}
            accessibilityLabel="Reading settings"
            tint={colors.ink}
            styles={styles}
          />
          <IconBtn
            icon="bookmark"
            onPress={handleFavorite}
            accessibilityLabel={favorited ? "Remove favorite" : "Add favorite"}
            tint={favorited ? colors.accent : colors.ink}
            styles={styles}
          />
          <IconBtn
            icon="share"
            onPress={openShareSheet}
            accessibilityLabel="Share poem"
            tint={colors.ink}
            styles={styles}
          />
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: (headerPaddingTop ?? 0) + 60 + SPACING.lg,
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onContentSizeChange={(_, h) => (contentHeightRef.current = h)}
        onLayout={(e) => (containerHeightRef.current = e.nativeEvent.layout.height)}
        scrollEventThrottle={16}
      >
        <Pressable onPress={readerMode ? toggleChrome : undefined}>
          <View style={styles.titleRule} />
          <Text style={styles.title}>{poem.title}</Text>
          <Text style={styles.meta}>
            {[stats.date, `${stats.words} words`, `${stats.minutes} min`]
              .filter(Boolean)
              .join("  ·  ")}
          </Text>

          <Text
            style={[
              styles.body,
              {
                fontSize,
                lineHeight: fontSize * lineHeightValue,
              },
            ]}
          >
            {poem.content}
          </Text>

          {wasEdited && (
            <View style={styles.footer}>
              <View style={styles.footerRule} />
              <Text style={styles.footerText}>
                Last edited {formatDate(poem.updatedAt)}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.ScrollView>

      <ReadingSettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />

      <View style={styles.offscreen} pointerEvents="none" accessible={false}>
        <ShareCard
          ref={shareCardRef}
          poem={poem}
          onReady={() => {
            shareCardLaidOutRef.current = true;
          }}
        />
      </View>

      {shareGenerating && (
        <View style={styles.generatingOverlay} pointerEvents="auto">
          <View style={styles.generatingCard}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.generatingText}>Generating image…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    progressBarWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      zIndex: 20,
    },
    progressBar: {
      height: 2,
      backgroundColor: colors.accent,
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
      zIndex: 10,
      backgroundColor: colors.bg,
    },
    iconBtn: {
      padding: SPACING.xs,
      borderRadius: RADIUS.sm,
    },
    iconBtnPressed: {
      opacity: 0.5,
    },
    headerActions: {
      flexDirection: "row",
      gap: SPACING.md,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: SPACING["2xl"],
    },
    titleRule: {
      width: 32,
      height: 2,
      backgroundColor: colors.accent,
      marginBottom: SPACING.lg,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: 36,
      fontWeight: "700",
      lineHeight: 44,
      letterSpacing: -0.6,
      color: colors.ink,
      marginBottom: SPACING.md,
    },
    meta: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.meta,
      fontWeight: "400",
      marginBottom: SPACING["3xl"],
    },
    body: {
      fontFamily: FONTS.regular,
      color: colors.inkSecondary,
      fontWeight: "400",
    },
    footer: {
      marginTop: SPACING["3xl"],
      alignItems: "flex-start",
    },
    footerRule: {
      width: 24,
      height: 1,
      backgroundColor: colors.hairline,
      marginBottom: SPACING.md,
    },
    footerText: {
      fontFamily: FONTS.italic,
      fontSize: 12,
      color: colors.meta,
      fontWeight: "400",
    },
    offscreen: {
      position: "absolute",
      top: 0,
      left: -20000,
      width: 1080,
    },
    generatingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 30,
    },
    generatingCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.lg,
      backgroundColor: colors.bg,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    generatingText: {
      fontFamily: FONTS.regular,
      fontSize: 14,
      color: colors.ink,
      fontWeight: "400",
    },
  });
