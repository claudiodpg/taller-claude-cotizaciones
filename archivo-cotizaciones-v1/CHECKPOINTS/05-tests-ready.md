# cp-05 · tests-ready

## Que esta hecho
Pruebas con **Vitest** sobre la API (via `app.inject`, sin abrir puertos ni red):
- `tests/normalize.test.ts` — normalizacion: trim/colapso de espacios, canonicalizacion de canal,
  coaccion de numeros e `importe` derivado, descarte de items invalidos.
- `tests/flujo.test.ts` — flujo end-to-end: lista scopeada por tenant, `recibida→…→aceptada` con
  registro en CRM, `409` en transicion invalida, `400` cuando falta `fechaSeguimiento`/`resultado`,
  `404` al pedir detalle ajeno.
- Separacion de tsconfig: `tsconfig.json` (build, solo `src`) vs `tsconfig.typecheck.json`
  (typecheck de `src` + `tests`).

`npm run verify` (typecheck de api+web + tests) queda **en verde**: 10 tests pasan.

## Nota sobre el fallo plantado
Los tests cubren el **comportamiento funcional**, no el control de acceso: por eso pasan **aunque
el IDOR siga presente**. Es el punto pedagogico: *SPEC✓ / CODIGO✓ / TESTS✓ pero PRODUCTO✗* — el
verde no prueba que sea seguro. El candado del "falso verde" (hook `no-cerrar-sin-pruebas`) y el
comando `/verificar` son piezas del **mini-kit** (`v2/kit/`); aqui el gate equivalente es `npm run verify`.

## Que debia aprender el participante
- **NO HAY VERDE SIN EVIDENCIA**: cada criterio de aceptacion relevante tiene su test.
- Tests rapidos y aislados (base `:memory:`, `app.inject`) que corren sin infraestructura.
- Un test suite verde **no** es una auditoria de seguridad (lo veremos en cp-06).

## Que viene
`cp-06 security-ready`: encontrar y corregir el IDOR; añadir el test de seguridad que ahora exige `403`.

## Como continuar
```bash
npm install
npm run verify        # typecheck + tests
git checkout cp-06
```

## Verificacion en esta etapa
- `npm run verify` en verde (typecheck api+web + 10 tests).
