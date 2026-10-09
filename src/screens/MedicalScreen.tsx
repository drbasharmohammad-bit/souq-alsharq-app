import React, { useMemo, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { GovChips } from '../components/GovChips';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { GOVS, SPECS } from '../data';
import { useRepo } from '../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Tab = 'doctors' | 'pharms' | 'labs';

export function MedicalScreen() {
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
  const pharms = useMemo(() => repo.getPharmacies().filter(p => gov === 'الكل' || p.gov === gov), [repo, gov]);
  const labs = useMemo(() => repo.getLabs().filter(l => gov === 'الكل' || l.gov === gov), [repo, gov]);

  const call = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);

  return (
    <View style={styles.root}>
      {/* شارة التوثيق */}
      <View style={styles.trust}>
        <Text style={styles.trustText}>✅ بيانات موثقة من الإدارة — القسم بإشراف مباشر لضمان الدقة</Text>
      </View>

      {/* التبويبات */}
      <View style={styles.tabs}>
        {(
          [
            { k: 'doctors', t: 'أطباء 👨‍⚕️' },
            { k: 'pharms', t: 'صيدليات 💊' },
            { k: 'labs', t: 'مخابر 🧪' },
          ] as { k: Tab; t: string }[]
        ).map(x => (
          <Pressable key={x.k} onPress={() => setTab(x.k)} style={[styles.tab, tab === x.k && styles.tabActive]}>
            <Text style={[styles.tabText, tab === x.k && styles.tabTextActive]}>{x.t}</Text>
          </Pressable>
        ))}
      </View>

      <GovChips govs={GOVS} selected={gov} onSelect={setGov} />
      {tab === 'doctors' && (
        <GovChips govs={['الكل', ...SPECS]} selected={spec} onSelect={setSpec} />
      )}

      {tab === 'doctors' && (
        <FlatList
          data={doctors}
          keyExtractor={d => d.id}
          contentContainerStyle={styles.list}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <PlaceholderImage icon={item.icon} color={colors.info} size={60} />
              <View style={styles.body}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.specTag}>{item.spec}</Text>
                <Text style={styles.meta}>📍 {item.gov} - {item.area}</Text>
                <Text style={styles.meta}>🕐 {item.days}</Text>
                <Pressable style={styles.callBtn} onPress={() => call(item.phone)}>
                  <Text style={styles.callText}>📞 {item.phone}</Text>
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
              <PlaceholderImage icon="💊" color={colors.gold} size={60} />
              <View style={styles.body}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>📍 {item.gov} - {item.area}</Text>
                <Text style={styles.meta}>🕐 {item.hours}</Text>
                <Pressable style={styles.callBtn} onPress={() => call(item.phone)}>
                  <Text style={styles.callText}>📞 {item.phone}</Text>
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
              <PlaceholderImage icon="🧪" color="#0F4C5C" size={60} />
              <View style={styles.body}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>📍 {item.gov} - {item.area}</Text>
                <Text style={styles.meta}>🕐 {item.hours}</Text>
                <Pressable style={styles.callBtn} onPress={() => call(item.phone)}>
                  <Text style={styles.callText}>📞 {item.phone}</Text>
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
  trustText: { color: colors.verifiedText, fontSize: fontSize.sm, fontWeight: '700', textAlign: 'center' },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm },
  tab: { flex: 1, backgroundColor: colors.card, borderRadius: radius.pill, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.info, borderColor: colors.info },
  tabText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  tabTextActive: { color: colors.white, fontWeight: '800' },
  list: { padding: spacing.md, paddingTop: spacing.sm },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center', elevation: 1 },
  body: { flex: 1, marginStart: spacing.md },
  name: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  specTag: { alignSelf: 'flex-start', backgroundColor: colors.individualBg, color: colors.individualText, fontSize: fontSize.xs, fontWeight: '700', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  callBtn: { marginTop: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  callText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
});
