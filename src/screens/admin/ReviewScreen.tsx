import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { ListingCard } from '../../components/ListingCard';
import { useAuth } from '../../context/AuthContext';
import { useRepo, useRepoRefresh } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { AdStatus } from '../../types';

type Filter = 'all' | 'store' | 'individual';

export function ReviewScreen() {
  const { user } = useAuth();
  const repo = useRepo();
  const [filter, setFilter] = useState<Filter>('all');
  const refreshRepo = useRepoRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRepo();
    } finally {
      setRefreshing(false);
    }
  };

  const items = useMemo(() => {
    let list = repo.getListings({ status: 'pending' });
    if (filter === 'store') list = list.filter(l => l.sellerType === 'store');
    if (filter === 'individual') list = list.filter(l => l.sellerType === 'individual');
    return list;
  }, [repo, filter]);

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

  const decide = (id: string, status: AdStatus) => repo.updateListingStatus(id, status);

  const tabs: { k: Filter; t: string; icon?: string }[] = [
    { k: 'all', t: 'الكل' },
    { k: 'store', t: 'تجار', icon: 'storefront' },
    { k: 'individual', t: 'أفراد', icon: 'account' },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        {tabs.map(t => (
          <Pressable
            key={t.k}
            onPress={() => setFilter(t.k)}
            style={[styles.tab, filter === t.k && styles.tabActive]}>
            <View style={styles.tabRow}>
              {t.icon && <AppIcon name={t.icon} size={15} color={filter === t.k ? colors.white : colors.text} />}
              <Text style={[styles.tabText, filter === t.k && styles.tabTextActive]}>{t.t}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={l => l.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ListingCard item={item} onPress={() => {}} />
            <View style={styles.metaRow}>
              <AppIcon name={item.sellerType === 'store' ? 'storefront' : 'account'} size={14} color={colors.textMuted} />
              <Text style={styles.meta}>{item.sellerType === 'store' ? 'تاجر' : 'فرد'} • {item.seller}</Text>
              <AppIcon name="phone" size={14} color={colors.textMuted} />
              <Text style={styles.meta}>{item.phone ?? '—'}</Text>
            </View>
            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.ok]} onPress={() => decide(item.id, 'approved')}>
                <View style={styles.btnRow}>
                  <AppIcon name="check" size={18} color={colors.white} />
                  <Text style={styles.btnText}>قبول</Text>
                </View>
              </Pressable>
              <Pressable style={[styles.btn, styles.no]} onPress={() => decide(item.id, 'rejected')}>
                <View style={styles.btnRow}>
                  <AppIcon name="close" size={18} color={colors.white} />
                  <Text style={styles.btnText}>رفض</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="party-popper" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد إعلانات بانتظار المراجعة</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  tab: { flex: 1, backgroundColor: colors.card, borderRadius: radius.pill, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  tabTextActive: { color: colors.white, fontWeight: '800' },
  list: { paddingBottom: spacing.xl },
  card: { backgroundColor: colors.card, borderRadius: radius.md, marginHorizontal: spacing.md, marginBottom: spacing.md, paddingBottom: spacing.md, elevation: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: spacing.md, marginTop: spacing.sm },
  meta: { fontSize: fontSize.sm, color: colors.textMuted },
  row: { flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.sm },
  btn: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  ok: { backgroundColor: colors.primary },
  no: { backgroundColor: colors.danger },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
  deniedWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
