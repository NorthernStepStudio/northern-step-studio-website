'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const normalizeAuthError = (message: string | undefined) => {
    if (!message) return 'Authentication failed.';
    if (/fetch failed|failed to fetch|network request failed/i.test(message)) {
      return 'Authentication service is unreachable. Check the configured Supabase URL and key.';
    }
    return message;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    if (mode === 'sign_up') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined,
        },
      });

      if (signUpError) {
        setError(normalizeAuthError(signUpError.message));
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push('/dashboard');
        router.refresh();
        return;
      }

      setNotice('Account created. Check your email to confirm your account, then sign in.');
      setMode('sign_in');
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(normalizeAuthError(signInError.message));
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-8 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Home Inventory
          </p>
          <div className="inline-flex w-fit rounded-full border border-[color:var(--card-border)] bg-white p-1">
            <button
              type="button"
              onClick={() => {
                setMode('sign_in');
                setError(null);
                setNotice(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'sign_in'
                  ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                  : 'text-[color:var(--muted)]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('sign_up');
                setError(null);
                setNotice(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'sign_up'
                  ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                  : 'text-[color:var(--muted)]'
              }`}
            >
              Sign up
            </button>
          </div>
          <h1 className="text-2xl font-semibold">
            {mode === 'sign_in' ? 'Sign in to continue' : 'Create your account'}
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            {mode === 'sign_in'
              ? 'Secure, privacy-first inventory for insurance-ready exports.'
              : 'Create a secure inventory workspace for claim-ready exports and document recovery.'}
          </p>
        </div>
        <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
          {notice && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {mode === 'sign_up' && (
            <input
              className="rounded-2xl border border-[color:var(--card-border)] bg-white px-4 py-3 text-sm outline-none"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            className="rounded-2xl border border-[color:var(--card-border)] bg-white px-4 py-3 text-sm outline-none"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
          <input
            className="rounded-2xl border border-[color:var(--card-border)] bg-white px-4 py-3 text-sm outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
            required
          />
          {mode === 'sign_up' && (
            <input
              className="rounded-2xl border border-[color:var(--card-border)] bg-white px-4 py-3 text-sm outline-none"
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-2xl bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-[color:var(--primary-foreground)] disabled:opacity-50"
          >
            {loading
              ? mode === 'sign_in'
                ? 'Signing in...'
                : 'Creating account...'
              : mode === 'sign_in'
                ? 'Continue'
                : 'Create account'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in');
            setError(null);
            setNotice(null);
          }}
          className="mt-4 text-sm font-medium text-[color:var(--primary)]"
        >
          {mode === 'sign_in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
        <div className="mt-6 text-xs text-[color:var(--muted)]">
          By continuing, you agree to the data export policy.
        </div>
      </div>
    </div>
  );
}
