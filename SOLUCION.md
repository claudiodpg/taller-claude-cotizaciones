# SOLUCION (para el instructor)

> Esto es la **respuesta**, no el estado inicial del laboratorio. El lab se entrega
> con el hueco ABIERTO: el codigo pasa las pruebas del formulario y aun asi tiene la
> falla de control de acceso. Ese es el punto del taller: **funciona != es seguro**.
> No compartas este archivo con los participantes antes de la seccion de seguridad.

## La falla: IDOR (Insecure Direct Object Reference)

En `server.js`, las rutas `GET /contacto/:id` y `POST /contacto/:id/contactado`
buscan el contacto por su numero (`id`) y lo muestran o modifican **sin comprobar
que pertenezca al usuario elegido en el panel** (`usuario`). Como el `id` viene del
cliente (la URL) y no se valida contra el dueno, estando como Ana puedes abrir o
marcar el contacto #7, que es de Beto.

Es un IDOR / Broken Access Control (OWASP A01): se accede al recurso de otro por su
id sin verificar la propiedad.

## (a) El arreglo

Verifica que el dueno del contacto coincida con el usuario activo antes de mostrarlo
o modificarlo; si no coincide, responde "no autorizado" (403).

Un helper para no repetir:

```js
// Devuelve el contacto solo si es del usuario; si no, null.
function contactoAutorizado(lista, id, usuario) {
  const c = buscarPorId(lista, id);
  if (!c) return { estado: "no-existe" };
  if (c.dueno !== usuario) return { estado: "no-autorizado" };
  return { estado: "ok", contacto: c };
}
```

`GET /contacto/:id` corregido:

```js
m = ruta.match(/^\/contacto\/(\d+)$/);
if (req.method === "GET" && m) {
  const id = Number(m[1]);
  let usuario = url.searchParams.get("usuario");
  if (!USUARIOS.includes(usuario)) usuario = USUARIOS[0];

  const r = contactoAutorizado(cargar(), id, usuario);
  if (r.estado === "no-existe")
    return html(res, 404, pagina("No encontrado", "<h1>404</h1>"));
  if (r.estado === "no-autorizado")
    return html(res, 403, pagina("No autorizado",
      "<h1>403 &middot; No autorizado</h1><p>Ese contacto no es tuyo.</p>"));

  return html(res, 200, paginaDetalle(usuario, r.contacto));
}
```

`POST /contacto/:id/contactado` corregido (misma comprobacion antes de persistir):

```js
let m = ruta.match(/^\/contacto\/(\d+)\/contactado$/);
if (req.method === "POST" && m) {
  const id = Number(m[1]);
  const datos = await leerCuerpo(req);
  let usuario = datos.usuario;
  if (!USUARIOS.includes(usuario)) usuario = USUARIOS[0];

  const lista = cargar();
  const r = contactoAutorizado(lista, id, usuario);
  if (r.estado === "no-existe")
    return html(res, 404, pagina("No encontrado", "<h1>404</h1>"));
  if (r.estado === "no-autorizado")
    return html(res, 403, pagina("No autorizado", "<h1>403</h1>"));

  persistir(marcarContactado(lista, id));
  res.writeHead(303, { location: `/panel?usuario=${encodeURIComponent(usuario)}` });
  return res.end();
}
```

Regla de fondo: **el id externo es dato no confiable**; la autorizacion se decide
cruzando el recurso con la identidad activa, no confiando en el id que manda el
cliente.

## (b) La prueba de seguridad (se agrega en la seccion Asegurar)

Para poder probarlo sin levantar el servidor, la comprobacion de propiedad vive en
la funcion pura `contactoAutorizado` (extraela a `lib/contactos.js` al hacer el fix).
La prueba de regresion, con el arreglo puesto, confirma que Ana NO puede abrir el
contacto de Beto y SI puede abrir el suyo:

```js
// test/seguridad.test.js  (se agrega en la seccion Asegurar)
import { describe, it, expect } from "vitest";
import { contactoAutorizado } from "../lib/contactos.js";

const lista = [
  { id: 5, dueno: "ana",  nombre: "Valentina" },
  { id: 7, dueno: "beto", nombre: "Camila" },
];

describe("control de acceso a un contacto (IDOR)", () => {
  it("Ana NO puede abrir el contacto #7 de Beto", () => {
    expect(contactoAutorizado(lista, 7, "ana").estado).toBe("no-autorizado");
  });

  it("Ana SI puede abrir su propio contacto #5", () => {
    const r = contactoAutorizado(lista, 5, "ana");
    expect(r.estado).toBe("ok");
    expect(r.contacto.id).toBe(5);
  });

  it("un id inexistente responde no-existe", () => {
    expect(contactoAutorizado(lista, 999, "ana").estado).toBe("no-existe");
  });
});
```

Con el codigo inicial (sin el fix) esta prueba fallaria (el primer caso daria "ok").
Con el fix aplicado, pasa. Por eso NO se incluye en el lab de arranque: rompería el
momento "Verificar = verde". El hueco queda LATENTE hasta la seccion de seguridad.
