'use client';
import { AuthGuard } from '@/features/auth/auth-guard'; import { DashboardShell } from '@/components/layout/dashboard-shell'; import { AdminAccounts } from '@/features/admin/admin-accounts';
export default function AdminUsersPage() { return <AuthGuard role="admin"><DashboardShell role="admin" title="Student accounts" description="Search students and inspect safe account and ordering information."><AdminAccounts kind="users" /></DashboardShell></AuthGuard>; }
