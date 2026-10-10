import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme';

/**
 * صورة بعيدة مع هيكل تحميل نابض (shimmer):
 * - أثناء التحميل: نبض خفيف يحجز نفس المساحة (بلا قفزات تخطيط)
 * - عند الفشل أو غياب الرابط: يعرض الـfallback الذي يمرره المستدعي
 * تجميل فقط — لا يغيّر أي منطق.
 */
export function RemoteImage({
  uri,
  style,
  resizeMode = 'cover',
  fallback,
}: {
  uri?: string;
  style?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain' | 'center';
  fallback?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [uri]);

  useEffect(() => {
    if (loaded || failed || !uri) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [loaded, failed, uri, pulse]);

  if (!uri || failed) {
    return <>{fallback ?? null}</>;
  }

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.8],
  });

  return (
    <View style={[styles.wrap, style]}>
      {!loaded && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.shimmer, { opacity }]}
        />
      )}
      <Image
        source={{ uri }}
        style={styles.fill}
        resizeMode={resizeMode}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.border },
  shimmer: { backgroundColor: colors.border },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});
