import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Search, Book } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getNotesFromNotion, type PoemNote } from "@/utils/storage";
import NoteCard from "@/components/NoteCard";

/* ─── Constants ───────────────────────────────────────────── */
const COLORS = {
  background: "#FAF7F0",
  surface: "#FFFFFF",
  border: "#E8E2D5",
  primary: "#8B5A3C",
  textPrimary: "#2D2D2D",
  textSecondary: "#A0A0A0",
  iconDisabled: "#C0C0C0",
} as const;

const SEARCH_DEBOUNCE_MS = 300;

/* ─── Utilities ───────────────────────────────────────────── */
const filterNotes = (notes: PoemNote[], query: string): PoemNote[] => {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) return notes;

  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(trimmedQuery) ||
      note.content.toLowerCase().includes(trimmedQuery)
  );
};

/* ─── Component ───────────────────────────────────────────── */
export default function LibraryScreen() {
  const [notes, setNotes] = useState<PoemNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const filteredNotes = useMemo(
    () => filterNotes(notes, searchQuery),
    [notes, searchQuery]
  );

  const loadNotes = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      const savedNotes = await getNotesFromNotion();
      setNotes(savedNotes);
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
    setRefreshing(true);
    loadNotes(true);
  }, [loadNotes]);

  /* ─── Fetch Strategy ───────────────────────────────────────── */
  useEffect(() => {
    // Fetch once when component mounts
    loadNotes();

    // Set up periodic refresh every 5 minutes (300000 ms)
    const interval = setInterval(() => {
      console.log("Auto-refreshing poems...");
      loadNotes(true);
    }, 300000);

    // Cleanup on unmount
    return () => clearInterval(interval);
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

  const renderNote = useCallback(
    ({ item }: { item: PoemNote }) => (
      <NoteCard note={item} onPress={() => handleViewPoem(item)} />
    ),
    [handleViewPoem]
  );

  const renderListHeader = useCallback(
    () => (
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.textSecondary} strokeWidth={1.5} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your poems..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessible
          accessibilityLabel="Search poems"
          accessibilityHint="Type to filter poems by title or content"
        />
      </View>
    ),
    [searchQuery]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Book size={48} color={COLORS.iconDisabled} strokeWidth={1} />
        <Text style={styles.emptyTitle}>
          {searchQuery ? "No poems found" : "No poems yet"}
        </Text>
        <Text style={styles.emptyDescription}>
          {searchQuery
            ? "Try adjusting your search terms"
            : "Start writing your first poem in the Write tab"}
        </Text>
      </View>
    ),
    [searchQuery]
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your poems...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && notes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Book size={48} color={COLORS.iconDisabled} strokeWidth={1} />
          <Text style={styles.errorTitle}>Failed to load poems</Text>
          <Text style={styles.errorDescription}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Book size={24} color={COLORS.primary} strokeWidth={1.5} />
          <Text style={styles.headerTitle}>Library</Text>
        </View>
        <Text style={styles.noteCount}>
          {filteredNotes.length} poem{filteredNotes.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Poems List */}
      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredNotes.length === 0 && styles.listContainerEmpty,
        ]}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        removeClippedSubviews={Platform.OS === "android"}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
      />
    </SafeAreaView>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
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
  errorTitle: {
    fontSize: 20,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
    marginLeft: 12,
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
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
