import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator,
  Alert, TextInput, Modal, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import useTodo, { TodoTask, TodoTemplate, TodoHistoryItem, ChecklistItem, TodoCategory } from '../../hooks/useTodo.hook';
import ManageCategoriesModal, { CategoryForManage } from '../../components/ManageCategoriesModal/ManageCategoriesModal';
import AddTemplateModal from '../../components/AddTemplateModal/AddTemplateModal';
import AddTaskModal from '../../components/AddTaskModal/AddTaskModal';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../../lib/theme';

type Tab = 'tasks' | 'templates' | 'history';

function DropdownPicker({ label, options, selectedValue, placeholder, onSelect }: {
  label?: string;
  options: { label: string; value: number | null }[];
  selectedValue: number | null;
  placeholder: string;
  onSelect: (value: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === selectedValue) ?? null;
  return (
    <>
      {label && <Text style={dropStyles.label}>{label}</Text>}
      <TouchableOpacity style={dropStyles.trigger} onPress={() => setOpen(true)}>
        <Text style={[dropStyles.triggerText, !selected && dropStyles.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dropStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={dropStyles.sheet}>
            {label && <Text style={dropStyles.sheetTitle}>{label}</Text>}
            <FlatList
              data={options}
              keyExtractor={item => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[dropStyles.option, item.value === selectedValue && dropStyles.optionActive]}
                  onPress={() => { onSelect(item.value); setOpen(false); }}
                >
                  <Text style={[dropStyles.optionText, item.value === selectedValue && dropStyles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {item.value === selectedValue && <Icon name="check" size={16} color={COLORS.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const FREQUENCY_LABEL: Record<string, string> = {
  one_time: 'One Time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

const FREQUENCY_COLOR: Record<string, string> = {
  one_time: COLORS.textMuted,
  daily: COLORS.primary,
  weekly: COLORS.success,
  monthly: COLORS.warning,
  quarterly: '#9C27B0',
  yearly: '#E91E63',
};

const TaskDetailModal = ({
  task,
  visible,
  categories,
  onClose,
  onComplete,
  onArchive,
  onUpdateTask,
  onAddChecklistItem,
  onToggleChecklistItem,
  onUpdateChecklistItem,
  onDeleteChecklistItem,
}: {
  task: TodoTask | null;
  visible: boolean;
  categories: TodoCategory[];
  onClose: () => void;
  onComplete: () => void;
  onArchive: () => void;
  onUpdateTask: (data: { title: string; notes?: string; categoryId: number; subcategoryId?: number }) => void;
  onAddChecklistItem: (text: string) => void;
  onToggleChecklistItem: (itemId: number, checked: boolean) => void;
  onUpdateChecklistItem: (itemId: number, text: string) => void;
  onDeleteChecklistItem: (itemId: number) => void;
}) => {
  const [newItemText, setNewItemText] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editSubcategoryId, setEditSubcategoryId] = useState<number | null>(null);
  const addInputRef = useRef<any>(null);

  useEffect(() => {
    setNewItemText('');
    setEditingItemId(null);
    setEditingText('');
    setIsEditing(false);
  }, [task?.id]);

  if (!task) return null;

  const checklist: ChecklistItem[] = task.checklistItems ?? [];
  const sortedChecklist = [...checklist].sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0));
  const checkedCount = checklist.filter(i => i.checked).length;

  const handleAddItem = () => {
    const trimmed = newItemText.trim();
    if (trimmed) {
      onAddChecklistItem(trimmed);
      setNewItemText('');
      setTimeout(() => addInputRef.current?.focus(), 50);
    }
  };

  const handleFinishEdit = (itemId: number) => {
    if (editingText.trim()) {
      onUpdateChecklistItem(itemId, editingText.trim());
    }
    setEditingItemId(null);
  };

  const handleArchive = () => {
    Alert.alert('Archive Task', `Archive "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', onPress: () => { onArchive(); onClose(); } },
    ]);
  };

  const startEditing = () => {
    setEditTitle(task.title);
    setEditNotes(task.notes ?? '');
    setEditCategoryId(task.categoryId);
    setEditSubcategoryId(task.subcategoryId ?? null);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      Alert.alert('Required', 'Please enter a title.');
      return;
    }
    if (!editCategoryId) {
      Alert.alert('Required', 'Please select a category.');
      return;
    }
    onUpdateTask({
      title: editTitle.trim(),
      notes: editNotes.trim() || undefined,
      categoryId: editCategoryId,
      subcategoryId: editSubcategoryId ?? undefined,
    });
    setIsEditing(false);
  };

  const editCategory = categories.find(c => c.id === editCategoryId) ?? null;
  const editSubcategories = editCategory?.subcategories ?? [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modalStyles.safe}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={isEditing ? () => setIsEditing(false) : onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name={isEditing ? 'arrow-left' : 'close'} size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle} numberOfLines={2}>{isEditing ? 'Edit Task' : task.title}</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleSaveEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={modalStyles.saveText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <View style={modalStyles.headerRight}>
              <TouchableOpacity onPress={startEditing} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="pencil-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              {!!task.completed ? (
                <View style={modalStyles.completedBadge}>
                  <Icon name="check-circle" size={16} color={COLORS.primary} />
                  <Text style={modalStyles.completedText}>Done</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={onComplete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Icon name="check-circle-outline" size={26} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {isEditing ? (
          <ScrollView style={modalStyles.scroll} contentContainerStyle={modalStyles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={modalStyles.sectionLabel}>Title</Text>
            <TextInput
              style={modalStyles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />
            <Text style={[modalStyles.sectionLabel, { marginTop: SPACING.md }]}>Notes (optional)</Text>
            <TextInput
              style={[modalStyles.editInput, modalStyles.editNotesInput]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Any details..."
              placeholderTextColor={COLORS.textMuted}
              multiline
            />
            <DropdownPicker
              label="Category"
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              selectedValue={editCategoryId}
              placeholder="Select a category..."
              onSelect={v => { setEditCategoryId(v); setEditSubcategoryId(null); }}
            />
            {editSubcategories.length > 0 && (
              <DropdownPicker
                label="Subcategory"
                options={[{ label: 'None', value: null }, ...editSubcategories.map(s => ({ label: s.name, value: s.id }))]}
                selectedValue={editSubcategoryId}
                placeholder="None"
                onSelect={setEditSubcategoryId}
              />
            )}
          </ScrollView>
        ) : (
          <ScrollView style={modalStyles.scroll} contentContainerStyle={modalStyles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{task.categoryName}</Text>
              </View>
              {task.subcategoryName && (
                <View style={[styles.badge, styles.badgeSub]}>
                  <Text style={styles.badgeText}>{task.subcategoryName}</Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: COLORS.divider }]}>
                <Text style={[styles.badgeText, { color: FREQUENCY_COLOR[task.frequency] }]}>
                  {FREQUENCY_LABEL[task.frequency]}
                </Text>
              </View>
            </View>

            {!!task.notes && (
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionLabel}>Notes</Text>
                <Text style={modalStyles.notesText}>{task.notes}</Text>
              </View>
            )}

            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>
                {checklist.length > 0 ? `Checklist  ${checkedCount}/${checklist.length}` : 'Checklist'}
              </Text>
              {sortedChecklist.map(item => (
                <View key={item.id} style={modalStyles.checklistRow}>
                  <TouchableOpacity onPress={() => onToggleChecklistItem(item.id, !item.checked)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Icon
                      name={item.checked ? 'check-circle' : 'circle-outline'}
                      size={20}
                      color={item.checked ? COLORS.success : COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                  {editingItemId === item.id ? (
                    <TextInput
                      style={modalStyles.checklistItemInput}
                      value={editingText}
                      onChangeText={setEditingText}
                      onBlur={() => handleFinishEdit(item.id)}
                      onSubmitEditing={() => handleFinishEdit(item.id)}
                      autoFocus
                      returnKeyType="done"
                    />
                  ) : (
                    <TouchableOpacity style={modalStyles.checklistItemTextWrap} onPress={() => { setEditingItemId(item.id); setEditingText(item.text); }}>
                      <Text style={modalStyles.checklistItemText}>
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => Alert.alert('Delete Item', `Remove "${item.text}"?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => onDeleteChecklistItem(item.id) },
                    ])}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="close" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={modalStyles.checklistAddRow}>
                <TextInput
                  ref={addInputRef}
                  style={modalStyles.checklistAddInput}
                  placeholder="Add item..."
                  placeholderTextColor={COLORS.textMuted}
                  value={newItemText}
                  onChangeText={setNewItemText}
                  onSubmitEditing={handleAddItem}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={[styles.checklistAddBtn, !newItemText.trim() && styles.checklistAddBtnDisabled]}
                  onPress={handleAddItem}
                  disabled={!newItemText.trim()}
                >
                  <Text style={[styles.checklistAddBtnText, !newItemText.trim() && styles.checklistAddBtnTextDisabled]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {!!task.completed && (
              <TouchableOpacity style={modalStyles.archiveBtn} onPress={handleArchive}>
                <Icon name="archive-outline" size={18} color={COLORS.surface} />
                <Text style={modalStyles.archiveBtnText}>Archive This Task</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const TaskRow = ({
  task,
  onPress,
  onRemove,
}: {
  task: TodoTask;
  onPress: () => void;
  onRemove: () => void;
}) => (
  <TouchableOpacity style={[styles.row, !!task.completed && styles.rowCompleted]} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.rowAccent, { backgroundColor: !!task.completed ? COLORS.success : COLORS.primary }]} />
    <View style={styles.rowBody}>
      <Text style={styles.rowTitle} numberOfLines={1}>
        {task.title}
      </Text>
      <View style={styles.rowBadgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{task.categoryName}</Text>
        </View>
        {task.subcategoryName && (
          <View style={[styles.badge, styles.badgeSub]}>
            <Text style={styles.badgeText}>{task.subcategoryName}</Text>
          </View>
        )}
        {!!task.completed && (
          <View style={[styles.badge, { backgroundColor: COLORS.primaryLight }]}>
            <Icon name="check-circle" size={10} color={COLORS.primary} />
            <Text style={[styles.badgeText, { color: COLORS.primary, marginLeft: 2 }]}>Done</Text>
          </View>
        )}
      </View>
    </View>
    <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.rowDeleteBtn}>
      <Icon name="trash-can-outline" size={18} color={COLORS.error} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const TemplateCard = ({
  template,
  onAdd,
  onEdit,
  onDelete,
  isActive,
}: {
  template: TodoTemplate;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isActive: boolean;
}) => (
  <View style={[styles.card, isActive && styles.cardFaded]}>
    <View style={[styles.cardAccent, { backgroundColor: isActive ? COLORS.textMuted : COLORS.success }]} />
    <View style={styles.cardBody}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>{template.title}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={onAdd} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="plus-circle-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="pencil-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="trash-can-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{template.categoryName}</Text>
        </View>
        {template.subcategoryName && (
          <View style={[styles.badge, styles.badgeSub]}>
            <Text style={styles.badgeText}>{template.subcategoryName}</Text>
          </View>
        )}
        <View style={[styles.badge, { backgroundColor: COLORS.divider }]}>
          <Text style={[styles.badgeText, { color: FREQUENCY_COLOR[template.frequency] }]}>
            {FREQUENCY_LABEL[template.frequency]}
          </Text>
        </View>
      </View>
      {!!template.notes && <Text style={styles.notes} numberOfLines={2}>{template.notes}</Text>}
      {!!template.checklistItems?.length && (
        <View style={styles.checklistToggle}>
          <Icon name="format-list-checkbox" size={13} color={COLORS.textMuted} />
          <Text style={styles.checklistToggleText}>{template.checklistItems.length} checklist item{template.checklistItems.length !== 1 ? 's' : ''}</Text>
        </View>
      )}
    </View>
  </View>
);

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const HistoryDetailModal = ({
  item,
  visible,
  categories,
  onClose,
  onUpdateTask,
}: {
  item: TodoHistoryItem | null;
  visible: boolean;
  categories: TodoCategory[];
  onClose: () => void;
  onUpdateTask: (data: { title: string; notes?: string; categoryId: number; subcategoryId?: number }) => void;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editSubcategoryId, setEditSubcategoryId] = useState<number | null>(null);

  useEffect(() => {
    setIsEditing(false);
  }, [item?.id]);

  if (!item) return null;

  const startEditing = () => {
    setEditTitle(item.title);
    setEditNotes('');
    setEditCategoryId(item.categoryId);
    setEditSubcategoryId(item.subcategoryId ?? null);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      Alert.alert('Required', 'Please enter a title.');
      return;
    }
    if (!editCategoryId) {
      Alert.alert('Required', 'Please select a category.');
      return;
    }
    onUpdateTask({
      title: editTitle.trim(),
      notes: editNotes.trim() || undefined,
      categoryId: editCategoryId,
      subcategoryId: editSubcategoryId ?? undefined,
    });
    setIsEditing(false);
  };

  const editCategory = categories.find(c => c.id === editCategoryId) ?? null;
  const editSubcategories = editCategory?.subcategories ?? [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modalStyles.safe}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={isEditing ? () => setIsEditing(false) : onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name={isEditing ? 'arrow-left' : 'close'} size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle} numberOfLines={2}>{isEditing ? 'Edit History' : item.title}</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleSaveEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={modalStyles.saveText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <View style={modalStyles.headerRight}>
              <TouchableOpacity onPress={startEditing} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="pencil-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <View style={modalStyles.completedBadge}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={[modalStyles.completedText, { color: COLORS.success }]}>Archived</Text>
              </View>
            </View>
          )}
        </View>

        {isEditing ? (
          <ScrollView style={modalStyles.scroll} contentContainerStyle={modalStyles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={modalStyles.sectionLabel}>Title</Text>
            <TextInput
              style={modalStyles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />
            <Text style={[modalStyles.sectionLabel, { marginTop: SPACING.md }]}>Notes (optional)</Text>
            <TextInput
              style={[modalStyles.editInput, modalStyles.editNotesInput]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Any details..."
              placeholderTextColor={COLORS.textMuted}
              multiline
            />
            <DropdownPicker
              label="Category"
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              selectedValue={editCategoryId}
              placeholder="Select a category..."
              onSelect={v => { setEditCategoryId(v); setEditSubcategoryId(null); }}
            />
            {editSubcategories.length > 0 && (
              <DropdownPicker
                label="Subcategory"
                options={[{ label: 'None', value: null }, ...editSubcategories.map(s => ({ label: s.name, value: s.id }))]}
                selectedValue={editSubcategoryId}
                placeholder="None"
                onSelect={setEditSubcategoryId}
              />
            )}
          </ScrollView>
        ) : (
          <ScrollView style={modalStyles.scroll} contentContainerStyle={modalStyles.scrollContent}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.categoryName}</Text>
              </View>
              {item.subcategoryName && (
                <View style={[styles.badge, styles.badgeSub]}>
                  <Text style={styles.badgeText}>{item.subcategoryName}</Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: COLORS.divider }]}>
                <Text style={[styles.badgeText, { color: FREQUENCY_COLOR[item.frequency] }]}>
                  {FREQUENCY_LABEL[item.frequency]}
                </Text>
              </View>
            </View>
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>Completed</Text>
              <View style={styles.historyFooter}>
                <Icon name="check-circle" size={15} color={COLORS.success} />
                <Text style={modalStyles.notesText}>{formatDate(item.completedAt)}</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const HistoryRow = ({
  item,
  onPress,
  onDelete,
}: {
  item: TodoHistoryItem;
  onPress: () => void;
  onDelete: () => void;
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.rowAccent, { backgroundColor: COLORS.success }]} />
    <View style={styles.rowBody}>
      <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
      <View style={styles.rowBadgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.categoryName}</Text>
        </View>
        {item.subcategoryName && (
          <View style={[styles.badge, styles.badgeSub]}>
            <Text style={styles.badgeText}>{item.subcategoryName}</Text>
          </View>
        )}
      </View>
    </View>
    <View style={styles.rowRight}>
      <Text style={styles.historyDate}>{formatDate(item.completedAt)}</Text>
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Icon name="trash-can-outline" size={18} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

function ToDo() {
  const navigation = useNavigation();
  const {
    categories, templates, tasks, history, loading,
    fetchCategories, fetchTemplates, refetchTemplates, fetchTasks, refetchTasks, fetchHistory,
    createCategory, createSubcategory, updateCategory, updateSubcategory, deleteSubcategory, deleteCategory,
    createTemplate, updateTemplate, deleteTemplate,
    addTask, addDirectTask, addTaskWithTemplate, updateTask, completeTask, removeTask, archiveTask, archiveAllCompleted, deleteHistoryItem,
    addChecklistItem, toggleChecklistItem, updateChecklistItemText, removeChecklistItem,
  } = useTodo();

  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<number | undefined>(undefined);
  const [showManage, setShowManage] = useState<boolean>(false);
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [showAddTemplate, setShowAddTemplate] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<TodoTemplate | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null;
  const selectedHistory = history.find(h => h.id === selectedHistoryId) ?? null;

  useEffect(() => {
    fetchCategories();
    fetchTasks();
    fetchTemplates();
    fetchHistory();
  }, []);

  const selectedCategory = categories.find(c => c.id === activeCategoryId) ?? null;
  const subcategories = selectedCategory?.subcategories ?? [];

  const refetchActive = (tab: Tab, catId?: number, subId?: number) => {
    if (tab === 'tasks') fetchTasks(catId, subId);
    else if (tab === 'templates') fetchTemplates(catId, subId);
    else fetchHistory(catId, subId);
  };

  const selectCategory = (id: number) => {
    const next = activeCategoryId === id ? undefined : id;
    setActiveCategoryId(next);
    setActiveSubcategoryId(undefined);
    refetchActive(activeTab, next, undefined);
  };

  const selectSubcategory = (id: number) => {
    const next = activeSubcategoryId === id ? undefined : id;
    setActiveSubcategoryId(next);
    refetchActive(activeTab, activeCategoryId, next);
  };

  const clearFilter = () => {
    setActiveCategoryId(undefined);
    setActiveSubcategoryId(undefined);
    refetchActive(activeTab, undefined, undefined);
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setActiveCategoryId(undefined);
    setActiveSubcategoryId(undefined);
    refetchActive(tab, undefined, undefined);
  };

  const handleSaveTemplate = async (data: {
    title: string; categoryId: number; subcategoryId?: number; frequency: any; notes?: string; checklistItems: string[]; month?: number;
  }) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data);
      setEditingTemplate(null);
    } else {
      await createTemplate(data);
      setShowAddTemplate(false);
    }
    refetchTemplates();
  };

  const handleDeleteTemplate = (template: TodoTemplate) => {
    Alert.alert('Delete Template', `Delete "${template.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTemplate(template.id) },
    ]);
  };

  const handleSaveDirectTask = async (data: {
    title: string; notes?: string; categoryId: number; subcategoryId?: number;
  }) => {
    await addDirectTask(data);
    refetchTasks();
    setShowAddTask(false);
  };

  const handleSaveTaskAsTemplate = async (data: {
    title: string; notes?: string; categoryId: number; subcategoryId?: number; frequency: any; month?: number;
  }) => {
    await addTaskWithTemplate(data);
    refetchTasks();
    refetchTemplates();
    setShowAddTask(false);
  };

  const handleAddTask = async (templateId: number) => {
    await addTask(templateId);
    refetchTasks();
  };

  const handleCompleteTask = (task: TodoTask) => {
    completeTask(task.id);
  };

  const handleRemoveTask = (task: TodoTask) => {
    Alert.alert('Remove Task', `Remove "${task.title}" from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeTask(task.id) },
    ]);
  };

  const handleArchiveTask = (task: TodoTask) => {
    archiveTask(task.id);
  };

  const handleArchiveAllCompleted = () => {
    archiveAllCompleted();
  };

  const manageCategories: CategoryForManage[] = categories.map(c => ({
    id: c.id, name: c.name, subcategories: c.subcategories, itemCount: c.itemCount,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Icon name="format-list-checks" size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>To Do</Text>
        <TouchableOpacity onPress={() => setShowManage(true)} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="cog-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="home-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'tasks' && styles.tabActive]} onPress={() => switchTab('tasks')}>
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>My To Do</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'templates' && styles.tabActive]} onPress={() => switchTab('templates')}>
          <Text style={[styles.tabText, activeTab === 'templates' && styles.tabTextActive]}>Templates</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.tabActive]} onPress={() => switchTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      {categories.length > 0 && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[null, ...categories]}
            keyExtractor={(_, i) => String(i)}
            style={styles.filterRow}
            contentContainerStyle={styles.filterContent}
            renderItem={({ item }) => {
              if (item === null) {
                return (
                  <TouchableOpacity style={[styles.chip, !activeCategoryId && styles.chipActive]} onPress={clearFilter}>
                    <Text style={[styles.chipText, !activeCategoryId && styles.chipTextActive]}>All</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity style={[styles.chip, activeCategoryId === item.id && styles.chipActive]} onPress={() => selectCategory(item.id)}>
                  <Text style={[styles.chipText, activeCategoryId === item.id && styles.chipTextActive]}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
          />
          {subcategories.length > 0 && (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[null, ...subcategories]}
              keyExtractor={(_, i) => String(i)}
              style={[styles.filterRow, styles.filterRowBorder]}
              contentContainerStyle={styles.filterContent}
              renderItem={({ item }) => {
                if (item === null) {
                  return (
                    <TouchableOpacity style={[styles.chip, !activeSubcategoryId && styles.chipActive]} onPress={() => { setActiveSubcategoryId(undefined); refetchActive(activeTab, activeCategoryId, undefined); }}>
                      <Text style={[styles.chipText, !activeSubcategoryId && styles.chipTextActive]}>All</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity style={[styles.chip, activeSubcategoryId === item.id && styles.chipActive]} onPress={() => selectSubcategory(item.id)}>
                    <Text style={[styles.chipText, activeSubcategoryId === item.id && styles.chipTextActive]}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : activeTab === 'tasks' ? (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={tasks}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <TaskRow
              task={item}
              onPress={() => setSelectedTaskId(item.id)}
              onRemove={() => handleRemoveTask(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="check-circle-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Nothing to do</Text>
              <Text style={styles.emptySub}>Add tasks from Templates</Text>
            </View>
          }
        />
      ) : activeTab === 'templates' ? (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={templates}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <TemplateCard
              template={item}
              onAdd={() => handleAddTask(item.id)}
              onEdit={() => setEditingTemplate(item)}
              onDelete={() => handleDeleteTemplate(item)}
              isActive={tasks.some(t => t.templateId === item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="playlist-plus" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No templates yet</Text>
              <Text style={styles.emptySub}>Tap below to create one</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={history}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <HistoryRow
              item={item}
              onPress={() => setSelectedHistoryId(item.id)}
              onDelete={() => Alert.alert('Delete Entry', `Remove "${item.title}" from history?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteHistoryItem(item.id) },
              ])}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="history" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptySub}>Completed tasks will appear here</Text>
            </View>
          }
        />
      )}

      {(activeTab === 'tasks' || activeTab === 'templates') && (
        <View style={styles.bottomBar}>
          {activeTab === 'tasks' && (
            <View style={styles.bottomBarRow}>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddTask(true)}>
                <Icon name="plus" size={20} color={COLORS.surface} />
                <Text style={styles.addBtnText}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.archiveAllBtn}
                onPress={() => Alert.alert('Archive All Completed', 'Move all completed tasks to history?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Archive All', onPress: handleArchiveAllCompleted },
                ])}
              >
                <Icon name="archive-arrow-down-outline" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'templates' && (
            <View style={styles.bottomBarRow}>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddTemplate(true)}>
                <Icon name="plus" size={20} color={COLORS.surface} />
                <Text style={styles.addBtnText}>Add Template</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <TaskDetailModal
        task={selectedTask}
        visible={selectedTaskId !== null}
        categories={categories}
        onClose={() => setSelectedTaskId(null)}
        onComplete={() => selectedTask && handleCompleteTask(selectedTask)}
        onArchive={() => selectedTask && handleArchiveTask(selectedTask)}
        onUpdateTask={data => selectedTaskId && updateTask(selectedTaskId, data)}
        onAddChecklistItem={text => selectedTaskId && addChecklistItem(selectedTaskId, text)}
        onToggleChecklistItem={(itemId, checked) => selectedTaskId && toggleChecklistItem(selectedTaskId, itemId, checked)}
        onUpdateChecklistItem={(itemId, text) => selectedTaskId && updateChecklistItemText(selectedTaskId, itemId, text)}
        onDeleteChecklistItem={itemId => selectedTaskId && removeChecklistItem(selectedTaskId, itemId)}
      />

      <HistoryDetailModal
        item={selectedHistory}
        visible={selectedHistoryId !== null}
        categories={categories}
        onClose={() => setSelectedHistoryId(null)}
        onUpdateTask={data => selectedHistoryId && updateTask(selectedHistoryId, data)}
      />

      <AddTaskModal
        visible={showAddTask}
        categories={categories}
        onClose={() => setShowAddTask(false)}
        onSaveDirect={handleSaveDirectTask}
        onSaveAsTemplate={handleSaveTaskAsTemplate}
      />

      <AddTemplateModal
        visible={showAddTemplate || !!editingTemplate}
        categories={categories}
        initialTemplate={editingTemplate}
        onClose={() => { setShowAddTemplate(false); setEditingTemplate(null); }}
        onSave={handleSaveTemplate}
      />

      <ManageCategoriesModal
        visible={showManage}
        categories={manageCategories}
        onClose={() => setShowManage(false)}
        onAddCategory={createCategory}
        onUpdateCategory={updateCategory}
        onCreateSubcategory={createSubcategory}
        onUpdateSubcategory={updateSubcategory}
        onDeleteSubcategory={deleteSubcategory}
        onDeleteCategory={deleteCategory}
      />
    </SafeAreaView>
  );
}

export default ToDo;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  headerIconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3, flex: 1 },
  headerBtn: { padding: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: SPACING.sm + 2, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary },
  filterContainer: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterRow: { maxHeight: 64 },
  filterRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  filterContent: { gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignItems: 'center' },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.surface },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1 },
  listContent: { padding: SPACING.sm, gap: SPACING.xs, paddingBottom: SPACING.xl },
  // Task row (compact)
  row: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOWS.card, alignItems: 'center' },
  rowCompleted: { backgroundColor: 'rgba(76, 175, 80, 0.10)' },
  rowAccent: { width: 4, alignSelf: 'stretch' },
  rowBody: { flex: 1, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm },
  rowTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 3 },
  rowBadgeRow: { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap', alignItems: 'center' },
  rowDeleteBtn: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  // Template/history cards
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOWS.card },
  cardFaded: { opacity: 0.4 },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: SPACING.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  actionBtn: { marginLeft: 2 },
  badgeRow: { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap', marginBottom: SPACING.xs },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 999, backgroundColor: COLORS.primaryLight, flexDirection: 'row', alignItems: 'center' },
  badgeSub: { backgroundColor: COLORS.divider },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  notes: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: SPACING.xl * 2, gap: SPACING.sm },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  emptySub: { fontSize: 13, color: COLORS.textMuted },
  bottomBar: { padding: SPACING.md },
  bottomBarRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  addBtn: { flex: 1, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, ...SHADOWS.card },
  addBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.surface },
  archiveAllBtn: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  historyFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.xs },
  historyDate: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right' },
  checklistToggle: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm, paddingVertical: SPACING.xs },
  checklistToggleText: { flex: 1, fontSize: 12, fontWeight: '500', color: COLORS.textMuted },
  checklistAddBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 1, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary },
  checklistAddBtnDisabled: { backgroundColor: COLORS.divider },
  checklistAddBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.surface },
  checklistAddBtnTextDisabled: { color: COLORS.textMuted },
});

const modalStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  saveText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 999, backgroundColor: COLORS.primaryLight },
  completedText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  editInput: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  editNotesInput: { height: 80, textAlignVertical: 'top' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xl },
  section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm, ...SHADOWS.card },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  notesText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  checklistRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 2 },
  checklistItemTextWrap: { flex: 1 },
  checklistItemText: { fontSize: 14, color: COLORS.textPrimary },
  checklistItemChecked: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  checklistItemInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary, padding: 0 },
  checklistAddRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  checklistAddInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary, padding: 0 },
  archiveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.md, ...SHADOWS.card },
  archiveBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.surface },
  archiveAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border },
  archiveAllBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
});

const dropStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.xs, marginTop: SPACING.md },
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  triggerText: { fontSize: 15, color: COLORS.textPrimary, flex: 1 },
  placeholder: { color: COLORS.textMuted },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: SPACING.md },
  sheet: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', maxHeight: 400 },
  sheetTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  optionActive: { backgroundColor: COLORS.primaryLight },
  optionText: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  optionTextActive: { color: COLORS.primary, fontWeight: '600' },
});
