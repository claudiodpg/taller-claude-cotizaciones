// Script de seed: lee seed/solicitudes.json, normaliza e inserta como cotizaciones 'recibida'.
// Idempotente: recrea la base desde cero en cada corrida.
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { abrirDB, limpiar } from './db.js';
import { crearRepo } from './repo.js';
import { normalizarSolicitud } from './normalize.js';
import { DB_FILE } from './config.js';
import type { SolicitudCruda } from './types.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const SEED_JSON = resolve(aqui, '../../seed/solicitudes.json');

function main(): void {
  mkdirSync(dirname(DB_FILE), { recursive: true });
  const db = abrirDB(DB_FILE);
  limpiar(db);

  const crudas = JSON.parse(readFileSync(SEED_JSON, 'utf8')) as SolicitudCruda[];
  const repo = crearRepo(db);

  let n = 0;
  const insertar = db.transaction((items: SolicitudCruda[]) => {
    for (const cruda of items) {
      repo.crear(normalizarSolicitud(cruda));
      n++;
    }
  });
  insertar(crudas);

  console.log(`Seed OK: ${n} cotizaciones cargadas en ${DB_FILE}`);
  db.close();
}

main();
