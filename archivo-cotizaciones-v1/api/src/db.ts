// Capa de base de datos: apertura + esquema (migracion) de SQLite.
import Database from 'better-sqlite3';

export type DB = Database.Database;

/** Abre una base SQLite (archivo o ':memory:') y garantiza el esquema. */
export function abrirDB(file: string): DB {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrar(db);
  return db;
}

/** Crea las tablas si no existen. Esquema de docs/spec/01-funcional.md. */
export function migrar(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cotizaciones (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant           TEXT    NOT NULL,
      cliente          TEXT    NOT NULL,
      contacto         TEXT    NOT NULL DEFAULT '',
      canal            TEXT    NOT NULL,
      necesidad        TEXT    NOT NULL DEFAULT '',
      items            TEXT    NOT NULL DEFAULT '[]',  -- JSON: {producto,cantidad,precio}[]
      fecha            TEXT    NOT NULL,
      observaciones    TEXT    NOT NULL DEFAULT '',
      estado           TEXT    NOT NULL DEFAULT 'recibida',
      importe          REAL    NOT NULL DEFAULT 0,
      fechaSeguimiento TEXT,
      resultado        TEXT
    );

    CREATE TABLE IF NOT EXISTS cierres (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      cotizacionId  INTEGER NOT NULL REFERENCES cotizaciones(id),
      tenant        TEXT    NOT NULL,
      cliente       TEXT    NOT NULL,
      importe       REAL    NOT NULL,
      resultado     TEXT    NOT NULL,
      fechaCierre   TEXT    NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cotizaciones_tenant ON cotizaciones(tenant);
  `);
}

/** Borra todo el contenido y reinicia los ids (seed determinista: siempre 1..N). */
export function limpiar(db: DB): void {
  db.exec(`
    DELETE FROM cierres;
    DELETE FROM cotizaciones;
    DELETE FROM sqlite_sequence WHERE name IN ('cotizaciones', 'cierres');
  `);
}
