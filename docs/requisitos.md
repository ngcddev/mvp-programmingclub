# Levantamiento de requerimientos

## Objetivo del sistema

Ayudar al personal de farmacia de un hospital a decidir **qué medicamentos reponer primero**, calculando de forma automática un score de urgencia a partir del inventario actual, el consumo diario y el tiempo que tarda el proveedor en entregar.

## Alcance definido (MVP actual)

Decisiones tomadas para esta etapa del proyecto:

- **Una sola sede/almacén.** No se modelan múltiples hospitales ni bodegas independientes.
- **Sin entidad Proveedor.** El tiempo de entrega (`tiempo_proveedor`) se mantiene como un campo numérico dentro del medicamento, no como una tabla relacionada.
- **Sin historial de movimientos.** Solo se gestiona el estado actual de existencias; no se registran entradas/salidas de inventario.
- **Sin usuarios ni roles.** El sistema es de solo lectura y no requiere autenticación en esta etapa.

Estas decisiones se pueden revisar más adelante (ver `architecture.md`, sección Roadmap), pero **no forman parte del alcance actual** y no están reflejadas en el modelo de datos.

## Actores

| Actor | Descripción | Interacción actual |
|---|---|---|
| Personal de farmacia | Consulta qué medicamentos son urgentes de reponer | Lee la respuesta de `/api/priorizacion` (aún sin UI) |
| Sistema (Supabase) | Fuente de verdad del inventario | Tabla `medicamentos`, consultada por el backend |

No hay actores con capacidad de escritura todavía: la carga/actualización de datos en `medicamentos` ocurre fuera del sistema (directamente en Supabase).

## Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF1 | El sistema debe listar los medicamentos registrados con: nombre, existencias, consumo diario, tiempo del proveedor e importancia clínica. |
| RF2 | El sistema debe calcular, para cada medicamento, días restantes de inventario, margen frente al tiempo de entrega, y un score de urgencia. |
| RF3 | El sistema debe clasificar cada medicamento en un estado: `crítico` (se agota antes de que llegue el pedido), `alerta` (queda poco colchón) u `ok`. |
| RF4 | El sistema debe ordenar los medicamentos de mayor a menor urgencia. |
| RF5 | El sistema debe detectar y excluir registros con datos inválidos (negativos, vacíos, importancia desconocida, consumo diario en 0), informando el motivo de exclusión sin interrumpir el cálculo del resto. |
| RF6 | El sistema debe indicar si los datos mostrados provienen de Supabase o de un dataset de respaldo (`fallback`). |
| RF7 | Si Supabase no está disponible, el sistema muestra datos de ejemplo (también en producción, para la demo de la hackathon), siempre señalados como tales en la interfaz y en la API. Se deshabilita con `PERMITIR_DATOS_EJEMPLO=false`. |

## Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF1 | Las consultas a Supabase deben tener un timeout máximo (actualmente 8s) para no dejar la petición colgada. |
| RNF2 | Las respuestas del endpoint no deben cachearse: el inventario cambia con frecuencia y siempre debe reflejar el estado más reciente. |
| RNF3 | El sistema debe seguir respondiendo de forma controlada ante caídas o mala configuración de Supabase (fallback con datos de ejemplo; error explícito solo si se deshabilita con `PERMITIR_DATOS_EJEMPLO=false`). |
| RNF4 | El acceso a Supabase debe hacerse con la anon key protegida por Row Level Security; cualquier operación futura de escritura debe evaluarse con permisos server-side, no con la anon key pública. |

## Reglas de negocio

- **Peso por importancia clínica:** `Alta = 3`, `Media = 2`, `Baja = 1`.
- **Días restantes** = `existencias / consumo_diario`.
- **Margen** = `días_restantes − tiempo_proveedor`.
- **Score de urgencia** = `−margen × peso_importancia`. A mayor score, mayor urgencia.
- **Estado:**
  - `crítico` si `margen < 0`.
  - `alerta` si `0 ≤ margen < 3` días (umbral configurable, `UMBRAL_ALERTA_DIAS`).
  - `ok` en cualquier otro caso.
- **Desempate:** a igual score, gana el de mayor importancia clínica; si persiste el empate, se conserva el orden original (orden estable).
- Un medicamento con `consumo_diario = 0` no se agota nunca, por lo que se excluye del cálculo de urgencia (no aplica la fórmula).

## Fuera de alcance (explícito)

- Gestión de múltiples sedes o bodegas.
- Catálogo de proveedores como entidad independiente.
- Historial/trazabilidad de movimientos de inventario.
- Autenticación, usuarios y roles.
- Escritura o edición de datos desde la aplicación (alta/edición de medicamentos).

## Supuestos

- La tabla `medicamentos` en Supabase es alimentada y mantenida manualmente o por un proceso externo al MVP.
- El umbral de "alerta" (3 días) y los pesos de importancia son válidos para el contexto hospitalario actual; si cambian, hoy requieren un cambio de código (no son configurables desde UI).
- El volumen de medicamentos es lo suficientemente bajo como para calcular la priorización en cada request sin necesidad de caché o procesamiento por lotes.
