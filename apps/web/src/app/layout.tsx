import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/features/auth/auth-context';
import { CartProvider } from '@/features/cart/cart-context';
import { AppStatus } from '@/components/layout/app-status';

export const metadata: Metadata = {
  title: { default: 'CampusBites', template: '%s · CampusBites' },
  description: 'Fresh campus food, ready when you are.',
  applicationName: 'CampusBites',
  keywords: ['campus food', 'student ordering', 'food pre-order'],
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AuthProvider><CartProvider><AppStatus /><div id="main-content">{children}</div></CartProvider></AuthProvider>
      </body>
    </html>
  );
}
