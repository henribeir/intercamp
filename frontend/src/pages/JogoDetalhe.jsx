// ============================================================
// TELA DETALHE DO JOGO (/jogos/:id)
// - Cabeçalho: "Futsal Masculino · 1ª Fase · Jogo 3" e o local
// - Escudos, placar grande, selo AO VIVO e minuto (calculado aqui,
//   atualizado a cada 30 s)
// - Gols: abas Resumo (linha do tempo) e Estatísticas (barras)
// - Vôlei: tabela de sets, sem aba de estatísticas
// O tempo real (SSE) atualiza esta tela sozinho.
// ============================================================
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useJogo } from '../hooks/consultas';
import { useAgora } from '../hooks/useAgora';
import Escudo from '../components/Escudo';
import SeloStatus from '../components/SeloStatus';
import Abas from '../components/Abas';
import { Carregando, Erro, Vazio } from '../components/Estados';
import { IconeAlvo, IconeApito, IconeBola, IconeCartao, IconeTrofeu, IconeVoltar } from '../components/Icones';
import { descricaoJogo, nomeDaVaga, quandoJogo, textoAoVivo, tituloDoDia } from '../utils/formatos';

// ------------------------------------------------------------
// Cabeçalho e placar
// ------------------------------------------------------------
function Cabecalho({ jogo }) {
  const navegar = useNavigate();
  const voltar = () => (window.history.length > 1 ? navegar(-1) : navegar('/jogos'));

  return (
    <header className="grid grid-cols-[44px_1fr_44px] items-center gap-1" style={{ '--cor': jogo.competicao.cor }}>
      <button
        type="button"
        onClick={voltar}
        aria-label="Voltar"
        className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-superficie"
      >
        <IconeVoltar />
      </button>
      <div className="min-w-0 text-center">
        <h1 className="texto-cor text-sm leading-snug font-semibold">{descricaoJogo(jogo)}</h1>
        <p className="truncate text-xs text-texto-2">{jogo.local || 'Local a definir'}</p>
      </div>
      <span aria-hidden="true" />
    </header>
  );
}

function Momento({ jogo, agora }) {
  if (jogo.status === 'ao_vivo') return textoAoVivo(jogo, agora);
  if (jogo.status === 'encerrado') return 'Fim de jogo';
  return quandoJogo(jogo, agora);
}

function Placar({ jogo, agora }) {
  const ehVolei = jogo.competicao.formato_placar === 'sets';
  const vencedor = jogo.status === 'encerrado' ? [jogo.equipe_a, jogo.equipe_b].find((e) => e?.id === jogo.vencedor_id) : null;

  return (
    <section aria-label="Placar" className="mt-4 rounded-3xl border border-borda bg-superficie px-3 pt-4 pb-5">
      <div className="flex flex-col items-center gap-1.5">
        <SeloStatus status={jogo.status} />
        {/* aria-live: leitores de tela anunciam a mudança do minuto/set */}
        <p aria-live="polite" className="numeros-fixos text-xs font-semibold text-texto-2">
          <Momento jogo={jogo} agora={agora} />
        </p>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {['a', 'b'].map((lado, indice) => (
          <div key={lado} className={`flex min-w-0 flex-col items-center gap-2 text-center ${indice === 1 ? 'order-3' : ''}`}>
            <Escudo equipe={jogo[`equipe_${lado}`]} tamanho={64} />
            <span
              className={
                jogo[`equipe_${lado}`]
                  ? 'w-full truncate font-display text-xl font-bold tracking-wide'
                  : 'text-xs leading-tight text-texto-2'
              }
            >
              {nomeDaVaga(jogo, lado)}
            </span>
          </div>
        ))}

        <div className="order-2 flex flex-col items-center">
          {jogo.status === 'agendado' ? (
            <span className="font-display text-3xl font-semibold text-texto-2 uppercase">vs</span>
          ) : (
            <p className="numeros-fixos font-display text-[56px] leading-none font-bold" aria-label={`Placar ${jogo.placar_a} a ${jogo.placar_b}`}>
              {jogo.placar_a}
              <span className="mx-2 text-texto-2">-</span>
              {jogo.placar_b}
            </p>
          )}
          {ehVolei && jogo.status !== 'agendado' && (
            <span className="mt-1 text-[11px] font-semibold tracking-wider text-texto-2 uppercase">sets</span>
          )}
        </div>
      </div>

      {vencedor && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-alerta">
          <IconeTrofeu tamanho={18} />
          Vitória de {vencedor.nome}
        </p>
      )}
    </section>
  );
}

