import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
  subscribeToTopic,
} from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { navigate } from '../navigation/navigationRef';

const TOPIC_ALL = 'all';
let initialized = false;

/**
 * تهيئة الإشعارات الفورية FCM:
 * - طلب إذن الإشعارات عند أول إطلاق
 * - الاشتراك التلقائي بموضوع `all` (إعلانات الإدارة تصل للجميع)
 * - التطبيق مفتوح: تنبيه داخل التطبيق
 * - التطبيق بالخلفية/مغلق: الضغط على الإشعار يفتح شاشة الإعلانات
 */
export async function initFcm(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const messaging = getMessaging();
    const status = await requestPermission(messaging);
    const enabled =
      status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await subscribeToTopic(messaging, TOPIC_ALL);
    }

    // رسالة أثناء فتح التطبيق: تنبيه داخلي
    onMessage(messaging, async remoteMessage => {
      const title = remoteMessage.notification?.title ?? 'إعلان جديد';
      const bodyText = remoteMessage.notification?.body ?? '';
      Alert.alert(title, bodyText, [
        { text: 'عرض الإعلانات', onPress: () => navigate('Announcements') },
        { text: 'إغلاق', style: 'cancel' },
      ]);
    });

    // الضغط على إشعار والتطبيق بالخلفية
    onNotificationOpenedApp(messaging, () => {
      navigate('Announcements');
    });

    // الضغط على إشعار والتطبيق مغلق تمامًا
    const initial = await getInitialNotification(messaging);
    if (initial) {
      setTimeout(() => navigate('Announcements'), 800);
    }
  } catch {
    // FCM غير متاح (بلا خدمات Google) — التطبيق يعمل طبيعيًا بدونه
  }
}
