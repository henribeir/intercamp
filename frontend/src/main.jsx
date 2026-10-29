// ============================================================
// PONTO DE ENTRADA do front-end
// - Fontes (Inter e Barlow Condensed) instaladas pelo npm
// - TanStack Query: cache das buscas na API
// - HashRouter: rotas que funcionam no GitHub Pages
// ============================================================
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import './index.css';

import App from './App';

const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000, // dado "fresco" por 20 s (o SSE avisa quando mudar)
      refetchOnWindowFocus: true, // voltou para o app: confere se mudou algo
      // Tenta de novo só quando é falha de rede ou do servidor (não em 404/400)
      retry: (tentativas, erro) => (erro?.status === 0 || erro?.status >= 500) && tentativas < 2,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
);
