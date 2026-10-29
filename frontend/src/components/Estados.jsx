// ============================================================
// ESTADOS DE TELA: Carregando, Vazio e Erro.
// Toda tela que busca dados mostra um destes enquanto não há conteúdo.
// ============================================================
import { IconeAtualizar, IconeBola } from './Icones';

/** Esqueleto pulsando no formato do conteúdo que vai chegar */
export function Carregando({ tipo = 'cards', quantidade = 3, texto = 'Carregando…' }) {
  const altura = tipo === 'linhas' ? 'h-14' : 'h-40';
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{texto}</span>
      {Array.from({ length: quantidade }, (_, indice) => (
        <div key={indice} aria-hidden="true" className={`${altura} rounded-2xl border border-borda bg-superficie motion-safe:animate-pulse`} />
      ))}
    </div>
  );
}

/** Nada para mostrar (ex.: nenhum jogo hoje) */
export function Vazio({ titulo = 'Nada por aqui', texto, icone }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-borda px-6 py-10 text-center">
      <span className="text-texto-2">{icone ?? <IconeBola tamanho={32} />}</span>
      <p className="font-semibold">{titulo}</p>
      {texto && <p className="text-sm text-texto-2">{texto}</p>}
    </div>
  );
}

/** Falha ao buscar; mostra a mensagem da API e um botão para tentar de novo */
export function Erro({ erro, tentarDeNovo }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-ao-vivo/40 bg-ao-vivo/10 px-6 py-8 text-center">
      <p className="font-semibold">Não foi possível carregar</p>
      <p className="text-sm text-texto-2">{erro?.message || 'Tente de novo em instantes.'}</p>
      {tentarDeNovo && (
        <button
          type="button"
          onClick={() => tentarDeNovo()}
          className="flex min-h-11 items-center gap-2 rounded-full bg-primaria px-5 text-sm font-semibold text-white"
        >
          <IconeAtualizar tamanho={18} />
          Tentar de novo
        </button>
      )}
    </div>
  );
}
