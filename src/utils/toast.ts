import { Alert, Platform, ToastAndroid } from 'react-native';

// رسالة خفيفة لا تعلق التطبيق — للوجهات المحذوفة وغيرها
export function showToast(msg: string): void {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert('', msg);
  }
}
