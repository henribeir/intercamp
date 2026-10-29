// ============================================================
// TELA CALENDÁRIO: jogos agrupados por dia (hoje em destaque)
// e um grupo "Data a definir". Abas: Todos / 1ª fase / Fases finais.
// ============================================================
import { useMemo, useState } from 'react';
import { useJogos } from '../hooks/consultas';
import { useAgora } from '../hooks/useAgora';
import TituloPagina from '../components/TituloPagina';
import Abas from '../components/Abas';
import SeletorCompeticao from '../components/SeletorCompeticao';
import LinhaJogo from '../components/LinhaJogo';
import { Carregando, Erro, Vazio } from '../components/Estados';
import { IconeCalendario } from '../components/Icones';
import { diaDoCalendario, hojeISO } from '../utils/formatos';

const ABAS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'primeira', rotulo: '1ª fase' },
  { valor: 'finais', rotulo: 'Fases finais' },
];

function passaNaAba(jogo, aba) {
  if (aba === 'primeira') return jogo.fase_rotulo === '1ª Fase';
  if (aba === 'finais') return jogo.fase_rotulo !== '1ª Fase';
  return true;
}

/** Dias em ordem; "Data a definir" sempre por último */
function agrupar(jogos) {
  const grupos = new Map();
  for (const jogo of jogos) {
    const chave = jogo.data ?? 'sem-data';
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(jogo);
  }
  return [...grupos.entries()].sort(([a], [b]) => (a === 'sem-data' ? 1 : b === 'sem-data' ? -1 : a.localeCompare(b)));
}

export default function Calendario() {
  const agora = useAgora(30000);
  const hoje = hojeISO(agora);
  const { data: jogos, isPending, isError, error, refetch } = useJogos();
  const [aba, setAba] = useState('todos');
  const [competicao, setCompeticao] = useState(null);

  const grupos = useMemo(
    () => agrupar((jogos ?? []).filter((jogo) => passaNaAba(jogo, aba) && (!competicao || jogo.competicao.slug === competicao))),
    [jogos, aba, competicao],
  );

  return (
    <>
      <TituloPagina titulo="Calendário" voltar />
      <div className="flex flex-col gap-3">
        <SeletorCompeticao valor={competicao} aoMudar={setCompeticao} />
        <Abas abas={ABAS} valor={aba} aoMudar={setAba} rotulo="Fase" />
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {isPending && <Carregando tipo="linhas" quantidade={5} texto="Carregando calendário…" />}
        {isError && <Erro erro={error} tentarDeNovo={refetch} />}
        {jogos && grupos.length === 0 && (
          <Vazio titulo="Nenhum jogo nesta seleção" icone={<IconeCalendario tamanho={32} />} />
        )}

        {grupos.map(([chave, lista]) => {
          const ehHoje = chave === hoje;
          const titulo = chave === 'sem-data' ? 'Data a definir' : `${diaDoCalendario(chave)}${ehHoje ? ' · Hoje' : ''}`;
          return (
            <section
              key={chave}
              aria-label={titulo}
              className={`overflow-hidden rounded-2xl border bg-superficie ${
                ehHoje ? 'border-primaria shadow-[0_0_24px_-10px_rgba(37,99,235,0.9)]' : 'border-borda'
              }`}
            >
              <h2
                className={`px-3 py-2 text-sm font-semibold ${
                  ehHoje ? 'bg-primaria text-white' : 'border-b border-borda text-texto-2'
                }`}
              >
                {titulo}
              </h2>
              <ul className="divide-y divide-borda/60">
                {lista.map((jogo) => (
                  <li key={jogo.id}>
                    <LinhaJogo jogo={jogo} agora={agora} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
