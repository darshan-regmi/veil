import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "veil.favorites.v1";

export const favoritesRead = async (): Promise<Set<string>> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
};

export const favoritesWrite = async (ids: Set<string>): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {}
};
