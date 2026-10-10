/**
 * قسم "تحديثات التطبيق" — يُعرض في شاشة الحساب.
 * يعرض حالة التحديث الهوائي ويسمح بالتحميل والتثبيت اليدوي.
 */
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { colors, fontSize, radius, spacing } from '../theme';
import { useOta } from './OtaContext';

export function OtaSection() {
  const { status, manifest, appliedVersion, progress, errorMessage, check, download, apply, dismiss } =
    useOta();

  const renderBody = () => {
    switch (status) {
      case 'checking':
        return (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.statusText}>جاري التحقق من التحديثات...</Text>
          </View>
        );
      case 'available':
        return (
          <View>
            <View style={styles.statusRow}>
              <AppIcon name="cloud-download" size={22} color={colors.primary} />
              <Text style={styles.statusText}>يتوفر تحديث جديد (v{manifest?.version})</Text>
            </View>
            {manifest?.releaseNotes ? (
              <Text style={styles.notes}>{manifest.releaseNotes}</Text>
            ) : null}
            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={download}>
                <Text style={styles.btnText}>تحميل التحديث</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={dismiss}>
                <Text style={styles.btnGhostText}>لاحقًا</Text>
              </Pressable>
            </View>
          </View>
        );
      case 'downloading': {
        const pct = Math.round(progress * 100);
        return (
          <View>
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.statusText}>جاري التحميل... {pct}%</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
          </View>
        );
      }
      case 'ready':
        return (
          <View>
            <View style={styles.statusRow}>
              <AppIcon name="check-circle" size={22} color={colors.primary} />
              <Text style={styles.statusText}>التحديث جاهز (v{manifest?.version})</Text>
            </View>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={apply}>
              <Text style={styles.btnText}>إعادة التشغيل للتحديث</Text>
            </Pressable>
          </View>
        );
      case 'error':
        return (
          <View>
            <Text style={styles.errorText}>{errorMessage || 'حدث خطأ'}</Text>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={check}>
              <Text style={styles.btnGhostText}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        );
      case 'idle':
      default:
        return (
          <View style={styles.statusRow}>
            <AppIcon name="check-circle-outline" size={22} color={colors.textMuted} />
            <Text style={styles.statusText}>التطبيق محدّث</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppIcon name="update" size={22} color={colors.primary} />
        <Text style={styles.title}>تحديثات التطبيق</Text>
        <Text style={styles.version}>v{appliedVersion || '...'}</Text>
      </View>
      {renderBody()}
      {status === 'idle' && (
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={check}>
          <Text style={styles.btnGhostText}>التحقق يدويًا</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  title: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginStart: spacing.sm },
  version: { fontSize: fontSize.xs, color: colors.textMuted },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  statusText: { fontSize: fontSize.sm, color: colors.text, marginStart: spacing.sm },
  notes: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 20 },
  errorText: { fontSize: fontSize.sm, color: colors.danger, marginBottom: spacing.sm },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btn: { borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', marginTop: spacing.sm, flex: 1 },
  btnPrimary: { backgroundColor: colors.primary },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.sm },
  btnGhost: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.primary },
  btnGhostText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.sm },
  barBg: { height: 6, backgroundColor: colors.background, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary },
});
