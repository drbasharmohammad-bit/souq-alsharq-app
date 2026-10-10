/**
 * إعدادات التحديث الهوائي (OTA) لتطبيق HDR.
 *
 * الفكرة: إصلاحات كود JS والتصميم تُدفع مباشرة للأجهزة دون بناء APK جديد.
 * - الـAPK الجديد يُبنى فقط عند تغيير الكود الأصلي (native) أو إضافة مكتبات.
 * - كل ما عداه (منطق، شاشات، نصوص، ألوان) يصل عبر OTA في دقائق.
 */

/** يُرفع هذا الرقم فقط عند تغيير الكود الأصلي؛ التحديثات ذات runtime مختلف تُتجاهل */
export const OTA_RUNTIME = '1';

/** نسخة الـbundle المدمجة في الـAPK — تُحدّث يدويًا عند كل إصدار APK جديد */
export const BUILT_IN_OTA_VERSION = '1.0.0';

/**
 * رابط ملف الـmanifest.
 * خطوة لمرة واحدة: فعّل Firebase Storage لمشروع souq-alsharq-app من الكونسول
 * (مجاني — خطة Spark)، ثم ارفع manifest.json إلى admin/ota/hdr/
 */
export const OTA_MANIFEST_URL =
  'https://firebasestorage.googleapis.com/v0/b/souq-alsharq-app.firebasestorage.app' +
  '/o/admin%2Fota%2Fhdr%2Fmanifest.json?alt=media';

export const OTA_CHECK_TIMEOUT_MS = 8000;

export interface OtaManifest {
  /** يجب أن يطابق OTA_RUNTIME وإلا تُجاهل التحديث */
  runtime: string;
  /** نسخة التحديث، مثال: "1.0.1" */
  version: string;
  /** رابط حزمة الـJS (Hermes bytecode) */
  bundleUrl: string;
  /** بصمة SHA256 للحزمة — يتحقق منها الكود الأصلي قبل التحميل */
  sha256: string;
  /** أقل versionCode للـAPK يقبل هذا التحديث */
  minAppVersionCode: number;
  /** ملاحظات الإصدار بالعربية (اختياري) */
  releaseNotes?: string;
  /** تاريخ النشر ISO (اختياري) */
  publishedAt?: string;
}

export type OtaCheckResult =
  | { available: false; reason: 'up-to-date' | 'offline' | 'runtime-mismatch' | 'error'; }
  | { available: true; manifest: OtaManifest; };

/** مقارنة نسخ بسيطة: ترجع >0 إن كانت a أحدث من b */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((x) => parseInt(x, 10) || 0);
  const pb = b.split('.').map((x) => parseInt(x, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
