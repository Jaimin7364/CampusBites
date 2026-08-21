'use client';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard } from '@/features/auth/auth-guard';
import { MyOrders } from '@/features/orders/my-orders';
export default function MyOrdersPage() { return <AuthGuard role="user"><DashboardShell role="user" title="Follow every meal." description="Track active orders live and revisit your completed or cancelled orders."><MyOrders /></DashboardShell></AuthGuard>; }
