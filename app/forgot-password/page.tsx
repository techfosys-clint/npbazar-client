'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { apiForgotPassword, apiResetPassword } from '@/lib/auth';

const inputCls =
  'w-full rounded-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10';
const btnCls =
  'w-full rounded-[8px] bg-[var(--btn-color)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-90 disabled:opacity-60';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [mobileDigits, setMobileDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fullMobile = `+880${mobileDigits}`;

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^1[3-9]\d{8}$/.test(mobileDigits)) {
      setError('Enter a valid 10-digit Bangladeshi mobile number after +880');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiForgotPassword(fullMobile);
      setNotice(`An OTP has been sent to ${fullMobile}.`);
      setStep('reset');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await apiResetPassword(fullMobile, otp, password);
      setStep('done');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    setError('');
    try {
      await apiForgotPassword(fullMobile);
      setNotice('A new OTP has been sent.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-20 text-center">
        <FiCheckCircle size={56} className="text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">Password Reset!</h1>
        <p className="mt-2 text-sm text-zinc-600">Your password has been changed and you&apos;re signed in.</p>
        <button
          type="button"
          onClick={() => router.push('/account')}
          className="mt-6 rounded-[8px] bg-[var(--btn-color)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-90"
        >
          Go to My Account
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-14">
      <div className="rounded-[8px] border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-bold text-zinc-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {step === 'request'
            ? "Enter your mobile number and we'll send an OTP to reset your password."
            : `Enter the OTP sent to ${fullMobile} and choose a new password.`}
        </p>

        {notice && <p className="mt-4 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}
        {error && <p className="mt-4 rounded-[8px] bg-red-50 px-3 py-2 text-sm text-[var(--primary)]">{error}</p>}

        {step === 'request' && (
          <form onSubmit={handleRequest} className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Mobile number *</label>
              <div className="flex">
                <span className="flex shrink-0 items-center rounded-l-[8px] border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-600">
                  +880
                </span>
                <input
                  value={mobileDigits}
                  onChange={(e) => setMobileDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="1XXXXXXXXX"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-r-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={busy} className={btnCls}>
              {busy ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset} className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">OTP code</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className={inputCls} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={inputCls}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Confirm new password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className={inputCls}
                required
                minLength={6}
              />
            </div>
            <button type="submit" disabled={busy} className={btnCls}>
              {busy ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={handleResend} disabled={busy} className="w-full text-sm font-medium text-[var(--primary)] hover:underline">
              Resend OTP
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-zinc-500">
          <Link href="/account" className="font-medium text-[var(--primary)] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
