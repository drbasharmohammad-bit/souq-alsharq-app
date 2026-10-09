import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface FavoritesCtx {
  favorites: string[];
  toggle: (id: string) => void;
  isFav: (id: string) => boolean;
}

const Ctx = createContext<FavoritesCtx>({ favorites: [], toggle: () => {}, isFav: () => false });

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const toggle = useCallback((id: string) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
  }, []);
  const isFav = useCallback((id: string) => favorites.includes(id), [favorites]);
  const value = useMemo(() => ({ favorites, toggle, isFav }), [favorites, toggle, isFav]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  return useContext(Ctx);
}
