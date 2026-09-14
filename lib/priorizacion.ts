export type Importancia = 'Alta' | 'Media' | 'Baja';

export type Medicamento = {
  id?: number | string;
  nombre?: string;
  existencias: number;
  consumo_diario: number;
  tiempo_proveedor: number;
  importancia: Importancia;
  [key: string]: unknown;
};

export type EstadoMedicamento = 'critico' | 'alerta' | 'ok';

export type MedicamentoPriorizado = Medicamento & {
  dias_restantes: number;
  margen: number;
  score_urgencia: number;
  estado: EstadoMedicamento;
};

export type MedicamentoExcluido = Record<string, unknown> & { motivo: string };

export const peso_importancia: Record<Importancia, number> = { Alta: 3, Media: 2, Baja: 1 };

// critico: margen < 0 (se agota antes de que llegue el pedido)
// alerta: 0 <= margen < UMBRAL_ALERTA_DIAS (poco colchón)
export const UMBRAL_ALERTA_DIAS = 3;

// Evita que errores de coma flotante rompan los empates
const EPSILON = 1e-9;

function aNumero(valor: unknown): number {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string' && valor.trim() !== '') return Number(valor);
  return NaN; // null, undefined, '', booleanos, objetos
}

function normalizarImportancia(valor: unknown): Importancia | null {
  if (typeof valor !== 'string') return null;
  const v = valor.trim().toLowerCase();
  if (v === 'alta') return 'Alta';
  if (v === 'media') return 'Media';
  if (v === 'baja') return 'Baja';
  return null;
}

export function clasificarMedicamentos(medicamentos: unknown): {
  priorizados: MedicamentoPriorizado[];
  excluidos: MedicamentoExcluido[];
} {
  const priorizados: MedicamentoPriorizado[] = [];
  const excluidos: MedicamentoExcluido[] = [];

  if (!Array.isArray(medicamentos)) return { priorizados, excluidos };

  for (const item of medicamentos) {
    if (!item || typeof item !== 'object') {
      excluidos.push({ valor: item, motivo: 'Registro vacío o inválido' });
      continue;
    }

    const m = item as Record<string, unknown>;
    const existencias = aNumero(m.existencias);
    const consumo_diario = aNumero(m.consumo_diario);
    const tiempo_proveedor = aNumero(m.tiempo_proveedor);
    const importancia = normalizarImportancia(m.importancia);

    const errores: string[] = [];
    if (!Number.isFinite(existencias) || existencias < 0) errores.push(`existencias inválidas (${String(m.existencias)})`);
    if (!Number.isFinite(consumo_diario) || consumo_diario < 0) errores.push(`consumo_diario inválido (${String(m.consumo_diario)})`);
    if (!Number.isFinite(tiempo_proveedor) || tiempo_proveedor < 0) errores.push(`tiempo_proveedor inválido (${String(m.tiempo_proveedor)})`);
    if (!importancia) errores.push(`importancia inválida (${String(m.importancia)})`);

    if (errores.length > 0 || !importancia) {
      excluidos.push({ ...m, motivo: errores.join('; ') });
      continue;
    }

    if (consumo_diario === 0) {
      excluidos.push({ ...m, motivo: 'consumo_diario es 0: no se agota, no aplica priorización' });
      continue;
    }

    // Fórmula validada (no modificar)
    const dias_restantes = existencias / consumo_diario;
    const margen = dias_restantes - tiempo_proveedor;
    const score_urgencia = -margen * peso_importancia[importancia] + 0; // +0 evita -0

    priorizados.push({
      ...m,
      existencias,
      consumo_diario,
      tiempo_proveedor,
      importancia,
      dias_restantes,
      margen,
      score_urgencia,
      estado: margen < 0 ? 'critico' : margen < UMBRAL_ALERTA_DIAS ? 'alerta' : 'ok',
    });
  }

  // Mayor score primero; empate -> mayor importancia; si sigue empatado se mantiene el orden de entrada (sort estable)
  priorizados.sort((a, b) => {
    const diff = b.score_urgencia - a.score_urgencia;
    if (Math.abs(diff) > EPSILON) return diff;
    return peso_importancia[b.importancia] - peso_importancia[a.importancia];
  });

  return { priorizados, excluidos };
}

export function calcularPrioridad(medicamentos: unknown): MedicamentoPriorizado[] {
  return clasificarMedicamentos(medicamentos).priorizados;
}
