'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AdminDashboardView } from '@/features/admin/admin-dashboard';

export default function AdminHome() {
  return <AuthGuard role="admin"><DashboardShell role="admin" title="Platform overview" description="Monitor CampusBites participation, outlet approvals, orders, and completed paid value."><AdminDashboardView /></DashboardShell></AuthGuard>;
}
