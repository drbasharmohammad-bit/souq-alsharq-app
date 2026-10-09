import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { formatPrice } from '../data';
import { colors, fontSize, radius, spacing } from '../theme';
import { Listing } from '../types';
import { PlaceholderImage } from './PlaceholderImage';

function ListingCardRaw({ item, onPress }: { item: Listing; onPress: () => void }) {
  const { toggle, isFav } = useFavorites();
  const fav = isFav(item.id);
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: colors.border }}>
      <PlaceholderImage icon={item.icon} color={item.g1} size={76} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Pressable onPress={() => toggle(item.id)} hitSlop={8}>
            <Text style={styles.heart}>{fav ? '❤️' : '🤍'}</Text>
          </Pressable>
        </View>
        <Text style={styles.price}>{formatPrice(item.price, item.priceNote)}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          📍 {item.gov} - {item.area}
        </Text>
        <View style={[styles.badge, item.sellerType === 'store' ? styles.badgeStore : styles.badgeInd]}>
          <Text style={[styles.badgeText, item.sellerType === 'store' ? styles.badgeStoreText : styles.badgeIndText]}>
            {item.sellerType === 'store' ? 'متجر موثق ✅' : 'إعلان فردي 👤'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export const ListingCard = memo(ListingCardRaw);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    alignItems: 'center',
    elevation: 1,
  },
  body: { flex: 1, marginStart: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, flex: 1 },
  heart: { fontSize: 20 },
  price: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary, marginTop: 2 },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6 },
  badgeStore: { backgroundColor: colors.verifiedBg },
  badgeInd: { backgroundColor: colors.individualBg },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  badgeStoreText: { color: colors.verifiedText },
  badgeIndText: { color: colors.individualText },
});
