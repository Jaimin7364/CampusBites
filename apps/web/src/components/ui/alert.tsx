export function Alert({ children, tone = 'error' }: { children: React.ReactNode; tone?: 'error' | 'success' }) {
  const style = tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800';
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${style}`}>{children}</div>;
}
