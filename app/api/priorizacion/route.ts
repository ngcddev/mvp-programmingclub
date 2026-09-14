import { NextRequest, NextResponse } from 'next/server';
import { getMedicamentos } from '../../../lib/supabase-queries';
import { clasificarMedicamentos } from '../../../lib/priorizacion';
import { checkApiKey } from '../../../lib/apiAuth';
import { checkRateLimit } from '../../../lib/rateLimit';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function clienteId(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

export async function GET(req: NextRequest) {
  const auth = checkApiKey(req.headers.get('x-api-key'));
  if (!auth.ok) {
    console.warn('[GET /api/priorizacion] auth rechazada:', auth.motivo);
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const rate = checkRateLimit(clienteId(req), RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!rate.permitido) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)) } }
    );
  }

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

    if (error) console.warn('[GET /api/priorizacion] usando fallback:', error);

    return NextResponse.json(
      { source, resumen, medicamentos: priorizados, excluidos },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Data-Source': source,
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/priorizacion]', err);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
