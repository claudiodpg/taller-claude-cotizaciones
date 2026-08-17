# 01 · Funcional (con criterios de aceptacion)

## Modelo de datos

### Cotizacion (entidad central)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | number | autoincremental |
| `tenant` | string | equipo dueño (simula identidad). Ej: `ventas-norte` |
| `cliente` | string | normalizado (trim) |
| `contacto` | string | normalizado |
| `canal` | string | canonicalizado: `formulario` \| `import-json` \| `import-csv` \| `otro` |
| `necesidad` | string | descripcion libre |
| `items` | `{producto,cantidad,precio}[]` | cantidad/precio numericos |
| `fecha` | string (ISO date) | fecha de la solicitud |
| `observaciones` | string | puede quedar vacia |
| `estado` | enum | ver maquina de estados |
| `importe` | number | **derivado**: suma de `cantidad*precio`, 2 decimales |
| `fechaSeguimiento` | string \| null | se fija al pasar a `seguimiento` |
| `resultado` | string \| null | motivo/nota al aceptar o rechazar |

### CierreCRM (CRM simple)
| Campo | Tipo |
|---|---|
| `id` | number |
| `cotizacionId` | number |
| `tenant` | string |
| `cliente` | string |
| `importe` | number |
| `resultado` | string |
| `fechaCierre` | string (ISO) |

## Maquina de estados
```
recibida → en_preparacion → enviada → seguimiento → aceptada
                                              └────→ rechazada
```
Transiciones permitidas (y solo esas):
- `recibida → en_preparacion`
- `en_preparacion → enviada`
- `enviada → seguimiento`
- `seguimiento → aceptada`
- `seguimiento → rechazada`

`aceptada` y `rechazada` son terminales.

## Casos de uso y criterios de aceptacion

### CU-1 · Ingesta + normalizacion (seed)
- **Dado** `seed/solicitudes.json` con datos sucios, **cuando** corro `npm run seed`, **entonces**
  se crean N cotizaciones en estado `recibida` con: strings sin espacios sobrantes, `canal`
  canonicalizado, `items` con numeros, e `importe` = suma de `cantidad*precio` (2 decimales).
- **Criterio**: una solicitud con `precio` en string (`"3.5"`) produce `importe` numerico correcto.

### CU-2 · Listar cotizaciones del equipo
- **Dado** un `tenant`, **cuando** hago `GET /cotizaciones` con `x-tenant`, **entonces** recibo
  solo las cotizaciones de ese tenant.
- **Criterio**: un tenant no ve las cotizaciones de otro en la lista.

### CU-3 · Ver detalle
- **Cuando** hago `GET /cotizaciones/:id` de una cotizacion **de mi tenant**, recibo el detalle
  con sus items e importe. Si el `id` no existe o no es de mi tenant → `404`.

### CU-4 · Crear cotizacion desde solicitud
- **Cuando** hago `POST /cotizaciones` con una solicitud, **entonces** se normaliza y se crea en
  estado `recibida`, asociada a mi `tenant`, con `importe` derivado.

### CU-5 · Avanzar estado (enviar / seguimiento / aceptar / rechazar)
- **Cuando** hago `PATCH /cotizaciones/:id/estado` con un `estado` destino **valido segun la
  maquina**, **entonces** se aplica; si la transicion no es valida → `409`.
- Pasar a `seguimiento` **exige** `fechaSeguimiento` en el cuerpo (si falta → `400`).
- Pasar a `aceptada`/`rechazada` **exige** `resultado` (si falta → `400`).
- **Criterio de ownership (ver 03-restricciones):** solo el tenant dueño puede cambiar el estado.

### CU-6 · Registrar cierre en CRM
- **Cuando** una cotizacion pasa a `aceptada`, **entonces** se inserta un `CierreCRM` con su
  importe y resultado. `GET /crm/cierres` lista los cierres del tenant.

## No objetivos funcionales
- No hay edicion de items, ni borrado, ni reapertura de estados terminales.
