import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';

// لوحة تحكم المدير: إحصاءات حية + إجراءات سريعة — للمدير فقط
// تُستخدم كتبويب سفلي وكشاشة stack — لذا تستخدم useNavigation بدل props
export function AdminDashboardScreen() {
  const { user } = useAuth();
  const repo = useRepo();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  if (!user?.isAdmin) {
    return (
      <View style={styles.root}>
        <View style={styles.deniedWrap}>
          <AppIcon name="shield-alert" size={52} color={colors.danger} />
          <Text style={styles.denied}>هذه الصفحة للإدارة فقط</Text>
        </View>
      </View>
    );
  }

  const storesCount = repo.getStores().length;
  const pendingCount = repo.getListings({ status: 'pending' }).length;
  const usersCount = repo.getUsers().length;
  const doctorsCount = repo.getDoctors().length;
  const pendingSubs = repo.getSubscriptions().filter(s => s.status === 'pending').length;
  const pendingFeat = repo.getFeaturedRequests().filter(f => f.status === 'pending').length;

  const stats = [
    { icon: 'storefront', n: storesCount, t: 'المتاجر', c: colors.primary },
    { icon: 'clock-outline', n: pendingCount, t: 'بانتظار المراجعة', c: colors.gold },
    { icon: 'account-group', n: usersCount, t: 'المستخدمون', c: colors.info },
    { icon: 'stethoscope', n: doctorsCount, t: 'الأطباء', c: '#8E44AD' },
  ];

  const actions: {
    icon: string;
    t: string;
    c: string;
    badge?: number;
    go: () => void;
  }[] = [
    { icon: 'clipboard-check', t: 'مراجعة الإعلانات', c: colors.primary, badge: pendingCount, go: () => navigation.navigate('AdminReview') },
    { icon: 'storefront', t: 'إدارة المتاجر', c: '#0E6B4A', go: () => navigation.navigate('AdminStores') },
    { icon: 'stethoscope', t: 'الدليل الطبي', c: '#1E6FA3', go: () => navigation.navigate('AdminMedical') },
    { icon: 'image-multiple', t: 'البانرات', c: '#7A4A1F', go: () => navigation.navigate('AdminBanners') },
    { icon: 'bullhorn', t: 'الإعلانات العامة', c: colors.info, go: () => navigation.navigate('AdminAnnouncements') },
    { icon: 'account-group', t: 'المستخدمون', c: '#5D6D7E', go: () => navigation.navigate('AdminUsers') },
    { icon: 'receipt', t: 'الاشتراكات', c: colors.gold, badge: pendingSubs, go: () => navigation.navigate('AdminSubs') },
    { icon: 'star', t: 'طلبات التمييز', c: '#B7791F', badge: pendingFeat, go: () => navigation.navigate('AdminFeatured') },
    { icon: 'cog', t: 'الإعدادات', c: '#566573', go: () => navigation.navigate('AdminFeaturedSettings') },
  ];

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* الترويسة */}
      <View style={styles.header}>
        <View style={styles.shieldWrap}>
          <AppIcon name="shield-account" size={34} color={colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>لوحة المدير</Text>
          <Text style={styles.sub}>مرحبًا بعودتك — كل شيء تحت سيطرتك</Text>
        </View>
      </View>

      {/* إحصاءات حية */}
      <View style={styles.statsRow}>
        {stats.map(s => (
          <View key={s.t} style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: s.c + '18' }]}>
              <AppIcon name={s.icon} size={24} color={s.c} />
            </View>
            <Text style={styles.statNum}>{s.n}</Text>
            <Text style={styles.statLabel}>{s.t}</Text>
          </View>
        ))}
      </View>

      {/* إجراءات سريعة */}
      <Text style={styles.secTitle}>إجراءات سريعة</Text>
      <View style={styles.grid}>
        {actions.map(a => (
          <Pressable key={a.t} style={styles.cell} onPress={a.go}>
            <View style={[styles.cellIcon, { backgroundColor: a.c + '18' }]}>
              <AppIcon name={a.icon} size={26} color={a.c} />
              {a.badge != null && a.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{a.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cellLabel}>{a.t}</Text>
          </Pressable>
        ))}
      </View>

      {/* تصفح التطبيق كمدير */}
      <Pressable
        style={styles.browseBtn}
        onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}>
        <AppIcon name="eye" size={18} color={colors.white} />
        <Text style={styles.browseText}>تصفح التطبيق</Text>
      </Pressable>
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  deniedWrap: { alignItems: 'center', marginTop: 90, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  shieldWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.white },
  sub: { fontSize: fontSize.sm, color: colors.white, opacity: 0.85, marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.md, marginTop: -spacing.lg, gap: spacing.sm },
  stat: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center', elevation: 3,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: 6 },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  secTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, margin: spacing.md, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, gap: spacing.sm },
  cell: {
    width: '31.5%', backgroundColor: colors.card, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center', elevation: 2,
  },
  cellIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  cellLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text, marginTop: 8, textAlign: 'center' },
  badge: {
    position: 'absolute', top: -4, left: -4, minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.md,
    marginHorizontal: spacing.md, marginTop: spacing.lg, padding: spacing.md,
  },
  browseText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
});
