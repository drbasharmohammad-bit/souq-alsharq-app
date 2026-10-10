import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../components/AppIcon';
import { GovChips } from '../components/GovChips';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { RemoteImage } from '../components/RemoteImage';
import { GOVS } from '../data';
import { RootStackParamList } from '../navigation/types';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Tab = 'doctors' | 'pharms' | 'labs';

type Props = NativeStackScreenProps<RootStackParamList, 'Medical'>;

export function MedicalScreen({ navigation }: Props) {
  const repo = useRepo();
  const [tab, setTab] = useState<Tab>('doctors');
  const [gov, setGov] = useState('الكل');
  const [spec, setSpec] = useState('الكل');

  const doctors = useMemo(
    () =>
      repo.getDoctors().filter(
        d =>
          (gov === 'الكل' || d.gov === gov) &&
          (spec === 'الكل' || d.spec === spec),
      ),
    [repo, gov, spec],
  );

  // الاختصاصات الفعلية المسجلة (إدخال حر من الإدارة) — تُشتق ديناميكيًا من البيانات
  const specs = useMemo(() => {
    const set = new Set<string>();
    repo.getDoctors().forEach(d => {
      const s = (d.spec ?? '').trim();
      if (s) set.add(s);
    });
    return [...set].sort();
  }, [repo]);

  // إن حُذف الاختصاص المختار من البيانات أعد الفلتر إلى «الكل»
  useEffect(() => {
    if (spec !== 'الكل' && !specs.includes(spec)) setSpec('الكل');
  }, [specs, spec]);
  const pharms = useMemo(() => repo.getPharmacies().filter(p => gov === 'الكل' || p.gov === gov), [repo, gov]);
  const labs = useMemo(() => repo.getLabs().filter(l => gov === 'الكل' || l.gov === gov), [repo, gov]);

  const call = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);

  // صورة السجل إن وُجدت (دائرية بنفس الحجم) — وإلا الـPlaceholder كبديل
  const avatar = (photo: string | undefined, icon: string, color: string) =>
    photo ? (
      <RemoteImage
        uri={photo}
        style={styles.avatar}
        fallback={<PlaceholderImage icon={icon} color={color} size={60} />}
      />
    ) : (
      <PlaceholderImage icon={icon} color={color} size={60} />
    );

  return (
    <View style={styles.root}>
      {/* شارة التوثيق */}
      <View style={styles.trust}>
        <View style={styles.trustRow}>
          <AppIcon name="check-circle" size={18} color={colors.verifiedText} />
          <Text style={styles.trustText}>بيانات موثقة من الإدارة — القسم بإشراف مباشر لضمان الدقة</Text>
        </View>
      </View>

      {tab === 'doctors' && (
        <Pressable
          style={styles.registerBtn}
          onPress={() => navigation.navigate('DoctorRegister')}>
          <AppIcon name="doctor" size={20} color={colors.primary} />
          <Text style={styles.registerText}>أنت طبيب؟ سجّل عيادتك</Text>
        </Pressable>
      )}

      {/* التبويبات */}
      <View style={styles.tabs}>
        {(
          [
            { k: 'doctors', t: 'أطباء', icon: 'doctor' },
            { k: 'pharms', t: 'صيدليات', icon: 'pill' },
            { k: 'labs', t: 'مخابر', icon: 'test-tube' },
          ] as { k: Tab; t: string; icon: string }[]
        ).map(x => (
          <Pressable key={x.k} onPress={() => setTab(x.k)} style={[styles.tab, tab === x.k && styles.tabActive]}>
            <View style={styles.tabRow}>
              <AppIcon name={x.icon} size={17} color={tab === x.k ? colors.white : colors.text} />
              <Text style={[styles.tabText, tab === x.k && styles.tabTextActive]}>{x.t}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <GovChips govs={GOVS} selected={gov} onSelect={setGov} />
      {tab === 'doctors' && (
        <GovChips govs={['الكل', ...specs]} selected={spec} onSelect={setSpec} />
      )}

      {tab === 'doctors' && (
        <FlatList
          data={doctors}
          keyExtractor={d => d.id}
          contentContainerStyle={styles.list}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <AppIcon name="doctor" size={44} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                لا يوجد أطباء معتمدون بعد — كن أول من يسجّل عيادته
              </Text>
              <Pressable
                style={styles.registerBtn}
                onPress={() => navigation.navigate('DoctorRegister')}>
                <Text style={styles.registerText}>سجّل عيادتك</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {avatar(item.photo, 'doctor', colors.info)}
              <View style={styles.body}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.specTag}>{item.spec}</Text>
                <View style={styles.metaRow}>
                  <AppIcon name="map-marker" size={14} color={colors.textMuted} />
                  <Text style={styles.meta}>{item.gov} - {item.area}</Text>
                </View>
                <View style={styles.metaRow}>
                  <AppIcon name="clock" size={14} color={colors.textMuted} />
                  <Text style={styles.meta}>{item.days}</Text>
                </View>
                <Pressable style={styles.callBtn} onPress={() => call(item.phone)}>
                  <View style={styles.callRow}>
                    <AppIcon name="phone" size={16} color={colors.white} />
                    <Text style={styles.callText}>{item.phone}</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {tab === 'pharms' && (
        <FlatList
          data={pharms}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          initialNumToRender={8}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {avatar(item.photo, 'pill', colors.gold)}
              <View style={styles.body}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.metaRow}>
                  <AppIcon name="map-marker" size={14} color={colors.textMuted} />
                  <Text style={styles.meta}>{item.gov} - {item.area}</Text>
                </View>
                <View style={styles.metaRow}>
                  <AppIcon name="clock" size={14} color={colors.textMuted} />
                  <Text style={styles.meta}>{item.hours}</Text>
                </View>
                <Pressable style={styles.callBtn} onPress={() => call(item.phone)}>
                  <View style={styles.callRow}>
                    <AppIcon name="phone" size={16} color={colors.white} />
                    <Text style={styles.callText}>{item.phone}</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {tab === 'labs' && (
        <FlatList
          data={labs}
          keyExtractor={l => l.id}
          contentContainerStyle={styles.list}
          initialNumToRender={8}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {avatar(item.photo, 'test-tube', '#0F4C5C')}
              <View style={styles.body}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.metaRow}>
                  <AppIcon name="map-marker" size={14} color={colors.textMuted} />
                  <Text style={styles.meta}>{item.gov} - {item.area}</Text>
                </View>
                <View style={styles.metaRow}>
                  <AppIcon name="clock" size={14} color={colors.textMuted} />
                  <Text style={styles.meta}>{item.hours}</Text>
                </View>
                <Pressable style={styles.callBtn} onPress={() => call(item.phone)}>
                  <View style={styles.callRow}>
                    <AppIcon name="phone" size={16} color={colors.white} />
                    <Text style={styles.callText}>{item.phone}</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  trust: { backgroundColor: colors.verifiedBg, margin: spacing.md, borderRadius: radius.md, padding: spacing.md },
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  trustText: { color: colors.verifiedText, fontSize: fontSize.sm, fontWeight: '700', textAlign: 'center', flex: 1 },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  registerText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '800' },
  emptyBox: { alignItems: 'center', padding: spacing.xl, gap: 10 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', lineHeight: 24 },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm },
  tab: { flex: 1, backgroundColor: colors.card, borderRadius: radius.pill, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.info, borderColor: colors.info },
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  tabTextActive: { color: colors.white, fontWeight: '800' },
  list: { padding: spacing.md, paddingTop: spacing.sm },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center', elevation: 1 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.border },
  body: { flex: 1, marginStart: spacing.md },
  name: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  specTag: { alignSelf: 'flex-start', backgroundColor: colors.individualBg, color: colors.individualText, fontSize: fontSize.xs, fontWeight: '700', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, flex: 1 },
  callBtn: { marginTop: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  callRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  callText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
});
