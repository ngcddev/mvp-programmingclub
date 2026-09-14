import Link from 'next/link';
import { UMBRAL_ALERTA_DIAS, type EstadoMedicamento } from '../lib/priorizacion';
import { ETIQUETA_ESTADO, GLIFO, codigoDe, conSigno, dec, nombreDe, num, obtenerPriorizacion, pad2 } from '../lib/vista';

const ESTILO_FILA: Record<EstadoMedicamento, { marca: string; fondo: string; estado: string; nombre: string; numero: string }> = {
  critico: {
    marca: 'border-l-4 border-l-tinta',
    fondo: 'bg-fila-critica',
    estado: 'font-bold text-tinta',
    nombre: 'font-semibold',
    numero: 'font-semibold',
  },
  alerta: {
    marca: 'border-l-4 border-l-tinta [border-left-style:double]',
    fondo: '',
    estado: 'font-medium text-tinta',
    nombre: 'font-normal',
    numero: 'font-medium',
  },
  ok: {
    marca: 'border-l-4 border-l-[#c4c4bf] [border-left-style:dotted]',
    fondo: '',
    estado: 'font-normal text-gris',
    nombre: 'font-normal',
    numero: 'font-normal',
  },
};

const th = 'border-b border-tinta px-3 py-[11px] font-sans text-[10px] leading-tight font-medium tracking-[.12em] text-gris uppercase';
const td = 'border-b border-linea-suave px-3 py-3.5';
const tdNum = `${td} text-right font-mono text-[13px] leading-snug tabular-nums`;

