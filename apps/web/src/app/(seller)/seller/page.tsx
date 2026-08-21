'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SellerOutletWorkspace } from '@/features/hotels/seller-outlet-workspace';

export default function SellerHome() {
  return <AuthGuard role="seller"><DashboardShell role="seller" title="Run your campus outlet with less friction." description="Create your outlet, follow its approval status, and respond to admin feedback."><SellerOutletWorkspace /></DashboardShell></AuthGuard>;
}
