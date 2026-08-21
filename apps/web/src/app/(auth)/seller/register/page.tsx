import type { Metadata } from 'next';
import { GuestGuard } from '@/features/auth/auth-guard';
import { AuthShell } from '@/features/auth/auth-shell';
import { RegistrationForm } from '@/features/auth/registration-form';

export const metadata: Metadata = { title: 'Seller registration' };

export default function SellerRegisterPage() {
  return <GuestGuard><AuthShell eyebrow="Seller account" title="Bring your outlet to campus" description="Create the owner account first. Outlet submission and approval follow in Module 3."><RegistrationForm kind="seller" /></AuthShell></GuestGuard>;
}
