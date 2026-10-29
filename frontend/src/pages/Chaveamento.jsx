// ============================================================
// TELA CHAVEAMENTO (a mais importante do app)
// - Uma coluna por rodada, vinda da API (1ª Fase, 2ª Fase, 3ª Fase,
//   Final...). A quantidade varia por competição: nada é fixo.
// - Conectores em SVG ligam cada jogo à vaga que o vencedor ocupa
//   (origem_a_jogo_id / origem_b_jogo_id).
// - Última coluna: troféu e campeão (ou "Campeão a definir").
// - Rola na horizontal dentro do próprio quadro (a página não).
// A competição escolhida fica na URL: #/chaveamento?competicao=slug
// ============================================================
import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useChaveamento, useCompeticoes } from '../hooks/consultas';
import { useAgora } from '../hooks/useAgora';
import TituloPagina from '../components/TituloPagina';
import SeletorCompeticao from '../components/SeletorCompeticao';
import Escudo from '../components/Escudo';
import TrofeuOuro from '../components/TrofeuOuro';
import { Carregando, Erro, Vazio } from '../components/Estados';
import { IconeChaveamento } from '../components/Icones';
import { nomeDaVaga, quandoJogo } from '../utils/formatos';

// Espaço vertical reservado para cada jogo na coluna mais cheia
const ALTURA_POR_JOGO = 118;
// Altura mínima: o card do campeão precisa caber mesmo com 1 jogo por fase
const ALTURA_MINIMA = 250;

// ------------------------------------------------------------
// Card de um jogo dentro da chave
// ------------------------------------------------------------
function SituacaoJogo({ jogo, agora }) {
  if (jogo.status === 'ao_vivo') {
    return (
      <span className="flex items-center gap-1 text-ao-vivo">
        <span className="h-1.5 w-1.5 rounded-full bg-ao-vivo motion-safe:animate-pulse" aria-hidden="true" />
        Ao vivo
      </span>
    );
  }
  if (jogo.status === 'encerrado') return <span>Fim</span>;
  return <span className="numeros-fixos truncate">{quandoJogo(jogo, agora)}</span>;
}

function VagaNaChave({ jogo, lado }) {
  const equipe = jogo[`equipe_${lado}`];
  const temPlacar = jogo.status !== 'agendado';
  const venceu = jogo.status === 'encerrado' && equipe && jogo.vencedor_id === equipe.id;
  const perdeu = jogo.status === 'encerrado' && equipe && !venceu;

  return (
    <div data-vaga={`${jogo.id}-${lado}`} className={`flex items-center gap-1.5 py-1 ${perdeu ? 'opacity-50' : ''}`}>
      <Escudo equipe={equipe} tamanho={18} />
      <span
        className={`min-w-0 flex-1 truncate ${
          equipe ? `font-display text-[15px] ${venceu ? 'font-bold' : 'font-semibold'}` : 'text-[11px] text-texto-2'
        }`}
      >
        {nomeDaVaga(jogo, lado)}
      </span>
      {temPlacar && (
        <span className={`numeros-fixos font-display text-base ${venceu ? 'font-bold text-texto' : 'text-texto-2'}`}>
          {jogo[`placar_${lado}`]}
        </span>
      )}
    </div>
  );
}

function CardChave({ jogo, agora }) {
  const aoVivo = jogo.status === 'ao_vivo';
  return (
    <Link
      to={`/jogos/${jogo.id}`}
      data-jogo={jogo.id}
      className={`relative block rounded-xl border bg-superficie px-2.5 py-2 transition-colors hover:bg-superficie-2 ${
        aoVivo ? 'border-ao-vivo/70 shadow-[0_0_18px_-6px_rgba(239,68,68,0.7)]' : 'border-borda'
      }`}
    >
      <div className="mb-0.5 flex items-center justify-between gap-2 text-[10px] font-semibold tracking-wide text-texto-2 uppercase">
        <span className="texto-cor shrink-0">Jogo {jogo.numero}</span>
        <SituacaoJogo jogo={jogo} agora={agora} />
      </div>
      <VagaNaChave jogo={jogo} lado="a" />
      <div className="h-px bg-borda" aria-hidden="true" />
      <VagaNaChave jogo={jogo} lado="b" />
    </Link>
  );
}

