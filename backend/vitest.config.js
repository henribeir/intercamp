// ============================================================
// Configuração dos testes (Vitest)
// ============================================================
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Roda ANTES de cada arquivo de teste: liga o banco em memória
    // e define senha/segredo de teste (veja tests/setup.js)
    setupFiles: ['./tests/setup.js'],
    // O banco em memória leva alguns segundos para "ligar"
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});
