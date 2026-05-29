import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LINE_HEIGHTS, READING_SIZES } from "@/constants/theme";

export type LineHeightKey = keyof typeof LINE_HEIGHTS;

interface ReadingSettings {
  fontSize: number;
  lineHeight: LineHeightKey;
  readerMode: boolean;
}

interface ReadingSettingsContextValue extends ReadingSettings {
  setFontSize: (n: number) => void;
  setLineHeight: (k: LineHeightKey) => void;
  setReaderMode: (b: boolean) => void;
  incrementFontSize: () => void;
  decrementFontSize: () => void;
}

const KEY = "veil.readingSettings.v1";

const DEFAULTS: ReadingSettings = {
  fontSize: READING_SIZES.default,
  lineHeight: "standard",
  readerMode: false,
};

const Ctx = createContext<ReadingSettingsContextValue | null>(null);

export const ReadingSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULTS);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<ReadingSettings>;
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    })();
  }, []);

  const persist = useCallback((next: ReadingSettings) => {
    setSettings(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setFontSize = useCallback(
    (n: number) => {
      const clamped = Math.max(
        READING_SIZES.min,
        Math.min(READING_SIZES.max, Math.round(n))
      );
      persist({ ...settings, fontSize: clamped });
    },
    [persist, settings]
  );

  const setLineHeight = useCallback(
    (k: LineHeightKey) => persist({ ...settings, lineHeight: k }),
    [persist, settings]
  );

  const setReaderMode = useCallback(
    (b: boolean) => persist({ ...settings, readerMode: b }),
    [persist, settings]
  );

  const incrementFontSize = useCallback(() => {
    setFontSize(settings.fontSize + READING_SIZES.step);
  }, [setFontSize, settings.fontSize]);

  const decrementFontSize = useCallback(() => {
    setFontSize(settings.fontSize - READING_SIZES.step);
  }, [setFontSize, settings.fontSize]);

  const value = useMemo<ReadingSettingsContextValue>(
    () => ({
      ...settings,
      setFontSize,
      setLineHeight,
      setReaderMode,
      incrementFontSize,
      decrementFontSize,
    }),
    [
      settings,
      setFontSize,
      setLineHeight,
      setReaderMode,
      incrementFontSize,
      decrementFontSize,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useReadingSettings = (): ReadingSettingsContextValue => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useReadingSettings must be used within ReadingSettingsProvider"
    );
  return ctx;
};
