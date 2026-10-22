import {useState} from 'react';
import * as meganApi from '../api/megan.api';
import {logger} from '../lib/logger';

export type MeganSubcategory = {
  id: number;
  name: string;
  categoryId: number;
};

export type MeganCategory = {
  id: number;
  name: string;
  subcategories: MeganSubcategory[];
  ideaCount: number;
};

export type MeganIdea = {
  id: number;
  title: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategoryName?: string;
};

function useMegan() {
  const [categories, setCategories] = useState<MeganCategory[]>([]);
  const [ideas, setIdeas] = useState<MeganIdea[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await meganApi.fetchCategories();
      setCategories(data as MeganCategory[]);
    } catch (e) {
      logger.error('fetchCategories', e);
    }
  };

  const fetchIdeas = async (categoryId?: number, subcategoryId?: number) => {
    setLoading(true);
    try {
      const data = await meganApi.fetchIdeas(categoryId, subcategoryId);
      setIdeas(data as MeganIdea[]);
    } catch (e) {
      logger.error('fetchIdeas', e);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, subcategoryNames: string[]) => {
    await meganApi.createCategory(name, subcategoryNames);
    await fetchCategories();
  };

  const createSubcategory = async (categoryId: number, name: string) => {
    await meganApi.createSubcategory(categoryId, name);
    await fetchCategories();
  };

  const updateCategory = async (id: number, name: string) => {
    await meganApi.updateCategory(id, name);
    await fetchCategories();
  };

  const updateSubcategory = async (id: number, name: string) => {
    await meganApi.updateSubcategory(id, name);
    await fetchCategories();
  };

  const deleteSubcategory = async (id: number) => {
    await meganApi.deleteSubcategory(id);
    await fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    await meganApi.deleteCategory(id);
    await fetchCategories();
  };

  const createIdea = async (data: {
    title: string;
    categoryId: number;
    subcategoryId?: number;
    notes?: string;
  }) => {
    await meganApi.createIdea(data);
    await fetchIdeas();
  };

  const updateIdea = async (
    id: number,
    data: {
      title: string;
      categoryId: number;
      subcategoryId?: number;
      notes?: string;
    },
  ) => {
    await meganApi.updateIdea(id, data);
    await fetchIdeas();
  };

  const toggleIdea = async (id: number, completed: boolean) => {
    await meganApi.toggleIdea(id, completed);
    setIdeas(prev => prev.map(i => (i.id === id ? {...i, completed} : i)));
  };

  const deleteIdea = async (id: number) => {
    await meganApi.deleteIdea(id);
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  return {
    categories,
    ideas,
    loading,
    fetchCategories,
    fetchIdeas,
    createCategory,
    createSubcategory,
    updateCategory,
    updateSubcategory,
    deleteSubcategory,
    deleteCategory,
    createIdea,
    updateIdea,
    toggleIdea,
    deleteIdea,
  };
}

export default useMegan;
