# cp-07 · final (solucion de referencia)

## Que esta hecho
Consolidacion del lab como **solucion de referencia**:
- `ESTADO.md` — handoff/traspaso (mapa del codigo, como retomar, decisiones y limites).
- `memory/MEMORY.md` — memoria del proyecto (hechos estables + reglas aprendidas, con punteros).
- Rebanada vertical completa, IDOR corregido, `npm run verify` en verde.

Este es el estado que un participante deberia alcanzar al terminar el taller.

## Que debia aprender el participante
- **CONSOLIDAR**: dejar un proceso reutilizable — handoff y memoria en archivos — para retomar en
  otra sesion/modelo sin perder contexto (gestion de contexto y de cuota).
- El ciclo se cierra: de un requerimiento a una spec verificable, una UI con criterio, una primera
  version construida con Claude, probada, auditada y con un proceso que se puede repetir.

## Recorrido completo (recap)
| Tag | Entregable |
|---|---|
| cp-00 | tooling + seed + README |
| cp-01 | spec (alcance, funcional+criterios, NFR, restricciones) |
| cp-02 | esquema SQLite + capas + API de lectura |
| cp-03 | UI lista+detalle con tokens |
| cp-04 | rebanada vertical completa (**IDOR presente**) |
| cp-05 | tests de flujos + verify en verde |
| cp-06 | **IDOR corregido** + test de seguridad |
| cp-07 | consolidado (este) |

## Como continuar (hazlo tuyo)
```bash
npm install && npm run seed && npm run dev
npm run verify
# Extensiones sugeridas (fuera del alcance del lab): filtros de lista, edicion de items,
# export CSV del CRM, o llevar la identidad simulada a un auth real.
```

## Estado de verificacion (real, en el entorno de generacion)
- **Entorno**: Node `v24.16.0`, npm 11, macOS (darwin).
- `npm install`: OK. `better-sqlite3` instalo via **prebuild** (sin compilar).
- `npm run seed`: OK, 8 cotizaciones cargadas (ids deterministas 1..8).
- `npm run typecheck` (api + web): **OK**.
- `npm test` / `npm run verify`: **OK — 12 tests en verde** (flujo 6, normalizacion 4, seguridad 2).
- `npm run build` (api tsc + web vite): OK (verificado en cp-03/cp-04).
- UI verificada en navegador (lista + detalle renderizan con tokens).
- IDOR verificado manualmente: ataque cross-tenant `403`, dueño `200`.
