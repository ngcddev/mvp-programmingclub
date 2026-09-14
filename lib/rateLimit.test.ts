// Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from './rateLimit.ts';

test('permite requests por debajo del límite', () => {
  const clave = `test-${Math.random()}`;
  const r1 = checkRateLimit(clave, 3, 60_000, 1000);
  const r2 = checkRateLimit(clave, 3, 60_000, 1000);
  assert.equal(r1.permitido, true);
  assert.equal(r1.restantes, 2);
  assert.equal(r2.restantes, 1);
});

test('bloquea al superar el límite dentro de la ventana', () => {
  const clave = `test-${Math.random()}`;
  checkRateLimit(clave, 2, 60_000, 1000);
  checkRateLimit(clave, 2, 60_000, 1000);
  const r3 = checkRateLimit(clave, 2, 60_000, 1000);
  assert.equal(r3.permitido, false);
  assert.equal(r3.restantes, 0);
});

test('libera cupo una vez que la ventana expira', () => {
  const clave = `test-${Math.random()}`;
  checkRateLimit(clave, 1, 1000, 0);
  const bloqueado = checkRateLimit(clave, 1, 1000, 500);
  const liberado = checkRateLimit(clave, 1, 1000, 1500);
  assert.equal(bloqueado.permitido, false);
  assert.equal(liberado.permitido, true);
});

test('claves distintas no comparten cupo', () => {
  const a = `test-a-${Math.random()}`;
  const b = `test-b-${Math.random()}`;
  checkRateLimit(a, 1, 60_000, 1000);
  const rb = checkRateLimit(b, 1, 60_000, 1000);
  assert.equal(rb.permitido, true);
});
