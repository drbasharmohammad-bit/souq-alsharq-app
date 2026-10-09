import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SUBCATS, sectionName } from '../../data';
import { RootStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PublishSub'>;

export function PublishSubScreen({ navigation, route }: Props) {
  const { sectionKey } = route.params;
  const subs = SUBCATS[sectionKey] ?? [];

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{sectionName(sectionKey)} — اختر التصنيف</Text>
      <FlatList
        data={subs}
        keyExtractor={s => s.key}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={styles.tile}
            onPress={() => navigation.navigate('PublishForm', { sectionKey, subKey: item.key })}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
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
  icon: { fontSize: 36 },
  name: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginTop: spacing.sm, textAlign: 'center' },
});
