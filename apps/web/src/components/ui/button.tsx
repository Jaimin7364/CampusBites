import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const variants = {
  primary: 'bg-brand-orange-500 text-white hover:bg-brand-orange-600 shadow-sm',
  secondary: 'bg-brand-green-500 text-white hover:bg-green-700 shadow-sm',
  ghost: 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50',
};

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
