import { getMedicamentos } from './supabase-queries';
import { clasificarMedicamentos, type EstadoMedicamento } from './priorizacion';

// Formato y carga de datos compartidos por las páginas de la UI.

export const ZONA_HORARIA = 'America/Bogota';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const GLIFO: Record<EstadoMedicamento, string> = { critico: '▲', alerta: '◆', ok: '○' };
export const ETIQUETA_ESTADO: Record<EstadoMedicamento, string> = { critico: 'Crítico', alerta: 'Alerta', ok: 'Estable' };

export async function obtenerPriorizacion() {
  const { data, source } = await getMedicamentos();
  const { priorizados, excluidos } = clasificarMedicamentos(data);
  const conteo: Record<EstadoMedicamento, number> = { critico: 0, alerta: 0, ok: 0 };
  for (const m of priorizados) conteo[m.estado]++;
  return { priorizados, excluidos, source, conteo };
}

export const num = (n: number) => n.toLocaleString('es-CO');

// Un decimal, coma decimal y signo menos tipográfico
export function dec(n: number): string {
  const r = Math.round(n * 10) / 10;
  return (Number.isInteger(r) ? String(r) : String(r).replace('.', ',')).replace('-', '−');
}

export const conSigno = (n: number) => (n > 0 ? '+' : '') + dec(n);
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const codigoDe = (m: Record<string, unknown>) => (m.id == null ? '—' : String(m.id));
export const nombreDe = (m: Record<string, unknown>) =>
  typeof m.nombre === 'string' && m.nombre.trim() !== '' ? m.nombre : 'Sin nombre';

function hoyEnZona(ahora: Date) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(ahora)
    .split('-')
    .map(Number);
  return { y, m, d };
}

export function fechaEnDias(ahora: Date, dias: number): string {
  const { y, m, d } = hoyEnZona(ahora);
  const f = new Date(Date.UTC(y, m - 1, d + Math.floor(dias)));
  return `${f.getUTCDate()} ${MESES[f.getUTCMonth()]}`;
}

export function sello(ahora: Date): string {
  const { y, m, d } = hoyEnZona(ahora);
  const hora = new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA_HORARIA,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(ahora);
  return `${d} ${MESES[m - 1]} ${y} · ${hora}`;
}
