// ============================================================
// Configuração do Vite (servidor de desenvolvimento e build)
// ============================================================
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Lê o .env da pasta frontend (variáveis que começam com VITE_)
  const env = loadEnv(mode, process.cwd());

  return {
    // No GitHub Pages o site fica em https://usuario.github.io/NOME-DO-REPO/
    // então VITE_BASE deve ser "/NOME-DO-REPO/". Local: "/".
    base: env.VITE_BASE || '/',
    plugins: [react(), tailwindcss()],
  };
});
