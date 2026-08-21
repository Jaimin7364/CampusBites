'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminHome() {
  return <AuthGuard role="admin"><DashboardShell role="admin" title="A clear view of the whole marketplace." description="Your protected admin session is active. University controls arrive in Module 2."><div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"><p className="font-semibold">Administration ready</p><p className="mt-2 text-sm leading-6 text-stone-600">Public admin registration remains disabled; accounts are managed through the secure seed process.</p></div></DashboardShell></AuthGuard>;
}
