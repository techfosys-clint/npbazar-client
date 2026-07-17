import { API_BASE_URL } from '@/lib/api';

// Checkout phone verification — public endpoints, no account/token involved
// (unlike the login/register OTP flow in lib/auth.ts, this never logs anyone in).

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export function sendCheckoutOtp(mobile: string) {
  return request<{ success: boolean; message: string }>('/phone-verification/send', { mobile });
}

export function verifyCheckoutOtp(mobile: string, otp: string) {
  return request<{ success: boolean; message: string; token: string }>('/phone-verification/verify', { mobile, otp });
}
