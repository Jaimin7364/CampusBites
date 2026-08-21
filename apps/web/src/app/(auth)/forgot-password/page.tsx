import type { Metadata } from 'next';
import { GuestGuard } from '@/features/auth/auth-guard';
import { AuthShell } from '@/features/auth/auth-shell';
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Forgot password' };
export default function ForgotPasswordPage() {
  return <GuestGuard><AuthShell eyebrow="Account recovery" title="Reset your password" description="Enter your email and we’ll send instructions if an active account exists."><ForgotPasswordForm /></AuthShell></GuestGuard>;
}
