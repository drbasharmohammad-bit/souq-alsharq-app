import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormField } from '../../components/FormField';
import { SelectChips } from '../../components/SelectChips';
import { useAuth } from '../../context/AuthContext';
import { GOVS, SUBCATS, sectionName } from '../../data';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { ListingKind, SectionKey, Spec } from '../../types';
import { subName } from './PublishSectionScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'PublishForm'>;

const TRANSMISSIONS = ['عادي', 'أوتوماتيك'];
const FUELS = ['بنزين', 'ديزل'];

export function PublishFormScreen({ navigation, route }: Props) {
  const { sectionKey, subKey } = route.params;
  const { user } = useAuth();
  const repo = useRepo();

  const sub = useMemo(
    () => SUBCATS[sectionKey]?.find(s => s.key === subKey),
    [sectionKey, subKey],
  );

  const [f, setF] = useState<Record<string, string>>({
    gov: 'الحسكة',
    phone: user?.phone ?? '',
    transmission: 'أوتوماتيك',
    fuel: 'بنزين',
  });
  const set = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCars = sectionKey === 'cars';
  const isEstate = sectionKey === 'estate';

  const submit = () => {
    const e: Record<string, string> = {};
    const need = (k: string, label: string) => {
      if (!f[k]?.trim()) e[k] = `${label} مطلوب`;
    };

    if (isCars) {
      need('brand', 'الماركة');
      need('model', 'الموديل');
      need('price', 'السعر');
    } else if (isEstate) {
      need('space', 'المساحة');
      need('price', 'السعر');
      const parts = (f.fullName ?? '').trim().split(/\s+/).filter(Boolean);
      if (parts.length < 3) e.fullName = 'اكتب الاسم الثلاثي الكامل';
    } else {
      need('title', 'عنوان الإعلان');
    }
    need('gov', 'المحافظة');
    need('phone', 'رقم الهاتف');

    setErrors(e);
    if (Object.keys(e).length > 0) {
      Alert.alert('تنبيه', 'أكمل الحقول المطلوبة');
      return;
    }
    if (!user || !sub) return;

    const isMerchant = user.accountType === 'merchant';
    const store = isMerchant && user.storeId ? repo.getStoreById(user.storeId) : undefined;

    let name = '';
    let kind: ListingKind = 'product';
    const specs: Spec[] = [];
    if (isCars) {
      kind = 'car';
      name = `${f.brand} ${f.model} ${f.year ?? ''}`.trim();
      if (f.fuel) specs.push({ label: 'الوقود', value: f.fuel });
      if (f.mileage) specs.push({ label: 'الممشى', value: `${f.mileage} كم` });
      if (f.transmission) specs.push({ label: 'ناقل الحركة', value: f.transmission });
      if (f.color) specs.push({ label: 'اللون', value: f.color });
    } else if (isEstate) {
      kind = 'estate';
      name = f.space ? `${sub.name} ${f.space} م²` : sub.name;
      if (f.rooms) specs.push({ label: 'الغرف', value: f.rooms });
      if (f.floor) specs.push({ label: 'الطابق', value: f.floor });
    } else {
      name = f.title.trim();
    }

    const priceNum = f.price?.trim() ? parseInt(f.price.replace(/[^\d]/g, ''), 10) : null;

    repo.addListing({
      kind,
      name,
      price: Number.isFinite(priceNum) ? priceNum : null,
      priceNote: !priceNum ? 'حسب الاتفاق' : undefined,
      gov: f.gov,
      area: f.area?.trim() || f.gov,
      sec: sectionKey as SectionKey,
      sub: subKey,
      icon: sub.icon,
      g1: sub.g1,
      g2: sub.g2,
      desc: f.desc?.trim() || '—',
      seller: isMerchant && store ? store.name : f.sellerName?.trim() || 'فرد',
      sellerType: isMerchant ? 'store' : 'individual',
      phone: f.phone.trim(),
      advertiserName: isEstate ? f.fullName.trim() : undefined,
      userId: user.id,
      specs: specs.length ? specs : undefined,
    });

    navigation.replace('PublishSuccess');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>
        إعلان جديد — {sectionName(sectionKey)} / {sub?.name}
      </Text>

      {isCars && (
        <>
          <FormField label="الماركة" value={f.brand ?? ''} onChange={v => set('brand', v)} placeholder="مثال: كيا" required error={errors.brand} />
          <FormField label="الموديل" value={f.model ?? ''} onChange={v => set('model', v)} placeholder="مثال: ريو" required error={errors.model} />
          <FormField label="سنة الصنع" value={f.year ?? ''} onChange={v => set('year', v)} placeholder="مثال: 2016" keyboardType="numeric" />
          <FormField label="الممشى (كم)" value={f.mileage ?? ''} onChange={v => set('mileage', v)} placeholder="مثال: 120000" keyboardType="numeric" />
          <SelectChips label="ناقل الحركة" options={TRANSMISSIONS} value={f.transmission} onChange={v => set('transmission', v)} />
          <SelectChips label="الوقود" options={FUELS} value={f.fuel} onChange={v => set('fuel', v)} />
          <FormField label="اللون" value={f.color ?? ''} onChange={v => set('color', v)} placeholder="مثال: أبيض" />
        </>
      )}

      {isEstate && (
        <>
          <View style={styles.warn}>
            <Text style={styles.warnText}>
              ⚠️ تنبيه: إدارة التطبيق وسيط إعلاني فقط وغير مسؤولة عن أي تعامل أو اتفاق بين الأطراف — تحقق بنفسك قبل أي دفع.
            </Text>
          </View>
          <FormField label="المساحة (م²)" value={f.space ?? ''} onChange={v => set('space', v)} placeholder="مثال: 130" keyboardType="numeric" required error={errors.space} />
          <FormField label="عدد الغرف" value={f.rooms ?? ''} onChange={v => set('rooms', v)} placeholder="مثال: 3" keyboardType="numeric" />
          <FormField label="الطابق" value={f.floor ?? ''} onChange={v => set('floor', v)} placeholder="مثال: ثالث" />
          <FormField label="الاسم الثلاثي الكامل" value={f.fullName ?? ''} onChange={v => set('fullName', v)} placeholder="الاسم الثلاثي للمعلن" required error={errors.fullName} />
        </>
      )}

      {!isCars && !isEstate && (
        <FormField label="عنوان الإعلان" value={f.title ?? ''} onChange={v => set('title', v)} placeholder="مثال: صيانة مكيفات منزلية" required error={errors.title} />
      )}

      <FormField label="السعر (ل.س)" value={f.price ?? ''} onChange={v => set('price', v)} placeholder="اتركه فارغًا لـ «حسب الاتفاق»" keyboardType="numeric" required={isCars || isEstate} error={errors.price} />
      <SelectChips label="المحافظة" options={GOVS.filter(g => g !== 'الكل')} value={f.gov} onChange={v => set('gov', v)} />
      <FormField label="المنطقة / الحي" value={f.area ?? ''} onChange={v => set('area', v)} placeholder="مثال: الصالحية" />
      <FormField label="رقم الهاتف" value={f.phone ?? ''} onChange={v => set('phone', v)} placeholder="09xxxxxxxx" keyboardType="phone-pad" required error={errors.phone} />
      {!isEstate && user?.accountType === 'individual' && (
        <FormField label="الاسم (يظهر للزبائن)" value={f.sellerName ?? ''} onChange={v => set('sellerName', v)} placeholder="مثال: أبو محمد" />
      )}
      <FormField label="الوصف" value={f.desc ?? ''} onChange={v => set('desc', v)} placeholder="اكتب تفاصيل الإعلان..." multiline />

      <Pressable style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>إرسال للمراجعة ←</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.lg },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  warn: { backgroundColor: '#FFF8E6', borderWidth: 1, borderColor: colors.gold, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  warnText: { fontSize: fontSize.sm, color: '#7A5A12', lineHeight: 22 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
});
