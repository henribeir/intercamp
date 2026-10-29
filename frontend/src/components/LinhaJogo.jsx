// ============================================================
// LINHA DE JOGO compacta (Calendário, campanha da turma e painel
// do mestre). Como no mockup do Calendário:
//   201 INT [escudo]   1 - 0   [escudo] 300 INT    AO VIVO  >
// ============================================================
import { Link } from 'react-router-dom';
import Escudo from './Escudo';
import { IconeSeta } from './Icones';
import { nomeCurtoCompeticao, nomeDaVaga, quandoJogo } from '../utils/formatos';

function Lado({ jogo, lado }) {
  const equipe = jogo[`equipe_${lado}`];
  const perdeu = jogo.status === 'encerrado' && equipe && jogo.vencedor_id !== equipe.id;
  const ehA = lado === 'a';

  return (
    <span className={`flex min-w-0 items-center gap-2 ${ehA ? 'justify-end' : ''} ${perdeu ? 'opacity-55' : ''}`}>
      {!ehA && <Escudo equipe={equipe} tamanho={26} />}
      <span className={`truncate ${equipe ? 'font-display text-base font-bold' : 'text-[11px] text-texto-2'}`}>
        {nomeDaVaga(jogo, lado)}
      </span>
      {ehA && <Escudo equipe={equipe} tamanho={26} />}
    </span>
  );
}

function Lateral({ jogo, agora }) {
  if (jogo.status === 'ao_vivo') {
    return <span className="rounded bg-ao-vivo px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Ao vivo</span>;
  }
  if (jogo.status === 'encerrado') return <span className="text-[11px] font-semibold text-texto-2 uppercase">Fim</span>;
  return <span className="numeros-fixos text-xs font-semibold text-texto">{jogo.horario ?? quandoJogo(jogo, agora)}</span>;
}

export default function LinhaJogo({ jogo, para, agora = new Date(), mostrarCompeticao = true }) {
  const temPlacar = jogo.status !== 'agendado';

  return (
    <Link
      to={para ?? `/jogos/${jogo.id}`}
      style={{ '--cor': jogo.competicao.cor }}
      className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-superficie-2 active:bg-superficie-2"
    >
      {mostrarCompeticao && (
        <p className="texto-cor mb-1 text-[11px] font-semibold">
          {nomeCurtoCompeticao(jogo.competicao)} · {jogo.fase_rotulo} · Jogo {jogo.numero}
        </p>
      )}
      <span className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
        <Lado jogo={jogo} lado="a" />
        <span className="numeros-fixos min-w-12 text-center font-display text-xl font-bold">
          {temPlacar ? `${jogo.placar_a} - ${jogo.placar_b}` : <span className="text-base text-texto-2">vs</span>}
        </span>
        <Lado jogo={jogo} lado="b" />
        <span className="flex items-center gap-1 pl-1">
          <Lateral jogo={jogo} agora={agora} />
          <IconeSeta tamanho={16} className="text-texto-2" />
        </span>
      </span>
    </Link>
  );
}
