import { get, post, put, del } from './base.api';
import { TODO } from './apiRoutes';

export const fetchCategories = () => get<any[]>(`${TODO}/categories`);
export const createCategory = (name: string, subcategoryNames: string[]) =>
  post(`${TODO}/categories`, { name, subcategoryNames });
export const updateCategory = (id: number, name: string) =>
  put(`${TODO}/categories/${id}`, { name });
export const deleteCategory = (id: number) => del(`${TODO}/categories/${id}`);
export const createSubcategory = (categoryId: number, name: string) =>
  post(`${TODO}/categories/${categoryId}/subcategories`, { name });
export const updateSubcategory = (id: number, name: string) =>
  put(`${TODO}/subcategories/${id}`, { name });
export const deleteSubcategory = (id: number) => del(`${TODO}/subcategories/${id}`);

export const fetchTemplates = (categoryId?: number, subcategoryId?: number) =>
  get<any[]>(`${TODO}/templates`, { categoryId, subcategoryId });
export const createTemplate = (data: {
  title: string; notes?: string; categoryId: number; subcategoryId?: number; frequency: string; checklistItems?: string[];
}) => post(`${TODO}/templates`, data);
export const updateTemplate = (id: number, data: {
  title: string; notes?: string; categoryId: number; subcategoryId?: number; frequency: string; checklistItems?: string[];
}) => put(`${TODO}/templates/${id}`, data);
export const deleteTemplate = (id: number) => del(`${TODO}/templates/${id}`);

export const fetchHistory = (categoryId?: number, subcategoryId?: number) =>
  get<any[]>(`${TODO}/history`, { categoryId, subcategoryId });

export const fetchTasks = (categoryId?: number, subcategoryId?: number) =>
  get<any[]>(`${TODO}/tasks`, { categoryId, subcategoryId });
export const addTask = (templateId: number) => post(`${TODO}/tasks`, { templateId });
export const addDirectTask = (data: {
  title: string; notes?: string; categoryId: number; subcategoryId?: number; frequency: string;
}) => post(`${TODO}/tasks/direct`, data);
export const completeTask = (id: number) => put(`${TODO}/tasks/${id}/complete`, {});
export const removeTask = (id: number) => del(`${TODO}/tasks/${id}`);

export const addChecklistItem = (taskId: number, text: string) =>
  post<any>(`${TODO}/tasks/${taskId}/checklist`, { text });
export const updateChecklistItem = (itemId: number, data: { text?: string; checked?: boolean }) =>
  put(`${TODO}/checklist/${itemId}`, data);
export const deleteChecklistItem = (itemId: number) => del(`${TODO}/checklist/${itemId}`);
