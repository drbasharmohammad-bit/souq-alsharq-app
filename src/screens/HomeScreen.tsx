import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { GovChips } from '../components/GovChips';
import { ListingCard } from '../components/ListingCard';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { GOVS, SECTIONS } from '../data';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { useAnnouncements } from '../repo/announcements';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';
import { Banner as BannerT } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BANNERS = [
  { id: 'b1', title: 'سوق الشرق', sub: 'كل إعلانات الجزيرة والفرات بمكان واحد', c: '#0E6B4A', icon: 'store' },
  { id: 'b2', title: 'أضف إعلانك مجانًا', sub: 'بيع واشترِ بسهولة في محافظتك', c: '#7A4A1F', icon: 'bullhorn' },
  { id: 'b3', title: 'دليل طبي موثق', sub: 'أطباء وصيدليات ببيانات مؤكدة من الإدارة', c: '#1E6FA3', icon: 'stethoscope' },
];

const PAGE = Dimensions.get('window').width - spacing.md * 2;

type CarouselItem =
  | { kind: 'featured'; id: string; imageUri: string; storeId: string }
  | { kind: 'banner'; data: BannerT }
  | { kind: 'default'; id: string; title: string; sub: string; c: string; icon: string };

export function HomeScreen({ navigation }: Props) {
  const [gov, setGov] = useState('الكل');
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const repo = useRepo();

  useEffect(() => {
    AsyncStorage.getItem('sharq_ann_dismissed').then(v => setDismissedId(v));
    repo.getActiveFeatured(); // تنظيف المنتهية
  }, [repo]);

  const { items: remoteAnns } = useAnnouncements();
  const latestAnn = (remoteAnns.length > 0 ? remoteAnns : repo.getAnnouncements())[0];
  const showAnn = latestAnn && latestAnn.id !== dismissedId;

  // عناصر الكاروسيل: مميزة مدفوعة أولًا، ثم بانرات الإدارة، ثم الافتراضية
  const now = Date.now();
  const carousel: CarouselItem[] = [];
  repo
    .getFeaturedRequests()
    .filter(f => f.status === 'active' && (!f.endDate || f.endDate > now))
    .forEach(f =>
      carousel.push({ kind: 'featured', id: f.id, imageUri: f.imageUri, storeId: f.storeId }),
    );
  repo
    .getActiveBanners()
    .forEach(b => carousel.push({ kind: 'banner', data: b }));
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

  const featured = useMemo(
    () => repo.getListings({ gov, status: 'approved' }).slice(0, 6),
    [repo, gov],
  );
  const stores = useMemo(() => repo.getStores(), [repo]);

  const goSection = (key: string) => {
    if (key === 'medical') navigation.navigate('Medical');
    else navigation.navigate('SubCategories', { sectionKey: key });
  };

  const goBannerTarget = (b: BannerT) => {
    if (b.targetType === 'section' && b.targetId) {
      goSection(b.targetId);
    } else if (b.targetType === 'announcement') {
      navigation.navigate('Announcements');
    }
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
    const tappable = item.kind === 'banner' && !!item.data.targetType;
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
    return tappable ? (
      <Pressable onPress={() => goBannerTarget((item as { data: BannerT }).data)}>{inner}</Pressable>
    ) : (
      inner
    );
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* الهيدر */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <AppIcon name="store" size={30} color={colors.white} />
          <Text style={styles.logo}>سوق الشرق</Text>
        </View>
        <Text style={styles.tagline}>إعلانات الجزيرة والفرات</Text>
        <Pressable style={styles.searchBox} onPress={() => navigation.navigate('Search')}>
          <View style={styles.searchRow}>
            <AppIcon name="magnify" size={18} color={colors.textMuted} />
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

      {/* شبكة الأقسام */}
      <Text style={styles.secTitlePlain}>الأقسام</Text>
      <View style={styles.grid}>
        {SECTIONS.map(s => (
          <Pressable key={s.key} style={styles.tile} onPress={() => goSection(s.key)}>
            <View style={[styles.tileIcon, { backgroundColor: s.g1 + '1A' }]}>
              <AppIcon name={s.icon} size={26} color={s.g1} />
            </View>
            <Text style={styles.tileName}>{s.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* متاجر مميزة */}
      <View style={styles.secTitleRow}>
        <AppIcon name="star" size={20} color={colors.gold} />
        <Text style={styles.secTitle}>متاجر مميزة</Text>
      </View>
      <FlatList
        horizontal
        data={stores}
        keyExtractor={s => s.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        renderItem={({ item }) => (
          <View style={styles.storeCard}>
            <PlaceholderImage icon={item.icon} color={item.g1} size={56} />
            <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.storeMetaRow}>
              <AppIcon name="map-marker" size={12} color={colors.textMuted} />
              <Text style={styles.storeMeta} numberOfLines={1}>{item.gov}</Text>
            </View>
          </View>
        )}
      />

      {/* منتجات مميزة */}
      <View style={styles.secTitleRow}>
        <AppIcon name="sparkles" size={20} color={colors.gold} />
        <Text style={styles.secTitle}>إعلانات مميزة</Text>
      </View>
      <FlatList
        data={featured}
        keyExtractor={l => l.id}
        scrollEnabled={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('Detail', { listingId: item.id })} />
        )}
      />
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingBottom: spacing.md },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.white },
  tagline: { fontSize: fontSize.sm, color: colors.goldLight, marginTop: 2 },
  searchBox: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchHint: { color: colors.textMuted, fontSize: fontSize.sm, flex: 1 },
  hidden: { display: 'none' },
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
  secTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, margin: spacing.md, marginBottom: spacing.sm },
  secTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  secTitlePlain: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, margin: spacing.md, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm },
  tile: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    alignItems: 'center',
    padding: spacing.md,
    margin: '1%',
    elevation: 1,
  },
  tileIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  tileName: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text, marginTop: 6, textAlign: 'center' },
  hList: { paddingHorizontal: spacing.md, gap: spacing.md },
  storeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    width: 130,
    elevation: 1,
  },
  storeName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginTop: 6 },
  storeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  storeMeta: { fontSize: fontSize.xs, color: colors.textMuted, flex: 1 },
});
