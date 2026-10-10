import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { ImagePickerField } from '../../components/ImagePickerField';
import { PlaceholderImage } from '../../components/PlaceholderImage';
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

export function FeaturedAdScreen({ route }: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const [bannerImg, setBannerImg] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const listingId = route.params?.listingId;
  const listing = listingId ? repo.getListingById(listingId) : undefined;
  // وضع تمييز إعلان محدد (v15) مقابل وضع بانر التاجر القديم
  const isListingMode = !!listing;

  const settings = repo.getFeaturedSettings();
  const myRequests = useMemo(
    () =>
      user
        ? repo
            .getFeaturedRequests()
            .filter(f => f.userId === user.id && (isListingMode ? f.listingId === listingId : !f.listingId))
        : [],
    [repo, user, isListingMode, listingId],
  );
  const existingActive = myRequests.find(f => f.status === 'active' || f.status === 'pending');
  const alreadyFeatured = listing?.featuredUntil !== undefined && listing.featuredUntil > Date.now();

  const store = user?.storeId ? repo.getStoreById(user.storeId) : undefined;

  // وضع البانر القديم مخصص لأصحاب المتاجر فقط
  if (!isListingMode && user?.accountType !== 'merchant') {
    return (
      <View style={styles.root}>
        <View style={styles.emptyWrap}>
          <AppIcon name="star" size={52} color={colors.textMuted} />
          <Text style={styles.empty}>التمييز مخصص لأصحاب المتاجر</Text>
        </View>
      </View>
    );
  }

  if (isListingMode && !listing) {
    return (
      <View style={styles.root}>
        <View style={styles.emptyWrap}>
          <AppIcon name="alert-circle" size={52} color={colors.textMuted} />
          <Text style={styles.empty}>الإعلان غير موجود</Text>
        </View>
      </View>
    );
  }

  const submitListing = async () => {
    if (!user || !listing || !listingId) return;
    const img = listing.images?.[0];
    if (!img) {
      Alert.alert('تنبيه', 'الإعلانات المميزة تحتاج صورة حقيقية واحدة على الأقل');
      return;
    }
    if (existingActive) {
      Alert.alert('تنبيه', 'يوجد طلب تمييز قائم لهذا الإعلان');
      return;
    }
    if (settings.price > 0 && receipt.length === 0) {
      Alert.alert('تنبيه', 'اختر صورة الإيصال أولًا');
      return;
    }
    setSaving(true);
    try {
      const [receiptUrl] = receipt.length > 0 ? await repo.uploadImages(receipt, 'featured') : [undefined];
      repo.addFeaturedRequest({
        listingId,
        userId: user.id,
        imageUri: img,
        receiptUri: receiptUrl,
      });
      setReceipt([]);
      Alert.alert('تم', 'أُرسل طلب التمييز — تراجعه الإدارة ويظهر إعلانك بقسم «إعلانات مميزة» بعد الموافقة');
    } catch {
      Alert.alert(
        'تعذر الإرسال',
        'فشل رفع الإيصال — تحقق من اتصال الإنترنت وحاول مجددًا.',
      );
    } finally {
      setSaving(false);
    }
  };

  const submitBanner = async () => {
    if (!user || !user.storeId) return;
    if (bannerImg.length === 0) {
      Alert.alert('تنبيه', 'الإعلانات المميزة تحتاج صورة حقيقية واحدة على الأقل');
      return;
    }
    if (settings.price > 0 && receipt.length === 0) {
      Alert.alert('تنبيه', 'اختر صورة الإيصال أولًا');
      return;
    }
    setSaving(true);
    try {
      const [imageUrl, receiptUrl] = await repo.uploadImages(
        [...bannerImg, ...receipt],
        'featured',
      );
      repo.addFeaturedRequest({
        storeId: user.storeId,
        userId: user.id,
        imageUri: imageUrl,
        receiptUri: receiptUrl,
      });
      setBannerImg([]);
      setReceipt([]);
      Alert.alert('تم', 'أُرسل طلب التمييز — تراجعه الإدارة ويظهر إعلانك بالبانر الرئيسي بعد الموافقة');
    } catch {
      Alert.alert(
        'تعذر الإرسال',
        'فشل رفع الصور — تحقق من اتصال الإنترنت وحاول مجددًا.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <View style={styles.headRow}>
        <AppIcon name="star" size={26} color={colors.gold} />
        <Text style={styles.title}>
          {isListingMode ? 'ميّز إعلانك بقسم المميزة' : 'ميّز إعلانك بالبانر الرئيسي'}
        </Text>
      </View>
      <Text style={styles.desc}>
        {isListingMode
          ? `يظهر إعلانك بقسم «إعلانات مميزة» في الواجهة أمام كل المستخدمين لمدة ${settings.durationDays} أيام بعد موافقة الإدارة.`
          : `يظهر إعلانك المصوَّر في البانر الرئيسي للواجهة أمام كل المستخدمين لمدة ${settings.durationDays} أيام بعد موافقة الإدارة.`}
      </Text>

      {isListingMode && listing && (
        <View style={styles.listingCard}>
          {listing.images?.[0] ? (
            <Image source={{ uri: listing.images[0] }} style={styles.listingImg} resizeMode="cover" />
          ) : (
            <PlaceholderImage icon={listing.icon} color={listing.g1} size={44} />
          )}
          <View style={styles.listingBody}>
            <Text style={styles.listingName} numberOfLines={2}>{listing.name}</Text>
            {alreadyFeatured ? (
              <Text style={styles.featNow}>مميز حتى {formatDateTime(listing.featuredUntil!)}</Text>
            ) : existingActive ? (
              <Text style={styles.featWait}>طلب تمييز {STATUS_LABEL[existingActive.status]}</Text>
            ) : null}
          </View>
        </View>
      )}

      <View style={styles.priceBox}>
        <Text style={styles.priceLabel}>سعر التمييز</Text>
        <Text style={styles.price}>
          {settings.price > 0 ? `${settings.price}` : 'يحدده مالك التطبيق'}
        </Text>
      </View>

      {!isListingMode && (
        <ImagePickerField images={bannerImg} onChange={setBannerImg} max={1} label="صورة الإعلان (تظهر بالبانر)" />
      )}

      {settings.price > 0 && (
        <>
          <View style={styles.stepRow}>
            <AppIcon name="receipt" size={18} color={colors.text} />
            <Text style={styles.stepText}>حوّل المبلغ ثم ارفع صورة الإيصال</Text>
          </View>
          <ImagePickerField images={receipt} onChange={setReceipt} max={1} label="صورة الإيصال" />
        </>
      )}

      {!alreadyFeatured && !existingActive && (
        <Pressable
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={isListingMode ? submitListing : submitBanner}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <View style={styles.btnRow}>
              <AppIcon name="upload" size={18} color={colors.white} />
              <Text style={styles.btnText}>إرسال طلب التمييز</Text>
            </View>
          )}
        </Pressable>
      )}

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
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    elevation: 1,
  },
  listingImg: { width: 64, height: 64, borderRadius: radius.sm },
  listingBody: { flex: 1 },
  listingName: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  featNow: { fontSize: fontSize.sm, fontWeight: '800', color: colors.gold, marginTop: 4 },
  featWait: { fontSize: fontSize.sm, fontWeight: '700', color: '#8A6D14', marginTop: 4 },
  priceBox: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 2, borderColor: colors.gold, padding: spacing.md, marginTop: spacing.md, alignItems: 'center' },
  priceLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  price: { fontSize: fontSize.xl, fontWeight: '800', color: colors.gold, marginTop: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, marginBottom: spacing.sm },
  stepText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  btn: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  btnDisabled: { opacity: 0.7 },
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
