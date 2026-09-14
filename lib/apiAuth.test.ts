// Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkApiKey } from './apiAuth.ts';

test('rechaza si PRIORIZACION_API_KEY no está configurada', () => {
  const prev = process.env.PRIORIZACION_API_KEY;
  delete process.env.PRIORIZACION_API_KEY;
  try {
    const r = checkApiKey('cualquier-cosa');
    assert.equal(r.ok, false);
  } finally {
    if (prev !== undefined) process.env.PRIORIZACION_API_KEY = prev;
  }
});

test('rechaza si falta el header', () => {
  const prev = process.env.PRIORIZACION_API_KEY;
  process.env.PRIORIZACION_API_KEY = 'secreta';
  try {
    const r = checkApiKey(null);
    assert.equal(r.ok, false);
  } finally {
    process.env.PRIORIZACION_API_KEY = prev;
  }
});

test('rechaza si la key no coincide', () => {
  const prev = process.env.PRIORIZACION_API_KEY;
  process.env.PRIORIZACION_API_KEY = 'secreta';
  try {
    const r = checkApiKey('incorrecta');
    assert.equal(r.ok, false);
  } finally {
    process.env.PRIORIZACION_API_KEY = prev;
  }
});

test('acepta si la key coincide', () => {
  const prev = process.env.PRIORIZACION_API_KEY;
  process.env.PRIORIZACION_API_KEY = 'secreta';
  try {
    const r = checkApiKey('secreta');
    assert.equal(r.ok, true);
  } finally {
    process.env.PRIORIZACION_API_KEY = prev;
  }
});

test('rechaza keys de distinta longitud sin lanzar error', () => {
  const prev = process.env.PRIORIZACION_API_KEY;
  process.env.PRIORIZACION_API_KEY = 'secreta-larga';
  try {
    const r = checkApiKey('corta');
    assert.equal(r.ok, false);
  } finally {
    process.env.PRIORIZACION_API_KEY = prev;
  }
});
