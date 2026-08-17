import { describe, it, expect, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { appDePrueba } from './helpers.js';

let app: FastifyInstance;

beforeEach(() => {
  app = appDePrueba().app;
});

interface CuerpoEstado {
  estado: string;
  fechaSeguimiento?: string;
  resultado?: string;
}

function patchEstado(id: number, tenant: string, body: CuerpoEstado) {
  return app.inject({
    method: 'PATCH',
    url: `/cotizaciones/${id}/estado`,
    headers: { 'x-tenant': tenant, 'content-type': 'application/json' },
    payload: body,
  });
}

function get(url: string, tenant: string) {
  return app.inject({ method: 'GET', url, headers: { 'x-tenant': tenant } });
}

describe('flujo comercial', () => {
  it('lista scopeada por tenant', async () => {
    expect((await get('/cotizaciones', 'ventas-norte')).json()).toHaveLength(2);
    expect((await get('/cotizaciones', 'ventas-sur')).json()).toHaveLength(1);
  });

  it('avanza recibida -> aceptada y registra el cierre en el CRM', async () => {
    await patchEstado(1, 'ventas-norte', { estado: 'en_preparacion' });
    await patchEstado(1, 'ventas-norte', { estado: 'enviada' });
    await patchEstado(1, 'ventas-norte', { estado: 'seguimiento', fechaSeguimiento: '2026-08-20' });
    const r = await patchEstado(1, 'ventas-norte', { estado: 'aceptada', resultado: 'Compra confirmada' });
    expect(r.statusCode).toBe(200);
    expect(r.json().estado).toBe('aceptada');

    const crm = await get('/crm/cierres', 'ventas-norte');
    expect(crm.json()).toHaveLength(1);
    expect(crm.json()[0].importe).toBe(20);
  });

  it('rechaza una transicion invalida con 409', async () => {
    const r = await patchEstado(1, 'ventas-norte', { estado: 'enviada' }); // recibida -> enviada no permitido
    expect(r.statusCode).toBe(409);
  });

  it('exige fechaSeguimiento al pasar a seguimiento (400)', async () => {
    await patchEstado(1, 'ventas-norte', { estado: 'en_preparacion' });
    await patchEstado(1, 'ventas-norte', { estado: 'enviada' });
    const r = await patchEstado(1, 'ventas-norte', { estado: 'seguimiento' });
    expect(r.statusCode).toBe(400);
  });

  it('exige resultado al aceptar/rechazar (400)', async () => {
    await patchEstado(1, 'ventas-norte', { estado: 'en_preparacion' });
    await patchEstado(1, 'ventas-norte', { estado: 'enviada' });
    await patchEstado(1, 'ventas-norte', { estado: 'seguimiento', fechaSeguimiento: '2026-08-20' });
    const r = await patchEstado(1, 'ventas-norte', { estado: 'aceptada' });
    expect(r.statusCode).toBe(400);
  });

  it('el detalle de una cotizacion ajena responde 404', async () => {
    const r = await get('/cotizaciones/3', 'ventas-norte'); // la 3 es de ventas-sur
    expect(r.statusCode).toBe(404);
  });
});
