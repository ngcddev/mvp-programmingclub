'use client';

export default function ErrorPriorizacion({ reset }: { reset: () => void }) {
  return (
    <div className="py-[120px]">
      <div className="mx-auto max-w-[520px]">
        <div className="font-mono text-[13px] leading-none font-semibold tracking-[.14em] uppercase">
          ▲ No se pudieron calcular las prioridades
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-gris">
          No fue posible leer el inventario. Intenta de nuevo en unos segundos.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 cursor-pointer border border-tinta px-[18px] py-3 font-sans text-[11px] leading-none font-medium tracking-[.14em] uppercase hover:bg-hover"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
