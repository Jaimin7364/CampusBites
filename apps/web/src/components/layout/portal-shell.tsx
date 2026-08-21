import Link from 'next/link';
import type { ReactNode } from 'react';

type PortalShellProps = {
  audience: 'Students' | 'Sellers' | 'Administrators';
  title: string;
  description: string;
  children?: ReactNode;
};

export function PortalShell({ audience, title, description, children }: PortalShellProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-orange-500 text-white">CB</span>
            <span>CampusBites</span>
          </Link>
          <span className="rounded-full bg-brand-orange-50 px-3 py-1 text-xs font-semibold text-brand-orange-600">
            {audience}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-green-500">Campus food, simplified</p>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
