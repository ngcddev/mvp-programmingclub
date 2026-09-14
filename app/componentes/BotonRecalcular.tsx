'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function BotonRecalcular() {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  return (
    <button
      type="button"
      onClick={() => iniciar(() => router.refresh())}
      disabled={pendiente}
      className="cursor-pointer bg-tinta px-4 py-2.5 font-sans text-[11px] leading-none font-medium tracking-[.14em] text-claro uppercase hover:bg-gris disabled:cursor-wait disabled:bg-gris"
    >
      {pendiente ? 'Calculando…' : 'Recalcular'}
    </button>
  );
}
