import React, {useRef, useState, useEffect} from 'react';
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
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TodoCategory, TodoTemplate, Frequency} from '../../hooks/useTodo.hook';
import {COLORS, SPACING, RADIUS} from '../../lib/theme';

const FREQUENCIES: Frequency[] = [
  'one_time',
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
];
const FREQUENCY_LABEL: Record<Frequency, string> = {
  one_time: 'One Time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type DropdownOption<T extends string | number = number> = {
  label: string;
  value: T;
};

function DropdownPicker<T extends string | number>({
  label,
  options,
  selectedValue,
  placeholder,
  onSelect,
}: {
  label: string;
  options: DropdownOption<T>[];
  selectedValue: T | null;
  placeholder: string;
  onSelect: (value: T) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const selected = options.find(o => o.value === selectedValue) ?? null;

  return (
    <>
      <Text style={dropStyles.label}>{label}</Text>
      <TouchableOpacity
        style={dropStyles.trigger}
        onPress={() => setOpen(true)}>
        <Text
          style={[dropStyles.triggerText, !selected && dropStyles.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={dropStyles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <View style={dropStyles.sheet}>
            <Text style={dropStyles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => String(item.value)}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    dropStyles.option,
                    item.value === selectedValue && dropStyles.optionActive,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}>
                  <Text
                    style={[
                      dropStyles.optionText,
                      item.value === selectedValue &&
                        dropStyles.optionTextActive,
                    ]}>
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <Icon name="check" size={16} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

type Props = {
  visible: boolean;
  categories: TodoCategory[];
  initialTemplate?: TodoTemplate | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    categoryId: number;
    subcategoryId?: number;
    frequency: Frequency;
    notes?: string;
    checklistItems: string[];
    month?: number;
  }) => void;
};

function AddTemplateModal({
  visible,
  categories,
  initialTemplate,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);
  const [frequency, setFrequency] = useState<Frequency>('one_time');
  const [month, setMonth] = useState<number>(1);
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newChecklistText, setNewChecklistText] = useState<string>('');
  const checklistInputRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setTitle(initialTemplate?.title ?? '');
      setNotes(initialTemplate?.notes ?? '');
      setSelectedCategoryId(initialTemplate?.categoryId ?? null);
      setSelectedSubcategoryId(initialTemplate?.subcategoryId ?? null);
      setFrequency(initialTemplate?.frequency ?? 'one_time');
      setMonth(initialTemplate?.month ?? 1);
      setChecklistItems(
        initialTemplate?.checklistItems?.map(i => i.text) ?? [],
      );
      setNewChecklistText('');
    }
  }, [visible, initialTemplate]);

  const selectedCategory =
    categories.find(c => c.id === selectedCategoryId) ?? null;
  const subcategories = selectedCategory?.subcategories ?? [];

  const categoryOptions: DropdownOption[] = categories.map(c => ({
    label: c.name,
    value: c.id,
  }));
  const subcategoryOptions: DropdownOption[] = subcategories.map(s => ({
    label: s.name,
    value: s.id,
  }));
  const frequencyOptions: DropdownOption<Frequency>[] = FREQUENCIES.map(f => ({
    label: FREQUENCY_LABEL[f],
    value: f,
  }));
  const monthOptions: DropdownOption<number>[] = MONTHS.map((name, i) => ({
    label: name,
    value: i + 1,
  }));

  const reset = () => {
    setTitle('');
    setNotes('');
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setFrequency('one_time');
    setMonth(1);
    setChecklistItems([]);
    setNewChecklistText('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAddChecklistItem = () => {
    const trimmed = newChecklistText.trim();
    if (trimmed) {
      setChecklistItems(prev => [...prev, trimmed]);
      setNewChecklistText('');
      setTimeout(() => checklistInputRef.current?.focus(), 50);
    }
  };

  const handleRemoveChecklistItem = (index: number, text: string) => {
    Alert.alert('Remove Item', `Remove "${text}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          setChecklistItems(prev => prev.filter((_, i) => i !== index)),
      },
    ]);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Required', 'Please select a category.');
      return;
    }
    onSave({
      title: title.trim(),
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId ?? undefined,
      frequency,
      notes: notes.trim() || undefined,
      checklistItems,
      month: frequency === 'yearly' ? month : undefined,
    });
    reset();
  };

  const selectCategory = (id: number | null) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
  };

  const isEditing = !!initialTemplate;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>
            {isEditing ? 'Edit Template' : 'Add Template'}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <DropdownPicker
              label="Category"
              options={categoryOptions}
              selectedValue={selectedCategoryId}
              placeholder="Select a category..."
              onSelect={selectCategory}
            />

            {subcategories.length > 0 && (
              <DropdownPicker
                label="Subcategory"
                options={subcategoryOptions}
                selectedValue={selectedSubcategoryId}
                placeholder="None"
                onSelect={setSelectedSubcategoryId}
              />
            )}

            <DropdownPicker<Frequency>
              label="Frequency"
              options={frequencyOptions}
              selectedValue={frequency}
              placeholder="Select frequency..."
              onSelect={setFrequency}
            />

            {frequency === 'yearly' && (
              <DropdownPicker<number>
                label="Month"
                options={monthOptions}
                selectedValue={month}
                placeholder="Select month..."
                onSelect={setMonth}
              />
            )}

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Any details..."
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <Text style={styles.label}>Checklist (optional)</Text>
            {checklistItems.map((item, index) => (
              <View key={index} style={styles.checklistRow}>
                <Icon
                  name="circle-outline"
                  size={16}
                  color={COLORS.textMuted}
                />
                <Text style={styles.checklistItemText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveChecklistItem(index, item)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.checklistAddRow}>
              <TextInput
                ref={checklistInputRef}
                style={styles.checklistAddInput}
                placeholder="Add checklist item..."
                placeholderTextColor={COLORS.textMuted}
                value={newChecklistText}
                onChangeText={setNewChecklistText}
                onSubmitEditing={handleAddChecklistItem}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.checklistAddBtn,
                  !newChecklistText.trim() && styles.checklistAddBtnDisabled,
                ]}
                onPress={handleAddChecklistItem}
                disabled={!newChecklistText.trim()}>
                <Text
                  style={[
                    styles.checklistAddBtnText,
                    !newChecklistText.trim() &&
                      styles.checklistAddBtnTextDisabled,
                  ]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>
                  {isEditing ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default AddTemplateModal;

const dropStyles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  triggerText: {fontSize: 15, color: COLORS.textPrimary, flex: 1},
  placeholder: {color: COLORS.textMuted},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    maxHeight: 400,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  optionActive: {backgroundColor: COLORS.primaryLight},
  optionText: {flex: 1, fontSize: 15, color: COLORS.textPrimary},
  optionTextActive: {color: COLORS.primary, fontWeight: '600'},
});

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
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
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
  notesInput: {height: 80, textAlignVertical: 'top'},
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs + 1,
  },
  checklistItemText: {flex: 1, fontSize: 14, color: COLORS.textPrimary},
  checklistAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  checklistAddInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    padding: 0,
  },
  checklistAddBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  checklistAddBtnDisabled: {backgroundColor: COLORS.divider},
  checklistAddBtnText: {fontSize: 13, fontWeight: '600', color: COLORS.surface},
  checklistAddBtnTextDisabled: {color: COLORS.textMuted},
  actions: {flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg},
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
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveText: {fontSize: 15, fontWeight: '600', color: COLORS.surface},
});
