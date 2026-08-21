import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/features/auth/auth-context';
import { CartProvider } from '@/features/cart/cart-context';

export const metadata: Metadata = {
  title: { default: 'CampusBites', template: '%s · CampusBites' },
  description: 'Fresh campus food, ready when you are.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider><CartProvider>{children}</CartProvider></AuthProvider>
      </body>
    </html>
  );
}
