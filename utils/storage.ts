import { fetchNotesFromNotion, type PoemNote } from "./notion";
import { cachedPoemsRead, cachedPoemsWrite } from "./cache";
import { findNewPoems, markIdsSeen } from "./seenPoems";
import { scheduleNewPoemNotification } from "./notifications";

export type { PoemNote };

export interface LoadResult {
  poems: PoemNote[];
  source: "cache" | "network" | "empty";
  cachedAt: number | null;
  error?: string;
}

export const loadCachedPoems = async (): Promise<LoadResult> => {
  const { poems, cachedAt } = await cachedPoemsRead();
  return {
    poems,
    cachedAt,
    source: poems.length > 0 ? "cache" : "empty",
  };
};

export const refreshPoemsFromNotion = async (): Promise<LoadResult> => {
  try {
    const poems = await fetchNotesFromNotion();
    const newPoems = await findNewPoems(poems);
    await cachedPoemsWrite(poems);
    await markIdsSeen(poems.map((p) => p.id));
    if (newPoems.length > 0) {
      await scheduleNewPoemNotification(newPoems[0].title);
    }
    return { poems, source: "network", cachedAt: Date.now() };
  } catch (err) {
    const { poems, cachedAt } = await cachedPoemsRead();
    const message = err instanceof Error ? err.message : "Failed to fetch poems";
    return {
      poems,
      source: poems.length > 0 ? "cache" : "empty",
      cachedAt,
      error: message,
    };
  }
};

export const getNotesFromNotion = async (): Promise<PoemNote[]> => {
  const { poems } = await refreshPoemsFromNotion();
  return poems;
};
