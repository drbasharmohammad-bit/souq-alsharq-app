import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ADMIN_PHONE } from '../config';
import { useRepo } from '../repo/RepoContext';
import { AccountType, Store, User } from '../types';

const KEY = 'sharq_user_v1';

interface AuthState {
  user: User | null;
  loading: boolean;
  // دخول وهمي: أي رقم ← رمز 4 أرقام (أي رمز يُقبل)
  login: (phone: string, accountType: AccountType) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const repo = useRepo();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // استعادة الجلسة
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw) as User;
          // تأكد من وجوده في الـRepo (الذاكرة تُصفَّر مع إعادة التشغيل)
          let u = repo.getUserByPhone(saved.phone);
          if (!u) {
            u = repo.addUser(
              { phone: saved.phone, accountType: saved.accountType, storeId: saved.storeId },
              saved.phone === ADMIN_PHONE,
            );
          }
          setUser(u);
        }
      } catch {
        // تجاهل
      } finally {
        setLoading(false);
      }
    })();
  }, [repo]);

  const login = useCallback(
    async (phone: string, accountType: AccountType): Promise<User> => {
      let u = repo.getUserByPhone(phone);
      if (!u) {
        u = repo.addUser({ phone, accountType }, phone === ADMIN_PHONE);
      }
      setUser(u);
      await AsyncStorage.setItem(KEY, JSON.stringify(u));
      return u;
    },
    [repo],
  );

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(KEY);
  }, []);

  const refresh = useCallback(() => {
    if (user) {
      const u = repo.getUserByPhone(user.phone);
      if (u) setUser({ ...u });
    }
  }, [repo, user]);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth خارج AuthProvider');
  return ctx;
}

export function useMyStore(): Store | undefined {
  const { user } = useAuth();
  const repo = useRepo();
  if (!user?.storeId) return undefined;
  return repo.getStoreById(user.storeId);
}
