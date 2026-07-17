import { API_BASE_URL } from '@/lib/api';

// Customer auth backed by the server's JWT API (/api/user/*). The token lives
// in localStorage; components subscribe to AUTH_EVENT to react to login/logout.
const TOKEN_KEY = 'ecomus_token';
const USER_KEY = 'ecomus_user';
const AUTH_EVENT = 'auth-changed';

export interface AuthUser {
  id: string;
  name: string;
  mobile?: string;
  email?: string;
  address?: string;
  isPhoneVerified: boolean;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribeAuth(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

// Fetch wrapper that attaches the Bearer token and surfaces API error messages.
export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Request failed (${res.status})`) as Error & {
      requiresVerification?: boolean;
    };
    err.requiresVerification = data.requiresVerification;
    throw err;
  }
  return data as T;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

/**
 * Register with a mobile number — always goes through the OTP flow (no token
 * returned here; call apiVerifyOtp once the user enters the code).
 */
export async function apiRegister(body: {
  name: string;
  mobile: string;
  email?: string;
  password: string;
  address?: string;
}) {
  const data = await authFetch<{ success: boolean; message: string; userId?: string; token?: string; user?: AuthUser }>(
    '/user/register',
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (data.token && data.user) saveSession(data.token, data.user);
  return data;
}

export async function apiVerifyOtp(mobile: string, otp: string) {
  const data = await authFetch<AuthResponse>('/user/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ mobile, otp }),
  });
  saveSession(data.token, data.user);
  return data;
}

export async function apiResendOtp(mobile: string) {
  return authFetch<{ success: boolean; message: string }>('/user/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ mobile }),
  });
}

/** Log in with a mobile number only. */
export async function apiLogin(mobile: string, password: string) {
  const data = await authFetch<AuthResponse>('/user/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, password }),
  });
  saveSession(data.token, data.user);
  return data;
}

/** Request a password-reset OTP for a mobile number. */
export async function apiForgotPassword(mobile: string) {
  return authFetch<{ success: boolean; message: string }>('/user/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ mobile }),
  });
}

/** Confirm the OTP and set a new password — signs the user in on success. */
export async function apiResetPassword(mobile: string, otp: string, password: string) {
  const data = await authFetch<AuthResponse>('/user/reset-password', {
    method: 'POST',
    body: JSON.stringify({ mobile, otp, password }),
  });
  saveSession(data.token, data.user);
  return data;
}
