import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LocalRepo } from './localRepo';
import { Repository } from './types';

const RepoContext = createContext<Repository | null>(null);

// مثيل واحد مشترك — لاحقًا يُستبدل بتطبيق Firebase هنا فقط
const repoInstance: Repository = new LocalRepo();

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsub = (repoInstance as LocalRepo).subscribe(() => setVersion(v => v + 1));
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
