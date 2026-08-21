'use client';

import Image from 'next/image';
import { useState } from 'react';
import { outletImageUrl } from '@/services/hotel-service';

export function OutletImage({ path, alt, className, fallbackClassName }: { path: string | null; alt: string; className: string; fallbackClassName: string }) {
  const [failed, setFailed] = useState(false);
  if (!path || failed) return <div role="img" aria-label={`${alt} image unavailable`} className={`grid place-items-center bg-gradient-to-br from-orange-100 to-green-100 font-black text-brand-orange-500 ${fallbackClassName}`}>CB</div>;
  return <Image unoptimized src={outletImageUrl(path)} width={1600} height={900} alt={alt} className={className} onError={() => setFailed(true)} />;
}
