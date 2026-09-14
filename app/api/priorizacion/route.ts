import { NextResponse } from 'next/server';
import { getMedicamentos } from '../../../lib/supabase-queries';
import { calcularPrioridad } from '../../../lib/priorizacion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, source } = await getMedicamentos();
    return NextResponse.json({ source, medicamentos: calcularPrioridad(data) });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
