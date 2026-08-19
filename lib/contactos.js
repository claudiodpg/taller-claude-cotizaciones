// Logica de contactos: creacion, filtrado y persistencia en JSON local.
// Las funciones de logica son puras (operan sobre una lista que recibes),
// asi las pruebas no necesitan levantar el servidor ni tocar el disco.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validarContacto } from "./validacion.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// data/contactos.json vive junto a la raiz del proyecto (../data).
export const RUTA_DATOS = join(__dirname, "..", "data", "contactos.json");

// Usuarios validos del panel (no hay login real; es un selector).
export const USUARIOS = ["ana", "beto"];

/** Devuelve el siguiente id incremental para una lista. */
export function siguienteId(lista) {
  return lista.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0) + 1;
}

/**
 * Agrega un contacto validado a la lista y devuelve una lista nueva.
 * No muta la lista original.
 * @param {Array} lista
 * @param {{nombre, correo, mensaje}} datos
 * @param {string} dueno  usuario dueno del contacto (ana/beto)
 * @returns {{ok: boolean, errores?: string[], contacto?: object, lista?: Array}}
 */
export function agregarContacto(lista, datos, dueno) {
  const v = validarContacto(datos);
  if (!v.ok) return { ok: false, errores: v.errores };

  const contacto = {
    id: siguienteId(lista),
    nombre: datos.nombre.trim(),
    correo: datos.correo.trim(),
    mensaje: datos.mensaje.trim(),
    dueno: dueno,
    contactado: false,
    creado: new Date().toISOString(),
  };
  return { ok: true, contacto, lista: [...lista, contacto] };
}

/**
 * Decide el dueno de un envio nuevo.
 * Si viene un usuario explicito (desde el panel), se respeta;
 * si no, se alterna ana/beto segun la cantidad de contactos existentes,
 * para que siempre haya contactos de distintos duenos.
 */
export function asignarDueno(lista, usuarioActivo) {
  if (USUARIOS.includes(usuarioActivo)) return usuarioActivo;
  return lista.length % 2 === 0 ? "ana" : "beto";
}

/** Contactos de un usuario. */
export function contactosDe(lista, usuario) {
  return lista.filter((c) => c.dueno === usuario);
}

/** Busca un contacto por id (numero). Devuelve el contacto o undefined. */
export function buscarPorId(lista, id) {
  const n = Number(id);
  return lista.find((c) => Number(c.id) === n);
}

/** Marca un contacto como contactado y devuelve una lista nueva. */
export function marcarContactado(lista, id) {
  const n = Number(id);
  return lista.map((c) => (Number(c.id) === n ? { ...c, contactado: true } : c));
}

// --- Persistencia en disco (efecto lateral, fuera de la logica pura) ---

/** Carga la lista desde data/contactos.json (o [] si no existe). */
export function cargar() {
  if (!existsSync(RUTA_DATOS)) return [];
  const txt = readFileSync(RUTA_DATOS, "utf8").trim();
  if (!txt) return [];
  return JSON.parse(txt);
}

/** Guarda la lista en data/contactos.json. */
export function persistir(lista) {
  writeFileSync(RUTA_DATOS, JSON.stringify(lista, null, 2) + "\n", "utf8");
}
