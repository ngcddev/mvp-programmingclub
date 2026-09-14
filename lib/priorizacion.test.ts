// Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularPrioridad, clasificarMedicamentos } from './priorizacion.ts';
import { medicamentosFallback } from './data.ts';

const base = { existencias: 10, consumo_diario: 1, tiempo_proveedor: 1, importancia: 'Media' };

test('orden esperado con los datos de ejemplo: C, F, A, E, B, D', () => {
  const r = calcularPrioridad(medicamentosFallback);
  assert.deepEqual(r.map((m) => m.nombre), ['C', 'F', 'A', 'E', 'B', 'D']);
});

test('valores calculados con la fórmula exacta', () => {
  const c = calcularPrioridad(medicamentosFallback).find((m) => m.nombre === 'C')!;
  assert.equal(c.dias_restantes, 2.5);
  assert.equal(c.margen, -1.5);
  assert.equal(c.score_urgencia, 4.5);
  assert.equal(c.estado, 'critico');
});

test('score 0 no queda como -0 (JSON y comparaciones limpias)', () => {
  const f = calcularPrioridad(medicamentosFallback).find((m) => m.nombre === 'F')!;
  assert.ok(Object.is(f.score_urgencia, 0));
  assert.equal(f.estado, 'alerta');
});

test('el orden no depende del orden de entrada', () => {
  const invertido = [...medicamentosFallback].reverse();
  const r = calcularPrioridad(invertido).map((m) => m.nombre);
  assert.deepEqual(r.slice(0, 2), ['C', 'F']);
  assert.equal(r[5], 'D');
  assert.equal(r[4], 'B'); // en el empate -6, Media (B) va después de las Alta (A, E)
});

test('consumo_diario 0 se excluye en vez de producir Infinity/NaN', () => {
  const { priorizados, excluidos } = clasificarMedicamentos([
    { ...base, nombre: 'X', consumo_diario: 0 },
    { ...base, nombre: 'Y', existencias: 0, consumo_diario: 0 },
  ]);
  assert.equal(priorizados.length, 0);
  assert.equal(excluidos.length, 2);
  assert.match(excluidos[0].motivo, /consumo_diario es 0/);
});

test('null, undefined, vacíos, negativos y texto no numérico se excluyen con motivo', () => {
  const { priorizados, excluidos } = clasificarMedicamentos([
    { ...base, nombre: 'n1', existencias: null },
    { ...base, nombre: 'n2', tiempo_proveedor: undefined },
    { ...base, nombre: 'n3', consumo_diario: '' },
    { ...base, nombre: 'n4', existencias: -5 },
    { ...base, nombre: 'n5', consumo_diario: 'abc' },
    { ...base, nombre: 'n6', importancia: 'Urgente' },
    { ...base, nombre: 'n7', importancia: null },
    null,
    'basura',
  ]);
  assert.equal(priorizados.length, 0);
  assert.equal(excluidos.length, 9);
  assert.ok(excluidos.every((e) => e.motivo.length > 0));
});

test('números como texto e importancia con mayúsculas/espacios se normalizan', () => {
  const [m] = calcularPrioridad([
    { nombre: 'S', existencias: '25', consumo_diario: '10', tiempo_proveedor: '4', importancia: '  ALTA ' },
  ]);
  assert.equal(m.importancia, 'Alta');
  assert.equal(m.existencias, 25);
  assert.equal(m.score_urgencia, 4.5);
});

test('existencias 0 con consumo > 0 es válido y se calcula normal (no se excluye)', () => {
  const r = calcularPrioridad([...medicamentosFallback, { ...base, nombre: 'Z', existencias: 0, importancia: 'Baja' }]);
  const z = r.find((m) => m.nombre === 'Z')!;
  assert.equal(z.dias_restantes, 0);
  assert.equal(z.margen, -1);
  assert.equal(z.score_urgencia, 1); // Baja: 1 < C (4.5), queda en segundo lugar
  assert.equal(z.estado, 'critico');
  assert.deepEqual(r.map((m) => m.nombre).slice(0, 2), ['C', 'Z']);
});

test('empates con ruido de coma flotante usan el desempate por importancia', () => {
  // 0.3/0.1 = 2.9999999999999996 → scores casi iguales
  // sin EPSILON 'ruido' (3.0000000000000004) quedaría antes que 'exacto' (3)
  const r = calcularPrioridad([
    { nombre: 'exacto', existencias: 3, consumo_diario: 1, tiempo_proveedor: 6, importancia: 'Baja' },
    { nombre: 'ruido', existencias: 0.3, consumo_diario: 0.1, tiempo_proveedor: 6, importancia: 'Baja' },
    { nombre: 'media', existencias: 4.5, consumo_diario: 1, tiempo_proveedor: 6, importancia: 'Media' },
  ]);
  // los tres tienen score ≈ 3: Media gana el desempate, luego se respeta el orden de entrada
  assert.deepEqual(r.map((m) => m.nombre), ['media', 'exacto', 'ruido']);
});

test('entrada que no es arreglo devuelve vacío sin lanzar error', () => {
  assert.deepEqual(calcularPrioridad(null), []);
  assert.deepEqual(calcularPrioridad(undefined), []);
  assert.deepEqual(calcularPrioridad({}), []);
  assert.deepEqual(calcularPrioridad([]), []);
});

test('no muta el arreglo original', () => {
  const copia = JSON.parse(JSON.stringify(medicamentosFallback));
  calcularPrioridad(medicamentosFallback);
  assert.deepEqual(medicamentosFallback, copia);
});

test('el resultado se serializa a JSON sin null en campos numéricos', () => {
  const json = JSON.parse(JSON.stringify(calcularPrioridad(medicamentosFallback)));
  for (const m of json) {
    for (const k of ['dias_restantes', 'margen', 'score_urgencia']) assert.equal(typeof m[k], 'number');
  }
});
