'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './auth-context';
import type { UserRole } from '@/types/auth';
import { roleHome } from '@/types/auth';

export function AuthGuard({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(`/login?next=/${role}`);
    if (status === 'authenticated' && user?.role !== role) router.replace(roleHome(user!.role));
  }, [role, router, status, user]);

  if (status === 'loading' || (status === 'authenticated' && user?.role !== role)) {
    return <FullPageLoader label="Restoring your session…" />;
  }
  if (!user) return <FullPageLoader label="Taking you to sign in…" />;
  return children;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === 'authenticated' && user) router.replace(roleHome(user.role));
  }, [router, status, user]);
  if (status === 'loading' || user) return <FullPageLoader label="Checking your session…" />;
  return children;
}

function FullPageLoader({ label }: { label: string }) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div role="status" className="text-center text-sm font-medium text-stone-600">
        <span className="mx-auto mb-4 block size-9 animate-spin rounded-full border-4 border-orange-100 border-t-brand-orange-500" />
        {label}
      </div>
    </main>
  );
}
