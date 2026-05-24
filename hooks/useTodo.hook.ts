import { useState } from 'react';
import * as todoApi from '../api/todo.api';

export type TodoSubcategory = { id: number; name: string; categoryId: number };
export type TodoCategory = { id: number; name: string; subcategories: TodoSubcategory[]; itemCount: number };
export type ChecklistItem = { id: number; text: string; checked: boolean };

export type TemplateChecklistItem = { id: number; text: string };

export type TodoTemplate = {
  id: number;
  title: string;
  notes?: string;
  frequency: 'one_time' | 'daily' | 'weekly' | 'monthly';
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategoryName?: string;
  checklistItems?: TemplateChecklistItem[];
};

export type TodoHistoryItem = {
  id: number;
  title: string;
  frequency: 'one_time' | 'daily' | 'weekly' | 'monthly';
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategoryName?: string;
  completedAt: string;
};

export type TodoTask = {
  id: number;
  templateId: number;
  title: string;
  notes?: string;
  frequency: 'one_time' | 'daily' | 'weekly' | 'monthly';
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategoryName?: string;
  completed: boolean;
  addedAt: string;
  checklistItems?: ChecklistItem[];
};

function useTodo() {
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [templates, setTemplates] = useState<TodoTemplate[]>([]);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [history, setHistory] = useState<TodoHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      const data = await todoApi.fetchCategories();
      setCategories(data as TodoCategory[]);
    } catch (e) {
      console.error('fetchCategories', e);
    }
  };

  const fetchTemplates = async (categoryId?: number, subcategoryId?: number) => {
    setLoading(true);
    try {
      const data = await todoApi.fetchTemplates(categoryId, subcategoryId);
      setTemplates(data as TodoTemplate[]);
    } catch (e) {
      console.error('fetchTemplates', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (categoryId?: number, subcategoryId?: number) => {
    setLoading(true);
    try {
      const data = await todoApi.fetchTasks(categoryId, subcategoryId);
      setTasks(data as TodoTask[]);
    } catch (e) {
      console.error('fetchTasks', e);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, subcategoryNames: string[]) => {
    await todoApi.createCategory(name, subcategoryNames);
    await fetchCategories();
  };

  const createSubcategory = async (categoryId: number, name: string) => {
    await todoApi.createSubcategory(categoryId, name);
    await fetchCategories();
  };

  const updateCategory = async (id: number, name: string) => {
    await todoApi.updateCategory(id, name);
    await fetchCategories();
  };

  const updateSubcategory = async (id: number, name: string) => {
    await todoApi.updateSubcategory(id, name);
    await fetchCategories();
  };

  const deleteSubcategory = async (id: number) => {
    await todoApi.deleteSubcategory(id);
    await fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    await todoApi.deleteCategory(id);
    await fetchCategories();
  };

  const createTemplate = async (data: {
    title: string; notes?: string; categoryId: number; subcategoryId?: number; frequency: string; checklistItems?: string[];
  }) => {
    const result = await todoApi.createTemplate(data) as { id: number };
    return result?.id ?? null;
  };

  const updateTemplate = async (id: number, data: {
    title: string; notes?: string; categoryId: number; subcategoryId?: number; frequency: string; checklistItems?: string[];
  }) => {
    await todoApi.updateTemplate(id, data);
  };

  const deleteTemplate = async (id: number) => {
    await todoApi.deleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const fetchHistory = async (categoryId?: number, subcategoryId?: number) => {
    setLoading(true);
    try {
      const data = await todoApi.fetchHistory(categoryId, subcategoryId);
      setHistory(data as TodoHistoryItem[]);
    } catch (e) {
      console.error('fetchHistory', e);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (templateId: number) => {
    await todoApi.addTask(templateId);
  };

  const addDirectTask = async (data: {
    title: string; notes?: string; categoryId: number; subcategoryId?: number;
  }) => {
    await todoApi.addDirectTask({ ...data, frequency: 'one_time' });
  };

  const addTaskWithTemplate = async (data: {
    title: string; notes?: string; categoryId: number; subcategoryId?: number; frequency: string; checklistItems?: string[];
  }) => {
    const templateId = await createTemplate(data);
    if (templateId) await todoApi.addTask(templateId);
  };

  const completeTask = async (id: number) => {
    await todoApi.completeTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const removeTask = async (id: number) => {
    await todoApi.removeTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteHistoryItem = async (id: number) => {
    await todoApi.removeTask(id);
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const addChecklistItem = async (taskId: number, text: string) => {
    const item = await todoApi.addChecklistItem(taskId, text) as ChecklistItem;
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, checklistItems: [...(t.checklistItems ?? []), item] } : t
    ));
  };

  const toggleChecklistItem = async (taskId: number, itemId: number, checked: boolean) => {
    await todoApi.updateChecklistItem(itemId, { checked });
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, checklistItems: t.checklistItems?.map(i => i.id === itemId ? { ...i, checked } : i) }
        : t
    ));
  };

  const updateChecklistItemText = async (taskId: number, itemId: number, text: string) => {
    await todoApi.updateChecklistItem(itemId, { text });
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, checklistItems: t.checklistItems?.map(i => i.id === itemId ? { ...i, text } : i) }
        : t
    ));
  };

  const removeChecklistItem = async (taskId: number, itemId: number) => {
    await todoApi.deleteChecklistItem(itemId);
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, checklistItems: t.checklistItems?.filter(i => i.id !== itemId) } : t
    ));
  };

  return {
    categories, templates, tasks, history, loading,
    fetchCategories, fetchTemplates, fetchTasks, fetchHistory,
    createCategory, createSubcategory,
    updateCategory, updateSubcategory, deleteSubcategory, deleteCategory,
    createTemplate, updateTemplate, deleteTemplate,
    addTask, addDirectTask, addTaskWithTemplate, completeTask, removeTask, deleteHistoryItem,
    addChecklistItem, toggleChecklistItem, updateChecklistItemText, removeChecklistItem,
  };
}

export default useTodo;
