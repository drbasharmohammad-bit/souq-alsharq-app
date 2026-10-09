import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { FabButton } from '../../components/FabButton';
import { useAuth, useMyStore } from '../../context/AuthContext';
import { formatPrice } from '../../data';
import { RootStackParamList } from '../../navigation/types';
import { useRepo, useRepoRefresh } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'StoreProducts'>;

// أصناف متجر التاجر — عرض + حذف + زر إضافة
export function StoreProductsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const store = useMyStore();
  const repo = useRepo();
  const [, force] = useState(0);
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

  if (user?.accountType !== 'merchant' || !store) {
    return (
      <View style={styles.root}>
        <Text style={styles.empty}>هذه الصفحة لأصحاب المتاجر فقط</Text>
      </View>
    );
  }

  const products = repo.getProductsByStore(store.id);

  const remove = (id: string, name: string) => {
    Alert.alert('حذف الصنف', `حذف «${name}»؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          repo.deleteProduct(id);
          force(x => x + 1);
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.images.length > 0 ? (
              <Image source={{ uri: item.images[0] }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbEmpty]}>
                <AppIcon name="package-variant" size={30} color={colors.primary} />
              </View>
            )}
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>{item.price !== null ? formatPrice(item.price) : 'حسب الاتفاق'}</Text>
              {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
            </View>
            <Pressable style={styles.del} onPress={() => remove(item.id, item.name)} hitSlop={8}>
              <AppIcon name="delete" size={20} color={colors.danger} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="package-variant" size={56} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد أصناف بعد — أضف صنفك الأول</Text>
          </View>
        }
      />
      <FabButton onPress={() => navigation.navigate('AddProduct')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xl * 3 },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center', elevation: 1 },
  thumb: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.border },
  thumbEmpty: { backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, marginStart: spacing.md },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  price: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary, marginTop: 2 },
  desc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  del: { padding: spacing.sm },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
});
