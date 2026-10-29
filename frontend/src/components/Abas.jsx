// ============================================================
// ABAS em formato de pílula (como no mockup).
// Acessível: role="tablist"/"tab" e setas do teclado para trocar.
// abas = [{ valor: 'todos', rotulo: 'Todos' }, ...]
// ============================================================
import { useRef } from 'react';

export default function Abas({ abas, valor, aoMudar, rotulo }) {
  const botoes = useRef([]);

  // Setas esquerda/direita andam entre as abas
  function aoTeclar(evento, indice) {
    const passo = { ArrowRight: 1, ArrowLeft: -1 }[evento.key];
    if (!passo) return;
    evento.preventDefault();
    const proximo = (indice + passo + abas.length) % abas.length;
    aoMudar(abas[proximo].valor);
    botoes.current[proximo]?.focus();
  }

  return (
    <div role="tablist" aria-label={rotulo} className="rolagem-horizontal -mx-4 flex gap-2 px-4 py-1">
      {abas.map((aba, indice) => {
        const ativa = aba.valor === valor;
        return (
          <button
            key={aba.valor}
            ref={(elemento) => (botoes.current[indice] = elemento)}
            type="button"
            role="tab"
            aria-selected={ativa}
            tabIndex={ativa ? 0 : -1}
            onClick={() => aoMudar(aba.valor)}
            onKeyDown={(evento) => aoTeclar(evento, indice)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
              ativa ? 'bg-primaria text-white' : 'bg-superficie-2 text-texto-2 hover:text-texto'
            }`}
          >
            {aba.rotulo}
          </button>
        );
      })}
    </div>
  );
}
