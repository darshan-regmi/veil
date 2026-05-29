import fuzzysort from "fuzzysort";
import { type PoemNote } from "@/utils/storage";

export function filterNotes(
  notes: PoemNote[],
  query: string,
  tag: string | null = null
): PoemNote[] {
  let pool = notes;

  if (tag) {
    pool = pool.filter((n) => n.tags?.includes(tag));
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return pool;

  const titleResults = fuzzysort.go(trimmedQuery, pool, {
    key: "title",
    threshold: -5000,
    limit: 100,
  });

  const contentResults = fuzzysort.go(trimmedQuery, pool, {
    key: "content",
    threshold: -8000,
    limit: 100,
  });

  const addedIds = new Set<string>();
  const titleMatches: PoemNote[] = [];
  const contentMatches: PoemNote[] = [];

  titleResults.forEach((result) => {
    addedIds.add(result.obj.id);
    titleMatches.push(result.obj);
  });

  contentResults.forEach((result) => {
    if (!addedIds.has(result.obj.id)) {
      contentMatches.push(result.obj);
    }
  });

  const sortByDate = (a: PoemNote, b: PoemNote) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  titleMatches.sort(sortByDate);
  contentMatches.sort(sortByDate);

  return [...titleMatches, ...contentMatches];
}

export const extractAllTags = (notes: PoemNote[]): string[] => {
  const set = new Set<string>();
  for (const note of notes) {
    if (Array.isArray(note.tags)) {
      for (const t of note.tags) set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
};
