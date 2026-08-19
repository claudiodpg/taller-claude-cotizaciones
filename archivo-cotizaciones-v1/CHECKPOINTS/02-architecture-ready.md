# cp-02 · architecture-ready

## Que esta hecho
Workspace `api/` con capas de responsabilidad unica:
- `db.ts` — apertura de SQLite + **esquema/migracion** (`cotizaciones`, `cierres`, indice por tenant).
- `types.ts` — tipos del dominio y enum de estados.
- `normalize.ts` — normalizacion de solicitudes crudas (trim, canal canonico, numeros, `importe` derivado).
- `estados.ts` — maquina de estados (transiciones permitidas).
- `repo.ts` — repositorio (solo datos; **no** decide permisos).
- `server.ts` — Fastify con rutas de **lectura**: `/salud`, `GET /cotizaciones`, `GET /cotizaciones/:id`, `GET /crm/cierres`.
- `seed.ts` — siembra la base desde el JSON (ya escribe en SQLite).
- `config.ts` / `index.ts` — configuracion y arranque.

## Que debia aprender el participante
- **Arquitectura por capas**: el repositorio no sabe de permisos; el control de acceso va en las
  rutas. Esta separacion es la que hara **visible** el fallo de seguridad mas adelante.
- El **esquema** y el modelo de datos se derivan de la spec, no al reves.
- La normalizacion es una capa explicita, no algo disperso.

## Que viene
`cp-03 ui-ready`: pantalla lista + detalle en `web/` (Vite + React) con design tokens, consumiendo
la API de lectura.

## Como continuar
```bash
npm install
npm run seed
npm run dev:api      # http://localhost:3000
curl -H "x-tenant: ventas-norte" localhost:3000/cotizaciones
git checkout cp-03
```

## Verificacion en esta etapa
- `npm run typecheck` en verde.
- `npm run seed` carga 8 cotizaciones.
- `GET /cotizaciones` devuelve 4 para `ventas-norte` y 4 para `ventas-sur` (scoping por tenant).
