import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PoemNote } from "./notion";

const POEMS_KEY = "veil.cache.poems.v1";
const POEMS_TS_KEY = "veil.cache.poems.ts.v1";

export const cachedPoemsRead = async (): Promise<{
  poems: PoemNote[];
  cachedAt: number | null;
}> => {
  try {
    const [raw, ts] = await Promise.all([
      AsyncStorage.getItem(POEMS_KEY),
      AsyncStorage.getItem(POEMS_TS_KEY),
    ]);
    return {
      poems: raw ? (JSON.parse(raw) as PoemNote[]) : [],
      cachedAt: ts ? Number(ts) : null,
    };
  } catch {
    return { poems: [], cachedAt: null };
  }
};

export const cachedPoemsWrite = async (poems: PoemNote[]): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(POEMS_KEY, JSON.stringify(poems)),
      AsyncStorage.setItem(POEMS_TS_KEY, String(Date.now())),
    ]);
  } catch {}
};

export const cachedPoemsClear = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([POEMS_KEY, POEMS_TS_KEY]);
  } catch {}
};
