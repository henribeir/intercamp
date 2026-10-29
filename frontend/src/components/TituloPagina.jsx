// ============================================================
// Título de página (Barlow Condensed) com botão voltar opcional
// e um espaço para uma ação à direita (ex.: ícone de calendário).
// ============================================================
import { useNavigate } from 'react-router-dom';
import { IconeVoltar } from './Icones';

export default function TituloPagina({ titulo, subtitulo, voltar = false, acao = null }) {
  const navegar = useNavigate();

  // Volta para a tela anterior; se o app abriu direto aqui, vai para o Início
  function aoVoltar() {
    if (window.history.length > 1) navegar(-1);
    else navegar('/');
  }

  return (
    <header className="mb-4 flex min-h-12 items-center gap-2">
      {voltar && (
        <button
          type="button"
          onClick={aoVoltar}
          aria-label="Voltar"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-texto hover:bg-superficie"
        >
          <IconeVoltar />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[30px] leading-none font-bold tracking-wide">{titulo}</h1>
        {subtitulo && <p className="mt-1 truncate text-sm text-texto-2">{subtitulo}</p>}
      </div>
      {acao}
    </header>
  );
}
