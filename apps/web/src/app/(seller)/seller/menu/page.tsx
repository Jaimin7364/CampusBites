'use client';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard } from '@/features/auth/auth-guard';
import { SellerMenuManager } from '@/features/menu/seller-menu-manager';

export default function SellerMenuPage() {
  return <AuthGuard role="seller"><DashboardShell role="seller" title="Build a menu students can trust." description="Add dishes, keep availability current, and put your best items first."><SellerMenuManager /></DashboardShell></AuthGuard>;
}
