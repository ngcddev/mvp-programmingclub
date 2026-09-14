# Arquitectura

## Visión general

`mvp-programmingclub` es una aplicación Next.js (App Router) cuyo único propósito hoy es exponer un endpoint que calcula, para un listado de medicamentos, qué tan urgente es reponer cada uno. Es deliberadamente pequeña: no hay UI, no hay autenticación, no hay escritura de datos. Es el backend mínimo necesario para validar la lógica de priorización.

```
┌──────────────┐      GET /api/priorizacion      ┌──────────────────────┐
│   Cliente    │ ───────────────────────────────▶ │  Next.js Route Handler│
│ (aún no existe│                                  │  app/api/priorizacion │
│  UI propia)  │ ◀─────────────────────────────── │        /route.ts      │
└──────────────┘        JSON priorizado           └──────────┬───────────┘
                                                              │
                                                              ▼
                                              ┌───────────────────────────┐
                                              │ lib/supabase-queries.ts   │
                                              │ getMedicamentos()         │
                                              └──────────┬────────────────┘
                                                          │
                                   ¿supabase configurado y responde? 
                                          │                         │
                                        sí                         no / error / vacío
                                          ▼                         ▼
                              ┌────────────────────┐    ┌───────────────────────┐
                              │ Supabase            │    │ lib/data.ts            │
                              │ tabla `medicamentos`│    │ medicamentosFallback   │
                              └────────────────────┘    └───────────────────────┘
                                          │                         │
                                          └───────────┬─────────────┘
                                                       ▼
                                          ┌─────────────────────────────┐
                                          │ lib/priorizacion.ts          │
                                          │ calcularPrioridad()          │
                                          └─────────────────────────────┘
```

## Stack

- **Framework**: Next.js 16 (App Router), React 19.
- **Lenguaje**: TypeScript.
- **Estilos**: Tailwind CSS 4 (configurado vía `@tailwindcss/postcss`; aún sin componentes visuales que lo usen más allá de `globals.css`).
- **Base de datos**: Supabase (Postgres + cliente JS `@supabase/supabase-js`), acceso vía anon key desde el servidor.
- **Lint**: ESLint 9 con `eslint-config-next`.

No hay framework de testing, CI, ni ORM configurado todavía.

## Componentes

### `app/api/priorizacion/route.ts`
Route handler de Next.js. Expone `GET`, marcado como `dynamic = 'force-dynamic'` para evitar cacheo estático (los datos deben reflejar el estado actual de inventario). Orquesta: obtiene medicamentos → calcula prioridad → responde JSON. Cualquier excepción se captura y se devuelve como `{ error }` con status 500.

### `lib/supabase-queries.ts` — `getMedicamentos()`
Punto único de acceso a datos. Responsabilidades:
- Si `supabase` (cliente) es `null` (faltan variables de entorno), usa el fallback directamente.
- Si la consulta a la tabla `medicamentos` falla o devuelve vacío, también usa el fallback.
- Devuelve además `source: 'supabase' | 'fallback'` para que el consumidor (y quien depure) sepa de dónde vinieron los datos.

Este patrón de "degradar con gracia" es intencional: permite desarrollar y demostrar el MVP sin depender de que Supabase esté siempre disponible o configurado.

### `lib/supabaseClient.ts`
Crea el cliente de Supabase leyendo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Si faltan, exporta `null` en vez de lanzar un error — el resto del sistema está preparado para manejar ese caso.

> Nota: estas variables usan el prefijo `NEXT_PUBLIC_`, lo que las expone también al bundle de cliente. Es aceptable mientras se use solo la anon key (protegida por Row Level Security en Supabase), pero cualquier operación que requiera privilegios elevados debe usar una service role key **solo en el servidor**, sin el prefijo `NEXT_PUBLIC_`.

### `lib/data.ts`
Dataset fijo en memoria (`medicamentosFallback`) usado cuando Supabase no está disponible. Sirve tanto de fallback en producción/desarrollo como de fixture implícito para probar la lógica de priorización.

### `lib/priorizacion.ts` — `calcularPrioridad()`
Lógica de negocio central, pura (sin efectos secundarios ni I/O), lo que la hace fácil de testear de forma aislada aunque hoy no existan tests.

#### Lógica de priorización

Para cada medicamento:

1. **`dias_restantes = existencias / consumo_diario`** — cuántos días de inventario quedan al ritmo de consumo actual.
2. **`margen = dias_restantes - tiempo_proveedor`** — cuánto colchón hay entre quedarse sin stock y que llegue el próximo pedido. Negativo significa que, si se pidiera hoy, el medicamento se agotaría antes de que llegue el reabastecimiento.
3. **`score_urgencia = -margen * peso_importancia[importancia]`** — a menor margen (o más negativo), mayor urgencia; se pondera por importancia clínica (`Alta: 3, Media: 2, Baja: 1`).

El resultado se ordena descendentemente por `score_urgencia`, y en caso de empate, por mayor importancia. El campo `[key: string]: unknown` en el tipo `Medicamento` permite que columnas adicionales de Supabase pasen a través sin romper el tipado.

### `app/layout.tsx`
Layout raíz mínimo (metadata + estructura HTML). No hay páginas (`app/page.tsx`) todavía, por lo que el proyecto no tiene una ruta visitable en el navegador más allá del endpoint API.

## Decisiones de diseño relevantes

- **Fallback en vez de fallo duro**: se prioriza que el endpoint siempre responda con datos utilizables, incluso sin infraestructura configurada. Bueno para demos y desarrollo; a vigilar en producción, donde un fallback silencioso podría ocultar un problema real de conexión con Supabase (hoy solo se loguea con `console.warn`).
- **Cálculo en el servidor, sin caché**: `force-dynamic` asegura datos frescos en cada request, a costa de no poder cachear. Aceptable al volumen actual; a revisar si el dataset crece mucho.
- **Sin capa de autenticación**: el endpoint es público. No hay control de acceso a nivel de aplicación; cualquier protección depende de las políticas RLS de Supabase (no verificadas en este repo).

## Roadmap

Lo que se espera agregar sobre esta base (orden aproximado de prioridad, a confirmar con el equipo):

1. **Interfaz de usuario**: página(s) en `app/` que consuman `/api/priorizacion` y muestren la tabla priorizada (probablemente con Tailwind, ya incluido).
2. **Escritura de datos**: endpoints o UI para dar de alta/editar medicamentos e inventario (hoy solo hay lectura).
3. **Autenticación y autorización**: identificar quién consulta/modifica datos; definir roles (p. ej. farmacia vs. administración).
4. **Persistencia real de configuración**: mover `peso_importancia` y otros parámetros de negocio a configuración editable en vez de constantes en código, si el negocio lo requiere.
5. **Tests automatizados**: unitarios para `calcularPrioridad()` (es lógica pura, fácil de cubrir) y de integración para el endpoint.
6. **Observabilidad**: reemplazar los `console.warn` de fallback por logging estructurado, y considerar alertar cuando el sistema esté sirviendo datos de fallback en producción.
7. **CI**: lint + typecheck + tests en cada PR.
