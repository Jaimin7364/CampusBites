'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { apiClient } from '@/services/api-client';
import { getApiError, getFieldErrors } from './form-utils';

export function ForgotPasswordForm() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setFieldError(''); setSubmitting(true);
    const email = new FormData(event.currentTarget).get('email');
    try {
      const result = await apiClient<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setMessage(result.message);
    } catch (requestError) {
      setError(getApiError(requestError)); setFieldError(getFieldErrors(requestError).email ?? '');
    } finally { setSubmitting(false); }
  }

  if (message) return <div className="space-y-5"><Alert tone="success">{message}</Alert><p className="text-sm leading-6 text-stone-600">Development reset links appear in the API terminal. Production delivery will use the configured mail provider.</p><Link href="/login" className="inline-flex font-semibold text-brand-orange-600 hover:underline">Return to sign in</Link></div>;
  return <form onSubmit={submit} className="space-y-5" noValidate>{error && <Alert>{error}</Alert>}<FormField label="Account email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required error={fieldError} /><Button className="w-full" disabled={submitting}>{submitting ? 'Sending…' : 'Send reset instructions'}</Button><p className="text-center text-sm"><Link href="/login" className="font-semibold text-brand-orange-600 hover:underline">Back to sign in</Link></p></form>;
}
