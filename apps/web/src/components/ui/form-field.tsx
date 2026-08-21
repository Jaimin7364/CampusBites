import type { InputHTMLAttributes } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function FormField({ label, error, hint, id, className = '', ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;
  const descriptionId = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className="block">
      <label htmlFor={fieldId} className="mb-2 block text-sm font-semibold text-stone-800">{label}</label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className={`min-h-12 w-full rounded-xl border bg-white px-4 text-base text-stone-900 shadow-sm transition placeholder:text-stone-400 focus:border-brand-orange-500 focus:ring-4 focus:ring-orange-100 ${
          error ? 'border-red-400' : 'border-stone-300'
        } ${className}`}
        {...props}
      />
      {error ? (
        <span id={descriptionId} className="mt-1.5 block text-sm text-red-600">{error}</span>
      ) : hint ? (
        <span id={descriptionId} className="mt-1.5 block text-xs leading-5 text-stone-500">{hint}</span>
      ) : null}
    </div>
  );
}
