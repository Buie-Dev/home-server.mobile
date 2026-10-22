import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
export type CategoryForManage = {
  id: number;
  name: string;
  subcategories: {id: number; name: string}[];
  itemCount: number;
};
import {COLORS, SPACING, RADIUS} from '../../lib/theme';

type Props = {
  visible: boolean;
  categories: CategoryForManage[];
  onClose: () => void;
  onAddCategory: (name: string, subcategoryNames: string[]) => Promise<void>;
  onUpdateCategory: (id: number, name: string) => Promise<void>;
  onCreateSubcategory: (categoryId: number, name: string) => Promise<void>;
  onUpdateSubcategory: (id: number, name: string) => Promise<void>;
  onDeleteSubcategory: (id: number) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
};

type ExistingSubInput = {id: number; name: string};
type EditingCategory = CategoryForManage;

function ManageCategoriesModal({
  visible,
  categories,
  onClose,
  onAddCategory,
  onUpdateCategory,
  onCreateSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
  onDeleteCategory,
}: Props) {
  const [editingCategory, setEditingCategory] =
    useState<EditingCategory | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState<string>('');
  const [existingSubInputs, setExistingSubInputs] = useState<
    ExistingSubInput[]
  >([]);
  const [newSubInputs, setNewSubInputs] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  const startEdit = (cat: MeganCategory) => {
    setEditingCategory(cat);
    setCategoryNameInput(cat.name);
    setExistingSubInputs(
      cat.subcategories.map(s => ({id: s.id, name: s.name})),
    );
    setNewSubInputs([]);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setCategoryNameInput('');
    setExistingSubInputs([]);
    setNewSubInputs([]);
  };

  const handleDeleteCategory = (cat: MeganCategory) => {
    if (cat.itemCount > 0) {
      Alert.alert(
        'Cannot Delete',
        `"${cat.name}" has ${cat.itemCount} idea(s). Remove them first.`,
      );
      return;
    }
    Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (editingCategory?.id === cat.id) {cancelEdit();}
          onDeleteCategory(cat.id);
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!categoryNameInput.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }
    setSaving(true);
    try {
      await onAddCategory(
        categoryNameInput.trim(),
        newSubInputs.map(s => s.trim()).filter(Boolean),
      );
      setCategoryNameInput('');
      setNewSubInputs([]);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!categoryNameInput.trim() || !editingCategory) {return;}
    setSaving(true);
    try {
      if (categoryNameInput.trim() !== editingCategory.name) {
        await onUpdateCategory(editingCategory.id, categoryNameInput.trim());
      }
      const currentIds = existingSubInputs.map(s => s.id);
      for (const origSub of editingCategory.subcategories) {
        if (!currentIds.includes(origSub.id)) {
          await onDeleteSubcategory(origSub.id);
        }
      }
      for (const sub of existingSubInputs) {
        const orig = editingCategory.subcategories.find(s => s.id === sub.id);
        if (orig && orig.name !== sub.name.trim() && sub.name.trim()) {
          await onUpdateSubcategory(sub.id, sub.name.trim());
        }
      }
      for (const name of newSubInputs) {
        if (name.trim()) {
          await onCreateSubcategory(editingCategory.id, name.trim());
        }
      }
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.heading}>Manage Categories</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Category list */}
            {categories.length === 0 && (
              <Text style={styles.empty}>No categories yet</Text>
            )}
            {categories.map(cat => (
              <View
                key={cat.id}
                style={[
                  styles.categoryRow,
                  editingCategory?.id === cat.id && styles.categoryRowActive,
                ]}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryCount}>
                    {cat.itemCount} idea{cat.itemCount !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    onPress={() =>
                      editingCategory?.id === cat.id
                        ? cancelEdit()
                        : startEdit(cat)
                    }
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Icon
                      name={
                        editingCategory?.id === cat.id
                          ? 'close'
                          : 'pencil-outline'
                      }
                      size={18}
                      color={
                        editingCategory?.id === cat.id
                          ? COLORS.textMuted
                          : COLORS.primary
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteCategory(cat)}
                    style={
                      cat.itemCount > 0 ? styles.actionDisabled : undefined
                    }
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Icon
                      name="trash-can-outline"
                      size={18}
                      color={
                        cat.itemCount > 0 ? COLORS.textMuted : COLORS.error
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Form */}
            <Text style={styles.label}>
              {editingCategory
                ? `Editing: ${editingCategory.name}`
                : 'New Category'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Category name"
              placeholderTextColor={COLORS.textMuted}
              value={categoryNameInput}
              onChangeText={setCategoryNameInput}
            />

            {/* Existing subcategories (edit mode only) */}
            {existingSubInputs.map((sub, i) => (
              <View key={sub.id} style={styles.subRow}>
                <TextInput
                  style={[styles.input, styles.subInput]}
                  value={sub.name}
                  onChangeText={v =>
                    setExistingSubInputs(prev =>
                      prev.map((s, idx) => (idx === i ? {...s, name: v} : s)),
                    )
                  }
                  placeholder="Subcategory name"
                  placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity
                  onPress={() =>
                    setExistingSubInputs(prev =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                  style={styles.removeBtn}>
                  <Icon
                    name="close-circle"
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ))}

            {/* New subcategory inputs */}
            {newSubInputs.map((val, i) => (
              <View key={i} style={styles.subRow}>
                <TextInput
                  style={[styles.input, styles.subInput]}
                  placeholder={`New subcategory ${i + 1}`}
                  placeholderTextColor={COLORS.textMuted}
                  value={val}
                  onChangeText={v =>
                    setNewSubInputs(prev =>
                      prev.map((s, idx) => (idx === i ? v : s)),
                    )
                  }
                />
                <TouchableOpacity
                  onPress={() =>
                    setNewSubInputs(prev => prev.filter((_, idx) => idx !== i))
                  }
                  style={styles.removeBtn}>
                  <Icon
                    name="close-circle"
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addSubBtn}
              onPress={() => setNewSubInputs(prev => [...prev, ''])}>
              <Icon name="plus" size={16} color={COLORS.primary} />
              <Text style={styles.addSubText}>Add Subcategory</Text>
            </TouchableOpacity>

            {editingCategory ? (
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    styles.saveBtnFlex,
                    saving && {opacity: 0.6},
                  ]}
                  onPress={handleUpdate}
                  disabled={saving}>
                  <Text style={styles.saveText}>Update</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.saveBtn, saving && {opacity: 0.6}]}
                onPress={handleAdd}
                disabled={saving}>
                <Text style={styles.saveText}>Add Category</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default ManageCategoriesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.md,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  heading: {fontSize: 20, fontWeight: '700', color: COLORS.textPrimary},
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    gap: SPACING.sm,
  },
  categoryRowActive: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  categoryInfo: {flex: 1},
  categoryName: {fontSize: 15, fontWeight: '600', color: COLORS.textPrimary},
  categoryCount: {fontSize: 12, color: COLORS.textMuted, marginTop: 2},
  rowActions: {flexDirection: 'row', alignItems: 'center', gap: SPACING.sm},
  actionDisabled: {opacity: 0.4},
  empty: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  subInput: {flex: 1},
  removeBtn: {padding: 4},
  addSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  addSubText: {fontSize: 13, fontWeight: '600', color: COLORS.primary},
  btnRow: {flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md},
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText: {fontSize: 15, fontWeight: '600', color: COLORS.textSecondary},
  saveBtn: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnFlex: {flex: 1, marginTop: 0},
  saveText: {fontSize: 15, fontWeight: '600', color: COLORS.surface},
});
