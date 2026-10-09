import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { ListingCard } from '../components/ListingCard';
import { useFavorites } from '../context/FavoritesContext';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { useRepo, useRepoRefresh } from '../repo/RepoContext';
import { colors, fontSize, spacing } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Favorites'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function FavoritesScreen({ navigation }: Props) {
  const { favorites } = useFavorites();
  const repo = useRepo();
  const items = useMemo(
    () => favorites.map(id => repo.getListingById(id)).filter((l): l is NonNullable<typeof l> => !!l),
    [favorites, repo],
  );
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

  return (
    <View style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={l => l.id}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('AdDetail', { listingId: item.id })} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="heart-outline" size={64} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد عناصر في المفضلة بعد</Text>
            <Text style={styles.emptySub}>اضغط على القلب في أي إعلان لحفظه هنا</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { paddingVertical: spacing.sm },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 3, paddingHorizontal: spacing.xl },
  empty: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  emptySub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
});
