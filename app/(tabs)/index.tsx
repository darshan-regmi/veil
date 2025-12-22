import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  UIManager,
  Pressable,
  ListRenderItemInfo,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import fuzzysort from "fuzzysort";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getNotesFromNotion, type PoemNote } from "@/utils/storage";
import NoteCard from "@/components/NoteCard";
import AboutSidebar from "@/components/AboutSidebar";

// Get status bar height
const STATUSBAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0;

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ─── Constants ───────────────────────────────────────────── */
const COLORS = {
  background: "#FAF7F0",
  surface: "#FFFFFF",
  border: "#E8E2D5",
  primary: "#8B5A3C",
  primaryLight: "#A67C52",
  textPrimary: "#2D2D2D",
  textSecondary: "#A0A0A0",
  iconDisabled: "#000000ff",
  overlay: "rgba(0, 0, 0, 0.4)",
  white: "#FFFFFF",
  success: "#4CAF50",
  error: "#E57373",
  ripple: "rgba(139, 90, 60, 0.1)",
} as const;

const DIMENSIONS = {
  headerIconSize: 24,
  searchIconSize: 20,
  emptyIconSize: 64,
  headerHeight: 60,
} as const;

const FLATLIST_CONFIG = {
  initialNumToRender: 10, // Increased for better initial render
  maxToRenderPerBatch: 8, // Increased for smoother scrolling
  updateCellsBatchingPeriod: 50,
  windowSize: 10, // Increased for better scroll performance
  removeClippedSubviews: Platform.OS === "android",
} as const;

const TIMING = {
  searchDebounce: 50, // Reduced from 300ms for snappier feel
  autoRefreshInterval: 300000, // 5 minutes
  successMessageDuration: 2500,
  scrollTopThreshold: 500,
} as const;

const ANIMATION_CONFIG = {
  layoutPreset: LayoutAnimation.Presets.easeInEaseOut,
  spring: { friction: 8, useNativeDriver: true },
} as const;

/* ─── Utilities ───────────────────────────────────────────── */
const filterNotes = (notes: PoemNote[], query: string): PoemNote[] => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return notes;

  // Search in titles first (higher priority)
  const titleResults = fuzzysort.go(trimmedQuery, notes, {
    key: "title",
    threshold: -5000,
    limit: 100,
    allowTypo: true,
  });

  // Search in content (lower priority)
  const contentResults = fuzzysort.go(trimmedQuery, notes, {
    key: "content",
    threshold: -8000,
    limit: 100,
    allowTypo: true,
  });

  // Create a map to track which notes we've already added from title search
  const addedIds = new Set<string>();
  const titleMatches: PoemNote[] = [];
  const contentMatches: PoemNote[] = [];

  // Collect title matches
  titleResults.forEach((result) => {
    addedIds.add(result.obj.id);
    titleMatches.push(result.obj);
  });

  // Collect content matches that weren't already found in titles
  contentResults.forEach((result) => {
    if (!addedIds.has(result.obj.id)) {
      contentMatches.push(result.obj);
    }
  });

  // Sort each category by date (newest first)
  const sortByDate = (a: PoemNote, b: PoemNote) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  titleMatches.sort(sortByDate);
  contentMatches.sort(sortByDate);

  // Return title matches first, then content matches
  return [...titleMatches, ...contentMatches];
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/* ─── Search Header Component ───────────────────────────── */
const SearchHeader = memo(
  function SearchHeader({
    value,
    onChangeText,
    isFocused,
    onFocus,
    onBlur,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    isFocused: boolean;
    onFocus: () => void;
    onBlur: () => void;
  }) {
    const inputRef = useRef<TextInput>(null);
    const borderAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(borderAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [isFocused, borderAnim]);

    const borderColor = borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.border, COLORS.primary],
    });

    const handleClear = useCallback(() => {
      onChangeText("");
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      // Keep focus after clearing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }, [onChangeText]);

    return (
      <Animated.View style={[styles.searchContainer, { borderColor }]}>
        <Feather
          name="search"
          size={DIMENSIONS.searchIconSize}
          color={isFocused ? COLORS.primary : COLORS.textSecondary}
        />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search poems by title or content..."
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
          blurOnSubmit={false}
          accessible
          accessibilityLabel="Search poems"
          accessibilityHint="Type to filter your poems"
        />
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearButtonPressed,
            ]}
            accessible
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Feather name="x-circle" size={18} color={COLORS.textSecondary} />
          </Pressable>
        )}
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.value === nextProps.value &&
      prevProps.isFocused === nextProps.isFocused
    );
  }
);

