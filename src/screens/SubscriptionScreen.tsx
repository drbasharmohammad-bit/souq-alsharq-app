import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { useAuth } from '../context/AuthContext';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

const STEPS = [
  { n: '1', t: 'حوّل مبلغ الاشتراك', d: 'حسب طريقة الدفع التي يعلنها التطبيق لاحقًا' },
  { n: '2', t: 'صوّر الإيصال', d: 'لقطة واضحة تظهر المبلغ والتاريخ' },
  { n: '3', t: 'ارفع الصورة هنا', d: 'تراجعها الإدارة ويُفعَّل اشتراكك خلال 24 ساعة' },
];

export function SubscriptionScreen() {
  const { user } = useAuth();
  const repo = useRepo();
  const [picked, setPicked] = useState(false);

  const sub = user ? repo.getUserSubscription(user.id) : undefined;

  const upload = () => {
    // وهمي: اختيار صورة — في النسخة النهائية image-picker حقيقي
    Alert.alert('اختيار صورة', 'في النسخة النهائية ستفتح معرض الصور هنا', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'اختيار صورة تجريبية',
        onPress: () => {
          if (!user) return;
          repo.addSubscription({ userId: user.id, storeId: user.storeId, plan: 'monthly', status: 'pending' });
          setPicked(true);
        },
      },
    ]);
  };

  if (user?.accountType !== 'merchant') {
    return (
      <View style={styles.root}>
        <View style={styles.emptyWrap}>
          <AppIcon name="storefront" size={52} color={colors.textMuted} />
          <Text style={styles.empty}>صفحة الاشتراك مخصصة لأصحاب المتاجر</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <View style={styles.titleRow}>
        <AppIcon name="credit-card" size={26} color={colors.primary} />
        <Text style={styles.title}>اشتراك المتجر</Text>
      </View>

      {sub && (
        <View style={[styles.statusBox, sub.status === 'active' ? styles.ok : styles.wait]}>
          <View style={styles.statusRow}>
            <AppIcon
              name={sub.status === 'active' ? 'check-circle' : sub.status === 'pending' ? 'clock' : 'close-circle'}
              size={20}
              color={sub.status === 'active' ? colors.verifiedText : sub.status === 'pending' ? '#8A6D14' : colors.danger}
            />
            <Text style={styles.statusText}>
              {sub.status === 'active' ? 'اشتراكك مفعّل' : sub.status === 'pending' ? 'اشتراكك قيد المراجعة' : 'الاشتراك منتهي'}
            </Text>
          </View>
        </View>
      )}

      {/* الخطط */}
      <View style={styles.plan}>
        <Text style={styles.planTag}>فترة الانطلاق</Text>
        <Text style={styles.planName}>الخطة المجانية</Text>
        <Text style={styles.planPrice}>مجانًا</Text>
        <Text style={styles.planDesc}>انشر منتجاتك ومتجرك مجانًا خلال فترة الانطلاق</Text>
      </View>

      <View style={[styles.plan, styles.planPro]}>
        <Text style={styles.planTag}>الأكثر تميزًا</Text>
        <Text style={styles.planName}>الاشتراك الشهري</Text>
        <Text style={styles.planPrice}>السعر يُعلن لاحقًا</Text>
        <Text style={styles.planDesc}>متجر موثق + أولوية الظهور + دعم مباشر</Text>
      </View>

      {/* خطوات الدفع بالإيصال */}
      <View style={styles.secTitleRow}>
        <AppIcon name="receipt" size={20} color={colors.text} />
        <Text style={styles.secTitlePlain}>الدفع بالإيصال</Text>
      </View>
      {STEPS.map(s => (
        <View key={s.n} style={styles.step}>
          <View style={styles.stepNum}>
            <Text style={styles.stepNumText}>{s.n}</Text>
          </View>
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>{s.t}</Text>
            <Text style={styles.stepDesc}>{s.d}</Text>
          </View>
        </View>
      ))}

      <Pressable style={styles.btn} onPress={upload}>
        <View style={styles.btnRow}>
          <AppIcon name="upload" size={18} color={colors.white} />
          <Text style={styles.btnText}>رفع إيصال</Text>
        </View>
      </Pressable>
      {picked && (
        <View style={styles.pickedRow}>
          <AppIcon name="check-circle" size={18} color={colors.verifiedText} />
          <Text style={styles.picked}>تم رفع الإيصال — قيد المراجعة</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pickedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.sm },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
  statusBox: { borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, alignItems: 'center' },
  ok: { backgroundColor: colors.verifiedBg },
  wait: { backgroundColor: '#FFF4D6' },
  statusText: { fontWeight: '800', fontSize: fontSize.md, color: colors.text },
  plan: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  planPro: { borderColor: colors.gold, borderWidth: 2 },
  planTag: { fontSize: fontSize.xs, fontWeight: '800', color: colors.primary },
  planName: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginTop: 4 },
  planPrice: { fontSize: fontSize.xl, fontWeight: '800', color: colors.gold, marginTop: 4 },
  planDesc: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4, lineHeight: 22 },
  secTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xl, marginBottom: spacing.sm },
  secTitlePlain: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  secTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  step: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center' },
  stepNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  stepBody: { flex: 1, marginStart: spacing.md },
  stepTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  stepDesc: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  picked: { textAlign: 'center', color: colors.verifiedText, fontWeight: '700' },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
});
