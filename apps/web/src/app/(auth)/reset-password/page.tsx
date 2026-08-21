import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GuestGuard } from '@/features/auth/auth-guard';
import { AuthShell } from '@/features/auth/auth-shell';
import { ResetPasswordForm } from '@/features/auth/reset-password-form';

export const metadata: Metadata = { title: 'Reset password' };
export default function ResetPasswordPage() {
  return <GuestGuard><AuthShell eyebrow="Secure reset" title="Choose a new password" description="A successful reset signs out every existing CampusBites session."><Suspense fallback={<p>Loading reset form…</p>}><ResetPasswordForm /></Suspense></AuthShell></GuestGuard>;
}
