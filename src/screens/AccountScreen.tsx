import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { useAuth, useMyStore } from '../context/AuthContext';
import { TabsParamList, RootStackParamList } from '../navigation/types';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function AccountScreen({ navigation }: Props) {
  const { user, loading, logout } = useAuth();
  const store = useMyStore();

  if (loading) {
    return (
      <View style={styles.root}>
        <Text style={styles.loading}>جاري التحميل...</Text>
      </View>
    );
  }

  // زائر — شاشة تعريفية
  if (!user) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
        <PlaceholderImage icon="👤" color={colors.primary} size={88} />
        <Text style={styles.title}>مرحبًا بك في سوق الشرق</Text>
        <Text style={styles.sub}>سجّل دخولك لتتمكن من نشر الإعلانات وإدارة متجرك</Text>

        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('Phone')}>
          <Text style={styles.btnText}>تسجيل الدخول برقم الهاتف 📱</Text>
        </Pressable>

        <View style={styles.types}>
          <View style={styles.typeCard}>
            <Text style={styles.typeIcon}>🏬</Text>
            <Text style={styles.typeTitle}>حساب تاجر</Text>
            <Text style={styles.typeDesc}>أنشئ متجرك واعرض منتجاتك — اشتراك شهري</Text>
          </View>
          <View style={styles.typeCard}>
            <Text style={styles.typeIcon}>👤</Text>
            <Text style={styles.typeTitle}>حساب فرد</Text>
            <Text style={styles.typeDesc}>انشر إعلاناتك مباشرة — مجانًا</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const isMerchant = user.accountType === 'merchant';

  const doLogout = () => {
    Alert.alert('تسجيل الخروج', 'متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const Row = ({ icon, label, onPress, danger }: { icon: string; label: string; onPress: () => void; danger?: boolean }) => (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && styles.rowDanger]}>{label}</Text>
      <Text style={styles.rowGo}>‹</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <PlaceholderImage icon={isMerchant ? '🏬' : '👤'} color={colors.primary} size={72} />
      <Text style={styles.title}>{isMerchant && store ? store.name : 'حسابي'}</Text>
      <Text style={styles.sub}>
        {isMerchant ? '🏬 حساب تاجر' : '👤 حساب فرد'} • 📞 {user.phone}
        {user.isAdmin ? ' • 🛡️ مدير' : ''}
      </Text>

      <View style={styles.menu}>
        <Row icon="📋" label="إعلاناتي" onPress={() => navigation.navigate('MyAds')} />
        {isMerchant && (
          <Row icon="💳" label="اشتراك المتجر" onPress={() => navigation.navigate('Subscription')} />
        )}
        {user.isAdmin && (
          <Row icon="🛡️" label="لوحة الإدارة" onPress={() => navigation.navigate('Admin')} />
        )}
        <Row icon="🚪" label="تسجيل الخروج" onPress={doLogout} danger />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { alignItems: 'center', padding: spacing.xl },
  loading: { textAlign: 'center', marginTop: 80, color: colors.textMuted },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  btn: { borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xl, width: '100%', alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  types: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, width: '100%' },
  typeCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', elevation: 1 },
  typeIcon: { fontSize: 36 },
  typeTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  typeDesc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  menu: { width: '100%', marginTop: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowIcon: { fontSize: 22 },
  rowLabel: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginStart: spacing.md },
  rowDanger: { color: colors.danger },
  rowGo: { fontSize: fontSize.xl, color: colors.textMuted },
});
