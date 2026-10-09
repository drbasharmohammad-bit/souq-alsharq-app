import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo, useRepoRefresh } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { formatDateTime } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminFeatured'>;

export function FeaturedReviewScreen({}: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const [zoomUri, setZoomUri] = useState<string | null>(null);
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

  const pending = useMemo(
    () => repo.getFeaturedRequests().filter(f => f.status === 'pending'),
    [repo],
  );
  const active = useMemo(() => repo.getActiveFeatured(), [repo]);
  const settings = repo.getFeaturedSettings();

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

  const decide = (id: string, ok: boolean) => {
    Alert.alert(
      ok ? 'تفعيل التمييز' : 'رفض الطلب',
      ok
        ? `سيظهر إعلان التاجر في البانر الرئيسي لمدة ${settings.durationDays} أيام`
        : 'سيتم رفض طلب التمييز',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          style: ok ? 'default' : 'destructive',
          onPress: () => {
            if (ok) {
              const now = Date.now();
              repo.updateFeaturedRequestStatus(
                id,
                'active',
                now,
                now + settings.durationDays * 24 * 60 * 60 * 1000,
              );
            } else {
              repo.updateFeaturedRequestStatus(id, 'rejected');
            }
          },
        },
      ],
    );
  };

  const endNow = (id: string) => {
    Alert.alert('إنهاء التمييز', 'سيتوقف ظهور هذا الإعلان في البانر الرئيسي', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'إنهاء', style: 'destructive', onPress: () => repo.updateFeaturedRequestStatus(id, 'expired', undefined, Date.now()) },
    ]);
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={pending}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          active.length > 0 ? (
            <View style={styles.secWrap}>
              <Text style={styles.secTitle}>مميزة الآن ({active.length})</Text>
              {active.map(f => {
                const store = repo.getStoreById(f.storeId);
                return (
                  <View key={f.id} style={[styles.card, styles.cardRow]}>
                    <Image source={{ uri: f.imageUri }} style={styles.thumb} />
                    <View style={styles.cardBody}>
                      <Text style={styles.storeName}>{store?.name ?? 'متجر'}</Text>
                      <Text style={styles.meta}>
                        ينتهي: {f.endDate ? formatDateTime(f.endDate) : '—'}
                      </Text>
                      <Pressable style={[styles.mini, styles.miniDel]} onPress={() => endNow(f.id)}>
                        <Text style={styles.miniText}>إنهاء مبكر</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
              <Text style={[styles.secTitle, { marginTop: spacing.md }]}>طلبات معلقة ({pending.length})</Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => {
          const merchant = repo.getUserById(item.userId);
          const store = repo.getStoreById(item.storeId);
          return (
            <View style={styles.card}>
              <Pressable onPress={() => setZoomUri(item.imageUri)}>
                <Image source={{ uri: item.imageUri }} style={styles.bannerImg} resizeMode="cover" />
              </Pressable>
              <View style={styles.headRow}>
                <AppIcon name="storefront" size={22} color={colors.primary} />
                <View style={styles.headBody}>
                  <Text style={styles.storeName}>{store?.name ?? 'متجر غير معروف'}</Text>
                  <Text style={styles.meta}>{merchant?.phone ?? '—'} • {formatDateTime(item.createdAt)}</Text>
                </View>
              </View>

              {item.receiptUri ? (
                <Pressable onPress={() => setZoomUri(item.receiptUri!)}>
                  <Image source={{ uri: item.receiptUri }} style={styles.receipt} resizeMode="contain" />
                  <Text style={styles.zoomHint}>اضغط على صورة الإيصال للتكبير</Text>
                </Pressable>
              ) : (
                <View style={styles.noReceipt}>
                  <AppIcon name="image-off" size={28} color={colors.textMuted} />
                  <Text style={styles.meta}>لا توجد صورة إيصال</Text>
                </View>
              )}

              <View style={styles.row}>
                <Pressable style={[styles.btn, styles.ok]} onPress={() => decide(item.id, true)}>
                  <View style={styles.btnRow}>
                    <AppIcon name="check" size={18} color={colors.white} />
                    <Text style={styles.btnText}>قبول وتفعيل</Text>
                  </View>
                </Pressable>
                <Pressable style={[styles.btn, styles.no]} onPress={() => decide(item.id, false)}>
                  <View style={styles.btnRow}>
                    <AppIcon name="close" size={18} color={colors.white} />
                    <Text style={styles.btnText}>رفض</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          pending.length === 0 && active.length === 0 ? (
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
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, elevation: 1 },
  cardRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  bannerImg: { width: '100%', height: 150, borderRadius: radius.md, backgroundColor: colors.border },
  thumb: { width: 84, height: 60, borderRadius: radius.sm, backgroundColor: colors.border },
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
