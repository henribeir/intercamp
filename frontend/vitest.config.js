// ============================================================
// Configuração dos testes do front-end (Vitest + Testing Library)
// jsdom = um "navegador de mentirinha" dentro do Node.
// ============================================================
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testes/preparar.js'],
    include: ['src/**/*.test.{js,jsx}'],
    // URL da API usada nos testes (o fetch é sempre simulado)
    env: { VITE_API_URL: 'http://api.teste' },
  },
});
