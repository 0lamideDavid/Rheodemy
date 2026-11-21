"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  ApiError,
  clearStoredAuth,
  getStoredToken,
  storeToken,
  USER_KEY,
  type AuthUser,
  type BackendRole,
  type RegisterInput,
} from "@/lib/api";

type UiRole = "learner" | "creator" | "admin";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  role: UiRole | null;
  isCreator: boolean;
  displayName: string;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapRole(role: BackendRole | undefined | null): UiRole | null {
  if (role === "INSTRUCTOR") return "creator";
  if (role === "ADMIN") return "admin";
  if (role === "STUDENT") return "learner";
  return null;
}

function fullName(user: AuthUser): string {
  return (
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
  );
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback((nextUser: AuthUser, nextToken: string) => {
    storeToken(nextToken);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    if (!getStoredToken()) return null;
    try {
      const { user: fresh } = await api.auth.me();
      setUser(fresh);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_KEY, JSON.stringify(fresh));
      }
      return fresh;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
      }
      return null;
    }
  }, [logout]);

  useEffect(() => {
    const savedToken = getStoredToken();
    if (!savedToken || isTokenExpired(savedToken)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      logout();
      setIsLoading(false);
      return;
    }

    const stored = readStoredUser();
    if (stored) {
      setToken(savedToken);
      setUser(stored);
    }

    refreshUser().finally(() => setIsLoading(false));
  }, [logout, refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await api.auth.login(email, password);
      persist(result.user, result.token);
      return result.user;
    },
    [persist]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await api.auth.register(input);
      persist(result.user, result.token);
      return result.user;
    },
    [persist]
  );

  const role = mapRole(user?.role);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      role,
      isCreator: role === "creator",
      displayName: user ? fullName(user) : "",
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [token, user, role, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
