import axios from 'axios';
import { getToken } from '../lib/tokenStorage';

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

// Attach Bearer token to every request if one exists
axios.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, trigger logout so the app returns to the login screen
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export const get = async <T>(
  route: string,
  params?: { [key: string]: boolean | string | number | object | undefined }
): Promise<T> => {
  const response = await axios.get(route, { params, headers });
  return response.data;
};

export const post = async <T>(
  route: string,
  data?: { [key: string]: boolean | string | number | object | undefined }
): Promise<T> => {
  const response = await axios.post(route, data, { headers });
  return response.data;
};

export const put = async <T>(
  route: string,
  data?: { [key: string]: boolean | string | number | object | undefined }
): Promise<T> => {
  const response = await axios.put(route, data, { headers });
  return response.data;
};

export const del = async <T>(
  route: string,
  data?: { [key: string]: boolean | string | number | object | undefined }
): Promise<T> => {
  const response = await axios.delete(route, { data, headers });
  return response.data;
};
