import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo, useRepoRefresh } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { formatDateTime } from '../../utils/format';
import { FeaturedRequest } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminFeatured'>;

const DAY = 24 * 60 * 60 * 1000;

export function FeaturedReviewScreen({}: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const [zoomUri, setZoomUri] = useState<string | null>(null);
  const refreshRepo = useRepoRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const settings = repo.getFeaturedSettings();
  const [days, setDays] = useState(settings.durationDays);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRepo();
    } finally {
      setRefreshing(false);
    }
  };

  const allPending = useMemo(
    () => repo.getFeaturedRequests().filter(f => f.status === 'pending'),
    [repo],
  );
  // طلبات البانرات القديمة مقابل طلبات تمييز الإعلانات (v15)
  const pendingBanners = allPending.filter(f => !f.listingId);
  const pendingListings = allPending.filter(f => !!f.listingId);
  const activeBanners = useMemo(
    () => repo.getActiveFeatured().filter(f => !f.listingId),
    [repo],
  );
  const featuredListings = useMemo(() => repo.getFeaturedListings(), [repo]);

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

  // قبول/رفض طلب بانر (الوضع القديم)
  const decideBanner = (id: string, ok: boolean) => {
    Alert.alert(
      ok ? 'تفعيل التمييز' : 'رفض الطلب',
      ok
        ? `سيظهر إعلان التاجر في البانر الرئيسي لمدة ${days} أيام`
        : 'سيتم رفض طلب التمييز',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          style: ok ? 'default' : 'destructive',
          onPress: () => {
            if (ok) {
              const now = Date.now();
              repo.updateFeaturedRequestStatus(id, 'active', now, now + days * DAY);
            } else {
              repo.updateFeaturedRequestStatus(id, 'rejected');
            }
          },
        },
      ],
    );
  };

  // قبول/رفض طلب تمييز إعلان (v15) — القبول يضبط featuredUntil على الإعلان
  const decideListing = (req: FeaturedRequest, ok: boolean) => {
    const listing = req.listingId ? repo.getListingById(req.listingId) : undefined;
    Alert.alert(
      ok ? 'تفعيل التمييز' : 'رفض الطلب',
      ok
        ? `سيظهر «${listing?.name ?? 'الإعلان'}» بقسم «إعلانات مميزة» لمدة ${days} أيام`
        : 'سيتم رفض طلب التمييز',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          style: ok ? 'default' : 'destructive',
          onPress: () => {
            if (ok && req.listingId) {
              const now = Date.now();
              repo.setListingFeatured(req.listingId, now + days * DAY);
              repo.updateFeaturedRequestStatus(req.id, 'active', now, now + days * DAY);
            } else {
              repo.updateFeaturedRequestStatus(req.id, 'rejected');
            }
          },
        },
      ],
    );
  };

  const endBannerNow = (id: string) => {
    Alert.alert('إنهاء التمييز', 'سيتوقف ظهور هذا الإعلان في البانر الرئيسي', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'إنهاء', style: 'destructive', onPress: () => repo.updateFeaturedRequestStatus(id, 'expired', undefined, Date.now()) },
    ]);
  };

  const endListingNow = (listingId: string) => {
    Alert.alert('إنهاء التمييز', 'سيتوقف ظهور هذا الإعلان بقسم «إعلانات مميزة»', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'إنهاء', style: 'destructive', onPress: () => repo.setListingFeatured(listingId, undefined) },
    ]);
  };

  const renderReceipt = (item: FeaturedRequest) =>
    item.receiptUri ? (
      <Pressable onPress={() => setZoomUri(item.receiptUri!)}>
        <Image source={{ uri: item.receiptUri }} style={styles.receipt} resizeMode="contain" />
        <Text style={styles.zoomHint}>اضغط على صورة الإيصال للتكبير</Text>
      </Pressable>
    ) : (
      <View style={styles.noReceipt}>
        <AppIcon name="image-off" size={28} color={colors.textMuted} />
        <Text style={styles.meta}>لا توجد صورة إيصال</Text>
      </View>
    );

  const renderActions = (onOk: () => void, onNo: () => void) => (
    <View style={styles.row}>
      <Pressable style={[styles.btn, styles.ok]} onPress={onOk}>
        <View style={styles.btnRow}>
          <AppIcon name="check" size={18} color={colors.white} />
          <Text style={styles.btnText}>قبول وتفعيل</Text>
        </View>
      </Pressable>
      <Pressable style={[styles.btn, styles.no]} onPress={onNo}>
        <View style={styles.btnRow}>
          <AppIcon name="close" size={18} color={colors.white} />
          <Text style={styles.btnText}>رفض</Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={[...pendingListings, ...pendingBanners]}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.secWrap}>
            {/* مضبط مدة التمييز */}
            <View style={styles.daysRow}>
              <Text style={styles.daysLabel}>مدة التمييز عند القبول</Text>
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => setDays(d => Math.max(1, d - 1))}>
                  <Text style={styles.stepTxt}>−</Text>
                </Pressable>
                <Text style={styles.daysVal}>{days} أيام</Text>
                <Pressable style={styles.stepBtn} onPress={() => setDays(d => Math.min(90, d + 1))}>
                  <Text style={styles.stepTxt}>+</Text>
                </Pressable>
              </View>
            </View>

            {featuredListings.length > 0 && (
              <>
                <Text style={styles.secTitle}>إعلانات مميزة الآن ({featuredListings.length})</Text>
                {featuredListings.map(l => (
                  <View key={l.id} style={[styles.card, styles.cardRow]}>
                    {l.images?.[0] ? (
                      <Image source={{ uri: l.images[0] }} style={styles.thumb} />
                    ) : (
                      <View style={[styles.thumb, styles.thumbPh]}>
                        <AppIcon name="image" size={24} color={colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.cardBody}>
                      <Text style={styles.storeName} numberOfLines={1}>{l.name}</Text>
                      <Text style={styles.meta}>
                        ينتهي: {l.featuredUntil ? formatDateTime(l.featuredUntil) : '—'}
                      </Text>
                      <Pressable style={[styles.mini, styles.miniDel]} onPress={() => endListingNow(l.id)}>
                        <Text style={styles.miniText}>إنهاء مبكر</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </>
            )}

            {activeBanners.length > 0 && (
              <>
                <Text style={styles.secTitle}>بانرات مميزة الآن ({activeBanners.length})</Text>
                {activeBanners.map(f => {
                  const store = f.storeId ? repo.getStoreById(f.storeId) : undefined;
                  return (
                    <View key={f.id} style={[styles.card, styles.cardRow]}>
                      <Image source={{ uri: f.imageUri }} style={styles.thumb} />
                      <View style={styles.cardBody}>
                        <Text style={styles.storeName}>{store?.name ?? 'متجر'}</Text>
                        <Text style={styles.meta}>
                          ينتهي: {f.endDate ? formatDateTime(f.endDate) : '—'}
                        </Text>
                        <Pressable style={[styles.mini, styles.miniDel]} onPress={() => endBannerNow(f.id)}>
                          <Text style={styles.miniText}>إنهاء مبكر</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {(pendingListings.length > 0 || pendingBanners.length > 0) && (
              <Text style={[styles.secTitle, { marginTop: spacing.md }]}>
                طلبات معلقة ({pendingListings.length + pendingBanners.length})
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const owner = repo.getUserById(item.userId);
          if (item.listingId) {
            // ——— طلب تمييز إعلان ———
            const listing = repo.getListingById(item.listingId);
            return (
              <View style={styles.card}>
                <View style={styles.headRow}>
                  <AppIcon name="star" size={22} color={colors.gold} />
                  <View style={styles.headBody}>
                    <Text style={styles.storeName}>{listing?.name ?? 'إعلان محذوف'}</Text>
                    <Text style={styles.meta}>{owner?.phone ?? '—'} • {formatDateTime(item.createdAt)}</Text>
                  </View>
                </View>
                {listing?.images?.[0] ? (
                  <Pressable onPress={() => setZoomUri(listing.images![0])}>
                    <Image source={{ uri: listing.images[0] }} style={styles.bannerImg} resizeMode="cover" />
                  </Pressable>
                ) : (
                  <View style={styles.noReceipt}>
                    <AppIcon name="image-off" size={28} color={colors.textMuted} />
                    <Text style={styles.meta}>الإعلان بلا صورة — لا يمكن تمييزه</Text>
                  </View>
                )}
                {renderReceipt(item)}
                {listing
                  ? renderActions(() => decideListing(item, true), () => decideListing(item, false))
                  : null}
              </View>
            );
          }
          // ——— طلب بانر (الوضع القديم) ———
          const store = item.storeId ? repo.getStoreById(item.storeId) : undefined;
          return (
            <View style={styles.card}>
              <Pressable onPress={() => setZoomUri(item.imageUri)}>
                <Image source={{ uri: item.imageUri }} style={styles.bannerImg} resizeMode="cover" />
              </Pressable>
              <View style={styles.headRow}>
                <AppIcon name="storefront" size={22} color={colors.primary} />
                <View style={styles.headBody}>
                  <Text style={styles.storeName}>{store?.name ?? 'متجر غير معروف'}</Text>
                  <Text style={styles.meta}>{owner?.phone ?? '—'} • {formatDateTime(item.createdAt)}</Text>
                </View>
              </View>
              {renderReceipt(item)}
              {renderActions(() => decideBanner(item.id, true), () => decideBanner(item.id, false))}
            </View>
          );
        }}
        ListEmptyComponent={
          pendingListings.length === 0 && pendingBanners.length === 0 && featuredListings.length === 0 && activeBanners.length === 0 ? (
            <View style={styles.emptyWrap}>
              <AppIcon name="star" size={52} color={colors.textMuted} />
              <Text style={styles.empty}>لا توجد طلبات تمييز</Text>
            </View>
          ) : undefined
        }
      />

      <Modal visible={!!zoomUri} transparent animationType="fade" onRequestClose={() => setZoomUri(null)}>
        <Pressable style={styles.zoomWrap} onPress={() => setZoomUri(null)}>
          {zoomUri && <Image source={{ uri: zoomUri }} style={styles.zoomImg} resizeMode="contain" />}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  secWrap: { marginBottom: spacing.sm },
  secTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
  },
  daysLabel: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTxt: { color: colors.white, fontSize: fontSize.lg, fontWeight: '800' },
  daysVal: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, minWidth: 64, textAlign: 'center' },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, elevation: 1 },
  cardRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  bannerImg: { width: '100%', height: 150, borderRadius: radius.md, backgroundColor: colors.border },
  thumb: { width: 84, height: 60, borderRadius: radius.sm, backgroundColor: colors.border },
  thumbPh: { alignItems: 'center', justifyContent: 'center' },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.sm },
  headBody: { flex: 1 },
  cardBody: { flex: 1 },
  storeName: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  receipt: { width: '100%', height: 200, borderRadius: radius.md, backgroundColor: colors.border },
  zoomHint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  noReceipt: { alignItems: 'center', padding: spacing.md, backgroundColor: colors.background, borderRadius: radius.md, gap: 6 },
  row: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  btn: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  ok: { backgroundColor: colors.primary },
  no: { backgroundColor: colors.danger },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mini: { borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 6 },
  miniDel: { backgroundColor: colors.danger },
  miniText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
  deniedWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
  zoomWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  zoomImg: { width: '100%', height: '80%' },
});
