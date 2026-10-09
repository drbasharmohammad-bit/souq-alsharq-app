import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { useRepo } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { formatDate } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminUsers'>;

const SUB_LABEL: Record<string, string> = {
  active: 'اشتراك مفعّل',
  pending: 'اشتراك قيد المراجعة',
  expired: 'اشتراك منتهي',
  rejected: 'إيصال مرفوض',
};

export function UsersAdminScreen({}: Props) {
  const { user } = useAuth();
  const repo = useRepo();
  const [query, setQuery] = useState('');

  const users = useMemo(() => {
    const all = repo.getUsers();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      u =>
        u.phone.includes(q) ||
        (u.displayName ?? '').toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q),
    );
  }, [repo, query]);

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

  const toggleBlock = (id: string, label: string, blocked?: boolean) => {
    if (id === user.id) {
      Alert.alert('تنبيه', 'لا يمكنك حظر حسابك الخاص');
      return;
    }
    Alert.alert(
      blocked ? 'فك حظر المستخدم' : 'حظر المستخدم',
      blocked ? `سيتمكن ${label} من الدخول والنشر مجددًا` : `لن يتمكن ${label} من الدخول أو النشر`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          style: blocked ? 'default' : 'destructive',
          onPress: () => repo.setUserBlocked(id, !blocked),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.searchWrap}>
        <AppIcon name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.search}
          placeholder="بحث بالاسم / الإيميل / الهاتف..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          keyboardType="default"
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={u => u.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMerchant = item.accountType === 'merchant';
          const sub = isMerchant ? repo.getUserSubscription(item.id) : undefined;
          const store = item.storeId ? repo.getStoreById(item.storeId) : undefined;
          return (
            <View style={[styles.card, item.blocked && styles.cardBlocked]}>
              <View style={styles.headRow}>
                <AppIcon
                  name={isMerchant ? 'storefront' : 'account'}
                  size={26}
                  color={item.blocked ? colors.danger : colors.primary}
                />
                <View style={styles.headBody}>
                  <Text style={styles.phone}>{item.displayName || item.email || item.phone || '—'}</Text>
                  {item.phone ? <Text style={styles.meta}>{item.phone}</Text> : null}
                  {item.email ? <Text style={styles.meta}>{item.email}</Text> : null}
                  <Text style={styles.meta}>
                    {isMerchant ? 'تاجر' : 'فرد'}
                    {store ? ` • ${store.name}` : ''}
                    {item.isAdmin ? ' • مدير' : ''}
                  </Text>
                  <Text style={styles.meta}>مسجل منذ {formatDate(item.createdAt)}</Text>
                  {sub && <Text style={styles.subStatus}>{SUB_LABEL[sub.status] ?? sub.status}</Text>}
                </View>
              </View>
              {!item.isAdmin && (
                <Pressable
                  style={[styles.blockBtn, item.blocked ? styles.unblock : styles.block]}
                  onPress={() => toggleBlock(item.id, item.displayName || item.email || item.phone, item.blocked)}>
                  <View style={styles.btnRow}>
                    <AppIcon name={item.blocked ? 'check-circle' : 'block-helper'} size={16} color={colors.white} />
                    <Text style={styles.btnText}>{item.blocked ? 'فك الحظر' : 'حظر'}</Text>
                  </View>
                </Pressable>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="account-group" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا يوجد مستخدمون</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    margin: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  search: { flex: 1, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, textAlign: 'right' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, elevation: 1 },
  cardBlocked: { borderWidth: 1.5, borderColor: colors.danger },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headBody: { flex: 1 },
  phone: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  subStatus: { fontSize: fontSize.xs, fontWeight: '700', color: colors.gold, marginTop: 2 },
  blockBtn: { borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  block: { backgroundColor: colors.danger },
  unblock: { backgroundColor: colors.primary },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.sm },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
  deniedWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  denied: { textAlign: 'center', fontSize: fontSize.lg, color: colors.danger, fontWeight: '700' },
});
