# 02 · No funcional (NFR)

## Simplicidad y tamaño
- Poco codigo, legible. Cada capa con una responsabilidad clara
  (`db`, `normalize`, `estados`, `repo`, `server`).
- Dependencias minimas. Nada que no use la rebanada vertical.

## Ejecucion local
- Todo corre en local, sin nube ni contenedores.
- SQLite en archivo (`api/data/lab.sqlite`); en tests, base en memoria (`:memory:`).
- La API arranca en < 2 s y responde en milisegundos (dataset de juguete).

## Portabilidad
- Node >= 20 (probado en 24). Sin binarios exoticos salvo `better-sqlite3` (prebuild).
- Windows/macOS/Linux.

## Verificabilidad
- `npm run verify` = typecheck + tests. Debe poder correr sin red.
- Tests via `app.inject` de Fastify (sin abrir puertos).
- **No hay verde sin evidencia**: cada criterio de aceptacion relevante tiene su test.

## Observabilidad minima
- Log de arranque de la API con el puerto.
- Respuestas de error con `{ error, mensaje }` y codigo HTTP correcto.

## Seguridad (baseline del taller)
- Control de acceso **por objeto**: una cotizacion solo la gestiona su `tenant` dueño.
  (Este NFR es el que el fallo plantado viola a proposito hasta `cp-06`.)
- Validacion de entrada: estado destino dentro del enum; numeros coaccionados; `id` numerico.
- Sin secretos en el codigo; la ruta de la base sale de env o de un default local.

## Accesibilidad y UI
- Contraste suficiente, foco visible, tamaños de toque razonables.
- Estados de la cotizacion diferenciados por color **y** texto (no solo color).

## Rendimiento / costo (cuota Claude)
- Contextos acotados: specs cortas, memoria en archivos, checkpoints para saltar etapas.
- No regenerar todo el repo en cada iteracion; trabajar por capas.
