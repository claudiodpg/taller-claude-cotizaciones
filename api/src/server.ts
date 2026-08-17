// Capa de rutas (Fastify). Aqui vive el control de acceso por objeto (ownership).
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import type { DB } from './db.js';
import { crearRepo } from './repo.js';
import { normalizarSolicitud } from './normalize.js';
import { esEstado, puedeTransicionar } from './estados.js';
import type { SolicitudCruda } from './types.js';

const TENANT_DEFAULT = 'ventas-norte';

/** Identidad simulada: el equipo/tenant que hace la peticion (cabecera x-tenant). */
function tenantDe(req: FastifyRequest): string {
  const h = req.headers['x-tenant'];
  const v = Array.isArray(h) ? h[0] : h;
  return (v && v.trim()) || TENANT_DEFAULT;
}

interface CuerpoEstado {
  estado?: string;
  fechaSeguimiento?: string;
  resultado?: string;
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

  // Ingesta: crea una cotizacion desde una solicitud (se normaliza), asociada a mi tenant.
  app.post('/cotizaciones', async (req, reply) => {
    const cruda = (req.body ?? {}) as SolicitudCruda;
    const normal = normalizarSolicitud(cruda, tenantDe(req));
    if (!normal.cliente) {
      return reply.code(400).send({ error: 'invalida', mensaje: 'Falta el cliente' });
    }
    return reply.code(201).send(repo.crear(normal));
  });

  // Cambiar estado (maquina de estados). Al aceptar, registra el cierre en el CRM.
  app.patch('/cotizaciones/:id/estado', async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const cuerpo = (req.body ?? {}) as CuerpoEstado;

    const c = repo.obtener(id);
    if (!c) {
      return reply.code(404).send({ error: 'no_encontrada', mensaje: 'Cotizacion no encontrada' });
    }

    // -------------------------------------------------------------------------
    // FALLO PLANTADO (IDOR / BOLA · OWASP A01) — cp-04/cp-05.
    // Se cambia el estado usando SOLO el :id de la URL, sin verificar que la
    // cotizacion pertenezca al tenant de la peticion. Cualquier equipo puede
    // mover (y cerrar) cotizaciones ajenas conociendo su id.
    // El fix (verificar ownership) llega en cp-06.
    // -------------------------------------------------------------------------

    const destino = cuerpo.estado;
    if (!esEstado(destino)) {
      return reply.code(400).send({ error: 'estado_invalido', mensaje: 'Estado destino invalido' });
    }
    if (!puedeTransicionar(c.estado, destino)) {
      return reply
        .code(409)
        .send({ error: 'transicion_invalida', mensaje: `No se puede pasar de ${c.estado} a ${destino}` });
    }
    if (destino === 'seguimiento' && !cuerpo.fechaSeguimiento) {
      return reply.code(400).send({ error: 'falta_fecha', mensaje: 'seguimiento requiere fechaSeguimiento' });
    }
    if ((destino === 'aceptada' || destino === 'rechazada') && !cuerpo.resultado) {
      return reply.code(400).send({ error: 'falta_resultado', mensaje: 'aceptar/rechazar requiere resultado' });
    }

    const actualizada = repo.actualizarEstado(id, {
      estado: destino,
      fechaSeguimiento: cuerpo.fechaSeguimiento ?? null,
      resultado: cuerpo.resultado ?? null,
    });

    if (destino === 'aceptada') {
      repo.registrarCierre(actualizada);
    }

    return actualizada;
  });

  app.get('/crm/cierres', async (req) => repo.listarCierresPorTenant(tenantDe(req)));

  return app;
}
