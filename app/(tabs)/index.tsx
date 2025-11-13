import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import fuzzysort from "fuzzysort";
import { useRouter } from "expo-router";
import { getNotesFromNotion, type PoemNote } from "@/utils/storage";
import NoteCard from "@/components/NoteCard";
import AboutSidebar from "@/components/AboutSidebar";

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
  iconDisabled: "#C0C0C0",
  overlay: "rgba(0, 0, 0, 0.4)",
  white: "#FFFFFF",
  success: "#4CAF50",
  error: "#E57373",
} as const;

const DIMENSIONS = {
  headerIconSize: 24,
  searchIconSize: 20,
  emptyIconSize: 64,
  headerHeight: 60,
} as const;

const FLATLIST_CONFIG = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 10,
  removeClippedSubviews: Platform.OS === "android",
  getItemLayout: (data: any, index: number) => ({
    length: 180,
    offset: 180 * index + 80,
    index,
  }),
} as const;

const TIMING = {
  searchDebounce: 250,
  autoRefreshInterval: 300000, // 5 minutes
  successMessageDuration: 2000,
} as const;

/* ─── Utilities ───────────────────────────────────────────── */
const filterNotes = (notes: PoemNote[], query: string): PoemNote[] => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return notes;

  const results = fuzzysort.go(trimmedQuery, notes, {
    keys: ["title", "content"],
    threshold: -10000,
    limit: 100,
    allowTypo: true,
  });

  return results.map((res) => res.obj);
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
const SearchHeader = React.memo(function SearchHeader({
  value,
  onChangeText,
  isFocused,
  onFocus,
  onBlur,
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
    inputRef.current?.focus();
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
        accessible
        accessibilityLabel="Search poems"
        accessibilityHint="Type to filter your poems"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Feather name="x-circle" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

/* ─── Empty State Component ───────────────────────────────── */
const EmptyState = React.memo(function EmptyState({ hasSearchQuery }) {
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
        {hasSearchQuery ? "No poems found" : "Your library awaits"}
      </Text>
      <Text style={styles.emptyDescription}>
        {hasSearchQuery
          ? "Try different keywords or check your spelling"
          : "Start your poetic journey in the Write tab"}
      </Text>
    </Animated.View>
  );
});

/* ─── Loading View Component ───────────────────────────────── */
const LoadingView = React.memo(function LoadingView() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading your poems...</Text>
    </View>
  );
});

/* ─── Error View Component ───────────────────────────────── */
const ErrorView = React.memo(function ErrorView({ error, onRetry }) {
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
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        activeOpacity={0.8}
      >
        <Feather name="refresh-cw" size={16} color={COLORS.white} />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
});

/* ─── Success Toast Component ───────────────────────────────── */
const SuccessToast = React.memo(function SuccessToast({ visible, message }) {
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
      style={[styles.successToast, { transform: [{ translateY }], opacity }]}
    >
      <Feather name="check-circle" size={20} color={COLORS.success} />
      <Text style={styles.successToastText}>{message}</Text>
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
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<FlatList>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, TIMING.searchDebounce);

  const filteredNotes = useMemo(
    () => filterNotes(notes, debouncedSearchQuery),
    [notes, debouncedSearchQuery]
  );

  const sortedNotes = useMemo(
    () =>
      [...filteredNotes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [filteredNotes]
  );

  const loadNotes = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      const savedNotes = await getNotesFromNotion();

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNotes(savedNotes);

      if (isRefreshing && savedNotes.length > 0) {
        setTimeout(
          () => setShowSuccessToast(false),
          TIMING.successMessageDuration
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load poems";
      setError(errorMessage);
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    Keyboard.dismiss();
    setRefreshing(true);
    loadNotes(true);
  }, [loadNotes]);

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
    };
  }, [loadNotes]);

  const handleViewPoem = useCallback(
    (note: PoemNote) => {
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

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const openSidebar = useCallback(() => {
    Keyboard.dismiss();
    setSidebarVisible(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarVisible(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
  }, []);

  const renderNote = useCallback(
    ({ item }: { item: PoemNote }) => (
      <NoteCard note={item} onPress={() => handleViewPoem(item)} />
    ),
    [handleViewPoem]
  );

  const keyExtractor = useCallback((item: PoemNote) => item.id, []);

  const renderEmpty = useCallback(
    () => <EmptyState hasSearchQuery={!!debouncedSearchQuery} />,
    [debouncedSearchQuery]
  );

  const renderListHeader = useCallback(
    () => (
      <SearchHeader
        value={searchQuery}
        onChangeText={setSearchQuery}
        isFocused={searchFocused}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
    ),
    [searchQuery, searchFocused, handleSearchFocus, handleSearchBlur]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingView />
      </SafeAreaView>
    );
  }

  if (error && notes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView error={error} onRetry={() => loadNotes()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
        animated
      />

      <AboutSidebar visible={sidebarVisible} onClose={closeSidebar} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={openSidebar}
          activeOpacity={0.7}
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
        </TouchableOpacity>
      </View>

      {/* Poems List */}
      <FlatList
        ref={listRef}
        data={sortedNotes}
        renderItem={renderNote}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          sortedNotes.length === 0 && styles.listContainerEmpty,
        ]}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          setShowScrollTop(offsetY > 400);
        }}
        scrollEventThrottle={16}
        {...FLATLIST_CONFIG}
      />

      {/* Scroll-to-top Button */}
      {showScrollTop && (
        <Animated.View style={styles.scrollTopButtonContainer}>
          <TouchableOpacity
            onPress={scrollToTop}
            style={styles.scrollTopButton}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Scroll to top"
          >
            <Feather name="arrow-up" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
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
  },
  errorDescription: {
    fontSize: 15,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
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
  retryButtonText: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.white,
  },
  header: {
    marginTop: Platform.select({ android: 16, ios: 0 }),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  noteCount: {
    fontSize: 14,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
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
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  successToast: {
    position: "absolute",
    top: Platform.select({ ios: 60, android: 40 }),
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
  },

  // ─── Scroll-to-Top Button Styles ───────────────────────
  scrollTopButtonContainer: {
    position: "absolute",
    bottom: 30,
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
});
