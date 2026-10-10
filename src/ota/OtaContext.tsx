/**
 * سياق التحديث الهوائي — حالة مشتركة بين فحص الإقلاع وشاشة الحساب.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  applyUpdate as applyUpdateNative,
  checkForUpdate,
  discardDownloadedUpdate,
  downloadUpdate,
  getAppliedVersion,
} from './UpdateManager';
import { OtaManifest } from './otaConfig';

export type OtaStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error';

interface OtaState {
  status: OtaStatus;
  manifest: OtaManifest | null;
  appliedVersion: string;
  progress: number; // 0..1 أثناء التحميل
  errorMessage: string | null;
  check: () => Promise<void>;
  download: () => Promise<void>;
  apply: () => void;
  dismiss: () => void;
  discard: () => Promise<void>;
}

const OtaContext = createContext<OtaState | null>(null);

export function OtaProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<OtaStatus>('idle');
  const [manifest, setManifest] = useState<OtaManifest | null>(null);
  const [appliedVersion, setAppliedVersion] = useState('');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkingRef = useRef(false);

  const check = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setStatus('checking');
    setErrorMessage(null);
    try {
      const result = await checkForUpdate();
      if (result.available) {
        setManifest(result.manifest);
        setStatus('available');
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    } finally {
      checkingRef.current = false;
    }
  }, []);

  const download = useCallback(async () => {
    if (!manifest) return;
    setStatus('downloading');
    setProgress(0);
    setErrorMessage(null);
    try {
      await downloadUpdate(manifest, (written, total) => {
        if (total > 0) setProgress(Math.min(1, written / total));
      });
      setProgress(1);
      setStatus('ready');
      const v = await getAppliedVersion();
      setAppliedVersion(v);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'فشل تحميل التحديث');
      setStatus('error');
    }
  }, [manifest]);

  const apply = useCallback(() => {
    applyUpdateNative();
  }, []);

  const dismiss = useCallback(() => {
    setStatus('idle');
    setManifest(null);
  }, []);

  const discard = useCallback(async () => {
    await discardDownloadedUpdate();
    const v = await getAppliedVersion();
    setAppliedVersion(v);
    setStatus('idle');
    setManifest(null);
  }, []);

  useEffect(() => {
    getAppliedVersion().then(setAppliedVersion).catch(() => {});
    // فحص صامت عند الإقلاع — لا يمنع استخدام التطبيق
    check();
  }, [check]);

  const value: OtaState = {
    status,
    manifest,
    appliedVersion,
    progress,
    errorMessage,
    check,
    download,
    apply,
    dismiss,
    discard,
  };

  return <OtaContext.Provider value={value}>{children}</OtaContext.Provider>;
}

export function useOta(): OtaState {
  const ctx = useContext(OtaContext);
  if (!ctx) throw new Error('useOta must be used within OtaProvider');
  return ctx;
}
