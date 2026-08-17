# Lab · Gestion de Cotizaciones y Seguimiento Comercial

Repositorio de laboratorio del **Taller Claude v2**. Es **material didactico real y ejecutable**,
NO es produccion. Sirve para practicar el ciclo completo:
`ENTENDER → ESPECIFICAR → DISEÑAR → CONSTRUIR → VERIFICAR → ASEGURAR → CONSOLIDAR`.

El dominio es deliberadamente pequeño: una **rebanada vertical** que va de la solicitud entrante
hasta el cierre en un CRM simple, para poder construirla, probarla y auditarla en un taller de 8h
sin agotar la cuota de Claude Pro.

## Que se construye (la rebanada vertical)

```
ingesta (seed/JSON)  →  normalizacion  →  crear cotizacion (plantilla)
   →  cambiar estado (enviar)  →  registrar seguimiento  →  aceptar/rechazar
   →  registrar cierre en un "CRM" (tabla simple)
```

Estados de una cotizacion:

```
recibida → en_preparacion → enviada → seguimiento → aceptada | rechazada
```

## Requisitos

- **Node.js >= 20** (probado con Node 24). `node --version`
- **npm >= 9**.
- Toolchain de compilacion nativa para `better-sqlite3` (en macOS: Xcode Command Line Tools;
  en Linux: `build-essential` + `python3`; en Windows: usar prebuilds o `windows-build-tools`).
  En la mayoria de plataformas `better-sqlite3` instala un **prebuild** y no compila nada.

## Stack

- **api/** · Node + [Fastify](https://fastify.dev) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) · SQLite en archivo · TypeScript.
- **web/** · [Vite](https://vitejs.dev) + React · UI minima (lista + detalle) con design tokens en CSS variables.
- **seed/** · `solicitudes.json` con 8 solicitudes de ejemplo por 3 canales y 2 "tenants" (equipos).
- **Tests** · [Vitest](https://vitest.dev) sobre la API (via `app.inject`, sin red).

Sin nube, sin auth compleja, sin integraciones reales (WhatsApp/email/CRM externo), sin
multitenancy real, sin pagos ni dashboards. Los canales se **simulan** con JSON/seed.

## Instalacion

```bash
npm install
```

Esto instala las dependencias de la raiz y de los workspaces `api/` y `web/`.

## Sembrar la base de datos

```bash
npm run seed
```

Lee `seed/solicitudes.json`, **normaliza** cada solicitud (limpia espacios, canonicaliza el canal,
coacciona numeros, calcula el `importe`) y las inserta como cotizaciones en estado `recibida`
en `api/data/lab.sqlite`. Es idempotente: re-crea la base desde cero en cada corrida.

## Correr la API y la web

En dos terminales, o con un solo comando:

```bash
# ambos a la vez
npm run dev

# o por separado
npm run dev:api    # http://localhost:3000
npm run dev:web    # http://localhost:5173  (proxy /api -> :3000)
```

La web abre en `http://localhost:5173`. La lista de cotizaciones aparece a la izquierda; al
seleccionar una, el detalle a la derecha permite avanzar el estado (enviar, seguimiento,
aceptar/rechazar). El selector de **equipo** (arriba a la derecha) simula el usuario/tenant que
hace las llamadas (cabecera `x-tenant`).

## Verificacion

```bash
npm run verify     # typecheck (tsc --noEmit en cada workspace) + tests (vitest)
npm test           # solo tests
npm run typecheck  # solo tipos
```

## Endpoints de la API

| Metodo | Ruta | Que hace |
|---|---|---|
| GET | `/salud` | Healthcheck. |
| GET | `/cotizaciones` | Lista las cotizaciones **del tenant** (cabecera `x-tenant`). |
| GET | `/cotizaciones/:id` | Detalle (404 si no es del tenant). |
| POST | `/cotizaciones` | Crea una cotizacion desde una solicitud (la normaliza). |
| PATCH | `/cotizaciones/:id/estado` | Cambia el estado (maquina de estados). Al aceptar, registra el cierre en el CRM. |
| GET | `/crm/cierres` | Lista los cierres registrados del tenant. |

El tenant se toma de la cabecera `x-tenant` (por defecto `ventas-norte`). Es una **simulacion**
de identidad, no un sistema de auth real: sirve para ejercitar el control de acceso por objeto.

## Checkpoints recuperables (git tags)

El repo se construye por etapas, cada una con un tag y una ficha en `CHECKPOINTS/`. Si te quedas
sin cuota, rompes el entorno o te atrasas, puedes **saltar a cualquier etapa**:

```bash
git tag                 # lista los checkpoints disponibles
git checkout cp-03      # saltar al estado "UI lista"
git checkout main       # volver al final
```

| Tag | Nombre | Estado |
|---|---|---|
| `cp-00` | start | tooling + seed + README |
| `cp-01` | spec-ready | `docs/spec/` completo |
| `cp-02` | architecture-ready | esquema SQLite + capas + API de lectura |
| `cp-03` | ui-ready | pantalla lista + detalle con tokens |
| `cp-04` | core-flow-ready | rebanada vertical completa (**con el IDOR presente**) |
| `cp-05` | tests-ready | tests de flujos + `verify` en verde |
| `cp-06` | security-ready | **IDOR corregido** + test de seguridad |
| `cp-07` | final | consolidado (solucion de referencia) |

Cada ficha `CHECKPOINTS/NN-*.md` responde: que esta hecho, que debia aprender el participante,
que viene y como continuar (comandos).

## El fallo de seguridad plantado (IDOR / BOLA · OWASP A01)

> **Aviso didactico:** este repo contiene un fallo de seguridad **a proposito** entre `cp-04` y
> `cp-05`, para encontrarlo y corregirlo en `cp-06`.

El endpoint `PATCH /cotizaciones/:id/estado` toma el `:id` de la URL y cambia el estado **sin
verificar que la cotizacion pertenezca al tenant que hace la peticion**. Resultado: cualquier
equipo puede mover el estado (incluso aceptar/rechazar y cerrar en el CRM) de una cotizacion
**ajena** con solo conocer o adivinar su `id`. Es un caso de **Broken Object Level Authorization
(BOLA / IDOR)**, la categoria **A01: Broken Access Control** de OWASP.

Se corrige en `cp-06` añadiendo la verificacion de ownership antes de aplicar la transicion.
Ver `CHECKPOINTS/06-security-ready.md` para el detalle (archivo:linea del fallo y del fix).

## Estructura

```
lab-cotizaciones/
  package.json            # workspaces + scripts (dev/build/test/seed/verify)
  tsconfig.base.json
  README.md
  CHECKPOINTS/            # una ficha por checkpoint
  docs/spec/              # 00-alcance, 01-funcional, 02-no-funcional, 03-restricciones
  seed/solicitudes.json   # 8 solicitudes, 3 canales, 2 tenants
  api/                    # Fastify + better-sqlite3 (capas: db, normalize, estados, repo, server)
  web/                    # Vite + React (lista + detalle, tokens.css)
```

## Estado de verificacion

Ver la seccion "Estado de verificacion" al final de `CHECKPOINTS/07-final.md` para el resultado
real de la ultima corrida de `npm install` / `npm run verify` en el entorno donde se genero.
