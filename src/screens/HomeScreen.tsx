import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { GovChips } from '../components/GovChips';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { RemoteImage } from '../components/RemoteImage';
import { SectionImage } from '../components/SectionImage';
import { useGov } from '../context/GovContext';
import { useFavorites } from '../context/FavoritesContext';
import { GOVS, SECTIONS, formatPrice, sectionName } from '../data';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { useAnnouncements } from '../repo/announcements';
import { useRepo, useRepoRefresh } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';
import { showToast } from '../utils/toast';
import { Banner as BannerT, Listing, Store } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BANNERS = [
  { id: 'b1', title: 'HDR', sub: 'كل إعلانات الجزيرة والفرات بمكان واحد', c: '#0E6B4A', icon: 'store' },
  { id: 'b2', title: 'أضف إعلانك مجانًا', sub: 'بيع واشترِ بسهولة في محافظتك', c: '#7A4A1F', icon: 'bullhorn' },
  { id: 'b3', title: 'دليل طبي موثق', sub: 'أطباء وصيدليات ببيانات مؤكدة من الإدارة', c: '#1E6FA3', icon: 'stethoscope' },
];

const W = Dimensions.get('window').width;
const PAGE = W - spacing.md * 2;
const STORE_CARD_W = 168;
const SECTION_CARD_W = 96;
const AD_CARD_W = (W - spacing.md * 2 - spacing.sm) / 2;

type CarouselItem =
  | { kind: 'featured'; id: string; imageUri: string; storeId: string }
  | { kind: 'banner'; data: BannerT }
  | { kind: 'default'; id: string; title: string; sub: string; c: string; icon: string };

