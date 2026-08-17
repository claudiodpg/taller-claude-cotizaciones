// Punto de entrada: abre la base y levanta la API.
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { abrirDB } from './db.js';
import { buildApp } from './server.js';
import { DB_FILE, PORT } from './config.js';

mkdirSync(dirname(DB_FILE), { recursive: true });
const db = abrirDB(DB_FILE);
const app = buildApp(db);

app
  .listen({ port: PORT, host: '127.0.0.1' })
  .then(() => console.log(`API escuchando en http://127.0.0.1:${PORT}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
