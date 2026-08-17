# Memoria del proyecto — Lab Cotizaciones

Indice de memoria persistente del lab (consolidada en `cp-07`). Punteros cortos; el detalle vive en
los archivos canonicos, no aqui.

## Hechos estables del proyecto
- Dominio: gestion de cotizaciones + seguimiento comercial (rebanada vertical didactica).
- Estados: `recibida → en_preparacion → enviada → seguimiento → aceptada | rechazada`.
- Stack: TS · Fastify + better-sqlite3 (`api/`) · Vite + React (`web/`) · Vitest.
- Identidad = simulada por cabecera `x-tenant`; NO es auth real.

## Reglas aprendidas (no repetir errores)
- **Control de acceso por objeto (ownership)**: toda ruta `/:id` que muta debe verificar que el
  objeto pertenece al tenant. El olvido fue el IDOR/BOLA plantado (OWASP A01), corregido en `cp-06`
  (`api/src/server.ts:69`). Los tests de flujo NO lo detectan: hace falta un test de seguridad.
- **Seed determinista**: `limpiar()` resetea `sqlite_sequence` para que los ids sean siempre `1..N`
  (si no, AUTOINCREMENT los va corriendo entre corridas y rompe pruebas por id).
- **`importe` derivado** en el servidor; nunca aceptarlo del cliente.

## Punteros
- Spec: `docs/spec/00..03`.
- Handoff: `ESTADO.md`.
- Checkpoints: `CHECKPOINTS/NN-*.md` (tags `cp-00`…`cp-07`).
