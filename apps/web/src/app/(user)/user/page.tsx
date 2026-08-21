'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function UserHome() {
  return <AuthGuard role="user"><DashboardShell role="user" title="Your next campus meal starts here." description="Your account is ready. Campus selection and vendor discovery arrive in the next modules."><div className="mt-8 rounded-3xl border border-orange-200 bg-brand-orange-50 p-6"><p className="font-semibold text-brand-orange-600">Account setup complete</p><p className="mt-2 text-sm leading-6 text-stone-600">Module 2 will add active university selection to this dashboard.</p></div></DashboardShell></AuthGuard>;
}
