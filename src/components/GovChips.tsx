import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

export function GovChips({
  govs,
  selected,
  onSelect,
}: {
  govs: string[];
  selected: string;
  onSelect: (g: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wrap}>
      {govs.map(g => (
        <Pressable
          key={g}
          onPress={() => onSelect(g)}
          style={[styles.chip, selected === g && styles.chipActive]}>
          <Text style={[styles.chipText, selected === g && styles.chipTextActive]}>{g}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.white, fontWeight: '700' },
});
