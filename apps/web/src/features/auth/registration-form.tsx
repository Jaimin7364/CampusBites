'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { apiClient } from '@/services/api-client';
import type { AuthResponse } from '@/types/auth';
import { useAuth } from './auth-context';
import { getApiError, getFieldErrors } from './form-utils';
import { PasswordInput } from './password-input';

export function RegistrationForm({ kind }: { kind: 'user' | 'seller' }) {
  const router = useRouter();
  const { acceptSession } = useAuth();
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setFields({}); setSubmitting(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const session = await apiClient<AuthResponse>(`/auth/register/${kind}`, { method: 'POST', body: JSON.stringify(data) });
      acceptSession(session);
      router.replace(`/${session.user.role}`);
    } catch (requestError) {
      setError(getApiError(requestError)); setFields(getFieldErrors(requestError));
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error && <Alert>{error}</Alert>}
      {kind === 'user' ? (
        <FormField label="Full name" name="fullName" autoComplete="name" placeholder="Aarav Shah" required error={fields.fullName} />
      ) : (
        <>
          <FormField label="Seller or business name" name="sellerName" autoComplete="organization" placeholder="Campus Cafe" required error={fields.sellerName} />
          <FormField label="Business owner name" name="businessOwnerName" autoComplete="name" placeholder="Meera Patel" required error={fields.businessOwnerName} />
        </>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" required error={fields.email} />
        <FormField label="Mobile number" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="9876543210" required error={fields.phone} />
      </div>
      <PasswordInput label="Password" name="password" autoComplete="new-password" placeholder="Create a password" required hint="At least 8 characters with uppercase, lowercase, and a number." error={fields.password} />
      <PasswordInput label="Confirm password" name="confirmPassword" autoComplete="new-password" placeholder="Repeat your password" required error={fields.confirmPassword} />
      <Button className="w-full" disabled={submitting}>{submitting ? 'Creating account…' : `Create ${kind === 'user' ? 'student' : 'seller'} account`}</Button>
      <p className="text-center text-sm text-stone-600">Already have an account? <Link href="/login" className="font-semibold text-brand-orange-600 hover:underline">Sign in</Link></p>
    </form>
  );
}
