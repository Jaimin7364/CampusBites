'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api-client';
import { getApiError, getFieldErrors } from './form-utils';
import { PasswordInput } from './password-input';

export function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState(token ? '' : 'This reset link is missing its token.');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setFields({}); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiClient<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password: form.get('password'), confirmPassword: form.get('confirmPassword') }) });
      setMessage(result.message);
    } catch (requestError) { setError(getApiError(requestError)); setFields(getFieldErrors(requestError)); }
    finally { setSubmitting(false); }
  }

  if (message) return <div className="space-y-5"><Alert tone="success">{message}</Alert><Link href="/login" className="inline-flex rounded-xl bg-brand-orange-500 px-5 py-3 font-semibold text-white">Sign in with new password</Link></div>;
  return <form onSubmit={submit} className="space-y-5" noValidate>{error && <Alert>{error}</Alert>}<PasswordInput label="New password" name="password" autoComplete="new-password" placeholder="Create a new password" required error={fields.password} hint="At least 8 characters with uppercase, lowercase, and a number." /><PasswordInput label="Confirm new password" name="confirmPassword" autoComplete="new-password" placeholder="Repeat the new password" required error={fields.confirmPassword} /><Button className="w-full" disabled={submitting || !token}>{submitting ? 'Resetting…' : 'Reset password'}</Button></form>;
}
