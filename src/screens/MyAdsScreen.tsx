import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ListingCard } from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';
import { AdStatus } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyAds'>;

const STATUS_META: Record<AdStatus, { t: string; bg: string; fg: string }> = {
  pending: { t: '⏳ قيد المراجعة', bg: '#FFF4D6', fg: '#8A6D14' },
  approved: { t: '✅ منشور', bg: colors.verifiedBg, fg: colors.verifiedText },
  rejected: { t: '❌ مرفوض', bg: '#FBE9E7', fg: colors.danger },
};

export function MyAdsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const ads = user ? repo.getUserListings(user.id) : [];

  return (
    <View style={styles.root}>
      <FlatList
        data={ads}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const m = STATUS_META[item.status];
          return (
            <View>
              <ListingCard
                item={item}
                onPress={() =>
                  item.status === 'approved' && navigation.navigate('Detail', { listingId: item.id })
                }
              />
              <View style={[styles.badge, { backgroundColor: m.bg, marginTop: -6 }]}>
                <Text style={[styles.badgeText, { color: m.fg }]}>{m.t}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>لا توجد إعلانات بعد — أضف إعلانك الأول 📢</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: spacing.xl },
  badge: {
    alignSelf: 'flex-start',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md, marginTop: spacing.xl * 2 },
});
