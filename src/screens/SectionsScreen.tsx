import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SectionImage } from '../components/SectionImage';
import { AppIcon } from '../components/AppIcon';
import { SECTIONS } from '../data';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { useRepoRefresh } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Sections'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SectionsScreen({ navigation }: Props) {
  const refreshRepo = useRepoRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRepo();
    } finally {
      setRefreshing(false);
    }
  };
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => go(item.key)}>
            <SectionImage section={item} size={96} />
            <Text style={styles.name}>{item.name}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="folder-open-outline" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد أقسام بعد</Text>
          </View>
        }
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
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
});
