import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FormField } from '../../components/FormField';
import { PlaceholderImage } from '../../components/PlaceholderImage';
import { RootStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

export function PhoneScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');

  const next = () => {
    const p = phone.replace(/\s/g, '');
    if (p.length < 9) {
      Alert.alert('تنبيه', 'أدخل رقم هاتف صحيح');
      return;
    }
    navigation.navigate('Otp', { phone: p });
  };

  return (
    <View style={styles.root}>
      <PlaceholderImage icon="📱" color={colors.primary} size={88} />
      <Text style={styles.title}>تسجيل الدخول</Text>
      <Text style={styles.sub}>أدخل رقم هاتفك وسنرسل لك رمز تحقق</Text>
      <View style={styles.form}>
        <FormField
          label="رقم الهاتف"
          value={phone}
          onChange={setPhone}
          placeholder="09xxxxxxxx"
          keyboardType="phone-pad"
        />
        <Pressable style={styles.btn} onPress={next}>
          <Text style={styles.btnText}>إرسال رمز التحقق ←</Text>
        </Pressable>
        <Text style={styles.hint}>وضع تجريبي: أي رمز تحقق من 4 أرقام سيُقبل</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, alignItems: 'center', padding: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  form: { width: '100%', marginTop: spacing.xl },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
