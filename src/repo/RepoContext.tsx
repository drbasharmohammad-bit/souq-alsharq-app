import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FirestoreRepo } from './firestoreRepo';
import { Repository } from './types';

const RepoContext = createContext<Repository | null>(null);

// مثيل واحد مشترك — تطبيق Firestore بنمط offline-first (بذر محلي + مزامنة خلفية)
const repoInstance: Repository = new FirestoreRepo();

// الشكل البنيوي للاشتراك — يعمل مع أي تطبيق Repository يوفّر subscribe
type SubscribableRepo = Repository & { subscribe(fn: () => void): () => void };

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsub = (repoInstance as SubscribableRepo).subscribe(() => setVersion(v => v + 1));
    return unsub;
  }, []);

  const repo = useMemo(() => repoInstance, []);
  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
}

export function useRepo(): Repository {
  const repo = useContext(RepoContext);
  if (!repo) throw new Error('useRepo خارج RepoProvider');
  return repo;
}

/**
 * Hook لإعادة التحميل من المصدر البعيد (pull-to-refresh).
 * يعمل مع FirestoreRepo (دالة refresh) — ومع أي تطبيق آخر يُرجع resolved فورًا.
 */
export function useRepoRefresh(): () => Promise<void> {
  const repo = useRepo();
  return useCallback(async () => {
    const r = repo as unknown as { refresh?: () => Promise<void> };
    if (typeof r.refresh === 'function') {
      await r.refresh();
    }
  }, [repo]);
}
