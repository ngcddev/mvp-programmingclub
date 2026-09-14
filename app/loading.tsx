export default function Cargando() {
  return (
    <div className="flex justify-center py-[120px]" role="status">
      <div className="w-full max-w-[520px]">
        <div className="font-mono text-[13px] leading-none font-semibold tracking-[.14em] uppercase">
          Calculando prioridades<span className="vigia-parpadeo">_</span>
        </div>
        <div className="mt-[18px] h-1.5 overflow-hidden bg-linea">
          <div className="vigia-barrido h-full w-[45%] bg-tinta" />
        </div>
        <ul className="mt-[22px] flex flex-col gap-2 font-mono text-xs leading-snug text-gris">
          <li>· Leyendo existencias</li>
          <li>· Proyectando consumo diario</li>
          <li>· Cruzando tiempos de proveedor e importancia clínica</li>
        </ul>
      </div>
    </div>
  );
}
