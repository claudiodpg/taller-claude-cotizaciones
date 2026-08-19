// Servidor del mini-lab. Solo el modulo http nativo de Node: CERO dependencias
// en runtime. Sirve public/ y expone las rutas del taller. Puerto 9777.
//
// NOTA DEL TALLER: /contacto/:id y /contacto/:id/contactado NO verifican que el
// contacto sea del usuario elegido en el panel. Esa es la falla plantada (IDOR)
// que se caza y corrige en la seccion de seguridad. No la "arregles" aqui.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";

import {
  cargar,
  persistir,
  agregarContacto,
  asignarDueno,
  contactosDe,
  buscarPorId,
  marcarContactado,
  USUARIOS,
} from "./lib/contactos.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "public");
const PUERTO = process.env.PORT || 9777;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
};

// --- utilidades ---

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function html(res, codigo, cuerpo) {
  res.writeHead(codigo, { "content-type": "text/html; charset=utf-8" });
  res.end(cuerpo);
}

function leerCuerpo(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      const tipo = req.headers["content-type"] || "";
      if (tipo.includes("application/json")) {
        try {
          resolve(JSON.parse(data || "{}"));
        } catch {
          resolve({});
        }
      } else {
        // application/x-www-form-urlencoded (formulario HTML)
        const out = {};
        for (const [k, v] of new URLSearchParams(data)) out[k] = v;
        resolve(out);
      }
    });
  });
}

