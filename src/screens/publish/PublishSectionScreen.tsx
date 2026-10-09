import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { SECTIONS, SUBCATS } from '../../data';
import { RootStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PublishSection'>;

// اختيار القسم — الطبي ممنوع (إدارة حصرًا)
export function PublishSectionScreen({ navigation }: Props) {
  const pick = (key: string) => {
    if (key === 'medical') {
      Alert.alert(
        'القسم الطبي',
        'القسم الطبي بإشراف الإدارة مباشرة لضمان دقة المعلومات — لإضافة عيادتك أو صيدليتك تواصل معنا',
      );
      return;
    }
    navigation.navigate('PublishSub', { sectionKey: key });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>اختر القسم</Text>
      <FlatList
        data={SECTIONS}
        keyExtractor={s => s.key}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tile, item.key === 'medical' && styles.tileLocked]}
            onPress={() => pick(item.key)}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.name}>{item.name}</Text>
            {item.key === 'medical' && (
            <View style={styles.lockRow}>
              <AppIcon name="lock" size={13} color={colors.textMuted} />
              <Text style={styles.lock}>بإشراف الإدارة</Text>
            </View>
          )}
          </Pressable>
        )}
      />
    </View>
  );
}

export function subName(sectionKey: string, subKey: string): string {
  return SUBCATS[sectionKey]?.find(s => s.key === subKey)?.name ?? '';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, margin: spacing.sm },
  grid: { gap: spacing.md },
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    margin: spacing.sm,
    alignItems: 'center',
    elevation: 1,
  },
  tileLocked: { opacity: 0.7 },
  icon: { fontSize: 40 },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  lock: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
});
