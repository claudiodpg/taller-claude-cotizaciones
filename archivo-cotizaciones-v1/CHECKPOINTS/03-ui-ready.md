# cp-03 · ui-ready

## Que esta hecho
Workspace `web/` (Vite + React + TypeScript) con la pantalla **lista + detalle**:
- `tokens.css` — design tokens en CSS variables (color, estados, tipografia, espacio, radios).
- `styles.css` — layout de dos columnas, tarjetas, badges de estado, tabla de items. Foco visible,
  contraste, estado por **color + texto** (no solo color).
- `api.ts` — cliente que llama a `/api/*` con la cabecera `x-tenant` (proxy de Vite hacia la API).
- `App.tsx` — lista a la izquierda, detalle a la derecha, selector de **equipo** (tenant).
- `vite.config.ts` — proxy `/api → http://localhost:3000`.

Es de **solo lectura**: consume `GET /cotizaciones` y muestra el detalle. Las acciones para avanzar
el estado llegan en `cp-04`.

## Que debia aprender el participante
- **UI con criterio**: los tokens permiten iterar el look sin tocar componentes; la referencia es
  funcional (jerarquia, densidad, foco, accesibilidad), no decorativa.
- El estado se comunica con **texto + color**, no solo color (accesibilidad).
- El cambio de equipo (`x-tenant`) hace tangible que la lista esta **scopeada** por tenant.

## Que viene
`cp-04 core-flow-ready`: cerrar la rebanada vertical (crear via ingesta, `PATCH /:id/estado`,
cierre en CRM) y añadir los botones de accion. **Ojo:** cp-04 introduce el fallo de seguridad plantado.

## Como continuar
```bash
npm install
npm run seed
npm run dev        # api :3000 + web :5173
# abre http://localhost:5173  -> alterna el equipo arriba a la derecha
git checkout cp-04
```

## Verificacion en esta etapa
- `npm run typecheck` en verde (api + web).
- `npm run build` genera `web/dist`.
- La pantalla renderiza lista + detalle con tokens (verificado en navegador).
