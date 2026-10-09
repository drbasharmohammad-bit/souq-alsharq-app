/**
 * @format
 */

import { AppRegistry, I18nManager } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// تفعيل RTL قبل تسجيل التطبيق
// @ts-ignore - allowRTL موجود في الأنواع الأحدث
if (typeof I18nManager.allowRTL === 'function') {
  I18nManager.allowRTL(true);
}
I18nManager.forceRTL(true);

AppRegistry.registerComponent(appName, () => App);
