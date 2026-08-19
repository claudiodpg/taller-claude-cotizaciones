// Logica de validacion del formulario de contacto.
// Funciones puras e importables: las pruebas las usan sin levantar el servidor.

// Formato de correo razonable (no exhaustivo, suficiente para el taller):
// algo@algo.dominio, sin espacios.
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida los datos de un contacto.
 * @param {{nombre?: string, correo?: string, mensaje?: string}} datos
 * @returns {{ok: boolean, errores: string[]}}
 */
export function validarContacto(datos) {
  const errores = [];
  const d = datos || {};

  const nombre = typeof d.nombre === "string" ? d.nombre.trim() : "";
  const correo = typeof d.correo === "string" ? d.correo.trim() : "";
  const mensaje = typeof d.mensaje === "string" ? d.mensaje.trim() : "";

  if (!nombre) errores.push("El nombre es obligatorio.");
  if (!correo) {
    errores.push("El correo es obligatorio.");
  } else if (!RE_CORREO.test(correo)) {
    errores.push("El correo no tiene un formato valido.");
  }
  if (!mensaje) errores.push("El mensaje es obligatorio.");

  return { ok: errores.length === 0, errores };
}

/** True si el correo tiene formato valido. */
export function correoValido(correo) {
  return typeof correo === "string" && RE_CORREO.test(correo.trim());
}
