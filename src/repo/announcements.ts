import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import type { Announcement } from '../types';
import type { NewAnnouncementInput } from './types';
import { useRepo } from './RepoContext';

const COLLECTION = 'announcements';
const LIMIT = 60;

function docToAnnouncement(id: string, data: Record<string, unknown>): Announcement {
  const ts = data.createdAt as { toMillis?: () => number } | number | undefined;
  const millis =
    typeof ts === 'object' && ts !== null && typeof ts.toMillis === 'function'
      ? ts.toMillis()
      : typeof ts === 'number'
        ? ts
        : Date.now();
  return {
    id,
    title: String(data.title ?? ''),
    body: String(data.body ?? ''),
    createdAt: millis,
  };
}

/** قراءة الإعلانات من Firestore (الأحدث أولًا) */
export async function fetchRemoteAnnouncements(): Promise<Announcement[]> {
  const db = getFirestore();
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(LIMIT));
  const snap = await getDocs(q);
  return snap.docs.map(d => docToAnnouncement(d.id, d.data() as Record<string, unknown>));
}

/** نشر إعلان على Firestore — يعيد معرّف المستند */
export async function publishRemoteAnnouncement(input: NewAnnouncementInput): Promise<string> {
  const db = getFirestore();
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, {
    title: input.title,
    body: input.body,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** حذف إعلان من Firestore */
export async function deleteRemoteAnnouncement(id: string): Promise<void> {
  const db = getFirestore();
  await deleteDoc(doc(db, COLLECTION, id));
}

/** Hook هجين: يقرأ من Firestore، وعند غياب الاتصال يرجع لبيانات الـrepo المحلي */
export function useAnnouncements(): {
  items: Announcement[];
  loading: boolean;
  isRemote: boolean;
  refresh: () => Promise<void>;
} {
  const repo = useRepo();
  const [remote, setRemote] = useState<Announcement[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await fetchRemoteAnnouncements();
      setRemote(list);
    } catch {
      setRemote(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const local = repo.getAnnouncements();
  return { items: remote ?? local, loading, isRemote: remote !== null, refresh };
}
