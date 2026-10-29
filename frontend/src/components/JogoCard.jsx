// ============================================================
// CARD DE JOGO (listas do Início e da tela Jogos).
// Três modos, como no mockup:
//   - ao vivo:   borda/brilho vermelho, placar e "1º TEMPO · 12'"
//                (vôlei: sets no placar e "Set 2 · 14 x 11")
//   - em breve:  "vs" no lugar do placar e o horário (ou "A definir")
//   - encerrado: placar final, vencedor em destaque
// A faixa da esquerda e o nome da competição usam a cor da competição.
// ============================================================
import { Link } from 'react-router-dom';
import Escudo from './Escudo';
import SeloStatus from './SeloStatus';
import { nomeDaVaga, quandoJogo, textoAoVivo } from '../utils/formatos';

function Lado({ jogo, lado }) {
  const equipe = jogo[`equipe_${lado}`];
  const nome = nomeDaVaga(jogo, lado);
  const perdeu = jogo.status === 'encerrado' && equipe && jogo.vencedor_id !== equipe.id;

  return (
    <div className={`flex min-w-0 flex-col items-center gap-1.5 text-center ${perdeu ? 'opacity-55' : ''}`}>
      <Escudo equipe={equipe} tamanho={38} />
      <span
        className={
          equipe
            ? 'w-full truncate font-display text-base font-bold leading-tight tracking-wide'
            : 'line-clamp-2 text-[11px] leading-tight text-texto-2'
        }
      >
        {nome}
      </span>
    </div>
  );
}

function Placar({ jogo }) {
  if (jogo.status === 'agendado') {
    return <span className="font-display text-lg font-semibold uppercase text-texto-2">vs</span>;
  }
  return (
    <div className="flex flex-col items-center">
      <span className="numeros-fixos font-display text-[40px] leading-none font-bold">
        {jogo.placar_a}
        <span className="mx-1.5 text-texto-2">-</span>
        {jogo.placar_b}
      </span>
      {jogo.competicao.formato_placar === 'sets' && (
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-texto-2">sets</span>
      )}
    </div>
  );
}

/** Texto do canto superior direito */
function Momento({ jogo, agora }) {
  if (jogo.status === 'ao_vivo') {
    return <span className="numeros-fixos text-xs font-semibold text-texto">{textoAoVivo(jogo, agora)}</span>;
  }
  if (jogo.status === 'encerrado') {
    return <span className="text-xs font-semibold uppercase text-texto-2">Fim de jogo</span>;
  }
  return <span className="numeros-fixos text-xs font-semibold text-texto">{quandoJogo(jogo, agora)}</span>;
}

/** Frase para leitores de tela (o card inteiro é um link) */
function descricaoAcessivel(jogo, agora) {
  const a = nomeDaVaga(jogo, 'a');
  const b = nomeDaVaga(jogo, 'b');
  const base = `${jogo.competicao.nome}, ${jogo.fase_rotulo}, jogo ${jogo.numero}: ${a} contra ${b}`;
  if (jogo.status === 'ao_vivo') return `${base}. Ao vivo, ${jogo.placar_a} a ${jogo.placar_b}, ${textoAoVivo(jogo, agora)}.`;
  if (jogo.status === 'encerrado') return `${base}. Encerrado, ${jogo.placar_a} a ${jogo.placar_b}.`;
  return `${base}. ${quandoJogo(jogo, agora)}.`;
}

export default function JogoCard({ jogo, agora = new Date() }) {
  const aoVivo = jogo.status === 'ao_vivo';

  return (
    <Link
      to={`/jogos/${jogo.id}`}
      aria-label={descricaoAcessivel(jogo, agora)}
      style={{ '--cor': jogo.competicao.cor }}
      className={`relative block overflow-hidden rounded-2xl border bg-superficie py-3 pr-3 pl-4 transition-colors active:bg-superficie-2 ${
        aoVivo
          ? 'border-ao-vivo/60 shadow-[0_0_28px_-8px_rgba(239,68,68,0.7)]'
          : 'border-borda hover:border-[color-mix(in_srgb,var(--cor)_45%,#1B2740)]'
      }`}
    >
      {/* Faixa lateral na cor da competição */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--cor)]" />

      <div className="flex items-center justify-between gap-2">
        <SeloStatus status={jogo.status} />
        <Momento jogo={jogo} agora={agora} />
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Lado jogo={jogo} lado="a" />
        <Placar jogo={jogo} />
        <Lado jogo={jogo} lado="b" />
      </div>

      <div className="mt-2.5 text-center text-xs leading-snug">
        <p className="texto-cor font-semibold">
          {jogo.competicao.nome} · {jogo.fase_rotulo} · Jogo {jogo.numero}
        </p>
        <p className="text-texto-2">{jogo.local || 'Local a definir'}</p>
      </div>
    </Link>
  );
}
