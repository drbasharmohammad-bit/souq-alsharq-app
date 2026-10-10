import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { RemoteImage } from '../components/RemoteImage';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';
import { RootStackParamList } from '../navigation/types';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'StoreDetail'>;

const cleanPhone = (p: string) => p.replace(/[^\d]/g, '');
const waLink = (p: string) => {
  let d = cleanPhone(p);
  if (d.startsWith('0')) d = '963' + d.slice(1);
  return `https://wa.me/${d}`;
};

function Stars({ value, size = 15 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <AppIcon
          key={i}
          name={i <= full ? 'star' : 'star-outline'}
          size={size}
          color={colors.gold}
        />
      ))}
    </View>
  );
}

type Tab = 'products' | 'reviews' | 'about';

export function StoreDetailScreen({ navigation, route }: Props) {
  const repo = useRepo();
  const { user } = useAuth();
  const store = repo.getStoreById(route.params.storeId);
  const [tab, setTab] = useState<Tab>('products');
  const [revName, setRevName] = useState(user?.phone ?? '');
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState('');

  const reviews = useMemo(
    () => (store ? repo.getReviews(store.id) : []),
    [repo, store],
  );
  const products = useMemo(
    () => (store ? repo.getProductsByStore(store.id) : []),
    [repo, store],
  );
  const categories = useMemo(
    () => (store ? repo.getCategoriesByStore(store.id) : []),
    [repo, store],
  );
  const [selCat, setSelCat] = useState<string | null>(null);
  const filteredProducts = useMemo(
    () => (selCat ? products.filter(p => p.categoryId === selCat) : products),
    [products, selCat],
  );
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  if (!store) {
    return (
      <View style={styles.center}>
        <AppIcon name="store-off" size={52} color={colors.textMuted} />
        <Text style={styles.empty}>المتجر غير موجود</Text>
      </View>
    );
  }

  const call = () => {
    if (store.phone) Linking.openURL(`tel:${cleanPhone(store.phone)}`);
    else Alert.alert('تنبيه', 'لا يوجد رقم هاتف لهذا المتجر');
  };
  const whatsapp = () => {
    if (store.phone) Linking.openURL(waLink(store.phone));
    else Alert.alert('تنبيه', 'لا يوجد رقم واتساب لهذا المتجر');
  };

  const submitReview = () => {
    if (!revText.trim()) {
      Alert.alert('تنبيه', 'اكتب نص التقييم أولًا');
      return;
    }
    repo.addReview({
      storeId: store.id,
      userName: revName.trim() || 'زائر',
      rating: revRating,
      text: revText.trim(),
    });
    setRevText('');
    Alert.alert('شكرًا', 'تم نشر تقييمك');
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* الغلاف — ترويسة سينمائية */}
      {store.coverImage ? (
        <View style={styles.coverImgWrap}>
          <RemoteImage uri={store.coverImage} style={styles.coverImg} />
          <View style={styles.coverShade} />
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
            <AppIcon name="arrow-right" size={20} color={colors.primary} />
          </Pressable>
          <View style={styles.coverCaption}>
            <Text style={styles.coverStoreName} numberOfLines={1}>{store.name}</Text>
            <View style={styles.coverBadges}>
              {store.verified && (
                <View style={styles.vbadge}>
                  <AppIcon name="check-circle" size={13} color={colors.white} />
                  <Text style={styles.badgeText}>موثق</Text>
                </View>
              )}
              {store.featured && (
                <View style={styles.fbadge}>
                  <AppIcon name="star" size={13} color={colors.white} />
                  <Text style={styles.badgeText}>مميز</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.cover, { backgroundColor: store.g1 }]}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
            <AppIcon name="arrow-right" size={20} color={colors.primary} />
          </Pressable>
          <Text style={styles.coverName}>{store.name}</Text>
        </View>
      )}

      <View style={styles.head}>
        {store.logoImage ? (
          <RemoteImage
            uri={store.logoImage}
            style={styles.logoImg}
            fallback={
              <View style={[styles.logo, { backgroundColor: colors.gold }]}>
                <Text style={styles.logoText}>{store.name.charAt(0)}</Text>
              </View>
            }
          />
        ) : (
          <View style={[styles.logo, { backgroundColor: colors.gold }]}>
            <Text style={styles.logoText}>{store.name.charAt(0)}</Text>
          </View>
        )}
        {!store.coverImage && (
          <>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{store.name}</Text>
            </View>
            <View style={styles.badgesRow}>
              {store.verified && (
                <View style={styles.vbadge}>
                  <AppIcon name="check-circle" size={13} color={colors.white} />
                  <Text style={styles.badgeText}>موثق</Text>
                </View>
              )}
              {store.featured && (
                <View style={styles.fbadge}>
                  <AppIcon name="star" size={13} color={colors.white} />
                  <Text style={styles.badgeText}>مميز</Text>
                </View>
              )}
            </View>
          </>
        )}
        <View style={styles.ratingRow}>
          <Stars value={avg} />
          <Text style={styles.ratingText}>
            {reviews.length > 0 ? `${avg.toFixed(1)} (${reviews.length} تقييم)` : 'لا تقييمات بعد'}
          </Text>
        </View>
      </View>

      {/* معلومات */}
      <View style={styles.infoRows}>
        <View style={styles.irow}>
          <View style={styles.iicon}><AppIcon name="map-marker" size={17} color={colors.primary} /></View>
          <Text style={styles.itext}>{store.area} — {store.gov}</Text>
        </View>
        {!!store.hours && (
          <View style={styles.irow}>
            <View style={styles.iicon}><AppIcon name="clock-outline" size={17} color={colors.primary} /></View>
            <Text style={styles.itext}>{store.hours}</Text>
          </View>
        )}
        {!!store.phone && (
          <View style={styles.irow}>
            <View style={styles.iicon}><AppIcon name="phone" size={17} color={colors.primary} /></View>
            <Text style={styles.itext}>{store.phone}</Text>
          </View>
        )}
      </View>

      {/* اتصال / واتساب */}
      <View style={styles.ctaRow}>
        <Pressable style={[styles.cta, styles.ctaCall]} onPress={call}>
          <AppIcon name="phone" size={18} color={colors.white} />
          <Text style={styles.ctaText}>اتصال</Text>
        </Pressable>
        <Pressable style={[styles.cta, styles.ctaWa]} onPress={whatsapp}>
          <AppIcon name="whatsapp" size={18} color={colors.white} />
          <Text style={styles.ctaText}>واتساب</Text>
        </Pressable>
      </View>

      {/* صلاحيات المدير على المتجر */}
      {user?.isAdmin && (
        <View style={styles.adminBox}>
          <View style={styles.adminTitleRow}>
            <AppIcon name="shield-account" size={16} color={colors.primary} />
            <Text style={styles.adminTitle}>إجراءات المدير</Text>
          </View>
          <View style={styles.adminBtns}>
            <Pressable
              style={[styles.abtn, store.verified ? styles.abtnOff : styles.abtnV]}
              onPress={() => repo.updateStore(store.id, { verified: !store.verified })}>
              <AppIcon name="check-circle" size={15} color={colors.white} />
              <Text style={styles.abtnText}>{store.verified ? 'إلغاء التوثيق' : 'توثيق'}</Text>
            </Pressable>
            <Pressable
              style={[styles.abtn, store.featured ? styles.abtnOff : styles.abtnF]}
              onPress={() => repo.updateStore(store.id, { featured: !store.featured })}>
              <AppIcon name="star" size={15} color={colors.white} />
              <Text style={styles.abtnText}>{store.featured ? 'إلغاء التمييز' : 'تمييز'}</Text>
            </Pressable>
            <Pressable
              style={[styles.abtn, styles.abtnD]}
              onPress={() =>
                Alert.alert('حذف المتجر', `سيُحذف «${store.name}» نهائيًا مع منتجاته وتصنيفاته. متابعة؟`, [
                  { text: 'إلغاء', style: 'cancel' },
                  {
                    text: 'حذف',
                    style: 'destructive',
                    onPress: () => {
                      repo.deleteStore(store.id);
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

      {/* التبويبات */}
      <View style={styles.tabs}>
        {(
          [
            ['products', 'المنتجات'],
            ['reviews', 'التقييمات'],
            ['about', 'عن المتجر'],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <Pressable key={k} style={[styles.tab, tab === k && styles.tabActive]} onPress={() => setTab(k)}>
            <Text style={[styles.tabText, tab === k && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'products' && (
        <View style={styles.pane}>
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsRow}
              contentContainerStyle={styles.chipsContent}>
              <Pressable
                style={[styles.chip, selCat === null && styles.chipActive]}
                onPress={() => setSelCat(null)}>
                <Text style={[styles.chipText, selCat === null && styles.chipTextActive]}>
                  الكل
                </Text>
              </Pressable>
              {categories.map(c => (
                <Pressable
                  key={c.id}
                  style={[styles.chip, selCat === c.id && styles.chipActive]}
                  onPress={() => setSelCat(c.id)}>
                  <Text style={[styles.chipText, selCat === c.id && styles.chipTextActive]}>
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {filteredProducts.length === 0 ? (
            <Text style={styles.empty}>
              {selCat ? 'لا توجد منتجات في هذا التصنيف' : 'لا توجد منتجات بعد'}
            </Text>
          ) : (
            <View style={styles.pgrid}>
              {filteredProducts.map(p => (
                <Pressable
                  key={p.id}
                  style={styles.pcard}
                  onPress={() => navigation.navigate('AdDetail', { productId: p.id })}>
                  {p.images.length > 0 ? (
                    <RemoteImage
                      uri={p.images[0]}
                      style={styles.pimg}
                      fallback={
                        <View style={[styles.pimg, styles.pimgPh]}>
                          <AppIcon name="image" size={34} color={colors.textMuted} />
                        </View>
                      }
                    />
                  ) : (
                    <View style={[styles.pimg, styles.pimgPh]}>
                      <AppIcon name="image" size={34} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.pbody}>
                    <Text style={styles.pname} numberOfLines={2}>{p.name}</Text>
                    <Text style={styles.pprice}>
                      {p.price != null ? `${p.price.toLocaleString('ar-SY')} ل.س` : 'حسب الاتفاق'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      {tab === 'reviews' && (
        <View style={styles.pane}>
          {reviews.map(r => (
            <View key={r.id} style={styles.rev}>
              <View style={styles.revHead}>
                <Text style={styles.revName}>{r.userName}</Text>
                <Stars value={r.rating} size={13} />
              </View>
              <Text style={styles.revText}>{r.text}</Text>
              <Text style={styles.revDate}>{formatDate(r.createdAt)}</Text>
            </View>
          ))}
          {reviews.length === 0 && <Text style={styles.empty}>كن أول من يقيّم هذا المتجر</Text>}

          <View style={styles.revForm}>
            <Text style={styles.revFormTitle}>أضف تقييمك</Text>
            <View style={styles.starPick}>
              {[1, 2, 3, 4, 5].map(i => (
                <Pressable key={i} onPress={() => setRevRating(i)} hitSlop={6}>
                  <AppIcon
                    name={i <= revRating ? 'star' : 'star-outline'}
                    size={30}
                    color={colors.gold}
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="الاسم (اختياري)"
              placeholderTextColor={colors.textMuted}
              value={revName}
              onChangeText={setRevName}
            />
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="اكتب رأيك بالمتجر..."
              placeholderTextColor={colors.textMuted}
              value={revText}
              onChangeText={setRevText}
              multiline
            />
            <Pressable style={styles.submitBtn} onPress={submitReview}>
              <Text style={styles.submitText}>نشر التقييم</Text>
            </Pressable>
          </View>
        </View>
      )}

      {tab === 'about' && (
        <View style={styles.pane}>
          <Text style={styles.aboutText}>
            {store.description || 'لا يوجد وصف لهذا المتجر بعد.'}
          </Text>
          <View style={styles.aboutMeta}>
            <Text style={styles.aboutMetaText}>القسم: {store.sec}</Text>
            <Text style={styles.aboutMetaText}>المحافظة: {store.gov}</Text>
          </View>
        </View>
      )}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.background },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md, marginTop: 8 },
  cover: { height: 200, alignItems: 'center', justifyContent: 'center' },
  coverName: { color: colors.white, fontSize: 26, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 8 },
  coverImgWrap: { height: 260 },
  coverImg: { width: '100%', height: 260 },
  coverShade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 130,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  coverCaption: { position: 'absolute', bottom: 14, right: 16, left: 16 },
  coverStoreName: {
    color: colors.white, fontSize: 26, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10,
  },
  coverBadges: { flexDirection: 'row', gap: 6, marginTop: 8 },
  backBtn: {
    position: 'absolute', top: 50, right: 14, width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  head: { paddingHorizontal: spacing.lg, marginTop: -42 },
  logo: {
    width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: colors.white, elevation: 4,
  },
  logoText: { color: colors.white, fontSize: 34, fontWeight: '800' },
  logoImg: {
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 4, borderColor: colors.white, elevation: 4,
    backgroundColor: colors.border,
  },
  chipsRow: { marginBottom: spacing.sm },
  chipsContent: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  chip: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: 7, backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  chipTextActive: { color: colors.white },
  nameRow: { marginTop: 8 },
  name: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  badgesRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  vbadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  fbadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  ratingText: { fontSize: fontSize.sm, color: colors.textMuted },
  infoRows: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  irow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  iicon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primary + '14', alignItems: 'center', justifyContent: 'center' },
  itext: { fontSize: fontSize.sm, color: colors.text, flex: 1 },
  ctaRow: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  cta: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: radius.md, padding: spacing.md },
  ctaCall: { backgroundColor: colors.primary },
  ctaWa: { backgroundColor: '#1FA855' },
  ctaText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  adminBox: {
    backgroundColor: '#F4FAF7', borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: radius.md, padding: spacing.md,
    marginHorizontal: spacing.lg, marginTop: spacing.md,
  },
  adminTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adminTitle: { fontSize: fontSize.sm, fontWeight: '800', color: colors.primary, flex: 1 },
  adminBtns: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
  abtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: radius.sm, paddingVertical: 9,
  },
  abtnV: { backgroundColor: colors.primary },
  abtnF: { backgroundColor: colors.gold },
  abtnOff: { backgroundColor: colors.textMuted },
  abtnD: { backgroundColor: colors.danger },
  abtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '800' },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.md },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2.5, borderBottomColor: colors.border },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  pane: { padding: spacing.lg },
  pgrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pcard: { width: '48%', backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', elevation: 1 },
  pimg: { width: '100%', height: 110 },
  pimgPh: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  pbody: { padding: 10 },
  pname: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, minHeight: 38 },
  pprice: { fontSize: fontSize.sm, fontWeight: '800', color: colors.primary, marginTop: 4 },
  rev: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, elevation: 1 },
  revHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  revName: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  revText: { fontSize: fontSize.sm, color: colors.text, lineHeight: 22 },
  revDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  revForm: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, elevation: 1 },
  revFormTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginBottom: 8 },
  starPick: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 10 },
  input: {
    backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.sm,
    fontSize: fontSize.sm, color: colors.text, textAlign: 'right', marginBottom: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  submitText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  aboutText: { fontSize: fontSize.md, color: colors.text, lineHeight: 26 },
  aboutMeta: { marginTop: spacing.md, gap: 4 },
  aboutMetaText: { fontSize: fontSize.sm, color: colors.textMuted },
});
