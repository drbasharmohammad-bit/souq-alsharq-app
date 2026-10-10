import React, { useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { FormField } from '../../components/FormField';
import { ImagePickerField } from '../../components/ImagePickerField';
import { SelectChips } from '../../components/SelectChips';
import { useAuth } from '../../context/AuthContext';
import { GOVS } from '../../data';
import { DoctorEntry, LabEntry, PharmacyEntry } from '../../repo/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { Doctor, Lab, Pharmacy } from '../../types';

type Tab = 'doctors' | 'pharms' | 'labs';

interface FormState {
  name: string;
  spec: string;
  gov: string;
  area: string;
  phone: string;
  days: string;
  hours: string;
  tests: string;
  night: boolean;
  photo: string;
}

const EMPTY: FormState = {
  name: '', spec: '', gov: 'الحسكة', area: '', phone: '', days: '', hours: '', tests: '', night: false, photo: '',
};

export function MedicalAdminScreen() {
  const { user } = useAuth();
  const repo = useRepo();
  const [tab, setTab] = useState<Tab>('doctors');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const set = (k: keyof FormState, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v } as FormState));

  if (!user?.isAdmin) {
    return (
      <View style={styles.root}>
        <View style={styles.deniedWrap}>
          <AppIcon name="shield-alert" size={52} color={colors.danger} />
          <Text style={styles.denied}>هذه الصفحة للإدارة فقط</Text>
        </View>
      </View>
    );
  }

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const save = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('تنبيه', 'الاسم ورقم الهاتف مطلوبان');
      return;
    }
    if (tab === 'doctors' && !form.spec.trim()) {
      Alert.alert('تنبيه', 'الاختصاص مطلوب — أدخل اختصاص الطبيب (مثال: قلبية، أطفال، جلدية...)');
      return;
    }
    if (tab === 'doctors') {
      const d: Doctor = { name: form.name.trim(), spec: form.spec.trim(), gov: form.gov, area: form.area.trim() || form.gov, phone: form.phone.trim(), days: form.days.trim() || 'يوميًا', icon: 'doctor', photo: form.photo || undefined };
      if (editingId) repo.updateDoctor(editingId, d);
      else repo.addDoctor(d);
    } else if (tab === 'pharms') {
      const p: Pharmacy = { name: form.name.trim(), gov: form.gov, area: form.area.trim() || form.gov, phone: form.phone.trim(), hours: (form.hours.trim() || '8 صباحًا - 11 ليلًا') + (form.night ? ' (مناوبة ليلية)' : ''), photo: form.photo || undefined };
      if (editingId) repo.updatePharmacy(editingId, p);
      else repo.addPharmacy(p);
    } else {
      const hours = form.hours.trim() || 'يوميًا';
      const l: Lab = {
        name: form.name.trim(),
        gov: form.gov,
        area: form.area.trim() || form.gov,
        phone: form.phone.trim(),
        hours: form.tests.trim() ? `${hours} • تحاليل: ${form.tests.trim()}` : hours,
        photo: form.photo || undefined,
      };
      if (editingId) repo.updateLab(editingId, l);
      else repo.addLab(l);
    }
    reset();
  };

  const edit = (id: string) => {
    setEditingId(id);
    if (tab === 'doctors') {
      const d = repo.getDoctors().find(x => x.id === id);
      if (d) setForm({ ...EMPTY, name: d.name, spec: d.spec, gov: d.gov, area: d.area, phone: d.phone, days: d.days, photo: d.photo ?? '' });
    } else if (tab === 'pharms') {
      const p = repo.getPharmacies().find(x => x.id === id);
      if (p) setForm({ ...EMPTY, name: p.name, gov: p.gov, area: p.area, phone: p.phone, hours: p.hours, photo: p.photo ?? '' });
    } else {
      const l = repo.getLabs().find(x => x.id === id);
      if (l) setForm({ ...EMPTY, name: l.name, gov: l.gov, area: l.area, phone: l.phone, hours: l.hours, photo: l.photo ?? '' });
    }
  };

  const remove = (id: string, name: string) => {
    Alert.alert('حذف', `حذف «${name}»؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          if (tab === 'doctors') repo.deleteDoctor(id);
          else if (tab === 'pharms') repo.deletePharmacy(id);
          else repo.deleteLab(id);
          if (editingId === id) reset();
        },
      },
    ]);
  };

  const tabs: { k: Tab; t: string; icon: string }[] = [
    { k: 'doctors', t: 'أطباء', icon: 'doctor' },
    { k: 'pharms', t: 'صيدليات', icon: 'pill' },
    { k: 'labs', t: 'مخابر', icon: 'test-tube' },
  ];

  const renderRow = (id: string, title: string, meta: string) => (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowMeta}>{meta}</Text>
      </View>
      <Pressable style={styles.mini} onPress={() => edit(id)}>
        <AppIcon name="pencil" size={18} color={colors.primary} />
      </Pressable>
      <Pressable style={[styles.mini, styles.miniDel]} onPress={() => remove(id, title)}>
        <AppIcon name="delete" size={18} color={colors.danger} />
      </Pressable>
    </View>
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.wrap}>
      <View style={styles.tabs}>
        {tabs.map(t => (
          <Pressable key={t.k} onPress={() => { setTab(t.k); reset(); }} style={[styles.tab, tab === t.k && styles.tabActive]}>
            <View style={styles.tabRow}>
              <AppIcon name={t.icon} size={15} color={tab === t.k ? colors.white : colors.text} />
              <Text style={[styles.tabText, tab === t.k && styles.tabTextActive]}>{t.t}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* نموذج الإضافة/التعديل */}
      <View style={styles.form}>
        <View style={styles.formTitleRow}>
          <AppIcon name={editingId ? 'pencil' : 'plus'} size={18} color={colors.text} />
          <Text style={styles.formTitle}>{editingId ? 'تعديل' : 'إضافة جديد'}</Text>
        </View>
        <FormField label={tab === 'doctors' ? 'اسم الطبيب' : tab === 'pharms' ? 'اسم الصيدلية' : 'اسم المخبر'} value={form.name} onChange={v => set('name', v)} required />
        {tab === 'doctors' && (
          <FormField label="الاختصاص" value={form.spec} onChange={v => set('spec', v)} placeholder="مثال: قلبية، أطفال، جلدية..." required />
        )}
        <SelectChips label="المحافظة" options={GOVS.filter(g => g !== 'الكل')} value={form.gov} onChange={v => set('gov', v)} />
        <FormField label="العنوان" value={form.area} onChange={v => set('area', v)} placeholder="الحي - الشارع" />
        <FormField label="الهاتف" value={form.phone} onChange={v => set('phone', v)} keyboardType="phone-pad" required />
        <ImagePickerField
          images={form.photo ? [form.photo] : []}
          onChange={uris => set('photo', uris[0] ?? '')}
          max={1}
          label={tab === 'doctors' ? 'صورة الطبيب' : tab === 'pharms' ? 'صورة الصيدلية' : 'صورة المخبر'}
        />
        {tab === 'doctors' ? (
          <FormField label="أوقات الدوام" value={form.days} onChange={v => set('days', v)} placeholder="مثال: السبت - الخميس" />
        ) : (
          <FormField label="أوقات العمل" value={form.hours} onChange={v => set('hours', v)} placeholder="مثال: 8 صباحًا - 11 ليلًا" />
        )}
        {tab === 'pharms' && (
          <Pressable style={styles.check} onPress={() => set('night', !form.night)}>
            <View style={styles.checkRow}>
              <AppIcon name={form.night ? 'checkbox-marked' : 'checkbox-blank-outline'} size={22} color={colors.primary} />
              <Text style={styles.checkText}>مناوبة ليلية</Text>
            </View>
          </Pressable>
        )}
        {tab === 'labs' && (
          <FormField label="تحاليل متوفرة" value={form.tests} onChange={v => set('tests', v)} placeholder="مثال: دم شامل، سكري..." />
        )}
        <View style={styles.formRow}>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={save}>
            <Text style={styles.btnText}>{editingId ? 'حفظ التعديل' : 'إضافة'}</Text>
          </Pressable>
          {editingId ? (
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={reset}>
              <Text style={styles.btnGhostText}>إلغاء</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* القوائم */}
      <Text style={styles.listTitle}>القائمة الحالية</Text>
      {tab === 'doctors' &&
        (repo.getDoctors() as DoctorEntry[]).map(d =>
          renderRow(d.id, `${d.name} — ${d.spec}`, `${d.gov} - ${d.area} • ${d.phone}`),
        )}
      {tab === 'pharms' &&
        (repo.getPharmacies() as PharmacyEntry[]).map(p =>
          renderRow(p.id, p.name, `${p.gov} - ${p.area} • ${p.hours} • ${p.phone}`),
        )}
      {tab === 'labs' &&
        (repo.getLabs() as LabEntry[]).map(l =>
          renderRow(l.id, l.name, `${l.gov} - ${l.area} • ${l.hours} • ${l.phone}`),
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  wrap: { padding: spacing.md, paddingBottom: spacing.xl },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, backgroundColor: colors.card, borderRadius: radius.pill, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.info, borderColor: colors.info },
  tabText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  tabTextActive: { color: colors.white, fontWeight: '800' },
  form: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, elevation: 1 },
  formTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  check: { marginBottom: spacing.md },
  checkText: { fontSize: fontSize.md, color: colors.text },
  formRow: { flexDirection: 'row', gap: spacing.md },
  btn: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhost: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  btnGhostText: { color: colors.text, fontWeight: '700', fontSize: fontSize.md },
  listTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  rowMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  mini: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginStart: spacing.sm },
  miniDel: { backgroundColor: '#FBE9E7' },
  deniedWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
