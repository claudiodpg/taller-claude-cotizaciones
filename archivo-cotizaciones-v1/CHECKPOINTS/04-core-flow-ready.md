# cp-04 · core-flow-ready

## Que esta hecho
La **rebanada vertical completa** funciona de punta a punta:
- `POST /cotizaciones` — ingesta: normaliza una solicitud y crea la cotizacion (estado `recibida`).
- `PATCH /cotizaciones/:id/estado` — un solo endpoint implementa la **maquina de estados**
  (preparar, enviar, seguimiento, aceptar, rechazar), con validaciones:
  - transicion no permitida → `409`;
  - `seguimiento` exige `fechaSeguimiento` → `400` si falta;
  - `aceptada`/`rechazada` exige `resultado` → `400` si falta.
- Al pasar a `aceptada` se **registra el cierre en el CRM** (`cierres`); `GET /crm/cierres` lo lista.
- La UI (`web/`) suma los **botones de accion** en el detalle, que reflejan las transiciones validas
  segun el estado actual; el seed usa ids deterministas (1..N) para poder probar por id.

## ⚠️ Fallo de seguridad plantado (a proposito)
`PATCH /cotizaciones/:id/estado` cambia el estado usando **solo el `:id` de la URL, sin verificar
ownership**: cualquier equipo puede mover (y cerrar) cotizaciones ajenas. Es **IDOR / BOLA**
(OWASP **A01: Broken Access Control**). Esta presente en cp-04 y cp-05; se corrige en cp-06.

Demostracion (con la base sembrada):
```bash
# cot 2 es de ventas-norte. Un usuario de ventas-sur la modifica igual:
curl -X PATCH -H "x-tenant: ventas-sur" -H "content-type: application/json" \
     -d '{"estado":"en_preparacion"}' http://localhost:3000/cotizaciones/2/estado
# -> HTTP 200 y estado cambiado. NO deberia poder.
```

## Que debia aprender el participante
- Construir una rebanada vertical delgada (ingesta → cierre) es mas valioso que muchas features a medias.
- **FUNCIONA ≠ ES SEGURO**: el flujo "funciona" perfectamente y aun asi tiene un agujero de control de acceso.
- Concentrar la maquina de estados en un endpoint deja el punto de control de acceso en un solo lugar.

## Que viene
`cp-05 tests-ready`: tests de los flujos con Vitest + `npm run verify` en verde (los tests cubren el
comportamiento, todavia **no** detienen el IDOR).

## Como continuar
```bash
npm install && npm run seed && npm run dev
git checkout cp-05
```

## Verificacion en esta etapa
- `npm run typecheck` en verde.
- Flujo `recibida→…→aceptada` verificado por curl; cierre en CRM registrado.
- IDOR verificado como **presente** (HTTP 200 en ataque cross-tenant).
