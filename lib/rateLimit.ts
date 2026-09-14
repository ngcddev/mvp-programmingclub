// Rate limiting en memoria (best-effort). No persiste entre instancias/despliegues
// serverless distintos, pero mitiga scraping y ráfagas accidentales en una instancia dada.

const ventanas = new Map<string, number[]>();

export type RateLimitResultado = {
  permitido: boolean;
  restantes: number;
  limite: number;
};

export function checkRateLimit(
  clave: string,
  limite: number,
  ventanaMs: number,
  ahora: number = Date.now()
): RateLimitResultado {
  const corte = ahora - ventanaMs;
  const previas = (ventanas.get(clave) ?? []).filter((t) => t > corte);

  if (previas.length >= limite) {
    ventanas.set(clave, previas);
    return { permitido: false, restantes: 0, limite };
  }

  previas.push(ahora);
  ventanas.set(clave, previas);
  return { permitido: true, restantes: limite - previas.length, limite };
}
