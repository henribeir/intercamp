// ============================================================
// PAINEL DO MESTRE (/mestre)
// - Atalho grande para os jogos ao vivo
// - Atalhos: Definir confrontos, Notícias, Turmas
// - Todos os jogos agrupados por competição
// ============================================================
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useCompeticoes, useJogos } from '../../hooks/consultas';
import { useAgora } from '../../hooks/useAgora';
import TituloPagina from '../../components/TituloPagina';
import LinhaJogo from '../../components/LinhaJogo';
import SeloStatus from '../../components/SeloStatus';
import { Carregando, Erro } from '../../components/Estados';
import { IconeChaveamento, IconeEquipes, IconeJornal, IconeSeta } from '../../components/Icones';
import { descricaoJogo, nomeDaVaga } from '../../utils/formatos';

const ATALHOS = [
  { para: '/mestre/confrontos', rotulo: 'Definir confrontos', Icone: IconeChaveamento },
  { para: '/mestre/noticias', rotulo: 'Notícias', Icone: IconeJornal },
  { para: '/mestre/turmas', rotulo: 'Turmas', Icone: IconeEquipes },
];

function JogoAoVivo({ jogo }) {
  return (
    <Link
      to={`/mestre/jogos/${jogo.id}`}
      className="flex items-center gap-3 rounded-2xl border border-ao-vivo/60 bg-ao-vivo/10 p-4 shadow-[0_0_24px_-10px_rgba(239,68,68,0.9)]"
    >
      <div className="min-w-0 flex-1">
        <SeloStatus status="ao_vivo" />
        <p className="mt-1.5 truncate font-display text-xl font-bold">
          {nomeDaVaga(jogo, 'a')} <span className="numeros-fixos">{jogo.placar_a} - {jogo.placar_b}</span> {nomeDaVaga(jogo, 'b')}
        </p>
        <p className="truncate text-xs text-texto-2">{descricaoJogo(jogo)}</p>
      </div>
      <span className="flex items-center gap-1 text-sm font-semibold text-ao-vivo">
        Controlar <IconeSeta tamanho={18} />
      </span>
    </Link>
  );
}

export default function MestrePainel() {
  const agora = useAgora(30000);
  const jogos = useJogos();
  const competicoes = useCompeticoes();
  const aoVivo = (jogos.data ?? []).filter((jogo) => jogo.status === 'ao_vivo');

  return (
    <>
      <TituloPagina
        titulo="Área do mestre"
        acao={
          <button
            type="button"
            onClick={api.sair}
            className="min-h-11 rounded-xl border border-borda px-4 text-sm font-semibold text-texto-2 hover:text-texto"
          >
            Sair
          </button>
        }
      />

      {/* Jogo ao vivo: o atalho mais importante fica no topo */}
      {aoVivo.length > 0 && (
        <section aria-label="Jogos ao vivo" className="mb-5 flex flex-col gap-3">
          {aoVivo.map((jogo) => (
            <JogoAoVivo key={jogo.id} jogo={jogo} />
          ))}
        </section>
      )}

      <nav aria-label="Atalhos do mestre" className="grid grid-cols-3 gap-2">
        {ATALHOS.map(({ para, rotulo, Icone }) => (
          <Link
            key={para}
            to={para}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-borda bg-superficie p-2 text-center text-sm font-semibold hover:bg-superficie-2"
          >
            <Icone tamanho={26} className="text-primaria-clara" />
            {rotulo}
          </Link>
        ))}
      </nav>

      <h2 className="mt-6 mb-3 font-display text-xl font-bold tracking-wide">Todos os jogos</h2>
      {(jogos.isPending || competicoes.isPending) && <Carregando tipo="linhas" quantidade={5} />}
      {jogos.isError && <Erro erro={jogos.error} tentarDeNovo={jogos.refetch} />}

      <div className="flex flex-col gap-3">
        {competicoes.data?.map((competicao) => {
          const daCompeticao = (jogos.data ?? []).filter((jogo) => jogo.competicao.slug === competicao.slug);
          if (daCompeticao.length === 0) return null;
          return (
            <details
              key={competicao.slug}
              open={daCompeticao.some((jogo) => jogo.status === 'ao_vivo')}
              style={{ '--cor': competicao.cor }}
              className="overflow-hidden rounded-2xl border border-borda bg-superficie"
            >
              <summary className="texto-cor flex min-h-12 cursor-pointer items-center justify-between px-4 font-semibold">
                {competicao.nome}
                <span className="text-xs text-texto-2">{daCompeticao.length} jogos</span>
              </summary>
              <ul className="divide-y divide-borda/60 border-t border-borda">
                {daCompeticao.map((jogo) => (
                  <li key={jogo.id}>
                    <LinhaJogo jogo={jogo} agora={agora} para={`/mestre/jogos/${jogo.id}`} mostrarCompeticao={false} />
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </>
  );
}
