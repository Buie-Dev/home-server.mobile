import { get, post } from './base.api';
import { AUTH } from './apiRoutes';

interface LoginResponse {
  token: string;
}

export const loginRequest = (username: string, password: string): Promise<LoginResponse> => {
  console.log('[auth] POST', `${AUTH}/login`);
  return post<LoginResponse>(`${AUTH}/login`, { username, password });
};

export const fetchMyPermissions = (): Promise<{ pages: string[] }> =>
  get<{ pages: string[] }>(`${AUTH}/me/permissions`);
