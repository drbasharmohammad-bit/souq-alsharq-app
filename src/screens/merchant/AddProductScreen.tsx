import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { FormField } from '../../components/FormField';
import { ImagePickerField } from '../../components/ImagePickerField';
import { useAuth, useMyStore } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { StoreCategory } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProduct'>;

// إضافة صنف جديد لمتجر التاجر: اسم + سعر + وصف + صور
export function AddProductScreen({ navigation }: Props) {
  const { user } = useAuth();
  const store = useMyStore();
  const repo = useRepo();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'اسم الصنف مطلوب';
    if (!desc.trim()) e.desc = 'وصف الصنف مطلوب';
    if (images.length === 0) e.images = 'أضف صورة واحدة على الأقل للصنف';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      Alert.alert('تنبيه', 'أكمل الحقول المطلوبة');
      return;
    }
    if (!user || !store) {
      Alert.alert('خطأ', 'تعذر تحديد المتجر');
      return;
    }
    const priceNum = price.trim() ? parseInt(price.replace(/[^\d]/g, ''), 10) : null;
    repo.addProduct({
      storeId: store.id,
      name: name.trim(),
      price: Number.isFinite(priceNum) ? priceNum : null,
      description: desc.trim(),
      images,
      governorate: store.gov,
      categoryId: categoryId || undefined,
    });
    Alert.alert('تم', 'أُضيف الصنف إلى متجرك', [
      { text: 'حسنًا', onPress: () => navigation.goBack() },
    ]);
  };

  if (user?.accountType !== 'merchant' || !store) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
        <Text style={styles.empty}>هذه الصفحة لأصحاب المتاجر فقط</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <Text style={styles.sub}>أضف صنفًا جديدًا إلى «{store.name}»</Text>
      <FormField label="اسم الصنف" value={name} onChange={setName} placeholder="مثال: وجبة مشاوي مشكلة" required error={errors.name} />
      <FormField label="السعر (ل.س)" value={price} onChange={setPrice} placeholder="اتركه فارغًا لـ «حسب الاتفاق»" keyboardType="numeric" />
      <FormField label="الوصف" value={desc} onChange={setDesc} placeholder="تفاصيل الصنف..." multiline required error={errors.desc} />
      <ImagePickerField images={images} onChange={setImages} max={6} label="صور الصنف" />
      {errors.images ? <Text style={styles.error}>{errors.images}</Text> : null}
      <CategoryChips
        categories={repo.getCategoriesByStore(store.id)}
        value={categoryId}
        onChange={setCategoryId}
      />
      <Pressable style={styles.btn} onPress={save}>
        <AppIcon name="plus" size={18} color={colors.white} />
        <Text style={styles.btnText}>إضافة الصنف</Text>
      </Pressable>
    </ScrollView>
  );
}

// شرائح اختيار التصنيف — اختيارية (v8)
function CategoryChips({
  categories,
  value,
  onChange,
}: {
  categories: StoreCategory[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (categories.length === 0) return null;
  return (
    <View style={styles.chipsWrap}>
      <Text style={styles.chipsLabel}>التصنيف (اختياري)</Text>
      <View style={styles.chipsRow}>
        <Pressable
          onPress={() => onChange('')}
          style={[styles.chip, value === '' && styles.chipActive]}>
          <Text style={[styles.chipText, value === '' && styles.chipTextActive]}>بدون تصنيف</Text>
        </Pressable>
        {categories.map(c => (
          <Pressable
            key={c.id}
            onPress={() => onChange(c.id)}
            style={[styles.chip, value === c.id && styles.chipActive]}>
            <Text style={[styles.chipText, value === c.id && styles.chipTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.lg },
  sub: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 60, color: colors.textMuted, fontSize: fontSize.md },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  error: { fontSize: fontSize.xs, color: colors.danger, marginTop: -spacing.sm, marginBottom: spacing.md },
  chipsWrap: { marginBottom: spacing.md },
  chipsLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.white, fontWeight: '700' },
});
