const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export const TOKEN_KEY = "rheodemy_token";
export const USER_KEY = "rheodemy_user";

export type BackendRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: BackendRole;
  status?: string;
}

export interface InstructorSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  contentUrl: string;
  durationSec: number;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  pricePerMinute: string | number;
  currency: string;
  thumbnailUrl?: string | null;
  status: string;
  instructorId: string;
  instructor?: InstructorSummary;
  lessons?: Lesson[];
  _count?: { lessons: number; enrollments: number };
}

export interface WalletBalance {
  learnerBalance: number;
  creatorBalance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  description: string;
  createdAt: string;
}

export interface SessionSummary {
  sessionId: string;
  status: string;
  totalPaid: number;
  currency: string;
  startedAt: string;
  endedAt: string | null;
  tickCount: number;
}

export interface InstructorSession {
  id: string;
  studentName: string;
  courseTitle: string;
  lessonTitle: string;
  totalPaid: number;
  durationSec: number;
  creatorEarnings: number;
  endedAt: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredAuth(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      "Cannot reach the Rheodemy server. Make sure the backend is running.",
      0
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | null;

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
    }
    throw new ApiError(
      payload?.message || `Request failed (${response.status})`,
      response.status
    );
  }

  return (payload?.data ?? payload) as T;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "STUDENT" | "INSTRUCTOR";
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ user: AuthUser; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (input: RegisterInput) =>
      apiFetch<{ user: AuthUser; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    me: () => apiFetch<{ user: AuthUser }>("/api/auth/me"),
  },
  courses: {
    list: () => apiFetch<Course[]>("/api/courses"),
    get: (id: string) => apiFetch<Course>(`/api/courses/${id}`),
    lessons: (id: string) => apiFetch<Lesson[]>(`/api/courses/${id}/lessons`),
    mine: () => apiFetch<Course[]>("/api/courses/me/instructor"),
    create: (input: {
      title: string;
      description: string;
      pricePerMinute: number;
      currency?: string;
      thumbnailUrl?: string;
    }) =>
      apiFetch<Course>("/api/courses", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    addLesson: (
      courseId: string,
      input: {
        title: string;
        description?: string;
        contentUrl: string;
        durationSec: number;
        order: number;
      }
    ) =>
      apiFetch<Lesson>(`/api/courses/${courseId}/lessons`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
  },
  enrollments: {
    mine: () => apiFetch<unknown[]>("/api/enrollments/me"),
    enroll: (courseId: string) =>
      apiFetch<unknown>("/api/enrollments", {
        method: "POST",
        body: JSON.stringify({ courseId }),
      }),
  },
  wallet: {
    balance: () => apiFetch<WalletBalance>("/api/wallet/balance"),
    transactions: () =>
      apiFetch<WalletTransaction[]>("/api/wallet/transactions"),
    pointer: () => apiFetch<{ pointerUrl: string }>("/api/wallet/pointer"),
  },
  sessions: {
    start: (courseId: string, lessonId?: string) =>
      apiFetch<{ sessionId: string }>("/api/sessions/start", {
        method: "POST",
        body: JSON.stringify({ courseId, lessonId }),
      }),
    end: (sessionId: string, totalAmount: number) =>
      apiFetch<SessionSummary>(`/api/sessions/${sessionId}/end`, {
        method: "POST",
        body: JSON.stringify({ totalAmount }),
      }),
    get: (sessionId: string) =>
      apiFetch<SessionSummary>(`/api/sessions/${sessionId}`),
    instructorHistory: (limit = 10) =>
      apiFetch<InstructorSession[]>(
        `/api/sessions/instructor/history?limit=${limit}`
      ),
  },
};

export { API_URL };
