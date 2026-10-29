// ============================================================
// LAYOUT comum a todas as telas: conteúdo + barra inferior.
// Também liga o tempo real (SSE) uma única vez para o app todo.
// ============================================================
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BarraInferior from './BarraInferior';
import AvisoServidor from './AvisoServidor';
import { useTempoReal } from '../hooks/useTempoReal';

export default function Layout() {
  useTempoReal();
  const { pathname } = useLocation();
  const conteudo = useRef(null);

  // Trocou de tela: volta ao topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      {/* Atalho para quem usa teclado ou leitor de tela */}
      <button
        type="button"
        onClick={() => conteudo.current?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primaria focus:px-4 focus:py-2 focus:text-white"
      >
        Pular para o conteúdo
      </button>

      <AvisoServidor />

      <main
        ref={conteudo}
        tabIndex={-1}
        className="espaco-barra-inferior mx-auto w-full max-w-md px-4 pt-[max(1rem,env(safe-area-inset-top))] outline-none"
      >
        <Outlet />
      </main>

      <BarraInferior />
    </div>
  );
}
