import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { PlaceholderImage } from '../../components/PlaceholderImage';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GoogleLogin'>;

export function GoogleLoginScreen({ navigation }: Props) {
  const { user, loading, needsProfile, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  // توجيه تلقائي بعد نجاح الدخول
  useEffect(() => {
    if (loading) return;
    if (needsProfile) {
      navigation.replace('CompleteProfile');
    } else if (user) {
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    }
  }, [user, needsProfile, loading, navigation]);

  const go = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      Alert.alert('تعذر الدخول', e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <PlaceholderImage icon="storefront" color={colors.primary} size={88} />
      <Text style={styles.title}>تسجيل الدخول</Text>
      <Text style={styles.sub}>
        ادخل بحساب جوجل الخاص بك — رقم الهاتف سيُطلب لمرة واحدة فقط ليتمكن المشترون من التواصل معك
      </Text>

      <Pressable style={[styles.btn, busy && styles.btnBusy]} onPress={go} disabled={busy}>
        <View style={styles.btnRow}>
          <AppIcon name="google" size={20} color={colors.white} />
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.btnText}>الدخول بحساب جوجل</Text>
          )}
        </View>
      </Pressable>

      <View style={styles.noteRow}>
        <AppIcon name="shield-check" size={16} color={colors.textMuted} />
        <Text style={styles.note}>دخول آمن وسريع — بلا رموز تحقق وبلا انتظار</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xl, width: '100%', alignItems: 'center' },
  btnBusy: { opacity: 0.7 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  note: { fontSize: fontSize.xs, color: colors.textMuted },
});
