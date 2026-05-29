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
  ScrollView,
  FlatList,
  Platform,
  StatusBar,
  Keyboard,
  LayoutAnimation,
  Pressable,
  ListRenderItemInfo,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  loadCachedPoems,
  refreshPoemsFromNotion,
  type PoemNote,
} from "@/utils/storage";
import { filterNotes, extractAllTags } from "@/utils/filterNotes";
import { useDebounce } from "@/hooks/useDebounce";
import { useFavorites } from "@/hooks/useFavorites";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import {
  FONTS,
  SPACING,
  TIMING,
  FLATLIST_CONFIG,
  ANIMATION_CONFIG,
  STATUSBAR_HEIGHT,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import NoteCard from "@/components/NoteCard";
import AboutSidebar from "@/components/AboutSidebar";
import SearchHeader from "@/components/SearchHeader";
import EmptyState from "@/components/EmptyState";
import SkeletonLoader from "@/components/SkeletonLoader";
import ErrorView from "@/components/ErrorView";
import SuccessToast from "@/components/SuccessToast";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import CollectionPills from "@/components/CollectionPills";
import RandomPoemButton from "@/components/RandomPoemButton";
import RecentlyReadRow from "@/components/RecentlyReadRow";

export default function LibraryScreen() {
  const { colors, effective } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [notes, setNotes] = useState<PoemNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { entries: history, stats } = useReadingHistory();

  const debouncedSearchQuery = useDebounce(searchQuery, TIMING.searchDebounce);

  const tags = useMemo(() => extractAllTags(notes), [notes]);

  const filteredNotes = useMemo(
    () => filterNotes(notes, debouncedSearchQuery, activeTag),
    [notes, debouncedSearchQuery, activeTag]
  );

  const sortedNotes = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return [...filteredNotes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return filteredNotes;
  }, [filteredNotes, debouncedSearchQuery]);

  const recentPoems = useMemo(() => {
    if (debouncedSearchQuery.trim() || activeTag || history.length === 0)
      return [] as PoemNote[];
    const map = new Map(notes.map((n) => [n.id, n] as const));
    return history.map((h) => map.get(h.id)).filter((p): p is PoemNote => !!p);
  }, [history, notes, debouncedSearchQuery, activeTag]);

  const flashToast = useCallback((message: string) => {
    setToast({ visible: true, message });
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(
      () => setToast({ visible: false, message: "" }),
      TIMING.successMessageDuration
    );
  }, []);

  const initialLoad = useCallback(async () => {
    const cached = await loadCachedPoems();
    if (cached.poems.length > 0) {
      setNotes(cached.poems);
      setLoading(false);
    }
    const fresh = await refreshPoemsFromNotion();
    if (fresh.poems.length > 0) {
      LayoutAnimation.configureNext(ANIMATION_CONFIG.layoutPreset);
      setNotes(fresh.poems);
    }
    setError(fresh.error ?? null);
    setIsOffline(fresh.source !== "network" && !!fresh.error);
    setLoading(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    Keyboard.dismiss();
    setRefreshing(true);
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const result = await refreshPoemsFromNotion();
    if (result.poems.length > 0) {
      LayoutAnimation.configureNext(ANIMATION_CONFIG.layoutPreset);
      setNotes(result.poems);
    }
    if (result.source === "network") {
      flashToast(`Refreshed ${result.poems.length} poems`);
      setIsOffline(false);
      setError(null);
    } else {
      setIsOffline(true);
      if (result.error) setError(result.error);
    }
    setRefreshing(false);
  }, [flashToast]);

  useEffect(() => {
    initialLoad();
    autoRefreshTimerRef.current = setInterval(async () => {
      const result = await refreshPoemsFromNotion();
      if (result.source === "network" && result.poems.length > 0) {
        LayoutAnimation.configureNext(ANIMATION_CONFIG.layoutPreset);
        setNotes(result.poems);
        setIsOffline(false);
      }
    }, TIMING.autoRefreshInterval);
    return () => {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [initialLoad]);

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

  const handleRandom = useCallback(() => {
    if (notes.length === 0) return;
    const pick = notes[Math.floor(Math.random() * notes.length)];
    handleViewPoem(pick);
  }, [notes, handleViewPoem]);

  const scrollToTop = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const openSidebar = useCallback(async () => {
    Keyboard.dismiss();
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSidebarVisible(true);
  }, []);

  const closeSidebar = useCallback(() => setSidebarVisible(false), []);
  const handleSearchFocus = useCallback(() => setSearchFocused(true), []);
  const handleSearchBlur = useCallback(() => setSearchFocused(false), []);

  const goFavorites = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/favorites");
  }, [router]);

  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const shouldShow = offsetY > TIMING.scrollTopThreshold;
      if (shouldShow !== showScrollTop) setShowScrollTop(shouldShow);
    },
    [showScrollTop]
  );

  const renderNote = useCallback(
    ({ item }: ListRenderItemInfo<PoemNote>) => (
      <NoteCard
        note={item}
        onPress={() => handleViewPoem(item)}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggleFavorite}
      />
    ),
    [handleViewPoem, isFavorite, toggleFavorite]
  );

  const keyExtractor = useCallback((item: PoemNote) => item.id, []);

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        hasSearchQuery={!!debouncedSearchQuery || !!activeTag}
        variant={isOffline ? "offline" : "library"}
      />
    ),
    [debouncedSearchQuery, activeTag, isOffline]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View>
        <SearchHeader
          value={searchQuery}
          onChangeText={setSearchQuery}
          isFocused={searchFocused}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        {tags.length > 0 && (
          <CollectionPills
            tags={tags}
            selected={activeTag}
            onSelect={setActiveTag}
          />
        )}
        <RecentlyReadRow poems={recentPoems} onSelect={handleViewPoem} />
        {sortedNotes.length > 0 && (
          <Text style={styles.listEyebrow}>
            {debouncedSearchQuery
              ? `${sortedNotes.length} result${sortedNotes.length === 1 ? "" : "s"}`
              : activeTag
              ? `${sortedNotes.length} in ${activeTag.toUpperCase()}`
              : `${sortedNotes.length} POEMS`}
          </Text>
        )}
      </View>
    ),
    [
      searchQuery,
      searchFocused,
      handleSearchFocus,
      handleSearchBlur,
      tags,
      activeTag,
      recentPoems,
      handleViewPoem,
      sortedNotes.length,
      debouncedSearchQuery,
      styles.listEyebrow,
    ]
  );

  const headerPaddingTop = Platform.select({
    ios: insets.top > 0 ? insets.top + SPACING.lg : SPACING.lg,
    android: STATUSBAR_HEIGHT + SPACING.lg,
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={colors.bg}
          barStyle={effective === "dark" ? "light-content" : "dark-content"}
          animated
          translucent={Platform.OS === "android"}
        />
        <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
          <Text style={styles.wordmark}>Veil</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <SkeletonLoader />
        </ScrollView>
      </View>
    );
  }

  if (error && notes.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={colors.bg}
          barStyle={effective === "dark" ? "light-content" : "dark-content"}
          animated
          translucent={Platform.OS === "android"}
        />
        <View
          style={{
            flex: 1,
            paddingTop: Platform.OS === "android" ? STATUSBAR_HEIGHT : 0,
          }}
        >
          <ErrorView error={error} onRetry={() => handleRefresh()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.bg}
        barStyle={effective === "dark" ? "light-content" : "dark-content"}
        animated
        translucent={Platform.OS === "android"}
      />

      <AboutSidebar
        visible={sidebarVisible}
        onClose={closeSidebar}
        readingStats={stats}
      />

      <SuccessToast
        visible={toast.visible}
        message={toast.message}
        topInset={Platform.OS === "ios" ? insets.top : STATUSBAR_HEIGHT}
      />

      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <Pressable
          style={({ pressed }) => [
            styles.wordmarkWrap,
            pressed && styles.wordmarkPressed,
          ]}
          onPress={openSidebar}
          android_ripple={{ color: colors.ripple, borderless: false }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="About the writer"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.wordmark}>Veil</Text>
          <View style={styles.wordmarkRule} />
        </Pressable>

        <View style={styles.headerActions}>
          <RandomPoemButton onPress={handleRandom} disabled={notes.length === 0} />
          <Pressable
            onPress={goFavorites}
            hitSlop={8}
            style={({ pressed }) => [
              styles.headerIconBtn,
              pressed && styles.headerIconBtnPressed,
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Open favorites"
          >
            <Feather name="bookmark" size={18} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Feather name="cloud-off" size={12} color={colors.meta} />
          <Text style={styles.offlineText}>Offline — showing cached poems</Text>
        </View>
      )}

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

      {showScrollTop && (
        <ScrollToTopButton
          onPress={scrollToTop}
          bottomInset={Platform.OS === "ios" ? insets.bottom : 0}
        />
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.lg,
      backgroundColor: colors.bg,
    },
    wordmarkWrap: {
      paddingVertical: 2,
    },
    wordmarkPressed: {
      opacity: 0.6,
    },
    wordmark: {
      fontFamily: FONTS.bold,
      fontSize: 28,
      fontWeight: "700",
      letterSpacing: -0.5,
      color: colors.ink,
    },
    wordmarkRule: {
      width: 24,
      height: 2,
      backgroundColor: colors.accent,
      marginTop: 6,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      marginBottom: 4,
    },
    headerIconBtn: {
      width: 38,
      height: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.hairline,
      alignItems: "center",
      justifyContent: "center",
    },
    headerIconBtnPressed: {
      backgroundColor: colors.surfaceElevated,
    },
    offlineBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.surfaceElevated,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.hairline,
    },
    offlineText: {
      fontFamily: FONTS.italic,
      fontSize: 12,
      color: colors.meta,
      fontWeight: "400",
    },
    listEyebrow: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: colors.meta,
      marginHorizontal: SPACING.xl,
      marginBottom: SPACING.md,
    },
    listContainer: {
      paddingBottom: 120,
    },
    listContainerEmpty: {
      flexGrow: 1,
    },
  });
