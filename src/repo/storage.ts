import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '../config';

/**
 * هل الـURI محلية وتحتاج رفعًا؟
 * أي قيمة لا تبدأ بـ http تُعتبر محلية (file:// أو content:// أو مسار).
 */
export function isLocalUri(uri: string): boolean {
  return typeof uri === 'string' && uri.length > 0 && !uri.startsWith('http');
}

/**
 * يرفع صورة محلية إلى Cloudinary (خطة مجانية) عبر preset غير موقّع،
 * ويعيد رابط التحميل الآمن (https).
 * Firebase Storage متروك: يتطلب خطة Blaze المدفوعة (قرار 10 أكتوبر 2026).
 */
export async function uploadImage(
  localUri: string,
  _folder: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: `img_${Date.now()}.jpg`,
  } as unknown as Blob);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(
      `Cloudinary upload failed (${res.status}): ${txt.slice(0, 200)}`,
    );
  }
  const json = (await res.json()) as { secure_url?: string };
  if (!json.secure_url) {
    throw new Error('Cloudinary upload: missing secure_url in response');
  }
  return json.secure_url;
}
