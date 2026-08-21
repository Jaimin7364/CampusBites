'use client';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard } from '@/features/auth/auth-guard';
import { CartPage } from '@/features/cart/cart-page';
export default function UserCartPage() { return <AuthGuard role="user"><DashboardShell role="user" title="Review your cart." description="Confirm quantities, current availability, and server-verified totals before checkout."><CartPage /></DashboardShell></AuthGuard>; }
