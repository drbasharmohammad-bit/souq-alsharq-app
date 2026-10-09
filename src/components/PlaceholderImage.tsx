import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppIcon } from './AppIcon';

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
      <AppIcon name={icon} size={size * 0.45} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
