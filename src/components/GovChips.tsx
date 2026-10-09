import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

// أزرار فلترة أفقية — دفاعية ضد التمدد العمودي:
// ScrollView أفقي > View داخلي باتجاه row، والأزرار لا تتمدد عموديًا أبدًا.
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.row}>
        {govs.map(g => (
          <Pressable
            key={g}
            onPress={() => onSelect(g)}
            style={[styles.chip, selected === g && styles.chipActive]}>
            <Text style={[styles.chipText, selected === g && styles.chipTextActive]}>{g}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    flexShrink: 0,
    alignSelf: 'flex-start',
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
