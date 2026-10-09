import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FormField } from '../../components/FormField';
import { PlaceholderImage } from '../../components/PlaceholderImage';
import { RootStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export function OtpScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [code, setCode] = useState('');

  const verify = () => {
    if (code.replace(/\s/g, '').length !== 4) {
      Alert.alert('تنبيه', 'رمز التحقق 4 أرقام');
      return;
    }
    // وهمي: أي رمز من 4 أرقام يُقبل
    navigation.replace('AccountType', { phone });
  };

  return (
    <View style={styles.root}>
      <PlaceholderImage icon="🔐" color={colors.primary} size={88} />
      <Text style={styles.title}>رمز التحقق</Text>
      <Text style={styles.sub}>أُرسل الرمز إلى {phone}</Text>
      <View style={styles.form}>
        <FormField
          label="رمز التحقق"
          value={code}
          onChange={setCode}
          placeholder="••••"
          keyboardType="numeric"
        />
        <Pressable style={styles.btn} onPress={verify}>
          <Text style={styles.btnText}>تحقق ←</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, alignItems: 'center', padding: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm },
  form: { width: '100%', marginTop: spacing.xl },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
});
