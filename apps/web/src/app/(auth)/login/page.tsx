import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GuestGuard } from '@/features/auth/auth-guard';
import { AuthShell } from '@/features/auth/auth-shell';
import { LoginForm } from '@/features/auth/login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return <GuestGuard><AuthShell eyebrow="Welcome back" title="Sign in to CampusBites" description="Use one secure account for your CampusBites portal."><Suspense fallback={<p>Loading sign in…</p>}><LoginForm /></Suspense></AuthShell></GuestGuard>;
}
