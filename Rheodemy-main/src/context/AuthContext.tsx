'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'LEARNER' | 'CREATOR' | 'ADMIN' | null;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const login = (newToken: string, newUser: any) => {
    let mappedRole: 'LEARNER' | 'CREATOR' | 'ADMIN' | null = null;
    if (newUser.role === 'INSTRUCTOR' || newUser.role === 'CREATOR') {
      mappedRole = 'CREATOR';
    } else if (newUser.role === 'STUDENT' || newUser.role === 'LEARNER') {
      mappedRole = 'LEARNER';
    } else if (newUser.role === 'ADMIN') {
      mappedRole = 'ADMIN';
    }

    const mappedUser: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name || `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim() || 'User',
      role: mappedRole
    };

    setToken(newToken);
    setUser(mappedUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(mappedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!isLoaded) {
    return null; // Or a simple loader, but null is safest to prevent hydration mismatch
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
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
