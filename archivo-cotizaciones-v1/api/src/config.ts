// Configuracion minima. Sin secretos en codigo: la ruta sale de env o de un default local.
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));

export const DB_FILE = process.env.LAB_DB ?? resolve(aqui, '../data/lab.sqlite');
export const PORT = Number(process.env.PORT ?? 3000);
