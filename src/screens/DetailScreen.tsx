import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { useFavorites } from '../context/FavoritesContext';
import { formatPrice, sectionName } from '../data';
import { RootStackParamList } from '../navigation/types';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export function DetailScreen({ route }: Props) {
  const { toggle, isFav } = useFavorites();
  const repo = useRepo();
  const item = repo.getListingById(route.params.listingId);

  if (!item) {
    return (
      <View style={styles.root}>
        <Text style={styles.empty}>الإعلان غير موجود</Text>
      </View>
    );
  }

  const fav = isFav(item.id);
  const call = () => {
    if (item.phone) Linking.openURL(`tel:${item.phone.replace(/\s/g, '')}`);
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* معرض الصور */}
      {item.images && item.images.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.galleryImgs}>
          {item.images.map(uri => (
            <Image key={uri} source={{ uri }} style={styles.galleryImg} resizeMode="cover" />
          ))}
          <Pressable style={styles.favBtn} onPress={() => toggle(item.id)}>
            <AppIcon name={fav ? 'heart' : 'heart-outline'} size={24} color={fav ? colors.danger : colors.textMuted} />
          </Pressable>
        </ScrollView>
      ) : (
        <View style={[styles.gallery, { backgroundColor: item.g1 + '22' }]}>
          <AppIcon name={item.icon} size={110} color={item.g1} />
          <Pressable style={styles.favBtn} onPress={() => toggle(item.id)}>
            <AppIcon name={fav ? 'heart' : 'heart-outline'} size={24} color={fav ? colors.danger : colors.textMuted} />
          </Pressable>
        </View>
      )}

      <View style={styles.body}>
        <View style={[styles.badge, item.sellerType === 'store' ? styles.badgeStore : styles.badgeInd]}>
          <AppIcon name={item.sellerType === 'store' ? 'check-circle' : 'account'} size={15} color={item.sellerType === 'store' ? colors.verifiedText : colors.individualText} />
          <Text style={[styles.badgeText, item.sellerType === 'store' ? styles.badgeStoreText : styles.badgeIndText]}>
            {item.sellerType === 'store' ? 'متجر موثق' : 'إعلان فردي'}
          </Text>
        </View>

        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>{formatPrice(item.price, item.priceNote)}</Text>
        <View style={styles.metaRow}>
          <AppIcon name="map-marker" size={15} color={colors.textMuted} />
          <Text style={styles.meta}>{item.gov} - {item.area} • {sectionName(item.sec)}</Text>
        </View>

        {/* تنبيه العقارات */}
        {item.kind === 'estate' && (
          <View style={styles.warn}>
            <Text style={styles.warnText}>
              تنبيه: إدارة التطبيق وسيط إعلاني فقط وغير مسؤولة عن أي تعامل أو اتفاق بين الأطراف — تحقق بنفسك قبل أي دفع.
            </Text>
          </View>
        )}

        {/* المواصفات */}
        {item.specs && item.specs.length > 0 && (
          <View style={styles.specs}>
            {item.specs.map((s, i) => (
              <View key={i} style={styles.specRow}>
                <Text style={styles.specLabel}>{s.label}</Text>
                <Text style={styles.specValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.secTitle}>الوصف</Text>
        <Text style={styles.desc}>{item.desc}</Text>

        {/* بطاقة البائع */}
        <Text style={styles.secTitle}>البائع</Text>
        <View style={styles.sellerCard}>
          <PlaceholderImage icon={item.sellerType === 'store' ? 'store' : 'account'} color={colors.primary} size={52} />
          <View style={styles.sellerBody}>
            <Text style={styles.sellerName}>{item.seller}</Text>
            {item.advertiserName && (
              <View style={styles.sellerMetaRow}>
                <AppIcon name="account" size={14} color={colors.textMuted} />
                <Text style={styles.sellerMeta}>المعلن: {item.advertiserName}</Text>
              </View>
            )}
            {item.phone && (
              <View style={styles.sellerMetaRow}>
                <AppIcon name="phone" size={14} color={colors.textMuted} />
                <Text style={styles.sellerMeta}>{item.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* أزرار التواصل */}
        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.btnCall]} onPress={call}>
            <View style={styles.btnRow}>
              <AppIcon name="phone" size={18} color={colors.white} />
              <Text style={styles.btnText}>اتصال</Text>
            </View>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnWa]}
            onPress={() => Alert.alert('واتساب', 'سيفتح واتساب في النسخة النهائية')}>
            <View style={styles.btnRow}>
              <AppIcon name="chat" size={18} color={colors.white} />
              <Text style={styles.btnText}>واتساب</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => Alert.alert('مشاركة', 'سيتم نسخ رابط الإعلان')}>
            <View style={styles.btnRow}>
              <AppIcon name="share-variant" size={16} color={colors.text} />
              <Text style={styles.btnGhostText}>مشاركة</Text>
            </View>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => Alert.alert('إبلاغ', 'شكرًا — ستراجع الإدارة هذا الإعلان')}>
            <View style={styles.btnRow}>
              <AppIcon name="flag" size={16} color={colors.text} />
              <Text style={styles.btnGhostText}>إبلاغ</Text>
            </View>
          </Pressable>
        </View>
        <View style={{ height: spacing.xl }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  empty: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
  gallery: { height: 260, alignItems: 'center', justifyContent: 'center' },
  galleryImgs: { height: 260 },
  galleryImg: { width: 380, height: 260 },
  favBtn: {
    position: 'absolute',
    top: spacing.md,
    end: spacing.md,
    backgroundColor: colors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  body: { padding: spacing.lg, backgroundColor: colors.white, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, marginTop: -spacing.lg },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeStore: { backgroundColor: colors.verifiedBg },
  badgeInd: { backgroundColor: colors.individualBg },
  badgeText: { fontSize: fontSize.sm, fontWeight: '700' },
  badgeStoreText: { color: colors.verifiedText },
  badgeIndText: { color: colors.individualText },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  price: { fontSize: fontSize.xl, fontWeight: '800', color: colors.primary, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, flex: 1 },
  warn: { backgroundColor: '#FFF8E6', borderWidth: 1, borderColor: colors.gold, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  warnText: { fontSize: fontSize.sm, color: '#7A5A12', lineHeight: 22 },
  specs: { marginTop: spacing.md, backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  specLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  specValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  secTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  desc: { fontSize: fontSize.md, color: colors.text, lineHeight: 26, marginTop: spacing.sm },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  sellerBody: { marginStart: spacing.md, flex: 1 },
  sellerName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  sellerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  sellerMeta: { fontSize: fontSize.sm, color: colors.textMuted, flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  btn: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnCall: { backgroundColor: colors.primary },
  btnWa: { backgroundColor: '#1FA855' },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  btnGhost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnGhostText: { color: colors.text, fontWeight: '600', fontSize: fontSize.sm },
});
