import { describe, it, expect } from "vitest";
import { validarContacto, correoValido } from "../lib/validacion.js";
import { agregarContacto, contactosDe, asignarDueno } from "../lib/contactos.js";

describe("validarContacto", () => {
  it("acepta datos correctos", () => {
    const r = validarContacto({
      nombre: "Ana",
      correo: "ana@example.com",
      mensaje: "Hola, quiero cotizar",
    });
    expect(r.ok).toBe(true);
    expect(r.errores).toHaveLength(0);
  });

  it("rechaza cuando faltan los tres campos", () => {
    const r = validarContacto({});
    expect(r.ok).toBe(false);
    expect(r.errores).toHaveLength(3);
  });

  it("rechaza cuando falta un campo (el mensaje)", () => {
    const r = validarContacto({ nombre: "Ana", correo: "ana@example.com", mensaje: "  " });
    expect(r.ok).toBe(false);
    expect(r.errores.some((e) => e.toLowerCase().includes("mensaje"))).toBe(true);
  });

  it("rechaza un correo con formato invalido", () => {
    const r = validarContacto({ nombre: "Ana", correo: "ana(arroba)example", mensaje: "hola" });
    expect(r.ok).toBe(false);
    expect(r.errores.some((e) => e.toLowerCase().includes("correo"))).toBe(true);
  });
});

describe("correoValido", () => {
  it("distingue correos validos de invalidos", () => {
    expect(correoValido("beto@example.com")).toBe(true);
    expect(correoValido("beto@example")).toBe(false);
    expect(correoValido("sin-arroba.com")).toBe(false);
    expect(correoValido("con espacio@example.com")).toBe(false);
  });
});

describe("agregarContacto", () => {
  it("guarda un contacto valido con id incremental y dueno", () => {
    const lista = [{ id: 1, dueno: "ana" }];
    const r = agregarContacto(
      lista,
      { nombre: "Beto", correo: "beto@example.com", mensaje: "quiero cotizar" },
      "beto"
    );
    expect(r.ok).toBe(true);
    expect(r.contacto.id).toBe(2);
    expect(r.contacto.dueno).toBe("beto");
    expect(r.contacto.contactado).toBe(false);
    // no muta la lista original
    expect(lista).toHaveLength(1);
    expect(r.lista).toHaveLength(2);
  });

  it("no guarda si los datos son invalidos", () => {
    const r = agregarContacto([], { nombre: "", correo: "malo", mensaje: "" }, "ana");
    expect(r.ok).toBe(false);
    expect(r.contacto).toBeUndefined();
    expect(r.errores.length).toBeGreaterThan(0);
  });
});

describe("filtrado por dueno", () => {
  const lista = [
    { id: 1, dueno: "ana" },
    { id: 2, dueno: "beto" },
    { id: 3, dueno: "ana" },
  ];

  it("contactosDe devuelve solo los del usuario pedido", () => {
    expect(contactosDe(lista, "ana").map((c) => c.id)).toEqual([1, 3]);
    expect(contactosDe(lista, "beto").map((c) => c.id)).toEqual([2]);
  });

  it("asignarDueno respeta el usuario activo si viene, si no alterna", () => {
    expect(asignarDueno(lista, "beto")).toBe("beto");
    expect(asignarDueno([], undefined)).toBe("ana"); // 0 contactos -> ana
    expect(asignarDueno([{ id: 1 }], undefined)).toBe("beto"); // 1 contacto -> beto
  });
});
