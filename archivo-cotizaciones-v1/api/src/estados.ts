// Maquina de estados de una cotizacion. Fuente: docs/spec/01-funcional.md.
import type { Estado } from './types.js';

/** Transiciones permitidas (y solo esas). */
export const TRANSICIONES: Record<Estado, Estado[]> = {
  recibida: ['en_preparacion'],
  en_preparacion: ['enviada'],
  enviada: ['seguimiento'],
  seguimiento: ['aceptada', 'rechazada'],
  aceptada: [],
  rechazada: [],
};

export function esEstado(v: unknown): v is Estado {
  return typeof v === 'string' && v in TRANSICIONES;
}

export function puedeTransicionar(desde: Estado, hacia: Estado): boolean {
  return TRANSICIONES[desde].includes(hacia);
}