export default async function Inicio() {
  const { priorizados, excluidos, source, conteo } = await obtenerPriorizacion();

  const resumen = [
    { titulo: 'Críticos', valor: pad2(conteo.critico), nota: 'se agotan antes del pedido' },
    { titulo: 'Alertas', valor: pad2(conteo.alerta), nota: 'margen menor al umbral' },
    { titulo: 'Estables', valor: pad2(conteo.ok), nota: 'cobertura suficiente' },
    { titulo: 'Umbral de aviso', valor: `${dec(UMBRAL_ALERTA_DIAS)}d`, nota: 'de margen sobre el proveedor' },
    { titulo: 'Excluidos', valor: pad2(excluidos.length), nota: 'registros con datos inválidos' },
  ];

  return (
    <div>
      {source === 'fallback' && (
        <div className="mt-4 border border-tinta px-4 py-3 font-mono text-xs leading-snug">
          ◆ DATOS DE EJEMPLO — Supabase no está disponible; estas existencias no son reales.
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] border-b border-tinta">
        {resumen.map((r, i) => (
          <div key={r.titulo} className={`py-5 pr-5 ${i > 0 ? 'pl-5' : ''} ${i < resumen.length - 1 ? 'border-r border-linea' : ''}`}>
            <div className="etiqueta">{r.titulo}</div>
            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="font-mono text-[34px] leading-none font-semibold">{r.valor}</span>
              <span className="text-xs leading-tight text-gris">{r.nota}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-4 pt-[22px] pb-3">
        <h1 className="m-0 text-[15px] leading-tight font-semibold tracking-[.02em]">Orden de reabastecimiento — urgencia</h1>
        <span className="font-mono text-[11px] leading-snug text-gris">
          Fuente: {source === 'supabase' ? 'Supabase' : 'datos de ejemplo'} · Clic en una fila para ver el cálculo
        </span>
      </div>

      {priorizados.length === 0 ? (
        <p className="border-t border-tinta py-10 font-mono text-[13px] text-gris">No hay medicamentos para priorizar.</p>
      ) : (
        <div className="overflow-x-auto border-t border-tinta">
          <table className="w-full min-w-[1040px] table-fixed border-collapse">
            <thead>
              <tr>
                <th className={`${th} w-[50px] px-2.5 text-right`}>#</th>
                <th className={`${th} w-[140px] text-left`}>Estado</th>
                <th className={`${th} w-[260px] text-left`}>Medicamento</th>
                <th className={`${th} w-[100px] text-right`}>Existencias</th>
                <th className={`${th} w-[100px] text-right`}>Consumo/día</th>
                <th className={`${th} w-[108px] text-right`}>Días de stock</th>
                <th className={`${th} w-[96px] text-right`}>Proveedor</th>
                <th className={`${th} w-[104px] text-right`}>Cobertura</th>
                <th className={`${th} w-[100px] text-left`}>Importancia</th>
                <th className={`${th} w-[96px] pr-0 text-right`}>Score</th>
              </tr>
            </thead>
            <tbody>
              {priorizados.map((m, i) => {
                const e = ESTILO_FILA[m.estado];
                const nombre = nombreDe(m);
                return (
                  <tr key={m.id != null ? String(m.id) : `fila-${i}`} className={`relative hover:bg-hover ${e.fondo}`}>
                    <td className={`${td} px-2.5 text-right font-mono text-[13px] font-medium text-gris ${e.marca}`}>{pad2(i + 1)}</td>
                    <td className={td}>
                      <span className={`inline-flex items-center gap-[9px] text-[11px] leading-tight tracking-[.1em] uppercase ${e.estado}`}>
                        <span className="text-xs leading-none">{GLIFO[m.estado]}</span>
                        {ETIQUETA_ESTADO[m.estado]}
                      </span>
                    </td>
                    <td className={td}>
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-mono text-[13px] leading-tight font-semibold">{codigoDe(m)}</span>
                        {m.id != null ? (
                          <Link
                            href={`/medicamentos/${encodeURIComponent(String(m.id))}`}
                            className={`text-[13px] leading-snug after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-tinta ${e.nombre}`}
                          >
                            {nombre}
                          </Link>
                        ) : (
                          <span className={`text-[13px] leading-snug ${e.nombre}`}>{nombre}</span>
                        )}
                      </div>
                    </td>
                    <td className={tdNum}>{num(m.existencias)}</td>
                    <td className={tdNum}>{num(m.consumo_diario)}</td>
                    <td className={`${tdNum} text-sm ${e.numero}`}>{dec(m.dias_restantes)}</td>
                    <td className={tdNum}>{dec(m.tiempo_proveedor)}</td>
                    <td className={`${tdNum} text-sm ${e.numero}`}>{conSigno(m.margen)}</td>
                    <td className={`${td} text-xs leading-snug ${m.importancia === 'Alta' ? 'font-semibold' : ''}`}>{m.importancia}</td>
                    <td className={`${tdNum} pr-0`}>{dec(m.score_urgencia)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-8 border-t border-tinta pt-5">
        {(['critico', 'alerta', 'ok'] as const).map((estado) => (
          <div key={estado} className="flex items-center gap-2.5">
            <span className="font-mono text-xs leading-none font-semibold">{GLIFO[estado]}</span>
            <span className="text-[11px] leading-snug text-gris">
              {estado === 'critico' && 'Crítico — el stock se agota antes de que llegue el pedido'}
              {estado === 'alerta' && `Alerta — llega con menos de ${dec(UMBRAL_ALERTA_DIAS)} días de margen`}
              {estado === 'ok' && 'Estable — cobertura suficiente'}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3.5 mb-0 max-w-[760px] text-xs leading-relaxed text-gris">
        Días de stock = existencias ÷ consumo diario. Cobertura = días de stock − tiempo del proveedor. Score = −cobertura ×
        peso de importancia clínica (Alta 3, Media 2, Baja 1); a mayor score, mayor urgencia.
      </p>

      {excluidos.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-4 pb-3">
            <h2 className="m-0 text-[15px] leading-tight font-semibold tracking-[.02em]">Registros excluidos — {excluidos.length}</h2>
            <span className="font-mono text-[11px] leading-snug text-gris">No entran en el cálculo hasta corregir los datos</span>
          </div>
          <div className="overflow-x-auto border-t border-tinta">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className={`${th} w-[90px] pl-0 text-left`}>Código</th>
                  <th className={`${th} w-[260px] text-left`}>Medicamento</th>
                  <th className={`${th} text-left`}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {excluidos.map((x, i) => (
                  <tr key={i}>
                    <td className={`${td} pl-0 font-mono text-[13px] font-semibold`}>{codigoDe(x)}</td>
                    <td className={`${td} text-[13px]`}>{nombreDe(x)}</td>
                    <td className={`${td} font-mono text-xs text-gris`}>{x.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
