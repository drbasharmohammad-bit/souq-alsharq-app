import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'sharq_gov_v1';
export const GOV_ALL = 'الكل';

interface GovState {
  gov: string;
  setGov: (g: string) => void;
}

const GovContext = createContext<GovState | null>(null);

// المحافظة المختارة عالميًا — تُفلتر كل شاشات التطبيق وتُحفظ محليًا
export function GovProvider({ children }: { children: React.ReactNode }) {
  const [gov, setGovState] = useState<string>(GOV_ALL);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => {
      if (v) setGovState(v);
    }).catch(() => {});
  }, []);

  const setGov = (g: string) => {
    setGovState(g);
    AsyncStorage.setItem(KEY, g).catch(() => {});
  };

  return <GovContext.Provider value={{ gov, setGov }}>{children}</GovContext.Provider>;
}

export function useGov(): GovState {
  const ctx = useContext(GovContext);
  if (!ctx) throw new Error('useGov خارج GovProvider');
  return ctx;
}
