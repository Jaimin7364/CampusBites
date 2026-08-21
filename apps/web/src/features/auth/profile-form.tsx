'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { authenticatedApiClient, setAccessToken } from '@/services/api-client';
import type { AuthUser, UserRole } from '@/types/auth';
import { useAuth } from './auth-context';
import { getApiError, getFieldErrors } from './form-utils';
import { PasswordInput } from './password-input';

export function ProfileForm({ role }: { role: UserRole }) {
  const { user, updateUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  if (!user) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(''); setError(''); setFields({}); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const common = { phone: form.get('phone'), profilePhotoUrl: form.get('profilePhotoUrl') || null };
    const names = role === 'seller'
      ? { sellerName: form.get('sellerName'), businessOwnerName: form.get('businessOwnerName') }
      : { fullName: form.get('fullName') };
    try {
      const result = await authenticatedApiClient<{ user: AuthUser }>('/auth/me', { method: 'PATCH', body: JSON.stringify({ ...common, ...names }) });
      updateUser(result.user); setMessage('Profile updated successfully.');
    } catch (requestError) { setError(getApiError(requestError)); setFields(getFieldErrors(requestError)); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7" noValidate>
      <div><h2 className="text-xl font-bold">Profile details</h2><p className="mt-1 text-sm text-stone-500">Your email and account role cannot be changed here.</p></div>
      {message && <Alert tone="success">{message}</Alert>}{error && <Alert>{error}</Alert>}
      {role === 'seller' ? <div className="grid gap-5 sm:grid-cols-2"><FormField label="Seller or business name" name="sellerName" defaultValue={user.sellerName ?? ''} required error={fields.sellerName} /><FormField label="Business owner name" name="businessOwnerName" defaultValue={user.businessOwnerName ?? ''} required error={fields.businessOwnerName} /></div> : <FormField label="Full name" name="fullName" defaultValue={user.fullName ?? ''} required error={fields.fullName} />}
      <div className="grid gap-5 sm:grid-cols-2"><FormField label="Email address" value={user.email} disabled readOnly /><FormField label="Mobile number" name="phone" defaultValue={user.phone} required error={fields.phone} /></div>
      <FormField label="Profile photo URL" name="profilePhotoUrl" type="url" defaultValue={user.profilePhotoUrl ?? ''} placeholder="https://example.com/photo.jpg" error={fields.profilePhotoUrl} hint="Use a secure HTTPS image URL." />
      <Button disabled={submitting}>{submitting ? 'Saving…' : 'Save profile'}</Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const { logout } = useAuth();
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setFields({}); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await authenticatedApiClient('/auth/change-password', { method: 'PATCH', body: JSON.stringify({ currentPassword: form.get('currentPassword'), password: form.get('password'), confirmPassword: form.get('confirmPassword') }) });
      setAccessToken(null); await logout(); window.location.assign('/login?passwordChanged=true');
    } catch (requestError) { setError(getApiError(requestError)); setFields(getFieldErrors(requestError)); setSubmitting(false); }
  }

  return <form onSubmit={submit} className="space-y-5 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7" noValidate><div><h2 className="text-xl font-bold">Change password</h2><p className="mt-1 text-sm text-stone-500">This signs out all of your CampusBites sessions.</p></div>{error && <Alert>{error}</Alert>}<PasswordInput label="Current password" name="currentPassword" autoComplete="current-password" required error={fields.currentPassword} /><PasswordInput label="New password" name="password" autoComplete="new-password" required error={fields.password} hint="At least 8 characters with uppercase, lowercase, and a number." /><PasswordInput label="Confirm new password" name="confirmPassword" autoComplete="new-password" required error={fields.confirmPassword} /><Button variant="ghost" disabled={submitting}>{submitting ? 'Changing…' : 'Change password'}</Button></form>;
}
