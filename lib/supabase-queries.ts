import { supabase } from './supabaseClient';
import { medicamentosFallback } from './data';
import type { Medicamento } from './priorizacion';

export async function getMedicamentos(): Promise<{ data: Medicamento[]; source: 'supabase' | 'fallback' }> {
  if (!supabase) {
    console.warn('[getMedicamentos] Supabase no configurado, usando fallback');
    return { data: medicamentosFallback, source: 'fallback' };
  }

  const { data, error } = await supabase.from('medicamentos').select('*').order('id');

  if (error || !data || data.length === 0) {
    console.warn('[getMedicamentos] Error o tabla vacía, usando fallback:', error?.message);
    return { data: medicamentosFallback, source: 'fallback' };
  }

  return { data: data as Medicamento[], source: 'supabase' };
}
