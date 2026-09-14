export type Importancia = 'Alta' | 'Media' | 'Baja';

export type Medicamento = {
  id?: number | string;
  nombre?: string;
  existencias: number;
  consumo_diario: number;
  tiempo_proveedor: number;
  importancia: Importancia;
  [key: string]: unknown;
};

export type MedicamentoPriorizado = Medicamento & {
  dias_restantes: number;
  margen: number;
  score_urgencia: number;
};

export const peso_importancia: Record<Importancia, number> = { Alta: 3, Media: 2, Baja: 1 };

export function calcularPrioridad(medicamentos: Medicamento[]): MedicamentoPriorizado[] {
  return medicamentos
    .map((m) => {
      const existencias = Number(m.existencias);
      const consumo_diario = Number(m.consumo_diario);
      const tiempo_proveedor = Number(m.tiempo_proveedor);
      const peso = peso_importancia[m.importancia] ?? 1;

      const dias_restantes = existencias / consumo_diario;
      const margen = dias_restantes - tiempo_proveedor;
      const score_urgencia = -margen * peso + 0; // +0 evita -0

      return { ...m, dias_restantes, margen, score_urgencia };
    })
    .sort(
      (a, b) =>
        b.score_urgencia - a.score_urgencia ||
        // Desempate: mayor importancia primero (orden original si sigue empatado)
        (peso_importancia[b.importancia] ?? 1) - (peso_importancia[a.importancia] ?? 1)
    );
}
