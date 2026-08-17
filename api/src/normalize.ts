// Capa de normalizacion: convierte una SolicitudCruda (datos sucios de un canal) en los
// campos limpios de una Cotizacion. Fuente: docs/spec/01-funcional.md (CU-1).
import type { Item, SolicitudCruda } from './types.js';

const TENANT_DEFAULT = 'ventas-norte';

/** Colapsa espacios y recorta. '  a   b ' -> 'a b'. */
function limpiarTexto(v: unknown): string {
  return String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Coacciona a numero; NaN -> 0. Acepta strings tipo "3.5". */
function aNumero(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Canal a un valor canonico del enum. */
export function normalizarCanal(raw: unknown): string {
  const s = limpiarTexto(raw).toLowerCase();
  if (s.includes('formulario') || s.includes('form')) return 'formulario';
  if (s.includes('json')) return 'import-json';
  if (s.includes('csv')) return 'import-csv';
  return 'otro';
}

function normalizarItems(items: SolicitudCruda['items']): Item[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => ({
      producto: limpiarTexto(it?.producto),
      cantidad: aNumero(it?.cantidad),
      precio: aNumero(it?.precio),
    }))
    .filter((it) => it.producto !== '' && it.cantidad > 0);
}

/** Importe derivado = suma de cantidad*precio, redondeado a 2 decimales. */
export function calcularImporte(items: Item[]): number {
  const total = items.reduce((acc, it) => acc + it.cantidad * it.precio, 0);
  return Math.round(total * 100) / 100;
}

export interface CotizacionNormalizada {
  tenant: string;
  cliente: string;
  contacto: string;
  canal: string;
  necesidad: string;
  items: Item[];
  fecha: string;
  observaciones: string;
  importe: number;
}

/** Normaliza una solicitud cruda. El estado inicial siempre es 'recibida'. */
export function normalizarSolicitud(
  raw: SolicitudCruda,
  tenantForzado?: string,
): CotizacionNormalizada {
  const items = normalizarItems(raw.items);
  return {
    tenant: limpiarTexto(tenantForzado ?? raw.tenant) || TENANT_DEFAULT,
    cliente: limpiarTexto(raw.cliente),
    contacto: limpiarTexto(raw.contacto),
    canal: normalizarCanal(raw.canal),
    necesidad: limpiarTexto(raw.necesidad),
    items,
    fecha: limpiarTexto(raw.fecha) || new Date().toISOString().slice(0, 10),
    observaciones: limpiarTexto(raw.observaciones),
    importe: calcularImporte(items),
  };
}
