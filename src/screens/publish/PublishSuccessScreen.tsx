import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PublishSuccess'>;

export function PublishSuccessScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.title}>تم إرسال إعلانك</Text>
      <Text style={styles.sub}>إعلانك الآن «بانتظار مراجعة الإدارة» — سننشره فور الموافقة عليه</Text>
      <Pressable
        style={styles.btn}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Tabs', params: { screen: 'Account' } }] })}>
        <Text style={styles.btnText}>إعلاناتي ←</Text>
      </Pressable>
      <Pressable
        style={styles.ghost}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })}>
        <Text style={styles.ghostText}>العودة للرئيسية</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  icon: { fontSize: 72 },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  ghost: { marginTop: spacing.md },
  ghostText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.sm },
});
