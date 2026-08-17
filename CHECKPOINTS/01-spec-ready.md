# cp-01 · spec-ready

## Que esta hecho
`docs/spec/` completo, escrito **antes** de programar:
- `00-alcance.md` — problema, dentro/fuera de alcance, actores, definicion de terminado.
- `01-funcional.md` — modelo de datos, maquina de estados y **criterios de aceptacion** por caso de uso.
- `02-no-funcional.md` — simplicidad, ejecucion local, verificabilidad, seguridad baseline, UI, costo.
- `03-restricciones.md` — stack obligatorio, identidad simulada por `tenant`, **regla de ownership**
  y el aviso del fallo plantado; decisiones y riesgos.

## Que debia aprender el participante
- **Especificar es diseñar**: fijar modelo, estados y **criterios verificables** reduce el
  reproceso con Claude y evita el "funciona pero no cumple".
- Mayor velocidad (Claude) → mayor necesidad de **especificacion**.
- La regla de acceso por objeto queda escrita como NFR: luego el codigo la cumplira... o no.

## Que viene
`cp-02 architecture-ready`: esquema SQLite + capas (`db`, `normalize`, `estados`, `repo`,
`server`) y una API de **lectura** que ya siembra y lista.

## Como continuar
```bash
git checkout cp-02
npm install
npm run seed
```
