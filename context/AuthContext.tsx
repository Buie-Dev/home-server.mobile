import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, fetchMyPermissions } from '../api/auth.api';
import { setUnauthorizedHandler } from '../api/base.api';
import { clearToken, getToken, setToken } from '../lib/tokenStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  hasPermission: (page: string) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  const logout = async () => {
    await clearToken();
    setIsAuthenticated(false);
    setPermissions([]);
  };

  const loadPermissions = async (): Promise<void> => {
    try {
      const result = await fetchMyPermissions();
      setPermissions(result.pages);
    } catch {
      setPermissions([]);
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);

    getToken().then(async (token) => {
      if (token) {
        setIsAuthenticated(true);
        await loadPermissions();
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    const { token } = await loginRequest(username, password);
    await setToken(token);
    setIsAuthenticated(true);
    await loadPermissions();
  };

  const hasPermission = (page: string): boolean => permissions.includes(page);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, permissions, hasPermission, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
