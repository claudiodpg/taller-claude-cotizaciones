import { defineConfig } from "vitest/config";

// Acota las pruebas a las del lab (carpeta test/). Excluye la versión archivada
// de Cotizaciones, que tiene su propio stack (TypeScript) y no es el lab activo.
export default defineConfig({
  test: {
    include: ["test/**/*.test.js"],
    exclude: ["node_modules/**", "archivo-cotizaciones-v1/**"],
  },
});
