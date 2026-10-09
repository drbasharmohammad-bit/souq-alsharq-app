import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors, fontSize, radius, spacing } from '../theme';
import { AppIcon } from './AppIcon';

// اختيار صور متعددة من المعرض (حتى max صورة) — تُحفظ كـURI محليًا الآن،
// والرفع السحابي لاحقًا مع Firebase.
export function ImagePickerField({
  images,
  onChange,
  max = 6,
  label = 'الصور',
}: {
  images: string[];
  onChange: (uris: string[]) => void;
  max?: number;
  label?: string;
}) {
  const pick = async () => {
    const remaining = max - images.length;
    if (remaining <= 0) {
      Alert.alert('تنبيه', `الحد الأقصى ${max} صور`);
      return;
    }
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: remaining,
        quality: 0.8,
      });
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('خطأ', 'تعذر فتح المعرض');
        return;
      }
      const uris = (res.assets ?? [])
        .map(a => a.uri)
        .filter((u): u is string => !!u);
      if (uris.length > 0) {
        onChange([...images, ...uris].slice(0, max));
      }
    } catch {
      Alert.alert('خطأ', 'تعذر اختيار الصور');
    }
  };

  const remove = (uri: string) => onChange(images.filter(u => u !== uri));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label} ({images.length}/{max})
      </Text>
      <View style={styles.row}>
        {images.map(uri => (
          <View key={uri} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <Pressable style={styles.del} onPress={() => remove(uri)} hitSlop={8}>
              <AppIcon name="close" size={14} color={colors.white} />
            </Pressable>
          </View>
        ))}
        {images.length < max && (
          <Pressable style={styles.add} onPress={pick}>
            <AppIcon name="camera-plus" size={30} color={colors.primary} />
            <Text style={styles.addText}>إضافة صور</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumbWrap: { position: 'relative' },
  thumb: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.border },
  del: {
    position: 'absolute',
    top: -8,
    end: -8,
    backgroundColor: colors.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' },
});
