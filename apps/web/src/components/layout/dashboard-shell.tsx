'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-context';
import type { UserRole } from '@/types/auth';
import { CartNavLink } from '@/features/cart/cart-nav-link';

const labels = { user: 'Student', seller: 'Seller', admin: 'Administrator' } as const;

export function DashboardShell({ role, title, description, children }: { role: UserRole; title: string; description: string; children?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const displayName = user?.fullName ?? user?.sellerName ?? 'CampusBites member';

  async function signOut() {
    await logout();
    router.replace('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href={`/${role}`} className="flex items-center gap-2 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-brand-orange-500 text-white">CB</span><span className="hidden sm:inline">CampusBites</span></Link>
          <nav aria-label="Account navigation" className="flex items-center gap-2">
            {role === 'admin' ? <><Link href="/admin" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-950 sm:block">Universities</Link><Link href="/admin/outlets" className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-950">Outlets</Link></> : null}
            {role === 'seller' ? <><Link href="/seller" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-950 sm:block">Outlet</Link><Link href="/seller/menu" className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-950">Menu</Link><Link href="/seller/orders" className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-950">Orders</Link></> : null}
            {role === 'user' ? <CartNavLink /> : null}
            <Link href={`/${role}/profile`} className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-950">Profile</Link>
            <Button variant="ghost" onClick={signOut} className="min-h-10 px-3 py-2">Logout</Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-green-500">{labels[role]} portal</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl leading-7 text-stone-600">{description}</p></div>
          <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm"><span className="block text-xs text-stone-500">Signed in as</span><span className="font-semibold text-stone-900">{displayName}</span></div>
        </div>
        {children}
      </main>
    </div>
  );
}
