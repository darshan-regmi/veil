import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  StatusBar,
  Pressable,
  ListRenderItemInfo,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { loadCachedPoems, type PoemNote } from "@/utils/storage";
import { useFavorites } from "@/hooks/useFavorites";
import {
  FONTS,
  SPACING,
  STATUSBAR_HEIGHT,
  FLATLIST_CONFIG,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import NoteCard from "@/components/NoteCard";
import EmptyState from "@/components/EmptyState";
import SkeletonLoader from "@/components/SkeletonLoader";

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, effective } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { favorites, isFavorite, toggle, loaded: favoritesLoaded } = useFavorites();
  const [notes, setNotes] = useState<PoemNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { poems } = await loadCachedPoems();
      setNotes(poems);
      setLoading(false);
    })();
  }, []);

  const favoriteNotes = useMemo(
    () => notes.filter((n) => favorites.has(n.id)),
    [notes, favorites]
  );

  const handleBack = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, [router]);

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

  const renderNote = useCallback(
    ({ item }: ListRenderItemInfo<PoemNote>) => (
      <NoteCard
        note={item}
        onPress={() => handleViewPoem(item)}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggle}
      />
    ),
    [handleViewPoem, isFavorite, toggle]
  );

  const keyExtractor = useCallback((item: PoemNote) => item.id, []);
  const renderEmpty = useCallback(
    () => <EmptyState variant="favorites" />,
    []
  );

  const headerPaddingTop = Platform.select({
    ios: insets.top > 0 ? insets.top + SPACING.lg : SPACING.lg,
    android: STATUSBAR_HEIGHT + SPACING.lg,
  });

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.bg}
        barStyle={effective === "dark" ? "light-content" : "dark-content"}
        animated
        translucent={Platform.OS === "android"}
      />

      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          style={({ pressed }) => pressed && { opacity: 0.5 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={styles.headerRule} />
        </View>

        <View style={{ width: 22 }} />
      </View>

      {loading || !favoritesLoaded ? (
        <View style={styles.skeletonWrap}>
          <SkeletonLoader />
        </View>
      ) : (
        <FlatList
          data={favoriteNotes}
          renderItem={renderNote}
          keyExtractor={keyExtractor}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            favoriteNotes.length === 0 && styles.listContainerEmpty,
          ]}
          {...FLATLIST_CONFIG}
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
      alignItems: "flex-start",
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.lg,
      backgroundColor: colors.bg,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontFamily: FONTS.bold,
      fontSize: 22,
      fontWeight: "700",
      color: colors.ink,
      letterSpacing: -0.3,
    },
    headerRule: {
      width: 24,
      height: 2,
      backgroundColor: colors.accent,
      marginTop: 6,
    },
    skeletonWrap: {
      flex: 1,
    },
    listContainer: {
      paddingBottom: 120,
    },
    listContainerEmpty: {
      flexGrow: 1,
    },
  });
