// ============================================================
// TELA EQUIPES: grade de 3 colunas com as turmas e seus escudos.
// Os chips filtram as turmas que jogam em cada competição.
// ============================================================
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEquipes, useJogos } from '../hooks/consultas';
import TituloPagina from '../components/TituloPagina';
import SeletorCompeticao from '../components/SeletorCompeticao';
import Escudo from '../components/Escudo';
import { Carregando, Erro, Vazio } from '../components/Estados';

/** slug da competição -> conjunto de ids das turmas que aparecem nos jogos dela */
function turmasPorCompeticao(jogos) {
  const mapa = new Map();
  for (const jogo of jogos) {
    const ids = mapa.get(jogo.competicao.slug) ?? new Set();
    if (jogo.equipe_a) ids.add(jogo.equipe_a.id);
    if (jogo.equipe_b) ids.add(jogo.equipe_b.id);
    mapa.set(jogo.competicao.slug, ids);
  }
  return mapa;
}

export default function Equipes() {
  const [competicao, setCompeticao] = useState(null);
  const equipes = useEquipes();
  const jogos = useJogos();

  const participantes = useMemo(() => turmasPorCompeticao(jogos.data ?? []), [jogos.data]);
  const visiveis = (equipes.data ?? []).filter((equipe) => !competicao || participantes.get(competicao)?.has(equipe.id));

  return (
    <>
      <TituloPagina titulo="Equipes" voltar />
      <SeletorCompeticao valor={competicao} aoMudar={setCompeticao} />

      <div className="mt-4">
        {equipes.isPending && <Carregando quantidade={3} texto="Carregando turmas…" />}
        {equipes.isError && <Erro erro={equipes.error} tentarDeNovo={equipes.refetch} />}
        {equipes.data && visiveis.length === 0 && <Vazio titulo="Nenhuma turma definida nesta competição ainda" />}

        {visiveis.length > 0 && (
          <ul className="grid grid-cols-3 gap-3">
            {visiveis.map((equipe) => (
              <li key={equipe.id}>
                <Link
                  to={`/equipes/${equipe.id}`}
                  className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border border-borda bg-superficie p-2 transition-colors hover:bg-superficie-2"
                >
                  <Escudo equipe={equipe} tamanho={52} />
                  <span className="font-display text-lg leading-none font-bold">{equipe.nome}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
