'use client';

import { createContext, useContext, useState, useSyncExternalStore, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CORRECT_PASSWORD = '2001';

// Empty subscription for useSyncExternalStore
const emptySubscribe = () => () => {};

function useLocalStorageAuth() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  
  const getAuthFromStorage = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('portfolio_auth') === 'true';
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync with localStorage on mount
  useSyncExternalStore(
    (onChange) => {
      const checkAuth = () => {
        const stored = localStorage.getItem('portfolio_auth');
        setIsAuthenticated(stored === 'true');
      };
      window.addEventListener('storage', checkAuth);
      checkAuth();
      return () => window.removeEventListener('storage', checkAuth);
    },
    () => getAuthFromStorage(),
    () => false
  );

  // Initialize from localStorage
  useState(() => {
    if (isClient) {
      setIsAuthenticated(getAuthFromStorage());
    }
  });

  const login = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolio_auth', 'true');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('portfolio_auth');
    }
  };

  return { isAuthenticated, login, logout };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useLocalStorageAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
