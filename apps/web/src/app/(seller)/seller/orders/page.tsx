'use client';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard } from '@/features/auth/auth-guard';
import { SellerOrderWorkspace } from '@/features/orders/seller-order-workspace';
export default function SellerOrdersPage() { return <AuthGuard role="seller"><DashboardShell role="seller" title="Keep every order moving." description="Review incoming orders, collect cash, and move each meal through the preparation queue."><SellerOrderWorkspace /></DashboardShell></AuthGuard>; }
