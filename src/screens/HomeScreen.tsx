import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { GovChips } from '../components/GovChips';
import { ListingCard } from '../components/ListingCard';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { GOVS, SECTIONS } from '../data';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BANNERS = [
  { id: 'b1', title: 'سوق الشرق', sub: 'كل إعلانات الجزيرة والفرات بمكان واحد', c: '#0E6B4A', icon: 'store' },
  { id: 'b2', title: 'أضف إعلانك مجانًا', sub: 'بيع واشترِ بسهولة في محافظتك', c: '#7A4A1F', icon: 'bullhorn' },
  { id: 'b3', title: 'دليل طبي موثق', sub: 'أطباء وصيدليات ببيانات مؤكدة من الإدارة', c: '#1E6FA3', icon: 'stethoscope' },
];

export function HomeScreen({ navigation }: Props) {
  const [gov, setGov] = useState('الكل');
  const repo = useRepo();

  const featured = useMemo(
    () => repo.getListings({ gov, status: 'approved' }).slice(0, 6),
    [repo, gov],
  );
  const stores = useMemo(() => repo.getStores(), [repo]);

  const goSection = (key: string) => {
    if (key === 'medical') navigation.navigate('Medical');
    else navigation.navigate('SubCategories', { sectionKey: key });
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

      {/* البانر */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerWrap}>
        {BANNERS.map(b => (
          <View key={b.id} style={[styles.banner, { backgroundColor: b.c }]}>
            <AppIcon name={b.icon} size={38} color={colors.white} />
            <Text style={styles.bannerTitle}>{b.title}</Text>
            <Text style={styles.bannerSub}>{b.sub}</Text>
          </View>
        ))}
      </ScrollView>

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
  banner: {
    width: 320,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginStart: spacing.md,
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
