# cp-00 · start

## Que esta hecho
- Estructura del repo y tooling: `package.json` con workspaces (`api`, `web`) y scripts
  `dev`, `build`, `test`, `seed`, `verify`, `typecheck`.
- `tsconfig.base.json` compartido, `.gitignore`.
- **Seed**: `seed/solicitudes.json` con 8 solicitudes deliberadamente "sucias" (espacios,
  canales con distinto formato, numeros como strings, observaciones nulas) repartidas en 3
  canales y 2 equipos (`ventas-norte`, `ventas-sur`).
- `README.md` con requisitos, instalacion, seed, ejecucion y mapa de checkpoints.

## Que debia aprender el participante
- Un proyecto arranca por el **andamiaje y los datos**, no por el codigo de features.
- Los datos reales llegan sucios: por eso habra una etapa de **normalizacion**.
- Los **checkpoints** (git tags) son la red de seguridad para no perder el hilo si se agota la
  cuota o se rompe el entorno.

## Que viene
`cp-01 spec-ready`: llenar `docs/spec/` (alcance, funcional con criterios de aceptacion, no
funcional, restricciones) **antes** de escribir codigo.

## Como continuar
```bash
npm install
npm run seed          # aun no hay API; en cp-02 la escribimos y ya siembra en SQLite
git checkout cp-01    # ver la spec completa
```
