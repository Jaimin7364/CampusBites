import Link from 'next/link';
import { ApiStatus } from '@/components/health/api-status';

const portals = [
  { href: '/register', label: 'Join as a student', copy: 'Create your account and get ready to explore campus food.' },
  { href: '/seller/register', label: 'Grow as a seller', copy: 'Register your business owner account for CampusBites.' },
  { href: '/login', label: 'Sign in', copy: 'Continue securely to your student, seller, or admin portal.' },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 font-bold"><span className="grid size-11 place-items-center rounded-2xl bg-brand-orange-500 text-white">CB</span>CampusBites</div>
        <ApiStatus />
      </div>
      <section className="py-16 lg:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-green-500">Made for campus life</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-tight text-stone-900 sm:text-7xl">Good food should fit between lectures.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">Discover trusted campus food outlets, order instantly, or schedule pickup before your next break.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="rounded-xl bg-brand-orange-500 px-5 py-3 font-semibold text-white shadow-sm hover:bg-brand-orange-600">Create student account</Link><Link href="/login" className="rounded-xl border border-stone-200 bg-white px-5 py-3 font-semibold text-stone-800 hover:bg-stone-50">Sign in</Link></div>
      </section>
      <section aria-label="Platform portals" className="grid gap-4 md:grid-cols-3">
        {portals.map((portal) => (
          <Link key={portal.href} href={portal.href} className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
            <h2 className="text-lg font-bold text-stone-900 group-hover:text-brand-orange-600">{portal.label} <span aria-hidden="true">→</span></h2>
            <p className="mt-2 leading-7 text-stone-600">{portal.copy}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
