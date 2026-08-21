import Link from 'next/link';

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-4 text-center"><div><p className="text-sm font-bold text-brand-orange-600">404</p><h1 className="mt-3 text-4xl font-bold">That page is off the menu.</h1><p className="mt-4 text-stone-600">Let’s get you back to CampusBites.</p><Link href="/" className="mt-8 inline-flex rounded-xl bg-brand-orange-500 px-5 py-3 font-semibold text-white">Return home</Link></div></main>;
}
