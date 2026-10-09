import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { SECTIONS } from '../data';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Sections'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SectionsScreen({ navigation }: Props) {
  const go = (key: string) => {
    if (key === 'medical') navigation.navigate('Medical');
    else navigation.navigate('SubCategories', { sectionKey: key });
  };
  return (
    <View style={styles.root}>
      <FlatList
        data={SECTIONS}
        keyExtractor={s => s.key}
        numColumns={2}
        contentContainerStyle={styles.list}
        initialNumToRender={6}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => go(item.key)}>
            <PlaceholderImage icon={item.icon} color={item.g1} size={64} />
            <Text style={styles.name}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.md },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    margin: spacing.sm,
    alignItems: 'center',
    elevation: 1,
  },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: spacing.md },
});
