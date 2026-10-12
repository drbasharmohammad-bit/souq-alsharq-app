import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { ListingCard } from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { useRepo, useRepoRefresh } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';
import { AdStatus } from '../types';
import { formatDateTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'MyAds'>;

const STATUS_META: Record<AdStatus, { t: string; bg: string; fg: string; icon: string }> = {
  pending: { t: 'قيد المراجعة', bg: '#FFF4D6', fg: '#8A6D14', icon: 'clock' },
  approved: { t: 'منشور', bg: colors.verifiedBg, fg: colors.verifiedText, icon: 'check-circle' },
  rejected: { t: 'مرفوض', bg: '#FBE9E7', fg: colors.danger, icon: 'close-circle' },
};

export function MyAdsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const repo = useRepo();
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
  const ads = user ? repo.getUserListings(user.id) : [];
  // طلبات التمييز المعلقة/السارية لإعلاناتي (لمنع التكرار وإظهار الحالة)
  const featRequests = useMemo(
    () =>
      user
        ? repo.getFeaturedRequests().filter(f => f.userId === user.id && f.listingId && (f.status === 'pending' || f.status === 'active'))
        : [],
    [repo, user],
  );
  const featReqFor = (listingId: string) => featRequests.find(f => f.listingId === listingId);

  return (
    <View style={styles.root}>
      <FlatList
        data={ads}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const m = STATUS_META[item.status];
          const isFeatured = item.featuredUntil !== undefined && item.featuredUntil > Date.now();
          const pendingReq = featReqFor(item.id);
          return (
            <View>
              <ListingCard
                item={item}
                onPress={() =>
                  item.status === 'approved' && navigation.navigate('AdDetail', { listingId: item.id })
                }
              />
              <View style={styles.rowWrap}>
                <View style={[styles.badge, { backgroundColor: m.bg }]}>
                  <AppIcon name={m.icon} size={14} color={m.fg} />
                  <Text style={[styles.badgeText, { color: m.fg }]}>{m.t}</Text>
                </View>
                <Pressable
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('EditAd', { listingId: item.id })}>
                  <AppIcon name="pencil" size={14} color={colors.primary} />
                  <Text style={styles.editBtnText}>تعديل</Text>
                </Pressable>
                {item.status === 'approved' && (
                  isFeatured ? (
                    <View style={[styles.badge, styles.featBadge]}>
                      <AppIcon name="star" size={14} color={colors.gold} />
                      <Text style={[styles.badgeText, { color: colors.gold }]}>
                        مميز حتى {formatDateTime(item.featuredUntil!)}
                      </Text>
                    </View>
                  ) : pendingReq ? (
                    <View style={[styles.badge, { backgroundColor: '#FFF4D6' }]}>
                      <AppIcon name="clock" size={14} color="#8A6D14" />
                      <Text style={[styles.badgeText, { color: '#8A6D14' }]}>طلب تمييز قيد المراجعة</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.featBtn}
                      onPress={() => navigation.navigate('FeaturedAd', { listingId: item.id })}>
                      <AppIcon name="star-outline" size={14} color={colors.white} />
                      <Text style={styles.featBtnText}>ميّز إعلانك</Text>
                    </Pressable>
                  )
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="bullhorn" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد إعلانات بعد — أضف إعلانك الأول</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: spacing.xl },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: -6,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: '800' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  editBtnText: { fontSize: fontSize.xs, fontWeight: '800', color: colors.primary },
  featBadge: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: colors.gold },
  featBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: colors.gold,
  },
  featBtnText: { fontSize: fontSize.xs, fontWeight: '800', color: colors.white },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
});
