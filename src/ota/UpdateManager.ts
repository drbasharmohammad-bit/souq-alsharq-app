/**
 * مدير التحديث الهوائي (OTA) لتطبيق HDR.
 *
 * التدفق:
 *  1. checkForUpdate() — يجلب الـmanifest ويقارن النسخ (مهلة 8 ثوانٍ، صامت عند انقطاع النت).
 *  2. downloadUpdate() — يحمّل الحزمة إلى filesDir/ota/ ويكتب meta.json.
 *  3. applyUpdate() — إعادة تشغيل التطبيق؛ الكود الأصلي يتحقق من السلامة ويحمّل الحزمة.
 *
 * الأمان: HTTPS + تحقق SHA256 في الكود الأصلي قبل كل إقلاع + تجاهل الحزمة عند تحديث الـAPK.
 * الأوفلاين: الفحص أفضل جهد (best-effort) ولا يمنع الإقلاع أبدًا.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import RNRestart from 'react-native-restart';
import {
  BUILT_IN_OTA_VERSION,
  OTA_CHECK_TIMEOUT_MS,
  OTA_MANIFEST_URL,
  OTA_RUNTIME,
  OtaCheckResult,
  OtaManifest,
  compareVersions,
} from './otaConfig';

const STORAGE_KEY_VERSION = 'hdr_ota_version';
const OTA_DIR_NAME = 'ota';
const BUNDLE_FILE = 'index.android.bundle';
const META_FILE = 'meta.json';
const TMP_SUFFIX = '.tmp';

const { fs } = ReactNativeBlobUtil;
const otaDir = () => `${fs.dirs.DocumentDir}/${OTA_DIR_NAME}`;
const bundlePath = () => `${otaDir()}/${BUNDLE_FILE}`;
const metaPath = () => `${otaDir()}/${META_FILE}`;

async function getCurrentVersion(): Promise<string> {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY_VERSION);
    return v || BUILT_IN_OTA_VERSION;
  } catch {
    return BUILT_IN_OTA_VERSION;
  }
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** فحص صامت: لا يرمي استثناءً أبدًا — يعيد سببًا عند الفشل */
export async function checkForUpdate(): Promise<OtaCheckResult> {
  try {
    const res = await fetchWithTimeout(OTA_MANIFEST_URL, OTA_CHECK_TIMEOUT_MS);
    if (!res.ok) return { available: false, reason: 'error' };
    const manifest = (await res.json()) as OtaManifest;

    if (!manifest || typeof manifest.version !== 'string' || !manifest.bundleUrl) {
      return { available: false, reason: 'error' };
    }
    if (manifest.runtime !== OTA_RUNTIME) {
      return { available: false, reason: 'runtime-mismatch' };
    }
    const current = await getCurrentVersion();
    if (compareVersions(manifest.version, current) <= 0) {
      return { available: false, reason: 'up-to-date' };
    }
    return { available: true, manifest };
  } catch {
    return { available: false, reason: 'offline' };
  }
}

export type DownloadProgress = (written: number, total: number) => void;

/**
 * تحميل التحديث وحفظه. عند النجاح تُحفظ النسخة ويصبح التحديث جاهزًا للتطبيق.
 * يرمي استثناءً برسالة عربية عند الفشل.
 */
export async function downloadUpdate(
  manifest: OtaManifest,
  onProgress?: DownloadProgress,
): Promise<void> {
  const dir = otaDir();
  const tmpBundle = `${bundlePath()}${TMP_SUFFIX}`;
  const tmpMeta = `${metaPath()}${TMP_SUFFIX}`;

  try {
    if (!(await fs.exists(dir))) {
      await fs.mkdir(dir);
    }

    // 1) تحميل الحزمة إلى ملف مؤقت
    const dl = ReactNativeBlobUtil.config({ path: tmpBundle }).fetch('GET', manifest.bundleUrl);
    if (onProgress) {
      dl.progress((received, total) => onProgress(received, total));
    }
    const res = await dl;
    const status = res.info().status;
    if (status < 200 || status >= 300) {
      throw new Error(`فشل التحميل (رمز ${status})`);
    }
    const stat = await fs.stat(tmpBundle);
    if (!stat || Number(stat.size) < 1024) {
      throw new Error('ملف التحديث تالف (حجم غير صالح)');
    }

    // 2) كتابة meta.json المؤقت (يحمل البصمة للتحقق الأصلي)
    const meta = JSON.stringify({
      version: manifest.version,
      sha256: manifest.sha256,
      downloadedAt: new Date().toISOString(),
    });
    await fs.writeFile(tmpMeta, meta, 'utf8');

    // 3) النقل الذري إلى الأسماء النهائية
    if (await fs.exists(bundlePath())) await fs.unlink(bundlePath());
    if (await fs.exists(metaPath())) await fs.unlink(metaPath());
    await fs.mv(tmpBundle, bundlePath());
    await fs.mv(tmpMeta, metaPath());

    // 4) حفظ النسخة — تُقرأ عند المقارنة في الفحص القادم
    await AsyncStorage.setItem(STORAGE_KEY_VERSION, manifest.version);
  } catch (e) {
    // تنظيف الملفات المؤقتة عند الفشل
    try {
      if (await fs.exists(tmpBundle)) await fs.unlink(tmpBundle);
      if (await fs.exists(tmpMeta)) await fs.unlink(tmpMeta);
    } catch {
      /* تجاهل */
    }
    throw e instanceof Error ? e : new Error('فشل تحميل التحديث');
  }
}

/** إعادة تشغيل التطبيق لتطبيق الحزمة المحمّلة */
export function applyUpdate(): void {
  RNRestart.restart();
}

/** حذف تحديث محمّل (رجوع للحزمة المدمجة) */
export async function discardDownloadedUpdate(): Promise<void> {
  try {
    if (await fs.exists(bundlePath())) await fs.unlink(bundlePath());
    if (await fs.exists(metaPath())) await fs.unlink(metaPath());
    await AsyncStorage.setItem(STORAGE_KEY_VERSION, BUILT_IN_OTA_VERSION);
  } catch {
    /* تجاهل */
  }
}

/** نسخة التحديث المطبقة حاليًا (المدمجة أو المحمّلة) */
export async function getAppliedVersion(): Promise<string> {
  return getCurrentVersion();
}
