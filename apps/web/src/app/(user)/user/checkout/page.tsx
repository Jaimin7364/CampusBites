'use client';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard } from '@/features/auth/auth-guard';
import { CheckoutPage } from '@/features/orders/checkout-page';
export default function CheckoutRoute() { return <AuthGuard role="user"><DashboardShell role="user" title="Complete your checkout." description="Choose when and how to receive your meal, then confirm your cash order."><CheckoutPage /></DashboardShell></AuthGuard>; }
