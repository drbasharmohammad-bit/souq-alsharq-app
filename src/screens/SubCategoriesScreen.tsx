import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SectionImage } from '../components/SectionImage';
import { AppIcon } from '../components/AppIcon';
import { SECTIONS, SUBCATS } from '../data';
import { RootStackParamList } from '../navigation/types';
import { useRepoRefresh } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SubCategories'>;

export function SubCategoriesScreen({ navigation, route }: Props) {
  const { sectionKey } = route.params;
  const subs = SUBCATS[sectionKey] ?? [];
  const secName = SECTIONS.find(s => s.key === sectionKey)?.name ?? '';
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

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: secName });
  }, [navigation, secName]);

  return (
    <View style={styles.root}>
      <FlatList
        data={subs}
        keyExtractor={s => s.key}
        numColumns={2}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('Listings', {
                sectionKey,
                subKey: item.key,
                title: item.name,
              })
            }>
            <SectionImage section={item} size={140} style={{ width: '100%', height: undefined, aspectRatio: 1, borderRadius: 0 }} />
            <Text style={styles.name}>{item.name}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="folder-open-outline" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد أقسام فرعية بعد</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    paddingBottom: spacing.md,
    margin: spacing.sm,
    elevation: 1,
  },
  name: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.sm },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
});
