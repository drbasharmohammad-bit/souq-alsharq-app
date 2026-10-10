import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { FormField } from '../../components/FormField';
import { ImagePickerField } from '../../components/ImagePickerField';
import { useMyStore } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditStore'>;

// تعديل بيانات المتجر للتاجر: الاسم، الوصف، الدوام، الهاتف، المنطقة، والشعار
export function EditStoreScreen({ navigation }: Props) {
  const repo = useRepo();
  const store = useMyStore();
  const [name, setName] = useState(store?.name ?? '');
  const [desc, setDesc] = useState(store?.description ?? '');
  const [hours, setHours] = useState(store?.hours ?? '');
  const [phone, setPhone] = useState(store?.phone ?? '');
  const [area, setArea] = useState(store?.area ?? '');
  const [logo, setLogo] = useState<string[]>(
    store?.logoImage ? [store.logoImage] : [],
  );
  const [saving, setSaving] = useState(false);

  if (!store) {
    return (
      <View style={styles.center}>
        <AppIcon name="store-off" size={52} color={colors.textMuted} />
        <Text style={styles.empty}>لا يوجد متجر مرتبط بحسابك</Text>
      </View>
    );
  }

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'اسم المتجر مطلوب');
      return;
    }
    setSaving(true);
    try {
      // 1) رفع الشعار المحلي إلى Cloudinary أولًا مع الانتظار الحقيقي —
      //    لا يُكتب أي URI محلي في Firestore أبدًا.
      const [logoUrl] = await repo.uploadImages([logo[0] ?? ''], 'stores');
      // 2) حفظ النصوص + رابط https النهائي
      repo.updateStore(store.id, {
        name: name.trim(),
        description: desc.trim(),
        hours: hours.trim(),
        phone: phone.trim(),
        area: area.trim() || store.area,
        logoImage: logoUrl,
      });
      Alert.alert('تم الحفظ', 'تم تحديث بيانات متجرك بنجاح', [
        { text: 'حسنًا', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert(
        'تعذر الحفظ',
        'فشل رفع الشعار إلى الخادم — تحقق من اتصال الإنترنت وحاول مجددًا.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <View style={styles.titleRow}>
        <AppIcon name="store-edit" size={26} color={colors.text} />
        <Text style={styles.title}>تعديل المتجر</Text>
      </View>
      <Text style={styles.sub}>بيانات متجرك كما ستظهر للزبائن</Text>

      <ImagePickerField images={logo} onChange={setLogo} max={1} label="شعار المتجر" />
      <Text style={styles.imgHint}>صورة مربعة (شعار المحل)</Text>

      <FormField
        label="اسم المتجر"
        value={name}
        onChange={setName}
        placeholder="مثال: مفروشات الشرق"
        required
      />
      <FormField
        label="وصف المتجر"
        value={desc}
        onChange={setDesc}
        placeholder="نبذة عن نشاطك..."
        multiline
      />
      <FormField
        label="أوقات الدوام"
        value={hours}
        onChange={setHours}
        placeholder="مثال: يوميًا 9 صباحًا - 11 مساءً"
      />
      <FormField
        label="رقم الهاتف"
        value={phone}
        onChange={setPhone}
        placeholder="09xxxxxxxx"
        keyboardType="phone-pad"
      />
      <FormField
        label="المنطقة"
        value={area}
        onChange={setArea}
        placeholder="مثال: وسط المدينة"
      />

      <Pressable
        style={[styles.btn, saving && styles.btnDisabled]}
        onPress={save}
        disabled={saving}>
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.btnText}>حفظ التعديلات</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.background,
  },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  imgHint: {
    fontSize: fontSize.xs, color: colors.textMuted,
    marginTop: -spacing.sm, marginBottom: spacing.md,
  },
  sub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
});
