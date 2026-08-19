# 03 · Restricciones y decisiones

## Restricciones de stack (obligatorias)
- TypeScript en todo el codigo.
- `api/`: Node + Fastify + better-sqlite3, SQLite en archivo.
- `web/`: Vite + React, UI minima con tokens en CSS variables.
- Tests con Vitest. Seed en JSON.
- Sin nube, sin auth compleja, sin integraciones reales, sin multitenancy real, sin pagos,
  sin dashboards.

## Modelo de identidad (simulado)
- La identidad es una **simulacion**: el cliente manda la cabecera `x-tenant` (equipo).
  No es autenticacion real (no hay password, token ni sesion). Sirve solo para ejercitar el
  **control de acceso por objeto** de forma didactica.
- Default `x-tenant: ventas-norte` cuando no se envia.

## Regla de acceso por objeto (ownership)
- **Toda operacion sobre una cotizacion concreta (`/:id`) debe verificar que la cotizacion
  pertenece al `tenant` de la peticion antes de leer o mutar.**
- Lectura ajena → `404` (no revelar existencia). Mutacion ajena → `403`.

> **Fallo plantado (a proposito):** entre `cp-04` y `cp-05`, el endpoint
> `PATCH /cotizaciones/:id/estado` **incumple** esta regla: cambia el estado por `:id` sin
> verificar ownership (IDOR / BOLA, OWASP A01). Se corrige en `cp-06`.

## Decisiones
- **Un solo endpoint de transicion** (`PATCH /:id/estado`) implementa toda la maquina de estados
  (enviar, seguimiento, aceptar, rechazar). Mantiene la superficie pequeña y concentra la regla
  de ownership en un punto (bueno para enseñar el fallo y el fix).
- **CRM = tabla** `cierres`. El cierre se registra automaticamente al aceptar.
- **`importe` es derivado**, nunca se acepta desde el cliente (evita inconsistencias).
- **better-sqlite3 sincrono**: simplifica el codigo (sin async en la capa de datos); aceptable
  para un dataset de juguete local.
- Base en memoria para tests → rapidos, aislados, sin tocar el archivo real.

## Riesgos y mitigaciones
- `better-sqlite3` es modulo nativo: en algunas plataformas compila. Mitigacion: prebuilds;
  documentado en README. Alternativa de respaldo NO usada por restriccion de stack.
- Cuota de Claude: se mitiga con specs cortas, capas y checkpoints.