function CardCampeao({ campeao, vice }) {
  return (
    <div
      data-campeao
      className="relative flex w-full flex-col items-center gap-1.5 rounded-2xl border border-alerta/40 bg-[radial-gradient(100%_100%_at_50%_0%,#3A2A05_0%,#0E1626_70%)] px-3 py-4 text-center"
    >
      <TrofeuOuro className="h-14 w-auto" />
      <p className="text-[10px] font-semibold tracking-[0.18em] text-alerta uppercase">Campeão</p>
      {campeao ? (
        <>
          <Escudo equipe={campeao} tamanho={36} />
          <p className="font-display text-xl font-bold">{campeao.nome}</p>
          {vice && <p className="text-[11px] text-texto-2">Vice: {vice.nome}</p>}
        </>
      ) : (
        <p className="text-sm font-semibold text-texto-2">Campeão a definir</p>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Conectores: mede onde cada card ficou e desenha as linhas
// ------------------------------------------------------------
function useConectores(area, dados) {
  const [linhas, setLinhas] = useState([]);

  useLayoutEffect(() => {
    const elemento = area.current;
    if (!elemento) return undefined;

    function medir() {
      const base = elemento.getBoundingClientRect();
      const ladoDireito = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.right - base.left, y: r.top + r.height / 2 - base.top };
      };
      // Chega na borda esquerda do card, na altura da vaga (A ou B)
      const naVaga = (elVaga) => {
        const card = elVaga.closest('[data-jogo]').getBoundingClientRect();
        const vaga = elVaga.getBoundingClientRect();
        return { x: card.left - base.left, y: vaga.top + vaga.height / 2 - base.top };
      };

      const todos = dados.rodadas.flatMap((rodada) => rodada.jogos);
      const novas = [];

      for (const jogo of todos) {
        for (const lado of ['a', 'b']) {
          const origemId = jogo[`origem_${lado}_jogo_id`];
          const elOrigem = origemId && elemento.querySelector(`[data-jogo="${origemId}"]`);
          const elVaga = elemento.querySelector(`[data-vaga="${jogo.id}-${lado}"]`);
          if (!elOrigem || !elVaga) continue;
          const origem = todos.find((j) => j.id === origemId);
          novas.push({ id: `${origemId}-${jogo.id}-${lado}`, de: ladoDireito(elOrigem), para: naVaga(elVaga), decidida: origem?.status === 'encerrado' });
        }
      }

      // Final -> troféu
      const final = todos.find((jogo) => jogo.eh_final);
      const elFinal = final && elemento.querySelector(`[data-jogo="${final.id}"]`);
      const elCampeao = elemento.querySelector('[data-campeao]');
      if (elFinal && elCampeao) {
        const r = elCampeao.getBoundingClientRect();
        novas.push({
          id: 'final',
          de: ladoDireito(elFinal),
          para: { x: r.left - base.left, y: r.top + r.height / 2 - base.top },
          decidida: final.status === 'encerrado',
        });
      }

      setLinhas(novas);
    }

    medir();
    // Mede de novo se o tamanho mudar (fontes carregando, tela girando...)
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    document.fonts?.ready.then(medir);
    return () => observador.disconnect();
  }, [area, dados]);

  return linhas;
}

function Conectores({ linhas }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      {linhas.map(({ id, de, para, decidida }) => {
        const meio = (de.x + para.x) / 2;
        return (
          <path
            key={id}
            d={`M ${de.x} ${de.y} H ${meio} V ${para.y} H ${para.x}`}
            fill="none"
            // Caminho já decidido fica na cor da competição; o resto, discreto
            style={{ stroke: decidida ? 'color-mix(in srgb, var(--cor) 70%, white)' : '#2A3A5C' }}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

// ------------------------------------------------------------
// A chave inteira
// ------------------------------------------------------------
function Chave({ dados }) {
  const area = useRef(null);
  const agora = useAgora(30000);
  const linhas = useConectores(area, dados);
  const maiorRodada = Math.max(1, ...dados.rodadas.map((rodada) => rodada.jogos.length));
  const alturaColunas = Math.max(ALTURA_MINIMA, maiorRodada * ALTURA_POR_JOGO);

  return (
    <div
      role="region"
      aria-label={`Chaveamento de ${dados.competicao.nome}`}
      tabIndex={0}
      className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-3"
      style={{ '--cor': dados.competicao.cor }}
    >
      {/* pr-4: folga no fim da rolagem (alguns navegadores ignoram o padding do quadro) */}
      <div ref={area} className="relative inline-flex gap-10 pr-4">
        <Conectores linhas={linhas} />

        {dados.rodadas.map((rodada) => (
          <section key={rodada.fase_ordem} aria-label={rodada.rotulo} className="flex w-44 shrink-0 flex-col">
            <h2 className="texto-cor mb-2 text-xs font-bold tracking-wide uppercase">{rodada.rotulo}</h2>
            <ol className="flex flex-col justify-around" style={{ height: alturaColunas }}>
              {rodada.jogos.map((jogo) => (
                <li key={jogo.id}>
                  <CardChave jogo={jogo} agora={agora} />
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section aria-label="Campeão" className="flex w-40 shrink-0 flex-col">
          <h2 className="mb-2 text-xs font-bold tracking-wide text-alerta uppercase">Título</h2>
          <div className="flex items-center" style={{ height: alturaColunas }}>
            <CardCampeao campeao={dados.campeao} vice={dados.vice} />
          </div>
        </section>
      </div>
    </div>
  );
}

function BannerMelhores() {
  return (
    <section
      aria-label="Os melhores chegam até aqui"
      className="relative mt-6 flex items-center justify-between gap-3 overflow-hidden rounded-3xl border border-borda bg-[radial-gradient(110%_130%_at_100%_100%,#5A3B00_0%,#1A1405_38%,#0A1430_75%,#070B14_100%)] px-5 py-5"
    >
      <p className="font-display text-[28px] leading-[0.95] font-bold uppercase">
        Os melhores
        <br />
        <span className="text-alerta">chegam até aqui</span>
      </p>
      <TrofeuOuro className="h-20 w-auto" />
    </section>
  );
}

export default function Chaveamento() {
  const [parametros, setParametros] = useSearchParams();
  const { data: competicoes } = useCompeticoes();

  // Competição da URL ou, se não houver, a primeira da lista
  const slug = parametros.get('competicao') || competicoes?.[0]?.slug || null;
  const { data, isPending, isError, error, refetch } = useChaveamento(slug);

  const escolher = (novoSlug) => setParametros({ competicao: novoSlug }, { replace: true });

  return (
    <>
      <TituloPagina titulo="Chaveamento" />
      <SeletorCompeticao valor={slug} aoMudar={escolher} comTodas={false} rotulo="Escolher competição" />

      <div className="mt-4">
        {(!slug || isPending) && <Carregando quantidade={2} texto="Carregando chaveamento…" />}
        {isError && <Erro erro={error} tentarDeNovo={error?.status === 404 ? null : refetch} />}
        {data && data.rodadas.length === 0 && (
          <Vazio titulo="Nenhum jogo nesta competição" icone={<IconeChaveamento tamanho={32} />} />
        )}
        {data && data.rodadas.length > 0 && (
          <>
            <p className="mb-3 text-xs text-texto-2">Arraste para o lado para ver todas as fases.</p>
            <Chave dados={data} />
          </>
        )}
      </div>

      <BannerMelhores />
    </>
  );
}
