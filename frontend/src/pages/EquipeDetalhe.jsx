// ============================================================
// TELA DA TURMA (/equipes/:id): escudo, números no ranking geral,
// títulos e a campanha (todos os jogos dela, por competição).
// ============================================================
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCompeticoes, useEquipes, useJogos, useRanking } from '../hooks/consultas';
import { useAgora } from '../hooks/useAgora';
import TituloPagina from '../components/TituloPagina';
import Escudo from '../components/Escudo';
import LinhaJogo from '../components/LinhaJogo';
import { Carregando, Erro, Vazio } from '../components/Estados';
import { IconeTrofeu } from '../components/Icones';

const SITUACOES = {
  campea: { rotulo: 'Campeã', classe: 'bg-primaria text-white' },
  em_disputa: { rotulo: 'Em disputa', classe: 'bg-alerta text-[#1A1405]' },
  eliminada: { rotulo: 'Eliminada', classe: 'bg-ao-vivo text-white' },
};

function Numero({ rotulo, valor }) {
  return (
    <div className="rounded-xl border border-borda bg-superficie py-2 text-center">
      <p className="numeros-fixos font-display text-2xl font-bold">{valor}</p>
      <p className="text-[11px] text-texto-2">{rotulo}</p>
    </div>
  );
}

export default function EquipeDetalhe() {
  const id = Number(useParams().id);
  const agora = useAgora(30000);
  const equipes = useEquipes();
  const jogos = useJogos();
  const ranking = useRanking();
  const competicoes = useCompeticoes();

  const equipe = equipes.data?.find((e) => e.id === id);
  const linhaRanking = ranking.data?.classificacao.find((linha) => linha.equipe.id === id);
  const titulos = (competicoes.data ?? []).filter((c) => c.campeao?.id === id);

  // Jogos da turma agrupados por competição (na ordem da API)
  const campanha = useMemo(() => {
    const grupos = new Map();
    for (const jogo of jogos.data ?? []) {
      if (jogo.equipe_a?.id !== id && jogo.equipe_b?.id !== id) continue;
      const grupo = grupos.get(jogo.competicao.slug) ?? { competicao: jogo.competicao, jogos: [] };
      grupo.jogos.push(jogo);
      grupos.set(jogo.competicao.slug, grupo);
    }
    return [...grupos.values()];
  }, [jogos.data, id]);

  if (equipes.isPending) return <Carregando quantidade={2} texto="Carregando turma…" />;
  if (equipes.isError) return <Erro erro={equipes.error} tentarDeNovo={equipes.refetch} />;
  if (!equipe) {
    return (
      <>
        <TituloPagina titulo="Turma" voltar />
        <Vazio titulo="Turma não encontrada" />
      </>
    );
  }

  const situacao = linhaRanking && SITUACOES[linhaRanking.situacao];

  return (
    <>
      <TituloPagina titulo={equipe.nome} voltar />

      <section className="flex items-center gap-4 rounded-3xl border border-borda bg-superficie p-4">
        <Escudo equipe={equipe} tamanho={72} />
        <div className="min-w-0">
          <p className="font-display text-3xl leading-none font-bold">{equipe.nome}</p>
          <p className="mt-1 text-sm text-texto-2">
            {equipe.serie}ª série{equipe.curso ? ` · ${equipe.curso}` : ''}
          </p>
          {situacao && (
            <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${situacao.classe}`}>
              {situacao.rotulo}
            </span>
          )}
        </div>
      </section>

      {linhaRanking && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Numero rotulo="Posição" valor={`${linhaRanking.posicao}º`} />
          <Numero rotulo="Pontos" valor={linhaRanking.pontos} />
          <Numero rotulo="Vitórias" valor={linhaRanking.vitorias} />
          <Numero rotulo="Derrotas" valor={linhaRanking.derrotas} />
        </div>
      )}

      {titulos.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {titulos.map((competicao) => (
            <li key={competicao.slug} className="flex items-center gap-2 rounded-xl border border-alerta/40 bg-alerta/10 px-3 py-2.5 text-sm font-semibold text-alerta">
              <IconeTrofeu tamanho={18} />
              Campeã do {competicao.nome}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-6 mb-3 font-display text-xl font-bold tracking-wide">Campanha</h2>
      {jogos.isPending && <Carregando tipo="linhas" quantidade={3} texto="Carregando jogos…" />}
      {jogos.isError && <Erro erro={jogos.error} tentarDeNovo={jogos.refetch} />}
      {jogos.data && campanha.length === 0 && (
        <Vazio titulo="Nenhum jogo definido ainda" texto="Os jogos aparecem quando a turma tiver confronto marcado." />
      )}

      <div className="flex flex-col gap-4">
        {campanha.map(({ competicao, jogos: lista }) => (
          <section
            key={competicao.slug}
            aria-label={competicao.nome}
            style={{ '--cor': competicao.cor }}
            className="overflow-hidden rounded-2xl border border-borda bg-superficie"
          >
            <h3 className="texto-cor border-b border-borda px-3 py-2 text-sm font-semibold">{competicao.nome}</h3>
            <ul className="divide-y divide-borda/60">
              {lista.map((jogo) => (
                <li key={jogo.id}>
                  <LinhaJogo jogo={jogo} agora={agora} mostrarCompeticao={false} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
