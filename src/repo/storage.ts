import { getAuth } from '@react-native-firebase/auth';
import {
  getDownloadURL,
  getStorage,
  putFile,
  ref,
} from '@react-native-firebase/storage';

/**
 * هل الـURI محلية وتحتاج رفعًا؟
 * أي قيمة لا تبدأ بـ http تُعتبر محلية (file:// أو content:// أو مسار).
 */
export function isLocalUri(uri: string): boolean {
  return typeof uri === 'string' && uri.length > 0 && !uri.startsWith('http');
}

/**
 * يرفع صورة محلية إلى Storage تحت uploads/{uid}/{folder}/
 * ويعيد رابط التحميل (download URL).
 * عند غياب مستخدم مسجّل يُستخدم المجلد 'shared' (الكتابة فيه
 * محكومة بقواعد Storage وقد تُرفض — يُسجَّل الخطأ عند الاستدعاء).
 */
export async function uploadImage(
  localUri: string,
  folder: string,
): Promise<string> {
  const uid = getAuth().currentUser?.uid ?? 'shared';
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `uploads/${uid}/${folder}/${Date.now()}_${rand}.jpg`;
  const storageRef = ref(getStorage(), path);
  await putFile(storageRef, localUri);
  return getDownloadURL(storageRef);
}
