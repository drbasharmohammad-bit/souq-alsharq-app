import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from '@react-native-firebase/auth';
import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ADMIN_EMAIL, GOOGLE_WEB_CLIENT_ID } from '../config';
import { useRepo } from '../repo/RepoContext';
import { NewUserInput } from '../repo/types';
import { AccountType, Store, User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  needsProfile: boolean; // true إذا دخل بجوجل ولا يوجد مستند users/{uid}
  completeProfile: (phone: string, accountType: AccountType) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => void; // إعادة قراءة المستخدم من الـrepo (متزامنة)
}

const AuthContext = createContext<AuthState | null>(null);

// تهيئة GoogleSignin مرة واحدة فقط
let googleConfigured = false;
function ensureGoogleConfigured() {
  if (googleConfigured) return;
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('لم يُضبط GOOGLE_WEB_CLIENT_ID بعد — أضفه من Firebase Console (Authentication ← Sign-in method ← Google)');
  }
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  googleConfigured = true;
}

const normEmail = (e?: string | null) => (e ?? '').trim().toLowerCase();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const repo = useRepo();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const repoRef = useRef(repo);
  repoRef.current = repo;

  // استماع لحالة Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async fuser => {
      const r = repoRef.current;
      if (!fuser) {
        setUser(null);
        setNeedsProfile(false);
        setLoading(false);
        return;
      }
      const u = r.getUsers().find(x => x.uid === fuser.uid);
      if (u) {
        if (u.blocked) {
          // المحظور تُنهى جلسته فورًا
          try { await signOut(getAuth()); } catch { /* تجاهل */ }
          try { await GoogleSignin.signOut(); } catch { /* تجاهل */ }
          setUser(null);
        } else {
          setUser(u);
        }
        setNeedsProfile(false);
      } else {
        // مستخدم جوجل جديد — لا يوجد مستند users/{uid} → إكمال الملف
        setUser(null);
        setNeedsProfile(true);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    ensureGoogleConfigured();
    await GoogleSignin.hasPlayServices();
    const res: any = await GoogleSignin.signIn();
    const idToken: string | undefined = res?.data?.idToken ?? res?.idToken;
    if (!idToken) {
      throw new Error('تعذر الحصول على رمز الدخول من جوجل — حاول مجددًا');
    }
    const cred = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(getAuth(), cred);
    // onAuthStateChanged سيتكفل بتحديد user/needsProfile
  }, []);

  const completeProfile = useCallback(
    async (phone: string, accountType: AccountType): Promise<User> => {
      const fuser = getAuth().currentUser;
      if (!fuser) {
        throw new Error('انتهت جلسة جوجل — سجّل الدخول مجددًا');
      }
      // فحص دفاعي: تحقق من وجود المستند مباشرة في Firestore قبل الإنشاء
      let exists = false;
      try {
        const snap = await getDoc(doc(getFirestore(), 'users', fuser.uid));
        exists = snap.exists();
      } catch {
        exists = false;
      }
      if (exists) {
        const u = repoRef.current.getUsers().find(x => x.uid === fuser.uid);
        if (u) {
          setUser(u);
          setNeedsProfile(false);
          return u;
        }
      }
      const isAdmin = normEmail(fuser.email) === normEmail(ADMIN_EMAIL);
      const u = repoRef.current.addUser(
        {
          uid: fuser.uid,
          email: fuser.email ?? undefined,
          displayName: fuser.displayName ?? undefined,
          phone: phone.trim(),
          accountType,
        } as NewUserInput,
        isAdmin,
      );
      setUser(u);
      setNeedsProfile(false);
      return u;
    },
    [],
  );

  const logout = useCallback(async () => {
    setUser(null);
    setNeedsProfile(false);
    try { await GoogleSignin.signOut(); } catch { /* تجاهل */ }
    await signOut(getAuth());
  }, []);

  const refresh = useCallback(() => {
    setUser(prev => {
      if (!prev?.uid) return prev;
      const u = repoRef.current.getUsers().find(x => x.uid === prev.uid);
      return u ? { ...u } : prev;
    });
  }, []);

  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, needsProfile, completeProfile, logout, refresh }),
    [user, loading, signInWithGoogle, needsProfile, completeProfile, logout, refresh],
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
