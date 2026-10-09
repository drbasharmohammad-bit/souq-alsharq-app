import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { RootStackParamList } from '../navigation/types';
import { useAnnouncements } from '../repo/announcements';
import { colors, fontSize, radius, spacing } from '../theme';
import { formatDateTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Announcements'>;

export function AnnouncementsScreen({}: Props) {
  const { items } = useAnnouncements();

  return (
    <View style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headRow}>
              <AppIcon name="bullhorn" size={22} color={colors.primary} />
              <View style={styles.headBody}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
              </View>
            </View>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="bullhorn" size={52} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد إعلانات إدارية حاليًا</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, elevation: 1 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headBody: { flex: 1 },
  title: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  date: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  body: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.sm, lineHeight: 22 },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },
});
