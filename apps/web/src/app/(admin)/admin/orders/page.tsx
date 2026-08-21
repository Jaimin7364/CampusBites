'use client';
import { AuthGuard } from '@/features/auth/auth-guard'; import { DashboardShell } from '@/components/layout/dashboard-shell'; import { AdminOrders } from '@/features/admin/admin-orders';
export default function AdminOrdersPage() { return <AuthGuard role="admin"><DashboardShell role="admin" title="Platform orders" description="Search and filter every order without changing completed transaction history."><AdminOrders /></DashboardShell></AuthGuard>; }
