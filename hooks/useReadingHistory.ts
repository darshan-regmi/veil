import { useCallback, useEffect, useState } from "react";
import {
  computeStats,
  historyAdd,
  historyRead,
  type HistoryEntry,
  type ReadingStats,
} from "@/utils/readingHistory";

export const useReadingHistory = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await historyRead();
      setEntries(data);
      setLoaded(true);
    })();
  }, []);

  const markViewed = useCallback(async (id: string) => {
    const next = await historyAdd(id);
    setEntries(next);
  }, []);

  const stats: ReadingStats = computeStats(entries);

  return { entries, markViewed, stats, loaded };
};
