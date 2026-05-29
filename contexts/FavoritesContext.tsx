import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { favoritesRead, favoritesWrite } from "@/utils/favorites";

interface FavoritesContextValue {
  favorites: Set<string>;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  loaded: boolean;
}

const Ctx = createContext<FavoritesContextValue | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const ids = await favoritesRead();
      setFavorites(ids);
      setLoaded(true);
    })();
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      favoritesWrite(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ favorites, isFavorite, toggle, loaded }),
    [favorites, isFavorite, toggle, loaded]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useFavorites = (): FavoritesContextValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFavorites must be used within FavoritesProvider");
  return v;
};
