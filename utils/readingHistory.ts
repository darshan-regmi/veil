import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "veil.history.v1";
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: string;
  viewedAt: number;
}

export const historyRead = async (): Promise<HistoryEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
};

export const historyAdd = async (id: string): Promise<HistoryEntry[]> => {
  try {
    const current = await historyRead();
    const filtered = current.filter((entry) => entry.id !== id);
    const next = [{ id, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
};

export const historyClear = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
};

const dayStart = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export interface ReadingStats {
  totalRead: number;
  thisWeek: number;
  streak: number;
}

export const computeStats = (entries: HistoryEntry[]): ReadingStats => {
  const today = dayStart(Date.now());
  const weekAgo = today - 6 * 24 * 60 * 60 * 1000;
  const thisWeek = entries.filter((e) => e.viewedAt >= weekAgo).length;

  const uniqueDays = new Set(entries.map((e) => dayStart(e.viewedAt)));
  let streak = 0;
  let cursor = today;
  while (uniqueDays.has(cursor)) {
    streak += 1;
    cursor -= 24 * 60 * 60 * 1000;
  }

  return { totalRead: entries.length, thisWeek, streak };
};
