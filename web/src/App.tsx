import { useEffect, useState } from 'react';
import { api, type Cotizacion, type Estado } from './api.js';

const TENANTS = ['ventas-norte', 'ventas-sur'];

const ETIQUETA_ESTADO: Record<Estado, string> = {
  recibida: 'Recibida',
  en_preparacion: 'En preparacion',
  enviada: 'Enviada',
  seguimiento: 'Seguimiento',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
};

function Badge({ estado }: { estado: Estado }) {
  return (
    <span className="badge" data-estado={estado}>
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}

function money(n: number): string {
  return n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
}

export function App() {
  const [tenant, setTenant] = useState(TENANTS[0]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [selId, setSelId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function recargar(t: string) {
    try {
      setError(null);
      const lista = await api.listar(t);
      setCotizaciones(lista);
      setSelId((prev) => (lista.some((c) => c.id === prev) ? prev : (lista[0]?.id ?? null)));
    } catch (e) {
      setError((e as Error).message);
      setCotizaciones([]);
    }
  }

  useEffect(() => {
    void recargar(tenant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  const sel = cotizaciones.find((c) => c.id === selId) ?? null;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Cotizaciones</h1>
          <span className="sub">Seguimiento comercial · lab del taller</span>
        </div>
        <label className="tenant-switch">
          Equipo (x-tenant):
          <select value={tenant} onChange={(e) => setTenant(e.target.value)}>
            {TENANTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main className="layout">
        <section className="panel" aria-label="Lista de cotizaciones">
          <div className="panel-title">{cotizaciones.length} cotizaciones</div>
          {error && <p className="error">{error}</p>}
          {!error && cotizaciones.length === 0 && (
            <p className="empty">No hay cotizaciones. Corre <code>npm run seed</code>.</p>
          )}
          <ul className="list">
            {cotizaciones.map((c) => (
              <li key={c.id}>
                <button
                  className="list-item"
                  aria-current={c.id === selId}
                  onClick={() => setSelId(c.id)}
                >
                  <span className="cliente">{c.cliente}</span>
                  <span className="meta">
                    <Badge estado={c.estado} />
                    <span>{money(c.importe)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel" aria-label="Detalle de la cotizacion">
          {!sel && <p className="empty detail">Selecciona una cotizacion.</p>}
          {sel && <Detalle c={sel} />}
        </section>
      </main>
    </>
  );
}

function Detalle({ c }: { c: Cotizacion }) {
  return (
    <div className="detail">
      <h2>{c.cliente}</h2>
      <Badge estado={c.estado} />

      <dl className="dl">
        <dt>Contacto</dt>
        <dd>{c.contacto || '—'}</dd>
        <dt>Canal</dt>
        <dd>{c.canal}</dd>
        <dt>Fecha</dt>
        <dd>{c.fecha}</dd>
        <dt>Necesidad</dt>
        <dd>{c.necesidad || '—'}</dd>
        <dt>Observaciones</dt>
        <dd>{c.observaciones || '—'}</dd>
        {c.fechaSeguimiento && (
          <>
            <dt>Seguimiento</dt>
            <dd>{c.fechaSeguimiento}</dd>
          </>
        )}
        {c.resultado && (
          <>
            <dt>Resultado</dt>
            <dd>{c.resultado}</dd>
          </>
        )}
      </dl>

      <table className="items">
        <thead>
          <tr>
            <th>Producto</th>
            <th className="num">Cant.</th>
            <th className="num">Precio</th>
            <th className="num">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {c.items.map((it, i) => (
            <tr key={i}>
              <td>{it.producto}</td>
              <td className="num">{it.cantidad}</td>
              <td className="num">{money(it.precio)}</td>
              <td className="num">{money(it.cantidad * it.precio)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Importe</td>
            <td className="num">{money(c.importe)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
