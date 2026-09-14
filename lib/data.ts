import type { Medicamento } from './priorizacion';

// Fallback si Supabase no está disponible
export const medicamentosFallback: Medicamento[] = [
  { id: 1, nombre: 'A', existencias: 100, consumo_diario: 20, tiempo_proveedor: 3, importancia: 'Alta' },
  { id: 2, nombre: 'B', existencias: 40, consumo_diario: 5, tiempo_proveedor: 5, importancia: 'Media' },
  { id: 3, nombre: 'C', existencias: 25, consumo_diario: 10, tiempo_proveedor: 4, importancia: 'Alta' },
  { id: 4, nombre: 'D', existencias: 200, consumo_diario: 8, tiempo_proveedor: 7, importancia: 'Baja' },
  { id: 5, nombre: 'E', existencias: 60, consumo_diario: 15, tiempo_proveedor: 2, importancia: 'Alta' },
  { id: 6, nombre: 'F', existencias: 30, consumo_diario: 3, tiempo_proveedor: 10, importancia: 'Media' },
];
