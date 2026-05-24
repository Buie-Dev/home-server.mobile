import { get, post, put, del } from './base.api';
import { MEGAN } from './apiRoutes';

export const fetchCategories = () =>
  get<any[]>(`${MEGAN}/categories`);

export const createCategory = (name: string, subcategoryNames: string[]) =>
  post(`${MEGAN}/categories`, { name, subcategoryNames });

export const createSubcategory = (categoryId: number, name: string) =>
  post(`${MEGAN}/categories/${categoryId}/subcategories`, { name });

export const updateCategory = (id: number, name: string) =>
  put(`${MEGAN}/categories/${id}`, { name });

export const updateSubcategory = (id: number, name: string) =>
  put(`${MEGAN}/subcategories/${id}`, { name });

export const deleteSubcategory = (id: number) =>
  del(`${MEGAN}/subcategories/${id}`);

export const deleteCategory = (id: number) =>
  del(`${MEGAN}/categories/${id}`);

export const fetchIdeas = (categoryId?: number, subcategoryId?: number) =>
  get<any[]>(`${MEGAN}/ideas`, { categoryId, subcategoryId });

export const createIdea = (data: {
  title: string;
  categoryId: number;
  subcategoryId?: number;
  notes?: string;
}) => post(`${MEGAN}/ideas`, data);

export const updateIdea = (id: number, data: {
  title: string;
  categoryId: number;
  subcategoryId?: number;
  notes?: string;
}) => put(`${MEGAN}/ideas/${id}`, data);

export const toggleIdea = (id: number, completed: boolean) =>
  put(`${MEGAN}/ideas/${id}/toggle`, { completed });

export const deleteIdea = (id: number) =>
  del(`${MEGAN}/ideas/${id}`);
