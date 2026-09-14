import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UMBRAL_ALERTA_DIAS, peso_importancia } from '../../../lib/priorizacion';
import { ETIQUETA_ESTADO, GLIFO, codigoDe, conSigno, dec, fechaEnDias, nombreDe, num, obtenerPriorizacion, pad2 } from '../../../lib/vista';

const MAX_MARCAS = 14;

export default async function DetalleMedicamento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { priorizados } = await obtenerPriorizacion();
  const posicion = priorizados.findIndex((m) => m.id != null && String(m.id) === id);
  if (posicion === -1) notFound();

  const m = priorizados[posicion];
  const ahora = new Date();
  const dias = m.dias_restantes;
  const lead = m.tiempo_proveedor;
  const esCritico = m.estado === 'critico';
  const sinMargen = Math.abs(m.margen) < 1e-9;
  const faltan = dec(Math.abs(m.margen));
  const umbral = dec(UMBRAL_ALERTA_DIAS);

  // Escala de la línea de tiempo en días, con marcas cada `paso` días
  const bruta = Math.max(1, Math.ceil(Math.max(dias, lead) * 1.35 + 0.5));
  const paso = Math.ceil(bruta / MAX_MARCAS);
  const escala = Math.ceil(bruta / paso) * paso;
  const marcas = Array.from({ length: escala / paso }, (_, i) => `D+${i * paso}`);
  const pct = (v: number) => `${((v / escala) * 100).toFixed(2)}%`;
  const huecoIni = Math.min(dias, lead);
  const huecoAncho = Math.max(Math.max(dias, lead) - huecoIni, 0.18);

  const conclusion = esCritico
    ? `Faltan ${faltan} días de cobertura: el stock se agota antes de que llegue el pedido.`
    : sinMargen
      ? 'El pedido llega justo el día en que se agota el stock: cero margen.'
      : `Sobran ${faltan} días de margen entre el agotamiento y la entrega.`;

  const recomendacion = esCritico
    ? `Pedir hoy no evita el hueco. Coloque el pedido de inmediato y gestione una entrega parcial urgente para cubrir los ${faltan} días faltantes.`
    : m.estado === 'alerta'
      ? `Coloque el pedido hoy: la cobertura está por debajo del umbral de aviso de ${umbral} días y cualquier retraso del proveedor deja el servicio sin existencias.`
      : `No requiere acción inmediata. Revise de nuevo cuando la cobertura baje del umbral de aviso de ${umbral} días.`;

  const factores = [
    { k: 'Existencias hoy', v: `${num(m.existencias)} u` },
    { k: 'Consumo diario promedio', v: `${num(m.consumo_diario)} u/día` },
    { k: 'Tiempo del proveedor', v: `${dec(lead)} días` },
    { k: 'Importancia clínica', v: `${m.importancia} · peso ${peso_importancia[m.importancia]}` },
    { k: 'Días de stock', v: `${dec(dias)} días` },
    { k: 'Cobertura', v: `${conSigno(m.margen)} días` },
    { k: 'Score de urgencia', v: dec(m.score_urgencia) },
  ];

  return (
    <div className="pt-[22px]">
      <Link
        href="/"
        className="inline-block py-[9px] pr-3.5 font-sans text-[11px] leading-none font-medium tracking-[.14em] uppercase hover:text-gris"
      >
        ← Volver a la lista
      </Link>

      <div className="mt-3.5 flex flex-wrap items-end justify-between gap-6 border-b-2 border-tinta pb-[22px]">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm leading-none font-semibold">{GLIFO[m.estado]}</span>
            <span className="text-[11px] leading-none font-semibold tracking-[.14em] uppercase">{ETIQUETA_ESTADO[m.estado]}</span>
            <span className="font-mono text-[11px] leading-none text-gris">
              PRIORIDAD {pad2(posicion + 1)} DE {pad2(priorizados.length)}
            </span>
          </div>
          <h1 className="mt-3 mb-0 text-[30px] leading-[1.15] font-semibold tracking-[-.01em]">{nombreDe(m)}</h1>
          <div className="mt-[7px] font-mono text-[13px] leading-snug text-gris">
            Código {codigoDe(m)} · importancia clínica {m.importancia.toLowerCase()}
          </div>
        </div>
        <div className="text-right">
          <div className="etiqueta">Score de urgencia</div>
          <div className="mt-2 font-mono text-[34px] leading-none font-semibold">{dec(m.score_urgencia)}</div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] border-b border-tinta">
        <div className="py-[30px] pr-8">
          <div className="etiqueta">El cálculo, en claro</div>
          <ol className="mt-[22px] flex list-none flex-col gap-5 p-0">
            <li className="flex gap-4">
              <span className="flex-none font-mono text-[11px] leading-relaxed font-medium text-gris">01</span>
              <div>
                <div className="text-[17px] leading-[1.45]">
                  Quedan <strong className="font-mono font-semibold">{dec(dias)} días</strong> de stock.
                </div>
                <div className="mt-[5px] font-mono text-xs leading-snug text-gris">
                  {num(m.existencias)} unidades ÷ {num(m.consumo_diario)} por día · se agota el {fechaEnDias(ahora, dias)}
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-none font-mono text-[11px] leading-relaxed font-medium text-gris">02</span>
              <div>
                <div className="text-[17px] leading-[1.45]">
                  El proveedor tarda <strong className="font-mono font-semibold">{dec(lead)} días</strong> en entregar.
                </div>
                <div className="mt-[5px] font-mono text-xs leading-snug text-gris">
                  Si el pedido sale hoy {fechaEnDias(ahora, 0)}, llega el {fechaEnDias(ahora, lead)}
                </div>
              </div>
            </li>
            <li className="flex gap-4 bg-tinta px-[18px] py-4 text-claro">
              <span className="flex-none font-mono text-[11px] leading-relaxed font-medium text-gris-claro">03</span>
              <div>
                <div className="text-[17px] leading-[1.45]">{conclusion}</div>
                <div className="mt-[5px] font-mono text-xs leading-snug text-gris-claro">
                  {dec(dias)} días de stock − {dec(lead)} días de proveedor = {conSigno(m.margen)} días
                </div>
              </div>
            </li>
          </ol>
        </div>

        <div className="border-l border-linea py-[30px] pl-8 max-[700px]:border-l-0 max-[700px]:pl-0">
          <div className="etiqueta">Factores de la decisión</div>
          <table className="mt-4 w-full border-collapse">
            <tbody>
              {factores.map((f) => (
                <tr key={f.k}>
                  <td className="border-b border-linea-suave py-[11px] text-[13px] leading-snug text-gris">{f.k}</td>
                  <td className="border-b border-linea-suave py-[11px] text-right font-mono text-[13px] leading-snug font-medium tabular-nums">
                    {f.v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-[18px] mb-0 max-w-[460px] text-[13px] leading-relaxed">{recomendacion}</p>
        </div>
      </div>

      <div className="pt-[30px]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="etiqueta">Línea de tiempo — {esCritico ? 'hueco de cobertura' : 'margen de cobertura'}</div>
          <div className="font-mono text-[11px] leading-snug text-gris">Escala en días desde hoy</div>
        </div>

        <div className="mt-[22px] grid grid-cols-[158px_minmax(0,1fr)] items-start gap-x-3.5 gap-y-[26px] max-[560px]:grid-cols-[96px_minmax(0,1fr)]">
          <div className="pt-1.5 text-[11px] leading-tight font-medium tracking-[.06em] uppercase">Stock disponible</div>
          <div>
            <div className="relative h-[26px] border border-tinta bg-linea">
              <div className="absolute inset-y-0 left-0 bg-tinta" style={{ width: pct(dias) }} />
            </div>
            <div className="mt-1.5 font-mono text-[11px] leading-tight text-gris">
              {num(m.existencias)} unidades cubren hasta el {fechaEnDias(ahora, dias)}
            </div>
          </div>

          <div className="pt-1.5 text-[11px] leading-tight font-medium tracking-[.06em] uppercase">Pedido en camino</div>
          <div>
            <div className="relative h-[26px] border border-tinta bg-linea">
              <div
                className="absolute inset-y-0 left-0 bg-[repeating-linear-gradient(135deg,#111110_0_2px,transparent_2px_7px)]"
                style={{ width: pct(lead) }}
              />
              <div className="absolute -inset-y-px w-[3px] bg-tinta" style={{ left: pct(lead) }} />
            </div>
            <div className="mt-1.5 font-mono text-[11px] leading-tight text-gris">Entrega del proveedor el {fechaEnDias(ahora, lead)}</div>
          </div>

          <div className="pt-[11px] text-[11px] leading-tight font-semibold tracking-[.06em] uppercase">
            {esCritico ? 'Sin cobertura' : sinMargen ? 'Sin margen' : 'Margen'}
          </div>
          <div>
            <div className="relative h-[38px] border-t border-linea">
              <div
                className="absolute inset-y-0 flex items-center justify-center border-x-2 border-tinta bg-[repeating-linear-gradient(90deg,#111110_0_1px,transparent_1px_6px)]"
                style={{ left: pct(huecoIni), width: pct(huecoAncho) }}
              >
                <span className="bg-papel px-[7px] py-[3px] font-mono text-[11px] leading-tight font-semibold whitespace-nowrap">
                  {esCritico ? `${faltan} días sin existencias` : sinMargen ? 'Llega el mismo día' : `${faltan} días de colchón`}
                </span>
              </div>
            </div>
            <div className="mt-2 flex border-t border-tinta">
              {marcas.map((marca) => (
                <div key={marca} className="flex-1 border-l border-linea pt-[7px] pl-[5px] font-mono text-[11px] leading-tight text-gris">
                  {marca}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
