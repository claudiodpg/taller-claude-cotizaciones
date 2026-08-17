// Capa de rutas (Fastify). Aqui vive el control de acceso por objeto (ownership).
// cp-02: solo lectura. Las mutaciones (crear, cambiar estado) llegan en cp-04.
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import type { DB } from './db.js';
import { crearRepo } from './repo.js';

const TENANT_DEFAULT = 'ventas-norte';

/** Identidad simulada: el equipo/tenant que hace la peticion (cabecera x-tenant). */
function tenantDe(req: FastifyRequest): string {
  const h = req.headers['x-tenant'];
  const v = Array.isArray(h) ? h[0] : h;
  return (v && v.trim()) || TENANT_DEFAULT;
}

export function buildApp(db: DB): FastifyInstance {
  const app = Fastify({ logger: false });
  const repo = crearRepo(db);

  app.get('/salud', async () => ({ ok: true }));

  // Lista solo las cotizaciones del tenant que pide.
  app.get('/cotizaciones', async (req) => repo.listarPorTenant(tenantDe(req)));

  // Detalle: 404 si no existe o no es del tenant (no revela existencia ajena).
  app.get('/cotizaciones/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const c = repo.obtener(id);
    if (!c || c.tenant !== tenantDe(req)) {
      return reply.code(404).send({ error: 'no_encontrada', mensaje: 'Cotizacion no encontrada' });
    }
    return c;
  });

  app.get('/crm/cierres', async (req) => repo.listarCierresPorTenant(tenantDe(req)));

  return app;
}
