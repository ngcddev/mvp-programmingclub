# Prompt para generar presentación en Canva (AI)

Este prompt está listo para pegar en **Canva AI / Magic Design** (o herramienta equivalente de generación de presentaciones) para crear una presentación del proyecto **Sistema de Priorización de Medicamentos Hospitalarios**.

## Prompt sugerido

```
Crea una presentación profesional de 9-10 diapositivas en español para presentar un MVP de software
a un equipo técnico y a stakeholders de un hospital (no todos son técnicos). El tono debe ser claro,
directo y confiable — es un sistema de salud, evita lenguaje exagerado o casual. Usa una paleta de
colores clínica/profesional (azules, blancos, un color de acento para alertas en rojo/naranja).
Incluye iconos relacionados a salud, inventario y datos donde tenga sentido.

Tema: "Sistema de Priorización de Reposición de Medicamentos Hospitalarios"

Estructura de contenido, una diapositiva por punto:

1. Portada
   - Título: "Priorización de Reposición de Medicamentos"
   - Subtítulo: "MVP — Next.js + Supabase"

2. El problema
   - En un hospital, decidir qué medicamento reponer primero es manual y depende de la experiencia
     del personal de farmacia.
   - Riesgo real: que un medicamento crítico se agote antes de que llegue el próximo pedido al proveedor.

3. El objetivo
   - Automatizar el cálculo de urgencia de reposición combinando: existencias actuales, consumo diario,
     tiempo de entrega del proveedor e importancia clínica del medicamento.
   - Dar una lista ordenada de "qué reponer primero" en vez de revisar medicamento por medicamento.

4. Cómo se calcula la urgencia (explicar con un ejemplo simple, no con fórmulas técnicas)
   - Días restantes = existencias disponibles / consumo diario.
   - Margen = días restantes − días que tarda el proveedor en entregar.
   - Si el margen es negativo, el medicamento se agotará ANTES de que llegue el próximo pedido: es crítico.
   - La importancia clínica del medicamento (Alta/Media/Baja) pondera el resultado.
   - Estados resultantes: Crítico, Alerta, OK (usar un semáforo visual: rojo, naranja/amarillo, verde).

5. Arquitectura del MVP (diagrama simple de cajas y flechas)
   - Base de datos Supabase (tabla de medicamentos) → Backend Next.js (calcula la priorización)
     → Respuesta con la lista ordenada.
   - Mencionar que si Supabase no está disponible, el sistema no muestra datos falsos en producción
     (evita decisiones basadas en información incorrecta).

6. Estado actual del proyecto
   - Lo que ya existe: cálculo de priorización, endpoint funcional, validación de datos inválidos,
     manejo de errores.
   - Lo que todavía no existe: interfaz visual para el usuario final, edición de datos desde la app,
     usuarios con permisos.

7. Alcance definido para esta etapa
   - Una sola sede/almacén (no múltiples hospitales todavía).
   - Sin historial de movimientos de inventario, solo estado actual.
   - Sin usuarios ni login todavía: es de solo lectura.

8. Próximos pasos (roadmap)
   - Interfaz visual para farmacia.
   - Registro de usuarios y roles.
   - Historial de movimientos de inventario.
   - Posibilidad de múltiples proveedores por medicamento.

9. Cierre
   - Mensaje de cierre: "Un primer paso para tomar decisiones de reposición basadas en datos, no en intuición."
   - Espacio para preguntas.

Usa gráficos simples (no tablas densas de datos), suficiente espacio en blanco, tipografía grande y
legible pensada para proyectarse en una sala de reuniones.
```

## Notas de uso

- Si Canva permite adjuntar contexto adicional (archivos), puedes complementar el prompt con `../README.md` y `../docs/requisitos.md` para que la IA tenga más detalle del proyecto.
- Ajusta la diapositiva 4 (fórmula) si el público es 100% técnico: en ese caso se puede mostrar la fórmula real (`score_urgencia = -margen × peso_importancia`) en vez de la explicación simplificada.
- Si más adelante se implementa la interfaz visual, conviene agregar una diapositiva de capturas de pantalla reales antes del cierre.
