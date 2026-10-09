import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

export function FabButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Text style={styles.text}>＋ أضف إعلان</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
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
