'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AdminOutletManager } from '@/features/hotels/admin-outlet-manager';

export default function AdminOutletsPage() {
  return <AuthGuard role="admin"><DashboardShell role="admin" title="Review campus food outlets." description="Approve complete applications, send useful rejection feedback, and manage approved marketplace visibility."><AdminOutletManager /></DashboardShell></AuthGuard>;
}
