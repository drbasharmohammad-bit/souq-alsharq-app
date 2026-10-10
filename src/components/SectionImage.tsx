import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppIcon } from './AppIcon';
import type { Section } from '../types';

// صورة القسم (مولدة بالذكاء الاصطناعي) — مربعة بحواف دائرية، مع fallback للأيقونة عند الفشل
export function SectionImage({
  section,
  size = 64,
  style,
}: {
  section: Section;
  size?: number;
  style?: ViewStyle;
}) {
  const [failed, setFailed] = useState(false);
  const r = Math.round(size * 0.28);
  if (!section.image || failed) {
    return (
      <View
        style={[
          styles.fallback,
          { backgroundColor: section.g1 + '1A', width: size, height: size, borderRadius: r },
          style,
        ]}>
        <AppIcon name={section.icon} size={size * 0.45} color={section.g1} />
      </View>
    );
  }
  return (
    <Image
      source={section.image}
      style={[{ width: size, height: size, borderRadius: r }, style as StyleProp<ImageStyle>]}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