function pagina(titulo, contenido) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(titulo)}</title>
<style>
  body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#4a5563;background:#f6f7f9;line-height:1.5;margin:0}
  .wrap{max-width:720px;margin:0 auto;padding:40px 20px 64px}
  a{color:#1f5f4a}
  h1{color:#1f2733;font-size:26px;margin:0 0 8px}
  h2{color:#1f2733;font-size:18px;margin:24px 0 8px}
  .card{background:#fff;border:1px solid #d9dee5;border-radius:10px;padding:20px;margin-top:16px}
  .ok{color:#1f5f4a;font-weight:600}
  .error{color:#b3261e;font-weight:600}
  ul.errores{margin:8px 0 0;padding-left:18px;color:#b3261e}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e6e9ee;font-size:14px}
  th{color:#1f2733}
  .badge{display:inline-block;font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid #d9dee5;background:#f6f7f9}
  .badge.si{color:#1f5f4a;border-color:#bfe0d3;background:#eef7f2}
  .selector{margin:12px 0}
  .btn{display:inline-block;padding:6px 12px;font:inherit;font-weight:600;color:#fff;background:#1f5f4a;border:1px solid #17493a;border-radius:8px;cursor:pointer;text-decoration:none}
  .nav{font-size:14px;margin-bottom:8px}
  dl{margin:0}
  dt{color:#1f2733;font-weight:600;margin-top:10px;font-size:13px}
  dd{margin:2px 0 0}
</style></head>
<body><div class="wrap">${contenido}</div></body></html>`;
}

// --- paginas ---

function paginaGracias(contacto) {
  return pagina(
    "Gracias",
    `<p class="nav"><a href="/">&larr; Volver a la landing</a></p>
     <h1><span class="ok">Gracias!</span> Recibimos tu solicitud</h1>
     <div class="card">
       <p>Te contactamos pronto al correo <strong>${esc(contacto.correo)}</strong>.</p>
       <dl>
         <dt>Nombre</dt><dd>${esc(contacto.nombre)}</dd>
         <dt>Mensaje</dt><dd>${esc(contacto.mensaje)}</dd>
         <dt>Numero de contacto</dt><dd>#${esc(contacto.id)}</dd>
       </dl>
     </div>`
  );
}

function paginaError(errores) {
  const items = errores.map((e) => `<li>${esc(e)}</li>`).join("");
  return pagina(
    "Revisa el formulario",
    `<p class="nav"><a href="/">&larr; Volver a la landing</a></p>
     <h1 class="error">No pudimos enviar tu solicitud</h1>
     <div class="card">
       <p>Corrige lo siguiente y vuelve a intentar:</p>
       <ul class="errores">${items}</ul>
     </div>`
  );
}

function selectorUsuario(actual) {
  const ops = USUARIOS.map(
    (u) =>
      `<option value="${u}"${u === actual ? " selected" : ""}>${u[0].toUpperCase() + u.slice(1)}</option>`
  ).join("");
  return `<form method="get" action="/panel" class="selector">
    <label for="usuario"><strong>Entrar como:</strong></label>
    <select id="usuario" name="usuario" onchange="this.form.submit()">${ops}</select>
    <noscript><button class="btn" type="submit">Cambiar</button></noscript>
  </form>`;
}

function paginaPanel(usuario, lista) {
  const mios = contactosDe(lista, usuario);
  const filas = mios.length
    ? mios
        .map(
          (c) => `<tr>
        <td>#${c.id}</td>
        <td><a href="/contacto/${c.id}?usuario=${esc(usuario)}">${esc(c.nombre)}</a></td>
        <td>${esc(c.correo)}</td>
        <td>${c.contactado ? '<span class="badge si">contactado</span>' : '<span class="badge">pendiente</span>'}</td>
        <td>
          <form method="post" action="/contacto/${c.id}/contactado" style="margin:0">
            <input type="hidden" name="usuario" value="${esc(usuario)}" />
            <button class="btn" type="submit">Marcar contactado</button>
          </form>
        </td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="5">Este usuario no tiene contactos todavia.</td></tr>`;

  return pagina(
    "Panel del equipo",
    `<p class="nav"><a href="/">&larr; Landing</a></p>
     <h1>Panel del equipo</h1>
     ${selectorUsuario(usuario)}
     <p>Mostrando los contactos de <strong>${esc(usuario)}</strong>.</p>
     <div class="card">
       <table>
         <thead><tr><th>#</th><th>Nombre</th><th>Correo</th><th>Estado</th><th></th></tr></thead>
         <tbody>${filas}</tbody>
       </table>
     </div>`
  );
}

function paginaDetalle(usuario, c) {
  return pagina(
    `Contacto #${c.id}`,
    `<p class="nav"><a href="/panel?usuario=${esc(usuario)}">&larr; Volver al panel de ${esc(usuario)}</a></p>
     <h1>Contacto #${esc(c.id)}</h1>
     <div class="card">
       <dl>
         <dt>Nombre</dt><dd>${esc(c.nombre)}</dd>
         <dt>Correo</dt><dd>${esc(c.correo)}</dd>
         <dt>Mensaje</dt><dd>${esc(c.mensaje)}</dd>
         <dt>Dueno</dt><dd>${esc(c.dueno)}</dd>
         <dt>Estado</dt><dd>${c.contactado ? "contactado" : "pendiente"}</dd>
       </dl>
       <form method="post" action="/contacto/${c.id}/contactado" style="margin-top:16px">
         <input type="hidden" name="usuario" value="${esc(usuario)}" />
         <button class="btn" type="submit">Marcar contactado</button>
       </form>
     </div>`
  );
}

// --- servir estaticos ---

async function servirEstatico(res, ruta) {
  // Evita path traversal: normaliza y confina a public/.
  const limpio = normalize(ruta).replace(/^(\.\.[/\\])+/, "");
  const archivo = join(PUBLIC, limpio === "/" ? "index.html" : limpio);
  if (!archivo.startsWith(PUBLIC)) {
    html(res, 403, pagina("Prohibido", "<h1>403</h1>"));
    return;
  }
  try {
    const buf = await readFile(archivo);
    const tipo = TIPOS[extname(archivo)] || "application/octet-stream";
    res.writeHead(200, { "content-type": tipo });
    res.end(buf);
  } catch {
    html(res, 404, pagina("No encontrado", '<h1>404</h1><p><a href="/">Ir a la landing</a></p>'));
  }
}

// --- router ---

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PUERTO}`);
  const ruta = url.pathname;

  // GET / -> landing estatica
  if (req.method === "GET" && ruta === "/") {
    return servirEstatico(res, "/index.html");
  }

  // POST /contacto -> valida y guarda
  if (req.method === "POST" && ruta === "/contacto") {
    const datos = await leerCuerpo(req);
    const lista = cargar();
    const dueno = asignarDueno(lista, datos.usuario);
    const r = agregarContacto(lista, datos, dueno);
    if (!r.ok) return html(res, 400, paginaError(r.errores));
    persistir(r.lista);
    return html(res, 201, paginaGracias(r.contacto));
  }

  // GET /panel?usuario=ana -> lista solo los contactos del usuario elegido
  if (req.method === "GET" && ruta === "/panel") {
    let usuario = url.searchParams.get("usuario");
    if (!USUARIOS.includes(usuario)) usuario = USUARIOS[0];
    return html(res, 200, paginaPanel(usuario, cargar()));
  }

  // POST /contacto/:id/contactado -> marca contactado
  // FALLA PLANTADA (IDOR): no verifica que el contacto sea del usuario elegido.
  let m = ruta.match(/^\/contacto\/(\d+)\/contactado$/);
  if (req.method === "POST" && m) {
    const id = Number(m[1]);
    const datos = await leerCuerpo(req);
    let usuario = datos.usuario;
    if (!USUARIOS.includes(usuario)) usuario = USUARIOS[0];
    const lista = cargar();
    const c = buscarPorId(lista, id);
    if (!c) return html(res, 404, pagina("No encontrado", "<h1>404</h1><p>No existe ese contacto.</p>"));
    persistir(marcarContactado(lista, id)); // <- sin verificar c.dueno === usuario
    res.writeHead(303, { location: `/panel?usuario=${encodeURIComponent(usuario)}` });
    return res.end();
  }

  // GET /contacto/:id -> detalle
  // FALLA PLANTADA (IDOR): muestra el contacto sea o no del usuario elegido.
  m = ruta.match(/^\/contacto\/(\d+)$/);
  if (req.method === "GET" && m) {
    const id = Number(m[1]);
    let usuario = url.searchParams.get("usuario");
    if (!USUARIOS.includes(usuario)) usuario = USUARIOS[0];
    const c = buscarPorId(cargar(), id);
    if (!c) return html(res, 404, pagina("No encontrado", "<h1>404</h1><p>No existe ese contacto.</p>"));
    return html(res, 200, paginaDetalle(usuario, c)); // <- sin verificar c.dueno === usuario
  }

  // resto: archivos estaticos de public/
  if (req.method === "GET") return servirEstatico(res, ruta);

  html(res, 405, pagina("Metodo no permitido", "<h1>405</h1>"));
});

servidor.listen(PUERTO, () => {
  console.log(`Mini-lab escuchando en http://localhost:${PUERTO}`);
});
