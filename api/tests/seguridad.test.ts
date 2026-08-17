// Test de seguridad del control de acceso por objeto (IDOR / BOLA · OWASP A01).
// En cp-04/cp-05 este test FALLABA (el ataque devolvia 200). En cp-06 pasa.
import { describe, it, expect, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { appDePrueba } from './helpers.js';

let app: FastifyInstance;

beforeEach(() => {
  app = appDePrueba().app;
});

describe('control de acceso por objeto (ownership)', () => {
  it('un tenant NO puede cambiar el estado de una cotizacion ajena (403)', async () => {
    // La cotizacion 1 es de ventas-norte; ventas-sur intenta moverla.
    const r = await app.inject({
      method: 'PATCH',
      url: '/cotizaciones/1/estado',
      headers: { 'x-tenant': 'ventas-sur', 'content-type': 'application/json' },
      payload: { estado: 'en_preparacion' },
    });
    expect(r.statusCode).toBe(403);

    // Y el estado real de la cotizacion no cambio.
    const detalle = await app.inject({
      method: 'GET',
      url: '/cotizaciones/1',
      headers: { 'x-tenant': 'ventas-norte' },
    });
    expect(detalle.json().estado).toBe('recibida');
  });

  it('el tenant dueño SI puede cambiar el estado (200)', async () => {
    const r = await app.inject({
      method: 'PATCH',
      url: '/cotizaciones/1/estado',
      headers: { 'x-tenant': 'ventas-norte', 'content-type': 'application/json' },
      payload: { estado: 'en_preparacion' },
    });
    expect(r.statusCode).toBe(200);
    expect(r.json().estado).toBe('en_preparacion');
  });
});
