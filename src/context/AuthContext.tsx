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

// بناء كائن User من مستند Firestore مباشرة — يُستخدم عندما يكون المستند
// موجودًا لكن غائبًا عن كاش الـrepo (غير مُزامَن عند الإقلاع)
function userFromSnapshot(
  fuser: { uid: string; email?: string | null; displayName?: string | null },
  data: { [key: string]: any },
): User {
  const email = (data.email as string | undefined) ?? fuser.email ?? undefined;
  const accountType: AccountType = data.accountType === 'merchant' ? 'merchant' : 'individual';
  const isAdmin = data.isAdmin === true || normEmail(email) === normEmail(ADMIN_EMAIL);
  const rawCreated = data.createdAt;
  const createdAt =
    typeof rawCreated === 'number'
      ? rawCreated
      : typeof rawCreated?.toMillis === 'function'
        ? rawCreated.toMillis()
        : Date.now();
  return {
    id: fuser.uid,
    uid: fuser.uid,
    email,
    displayName: (data.displayName as string | undefined) ?? fuser.displayName ?? undefined,
    phone: (data.phone as string | undefined) ?? '',
    accountType,
    storeId: (data.storeId as string | undefined) ?? undefined,
    isAdmin,
    blocked: data.blocked === true,
    createdAt,
  };
}

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
        // المستند قد يكون موجودًا لكن الكاش غير مُزامَن — تحقق مباشر من Firestore قبل الحكم
        let snapUser: User | null = null;
        try {
          const snap = await getDoc(doc(getFirestore(), 'users', fuser.uid));
          if (snap.exists()) {
            snapUser = userFromSnapshot(fuser, snap.data() as { [key: string]: any });
          }
        } catch {
          snapUser = null;
        }
        if (snapUser) {
          if (snapUser.blocked) {
            // المحظور تُنهى جلسته فورًا
            try { await signOut(getAuth()); } catch { /* تجاهل */ }
            try { await GoogleSignin.signOut(); } catch { /* تجاهل */ }
            setUser(null);
          } else {
            setUser(snapUser);
          }
          setNeedsProfile(false);
        } else {
          // مستخدم جوجل جديد فعلًا — لا يوجد مستند users/{uid} → إكمال الملف
          setUser(null);
          setNeedsProfile(true);
        }
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
      let snap: { exists: () => boolean; data: () => unknown } | null = null;
      try {
        const s = await getDoc(doc(getFirestore(), 'users', fuser.uid));
        if (s.exists()) snap = s as { exists: () => boolean; data: () => unknown };
      } catch {
        snap = null;
      }
      if (snap) {
        // المستند موجود: ابنِ المستخدم من الـsnapshot مباشرة (تجنّب مكرر عند غياب الكاش)
        const u =
          repoRef.current.getUsers().find(x => x.uid === fuser.uid) ??
          userFromSnapshot(fuser, snap.data() as { [key: string]: any });
        setUser(u);
        setNeedsProfile(false);
        return u;
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
