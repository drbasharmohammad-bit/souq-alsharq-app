import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { FormField } from '../../components/FormField';
import { SelectChips } from '../../components/SelectChips';
import { useAuth } from '../../context/AuthContext';
import { GOVS, SECTIONS } from '../../data';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateStore'>;

export function CreateStoreScreen({ navigation }: Props) {
  const { user, refresh } = useAuth();
  const repo = useRepo();
  const [name, setName] = useState('');
  const [sec, setSec] = useState(SECTIONS[0].name);
  const [gov, setGov] = useState(GOVS[1]);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [desc, setDesc] = useState('');

  const save = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('تنبيه', 'اسم المتجر ورقم الهاتف مطلوبان');
      return;
    }
    if (!user) return;
    const store = repo.addStore({
      name: name.trim(),
      sec,
      gov,
      area: gov,
      icon: '🏪',
      g1: colors.primary,
      g2: colors.primaryLight,
    });
    // ربط المتجر بالمستخدم
    repo.linkStoreToUser(user.phone, store.id);
    refresh();
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>🏬 إنشاء متجرك</Text>
      <Text style={styles.sub}>معلومات متجرك كما ستظهر للزبائن</Text>

      <FormField label="اسم المتجر" value={name} onChange={setName} placeholder="مثال: مفروشات الشرق" required />
      <SelectChips label="القسم الرئيسي" options={SECTIONS.filter(s => s.key !== 'medical').map(s => s.name)} value={sec} onChange={setSec} />
      <SelectChips label="المحافظة" options={GOVS.filter(g => g !== 'الكل')} value={gov} onChange={setGov} />
      <FormField label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="09xxxxxxxx" keyboardType="phone-pad" required />
      <FormField label="وصف المتجر" value={desc} onChange={setDesc} placeholder="نبذة عن نشاطك..." multiline />

      <Pressable style={styles.btn} onPress={save}>
        <Text style={styles.btnText}>إنشاء المتجر ←</Text>
      </Pressable>
      <Text style={styles.note}>💡 الاشتراك مجاني خلال فترة الانطلاق — لاحقًا باشتراك شهري</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, textAlign: 'center' },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  note: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
