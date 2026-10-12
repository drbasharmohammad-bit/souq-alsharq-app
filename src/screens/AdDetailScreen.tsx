import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { RemoteImage } from '../components/RemoteImage';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useGov } from '../context/GovContext';
import { formatPrice, sectionName } from '../data';
import { RootStackParamList } from '../navigation/types';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';
import { formatDate, formatDateTime } from '../utils/format';
import { showToast } from '../utils/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'AdDetail'>;

const W = Dimensions.get('window').width;

export function AdDetailScreen({ navigation, route }: Props) {
  const repo = useRepo();
  const { gov } = useGov();
  const { user } = useAuth();
  const { toggle, isFav } = useFavorites();
  const [page, setPage] = useState(0);
  const [fullImg, setFullImg] = useState<string | null>(null);

  const listing = route.params.listingId ? repo.getListingById(route.params.listingId) : undefined;
  const product = route.params.productId ? repo.getProductById(route.params.productId) : undefined;

  const images = useMemo(
    () => (listing ? listing.images ?? [] : product ? product.images : []),
    [listing, product],
  );
  const price = listing ? listing.price : product?.price ?? null;
  const priceNote = listing?.priceNote;
  const title = listing ? listing.name : product?.name ?? '';
  const desc = listing ? listing.desc : product?.description ?? '';

  // المتجر المرتبط: للمنتج مباشرة، وللإعلان عبر المستخدم أو مطابقة الاسم
  const store = useMemo(() => {
    if (product) return repo.getStoreById(product.storeId);
    if (!listing) return undefined;
    if (listing.userId) {
      const u = repo.getUserById(listing.userId);
      if (u?.storeId) return repo.getStoreById(u.storeId);
    }
    if (listing.sellerType === 'store') {
      return repo.getStores().find(s => s.name === listing.seller);
    }
    return undefined;
  }, [repo, listing, product]);

  const sellerUser = useMemo(
    () => (listing?.userId ? repo.getUserById(listing.userId) : undefined),
    [repo, listing],
  );
  const sellerAdsCount = useMemo(
    () => (listing?.userId ? repo.getUserListings(listing.userId).length : 0),
    [repo, listing],
  );

  const similar = useMemo(() => {
    if (listing) {
      return repo
        .getListings({ sec: listing.sec, gov: listing.gov, status: 'approved' })
        .filter(l => l.id !== listing.id)
        .slice(0, 8);
    }
    if (product) {
      return repo.getProductsByStore(product.storeId).filter(p => p.id !== product.id).slice(0, 8);
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, listing?.id, product?.id]);

  if (!listing && !product) {
    return (
      <View style={styles.center}>
        <AppIcon name="file-remove-outline" size={52} color={colors.textMuted} />
        <Text style={styles.empty}>الإعلان غير موجود</Text>
      </View>
    );
  }

  const sellerName = listing ? listing.seller : store?.name ?? '';
  const sellerPhone = listing?.phone ?? store?.phone;
  const fav = listing ? isFav(listing.id) : false;

  const call = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
    else showToast('لا يوجد رقم هاتف');
  };

  const goStore = () => {
    if (store) navigation.navigate('StoreDetail', { storeId: store.id });
    else showToast('صفحة المتجر غير متوفرة');
  };

  // مشاركة الإعلان كنص (v22)
  const shareAd = () => {
    const priceText = price != null ? formatPrice(price, priceNote) : 'السعر عند الاتصال';
    const msg =
      `إعلان: ${title}\n` +
      `السعر: ${priceText}\n` +
      (sellerPhone ? `للتواصل: ${sellerPhone}\n` : '') +
      `حمّل تطبيق HDR — حسكتك، ديرتك، رقتك... بتطبيق واحد`;
    Share.share({ message: msg }).catch(() => {});
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* معرض الصور */}
      {images.length > 0 ? (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setPage(Math.round(e.nativeEvent.contentOffset.x / W))}>
            {images.map(uri => (
              <Pressable key={uri} onPress={() => setFullImg(uri)}>
                <RemoteImage uri={uri} style={styles.gimg} />
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{page + 1} / {images.length}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noimg}>
          <AppIcon
            name={listing ? listing.icon : 'image'}
            size={90}
            color={listing ? listing.g1 : colors.textMuted}
          />
        </View>
      )}
      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
        <AppIcon name="arrow-right" size={20} color={colors.primary} />
      </Pressable>
      {listing && (
        <Pressable style={styles.favBtn} onPress={() => toggle(listing.id)} hitSlop={8}>
          <AppIcon
            name={fav ? 'heart' : 'heart-outline'}
            size={22}
            color={fav ? colors.danger : colors.textMuted}
          />
        </Pressable>
      )}
      <Pressable style={styles.shareBtn} onPress={shareAd} hitSlop={8}>
        <AppIcon name="share-variant" size={20} color={colors.primary} />
      </Pressable>

      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(price, priceNote)}</Text>
        </View>
        {listing && listing.previousPrice != null && listing.price != null && listing.previousPrice > listing.price && (
          <View style={styles.dropRow}>
            <View style={styles.dropBadge}>
              <AppIcon name="trending-down" size={14} color={colors.gold} />
              <Text style={styles.dropBadgeText}>انخفض السعر</Text>
            </View>
            <Text style={styles.oldPrice}>{formatPrice(listing.previousPrice, undefined)}</Text>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metaRow}>
          <AppIcon name="map-marker" size={14} color={colors.textMuted} />
          <Text style={styles.meta}>
            {listing ? `${listing.gov} • ${sectionName(listing.sec)}` : store?.gov ?? gov} •{' '}
            {formatDateTime(listing ? listing.createdAt : product!.createdAt)}
            {listing ? ` • رقم ${listing.id}` : ''}
          </Text>
        </View>

        {listing?.kind === 'estate' && (
          <View style={styles.warn}>
            <Text style={styles.warnText}>
              تنبيه: إدارة التطبيق وسيط إعلاني فقط وغير مسؤولة عن أي تعامل أو اتفاق بين الأطراف — تحقق بنفسك قبل أي دفع.
            </Text>
          </View>
        )}

        {listing?.specs && listing.specs.length > 0 && (
          <>
            <Text style={styles.secTitle}>المواصفات</Text>
            <View style={styles.specs}>
              {listing.specs.map((s, i) => (
                <View key={i} style={styles.specRow}>
                  <Text style={styles.specLabel}>{s.label}</Text>
                  <Text style={styles.specValue}>{s.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!!desc && (
          <>
            <Text style={styles.secTitle}>الوصف</Text>
            <Text style={styles.desc}>{desc}</Text>
          </>
        )}

        {/* بطاقة البائع */}
        <Text style={styles.secTitle}>{store ? 'المتجر' : 'البائع'}</Text>
        <View style={styles.sellerCard}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{sellerName.charAt(0)}</Text>
          </View>
          <View style={styles.sellerBody}>
            <Text style={styles.sellerName}>{sellerName}</Text>
            {sellerUser && (
              <Text style={styles.sellerMeta}>عضو منذ {formatDate(sellerUser.createdAt)}</Text>
            )}
            {sellerAdsCount > 0 && (
              <Text style={styles.sellerMeta}>{sellerAdsCount} إعلان منشور</Text>
            )}
            {store?.verified && (
              <View style={styles.miniBadge}>
                <AppIcon name="check-circle" size={12} color={colors.primary} />
                <Text style={styles.miniBadgeText}>متجر موثق</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.sellerBtns}>
          {store && (
            <Pressable style={[styles.sbtn, styles.sbtnGhost]} onPress={goStore}>
              <AppIcon name="store" size={16} color={colors.primary} />
              <Text style={styles.sbtnGhostText}>زيارة المتجر</Text>
            </Pressable>
          )}
          {listing && (
            <Pressable
              style={[styles.sbtn, styles.sbtnGhost]}
              onPress={() => navigation.navigate('Search', { q: listing.seller })}>
              <Text style={styles.sbtnGhostText}>كل الإعلانات</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.callCta} onPress={() => call(sellerPhone)}>
          <AppIcon name="phone" size={22} color={colors.white} />
          <Text style={styles.callCtaText}>اتصال بالبائع</Text>
        </Pressable>

        {/* صلاحيات المدير على الإعلان */}
        {listing && user?.isAdmin && (
          <View style={styles.adminBox}>
            <View style={styles.adminTitleRow}>
              <AppIcon name="shield-account" size={16} color={colors.primary} />
              <Text style={styles.adminTitle}>إجراءات المدير</Text>
              <Text style={styles.adminStatus}>
                الحالة: {listing.status === 'approved' ? 'معتمد' : listing.status === 'pending' ? 'بانتظار المراجعة' : 'مخفي'}
              </Text>
            </View>
            <View style={styles.adminBtns}>
              <Pressable
                style={[styles.abtn, styles.abtnOk]}
                onPress={() => repo.updateListingStatus(listing.id, 'approved')}>
                <AppIcon name="check" size={15} color={colors.white} />
                <Text style={styles.abtnText}>اعتماد</Text>
              </Pressable>
              <Pressable
                style={[styles.abtn, styles.abtnHide]}
                onPress={() => repo.updateListingStatus(listing.id, 'rejected')}>
                <AppIcon name="eye-off" size={15} color={colors.white} />
                <Text style={styles.abtnText}>إخفاء</Text>
              </Pressable>
              <Pressable
                style={[styles.abtn, styles.abtnDel]}
                onPress={() =>
                  Alert.alert('حذف الإعلان', `سيُحذف «${listing.name}» نهائيًا. متابعة؟`, [
                    { text: 'إلغاء', style: 'cancel' },
                    {
                      text: 'حذف',
                      style: 'destructive',
                      onPress: () => {
                        repo.deleteListing(listing.id);
                        navigation.goBack();
                      },
                    },
                  ])
                }>
                <AppIcon name="delete" size={15} color={colors.white} />
                <Text style={styles.abtnText}>حذف</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* إعلانات مشابهة */}
        {similar.length > 0 && (
          <>
            <Text style={styles.secTitle}>إعلانات مشابهة</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.simRow}>
              {similar.map(item => {
                const isL = 'sec' in item;
                const imgUri = (item as { images?: string[] }).images?.[0];
                return (
                  <Pressable
                    key={item.id}
                    style={styles.sim}
                    onPress={() =>
                      isL
                        ? navigation.push('AdDetail', { listingId: item.id })
                        : navigation.push('AdDetail', { productId: item.id })
                    }>
                    {imgUri ? (
                      <RemoteImage
                        uri={imgUri}
                        style={styles.simg}
                        fallback={
                          <View style={[styles.simg, styles.simgPh]}>
                            <AppIcon name={isL ? (item as { icon: string }).icon : 'image'} size={30} color={colors.textMuted} />
                          </View>
                        }
                      />
                    ) : (
                      <View style={[styles.simg, styles.simgPh]}>
                        <AppIcon name={isL ? (item as { icon: string }).icon : 'image'} size={30} color={colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.simBody}>
                      <Text style={styles.simName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.simPrice}>
                        {item.price != null ? `${item.price.toLocaleString('ar-SY')} ل.س` : 'حسب الاتفاق'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}
        <View style={{ height: spacing.xl }} />
      </View>

      {/* ملء الشاشة */}
      <Modal visible={!!fullImg} transparent animationType="fade" onRequestClose={() => setFullImg(null)}>
        <Pressable style={styles.modal} onPress={() => setFullImg(null)}>
          {fullImg && <RemoteImage uri={fullImg} style={styles.fullImg} resizeMode="contain" />}
          <View style={styles.modalClose}>
            <AppIcon name="close" size={22} color={colors.white} />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.background },
  empty: { color: colors.textMuted, fontSize: fontSize.md },
  gimg: { width: W, height: 320 },
  countBadge: {
    position: 'absolute', bottom: 26, left: 12, backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4,
  },
  countText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '700' },
  noimg: { height: 260, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border },
  backBtn: {
    position: 'absolute', top: 50, right: 14, width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  favBtn: {
    position: 'absolute', top: 50, left: 14, width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  shareBtn: {
    position: 'absolute', top: 94, left: 14, width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  body: { padding: spacing.lg, backgroundColor: colors.white, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, marginTop: -spacing.lg },
  priceRow: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '14',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  price: { fontSize: 30, fontWeight: '800', color: colors.primary },
  dropRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  dropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dropBadgeText: { fontSize: fontSize.sm, fontWeight: '800', color: '#7A5A12' },
  oldPrice: { fontSize: fontSize.md, color: colors.textMuted, textDecorationLine: 'line-through' },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, flex: 1 },
  warn: { backgroundColor: '#FFF8E6', borderWidth: 1, borderColor: colors.gold, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  warnText: { fontSize: fontSize.sm, color: '#7A5A12', lineHeight: 22 },
  secTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  specs: { marginTop: spacing.sm, backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  specLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  specValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  desc: { fontSize: fontSize.md, color: colors.text, lineHeight: 26, marginTop: spacing.sm },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm, gap: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: '800' },
  sellerBody: { flex: 1 },
  sellerName: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  sellerMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  miniBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  miniBadgeText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' },
  sellerBtns: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
  sbtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.md, padding: spacing.sm },
  sbtnPrimary: { backgroundColor: colors.primary },
  sbtnPrimaryText: { color: colors.white, fontWeight: '800', fontSize: fontSize.sm },
  sbtnGhost: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary },
  sbtnGhostText: { color: colors.primary, fontWeight: '800', fontSize: fontSize.sm },
  callCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: spacing.md, marginTop: spacing.md,
    elevation: 4, shadowColor: colors.primary, shadowOpacity: 0.3,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  callCtaText: { color: colors.white, fontWeight: '800', fontSize: fontSize.lg },
  adminBox: {
    backgroundColor: '#F4FAF7', borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md,
  },
  adminTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adminTitle: { fontSize: fontSize.sm, fontWeight: '800', color: colors.primary, flex: 1 },
  adminStatus: { fontSize: fontSize.xs, color: colors.textMuted },
  adminBtns: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
  abtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: radius.sm, paddingVertical: 9,
  },
  abtnOk: { backgroundColor: colors.primary },
  abtnHide: { backgroundColor: colors.textMuted },
  abtnDel: { backgroundColor: colors.danger },
  abtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '800' },
  simRow: { gap: 10, paddingVertical: 8 },
  sim: { width: 140, backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', elevation: 1 },
  simg: { width: 140, height: 90 },
  simgPh: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  simBody: { padding: 8 },
  simName: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  simPrice: { fontSize: fontSize.sm, fontWeight: '800', color: colors.primary, marginTop: 2 },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', alignItems: 'center', justifyContent: 'center' },
  fullImg: { width: W, height: '80%' },
  modalClose: { position: 'absolute', top: 50, left: 18, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
});
