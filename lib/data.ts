import type { Medicamento } from './priorizacion';

// Fallback si Supabase no está disponible
export const medicamentosFallback: Medicamento[] = [
  { nombre: 'A', existencias: 100, consumo_diario: 20, tiempo_proveedor: 3, importancia: 'Alta' },
  { nombre: 'B', existencias: 40, consumo_diario: 5, tiempo_proveedor: 5, importancia: 'Media' },
  { nombre: 'C', existencias: 25, consumo_diario: 10, tiempo_proveedor: 4, importancia: 'Alta' },
  { nombre: 'D', existencias: 200, consumo_diario: 8, tiempo_proveedor: 7, importancia: 'Baja' },
  { nombre: 'E', existencias: 60, consumo_diario: 15, tiempo_proveedor: 2, importancia: 'Alta' },
  { nombre: 'F', existencias: 30, consumo_diario: 3, tiempo_proveedor: 10, importancia: 'Media' },
];
