import { NextResponse } from 'next/server';
import { getMedicamentos } from '../../../lib/supabase-queries';
import { clasificarMedicamentos } from '../../../lib/priorizacion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, source, error } = await getMedicamentos();
    const { priorizados, excluidos } = clasificarMedicamentos(data);

    const resumen = {
      total: priorizados.length + excluidos.length,
      critico: 0,
      alerta: 0,
      ok: 0,
      excluidos: excluidos.length,
    };
    for (const m of priorizados) resumen[m.estado]++;

    return NextResponse.json(
      { source, error: error ?? null, resumen, medicamentos: priorizados, excluidos },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[GET /api/priorizacion]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
