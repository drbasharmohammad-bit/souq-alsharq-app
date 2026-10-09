/**
 * @format
 */

import { AppRegistry, I18nManager } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// معالج رسائل الخلفية (إلزامي خارج دورة حياة React)
setBackgroundMessageHandler(getMessaging(), async () => {
  // إشعارات `notification` يعرضها النظام تلقائيًا؛ لا حاجة لعمل إضافي
});

// تفعيل RTL قبل تسجيل التطبيق
// @ts-ignore - allowRTL موجود في الأنواع الأحدث
if (typeof I18nManager.allowRTL === 'function') {
  I18nManager.allowRTL(true);
}
I18nManager.forceRTL(true);

AppRegistry.registerComponent(appName, () => App);
