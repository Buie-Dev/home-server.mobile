import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TodoCategory } from '../../hooks/useTodo.hook';
import { COLORS, SPACING, RADIUS } from '../../lib/theme';

type Frequency = 'one_time' | 'daily' | 'weekly' | 'monthly';

const FREQUENCIES: Frequency[] = ['one_time', 'daily', 'weekly', 'monthly'];
const FREQUENCY_LABEL: Record<Frequency, string> = {
  one_time: 'One Time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

type DirectTaskData = { title: string; notes?: string; categoryId: number; subcategoryId?: number };
type TemplateTaskData = DirectTaskData & { frequency: Frequency };

type Props = {
  visible: boolean;
  categories: TodoCategory[];
  onClose: () => void;
  onSaveDirect: (data: DirectTaskData) => void;
  onSaveAsTemplate: (data: TemplateTaskData) => void;
};

function AddTaskModal({ visible, categories, onClose, onSaveDirect, onSaveAsTemplate }: Props) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [makeTemplate, setMakeTemplate] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>('one_time');

  useEffect(() => {
    if (!visible) return;
    setTitle('');
    setNotes('');
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setMakeTemplate(false);
    setFrequency('one_time');
  }, [visible]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) ?? null;
  const subcategories = selectedCategory?.subcategories ?? [];

  const selectCategory = (id: number) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
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
    const base: DirectTaskData = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId ?? undefined,
    };
    if (makeTemplate) {
      onSaveAsTemplate({ ...base, frequency });
    } else {
      onSaveDirect(base);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>Add Task</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus
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

            <View style={styles.templateToggleRow}>
              <Icon name="playlist-plus" size={18} color={makeTemplate ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.templateToggleLabel, makeTemplate && styles.templateToggleLabelActive]}>
                Save as template
              </Text>
              <Switch
                value={makeTemplate}
                onValueChange={setMakeTemplate}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.surface}
              />
            </View>

            {makeTemplate && (
              <>
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
              </>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default AddTaskModal;

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
  templateToggleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.lg, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  templateToggleLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  templateToggleLabelActive: { color: COLORS.primary },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  cancelBtn: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  saveBtn: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveText: { fontSize: 15, fontWeight: '600', color: COLORS.surface },
});
