# Mini-lab "Cotiza" — laboratorio del taller de Claude Code

> **Presentación del taller:** `Taller-Claude-Yuri.pptx` (en la raíz de este repo).

Un laboratorio minimo y honesto para practicar el flujo del taller: una **landing**
con un **formulario de contacto** que de verdad guarda lo que envias, y un **panel**
donde un miembro del equipo entra eligiendo su usuario (no hay login real, es un
selector) y ve sus contactos.

Trae plantada, **a proposito**, una falla de control de acceso (tipo IDOR): estando
como Ana puedes abrir un contacto de Beto. Ese hueco se caza y se corrige en la
seccion de seguridad del taller. No es un error del laboratorio.

## Requisitos

- Node 18 o superior (trae el modulo `http` nativo; el servidor no usa dependencias).
- npm.

## Pasos (Windows)

```bat
npm install
npm run dev
```

Con el servidor corriendo, abre la landing:

```bat
start http://localhost:9777
```

`localhost` es tu propia maquina: el servidor corre en tu PC y `localhost:9777`
es la direccion para hablar con el, sin salir a internet.

Ahora:

1. Envia el **formulario de contacto** de la landing. Veras una pagina de "Gracias!"
   y el envio queda guardado en `data/contactos.json`.
2. Abre el **panel** del equipo:

   ```bat
   start http://localhost:9777/panel?usuario=ana
   ```

   Usa el selector de arriba para cambiar entre **Ana** y **Beto**. Cada uno ve
   solo **sus** contactos, con enlace al detalle y un boton "marcar contactado".

Para detener el servidor: `Ctrl + C` en la terminal.

## Pruebas

```bat
npm run verify
```

Corre las pruebas (Vitest) de la logica del formulario: campos obligatorios,
formato de correo y guardado. Deben salir **todas en verde**.

## El hueco a proposito (control de acceso)

El panel filtra por usuario, pero el **detalle** de un contacto (`/contacto/:id`)
y el boton de "marcar contactado" **no verifican** que el contacto sea del usuario
elegido. Estando como Ana, si abres el numero de un contacto de Beto, lo ves igual.
Eso es un **IDOR**, y es justo lo que se caza y se corrige en la parte de seguridad
del taller. La solucion vive en `SOLUCION.md` (para el instructor).

## Estructura

```
mini-lab/
├── server.js            servidor http nativo (sin dependencias en runtime)
├── package.json         scripts: dev (node server.js) y verify (vitest run)
├── public/
│   └── index.html       landing con el formulario (placeholder honesto)
├── lib/
│   ├── validacion.js    validacion pura del formulario
│   └── contactos.js     logica de contactos + persistencia JSON
├── data/
│   └── contactos.json   los envios (viene sembrado con ejemplos)
├── test/
│   └── formulario.test.js
├── README.md
└── SOLUCION.md          para el instructor: el fix del IDOR + su prueba
```
