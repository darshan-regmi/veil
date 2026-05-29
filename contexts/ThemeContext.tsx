import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, type ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LIGHT_COLORS,
  DARK_COLORS,
  type ThemeColors,
} from "@/constants/theme";

export type ThemeScheme = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

const KEY = "veil.theme.v1";

interface ThemeContextValue {
  scheme: ThemeScheme;
  effective: EffectiveTheme;
  colors: ThemeColors;
  setScheme: (s: ThemeScheme) => void;
}

const Ctx = createContext<ThemeContextValue | null>(null);

const resolve = (s: ThemeScheme, system: ColorSchemeName): EffectiveTheme => {
  if (s === "system") return system === "dark" ? "dark" : "light";
  return s;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scheme, setSchemeState] = useState<ThemeScheme>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    () => Appearance.getColorScheme() ?? "light"
  );

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw === "light" || raw === "dark" || raw === "system") {
          setSchemeState(raw);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const setScheme = useCallback((s: ThemeScheme) => {
    setSchemeState(s);
    AsyncStorage.setItem(KEY, s).catch(() => {});
  }, []);

  const effective = resolve(scheme, systemScheme);
  const colors = effective === "dark" ? DARK_COLORS : LIGHT_COLORS;

  const value = useMemo<ThemeContextValue>(
    () => ({ scheme, effective, colors, setScheme }),
    [scheme, effective, colors, setScheme]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used within ThemeProvider");
  return v;
};
