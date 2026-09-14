import { timingSafeEqual } from 'node:crypto';

// Autenticación simple por API key compartida (server-only), pensada para MVP
// sin sistema de usuarios. Sustituir por un mecanismo real (Supabase Auth, JWT, etc.)
// cuando exista un modelo de usuarios/roles.

function iguales(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Las longitudes distintas ya filtran la mayoría de intentos; timingSafeEqual
  // exige buffers del mismo tamaño, así que solo se compara byte a byte cuando coinciden.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function checkApiKey(headerValue: string | null): { ok: boolean; motivo?: string } {
  const esperado = process.env.PRIORIZACION_API_KEY;

  if (!esperado) {
    return { ok: false, motivo: 'PRIORIZACION_API_KEY no está configurada en el servidor' };
  }
  if (!headerValue) {
    return { ok: false, motivo: 'Falta el header x-api-key' };
  }
  if (!iguales(headerValue, esperado)) {
    return { ok: false, motivo: 'API key inválida' };
  }
  return { ok: true };
}
