import { describe, it, expect } from 'vitest';
import { normalizarSolicitud, normalizarCanal } from '../src/normalize.js';

describe('normalizacion', () => {
  it('recorta y colapsa espacios en textos', () => {
    expect(normalizarSolicitud({ cliente: '  Ferreteria   El  Tornillo ' }).cliente).toBe(
      'Ferreteria El Tornillo',
    );
  });

  it('canonicaliza el canal', () => {
    expect(normalizarCanal('Formulario Web')).toBe('formulario');
    expect(normalizarCanal('IMPORT-JSON')).toBe('import-json');
    expect(normalizarCanal('csv')).toBe('import-csv');
    expect(normalizarCanal('otro-canal-raro')).toBe('otro');
  });

  it('coacciona numeros en strings y calcula el importe derivado', () => {
    const c = normalizarSolicitud({ items: [{ producto: 'x', cantidad: '3', precio: '3.5' }] });
    expect(c.items[0].cantidad).toBe(3);
    expect(c.items[0].precio).toBe(3.5);
    expect(c.importe).toBe(10.5);
  });

  it('descarta items sin producto o sin cantidad', () => {
    const c = normalizarSolicitud({
      items: [
        { producto: '', cantidad: '1', precio: '1' },
        { producto: 'ok', cantidad: '0', precio: '5' },
      ],
    });
    expect(c.items).toHaveLength(0);
  });
});
