// Cliente de la API. La identidad simulada viaja en la cabecera x-tenant.
export type Estado =
  | 'recibida'
  | 'en_preparacion'
  | 'enviada'
  | 'seguimiento'
  | 'aceptada'
  | 'rechazada';

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
  fecha: string;
  observaciones: string;
  estado: Estado;
  importe: number;
  fechaSeguimiento: string | null;
  resultado: string | null;
}

async function pedir<T>(ruta: string, tenant: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${ruta}`, {
    ...init,
    headers: { 'content-type': 'application/json', 'x-tenant': tenant, ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}));
    throw new Error((cuerpo as { mensaje?: string }).mensaje ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listar: (tenant: string) => pedir<Cotizacion[]>('/cotizaciones', tenant),
  obtener: (tenant: string, id: number) => pedir<Cotizacion>(`/cotizaciones/${id}`, tenant),
};
