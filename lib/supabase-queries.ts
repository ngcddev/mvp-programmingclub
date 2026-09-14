import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { medicamentosFallback } from './data';

const TIMEOUT_MS = 8000;
const MAX_ROWS = 1000;

// Demo de hackathon: si Supabase falla se muestran datos de ejemplo también en producción
// (la UI y la API los señalan con source: 'fallback'). Para un despliegue real: PERMITIR_DATOS_EJEMPLO=false.
const permitirFallback = process.env.PERMITIR_DATOS_EJEMPLO !== 'false';

export type ResultadoMedicamentos = {
  data: unknown[]; // se valida en clasificarMedicamentos()
  source: 'supabase' | 'fallback';
  error?: string;
};

function usarFallback(error: string): ResultadoMedicamentos {
  if (!permitirFallback) throw new Error(`No se pudieron obtener los medicamentos: ${error}`);
  console.warn('[getMedicamentos] Usando datos de ejemplo:', error);
  return { data: medicamentosFallback, source: 'fallback', error };
}

async function consultarSupabase(cliente: SupabaseClient): Promise<{ data: unknown[] | null; error: string | null }> {
  try {
    const { data, error } = await cliente
      .from('medicamentos')
      .select('*')
      .order('id')
      .limit(MAX_ROWS)
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
    return { data, error: error?.message ?? null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getMedicamentos(): Promise<ResultadoMedicamentos> {
  if (!supabase) return usarFallback('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY');

  const { data, error } = await consultarSupabase(supabase);
  if (error) return usarFallback(error);

  // Tabla vacía es un resultado real, no un error: no se reemplaza con datos de ejemplo
  return { data: data ?? [], source: 'supabase' };
}
