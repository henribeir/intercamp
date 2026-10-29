// ============================================================
// TELA CLASSIFICAÇÃO = "Ranking das turmas"
// - Seletor: "Geral" + as 6 competições
// - Tabela: # TURMA P J V D (+ SG quando há competição escolhida)
// - Faixa lateral pela situação: campeã (azul), em disputa
//   (amarelo), eliminada (vermelho) + legenda
// - Banner "Rumo ao título" no rodapé
// ============================================================
import { useState } from 'react';
import { useRanking } from '../hooks/consultas';
import TituloPagina from '../components/TituloPagina';
import SeletorCompeticao from '../components/SeletorCompeticao';
import Escudo from '../components/Escudo';
import TrofeuOuro from '../components/TrofeuOuro';
import { Carregando, Erro, Vazio } from '../components/Estados';
import { IconeRanking } from '../components/Icones';

const SITUACOES = {
  campea: { rotulo: 'Campeã', cor: '#2563EB' },
  em_disputa: { rotulo: 'Em disputa', cor: '#FACC15' },
  eliminada: { rotulo: 'Eliminada', cor: '#EF4444' },
};

function Legenda() {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-texto-2" aria-label="Legenda">
      {Object.entries(SITUACOES).map(([chave, { rotulo, cor }]) => (
        <li key={chave} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: cor }} aria-hidden="true" />
          {rotulo}
        </li>
      ))}
    </ul>
  );
}

function Tabela({ classificacao, comSaldo }) {
  const colunas = ['P', 'J', 'V', 'D', ...(comSaldo ? ['SG'] : [])];
  const titulos = { P: 'Pontos', J: 'Jogos', V: 'Vitórias', D: 'Derrotas', SG: 'Saldo' };

  return (
    <div className="overflow-hidden rounded-2xl border border-borda bg-superficie">
      <table className="w-full text-sm">
        <caption className="sr-only">Ranking das turmas</caption>
        <thead>
          <tr className="border-b border-borda text-[11px] tracking-wide text-texto-2 uppercase">
            <th scope="col" className="w-9 py-3 pl-4 text-left font-medium">#</th>
            <th scope="col" className="py-3 text-left font-medium">Turma</th>
            {colunas.map((coluna) => (
              <th key={coluna} scope="col" className="w-8 py-3 text-center font-medium last:w-11 last:pr-3">
                <abbr title={titulos[coluna]} className="no-underline">{coluna}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {classificacao.map((linha) => {
            const situacao = SITUACOES[linha.situacao];
            const valores = [linha.pontos, linha.jogos, linha.vitorias, linha.derrotas, ...(comSaldo ? [linha.saldo] : [])];
            return (
              <tr key={linha.equipe.id} className="border-b border-borda/60 last:border-0">
                {/* A faixa colorida é uma sombra interna na primeira célula */}
                <td className="numeros-fixos py-2.5 pl-4 font-semibold" style={{ boxShadow: `inset 3px 0 0 ${situacao.cor}` }}>
                  {linha.posicao}
                </td>
                <th scope="row" className="py-2.5 text-left font-normal">
                  <span className="flex items-center gap-2.5">
                    <Escudo equipe={linha.equipe} tamanho={24} />
                    <span className="font-display text-base font-bold tracking-wide">{linha.equipe.nome}</span>
                    <span className="sr-only">({situacao.rotulo})</span>
                  </span>
                </th>
                {valores.map((valor, indice) => (
                  <td
                    key={colunas[indice]}
                    className={`numeros-fixos py-2.5 text-center last:pr-3 ${indice === 0 ? 'font-bold' : 'text-texto-2'}`}
                  >
                    {colunas[indice] === 'SG' && valor > 0 ? `+${valor}` : valor}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BannerRumoAoTitulo() {
  return (
    <section
      aria-label="Rumo ao título"
      className="relative mt-6 flex items-center gap-4 overflow-hidden rounded-3xl border border-borda bg-[radial-gradient(110%_120%_at_0%_100%,#5A3B00_0%,#1A1405_40%,#070B14_100%)] px-5 py-5"
    >
      <TrofeuOuro />
      <p className="font-display text-[32px] leading-[0.95] font-bold uppercase">
        Rumo ao
        <br />
        <span className="text-alerta">título</span>
      </p>
    </section>
  );
}

export default function Classificacao() {
  const [competicao, setCompeticao] = useState(null);
  const { data, isPending, isError, error, refetch } = useRanking(competicao);

  return (
    <>
      <TituloPagina titulo="Ranking das turmas" />
      <SeletorCompeticao valor={competicao} aoMudar={setCompeticao} rotuloTodas="Geral" rotulo="Escolher ranking" />

      <div className="mt-4">
        {isPending && <Carregando tipo="linhas" quantidade={6} texto="Carregando ranking…" />}
        {isError && <Erro erro={error} tentarDeNovo={refetch} />}
        {data && data.classificacao.length === 0 && (
          <Vazio titulo="Nenhuma turma nesta competição" icone={<IconeRanking tamanho={32} />} />
        )}
        {data && data.classificacao.length > 0 && (
          <>
            <Tabela classificacao={data.classificacao} comSaldo={Boolean(competicao)} />
            <Legenda />
            <p className="mt-3 text-xs text-texto-2">
              Vitória vale {data.pontuacao.vitoria} ponto(s). Desempate: vitórias, títulos e nome.
            </p>
          </>
        )}
      </div>

      <BannerRumoAoTitulo />
    </>
  );
}
