// Helper de pruebas: una app Fastify con una base en memoria ya sembrada.
// Ids deterministas: norte = 1 y 2, sur = 3.
import { abrirDB } from '../src/db.js';
import { crearRepo } from '../src/repo.js';
import { normalizarSolicitud } from '../src/normalize.js';
import { buildApp } from '../src/server.js';

export function appDePrueba() {
  const db = abrirDB(':memory:');
  const repo = crearRepo(db);
  repo.crear(
    normalizarSolicitud(
      { cliente: 'Cliente Norte 1', canal: 'Formulario Web', items: [{ producto: 'A', cantidad: '2', precio: '10' }], fecha: '2026-08-10' },
      'ventas-norte',
    ),
  );
  repo.crear(
    normalizarSolicitud(
      { cliente: 'Cliente Norte 2', canal: 'json', items: [{ producto: 'B', cantidad: 1, precio: 5 }], fecha: '2026-08-11' },
      'ventas-norte',
    ),
  );
  repo.crear(
    normalizarSolicitud(
      { cliente: 'Cliente Sur 1', canal: 'csv', items: [{ producto: 'C', cantidad: '3', precio: '4' }], fecha: '2026-08-12' },
      'ventas-sur',
    ),
  );
  return { app: buildApp(db), db };
}
