import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { colors, fontSize, radius, spacing } from '../theme';

const { width } = Dimensions.get('window');

type Slide = {
  icon: string;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    icon: 'storefront',
    title: 'HDR',
    description: 'سوق المنطقة الشرقية — الحسكة • القامشلي • دير الزور • الرقة',
  },
  {
    icon: 'bullhorn',
    title: 'تصفح آلاف الإعلانات',
    description: 'عقارات، سيارات، أطباء، مطاعم ومتاجر — كل المنطقة الشرقية في جيبك',
  },
  {
    icon: 'tag-plus',
    title: 'انشر مجانًا',
    description: 'أضف إعلانك أو أنشئ متجرك بخطوات بسيطة وابدأ البيع اليوم',
  },
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      onDone();
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={styles.iconCircle}>
        <AppIcon name={item.icon} size={84} color={colors.gold} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* زخارف خلفية — دوائر شفافة لإيحاء التدرج */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.decoTop} />
        <View style={styles.decoBottom} />
      </View>

      <Pressable onPress={onDone} style={styles.skip} hitSlop={12}>
        <Text style={styles.skipText}>تخطي</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        inverted={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(Math.min(Math.max(i, 0), SLIDES.length - 1));
        }}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>
            {index === SLIDES.length - 1 ? 'ابدأ' : 'التالي ←'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  decoTop: {
    position: 'absolute',
    top: -120,
    start: -100,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: colors.primaryLight,
    opacity: 0.45,
  },
  decoBottom: {
    position: 'absolute',
    bottom: -90,
    end: -110,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: colors.primary,
    opacity: 0.9,
  },
  skip: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    zIndex: 2,
  },
  skipText: {
    color: colors.white,
    fontSize: fontSize.md,
    opacity: 0.85,
    textDecorationLine: 'underline',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  iconCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    color: colors.white,
    fontSize: fontSize.lg,
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.92,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.gold,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: colors.primaryDark,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
});
