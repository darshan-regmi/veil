import { fetchNotesFromNotion, type PoemNote } from "./notion";
import { cachedPoemsRead, cachedPoemsWrite } from "./cache";

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
    await cachedPoemsWrite(poems);
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
