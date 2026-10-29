// ============================================================
// Caixa de diálogo (confirmações e escolhas rápidas).
// Usa o <dialog> nativo do navegador: prende o foco dentro,
// fecha com Esc e escurece o fundo.
// ============================================================
import { useEffect, useId, useRef } from 'react';

export default function Dialogo({ aberto, aoFechar, titulo, children }) {
  const caixa = useRef(null);
  const idTitulo = useId();

  // Abre/fecha de verdade conforme a prop "aberto"
  useEffect(() => {
    const dialogo = caixa.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={caixa}
      aria-labelledby={idTitulo}
      onClose={aoFechar}
      // Toque fora da caixa (no fundo escuro) fecha
      onClick={(evento) => evento.target === caixa.current && aoFechar()}
      className="m-auto w-[min(92vw,420px)] rounded-3xl border border-borda bg-superficie p-0 text-texto backdrop:bg-black/70"
    >
      {aberto && (
        <div className="p-5">
          <h2 id={idTitulo} className="mb-4 font-display text-2xl leading-tight font-bold">
            {titulo}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
