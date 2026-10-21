import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth.api';
import * as baseApi from '../../api/base.api';
import * as tokenStorage from '../../lib/tokenStorage';

jest.mock('../../api/auth.api');
jest.mock('../../api/base.api');
jest.mock('../../lib/tokenStorage');

const mockedAuth = authApi as jest.Mocked<typeof authApi>;
const mockedToken = tokenStorage as jest.Mocked<typeof tokenStorage>;
const mockedBase = baseApi as jest.Mocked<typeof baseApi>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockedToken.getToken.mockResolvedValue(null);
  mockedToken.setToken.mockResolvedValue(undefined);
  mockedToken.clearToken.mockResolvedValue(undefined);
});

describe('AuthContext', () => {
  it('starts with isLoading true and isAuthenticated false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('restores auth from stored token on mount', async () => {
    mockedToken.getToken.mockResolvedValue('stored-token');
    mockedAuth.fetchMyPermissions.mockResolvedValue({ user_id: 1, pages: ['irrigation'] });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userId).toBe(1);
    expect(result.current.permissions).toEqual(['irrigation']);
  });

  it('login stores token and fetches permissions', async () => {
    mockedAuth.loginRequest.mockResolvedValue({ token: 'new-jwt' });
    mockedAuth.fetchMyPermissions.mockResolvedValue({ user_id: 2, pages: ['irrigation', 'rowing'] });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('user', 'pass');
    });

    expect(mockedAuth.loginRequest).toHaveBeenCalledWith('user', 'pass');
    expect(mockedToken.setToken).toHaveBeenCalledWith('new-jwt');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userId).toBe(2);
    expect(result.current.permissions).toEqual(['irrigation', 'rowing']);
  });

  it('logout clears token and resets state', async () => {
    mockedToken.getToken.mockResolvedValue('stored-token');
    mockedAuth.fetchMyPermissions.mockResolvedValue({ user_id: 1, pages: ['irrigation'] });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(mockedToken.clearToken).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userId).toBeNull();
    expect(result.current.permissions).toEqual([]);
  });

  it('hasPermission returns true for granted pages', async () => {
    mockedToken.getToken.mockResolvedValue('token');
    mockedAuth.fetchMyPermissions.mockResolvedValue({ user_id: 1, pages: ['irrigation', 'rowing'] });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasPermission('irrigation')).toBe(true);
    expect(result.current.hasPermission('admin')).toBe(false);
  });

  it('sets permissions to empty array when fetchMyPermissions fails', async () => {
    mockedToken.getToken.mockResolvedValue('token');
    mockedAuth.fetchMyPermissions.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.permissions).toEqual([]);
  });

  it('registers unauthorized handler on mount', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockedBase.setUnauthorizedHandler).toHaveBeenCalledWith(expect.any(Function));
  });
});
