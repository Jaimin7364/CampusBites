'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SellerOutletWorkspace } from '@/features/hotels/seller-outlet-workspace';
import { SellerOrderOverview } from '@/features/orders/seller-order-overview';

export default function SellerHome() {
  return <AuthGuard role="seller"><DashboardShell role="seller" title="Run your campus outlet with less friction." description="Manage your outlet, menu, incoming orders, and daily sales from one seller portal."><SellerOrderOverview /><SellerOutletWorkspace /></DashboardShell></AuthGuard>;
}
