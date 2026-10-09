import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo, useRepoRefresh } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { formatDateTime } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminSubs'>;

export function SubscriptionReviewScreen({}: Props) {
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
    () => repo.getSubscriptions().filter(s => s.status === 'pending'),
    [repo],
  );

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
      ok ? 'تفعيل الاشتراك' : 'رفض الإيصال',
      ok ? 'سيتم تفعيل اشتراك هذا التاجر' : 'سيتم رفض هذا الإيصال',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          style: ok ? 'default' : 'destructive',
          onPress: () => repo.updateSubscriptionStatus(id, ok ? 'active' : 'rejected'),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={pending}
        keyExtractor={s => s.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const merchant = repo.getUserById(item.userId);
          const store = item.storeId ? repo.getStoreById(item.storeId) : undefined;
          return (
            <View style={styles.card}>
              <View style={styles.headRow}>
                <AppIcon name="storefront" size={22} color={colors.primary} />
                <View style={styles.headBody}>
                  <Text style={styles.storeName}>{store?.name ?? 'متجر غير معروف'}</Text>
                  <Text style={styles.meta}>
                    <AppIcon name="phone" size={12} color={colors.textMuted} /> {merchant?.phone ?? '—'}
                  </Text>
                  <Text style={styles.meta}>
                    <AppIcon name="clock" size={12} color={colors.textMuted} /> {formatDateTime(item.createdAt)}
                  </Text>
                </View>
              </View>

              {item.receiptUri ? (
                <Pressable onPress={() => setZoomUri(item.receiptUri!)}>
                  <Image source={{ uri: item.receiptUri }} style={styles.receipt} resizeMode="contain" />
                  <Text style={styles.zoomHint}>اضغط على الصورة للتكبير</Text>
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
          <View style={styles.emptyWrap}>
            <AppIcon name="receipt" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد إيصالات بانتظار المراجعة</Text>
          </View>
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
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, elevation: 1 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  headBody: { flex: 1 },
  storeName: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  receipt: { width: '100%', height: 220, borderRadius: radius.md, backgroundColor: colors.border },
  zoomHint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  noReceipt: { alignItems: 'center', padding: spacing.lg, backgroundColor: colors.background, borderRadius: radius.md, gap: 6 },
  row: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  btn: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  ok: { backgroundColor: colors.primary },
  no: { backgroundColor: colors.danger },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
  deniedWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
  zoomWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  zoomImg: { width: '100%', height: '80%' },
});
