import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { FabButton } from '../../components/FabButton';
import { RemoteImage } from '../../components/RemoteImage';
import { useAuth, useMyStore } from '../../context/AuthContext';
import { formatPrice } from '../../data';
import { RootStackParamList } from '../../navigation/types';
import { useRepo, useRepoRefresh } from '../../repo/RepoContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { Product } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'StoreProducts'>;

// أصناف متجر التاجر + إدارة تصنيفات المنتجات (v8)
export function StoreProductsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const store = useMyStore();
  const repo = useRepo();
  const [, force] = useState(0);
  const refreshRepo = useRepoRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRepo();
    } finally {
      setRefreshing(false);
    }
  };

  // حالة إدارة التصنيفات
  const [catName, setCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [assignFor, setAssignFor] = useState<string | null>(null);

  if (user?.accountType !== 'merchant' || !store) {
    return (
      <View style={styles.root}>
        <Text style={styles.empty}>هذه الصفحة لأصحاب المتاجر فقط</Text>
      </View>
    );
  }

  const categories = repo.getCategoriesByStore(store.id);
  const products = repo.getProductsByStore(store.id);
  const catNameById = new Map(categories.map(c => [c.id, c.name]));
  const assignProduct = products.find(p => p.id === assignFor) ?? null;

  const addCategory = () => {
    const name = catName.trim();
    if (!name) return;
    repo.addCategory({ storeId: store.id, name, order: 0 });
    setCatName('');
    force(x => x + 1);
  };

  const startEdit = (id: string, name: string) => {
    setEditingCatId(id);
    setEditName(name);
  };

  const saveEdit = () => {
    const name = editName.trim();
    if (editingCatId && name) {
      repo.updateCategory(editingCatId, name);
      setEditingCatId(null);
      setEditName('');
      force(x => x + 1);
    }
  };

  const removeCategory = (id: string, name: string) => {
    Alert.alert(
      'حذف التصنيف',
      `حذف التصنيف «${name}»؟ ستبقى أصنافه ظاهرة تحت «الكل».`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            repo.deleteCategory(id);
            force(x => x + 1);
          },
        },
      ],
    );
  };

  const removeProduct = (id: string, name: string) => {
    Alert.alert('حذف الصنف', `حذف «${name}»؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          repo.deleteProduct(id);
          force(x => x + 1);
        },
      },
    ]);
  };

  const assign = (productId: string, categoryId?: string) => {
    repo.assignProductCategory(productId, categoryId);
    setAssignFor(null);
    force(x => x + 1);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      {item.images.length > 0 ? (
        <RemoteImage
          uri={item.images[0]}
          style={styles.thumb}
          fallback={
            <View style={[styles.thumb, styles.thumbEmpty]}>
              <AppIcon name="package-variant" size={30} color={colors.primary} />
            </View>
          }
        />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]}>
          <AppIcon name="package-variant" size={30} color={colors.primary} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>{item.price !== null ? formatPrice(item.price) : 'حسب الاتفاق'}</Text>
        {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
        {/* شارة التصنيف + زر التعيين */}
        <Pressable style={styles.catRow} onPress={() => setAssignFor(item.id)} hitSlop={4}>
          <AppIcon name="tag" size={14} color={item.categoryId ? colors.primary : colors.textMuted} />
          <Text style={[styles.catText, !item.categoryId && styles.catTextNone]}>
            {item.categoryId ? catNameById.get(item.categoryId) ?? 'تصنيف محذوف' : 'بدون تصنيف — تعيين'}
          </Text>
        </Pressable>
      </View>
      <Pressable style={styles.del} onPress={() => removeProduct(item.id, item.name)} hitSlop={8}>
        <AppIcon name="delete" size={20} color={colors.danger} />
      </Pressable>
    </View>
  );

  const header = (
    <View style={styles.catsCard}>
      <View style={styles.catsTitleRow}>
        <AppIcon name="tag-multiple" size={18} color={colors.primary} />
        <Text style={styles.catsTitle}>تصنيفات المنتجات</Text>
      </View>
      {/* نموذج إضافة تصنيف */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={catName}
          onChangeText={setCatName}
          placeholder="تصنيف جديد (مثال: مشاوي، حلويات...)"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          onSubmitEditing={addCategory}
        />
        <Pressable style={[styles.addBtn, !catName.trim() && styles.addBtnDisabled]} onPress={addCategory}>
          <AppIcon name="plus" size={20} color={colors.white} />
        </Pressable>
      </View>
      {/* قائمة التصنيفات */}
      {categories.length === 0 ? (
        <Text style={styles.catsEmpty}>لا توجد تصنيفات بعد — أنشئ تصنيفك الأول أعلاه</Text>
      ) : (
        categories.map(c => (
          <View key={c.id} style={styles.catRowFull}>
            {editingCatId === c.id ? (
              <>
                <TextInput
                  style={[styles.input, styles.editInput]}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={saveEdit}
                />
                <Pressable style={styles.miniOk} onPress={saveEdit}>
                  <AppIcon name="check" size={18} color={colors.white} />
                </Pressable>
                <Pressable style={styles.miniGhost} onPress={() => setEditingCatId(null)}>
                  <AppIcon name="close" size={18} color={colors.text} />
                </Pressable>
              </>
            ) : (
              <>
                <AppIcon name="tag" size={16} color={colors.primary} />
                <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.catCount}>{products.filter(p => p.categoryId === c.id).length}</Text>
                <Pressable style={styles.miniGhost} onPress={() => startEdit(c.id, c.name)} hitSlop={6}>
                  <AppIcon name="pencil" size={17} color={colors.primary} />
                </Pressable>
                <Pressable style={styles.miniGhost} onPress={() => removeCategory(c.id, c.name)} hitSlop={6}>
                  <AppIcon name="delete" size={17} color={colors.danger} />
                </Pressable>
              </>
            )}
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={renderProduct}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="package-variant" size={56} color={colors.textMuted} />
            <Text style={styles.empty}>لا توجد أصناف بعد — أضف صنفك الأول</Text>
          </View>
        }
      />
      <FabButton onPress={() => navigation.navigate('AddProduct')} />

      {/* نافذة تعيين التصنيف للصنف */}
      <Modal visible={!!assignProduct} transparent animationType="fade" onRequestClose={() => setAssignFor(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAssignFor(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalTitleRow}>
              <AppIcon name="tag" size={18} color={colors.primary} />
              <Text style={styles.modalTitle}>تعيين تصنيف «{assignProduct?.name}»</Text>
            </View>
            <Pressable style={styles.optRow} onPress={() => assignProduct && assign(assignProduct.id, undefined)}>
              <Text style={[styles.optText, !assignProduct?.categoryId && styles.optTextActive]}>بدون تصنيف</Text>
              {!assignProduct?.categoryId ? <AppIcon name="check" size={18} color={colors.primary} /> : null}
            </Pressable>
            {categories.map(c => (
              <Pressable key={c.id} style={styles.optRow} onPress={() => assignProduct && assign(assignProduct.id, c.id)}>
                <Text style={[styles.optText, assignProduct?.categoryId === c.id && styles.optTextActive]}>{c.name}</Text>
                {assignProduct?.categoryId === c.id ? <AppIcon name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
            <Pressable style={styles.modalClose} onPress={() => setAssignFor(null)}>
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xl * 3 },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center', elevation: 1 },
  thumb: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.border },
  thumbEmpty: { backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, marginStart: spacing.md },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  price: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary, marginTop: 2 },
  desc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  catText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
  catTextNone: { color: colors.textMuted, fontWeight: '400' },
  del: { padding: spacing.sm },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xl * 2, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md },

  // إدارة التصنيفات
  catsCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, elevation: 1 },
  catsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  catsTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  input: { flex: 1, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.sm, color: colors.text, textAlign: 'right' },
  addBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { opacity: 0.45 },
  catsEmpty: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.sm },
  catRowFull: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginTop: spacing.sm },
  catName: { flex: 1, fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  catCount: { fontSize: fontSize.xs, color: colors.textMuted, backgroundColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, minWidth: 28, textAlign: 'center' },
  editInput: { paddingVertical: spacing.xs },
  miniOk: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  miniGhost: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },

  // نافذة تعيين التصنيف
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, elevation: 4 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  modalTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, flex: 1 },
  optRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  optText: { fontSize: fontSize.md, color: colors.text },
  optTextActive: { fontWeight: '800', color: colors.primary },
  modalClose: { marginTop: spacing.md, backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  modalCloseText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
});
