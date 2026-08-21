'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { UniversityManager } from '@/features/universities/university-manager';

export default function AdminHome() {
  return <AuthGuard role="admin"><DashboardShell role="admin" title="Manage CampusBites campuses." description="Add universities, keep their details current, and control which campuses users can select."><UniversityManager /></DashboardShell></AuthGuard>;
}
