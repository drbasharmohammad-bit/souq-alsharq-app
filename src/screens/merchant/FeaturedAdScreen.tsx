import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { ImagePickerField } from '../../components/ImagePickerField';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { formatDateTime } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'FeaturedAd'>;

const STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة',
  active: 'مميز الآن',
  rejected: 'مرفوض',
  expired: 'انتهت المدة',
};

export function FeaturedAdScreen({}: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const [bannerImg, setBannerImg] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<string[]>([]);

  const settings = repo.getFeaturedSettings();
  const myRequests = useMemo(
    () => (user ? repo.getFeaturedRequests().filter(f => f.userId === user.id) : []),
    [repo, user],
  );
  const store = user?.storeId ? repo.getStoreById(user.storeId) : undefined;

  if (user?.accountType !== 'merchant') {
    return (
      <View style={styles.root}>
        <View style={styles.emptyWrap}>
          <AppIcon name="star" size={52} color={colors.textMuted} />
          <Text style={styles.empty}>التمييز مخصص لأصحاب المتاجر</Text>
        </View>
      </View>
    );
  }

  const submit = () => {
    if (!user || !user.storeId) return;
    if (bannerImg.length === 0) {
      Alert.alert('تنبيه', 'اختر صورة الإعلان أولًا');
      return;
    }
    if (settings.price > 0 && receipt.length === 0) {
      Alert.alert('تنبيه', 'اختر صورة الإيصال أولًا');
      return;
    }
    repo.addFeaturedRequest({
      storeId: user.storeId,
      userId: user.id,
      imageUri: bannerImg[0],
      receiptUri: receipt[0],
    });
    setBannerImg([]);
    setReceipt([]);
    Alert.alert('تم', 'أُرسل طلب التمييز — تراجعه الإدارة ويظهر إعلانك بالبانر الرئيسي بعد الموافقة');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <View style={styles.headRow}>
        <AppIcon name="star" size={26} color={colors.gold} />
        <Text style={styles.title}>ميّز إعلانك بالبانر الرئيسي</Text>
      </View>
      <Text style={styles.desc}>
        يظهر إعلانك المصوَّر في البانر الرئيسي للواجهة أمام كل المستخدمين لمدة{' '}
        {settings.durationDays} أيام بعد موافقة الإدارة.
      </Text>

      <View style={styles.priceBox}>
        <Text style={styles.priceLabel}>سعر التمييز</Text>
        <Text style={styles.price}>
          {settings.price > 0 ? `${settings.price}` : 'يحدده مالك التطبيق'}
        </Text>
      </View>

      <ImagePickerField images={bannerImg} onChange={setBannerImg} max={1} label="صورة الإعلان (تظهر بالبانر)" />

      {settings.price > 0 && (
        <>
          <View style={styles.stepRow}>
            <AppIcon name="receipt" size={18} color={colors.text} />
            <Text style={styles.stepText}>حوّل المبلغ ثم ارفع صورة الإيصال</Text>
          </View>
          <ImagePickerField images={receipt} onChange={setReceipt} max={1} label="صورة الإيصال" />
        </>
      )}

      <Pressable style={styles.btn} onPress={submit}>
        <View style={styles.btnRow}>
          <AppIcon name="upload" size={18} color={colors.white} />
          <Text style={styles.btnText}>إرسال طلب التمييز</Text>
        </View>
      </Pressable>

      <Text style={styles.listTitle}>طلباتي ({myRequests.length})</Text>
      <FlatList
        data={myRequests}
        keyExtractor={f => f.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardStore}>{store?.name ?? 'متجري'}</Text>
              <View style={[styles.badge, item.status === 'active' ? styles.bOk : item.status === 'pending' ? styles.bWait : styles.bBad]}>
                <Text style={styles.badgeText}>{STATUS_LABEL[item.status]}</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {formatDateTime(item.createdAt)}
              {item.status === 'active' && item.endDate ? ` — ينتهي ${formatDateTime(item.endDate)}` : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد طلبات بعد</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.lg },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, textAlign: 'center' },
  desc: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 22, textAlign: 'center', marginTop: spacing.sm },
  priceBox: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 2, borderColor: colors.gold, padding: spacing.md, marginTop: spacing.md, alignItems: 'center' },
  priceLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  price: { fontSize: fontSize.xl, fontWeight: '800', color: colors.gold, marginTop: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, marginBottom: spacing.sm },
  stepText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  btn: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  listTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  list: { gap: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, elevation: 1 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardStore: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  badge: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  bOk: { backgroundColor: colors.verifiedBg },
  bWait: { backgroundColor: '#FFF4D6' },
  bBad: { backgroundColor: '#FDE8E8' },
  badgeText: { fontSize: fontSize.xs, fontWeight: '800', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.sm },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
});
