import type { Metadata } from 'next';
import { GuestGuard } from '@/features/auth/auth-guard';
import { AuthShell } from '@/features/auth/auth-shell';
import { RegistrationForm } from '@/features/auth/registration-form';

export const metadata: Metadata = { title: 'Student registration' };

export default function RegisterPage() {
  return <GuestGuard><AuthShell eyebrow="Student account" title="Food that moves with campus life" description="Create your account now. Campus selection and ordering arrive in the next modules."><RegistrationForm kind="user" /></AuthShell></GuestGuard>;
}
