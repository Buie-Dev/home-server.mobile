import React, { useRef, useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TodoCategory, TodoTemplate } from '../../hooks/useTodo.hook';
import { COLORS, SPACING, RADIUS } from '../../lib/theme';

type Frequency = 'one_time' | 'daily' | 'weekly' | 'monthly';

const FREQUENCIES: Frequency[] = ['one_time', 'daily', 'weekly', 'monthly'];
const FREQUENCY_LABEL: Record<Frequency, string> = {
  one_time: 'One Time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

type Props = {
  visible: boolean;
  categories: TodoCategory[];
  initialTemplate?: TodoTemplate | null;
  onClose: () => void;
  onSave: (data: { title: string; categoryId: number; subcategoryId?: number; frequency: Frequency; notes?: string; checklistItems: string[] }) => void;
};

function AddTemplateModal({ visible, categories, initialTemplate, onClose, onSave }: Props) {
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<Frequency>('one_time');
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
      setChecklistItems(initialTemplate?.checklistItems?.map(i => i.text) ?? []);
      setNewChecklistText('');
    }
  }, [visible, initialTemplate]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) ?? null;
  const subcategories = selectedCategory?.subcategories ?? [];

  const reset = () => {
    setTitle('');
    setNotes('');
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setFrequency('one_time');
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
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setChecklistItems(prev => prev.filter((_, i) => i !== index)) },
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
    });
    reset();
  };

  const selectCategory = (id: number) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
  };

  const isEditing = !!initialTemplate;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>{isEditing ? 'Edit Template' : 'Add Template'}</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, selectedCategoryId === c.id && styles.chipActive]}
                  onPress={() => selectCategory(c.id)}
                >
                  <Text style={[styles.chipText, selectedCategoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {subcategories.length > 0 && (
              <>
                <Text style={styles.label}>Subcategory</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
                  {subcategories.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.chip, selectedSubcategoryId === s.id && styles.chipActive]}
                      onPress={() => setSelectedSubcategoryId(selectedSubcategoryId === s.id ? null : s.id)}
                    >
                      <Text style={[styles.chipText, selectedSubcategoryId === s.id && styles.chipTextActive]}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.chipRow}>
              {FREQUENCIES.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, frequency === f && styles.chipActive]}
                  onPress={() => setFrequency(f)}
                >
                  <Text style={[styles.chipText, frequency === f && styles.chipTextActive]}>{FREQUENCY_LABEL[f]}</Text>
                </TouchableOpacity>
              ))}
            </View>

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
                <Icon name="circle-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.checklistItemText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveChecklistItem(index, item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
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
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[styles.checklistAddBtn, !newChecklistText.trim() && styles.checklistAddBtnDisabled]}
                onPress={handleAddChecklistItem}
                disabled={!newChecklistText.trim()}
              >
                <Text style={[styles.checklistAddBtnText, !newChecklistText.trim() && styles.checklistAddBtnTextDisabled]}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>{isEditing ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default AddTemplateModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.md, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  input: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  notesInput: { height: 80, textAlignVertical: 'top' },
  chipScroll: { maxHeight: 44 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingVertical: 2 },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.surface },
  checklistRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs + 1 },
  checklistItemText: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  checklistAddRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  checklistAddInput: { flex: 1, fontSize: 13, color: COLORS.textPrimary, padding: 0 },
  checklistAddBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 1, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary },
  checklistAddBtnDisabled: { backgroundColor: COLORS.divider },
  checklistAddBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.surface },
  checklistAddBtnTextDisabled: { color: COLORS.textMuted },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  cancelBtn: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  saveBtn: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveText: { fontSize: 15, fontWeight: '600', color: COLORS.surface },
});