/* ─── Empty State Component ───────────────────────────────── */
const EmptyState = memo(function EmptyState({
  hasSearchQuery,
}: {
  hasSearchQuery: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.emptyContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <Feather
          name={hasSearchQuery ? "search" : "feather"}
          size={DIMENSIONS.emptyIconSize}
          color={COLORS.iconDisabled}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {hasSearchQuery ? "No poems found" : "You are offline."}
      </Text>
      <Text style={styles.emptyDescription}>
        {hasSearchQuery
          ? "Try different keywords or check your spelling"
          : ""}
      </Text>
    </Animated.View>
  );
});

/* ─── Loading View Component ───────────────────────────────── */
const LoadingView = memo(function LoadingView() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading your poems...</Text>
    </View>
  );
});

/* ─── Error View Component ───────────────────────────────── */
const ErrorView = memo(function ErrorView({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.centerContainer}>
      <View style={styles.errorIconContainer}>
        <Feather
          name="alert-circle"
          size={DIMENSIONS.emptyIconSize}
          color={COLORS.error}
        />
      </View>
      <Text style={styles.errorTitle}>Couldn't load poems</Text>
      <Text style={styles.errorDescription}>{error}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.retryButtonPressed,
        ]}
        onPress={onRetry}
        android_ripple={{ color: COLORS.primaryLight }}
      >
        <Feather name="refresh-cw" size={16} color={COLORS.white} />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );
});

/* ─── Success Toast Component ───────────────────────────────── */
const SuccessToast = memo(function SuccessToast({
  visible,
  message,
  topInset,
}: {
  visible: boolean;
  message: string;
  topInset: number;
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
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
          toValue: -100,
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
        styles.successToast,
        {
          top: topInset + 10,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Feather name="check-circle" size={20} color={COLORS.success} />
      <Text style={styles.successToastText}>{message}</Text>
    </Animated.View>
  );
});

/* ─── Scroll to Top Button ───────────────────────────────── */
const ScrollToTopButton = memo(function ScrollToTopButton({
  onPress,
  bottomInset,
}: {
  onPress: () => void;
  bottomInset: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.scrollTopButtonContainer,
        {
          bottom: bottomInset + 30,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.scrollTopButton,
          pressed && styles.scrollTopButtonPressed,
        ]}
        android_ripple={{ color: COLORS.primaryLight, borderless: true }}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Scroll to top"
      >
        <Feather name="arrow-up" size={22} color={COLORS.white} />
      </Pressable>
    </Animated.View>
  );
});

