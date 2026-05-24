import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MeganCategory, MeganIdea } from '../../hooks/useMegan.hook';
import { COLORS, SPACING, RADIUS } from '../../lib/theme';

type Props = {
  visible: boolean;
  categories: MeganCategory[];
  initialIdea?: MeganIdea | null;
  onClose: () => void;
  onSave: (data: { title: string; categoryId: number; subcategoryId?: number; notes?: string }) => void;
};

function AddIdeaModal({ visible, categories, initialIdea, onClose, onSave }: Props) {
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle(initialIdea?.title ?? '');
      setNotes(initialIdea?.notes ?? '');
      setSelectedCategoryId(initialIdea?.categoryId ?? null);
      setSelectedSubcategoryId(initialIdea?.subcategoryId ?? null);
    }
  }, [visible, initialIdea]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) ?? null;
  const subcategories = selectedCategory?.subcategories ?? [];

  const reset = () => {
    setTitle('');
    setNotes('');
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
  };

  const handleClose = () => {
    reset();
    onClose();
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
      notes: notes.trim() || undefined,
    });
    reset();
  };

  const selectCategory = (id: number) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
  };

  const isEditing = !!initialIdea;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <Text style={styles.heading}>{isEditing ? 'Edit Idea' : 'Add Idea'}</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.input}
              placeholder="What's the idea?"
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

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Any details..."
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

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

export default AddIdeaModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.md, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  input: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  notesInput: { height: 80, textAlignVertical: 'top' },
  chipScroll: { maxHeight: 44 },
  chipRow: { gap: SPACING.sm, paddingVertical: 2 },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.surface },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  cancelBtn: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  saveBtn: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveText: { fontSize: 15, fontWeight: '600', color: COLORS.surface },
});
