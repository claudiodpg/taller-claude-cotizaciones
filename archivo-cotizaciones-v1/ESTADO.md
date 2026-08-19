# ESTADO / HANDOFF — Lab Cotizaciones

Documento de traspaso para cambiar de sesion, de agente o de modelo sin perder el hilo.
Este repo es la **solucion de referencia** del taller (estado final = `cp-07`).

## Que es
Rebanada vertical de gestion de cotizaciones: `ingesta → normalizacion → cotizacion → estados →
seguimiento → aceptar/rechazar → cierre en CRM`. Stack: TypeScript, Fastify + better-sqlite3
(`api/`), Vite + React (`web/`), Vitest.

## Estado actual
- Rebanada vertical **completa y funcionando**.
- `npm run verify` en verde: **12 tests** (flujo + normalizacion + seguridad).
- Fallo de seguridad plantado (IDOR/BOLA) **corregido** en `cp-06` (`api/src/server.ts:69`).
- Checkpoints `cp-00`…`cp-07` con tags y fichas en `CHECKPOINTS/`.

## Mapa mental del codigo
| Archivo | Responsabilidad |
|---|---|
| `api/src/db.ts` | Apertura SQLite + esquema/migracion + limpiar (seed determinista). |
| `api/src/normalize.ts` | Limpieza/canonicalizacion de solicitudes crudas; `importe` derivado. |
| `api/src/estados.ts` | Maquina de estados (transiciones permitidas). |
| `api/src/repo.ts` | Acceso a datos (sin permisos). |
| `api/src/server.ts` | Rutas Fastify + **control de acceso por objeto (ownership)**. |
| `api/src/seed.ts` | Carga `seed/solicitudes.json` a SQLite. |
| `web/src/App.tsx` | Lista + detalle + acciones de estado. |
| `web/src/tokens.css` | Design tokens. |

## Como retomar
```bash
npm install
npm run seed
npm run dev            # api :3000 + web :5173
npm run verify         # typecheck + tests
git tag                # ver checkpoints; git checkout cp-0X para saltar
```

## Decisiones vivas / limites (a proposito)
- Identidad = simulacion por cabecera `x-tenant` (no es auth real).
- Un solo endpoint de transicion concentra el punto de control de acceso.
- `importe` siempre derivado en el servidor (nunca desde el cliente).
- Fuera de alcance: integraciones reales, roles, pagos, dashboards, multitenancy real.

## Riesgos conocidos
- `better-sqlite3` es nativo: en algunas plataformas compila (documentado en `README.md`).
- Es material didactico, **no** produccion: sin hardening, rate-limiting ni auth real.
