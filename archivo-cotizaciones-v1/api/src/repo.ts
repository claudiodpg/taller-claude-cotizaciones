// Capa de acceso a datos (repositorio). Solo lee/escribe; NO decide permisos.
// El control de acceso (ownership) vive en la capa de rutas (server.ts).
import type { DB } from './db.js';
import type { CierreCRM, Cotizacion, Estado, Item } from './types.js';
import type { CotizacionNormalizada } from './normalize.js';

interface FilaCotizacion {
  id: number;
  tenant: string;
  cliente: string;
  contacto: string;
  canal: string;
  necesidad: string;
  items: string;
  fecha: string;
  observaciones: string;
  estado: string;
  importe: number;
  fechaSeguimiento: string | null;
  resultado: string | null;
}

function aCotizacion(fila: FilaCotizacion): Cotizacion {
  return {
    ...fila,
    estado: fila.estado as Estado,
    items: JSON.parse(fila.items) as Item[],
  };
}

export interface CambioEstado {
  estado: Estado;
  fechaSeguimiento?: string | null;
  resultado?: string | null;
}

export function crearRepo(db: DB) {
  return {
    listarPorTenant(tenant: string): Cotizacion[] {
      const filas = db
        .prepare('SELECT * FROM cotizaciones WHERE tenant = ? ORDER BY id')
        .all(tenant) as FilaCotizacion[];
      return filas.map(aCotizacion);
    },

    /** Busca por id SIN filtrar por tenant. El filtro de ownership es responsabilidad del server. */
    obtener(id: number): Cotizacion | undefined {
      const fila = db
        .prepare('SELECT * FROM cotizaciones WHERE id = ?')
        .get(id) as FilaCotizacion | undefined;
      return fila ? aCotizacion(fila) : undefined;
    },

    crear(c: CotizacionNormalizada): Cotizacion {
      const info = db
        .prepare(
          `INSERT INTO cotizaciones
             (tenant, cliente, contacto, canal, necesidad, items, fecha, observaciones, estado, importe)
           VALUES
             (@tenant, @cliente, @contacto, @canal, @necesidad, @items, @fecha, @observaciones, 'recibida', @importe)`,
        )
        .run({ ...c, items: JSON.stringify(c.items) });
      return this.obtener(Number(info.lastInsertRowid))!;
    },

    actualizarEstado(id: number, cambio: CambioEstado): Cotizacion {
      db.prepare(
        `UPDATE cotizaciones
            SET estado = @estado,
                fechaSeguimiento = COALESCE(@fechaSeguimiento, fechaSeguimiento),
                resultado = COALESCE(@resultado, resultado)
          WHERE id = @id`,
      ).run({
        id,
        estado: cambio.estado,
        fechaSeguimiento: cambio.fechaSeguimiento ?? null,
        resultado: cambio.resultado ?? null,
      });
      return this.obtener(id)!;
    },

    registrarCierre(c: Cotizacion): CierreCRM {
      const info = db
        .prepare(
          `INSERT INTO cierres (cotizacionId, tenant, cliente, importe, resultado, fechaCierre)
           VALUES (@cotizacionId, @tenant, @cliente, @importe, @resultado, @fechaCierre)`,
        )
        .run({
          cotizacionId: c.id,
          tenant: c.tenant,
          cliente: c.cliente,
          importe: c.importe,
          resultado: c.resultado ?? '',
          fechaCierre: new Date().toISOString(),
        });
      return db
        .prepare('SELECT * FROM cierres WHERE id = ?')
        .get(Number(info.lastInsertRowid)) as CierreCRM;
    },

    listarCierresPorTenant(tenant: string): CierreCRM[] {
      return db
        .prepare('SELECT * FROM cierres WHERE tenant = ? ORDER BY id')
        .all(tenant) as CierreCRM[];
    },
  };
}

export type Repo = ReturnType<typeof crearRepo>;
