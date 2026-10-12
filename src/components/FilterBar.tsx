import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { colors, fontSize, radius, spacing } from '../theme';

export type SortKey = 'new' | 'low' | 'high';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'new', label: 'الأحدث' },
  { key: 'low', label: 'السعر: من الأقل' },
  { key: 'high', label: 'السعر: من الأعلى' },
];

// شريط فلاتر الإعلانات: نطاق سعر + ترتيب (v22)
export function FilterBar({
  minPrice,
  maxPrice,
  sort,
  onMinChange,
  onMaxChange,
  onSortChange,
}: {
  minPrice: string;
  maxPrice: string;
  sort: SortKey;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  onSortChange: (s: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = sort !== 'new' || minPrice.trim() !== '' || maxPrice.trim() !== '';
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.toggle} onPress={() => setOpen(o => !o)}>
        <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
          {active ? 'الفلاتر: مفعّلة' : 'فلترة وترتيب'}
        </Text>
        <AppIcon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open && (
        <View style={styles.panel}>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.input}
              value={minPrice}
              onChangeText={onMinChange}
              placeholder="أدنى سعر"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
            <Text style={styles.dash}>—</Text>
            <TextInput
              style={styles.input}
              value={maxPrice}
              onChangeText={onMaxChange}
              placeholder="أقصى سعر"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.sortRow}>
            {SORTS.map(s => (
              <Pressable
                key={s.key}
                style={[styles.chip, sort === s.key && styles.chipActive]}
                onPress={() => onSortChange(s.key)}>
                <Text style={[styles.chipText, sort === s.key && styles.chipTextActive]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {active && (
            <Pressable
              style={styles.clear}
              onPress={() => {
                onMinChange('');
                onMaxChange('');
                onSortChange('new');
              }}>
              <Text style={styles.clearText}>مسح الفلاتر</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  toggleTextActive: { color: colors.primary },
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
  },
  dash: { color: colors.textMuted, fontSize: fontSize.md },
  sortRow: { flexDirection: 'row', gap: 8, marginTop: spacing.sm, flexWrap: 'wrap' },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '14' },
  chipText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  chipTextActive: { color: colors.primary },
  clear: { alignSelf: 'center', marginTop: spacing.sm, padding: 6 },
  clearText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.danger },
});
