import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';
import { AppIcon } from './AppIcon';

export function FabButton({ onPress, label = 'أضف إعلان' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <AppIcon name="plus" size={18} color="#1A1A1A" />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  text: { color: '#1A1A1A', fontWeight: '800', fontSize: fontSize.md },
});
