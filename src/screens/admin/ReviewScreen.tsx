import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ListingCard } from '../../components/ListingCard';
import { useAuth } from '../../context/AuthContext';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { AdStatus } from '../../types';

type Filter = 'all' | 'store' | 'individual';

export function ReviewScreen() {
  const { user } = useAuth();
  const repo = useRepo();
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => {
    let list = repo.getListings({ status: 'pending' });
    if (filter === 'store') list = list.filter(l => l.sellerType === 'store');
    if (filter === 'individual') list = list.filter(l => l.sellerType === 'individual');
    return list;
  }, [repo, filter]);

  if (!user?.isAdmin) {
    return (
      <View style={styles.root}>
        <Text style={styles.denied}>⛔ هذه الصفحة للإدارة فقط</Text>
      </View>
    );
  }

  const decide = (id: string, status: AdStatus) => repo.updateListingStatus(id, status);

  const tabs: { k: Filter; t: string }[] = [
    { k: 'all', t: 'الكل' },
    { k: 'store', t: '🏬 تجار' },
    { k: 'individual', t: '👤 أفراد' },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        {tabs.map(t => (
          <Pressable
            key={t.k}
            onPress={() => setFilter(t.k)}
            style={[styles.tab, filter === t.k && styles.tabActive]}>
            <Text style={[styles.tabText, filter === t.k && styles.tabTextActive]}>{t.t}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={l => l.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ListingCard item={item} onPress={() => {}} />
            <Text style={styles.meta}>
              {item.sellerType === 'store' ? '🏬 تاجر' : '👤 فرد'} • {item.seller} • 📞 {item.phone ?? '—'}
            </Text>
            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.ok]} onPress={() => decide(item.id, 'approved')}>
                <Text style={styles.btnText}>✅ قبول</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.no]} onPress={() => decide(item.id, 'rejected')}>
                <Text style={styles.btnText}>❌ رفض</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد إعلانات بانتظار المراجعة 🎉</Text>}
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
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginHorizontal: spacing.md, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.sm },
  btn: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  ok: { backgroundColor: colors.primary },
  no: { backgroundColor: colors.danger },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md, marginTop: spacing.xl * 2 },
  denied: { textAlign: 'center', marginTop: 80, fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
});
