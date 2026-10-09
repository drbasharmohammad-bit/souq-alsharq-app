import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FabButton } from '../components/FabButton';
import { GovChips } from '../components/GovChips';
import { ListingCard } from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { GOVS } from '../data';
import { RootStackParamList } from '../navigation/types';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, spacing } from '../theme';
import { SectionKey } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Listings'>;

export function ListingsScreen({ navigation, route }: Props) {
  const { sectionKey, subKey } = route.params;
  const [gov, setGov] = useState('الكل');
  const repo = useRepo();
  const { user } = useAuth();

  const items = useMemo(
    () => repo.getListings({ sec: sectionKey as SectionKey, sub: subKey, gov, status: 'approved' }),
    [repo, sectionKey, subKey, gov],
  );

  const onFab = () => {
    if (!user) {
      navigation.navigate('Phone');
      return;
    }
    if (sectionKey === 'medical') return;
    if (subKey) navigation.navigate('PublishForm', { sectionKey, subKey });
    else navigation.navigate('PublishSub', { sectionKey });
  };

  return (
    <View style={styles.root}>
      <GovChips govs={GOVS} selected={gov} onSelect={setGov} />
      <FlatList
        data={items}
        keyExtractor={l => l.id}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        removeClippedSubviews
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('Detail', { listingId: item.id })} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>لا توجد إعلانات هنا بعد — كن أول من يعلن 📢</Text>
        }
      />
      {sectionKey !== 'medical' && <FabButton onPress={onFab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: spacing.xl * 3 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md, marginTop: spacing.xl * 2 },
});
