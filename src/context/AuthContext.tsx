import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffUser, AuthTokens, AuthState } from '../types/auth';
import { getAuthTokens, getStaffUser, saveAuthTokens, saveStaffUser, clearAuthTokens } from '../utils/storage';
import { loginStaffUser } from '../api/auth';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    tokens: null,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadSavedAuth() {
      try {
        const tokens = await getAuthTokens();
        const user = await getStaffUser();
        if (isMounted) {
          if (tokens?.access && user) {
            setState({
              isAuthenticated: true,
              isLoading: false,
              user,
              tokens,
              error: null,
            });
          } else {
            setState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              tokens: null,
              error: null,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            tokens: null,
            error: null,
          });
        }
      }
    }
    loadSavedAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await loginStaffUser(username, password);
      const user: StaffUser = {
        username: res.username,
        role: res.role,
        role_display: res.role_display,
        employee_id: res.username,
        designation: res.role_display,
      };
      const tokens: AuthTokens = {
        access: res.access,
        refresh: res.refresh,
      };

      await saveAuthTokens(tokens);
      await saveStaffUser(user);

      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        tokens,
        error: null,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid credentials. Please try again.';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw new Error(message);
    }
  };

  const logout = async () => {
    await clearAuthTokens();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      tokens: null,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
