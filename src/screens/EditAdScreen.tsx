import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { FormField } from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../data';
import { RootStackParamList } from '../navigation/types';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';
import { showToast } from '../utils/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'EditAd'>;

// تعديل الإعلان — السعر والبيانات الأساسية (v22)
// عند تخفيض السعر تُعرض شارة "انخفض السعر" تلقائيًا عبر previousPrice
export function EditAdScreen({ navigation, route }: Props) {
  const { listingId } = route.params;
  const repo = useRepo();
  const { user } = useAuth();
  const listing = repo.getListingById(listingId);

  const [name, setName] = useState(listing?.name ?? '');
  const [price, setPrice] = useState(listing?.price != null ? String(listing.price) : '');
  const [phone, setPhone] = useState(listing?.phone ?? '');
  const [area, setArea] = useState(listing?.area ?? '');
  const [desc, setDesc] = useState(listing?.desc ?? '');
  const [saving, setSaving] = useState(false);

  if (!listing) {
    return (
      <View style={styles.center}>
        <AppIcon name="file-remove-outline" size={52} color={colors.textMuted} />
        <Text style={styles.empty}>الإعلان غير موجود</Text>
      </View>
    );
  }

  // الصلاحية: المالك أو المدير فقط
  const canEdit = user && (user.isAdmin || listing.userId === user.id || listing.ownerUid === user.uid);
  if (!canEdit) {
    return (
      <View style={styles.center}>
        <AppIcon name="lock-outline" size={52} color={colors.textMuted} />
        <Text style={styles.empty}>لا تملك صلاحية تعديل هذا الإعلان</Text>
      </View>
    );
  }

  const save = () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'عنوان الإعلان مطلوب');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('تنبيه', 'رقم الهاتف مطلوب');
      return;
    }
    const priceNum = price.trim() ? parseInt(price.replace(/[^\d]/g, ''), 10) : null;
    setSaving(true);
    try {
      repo.updateListing(listingId, {
        name: name.trim(),
        price: Number.isFinite(priceNum) ? priceNum : null,
        priceNote: !priceNum ? 'حسب الاتفاق' : undefined,
        phone: phone.trim(),
        area: area.trim() || listing.gov,
        desc: desc.trim() || '—',
      });
      showToast('تم حفظ التعديلات');
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const willDrop =
    listing.price != null &&
    price.trim() !== '' &&
    Number.isFinite(parseInt(price.replace(/[^\d]/g, ''), 10)) &&
    parseInt(price.replace(/[^\d]/g, ''), 10) < listing.price;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>تعديل الإعلان</Text>
      <FormField label="عنوان الإعلان" value={name} onChange={setName} required />
      <FormField
        label="السعر (ل.س)"
        value={price}
        onChange={setPrice}
        placeholder="اتركه فارغًا لـ «حسب الاتفاق»"
        keyboardType="numeric"
      />
      {willDrop && (
        <View style={styles.dropHint}>
          <AppIcon name="trending-down" size={16} color={colors.gold} />
          <Text style={styles.dropHintText}>
            سيظهر شارة "انخفض السعر" (من {formatPrice(listing.price, undefined)})
          </Text>
        </View>
      )}
      <FormField label="رقم الهاتف" value={phone} onChange={setPhone} keyboardType="phone-pad" required />
      <FormField label="المنطقة / الحي" value={area} onChange={setArea} placeholder="مثال: الصالحية" />
      <FormField label="الوصف" value={desc} onChange={setDesc} multiline />
      <Pressable style={[styles.btn, saving && styles.btnDisabled]} onPress={save} disabled={saving}>
        <Text style={styles.btnText}>حفظ التعديلات</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.background },
  empty: { color: colors.textMuted, fontSize: fontSize.md },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  dropHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  dropHintText: { fontSize: fontSize.sm, color: '#7A5A12', flex: 1 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
});
