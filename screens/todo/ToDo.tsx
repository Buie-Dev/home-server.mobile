import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import useTodo, { TodoTask, TodoTemplate, TodoHistoryItem, ChecklistItem } from '../../hooks/useTodo.hook';
import ManageCategoriesModal, { CategoryForManage } from '../../components/ManageCategoriesModal/ManageCategoriesModal';
import AddTemplateModal from '../../components/AddTemplateModal/AddTemplateModal';
import AddTaskModal from '../../components/AddTaskModal/AddTaskModal';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../../lib/theme';

type Tab = 'tasks' | 'templates' | 'history';

const FREQUENCY_LABEL: Record<string, string> = {
  one_time: 'One Time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const FREQUENCY_COLOR: Record<string, string> = {
  one_time: COLORS.textMuted,
  daily: COLORS.primary,
  weekly: COLORS.success,
  monthly: COLORS.warning,
};

const TaskCard = ({
  task,
  onComplete,
  onRemove,
  onAddChecklistItem,
  onToggleChecklistItem,
  onUpdateChecklistItem,
  onDeleteChecklistItem,
}: {
  task: TodoTask;
  onComplete: () => void;
  onRemove: () => void;
  onAddChecklistItem: (text: string) => void;
  onToggleChecklistItem: (itemId: number, checked: boolean) => void;
  onUpdateChecklistItem: (itemId: number, text: string) => void;
  onDeleteChecklistItem: (itemId: number) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const addInputRef = useRef<any>(null);
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

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: COLORS.primary }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={2}>{task.title}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={onComplete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="check-circle-outline" size={22} color={COLORS.success} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRemove} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="trash-can-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
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
        {!!task.notes && <Text style={styles.notes} numberOfLines={2}>{task.notes}</Text>}
        <TouchableOpacity style={styles.checklistToggle} onPress={() => setExpanded(e => !e)}>
          <Icon name="format-list-checkbox" size={14} color={COLORS.textMuted} />
          <Text style={styles.checklistToggleText}>
            {checklist.length > 0 ? `Checklist  ${checkedCount}/${checklist.length}` : 'Checklist'}
          </Text>
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
        {expanded && (
          <View style={styles.checklistSection}>
            {sortedChecklist.map(item => (
              <View key={item.id} style={styles.checklistRow}>
                <TouchableOpacity onPress={() => onToggleChecklistItem(item.id, !item.checked)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Icon
                    name={item.checked ? 'check-circle' : 'circle-outline'}
                    size={20}
                    color={item.checked ? COLORS.success : COLORS.textSecondary}
                  />
                </TouchableOpacity>
                {editingItemId === item.id ? (
                  <TextInput
                    style={styles.checklistItemInput}
                    value={editingText}
                    onChangeText={setEditingText}
                    onBlur={() => handleFinishEdit(item.id)}
                    onSubmitEditing={() => handleFinishEdit(item.id)}
                    autoFocus
                    returnKeyType="done"
                  />
                ) : (
                  <TouchableOpacity style={styles.checklistItemTextWrap} onPress={() => { setEditingItemId(item.id); setEditingText(item.text); }}>
                    <Text style={[styles.checklistItemText, item.checked && styles.checklistItemChecked]}>
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
            <View style={styles.checklistAddRow}>
              <TextInput
                ref={addInputRef}
                style={styles.checklistAddInput}
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
        )}
      </View>
    </View>
  );
};

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
            <Icon name="trash-can-outline" size={18} color={COLORS.textMuted} />
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
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' at '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const HistoryCard = ({ item, onDelete }: { item: TodoHistoryItem; onDelete: () => void }) => (
  <View style={styles.card}>
    <View style={[styles.cardAccent, { backgroundColor: COLORS.textMuted }]} />
    <View style={styles.cardBody}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="trash-can-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
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
      <View style={styles.historyFooter}>
        <Icon name="check-circle" size={13} color={COLORS.success} />
        <Text style={styles.historyDate}>{formatDate(item.completedAt)}</Text>
      </View>
    </View>
  </View>
);

function ToDo() {
  const navigation = useNavigation();
  const {
    categories, templates, tasks, history, loading,
    fetchCategories, fetchTemplates, fetchTasks, fetchHistory,
    createCategory, createSubcategory, updateCategory, updateSubcategory, deleteSubcategory, deleteCategory,
    createTemplate, updateTemplate, deleteTemplate,
    addTask, addDirectTask, addTaskWithTemplate, completeTask, removeTask, deleteHistoryItem,
    addChecklistItem, toggleChecklistItem, updateChecklistItemText, removeChecklistItem,
  } = useTodo();

  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<number | undefined>(undefined);
  const [showManage, setShowManage] = useState<boolean>(false);
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [showAddTemplate, setShowAddTemplate] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<TodoTemplate | null>(null);

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
    title: string; categoryId: number; subcategoryId?: number; frequency: any; notes?: string; checklistItems: string[];
  }) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data);
      setEditingTemplate(null);
    } else {
      await createTemplate(data);
      setShowAddTemplate(false);
    }
    fetchTemplates(activeCategoryId, activeSubcategoryId);
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
    fetchTasks(activeCategoryId, activeSubcategoryId);
    setShowAddTask(false);
  };

  const handleSaveTaskAsTemplate = async (data: {
    title: string; notes?: string; categoryId: number; subcategoryId?: number; frequency: any;
  }) => {
    await addTaskWithTemplate(data);
    fetchTasks(activeCategoryId, activeSubcategoryId);
    fetchTemplates(activeCategoryId, activeSubcategoryId);
    setShowAddTask(false);
  };

  const handleAddTask = async (templateId: number) => {
    await addTask(templateId);
    fetchTasks(activeCategoryId, activeSubcategoryId);
  };

  const handleCompleteTask = (task: TodoTask) => {
    Alert.alert('Complete Task', `Mark "${task.title}" as done?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Done', onPress: () => completeTask(task.id) },
    ]);
  };

  const handleRemoveTask = (task: TodoTask) => {
    Alert.alert('Remove Task', `Remove "${task.title}" from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeTask(task.id) },
    ]);
  };

  const manageCategories: CategoryForManage[] = categories.map(c => ({
    id: c.id, name: c.name, subcategories: c.subcategories, itemCount: c.itemCount,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
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

      {/* Tabs */}
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

      {/* Category filter */}
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

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : activeTab === 'tasks' ? (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={tasks}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onComplete={() => handleCompleteTask(item)}
              onRemove={() => handleRemoveTask(item)}
              onAddChecklistItem={text => addChecklistItem(item.id, text)}
              onToggleChecklistItem={(itemId, checked) => toggleChecklistItem(item.id, itemId, checked)}
              onUpdateChecklistItem={(itemId, text) => updateChecklistItemText(item.id, itemId, text)}
              onDeleteChecklistItem={itemId => removeChecklistItem(item.id, itemId)}
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
            <HistoryCard
              item={item}
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

      {/* Bottom action bar */}
      {(activeTab === 'tasks' || activeTab === 'templates') && (
        <View style={styles.bottomBar}>
          {activeTab === 'tasks' && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddTask(true)}>
              <Icon name="plus" size={20} color={COLORS.surface} />
              <Text style={styles.addBtnText}>Add Task</Text>
            </TouchableOpacity>
          )}
          {activeTab === 'templates' && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddTemplate(true)}>
              <Icon name="plus" size={20} color={COLORS.surface} />
              <Text style={styles.addBtnText}>Add Template</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
  loader: { marginTop: SPACING.xl },
  list: { flex: 1 },
  listContent: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xl },
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOWS.card },
  cardFaded: { opacity: 0.4 },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: SPACING.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  actionBtn: { marginLeft: 2 },
  badgeRow: { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap', marginBottom: SPACING.xs },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 999, backgroundColor: COLORS.primaryLight },
  badgeSub: { backgroundColor: COLORS.divider },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  notes: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: SPACING.xl * 2, gap: SPACING.sm },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  emptySub: { fontSize: 13, color: COLORS.textMuted },
  bottomBar: { padding: SPACING.md },
  addBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, ...SHADOWS.card },
  addBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.surface },
  historyFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.xs },
  historyDate: { fontSize: 12, color: COLORS.textMuted },
  checklistToggle: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm, paddingVertical: SPACING.xs },
  checklistToggleText: { flex: 1, fontSize: 12, fontWeight: '500', color: COLORS.textMuted },
  checklistSection: { gap: SPACING.xs, marginBottom: SPACING.xs },
  checklistRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checklistItemTextWrap: { flex: 1 },
  checklistItemText: { fontSize: 13, color: COLORS.textPrimary },
  checklistItemChecked: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  checklistItemInput: { flex: 1, fontSize: 13, color: COLORS.textPrimary, padding: 0 },
  checklistAddRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  checklistAddInput: { flex: 1, fontSize: 13, color: COLORS.textPrimary, padding: 0 },
  checklistAddBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 1, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary },
  checklistAddBtnDisabled: { backgroundColor: COLORS.divider },
  checklistAddBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.surface },
  checklistAddBtnTextDisabled: { color: COLORS.textMuted },
});
