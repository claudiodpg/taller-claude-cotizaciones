# cp-06 · security-ready

## Que esta hecho
**El IDOR / BOLA quedo corregido.** En `PATCH /cotizaciones/:id/estado` se verifica ahora el
**ownership** antes de mutar: si la cotizacion no pertenece al tenant de la peticion → `403`.

- Fallo (cp-04/cp-05): `api/src/server.ts` — el handler obtenia la cotizacion por `:id` y mutaba
  sin comparar `c.tenant` con el tenant de la peticion.
- Fix (cp-06): `api/src/server.ts:69` —
  ```ts
  if (c.tenant !== tenantDe(req)) {
    return reply.code(403).send({ error: 'prohibido', mensaje: 'La cotizacion no pertenece a tu equipo' });
  }
  ```
- Test nuevo: `api/tests/seguridad.test.ts` — el ataque cross-tenant exige `403` y comprueba que el
  estado no cambio; el dueño sigue pudiendo mover (`200`). Este test **fallaba** en cp-05.

## Como se encontraba (metodo)
1. Preguntar por cada endpoint que toca un objeto `/:id`: "¿verifica que el objeto sea del que pide?".
2. `GET /:id` filtra por tenant (404 ajeno); `PATCH /:id/estado` **no** filtraba → sospecha.
3. Reproducir: con la base sembrada, `x-tenant: ventas-sur` mueve una cotizacion de `ventas-norte`
   y responde `200`. Confirmado.
4. Corregir en el unico punto de control (por eso concentramos la maquina de estados en un endpoint).
5. Blindar con un test que exija `403`.

## Que debia aprender el participante
- **FUNCIONA ≠ ES SEGURO** / **BUILDER ≠ AUDITOR**: el mismo codigo que pasaba todos los tests tenia
  un agujero de **A01: Broken Access Control** (OWASP). La auditoria mira lo que los tests de flujo no miran.
- El control de acceso **por objeto** (no solo "estar logueado") es una clase de bug propia (BOLA/IDOR).
- Un fix de seguridad se acompaña de un **test de regresion** que lo fija.

## Que viene
`cp-07 final`: consolidacion (handoff `ESTADO.md`, nota de memoria, README pulido) = solucion de referencia.

## Como continuar
```bash
npm install
npm run verify        # 12 tests en verde, incluido el de seguridad
git checkout cp-07
```

## Verificacion en esta etapa
- `npm run verify` en verde: 12 tests (2 de seguridad).
- Manual: ataque cross-tenant → `403`; dueño → `200`.
