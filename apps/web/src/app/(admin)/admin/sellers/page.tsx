'use client';
import { AuthGuard } from '@/features/auth/auth-guard'; import { DashboardShell } from '@/components/layout/dashboard-shell'; import { AdminAccounts } from '@/features/admin/admin-accounts';
export default function AdminSellersPage() { return <AuthGuard role="admin"><DashboardShell role="admin" title="Seller accounts" description="Search sellers and inspect their account, outlet, campus, and order information."><AdminAccounts kind="sellers" /></DashboardShell></AuthGuard>; }
