import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** تنقل آمن من خارج المكوّنات (مثل معالجات الإشعارات) */
export function navigate(name: 'Announcements') {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name);
  }
}
