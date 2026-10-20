import { get, post, put, del } from './base.api';
import { AUTH, ADMIN } from './apiRoutes';

interface LoginResponse {
  token: string;
}

export const loginRequest = (username: string, password: string): Promise<LoginResponse> => {
  console.log('[auth] POST', `${AUTH}/login`);
  return post<LoginResponse>(`${AUTH}/login`, { username, password });
};

export const fetchMyPermissions = (): Promise<{ user_id: number; pages: string[] }> =>
  get<{ user_id: number; pages: string[] }>(`${AUTH}/me/permissions`);

export const fetchAllUsers = (): Promise<{ id: number; username: string; permissions: Record<string, boolean> }[]> =>
  get(`${ADMIN}/users`);

export const setUserPermissions = (userId: number, permissions: Record<string, boolean>): Promise<void> =>
  put(`${ADMIN}/users/${userId}/permissions`, permissions);

export const createUser = ({ username, password }: { username: string; password: string }): Promise<{ id: number; username: string }> =>
  post(`${ADMIN}/users`, { username, password });

export const deleteUser = ({ userId }: { userId: number }): Promise<void> =>
  del(`${ADMIN}/users/${userId}`);