/* ─── Main Library Screen ───────────────────────────────── */
export default function LibraryScreen() {
  const [notes, setNotes] = useState<PoemNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<FlatList>(null);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, TIMING.searchDebounce);

  // Memoized filtered and sorted notes
  const filteredNotes = useMemo(
    () => filterNotes(notes, debouncedSearchQuery),
    [notes, debouncedSearchQuery]
  );

  const sortedNotes = useMemo(() => {
    // filterNotes already handles sorting:
    // - With search: title matches (by date) + content matches (by date)
    // - Without search: all notes returned unsorted, so we sort by date here
    if (!debouncedSearchQuery.trim()) {
      return [...filteredNotes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filteredNotes;
  }, [filteredNotes, debouncedSearchQuery]);

  // Load notes function
  const loadNotes = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      const savedNotes = await getNotesFromNotion();

      LayoutAnimation.configureNext(ANIMATION_CONFIG.layoutPreset);
      setNotes(savedNotes);

      if (isRefreshing && savedNotes.length > 0) {
        setSuccessMessage(`Refreshed ${savedNotes.length} poems`);
        setShowSuccessToast(true);

        // Clear existing timer
        if (successTimerRef.current) {
          clearTimeout(successTimerRef.current);
        }

        // Set new timer
        successTimerRef.current = setTimeout(() => {
          setShowSuccessToast(false);
        }, TIMING.successMessageDuration);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load poems";
      setError(errorMessage);
      console.error("Failed to load notes:", err);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    Keyboard.dismiss();
    setRefreshing(true);

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    loadNotes(true);
  }, [loadNotes]);

  // Initial load and auto-refresh setup
  useEffect(() => {
    loadNotes();

    autoRefreshTimerRef.current = setInterval(() => {
      console.log("Auto-refreshing poems...");
      loadNotes(true);
    }, TIMING.autoRefreshInterval);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, [loadNotes]);

  // Handle poem view
  const handleViewPoem = useCallback(
    async (note: PoemNote) => {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      router.push({
        pathname: "/poem/[id]",
        params: {
          id: note.id,
          title: note.title,
          content: note.content,
          status: note.status,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      });
    },
    [router]
  );

  // Scroll to top
  const scrollToTop = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // Sidebar handlers
  const openSidebar = useCallback(async () => {
    Keyboard.dismiss();
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSidebarVisible(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarVisible(false);
  }, []);

  // Search handlers
  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
  }, []);

  // Handle scroll
  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const shouldShow = offsetY > TIMING.scrollTopThreshold;

      if (shouldShow !== showScrollTop) {
        setShowScrollTop(shouldShow);
      }
    },
    [showScrollTop]
  );

  // Render functions
  const renderNote = useCallback(
    ({ item }: ListRenderItemInfo<PoemNote>) => (
      <NoteCard note={item} onPress={() => handleViewPoem(item)} />
    ),
    [handleViewPoem]
  );

  const keyExtractor = useCallback((item: PoemNote) => item.id, []);

  const renderEmpty = useCallback(
    () => <EmptyState hasSearchQuery={!!debouncedSearchQuery} />,
    [debouncedSearchQuery]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <SearchHeader
        value={searchQuery}
        onChangeText={setSearchQuery}
        isFocused={searchFocused}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
    ),
    [searchQuery, searchFocused]
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={COLORS.background}
          barStyle="dark-content"
          animated
          translucent={Platform.OS === "android"}
        />
        <View
          style={{
            paddingTop: Platform.OS === "android" ? STATUSBAR_HEIGHT : 0,
          }}
        >
          <LoadingView />
        </View>
      </View>
    );
  }

  // Error state
  if (error && notes.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={COLORS.background}
          barStyle="dark-content"
          animated
          translucent={Platform.OS === "android"}
        />
        <View
          style={{
            paddingTop: Platform.OS === "android" ? STATUSBAR_HEIGHT : 0,
          }}
        >
          <ErrorView error={error} onRetry={() => loadNotes()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
        animated
        translucent={Platform.OS === "android"}
      />

      <AboutSidebar visible={sidebarVisible} onClose={closeSidebar} />

      <SuccessToast
        visible={showSuccessToast}
        message={successMessage}
        topInset={Platform.OS === "ios" ? insets.top : STATUSBAR_HEIGHT}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.select({
              ios: insets.top > 0 ? insets.top + 16 : 16,
              android: STATUSBAR_HEIGHT + 16,
            }),
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.headerLeft,
            pressed && styles.headerLeftPressed,
          ]}
          onPress={openSidebar}
          android_ripple={{ color: COLORS.ripple, borderless: false }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="About the writer"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name="book-open"
            size={DIMENSIONS.headerIconSize}
            color={COLORS.primary}
          />
          <Text style={styles.headerTitle}>Veil</Text>
        </Pressable>
      </View>

      {/* Poems List */}
      <FlatList
        ref={listRef}
        data={sortedNotes}
        renderItem={renderNote}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          sortedNotes.length === 0 && styles.listContainerEmpty,
        ]}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        {...FLATLIST_CONFIG}
      />

      {/* Scroll-to-top Button */}
      {showScrollTop && (
        <ScrollToTopButton
          onPress={scrollToTop}
          bottomInset={Platform.OS === "ios" ? insets.bottom : 0}
        />
      )}
    </View>
  );
}

/* ─── Styles ───────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    marginTop: 16,
    fontWeight: "400",
  },
  errorIconContainer: {
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
  errorDescription: {
    fontSize: 15,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: "400",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.white,
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 12,
  },
  headerLeftPressed: {
    opacity: 0.7,
    backgroundColor: COLORS.ripple,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
    marginLeft: 12,
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textPrimary,
    marginLeft: 12,
    paddingVertical: 0,
    fontWeight: "400",
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
  },
  clearButtonPressed: {
    opacity: 0.5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listContainerEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  successToast: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: COLORS.success,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successToastText: {
    fontSize: 15,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: "400",
  },
  scrollTopButtonContainer: {
    position: "absolute",
    right: 24,
    zIndex: 100,
  },
  scrollTopButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scrollTopButtonPressed: {
    opacity: 0.85,
  },
});
