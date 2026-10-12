import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { FabButton } from '../components/FabButton';
import { AppIcon } from '../components/AppIcon';
import { FilterBar, SortKey } from '../components/FilterBar';
import { GovChips } from '../components/GovChips';
import { ListingCard } from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { useGov } from '../context/GovContext';
import { GOVS } from '../data';
import { RootStackParamList } from '../navigation/types';
import { useRepo, useRepoRefresh } from '../repo/RepoContext';
import { colors, fontSize, spacing } from '../theme';
import { SectionKey } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Listings'>;

// بحث متقدم: نطاق سعر + ترتيب — فلترة محلية (v22)
function parsePriceInput(v: string): number | undefined {
  const n = parseInt(v.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : undefined;
}

export function ListingsScreen({ navigation, route }: Props) {
  const { sectionKey, subKey } = route.params;
  const { gov, setGov } = useGov();
  const repo = useRepo();
  const { user } = useAuth();
  const refreshRepo = useRepoRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortKey>('new');
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRepo();
    } finally {
      setRefreshing(false);
    }
  };

  const items = useMemo(() => {
    let list = repo.getListings({ sec: sectionKey as SectionKey, sub: subKey, gov, status: 'approved' });
    const min = parsePriceInput(minPrice);
    const max = parsePriceInput(maxPrice);
    if (min !== undefined || max !== undefined) {
      // "السعر عند الاتصال" (null) يُستبعد عند تفعيل فلتر السعر
      list = list.filter(
        l =>
          l.price != null &&
          (min === undefined || l.price >= min) &&
          (max === undefined || l.price <= max),
      );
    }
    if (sort === 'low') {
      list = [...list].sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
    } else if (sort === 'high') {
      list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    }
    return list;
  }, [repo, sectionKey, subKey, gov, minPrice, maxPrice, sort]);

  const onFab = () => {
    if (!user) {
      navigation.navigate('GoogleLogin');
      return;
    }
    if (sectionKey === 'medical') return;
    if (subKey) navigation.navigate('PublishForm', { sectionKey, subKey });
    else navigation.navigate('PublishSub', { sectionKey });
  };

  return (
    <View style={styles.root}>
      <GovChips govs={GOVS} selected={gov} onSelect={setGov} />
      <FilterBar
        minPrice={minPrice}
        maxPrice={maxPrice}
        sort={sort}
        onMinChange={setMinPrice}
        onMaxChange={setMaxPrice}
        onSortChange={setSort}
      />
      <FlatList
        data={items}
        keyExtractor={l => l.id}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('AdDetail', { listingId: item.id })} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="bullhorn" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد إعلانات هنا بعد — كن أول من يعلن</Text>
          </View>
        }
      />
      {sectionKey !== 'medical' && <FabButton onPress={onFab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: spacing.xl * 3 },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
});
