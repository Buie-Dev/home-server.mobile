import { useState } from 'react';
import * as peopleApi from '../api/people.api';

export type TrackedPerson = {
  id: number;
  name: string;
};

export type PersonSubcategory = {
  id: number;
  name: string;
  categoryId: number;
};

export type PersonCategory = {
  id: number;
  name: string;
  subcategories: PersonSubcategory[];
  ideaCount: number;
};

export type PersonIdea = {
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

function usePeople() {
  const [people, setPeople] = useState<TrackedPerson[]>([]);
  const [categories, setCategories] = useState<PersonCategory[]>([]);
  const [ideas, setIdeas] = useState<PersonIdea[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPeople = async () => {
    try {
      const data = await peopleApi.fetchPeople();
      setPeople(data as TrackedPerson[]);
    } catch (e) {
      console.error('fetchPeople', e);
    }
  };

  const addPerson = async ({ name }: { name: string }) => {
    await peopleApi.createPerson({ name });
    await fetchPeople();
  };

  const deletePerson = async ({ personId }: { personId: number }) => {
    await peopleApi.deletePerson({ personId });
    await fetchPeople();
  };

  const fetchCategories = async ({ personId }: { personId: number }) => {
    try {
      const data = await peopleApi.fetchCategories({ personId });
      setCategories(data as PersonCategory[]);
    } catch (e) {
      console.error('fetchCategories', e);
    }
  };

  const fetchIdeas = async ({ personId, categoryId, subcategoryId }: { personId: number; categoryId?: number; subcategoryId?: number }) => {
    setLoading(true);
    try {
      const data = await peopleApi.fetchIdeas({ personId, categoryId, subcategoryId });
      setIdeas(data as PersonIdea[]);
    } catch (e) {
      console.error('fetchIdeas', e);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async ({ personId, name, subcategoryNames }: { personId: number; name: string; subcategoryNames: string[] }) => {
    await peopleApi.createCategory({ personId, name, subcategoryNames });
    await fetchCategories({ personId });
  };

  const createSubcategory = async ({ personId, categoryId, name }: { personId: number; categoryId: number; name: string }) => {
    await peopleApi.createSubcategory({ personId, categoryId, name });
    await fetchCategories({ personId });
  };

  const updateCategory = async ({ personId, id, name }: { personId: number; id: number; name: string }) => {
    await peopleApi.updateCategory({ personId, id, name });
    await fetchCategories({ personId });
  };

  const updateSubcategory = async ({ personId, id, name }: { personId: number; id: number; name: string }) => {
    await peopleApi.updateSubcategory({ personId, id, name });
    await fetchCategories({ personId });
  };

  const deleteSubcategory = async ({ personId, id }: { personId: number; id: number }) => {
    await peopleApi.deleteSubcategory({ personId, id });
    await fetchCategories({ personId });
  };

  const deleteCategory = async ({ personId, id }: { personId: number; id: number }) => {
    await peopleApi.deleteCategory({ personId, id });
    await fetchCategories({ personId });
  };

  const createIdea = async ({ personId, title, categoryId, subcategoryId, notes }: { personId: number; title: string; categoryId: number; subcategoryId?: number; notes?: string }) => {
    await peopleApi.createIdea({ personId, title, categoryId, subcategoryId, notes });
  };

  const updateIdea = async ({ personId, id, title, categoryId, subcategoryId, notes }: { personId: number; id: number; title: string; categoryId: number; subcategoryId?: number; notes?: string }) => {
    await peopleApi.updateIdea({ personId, id, title, categoryId, subcategoryId, notes });
  };

  const deleteIdea = async ({ personId, id }: { personId: number; id: number }) => {
    await peopleApi.deleteIdea({ personId, id });
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  return {
    people,
    categories,
    ideas,
    loading,
    fetchPeople,
    addPerson,
    deletePerson,
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
    deleteIdea,
  };
}

export default usePeople;
