'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { apiClient } from '@/services/api-client';
import type { AuthResponse } from '@/types/auth';
import { roleHome } from '@/types/auth';
import { useAuth } from './auth-context';
import { getApiError, getFieldErrors } from './form-utils';
import { PasswordInput } from './password-input';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { acceptSession } = useAuth();
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setFields({}); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const session = await apiClient<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password'), rememberMe: form.get('rememberMe') === 'on' }),
      });
      acceptSession(session);
      const requested = searchParams.get('next');
      router.replace(requested?.startsWith(`/${session.user.role}`) ? requested : roleHome(session.user.role));
    } catch (requestError) {
      setError(getApiError(requestError)); setFields(getFieldErrors(requestError));
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error && <Alert>{error}</Alert>}
      <FormField label="Email address" name="email" type="email" autoComplete="email" placeholder="you@college.edu" required error={fields.email} />
      <PasswordInput label="Password" name="password" autoComplete="current-password" placeholder="Enter your password" required error={fields.password} />
      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-2 text-stone-600"><input type="checkbox" name="rememberMe" className="size-4 rounded border-stone-300 accent-orange-500" />Remember me</label>
        <Link href="/forgot-password" className="font-semibold text-brand-orange-600 hover:underline">Forgot password?</Link>
      </div>
      <Button className="w-full" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</Button>
      <div className="grid gap-3 border-t border-stone-200 pt-5 text-center text-sm sm:grid-cols-2">
        <Link href="/register" className="rounded-xl border border-stone-200 px-4 py-3 font-semibold hover:bg-white">Create student account</Link>
        <Link href="/seller/register" className="rounded-xl border border-stone-200 px-4 py-3 font-semibold hover:bg-white">Register as seller</Link>
      </div>
    </form>
  );
}
