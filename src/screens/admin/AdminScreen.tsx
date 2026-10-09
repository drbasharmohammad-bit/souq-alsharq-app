import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { PlaceholderImage } from '../../components/PlaceholderImage';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Admin'>;

export function AdminScreen({ navigation }: Props) {
  const { user } = useAuth();
  const repo = useRepo();

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

  const stores = repo.getStores().length;
  const listings = repo.getListings().length;
  const pending = repo.getListings({ status: 'pending' }).length;
  const subs = repo.getSubscriptions().length;
  const pendingSubs = repo.getSubscriptions().filter(s => s.status === 'pending').length;
  const usersCount = repo.getUsers().length;
  const annsCount = repo.getAnnouncements().length;
  const bannersCount = repo.getBanners().filter(b => b.active).length;
  const pendingFeat = repo.getFeaturedRequests().filter(f => f.status === 'pending').length;

  const stats = [
    { icon: 'store', n: stores, t: 'المتاجر' },
    { icon: 'bullhorn', n: listings, t: 'الإعلانات' },
    { icon: 'clock', n: pending, t: 'قيد المراجعة' },
    { icon: 'credit-card', n: subs, t: 'الاشتراكات' },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <PlaceholderImage icon="shield-account" color={colors.primary} size={72} />
      <Text style={styles.title}>لوحة الإدارة</Text>

      <View style={styles.grid}>
        {stats.map(s => (
          <View key={s.t} style={styles.stat}>
            <AppIcon name={s.icon} size={32} color={colors.primary} />
            <Text style={styles.statNum}>{s.n}</Text>
            <Text style={styles.statLabel}>{s.t}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.btn} onPress={() => navigation.navigate('AdminReview')}>
        <View style={styles.btnRow}>
          <AppIcon name="clock" size={18} color={colors.white} />
          <Text style={styles.btnText}>مراجعة الإعلانات {pending > 0 ? `(${pending})` : ''}</Text>
        </View>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnGold]} onPress={() => navigation.navigate('AdminSubs')}>
        <View style={styles.btnRow}>
          <AppIcon name="receipt" size={18} color={colors.white} />
          <Text style={styles.btnText}>مراجعة إيصالات الاشتراكات {pendingSubs > 0 ? `(${pendingSubs})` : ''}</Text>
        </View>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnInfo]} onPress={() => navigation.navigate('AdminUsers')}>
        <View style={styles.btnRow}>
          <AppIcon name="account-group" size={18} color={colors.white} />
          <Text style={styles.btnText}>إدارة المستخدمين ({usersCount})</Text>
        </View>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnInfo]} onPress={() => navigation.navigate('AdminAnnouncements')}>
        <View style={styles.btnRow}>
          <AppIcon name="bullhorn" size={18} color={colors.white} />
          <Text style={styles.btnText}>الإعلانات الإدارية ({annsCount})</Text>
        </View>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnInfo]} onPress={() => navigation.navigate('AdminBanners')}>
        <View style={styles.btnRow}>
          <AppIcon name="image-multiple" size={18} color={colors.white} />
          <Text style={styles.btnText}>بانرات الواجهة ({bannersCount})</Text>
        </View>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnGold]} onPress={() => navigation.navigate('AdminFeatured')}>
        <View style={styles.btnRow}>
          <AppIcon name="star" size={18} color={colors.white} />
          <Text style={styles.btnText}>الإعلانات المميزة {pendingFeat > 0 ? `(${pendingFeat})` : ''}</Text>
        </View>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnInfo]} onPress={() => navigation.navigate('AdminFeaturedSettings')}>
        <View style={styles.btnRow}>
          <AppIcon name="cog" size={18} color={colors.white} />
          <Text style={styles.btnText}>إعدادات التمييز</Text>
        </View>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnInfo]} onPress={() => navigation.navigate('AdminMedical')}>
        <View style={styles.btnRow}>
          <AppIcon name="stethoscope" size={18} color={colors.white} />
          <Text style={styles.btnText}>الدليل الطبي</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.lg, alignItems: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.lg, width: '100%' },
  stat: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    margin: '1.5%',
    alignItems: 'center',
    elevation: 1,
  },
  statNum: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary, marginTop: 4 },
  statLabel: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg, width: '100%', alignItems: 'center' },
  btnInfo: { backgroundColor: colors.info },
  btnGold: { backgroundColor: colors.gold },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  deniedWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
