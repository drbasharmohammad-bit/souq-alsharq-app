import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { FormField } from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { deleteRemoteAnnouncement, publishRemoteAnnouncement, useAnnouncements } from '../../repo/announcements';
import { useRepo, useRepoRefresh } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { formatDateTime } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminAnnouncements'>;

export function AnnouncementsAdminScreen({}: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const { items, refresh } = useAnnouncements();
  const refreshRepo = useRepoRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRepo();
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

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

  const publish = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('تنبيه', 'أدخل العنوان والنص');
      return;
    }
    const input = { title: title.trim(), body: body.trim() };
    setSending(true);
    try {
      await publishRemoteAnnouncement(input);
      repo.addAnnouncement(input);
      setTitle('');
      setBody('');
      await refresh();
      Alert.alert('تم', 'نُشر الإعلان لجميع المستخدمين');
    } catch {
      repo.addAnnouncement(input);
      setTitle('');
      setBody('');
      Alert.alert('تنبيه', 'تعذّر النشر السحابي — حُفظ الإعلان محليًا فقط');
    } finally {
      setSending(false);
    }
  };

  const remove = (id: string) => {
    Alert.alert('حذف الإعلان', 'متأكد من حذف هذا الإعلان؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRemoteAnnouncement(id);
          } catch {
            // تجاهل — يُحذف محليًا على الأقل
          }
          repo.deleteAnnouncement(id);
          await refresh();
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>إعلان جديد لجميع المستخدمين</Text>
        <FormField label="العنوان" value={title} onChange={setTitle} placeholder="مثال: صيانة مجدولة" />
        <FormField
          label="النص"
          value={body}
          onChange={setBody}
          placeholder="نص الإعلان..."
          multiline
        />
        <Pressable style={[styles.btn, sending && styles.btnDisabled]} onPress={publish} disabled={sending}>
          <View style={styles.btnRow}>
            <AppIcon name="bullhorn" size={18} color={colors.white} />
            <Text style={styles.btnText}>{sending ? 'جارٍ النشر...' : 'نشر الإعلان'}</Text>
          </View>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>{formatDateTime(item.createdAt)}</Text>
              </View>
              <Pressable style={styles.del} onPress={() => remove(item.id)} hitSlop={8}>
                <AppIcon name="trash-can" size={20} color={colors.danger} />
              </Pressable>
            </View>
            <Text style={styles.cardText}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="bullhorn" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد إعلانات إدارية بعد</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  form: { backgroundColor: colors.card, margin: spacing.md, borderRadius: radius.md, padding: spacing.md, elevation: 1 },
  formTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  btnDisabled: { opacity: 0.6 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, elevation: 1 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  cardDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  cardText: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.sm, lineHeight: 22 },
  del: { padding: 4 },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
  deniedWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
});
