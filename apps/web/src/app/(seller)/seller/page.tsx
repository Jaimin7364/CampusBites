'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function SellerHome() {
  return <AuthGuard role="seller"><DashboardShell role="seller" title="Run your campus outlet with less friction." description="Your seller account is ready. Outlet onboarding and approval arrive in Module 3."><div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6"><p className="font-semibold text-green-800">Seller identity verified</p><p className="mt-2 text-sm leading-6 text-stone-600">You’ll be able to add your food outlet after university management is available.</p></div></DashboardShell></AuthGuard>;
}
