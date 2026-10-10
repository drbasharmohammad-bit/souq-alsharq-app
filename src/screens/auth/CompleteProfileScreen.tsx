import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth } from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { FormField } from '../../components/FormField';
import { ADMIN_EMAIL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, spacing } from '../../theme';
import { AccountType } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteProfile'>;

const normEmail = (e?: string | null) => (e ?? '').trim().toLowerCase();

export function CompleteProfileScreen({ navigation }: Props) {
  const { completeProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<AccountType | null>(null);
  const [busy, setBusy] = useState(false);

  // المدير يُتجاوز اختيار نوع الحساب — يذهب مباشرة للوحة المدير
  const isAdminEmail =
    normEmail(getAuth().currentUser?.email) === normEmail(ADMIN_EMAIL);

  const save = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      Alert.alert('تنبيه', 'أدخل رقم تواصل صحيحًا (9 أرقام على الأقل)');
      return;
    }
    const finalType: AccountType = isAdminEmail ? 'individual' : type ?? 'individual';
    if (!isAdminEmail && !type) {
      Alert.alert('تنبيه', 'اختر نوع الحساب');
      return;
    }
    setBusy(true);
    try {
      const u = await completeProfile(phone, finalType);
      if (u.isAdmin) {
        navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
      } else if (u.accountType === 'merchant') {
        navigation.replace('CreateStore');
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      }
    } catch (e) {
      Alert.alert('تعذر الحفظ', e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
    } finally {
      setBusy(false);
    }
  };

  const Card = ({ value, icon, title, desc }: { value: AccountType; icon: string; title: string; desc: string }) => {
    const selected = type === value;
    return (
      <Pressable
        style={[styles.card, selected && styles.cardSelected]}
        onPress={() => setType(value)}>
        <AppIcon name={icon} size={44} color={selected ? colors.primary : colors.textMuted} />
        <Text style={[styles.cardTitle, selected && styles.cardTitleSelected]}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
        {selected && (
          <View style={styles.checkRow}>
            <AppIcon name="check-circle" size={18} color={colors.primary} />
            <Text style={styles.checkText}>مُختار</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <AppIcon name="account-check" size={64} color={colors.primary} />
      <Text style={styles.title}>خطوة أخيرة</Text>
      <Text style={styles.sub}>أكمل بياناتك لمرة واحدة فقط</Text>

      <View style={styles.fieldWrap}>
        <FormField
          label="رقم التواصل"
          value={phone}
          onChange={setPhone}
          placeholder="09xxxxxxxx"
          keyboardType="phone-pad"
          required
        />
        <Text style={styles.hint}>يظهر هذا الرقم للمشترين للاتصال بك — للتواصل فقط</Text>
      </View>

      {isAdminEmail ? null : <Text style={styles.typeTitle}>كيف ستستخدم التطبيق؟</Text>}
      {isAdminEmail ? (
        <View style={styles.adminNote}>
          <AppIcon name="shield-account" size={40} color={colors.primary} />
          <Text style={styles.adminTitle}>حساب الإدارة</Text>
          <Text style={styles.adminDesc}>
            تم التعرف على إيميل الإدارة — ستدخل مباشرة إلى لوحة المدير بكل الصلاحيات، دون الحاجة لاختيار نوع حساب.
          </Text>
        </View>
      ) : (
        <View style={styles.cards}>
          <Card
            value="merchant"
            icon="storefront"
            title="صاحب متجر"
            desc="سجّل بيانات متجرك ونوعه — صفحة متجر كاملة بمنتجات وتقييمات"
          />
          <Card
            value="individual"
            icon="account"
            title="بائع حر"
            desc="انشر إعلاناتك في أي قسم: شقة، سيارة، خدمة، حتى مطعم بيتي — مجانًا"
          />
        </View>
      )}

      <Pressable style={[styles.btn, busy && styles.btnBusy]} onPress={save} disabled={busy}>
        <Text style={styles.btnText}>{busy ? 'جاري الحفظ...' : 'حفظ والمتابعة'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { alignItems: 'center', padding: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 },
  fieldWrap: { width: '100%', marginTop: spacing.lg },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  typeTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing.lg, width: '100%' },
  cards: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, width: '100%' },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: '#F4FAF7' },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.textMuted, marginTop: spacing.sm },
  cardTitleSelected: { color: colors.primary },
  cardDesc: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  checkText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
  adminNote: {
    width: '100%', backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.primary,
    padding: spacing.lg, alignItems: 'center', marginTop: spacing.sm,
  },
  adminTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary, marginTop: spacing.sm },
  adminDesc: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 22 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, width: '100%', alignItems: 'center', marginTop: spacing.xl },
  btnBusy: { opacity: 0.7 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
});
