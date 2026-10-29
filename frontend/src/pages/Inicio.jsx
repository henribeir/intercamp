// ============================================================
// TELA INÍCIO
// - Logo dos alunos + subtítulo
// - Banner com o lema do torneio
// - "Jogos de hoje" (ao vivo primeiro); se não houver, "Próximos jogos"
// - Fileira "Competições": 6 cards coloridos que levam ao chaveamento
// ============================================================
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCompeticoes, useJogos, useTorneio } from '../hooks/consultas';
import { useAgora } from '../hooks/useAgora';
import JogoCard from '../components/JogoCard';
import { Carregando, Erro, Vazio } from '../components/Estados';
import { IconeEsporte, IconeSeta, IconeTrofeu } from '../components/Icones';
import { hojeISO } from '../utils/formatos';

const LOGO = `${import.meta.env.BASE_URL}brand/logo.png`;
const LEMA_PADRAO = 'Esporte, união, respeito e grandes conquistas!';
const LIMITE_PROXIMOS = 4;

const ORDEM_STATUS = { ao_vivo: 0, agendado: 1, encerrado: 2 };

/** Decide o que mostrar: jogos de hoje (e os ao vivo) ou os próximos */
function escolherJogos(jogos, hoje) {
  const deHoje = jogos
    .filter((jogo) => jogo.data === hoje || jogo.status === 'ao_vivo')
    .sort((x, y) => ORDEM_STATUS[x.status] - ORDEM_STATUS[y.status]);
  if (deHoje.length > 0) return { titulo: 'Jogos de hoje', lista: deHoje };

  const proximos = jogos.filter((jogo) => jogo.status === 'agendado').slice(0, LIMITE_PROXIMOS);
  return { titulo: 'Próximos jogos', lista: proximos };
}

function Cabecalho() {
  return (
    <header className="flex items-center gap-3">
      {/* mix-blend-mode: screen faz o fundo preto da logo "sumir" no fundo escuro */}
      <img src={LOGO} alt="InterCamp" className="h-16 w-auto shrink-0 mix-blend-screen" width="74" height="64" />
      <p className="text-xs leading-snug text-texto-2">
        Interclasse CEM Dom Marcelino de Milão
        <span className="sr-only"> · </span>
        <span className="block font-semibold text-texto">By 301 INT</span>
      </p>
    </header>
  );
}

function Banner() {
  const { data: torneio } = useTorneio();
  const lema = torneio?.lemas?.[0] ?? LEMA_PADRAO;

  return (
    <section
      aria-label="Lema do torneio"
      className="relative mt-4 overflow-hidden rounded-3xl border border-borda bg-[radial-gradient(120%_90%_at_100%_0%,#1E4FD8_0%,#0B1C45_45%,#070B14_100%)] px-5 py-6"
    >
      {/* Linhas de quadra (decoração) */}
      <svg aria-hidden="true" viewBox="0 0 200 120" className="absolute inset-0 h-full w-full opacity-15" preserveAspectRatio="none">
        <rect x="6" y="6" width="188" height="108" rx="6" fill="none" stroke="white" strokeWidth="1" />
        <line x1="100" y1="6" x2="100" y2="114" stroke="white" strokeWidth="1" />
        <circle cx="100" cy="60" r="18" fill="none" stroke="white" strokeWidth="1" />
      </svg>
      <img
        src={LOGO}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -bottom-8 h-32 w-auto opacity-20 mix-blend-screen"
      />

      <div className="relative max-w-[72%]">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-primaria-clara uppercase">Interclasse</p>
        <p className="mt-1 font-display text-[28px] leading-[1.05] font-bold uppercase">{lema}</p>
        <p className="mt-2 text-xs text-texto-2">Placar ao vivo, chaveamento e ranking das turmas.</p>
      </div>
    </section>
  );
}

function SecaoJogos() {
  const agora = useAgora(30000);
  const { data: jogos, isPending, isError, error, refetch } = useJogos();
  const { titulo, lista } = useMemo(() => escolherJogos(jogos ?? [], hojeISO(agora)), [jogos, agora]);

  return (
    <section aria-labelledby="titulo-jogos" className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="titulo-jogos" className="font-display text-xl font-bold tracking-wide">
          {isPending ? 'Jogos' : titulo}
        </h2>
        <Link to="/jogos" className="flex min-h-11 items-center gap-0.5 text-sm font-semibold text-primaria-clara">
          Ver todos
          <IconeSeta tamanho={16} />
        </Link>
      </div>

      {isPending && <Carregando quantidade={2} texto="Carregando jogos…" />}
      {isError && <Erro erro={error} tentarDeNovo={refetch} />}
      {!isPending && !isError && lista.length === 0 && (
        <Vazio titulo="Nenhum jogo agendado" texto="Assim que a tabela for atualizada, os jogos aparecem aqui." />
      )}
      {lista.length > 0 && (
        <ul className="flex flex-col gap-3">
          {lista.map((jogo) => (
            <li key={jogo.id}>
              <JogoCard jogo={jogo} agora={agora} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CardCompeticao({ competicao }) {
  const progresso = `${competicao.jogos_encerrados}/${competicao.total_jogos} jogos`;

  return (
    <Link
      to={`/chaveamento?competicao=${competicao.slug}`}
      style={{ '--cor': competicao.cor }}
      className="relative flex h-32 w-36 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(150deg,var(--cor)_0%,color-mix(in_srgb,var(--cor)_35%,#070B14)_100%)] p-3"
    >
      <IconeEsporte esporte={competicao.esporte} tamanho={28} className="text-white/90" />
      <div>
        <p className="font-display text-lg leading-tight font-bold">{competicao.nome}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
          {competicao.campeao ? (
            <>
              <IconeTrofeu tamanho={14} />
              Campeã: {competicao.campeao.nome}
            </>
          ) : (
            progresso
          )}
        </p>
      </div>
    </Link>
  );
}

function SecaoCompeticoes() {
  const { data: competicoes, isPending, isError, error, refetch } = useCompeticoes();

  return (
    <section aria-labelledby="titulo-competicoes" className="mt-7">
      <h2 id="titulo-competicoes" className="mb-3 font-display text-xl font-bold tracking-wide">
        Competições
      </h2>

      {isError && <Erro erro={error} tentarDeNovo={refetch} />}
      <ul className="rolagem-horizontal -mx-4 flex gap-3 px-4 pb-1">
        {isPending &&
          [1, 2, 3].map((n) => (
            <li key={n} aria-hidden="true" className="h-32 w-36 shrink-0 rounded-2xl bg-superficie motion-safe:animate-pulse" />
          ))}
        {competicoes?.map((competicao) => (
          <li key={competicao.slug}>
            <CardCompeticao competicao={competicao} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Inicio() {
  return (
    <>
      <h1 className="sr-only">InterCamp: Início</h1>
      <Cabecalho />
      <Banner />
      <SecaoJogos />
      <SecaoCompeticoes />
    </>
  );
}
