import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  required?: boolean;
  error?: string;
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  multiline,
  required,
  error,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.req}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.multi, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlign="right"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 6 },
  req: { color: colors.danger },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  multi: { minHeight: 90, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { fontSize: fontSize.xs, color: colors.danger, marginTop: 4 },
});
