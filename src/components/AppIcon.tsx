import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// أيقونة موحدة للتطبيق — أسماء من MaterialCommunityIcons
export function AppIcon({
  name,
  size = 20,
  color,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: object;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}
