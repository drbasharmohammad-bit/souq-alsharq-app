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
import { AppIcon } from '../components/AppIcon';
import { FormField } from '../components/FormField';
import { ImagePickerField } from '../components/ImagePickerField';
import { SelectChips } from '../components/SelectChips';
import { useAuth } from '../context/AuthContext';
import { GOVS } from '../data';
import { RootStackParamList } from '../navigation/types';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorRegister'>;

// تسجيل عيادة جديد — التسجيل الذاتي للأطباء (v14)
// يُحفظ الطلب بحالة pending ولا يظهر للعامة إلا بعد موافقة الإدارة
export function DoctorRegisterScreen({ navigation }: Props) {
  const repo = useRepo();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [spec, setSpec] = useState('');
  const [phone, setPhone] = useState('');
  const [gov, setGov] = useState('الحسكة');
  const [area, setArea] = useState('');
  const [days, setDays] = useState('');
  const [photo, setPhoto] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <View style={styles.center}>
        <AppIcon name="doctor" size={52} color={colors.textMuted} />
        <Text style={styles.empty}>سجّل الدخول أولًا لتسجيل عيادتك</Text>
        <Pressable
          style={styles.btn}
          onPress={() => navigation.navigate('GoogleLogin')}>
          <Text style={styles.btnText}>تسجيل الدخول</Text>
        </Pressable>
      </View>
    );
  }

  const submit = async () => {
    if (!name.trim() || !spec.trim() || !phone.trim()) {
      Alert.alert('تنبيه', 'الاسم الثلاثي والاختصاص ورقم الهاتف مطلوبة');
      return;
    }
    setSaving(true);
    try {
      // رفع الصورة أولًا مع الانتظار — لا URI محلي في Firestore أبدًا
      const [photoUrl] = await repo.uploadImages(photo, 'medical');
      repo.addDoctor({
        name: name.trim(),
        spec: spec.trim(),
        gov,
        area: area.trim() || gov,
        phone: phone.trim(),
        days: days.trim() || '—',
        icon: 'doctor',
        photo: photoUrl || undefined,
        status: 'pending',
        ownerUid: user.uid ?? user.id,
      });
      Alert.alert(
        'تم استلام طلبك',
        'سيراجع فريق الإدارة بيانات عيادتك قبل نشرها في الدليل الطبي.',
        [{ text: 'حسنًا', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert(
        'تعذر الإرسال',
        'فشل رفع الصورة — تحقق من اتصال الإنترنت وحاول مجددًا.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <View style={styles.head}>
        <AppIcon name="doctor" size={40} color={colors.primary} />
        <Text style={styles.title}>سجّل عيادتك</Text>
        <Text style={styles.sub}>
          املأ بيانات عيادتك وستُراجع من الإدارة قبل نشرها في الدليل الطبي
        </Text>
      </View>

      <FormField
        label="الاسم الثلاثي"
        value={name}
        onChange={setName}
        placeholder="مثال: أحمد محمد الحسن"
        required
      />
      <FormField
        label="التخصص"
        value={spec}
        onChange={setSpec}
        placeholder="مثال: قلبية، أطفال، جلدية..."
        required
      />
      <FormField
        label="رقم الهاتف"
        value={phone}
        onChange={setPhone}
        placeholder="09xxxxxxxx"
        keyboardType="phone-pad"
        required
      />
      <SelectChips label="المحافظة" options={GOVS.filter(g => g !== 'الكل')} value={gov} onChange={setGov} />
      <FormField
        label="العنوان"
        value={area}
        onChange={setArea}
        placeholder="الحي - الشارع"
      />
      <FormField
        label="أوقات الدوام"
        value={days}
        onChange={setDays}
        placeholder="مثال: السبت - الخميس، 9 صباحًا - 2 ظهرًا"
      />
      <ImagePickerField
        images={photo}
        onChange={setPhoto}
        max={1}
        label="صورة شخصية (اختياري)"
      />

      <Pressable
        style={[styles.btn, saving && styles.btnDisabled]}
        onPress={submit}
        disabled={saving}>
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.btnText}>إرسال الطلب</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
  head: { alignItems: 'center', marginBottom: spacing.lg, gap: 6 },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  sub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
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
