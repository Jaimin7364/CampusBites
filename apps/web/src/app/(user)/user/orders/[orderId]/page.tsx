'use client';
import { use } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard } from '@/features/auth/auth-guard';
import { OrderDetail } from '@/features/orders/order-detail';
export default function OrderDetailRoute({ params }: { params: Promise<{ orderId: string }> }) { const { orderId } = use(params); return <AuthGuard role="user"><DashboardShell role="user" title="Your order details." description="Review the confirmed snapshots, receiving details, payment, and total."><OrderDetail id={orderId} /></DashboardShell></AuthGuard>; }
