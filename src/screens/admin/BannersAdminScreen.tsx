import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { FormField } from '../../components/FormField';
import { ImagePickerField } from '../../components/ImagePickerField';
import { SelectChips } from '../../components/SelectChips';
import { GOVS, SECTIONS } from '../../data';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo, useRepoRefresh } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { BannerTargetType } from '../../types';
import { formatDateTime } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminBanners'>;

type TargetChoice = 'none' | 'announcements' | 'store' | string; // string = section key

export function BannersAdminScreen({}: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [target, setTarget] = useState<TargetChoice>('none');
  const [storeId, setStoreId] = useState('');
  const [gov, setGov] = useState('الكل');

  const banners = useMemo(() => repo.getBanners(), [repo]);
  const stores = useMemo(() => repo.getStores(), [repo]);
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

  const save = () => {
    if (!title.trim()) {
      Alert.alert('تنبيه', 'أدخل عنوان البانر');
      return;
    }
    if (images.length === 0) {
      Alert.alert('تنبيه', 'اختر صورة للبانر');
      return;
    }
    if (target === 'store' && !storeId) {
      Alert.alert('تنبيه', 'اختر المتجر الوجهة');
      return;
    }
    const input = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      imageUri: images[0],
      targetType: (target === 'none'
        ? null
        : target === 'announcements'
          ? 'announcement'
          : target === 'store'
            ? 'store'
            : 'section') as BannerTargetType,
      targetId: target === 'none' ? undefined : target === 'store' ? storeId : target,
      governorate: gov === 'الكل' ? 'all' : gov,
    };
    repo.addBanner(input);
    setTitle('');
    setSubtitle('');
    setImages([]);
    setTarget('none');
    setStoreId('');
    setGov('الكل');
    Alert.alert('تم', 'أُضيف البانر وسيظهر في الواجهة الرئيسية');
  };

  const remove = (id: string) => {
    Alert.alert('حذف البانر', 'متأكد من حذف هذا البانر؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => repo.deleteBanner(id) },
    ]);
  };

  const targetName = (b: { targetType?: BannerTargetType | null; targetId?: string }) => {
    if (!b.targetType) return 'بلا وجهة';
    if (b.targetType === 'announcement') return 'إعلانات الإدارة';
    if (b.targetType === 'store') {
      const s = stores.find(x => x.id === b.targetId);
      return s ? `متجر ${s.name}` : 'متجر محذوف';
    }
    const s = SECTIONS.find(x => x.key === b.targetId);
    return s ? `قسم ${s.name}` : 'قسم';
  };

  const govName = (b: { governorate?: string }) =>
    !b.governorate || b.governorate === 'all' ? 'كل المحافظات' : b.governorate;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.wrap}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>بانر جديد للواجهة الرئيسية</Text>
        <FormField label="العنوان" value={title} onChange={setTitle} placeholder="مثال: تخفيضات الموسم" />
        <FormField label="نص فرعي (اختياري)" value={subtitle} onChange={setSubtitle} placeholder="سطر إضافي تحت العنوان" />
        <ImagePickerField images={images} onChange={setImages} max={1} label="صورة البانر" />

        <Text style={styles.label}>الوجهة عند الضغط (اختياري)</Text>
        <View style={styles.chips}>
          <Pressable
            style={[styles.chip, target === 'none' && styles.chipActive]}
            onPress={() => setTarget('none')}>
            <Text style={[styles.chipText, target === 'none' && styles.chipTextActive]}>بلا وجهة</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, target === 'announcements' && styles.chipActive]}
            onPress={() => setTarget('announcements')}>
            <Text style={[styles.chipText, target === 'announcements' && styles.chipTextActive]}>إعلانات الإدارة</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, target === 'store' && styles.chipActive]}
            onPress={() => setTarget('store')}>
            <Text style={[styles.chipText, target === 'store' && styles.chipTextActive]}>متجر</Text>
          </Pressable>
          {SECTIONS.map(s => (
            <Pressable
              key={s.key}
              style={[styles.chip, target === s.key && styles.chipActive]}
              onPress={() => setTarget(s.key)}>
              <Text style={[styles.chipText, target === s.key && styles.chipTextActive]}>{s.name}</Text>
            </Pressable>
          ))}
        </View>

        {target === 'store' && (
          <>
            <Text style={styles.label}>اختر المتجر</Text>
            <View style={styles.chips}>
              {stores.map(s => (
                <Pressable
                  key={s.id}
                  style={[styles.chip, storeId === s.id && styles.chipActive]}
                  onPress={() => setStoreId(s.id)}>
                  <Text style={[styles.chipText, storeId === s.id && styles.chipTextActive]}>{s.name}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <SelectChips
          label="المحافظة المستهدفة"
          options={GOVS}
          value={gov}
          onChange={setGov}
        />

        <Pressable style={styles.btn} onPress={save}>
          <View style={styles.btnRow}>
            <AppIcon name="image-plus" size={18} color={colors.white} />
            <Text style={styles.btnText}>إضافة البانر</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.listTitle}>البانرات الحالية ({banners.length})</Text>
      <FlatList
        data={banners}
        keyExtractor={b => b.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.active && styles.cardOff]}>
            <Image source={{ uri: item.imageUri }} style={styles.thumb} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {!!item.subtitle && <Text style={styles.cardSub}>{item.subtitle}</Text>}
              <Text style={styles.cardMeta}>
                {targetName(item)} • {govName(item)} • {formatDateTime(item.createdAt)}
              </Text>
              <View style={styles.cardActions}>
                <Pressable style={[styles.mini, item.active ? styles.miniOff : styles.miniOn]} onPress={() => repo.toggleBanner(item.id)}>
                  <Text style={styles.miniText}>{item.active ? 'إيقاف' : 'تفعيل'}</Text>
                </Pressable>
                <Pressable style={[styles.mini, styles.miniDel]} onPress={() => remove(item.id)}>
                  <AppIcon name="trash-can" size={16} color={colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="image-multiple" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد بانرات — ستظهر البانرات الافتراضية</Text>
          </View>
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.md, paddingBottom: spacing.xl },
  form: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, elevation: 1 },
  formTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  label: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 6, marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.background },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  listTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  list: { gap: spacing.sm },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, elevation: 1, gap: spacing.sm },
  cardOff: { opacity: 0.55 },
  thumb: { width: 96, height: 72, borderRadius: radius.sm, backgroundColor: colors.border },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  cardSub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  cardMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  mini: { borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
  miniOn: { backgroundColor: colors.primary },
  miniOff: { backgroundColor: colors.textMuted },
  miniDel: { backgroundColor: colors.danger, paddingHorizontal: 10 },
  miniText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
  deniedWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
});
