'use client';

import { useState } from 'react';
import { FormField } from '@/components/ui/form-field';

type Props = React.ComponentProps<typeof FormField>;

export function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <FormField {...props} type={visible ? 'text' : 'password'} className="pr-20" />
      <button type="button" onClick={() => setVisible((value) => !value)} className="absolute right-3 top-10 rounded-lg px-2 py-1 text-xs font-semibold text-stone-500 hover:text-stone-900" aria-label={`${visible ? 'Hide' : 'Show'} ${props.label.toLowerCase()}`}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
