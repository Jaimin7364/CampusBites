import Link from 'next/link';

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-stone-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 -top-28 size-96 rounded-full bg-brand-orange-500/25 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3 text-lg font-bold"><span className="grid size-11 place-items-center rounded-2xl bg-brand-orange-500">CB</span>CampusBites</Link>
        <div className="relative max-w-lg">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">Built around your timetable</p>
          <p className="mt-5 text-4xl font-bold leading-tight">Less time waiting. More time enjoying campus.</p>
          <p className="mt-5 leading-7 text-stone-300">One trusted place for students, campus kitchens, and the people who keep everything running.</p>
        </div>
        <p className="relative text-sm text-stone-500">Fresh campus food, ready when you are.</p>
      </aside>
      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-10 flex items-center gap-2 font-bold lg:hidden"><span className="grid size-9 place-items-center rounded-xl bg-brand-orange-500 text-white">CB</span>CampusBites</Link>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-green-500">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">{title}</h1>
          <p className="mt-3 leading-7 text-stone-600">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
