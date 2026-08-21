'use client';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard } from './auth-guard';
import { ChangePasswordForm, ProfileForm } from './profile-form';
import type { UserRole } from '@/types/auth';

export function ProfilePage({ role }: { role: UserRole }) {
  return <AuthGuard role={role}><DashboardShell role={role} title="Your account" description="Keep your personal and security details current."><div className="mt-8 grid items-start gap-6 lg:grid-cols-2"><ProfileForm role={role} /><ChangePasswordForm /></div></DashboardShell></AuthGuard>;
}
