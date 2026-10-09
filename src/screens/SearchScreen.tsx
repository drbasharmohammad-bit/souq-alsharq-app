import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { ListingCard } from '../components/ListingCard';
import { useGov } from '../context/GovContext';
import { RootStackParamList } from '../navigation/types';
import { useRepo, useRepoRefresh } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation, route }: Props) {
  const [q, setQ] = useState(route.params?.q ?? '');
  const repo = useRepo();
  const { gov } = useGov();
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

  const results = useMemo(() => {
    const t = q.trim();
    if (t.length < 2) return [];
    return repo.getListings({ status: 'approved', query: t, gov });
  }, [q, repo, gov]);

  const medResults = useMemo(() => {
    const t = q.trim();
    if (t.length < 2) return [];
    const inGov = (g: string) => gov === 'الكل' || g === gov;
    return [
      ...repo.getDoctors().filter(d => inGov(d.gov) && (d.name.includes(t) || d.spec.includes(t))).map(d => ({ k: 'طبيب', n: d.name, m: `${d.spec} • ${d.gov}` })),
      ...repo.getPharmacies().filter(p => inGov(p.gov) && p.name.includes(t)).map(p => ({ k: 'صيدلية', n: p.name, m: p.gov })),
      ...repo.getLabs().filter(l => inGov(l.gov) && l.name.includes(t)).map(l => ({ k: 'مخبر', n: l.name, m: l.gov })),
    ];
  }, [q, repo, gov]);

  return (
    <View style={styles.root}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.input}
          placeholder="ابحث عن سيارة، شقة، طبيب..."
          placeholderTextColor={colors.textMuted}
          value={q}
          onChangeText={setQ}
          autoFocus
        />
      </View>
      {q.trim().length >= 2 ? (
        <FlatList
          data={results}
          keyExtractor={l => l.id}
          contentContainerStyle={styles.list}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            medResults.length > 0 ? (
              <View>
                <Text style={styles.secTitle}>نتائج طبية</Text>
                {medResults.map((m, i) => (
                  <View key={i} style={styles.medRow}>
                    <Text style={styles.medName}>{m.n}</Text>
                    <Text style={styles.medMeta}>{m.k} • {m.m}</Text>
                  </View>
                ))}
                <Text style={styles.secTitle}>الإعلانات</Text>
              </View>
            ) : undefined
          }
          renderItem={({ item }) => (
            <ListingCard item={item} onPress={() => navigation.navigate('AdDetail', { listingId: item.id })} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <AppIcon name="magnify" size={52} color={colors.textMuted} />
              <Text style={styles.empty}>لا نتائج مطابقة لبحثك</Text>
              <Text style={styles.emptySub}>جرّب كلمات مختلفة أو تصفح الأقسام</Text>
            </View>
          }
        />
      ) : (
        <Text style={styles.hint}>اكتب كلمتين على الأقل للبحث في الإعلانات والدليل الطبي</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  searchWrap: { padding: spacing.md },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
    elevation: 1,
  },
  list: { paddingBottom: spacing.xl },
  secTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, margin: spacing.md },
  medRow: { backgroundColor: colors.white, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: radius.md, padding: spacing.md },
  medName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  medMeta: { fontSize: fontSize.sm, color: colors.textMuted },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl, fontSize: fontSize.md },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8, paddingHorizontal: spacing.xl },
  emptySub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  hint: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl, paddingHorizontal: spacing.xl, lineHeight: 24 },
});
