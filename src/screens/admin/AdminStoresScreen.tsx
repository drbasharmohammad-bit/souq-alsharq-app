import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { RemoteImage } from '../../components/RemoteImage';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminStores'>;

// إدارة المتاجر: توثيق / تمييز / حذف — للمدير فقط
export function AdminStoresScreen({ navigation }: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const [q, setQ] = useState('');

  const stores = useMemo(() => {
    const all = repo.getStores();
    const query = q.trim();
    return query ? all.filter(s => s.name.includes(query)) : all;
  }, [repo, q]);

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

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'حذف المتجر',
      `سيُحذف «${name}» نهائيًا مع منتجاته وتصنيفاته. متابعة؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => repo.deleteStore(id),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.searchWrap}>
        <AppIcon name="magnify" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.search}
          placeholder="ابحث باسم المتجر..."
          placeholderTextColor={colors.textMuted}
          value={q}
          onChangeText={setQ}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {stores.map(s => (
          <View key={s.id} style={styles.card}>
            <Pressable
              style={styles.top}
              onPress={() => navigation.navigate('StoreDetail', { storeId: s.id })}>
              {s.logoImage ? (
                <RemoteImage uri={s.logoImage} style={styles.logo} />
              ) : (
                <View style={[styles.logo, styles.logoPh]}>
                  <Text style={styles.logoText}>{s.name.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{s.name}</Text>
                <Text style={styles.meta} numberOfLines={1}>{s.gov} • {s.area}</Text>
                <View style={styles.badges}>
                  {s.verified && (
                    <View style={[styles.badge, styles.badgeV]}>
                      <Text style={styles.badgeT}>موثق</Text>
                    </View>
                  )}
                  {s.featured && (
                    <View style={[styles.badge, styles.badgeF]}>
                      <Text style={styles.badgeT}>مميز</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
            <View style={styles.actions}>
              <Pressable
                style={[styles.abtn, s.verified ? styles.abtnOff : styles.abtnV]}
                onPress={() => repo.updateStore(s.id, { verified: !s.verified })}>
                <AppIcon name="check-circle" size={15} color={colors.white} />
                <Text style={styles.abtnT}>{s.verified ? 'إلغاء التوثيق' : 'توثيق'}</Text>
              </Pressable>
              <Pressable
                style={[styles.abtn, s.featured ? styles.abtnOff : styles.abtnF]}
                onPress={() => repo.updateStore(s.id, { featured: !s.featured })}>
                <AppIcon name="star" size={15} color={colors.white} />
                <Text style={styles.abtnT}>{s.featured ? 'إلغاء التمييز' : 'تمييز'}</Text>
              </Pressable>
              <Pressable
                style={[styles.abtn, styles.abtnD]}
                onPress={() => confirmDelete(s.id, s.name)}>
                <AppIcon name="delete" size={15} color={colors.white} />
                <Text style={styles.abtnT}>حذف</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {stores.length === 0 && (
          <View style={styles.emptyWrap}>
            <AppIcon name="storefront-outline" size={48} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد متاجر</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  deniedWrap: { alignItems: 'center', marginTop: 90, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.card, borderRadius: radius.md,
    margin: spacing.md, paddingHorizontal: spacing.md, elevation: 1,
  },
  search: { flex: 1, paddingVertical: spacing.sm, fontSize: fontSize.sm, color: colors.text, textAlign: 'right' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, elevation: 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.border },
  logoPh: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.white, fontSize: 22, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeV: { backgroundColor: colors.primary },
  badgeF: { backgroundColor: colors.gold },
  badgeT: { color: colors.white, fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
  abtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: radius.sm, paddingVertical: 8,
  },
  abtnV: { backgroundColor: colors.primary },
  abtnF: { backgroundColor: colors.gold },
  abtnOff: { backgroundColor: colors.textMuted },
  abtnD: { backgroundColor: colors.danger },
  abtnT: { color: colors.white, fontSize: fontSize.xs, fontWeight: '800' },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
  empty: { color: colors.textMuted, fontSize: fontSize.md },
});
