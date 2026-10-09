import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { useRepo } from '../../repo/RepoContext';
import { RootStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, spacing } from '../../theme';
import { AccountType } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountType'>;

export function AccountTypeScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const { login } = useAuth();
  const repo = useRepo();

  const choose = async (type: AccountType) => {
    try {
      const existing = repo.getUserByPhone(phone);
      if (existing && existing.accountType !== type) {
        Alert.alert(
          'تنبيه',
          `هذا الرقم مسجل كـ${existing.accountType === 'merchant' ? 'تاجر' : 'فرد'} — سيتم الدخول بنفس النوع`,
        );
      }
      const user = await login(phone, existing ? existing.accountType : type);
      if (user.accountType === 'merchant' && !user.storeId) {
        navigation.replace('CreateStore', { phone });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      }
    } catch (e) {
      Alert.alert('تعذر الدخول', e instanceof Error ? e.message : 'تعذر تسجيل الدخول');
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>كيف ستستخدم التطبيق؟</Text>
      <Text style={styles.sub}>اختر نوع الحساب المناسب لك</Text>

      <Pressable style={styles.card} onPress={() => choose('merchant')}>
        <AppIcon name="storefront" size={52} color={colors.primary} />
        <Text style={styles.cardTitle}>حساب تاجر</Text>
        <Text style={styles.cardDesc}>أنشئ متجرك الخاص واعرض منتجاتك لآلاف الزبائن — باشتراك شهري</Text>
        <Text style={styles.cardGo}>اختيار ←</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => choose('individual')}>
        <AppIcon name="account" size={52} color={colors.primary} />
        <Text style={styles.cardTitle}>حساب فرد</Text>
        <Text style={styles.cardDesc}>انشر إعلاناتك مباشرة: سيارتك، شقتك، خدماتك — مجانًا</Text>
        <Text style={styles.cardGo}>اختيار ←</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: spacing.xl },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.lg,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  cardDesc: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  cardGo: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary, marginTop: spacing.md },
});
