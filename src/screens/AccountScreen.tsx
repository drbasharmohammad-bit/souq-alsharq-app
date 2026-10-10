import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
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
        <PlaceholderImage icon="account" color={colors.primary} size={88} />
        <Text style={styles.title}>مرحبًا بك في HDR</Text>
        <Text style={styles.sub}>سجّل دخولك لتتمكن من نشر الإعلانات وإدارة متجرك</Text>

        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('GoogleLogin')}>
          <View style={styles.btnRow}>
            <AppIcon name="google" size={18} color={colors.white} />
            <Text style={styles.btnText}>تسجيل الدخول بحساب جوجل</Text>
          </View>
        </Pressable>

        <View style={styles.types}>
          <View style={styles.typeCard}>
            <AppIcon name="storefront" size={38} color={colors.primary} />
            <Text style={styles.typeTitle}>صاحب متجر</Text>
            <Text style={styles.typeDesc}>أنشئ متجرك واعرض منتجاتك — اشتراك شهري</Text>
          </View>
          <View style={styles.typeCard}>
            <AppIcon name="account" size={38} color={colors.primary} />
            <Text style={styles.typeTitle}>بائع حر</Text>
            <Text style={styles.typeDesc}>انشر إعلاناتك في أي قسم — مجانًا</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const isMerchant = user.accountType === 'merchant';

  const displayName = user.displayName?.trim() || (isMerchant && store ? store.name : 'حسابي');

  const doLogout = () => {
    Alert.alert('تسجيل الخروج', 'متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const Row = ({ icon, label, onPress, danger }: { icon: string; label: string; onPress: () => void; danger?: boolean }) => (
    <Pressable style={styles.row} onPress={onPress}>
      <AppIcon name={icon} size={22} color={danger ? colors.danger : colors.primary} />
      <Text style={[styles.rowLabel, danger && styles.rowDanger]}>{label}</Text>
      <Text style={styles.rowGo}>‹</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <PlaceholderImage icon={isMerchant ? 'storefront' : 'account'} color={colors.primary} size={72} />
      <Text style={styles.title}>{displayName}</Text>
      <View style={styles.subRow}>
        <AppIcon name={isMerchant ? 'storefront' : 'account'} size={15} color={colors.textMuted} />
        <Text style={styles.sub}>{isMerchant ? 'صاحب متجر' : 'بائع حر'}</Text>
        {user.phone ? (
          <>
            <AppIcon name="phone" size={15} color={colors.textMuted} />
            <Text style={styles.sub}>{user.phone}</Text>
          </>
        ) : null}
        {user.email ? (
          <>
            <AppIcon name="email" size={15} color={colors.textMuted} />
            <Text style={styles.sub}>{user.email}</Text>
          </>
        ) : null}
        {user.isAdmin && <AppIcon name="shield-account" size={15} color={colors.gold} />}
        {user.isAdmin && <Text style={styles.sub}>مدير</Text>}
      </View>

      <View style={styles.menu}>
        <Row icon="format-list-bulleted" label="إعلاناتي" onPress={() => navigation.navigate('MyAds')} />
        <Row icon="bullhorn" label="إعلانات الإدارة" onPress={() => navigation.navigate('Announcements')} />
        {isMerchant && (
          <Row icon="package-variant" label="أصناف متجري" onPress={() => navigation.navigate('StoreProducts')} />
        )}
        {isMerchant && (
          <Row icon="store-edit" label="تعديل المتجر" onPress={() => navigation.navigate('EditStore')} />
        )}
        {isMerchant && (
          <Row icon="credit-card" label="اشتراك المتجر" onPress={() => navigation.navigate('Subscription')} />
        )}
        {isMerchant && (
          <Row icon="star" label="ميّز إعلانك بالبانر الرئيسي" onPress={() => navigation.navigate('FeaturedAd')} />
        )}
        {user.isAdmin && (
          <Row icon="shield-account" label="لوحة الإدارة" onPress={() => navigation.navigate('Admin')} />
        )}
        <Row icon="logout" label="تسجيل الخروج" onPress={doLogout} danger />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { alignItems: 'center', padding: spacing.xl },
  loading: { textAlign: 'center', marginTop: 80, color: colors.textMuted },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: spacing.sm, flexWrap: 'wrap' },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btn: { borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xl, width: '100%', alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  types: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, width: '100%' },
  typeCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', elevation: 1 },
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
  rowLabel: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginStart: spacing.md },
  rowDanger: { color: colors.danger },
  rowGo: { fontSize: fontSize.xl, color: colors.textMuted },
});
