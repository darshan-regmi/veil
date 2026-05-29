import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "veil.seenPoemIds.v1";

export const getSeenIds = async (): Promise<Set<string>> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
};

export const markIdsSeen = async (ids: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
};

export const findNewPoems = async <T extends { id: string }>(
  poems: T[]
): Promise<T[]> => {
  const seen = await getSeenIds();
  return poems.filter((p) => !seen.has(p.id));
};
