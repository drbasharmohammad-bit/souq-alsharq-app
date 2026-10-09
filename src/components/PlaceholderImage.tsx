import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

// صورة بديلة ملونة (placeholder) — تُستبدل بصور حقيقية لاحقًا
export function PlaceholderImage({
  icon,
  color,
  size = 64,
  style,
}: {
  icon: string;
  color: string;
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.box, { backgroundColor: color + '22', width: size, height: size, borderRadius: size / 5 }, style]}>
      <Text style={{ fontSize: size * 0.45 }}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
