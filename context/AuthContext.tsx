import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest } from '../api/auth.api';
import { setUnauthorizedHandler } from '../api/base.api';
import { clearToken, getToken, setToken } from '../lib/tokenStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    await clearToken();
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Register logout as the 401 handler so any API call can trigger it
    setUnauthorizedHandler(logout);

    // Check for an existing valid token on startup
    getToken().then((token) => {
      setIsAuthenticated(!!token);
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    const { token } = await loginRequest(username, password);
    await setToken(token);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
