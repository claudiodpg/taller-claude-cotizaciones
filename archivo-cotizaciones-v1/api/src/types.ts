// Tipos del dominio. Fuente: docs/spec/01-funcional.md

export const ESTADOS = [
  'recibida',
  'en_preparacion',
  'enviada',
  'seguimiento',
  'aceptada',
  'rechazada',
] as const;

export type Estado = (typeof ESTADOS)[number];

export interface Item {
  producto: string;
  cantidad: number;
  precio: number;
}

export interface Cotizacion {
  id: number;
  tenant: string;
  cliente: string;
  contacto: string;
  canal: string;
  necesidad: string;
  items: Item[];
  fecha: string; // ISO date
  observaciones: string;
  estado: Estado;
  importe: number; // derivado
  fechaSeguimiento: string | null;
  resultado: string | null;
}

/** Datos crudos de una solicitud entrante (canal simulado). Todo puede venir "sucio". */
export interface SolicitudCruda {
  tenant?: string;
  cliente?: string;
  contacto?: string;
  canal?: string;
  necesidad?: string;
  items?: Array<{ producto?: string; cantidad?: unknown; precio?: unknown }>;
  fecha?: string;
  observaciones?: string | null;
  estado?: string;
}

export interface CierreCRM {
  id: number;
  cotizacionId: number;
  tenant: string;
  cliente: string;
  importe: number;
  resultado: string;
  fechaCierre: string;
}