// ------------------------------------------------------------
// Linha do tempo (esportes de gols)
// ------------------------------------------------------------
const EVENTOS = {
  gol: { rotulo: 'Gol', icone: <IconeBola tamanho={20} /> },
  cartao_amarelo: { rotulo: 'Cartão amarelo', icone: <IconeCartao tamanho={20} cor="#FACC15" /> },
  cartao_vermelho: { rotulo: 'Cartão vermelho', icone: <IconeCartao tamanho={20} cor="#EF4444" /> },
  falta: { rotulo: 'Falta', icone: <IconeApito tamanho={20} /> },
  finalizacao: { rotulo: 'Finalização', icone: <IconeAlvo tamanho={20} /> },
  finalizacao_alvo: { rotulo: 'Finalização no alvo', icone: <IconeAlvo tamanho={20} className="text-primaria-clara" /> },
  inicio: { rotulo: 'Início da partida', icone: <IconeApito tamanho={20} /> },
  intervalo: { rotulo: 'Intervalo', icone: <IconeApito tamanho={20} /> },
  fim: { rotulo: 'Fim de jogo', icone: <IconeApito tamanho={20} /> },
};

function LinhaDoTempo({ jogo }) {
  if (jogo.eventos.length === 0) {
    return (
      <Vazio
        titulo={jogo.status === 'agendado' ? 'A partida ainda não começou' : 'Nenhum lance registrado'}
        texto="Os lances aparecem aqui em tempo real."
        icone={<IconeApito tamanho={32} />}
      />
    );
  }

  const nomeDaEquipe = (equipeId) => [jogo.equipe_a, jogo.equipe_b].find((e) => e?.id === equipeId)?.nome;

  return (
    <section aria-labelledby="titulo-linha" className="rounded-2xl border border-borda bg-superficie p-4">
      <h2 id="titulo-linha" className="mb-2 font-semibold">
        Linha do tempo
      </h2>
      <ol className="flex flex-col">
        {jogo.eventos.map((evento) => {
          const tipo = EVENTOS[evento.tipo] ?? { rotulo: evento.tipo, icone: <IconeApito tamanho={20} /> };
          const equipe = nomeDaEquipe(evento.equipe_id);
          const detalhe = [evento.jogador, equipe && (evento.jogador ? `(${equipe})` : equipe)].filter(Boolean).join(' ');

          return (
            <li key={evento.id} className="flex items-center gap-3 border-b border-borda/60 py-2.5 last:border-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-texto">{tipo.icone}</span>
              <span className="numeros-fixos w-9 shrink-0 text-sm font-semibold text-texto-2">
                {evento.minuto != null ? `${evento.minuto}'` : ''}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{tipo.rotulo}</span>
                {detalhe && <span className="block truncate text-xs text-texto-2">{detalhe}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ------------------------------------------------------------
// Estatísticas: barras azul (equipe A) x vermelho (equipe B)
// ------------------------------------------------------------
const ITENS_ESTATISTICA = [
  ['finalizacoes', 'Finalizações'],
  ['finalizacoes_alvo', 'Finalizações no alvo'],
  ['faltas', 'Faltas'],
  ['cartoes_amarelos', 'Cartões amarelos'],
  ['cartoes_vermelhos', 'Cartões vermelhos'],
];

function BarraComparativa({ rotulo, a, b }) {
  const total = a + b;
  const larguraA = total === 0 ? 50 : (a / total) * 100;

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-[2rem_1fr_2rem] items-center text-sm">
        <span className="numeros-fixos font-semibold">{a}</span>
        <span className="text-center text-texto-2">{rotulo}</span>
        <span className="numeros-fixos text-right font-semibold">{b}</span>
      </div>
      <div className={`flex h-2 gap-1 ${total === 0 ? 'opacity-30' : ''}`} aria-hidden="true">
        <span className="rounded-full bg-primaria" style={{ width: `${larguraA}%` }} />
        <span className="flex-1 rounded-full bg-ao-vivo" />
      </div>
    </div>
  );
}

function Estatisticas({ jogo }) {
  const { a, b } = jogo.estatisticas;

  return (
    <section aria-labelledby="titulo-estatisticas" className="rounded-2xl border border-borda bg-superficie p-4">
      <h2 id="titulo-estatisticas" className="font-semibold">
        Estatísticas da partida
      </h2>
      <div className="mt-2 mb-4 flex justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primaria" aria-hidden="true" />
          {nomeDaVaga(jogo, 'a')}
        </span>
        <span className="flex items-center gap-1.5">
          {nomeDaVaga(jogo, 'b')}
          <span className="h-2.5 w-2.5 rounded-full bg-ao-vivo" aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {ITENS_ESTATISTICA.map(([campo, rotulo]) => (
          <BarraComparativa key={campo} rotulo={rotulo} a={a[campo]} b={b[campo]} />
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Sets do vôlei
// ------------------------------------------------------------
function TabelaSets({ jogo }) {
  if (jogo.sets.length === 0) {
    return <Vazio titulo="A partida ainda não começou" texto="Os pontos de cada set aparecem aqui em tempo real." />;
  }

  return (
    <section aria-labelledby="titulo-sets" className="rounded-2xl border border-borda bg-superficie p-4">
      <h2 id="titulo-sets" className="mb-2 font-semibold">
        Sets
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-texto-2">
            <th scope="col" className="py-2 text-left font-medium">Set</th>
            <th scope="col" className="py-2 text-center font-medium">{nomeDaVaga(jogo, 'a')}</th>
            <th scope="col" className="py-2 text-center font-medium">{nomeDaVaga(jogo, 'b')}</th>
          </tr>
        </thead>
        <tbody>
          {jogo.sets.map((set) => {
            // Set encerrado: vencedor em destaque. Set em andamento: os dois em branco.
            const venceuA = !set.encerrado || set.pontos_a > set.pontos_b;
            const venceuB = !set.encerrado || set.pontos_b > set.pontos_a;
            return (
              <tr key={set.numero} className="border-t border-borda/60">
                <th scope="row" className="py-2.5 text-left font-medium">
                  {set.numero}º
                  {!set.encerrado && (
                    <span className="ml-2 rounded bg-ao-vivo/15 px-1.5 py-0.5 text-[10px] font-bold text-ao-vivo uppercase">
                      em andamento
                    </span>
                  )}
                </th>
                <td className={`numeros-fixos py-2.5 text-center font-display text-xl ${venceuA ? 'font-bold' : 'text-texto-2'}`}>
                  {set.pontos_a}
                </td>
                <td className={`numeros-fixos py-2.5 text-center font-display text-xl ${venceuB ? 'font-bold' : 'text-texto-2'}`}>
                  {set.pontos_b}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

// ------------------------------------------------------------
// Informações (data, horário e local)
// ------------------------------------------------------------
function Informacoes({ jogo }) {
  const itens = [
    ['Data', jogo.data ? tituloDoDia(jogo.data) : 'A definir'],
    ['Horário', jogo.horario ?? 'A definir'],
    ['Local', jogo.local ?? 'A definir'],
  ];
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-2xl border border-borda bg-superficie p-4 text-sm">
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo} className="contents">
          <dt className="text-texto-2">{rotulo}</dt>
          <dd className="text-right font-medium">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

// ------------------------------------------------------------
// Tela
// ------------------------------------------------------------
const ABAS_GOLS = [
  { valor: 'resumo', rotulo: 'Resumo' },
  { valor: 'estatisticas', rotulo: 'Estatísticas' },
];

export default function JogoDetalhe() {
  const { id } = useParams();
  const agora = useAgora(30000);
  const { data: jogo, isPending, isError, error, refetch } = useJogo(id);
  const [aba, setAba] = useState('resumo');

  if (isPending) return <Carregando quantidade={2} texto="Carregando jogo…" />;
  if (isError) return <Erro erro={error} tentarDeNovo={error?.status === 404 ? null : refetch} />;

  const ehVolei = jogo.competicao.formato_placar === 'sets';

  return (
    <>
      <Cabecalho jogo={jogo} />
      <Placar jogo={jogo} agora={agora} />

      <div className="mt-4 flex flex-col gap-4">
        {ehVolei ? (
          <TabelaSets jogo={jogo} />
        ) : (
          <>
            <Abas abas={ABAS_GOLS} valor={aba} aoMudar={setAba} rotulo="Detalhes da partida" />
            <div role="tabpanel">{aba === 'resumo' ? <LinhaDoTempo jogo={jogo} /> : <Estatisticas jogo={jogo} />}</div>
          </>
        )}
        <Informacoes jogo={jogo} />
      </div>
    </>
  );
}
