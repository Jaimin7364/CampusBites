'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { VendorDiscovery } from '@/features/hotels/vendor-discovery';

export default function UserHome() {
  return <AuthGuard role="user"><DashboardShell role="user" title="Your next campus meal starts here." description="Choose your campus, discover approved outlets, and browse their live menus."><div className="mt-8"><VendorDiscovery /></div></DashboardShell></AuthGuard>;
}
