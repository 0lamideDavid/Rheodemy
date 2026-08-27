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
    // Global fetch interceptor for 401 responses
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
      return response;
    };

    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        // Decode token to check expiry without verifying
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          if (window.location.pathname !== '/auth') window.location.href = '/auth';
        } else {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));

          // Validate token with backend /me endpoint
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          originalFetch(`${apiUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          }).then(res => {
            if (res.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              if (window.location.pathname !== '/auth') window.location.href = '/auth';
            }
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Failed to parse token or saved user", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    }
    
    setIsLoaded(true);

    return () => {
      window.fetch = originalFetch;
    };
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
