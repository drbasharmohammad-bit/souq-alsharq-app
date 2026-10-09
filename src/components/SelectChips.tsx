import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export function SelectChips({ label, options, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map(o => (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            style={[styles.chip, value === o && styles.chipActive]}>
            <Text style={[styles.chipText, value === o && styles.chipTextActive]}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.white, fontWeight: '700' },
});
