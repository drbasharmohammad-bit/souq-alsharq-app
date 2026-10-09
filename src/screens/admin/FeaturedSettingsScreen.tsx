import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { FormField } from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminFeaturedSettings'>;

export function FeaturedSettingsScreen({}: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const current = repo.getFeaturedSettings();
  const [price, setPrice] = useState(String(current.price));
  const [days, setDays] = useState(String(current.durationDays));

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
    const p = Number(price);
    const d = Number(days);
    if (isNaN(p) || p < 0) {
      Alert.alert('تنبيه', 'أدخل سعرًا صحيحًا (0 = مجاني/يُحدد لاحقًا)');
      return;
    }
    if (isNaN(d) || d < 1) {
      Alert.alert('تنبيه', 'أدخل مدة صحيحة بالأيام (1 على الأقل)');
      return;
    }
    repo.updateFeaturedSettings({ price: p, durationDays: Math.floor(d) });
    Alert.alert('تم', 'حُفظت إعدادات التمييز');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.headRow}>
          <AppIcon name="star" size={26} color={colors.gold} />
          <Text style={styles.title}>إعدادات الإعلان المميز</Text>
        </View>
        <Text style={styles.desc}>
          يظهر إعلان التاجر المميز في البانر الرئيسي للواجهة بعد موافقة الإدارة،
          وينتهي تلقائيًا بعد المدة المحددة.
        </Text>

        <FormField
          label="سعر التمييز (0 = يحدده المالك لاحقًا)"
          value={price}
          onChange={setPrice}
          keyboardType="numeric"
          placeholder="0"
        />
        <FormField
          label="مدة الظهور بالأيام"
          value={days}
          onChange={setDays}
          keyboardType="numeric"
          placeholder="7"
        />

        <Pressable style={styles.btn} onPress={save}>
          <View style={styles.btnRow}>
            <AppIcon name="check" size={18} color={colors.white} />
            <Text style={styles.btnText}>حفظ الإعدادات</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, elevation: 1 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  desc: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.md },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  deniedWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
});
