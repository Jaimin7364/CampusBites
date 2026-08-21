'use client';

import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CampusSelector } from '@/features/universities/campus-selector';

export default function UserHome() {
  return <AuthGuard role="user"><DashboardShell role="user" title="Your next campus meal starts here." description="Choose your campus so CampusBites can personalize the outlets and menus you see."><div className="mt-8"><CampusSelector /></div></DashboardShell></AuthGuard>;
}