export function HomeScreen({ navigation }: Props) {
  const { gov, setGov } = useGov();
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const repo = useRepo();
  const refreshRepo = useRepoRefresh();
  const { toggle, isFav } = useFavorites();

  useEffect(() => {
    AsyncStorage.getItem('sharq_ann_dismissed').then(v => setDismissedId(v));
    repo.getActiveFeatured(); // تنظيف المنتهية
  }, [repo]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshRepo();
    } finally {
      setRefreshing(false);
    }
  }, [refreshRepo]);

  const { items: remoteAnns } = useAnnouncements();
  const latestAnn = (remoteAnns.length > 0 ? remoteAnns : repo.getAnnouncements())[0];
  const showAnn = latestAnn && latestAnn.id !== dismissedId;

  const featured = useMemo(
    () => repo.getFeaturedListings(gov === 'الكل' ? undefined : gov),
    [repo, gov],
  );
  // أحدث المنتجات: أحدث الإعلانات المعتمدة باستثناء المميزة الظاهرة (v15)
  const latestProducts = useMemo(() => {
    const featIds = new Set(featured.map(f => f.id));
    return repo
      .getListings({ gov: gov === 'الكل' ? undefined : gov, status: 'approved' })
      .filter(l => !featIds.has(l.id))
      .slice(0, 6);
  }, [repo, gov, featured]);
  const stores = useMemo(() => repo.getStores(gov === 'الكل' ? undefined : gov), [repo, gov]);

  // البانرات الظاهرة لمحافظة المستخدم (أو 'all' للجميع)
  const visibleBanners = useMemo(
    () =>
      repo
        .getActiveBanners()
        .filter(b => !b.governorate || b.governorate === 'all' || gov === 'الكل' || b.governorate === gov),
    [repo, gov],
  );

  // عناصر الكاروسيل: مميزة مدفوعة أولًا، ثم بانرات الإدارة، ثم الافتراضية
  const now = Date.now();
  const carousel: CarouselItem[] = [];
  repo
    .getFeaturedRequests()
    .filter(f => f.status === 'active' && f.storeId && !f.listingId && (!f.endDate || f.endDate > now))
    .forEach(f =>
      carousel.push({ kind: 'featured', id: f.id, imageUri: f.imageUri, storeId: f.storeId as string }),
    );
  visibleBanners.forEach(b => carousel.push({ kind: 'banner', data: b }));
  if (carousel.length === 0) {
    BANNERS.forEach(b => carousel.push({ kind: 'default', ...b }));
  }

  const dismissAnn = async () => {
    if (latestAnn) {
      setDismissedId(latestAnn.id);
      try {
        await AsyncStorage.setItem('sharq_ann_dismissed', latestAnn.id);
      } catch {
        // تجاهل
      }
    }
  };

  const goSection = (key: string) => {
    if (key === 'medical') navigation.navigate('Medical');
    else navigation.navigate('SubCategories', { sectionKey: key });
  };

  const goBannerTarget = (b: BannerT) => {
    if (!b.targetType) return;
    if (b.targetType === 'section' && b.targetId) {
      if (b.targetId === 'medical') navigation.navigate('Medical');
      else if (SECTIONS.some(s => s.key === b.targetId)) {
        navigation.navigate('SubCategories', { sectionKey: b.targetId });
      } else showToast('الوجهة غير متوفرة');
    } else if (b.targetType === 'store' && b.targetId) {
      if (repo.getStoreById(b.targetId)) {
        navigation.navigate('StoreDetail', { storeId: b.targetId });
      } else showToast('المتجر غير متوفر');
    } else if (b.targetType === 'announcement') {
      navigation.navigate('Announcements');
    }
  };

  const goStore = (storeId: string) => {
    if (repo.getStoreById(storeId)) {
      navigation.navigate('StoreDetail', { storeId });
    } else showToast('المتجر غير متوفر');
  };

  const itemKey = (item: CarouselItem) =>
    item.kind === 'banner' ? `banner-${item.data.id}` : `${item.kind}-${item.id}`;
  const renderCarouselItem = (item: CarouselItem) => {
    if (item.kind === 'default') {
      return (
        <View style={[styles.banner, { backgroundColor: item.c }]}>
          <AppIcon name={item.icon} size={38} color={colors.white} />
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSub}>{item.sub}</Text>
        </View>
      );
    }
    const imageUri = item.kind === 'featured' ? item.imageUri : item.data.imageUri;
    const title = item.kind === 'featured' ? repo.getStoreById(item.storeId)?.name : item.data.title;
    const sub = item.kind === 'featured' ? 'إعلان مميز' : item.data.subtitle;
    const inner = (
      <View style={styles.bannerImgWrap}>
        <Image source={{ uri: imageUri }} style={styles.bannerImg} resizeMode="cover" />
        <View style={styles.bannerOverlay}>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle} numberOfLines={1}>{title}</Text>
            {!!sub && <Text style={styles.bannerSub} numberOfLines={1}>{sub}</Text>}
          </View>
          {item.kind === 'featured' && (
            <View style={styles.featBadge}>
              <AppIcon name="star" size={12} color={colors.white} />
              <Text style={styles.featBadgeText}>مميز</Text>
            </View>
          )}
        </View>
      </View>
    );
    if (item.kind === 'featured') {
      return <Pressable onPress={() => goStore(item.storeId)}>{inner}</Pressable>;
    }
    if (item.kind === 'banner' && item.data.targetType) {
      return (
        <Pressable onPress={() => goBannerTarget((item as { data: BannerT }).data)}>{inner}</Pressable>
      );
    }
    return inner;
  };

  const renderStoreCard = (store: Store) => (
    <Pressable key={store.id} onPress={() => goStore(store.id)}>
      <View style={styles.storeCard}>
        <View style={styles.storeImgWrap}>
          <RemoteImage
            uri={store.logoImage}
            style={styles.storeImg}
            fallback={
              <View style={[styles.storeImgFallback, { backgroundColor: store.g1 + '1F' }]}>
                <PlaceholderImage icon={store.icon} color={store.g1} size={72} />
              </View>
            }
          />
          <View style={styles.storeBadge}>
            <AppIcon name="star" size={10} color={colors.white} />
            <Text style={styles.storeBadgeText}>مميز</Text>
          </View>
        </View>
        <View style={styles.storeBody}>
          <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
          <Text style={styles.storeMeta} numberOfLines={1}>
            {sectionName(store.sec)} • {store.gov}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderAdCard = (item: Listing, showFeatBadge = false) => {
    const fav = isFav(item.id);
    const priceText = item.price === null ? 'السعر عند الاتصال' : formatPrice(item.price, item.priceNote);
    const img = item.images?.[0];
    return (
      <Pressable
        key={item.id}
        style={styles.adCard}
        onPress={() => navigation.navigate('AdDetail', { listingId: item.id })}>
        <View style={[styles.adImgWrap, { backgroundColor: item.g1 + '1F' }]}>
          <RemoteImage
            uri={img}
            style={styles.adImg}
            fallback={<PlaceholderImage icon={item.icon} color={item.g1} size={52} />}
          />
          {showFeatBadge && (
            <View style={styles.adFeatBadge}>
              <AppIcon name="star" size={11} color={colors.white} />
              <Text style={styles.adFeatBadgeText}>مميز</Text>
            </View>
          )}
          <Pressable style={styles.favBtn} hitSlop={8} onPress={() => toggle(item.id)}>
            <AppIcon name={fav ? 'heart' : 'heart-outline'} size={20} color={colors.danger} />
          </Pressable>
        </View>
        <View style={styles.adBody}>
          <Text style={styles.adName} numberOfLines={2}>{item.name}</Text>
          <Text
            style={[styles.adPrice, item.price === null && styles.adPriceNote]}
            numberOfLines={1}>
            {priceText}
          </Text>
          <View style={styles.adLocRow}>
            <AppIcon name="map-marker" size={12} color={colors.textMuted} />
            <Text style={styles.adLoc} numberOfLines={1}>
              {item.area ? `${item.area}، ${item.gov}` : item.gov}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = (icon: string, text: string) => (
    <View style={styles.emptyState}>
      <AppIcon name={icon} size={40} color={colors.textMuted} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}>
      {/* الهيدر — المونوغرام وحده في الوسط */}
      <View style={styles.header}>
        <View style={styles.headerDeco}>
          <AppIcon name="store" size={120} color={colors.white} />
        </View>
        <View style={styles.logoRow}>
          <Image
            source={require('../assets/hdr-logo-white.png')}
            style={styles.monogram}
            resizeMode="contain"
          />
        </View>
        <Pressable style={styles.searchBox} onPress={() => navigation.navigate('Search')}>
          <View style={styles.searchRow}>
            <AppIcon name="magnify" size={20} color={colors.primary} />
            <Text style={styles.searchHint}>ابحث عن سيارة، شقة، طبيب...</Text>
          </View>
        </Pressable>
      </View>

      <GovChips govs={GOVS} selected={gov} onSelect={setGov} />

      {/* بانر الإعلانات الإدارية */}
      {showAnn && latestAnn && (
        <View style={styles.annBanner}>
          <AppIcon name="bullhorn" size={24} color={colors.white} />
          <Pressable style={styles.annBody} onPress={() => navigation.navigate('Announcements')}>
            <Text style={styles.annTitle} numberOfLines={1}>{latestAnn.title}</Text>
            <Text style={styles.annText} numberOfLines={2}>{latestAnn.body}</Text>
          </Pressable>
          <Pressable onPress={dismissAnn} hitSlop={10} style={styles.annClose}>
            <AppIcon name="close" size={18} color={colors.white} />
          </Pressable>
        </View>
      )}

      {/* البانر: مميزة مدفوعة + بانرات الإدارة + افتراضية */}
      <View style={styles.bannerWrap}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e =>
            setPage(Math.round(e.nativeEvent.contentOffset.x / PAGE))
          }>
          {carousel.map(item => (
            <View key={itemKey(item)} style={styles.page}>
              {renderCarouselItem(item)}
            </View>
          ))}
        </ScrollView>
        {carousel.length > 1 && (
          <View style={styles.dots}>
            {carousel.map((item, i) => (
              <View
                key={`d-${itemKey(item)}`}
                style={[styles.dot, i === page && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* بطاقات الأقسام */}
      <View style={styles.secTitleRow}>
        <View style={styles.secAccent} />
        <Text style={styles.secTitle}>الأقسام</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionList}>
        {SECTIONS.map(s => (
          <Pressable key={s.key} onPress={() => goSection(s.key)}>
            <View style={styles.sectionCard}>
              <SectionImage section={s} size={SECTION_CARD_W} style={{ borderRadius: 0 }} />
              <Text style={styles.sectionName} numberOfLines={2}>{s.name}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* المتاجر المميزة */}
      <View style={styles.secTitleRow}>
        <View style={styles.secAccent} />
        <Text style={styles.secTitle}>متاجر مميزة</Text>
        <AppIcon name="star" size={20} color={colors.gold} />
      </View>
      {stores.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storeList}>
          {stores.map(renderStoreCard)}
        </ScrollView>
      ) : (
        renderEmptyState('storefront-outline', 'لا توجد متاجر في هذه المحافظة بعد')
      )}

      {/* إعلانات مميزة — قسم مدفوع */}
      <View style={styles.secTitleRow}>
        <View style={styles.secAccent} />
        <Text style={styles.secTitle}>إعلانات مميزة</Text>
        <AppIcon name="star" size={20} color={colors.gold} />
      </View>
      {featured.length > 0 ? (
        <View style={styles.adGrid}>
          {featured.map(item => renderAdCard(item, true))}
        </View>
      ) : (
        renderEmptyState('star-outline', 'لا توجد إعلانات مميزة حاليًا — ميّز إعلانك ليظهر هنا')
      )}

      {/* أحدث المنتجات */}
      <View style={styles.secTitleRow}>
        <View style={styles.secAccent} />
        <Text style={styles.secTitle}>أحدث المنتجات</Text>
        <AppIcon name="package-variant" size={20} color={colors.primary} />
      </View>
      {latestProducts.length > 0 ? (
        <View style={styles.adGrid}>
          {latestProducts.map(item => renderAdCard(item))}
        </View>
      ) : (
        renderEmptyState('package-variant', 'لا توجد منتجات بعد — كن أول من ينشر إعلانه')
      )}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    overflow: 'hidden',
  },
  headerDeco: { position: 'absolute', left: -24, top: -18, opacity: 0.1 },
  logoRow: { alignItems: 'center', justifyContent: 'center' },
  monogram: { width: 120, height: 76 },
  searchBox: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchHint: { color: colors.textMuted, fontSize: fontSize.md, flex: 1 },
  bannerWrap: { marginTop: spacing.md },
  page: { width: PAGE },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 22 },
  bannerImgWrap: { width: PAGE - spacing.sm, height: 170, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.border },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    end: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bannerTextCol: { flex: 1 },
  featBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  featBadgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '800' },
  annBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  annBody: { flex: 1 },
  annTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.white },
  annText: { fontSize: fontSize.sm, color: colors.white, opacity: 0.92, marginTop: 2 },
  annClose: { padding: 4 },
  banner: {
    width: PAGE - spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginStart: 0,
    minHeight: 170,
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.white, marginTop: spacing.sm },
  bannerSub: { fontSize: fontSize.sm, color: colors.white, opacity: 0.9, marginTop: 4 },
  secTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: spacing.md, marginBottom: spacing.sm, marginTop: spacing.lg },
  secAccent: { width: 5, height: 24, borderRadius: 3, backgroundColor: colors.primary },
  secTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, flex: 1 },
  secTitlePlain: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, margin: spacing.md, marginBottom: spacing.sm, marginTop: spacing.lg },
  // بطاقات الأقسام
  sectionList: { paddingHorizontal: spacing.md, gap: spacing.sm },
  sectionCard: {
    width: SECTION_CARD_W,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    paddingBottom: spacing.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionName: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text, marginTop: 8, textAlign: 'center', paddingHorizontal: 4 },
  // بطاقات المتاجر المميزة
  storeList: { paddingHorizontal: spacing.md, gap: spacing.md },
  storeCard: {
    width: STORE_CARD_W,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  storeImgWrap: {
    height: 118,
  },
  // صورة المتجر بملء البطاقة
  storeImg: {
    width: '100%',
    height: '100%',
  },
  storeImgFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeBadge: {
    position: 'absolute',
    top: 8,
    start: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    elevation: 2,
  },
  storeBadgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '800' },
  storeBody: { padding: spacing.md },
  storeName: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  storeMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 3 },
  // شبكة الإعلانات المميزة
  adGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  adCard: {
    width: AD_CARD_W,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  adImgWrap: {
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adImg: { width: '100%', height: '100%' },
  adFeatBadge: {
    position: 'absolute',
    top: 6,
    end: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  adFeatBadgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '800' },
  favBtn: {
    position: 'absolute',
    top: 6,
    start: 6,
    backgroundColor: colors.white,
    borderRadius: 18,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  adBody: { padding: spacing.sm },
  adName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, minHeight: 32 },
  adPrice: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary, marginTop: 4 },
  adPriceNote: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
  adLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  adLoc: { fontSize: fontSize.xs, color: colors.textMuted, flex: 1 },
  // حالة الفراغ
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
});
