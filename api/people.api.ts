import {get, post, put, del} from './base.api';
import {PEOPLE} from './apiRoutes';

export const fetchPeople = () => get<any[]>(`${PEOPLE}/`);

export const createPerson = ({name}: {name: string}) =>
  post(`${PEOPLE}/`, {name});

export const deletePerson = ({personId}: {personId: number}) =>
  del(`${PEOPLE}/${personId}`);

export const fetchCategories = ({personId}: {personId: number}) =>
  get<any[]>(`${PEOPLE}/${personId}/categories`);

export const createCategory = ({
  personId,
  name,
  subcategoryNames,
}: {
  personId: number;
  name: string;
  subcategoryNames: string[];
}) => post(`${PEOPLE}/${personId}/categories`, {name, subcategoryNames});

export const updateCategory = ({
  personId,
  id,
  name,
}: {
  personId: number;
  id: number;
  name: string;
}) => put(`${PEOPLE}/${personId}/categories/${id}`, {name});

export const deleteCategory = ({
  personId,
  id,
}: {
  personId: number;
  id: number;
}) => del(`${PEOPLE}/${personId}/categories/${id}`);

export const createSubcategory = ({
  personId,
  categoryId,
  name,
}: {
  personId: number;
  categoryId: number;
  name: string;
}) =>
  post(`${PEOPLE}/${personId}/categories/${categoryId}/subcategories`, {name});

export const updateSubcategory = ({
  personId,
  id,
  name,
}: {
  personId: number;
  id: number;
  name: string;
}) => put(`${PEOPLE}/${personId}/subcategories/${id}`, {name});

export const deleteSubcategory = ({
  personId,
  id,
}: {
  personId: number;
  id: number;
}) => del(`${PEOPLE}/${personId}/subcategories/${id}`);

export const fetchIdeas = ({
  personId,
  categoryId,
  subcategoryId,
}: {
  personId: number;
  categoryId?: number;
  subcategoryId?: number;
}) => get<any[]>(`${PEOPLE}/${personId}/ideas`, {categoryId, subcategoryId});

export const createIdea = ({
  personId,
  title,
  categoryId,
  subcategoryId,
  notes,
}: {
  personId: number;
  title: string;
  categoryId: number;
  subcategoryId?: number;
  notes?: string;
}) =>
  post(`${PEOPLE}/${personId}/ideas`, {
    title,
    categoryId,
    subcategoryId,
    notes,
  });

export const updateIdea = ({
  personId,
  id,
  title,
  categoryId,
  subcategoryId,
  notes,
}: {
  personId: number;
  id: number;
  title: string;
  categoryId: number;
  subcategoryId?: number;
  notes?: string;
}) =>
  put(`${PEOPLE}/${personId}/ideas/${id}`, {
    title,
    categoryId,
    subcategoryId,
    notes,
  });

export const deleteIdea = ({personId, id}: {personId: number; id: number}) =>
  del(`${PEOPLE}/${personId}/ideas/${id}`);
