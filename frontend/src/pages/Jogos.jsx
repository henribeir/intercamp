// ============================================================
// TELA JOGOS
// - Abas: Todos / Ao vivo / Próximos / Resultados
// - Faixa de dias: só os dias que têm jogo + "A definir" (sem data)
// - Filtro por competição
// - Lista de jogos agrupada por dia
// Busca a lista inteira uma vez e filtra aqui no navegador
// (são poucos jogos, e o tempo real atualiza tudo de uma vez).
// ============================================================
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useJogos } from '../hooks/consultas';
import { useAgora } from '../hooks/useAgora';
import TituloPagina from '../components/TituloPagina';
import Abas from '../components/Abas';
import SeletorCompeticao from '../components/SeletorCompeticao';
import JogoCard from '../components/JogoCard';
import { Carregando, Erro, Vazio } from '../components/Estados';
import { IconeCalendario } from '../components/Icones';
import { partesDoDia, tituloDoDia } from '../utils/formatos';

const ABAS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ao_vivo', rotulo: 'Ao vivo' },
  { valor: 'agendado', rotulo: 'Próximos' },
  { valor: 'encerrado', rotulo: 'Resultados' },
];

const SEM_DATA = 'sem';

/** Agrupa a lista por dia, na ordem em que a API já devolve */
function agruparPorDia(jogos, agora) {
  const grupos = new Map();
  for (const jogo of jogos) {
    const chave = jogo.data ?? SEM_DATA;
    if (!grupos.has(chave)) {
      grupos.set(chave, { chave, titulo: jogo.data ? tituloDoDia(jogo.data, agora) : 'Data a definir', jogos: [] });
    }
    grupos.get(chave).jogos.push(jogo);
  }
  return [...grupos.values()];
}

function ChipDia({ ativo, aoClicar, children, rotulo }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={rotulo}
      onClick={aoClicar}
      className={`flex h-16 min-w-14 shrink-0 snap-start flex-col items-center justify-center rounded-xl border px-2 transition-colors ${
        ativo ? 'border-transparent bg-primaria text-white' : 'border-borda bg-superficie text-texto-2 hover:text-texto'
      }`}
    >
      {children}
    </button>
  );
}

function FaixaDeDias({ dias, temSemData, valor, aoMudar }) {
  return (
    <div role="group" aria-label="Filtrar por dia" className="rolagem-horizontal -mx-4 flex gap-2 px-4 py-1">
      <ChipDia ativo={valor === null} aoClicar={() => aoMudar(null)} rotulo="Todos os dias">
        <span className="text-sm font-semibold">Todos</span>
      </ChipDia>

      {dias.map((dia) => {
        const { semana, dia: numero } = partesDoDia(dia);
        return (
          <ChipDia key={dia} ativo={valor === dia} aoClicar={() => aoMudar(dia)} rotulo={tituloDoDia(dia)}>
            <span className="text-[11px] font-semibold">{semana}</span>
            <span className="font-display text-2xl leading-none font-bold">{numero}</span>
          </ChipDia>
        );
      })}

      {temSemData && (
        <ChipDia ativo={valor === SEM_DATA} aoClicar={() => aoMudar(SEM_DATA)} rotulo="Jogos com data a definir">
          <span className="text-[11px] leading-tight font-semibold">
            A<br />definir
          </span>
        </ChipDia>
      )}
    </div>
  );
}

export default function Jogos() {
  const agora = useAgora(30000);
  const { data: jogos, isPending, isError, error, refetch } = useJogos();

  const [aba, setAba] = useState('todos');
  const [competicao, setCompeticao] = useState(null);
  const [diaEscolhido, setDiaEscolhido] = useState(null);

  // 1) Filtra por aba e competição
  const filtrados = useMemo(
    () =>
      (jogos ?? []).filter(
        (jogo) => (aba === 'todos' || jogo.status === aba) && (!competicao || jogo.competicao.slug === competicao),
      ),
    [jogos, aba, competicao],
  );

  // 2) Dias que têm jogo (a faixa mostra só esses)
  const dias = useMemo(() => [...new Set(filtrados.map((jogo) => jogo.data).filter(Boolean))].sort(), [filtrados]);
  const temSemData = filtrados.some((jogo) => !jogo.data);

  // Se o dia escolhido sumiu com o filtro, volta para "Todos"
  const dia = diaEscolhido === SEM_DATA ? (temSemData ? SEM_DATA : null) : dias.includes(diaEscolhido) ? diaEscolhido : null;

  // 3) Filtra pelo dia e agrupa
  const grupos = useMemo(() => {
    const doDia = dia === null ? filtrados : filtrados.filter((jogo) => (jogo.data ?? SEM_DATA) === dia);
    return agruparPorDia(doDia, agora);
  }, [filtrados, dia, agora]);

  return (
    <>
      <TituloPagina
        titulo="Jogos"
        acao={
          <Link
            to="/calendario"
            aria-label="Abrir calendário"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-borda bg-superficie text-texto"
          >
            <IconeCalendario tamanho={22} />
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        <Abas abas={ABAS} valor={aba} aoMudar={setAba} rotulo="Situação dos jogos" />
        <SeletorCompeticao valor={competicao} aoMudar={setCompeticao} />
        {!isPending && !isError && (dias.length > 0 || temSemData) && (
          <FaixaDeDias dias={dias} temSemData={temSemData} valor={dia} aoMudar={setDiaEscolhido} />
        )}
      </div>

      <div className="mt-5">
        {isPending && <Carregando quantidade={3} texto="Carregando jogos…" />}
        {isError && <Erro erro={error} tentarDeNovo={refetch} />}
        {!isPending && !isError && grupos.length === 0 && (
          <Vazio
            titulo={aba === 'ao_vivo' ? 'Nenhum jogo ao vivo agora' : 'Nenhum jogo encontrado'}
            texto="Tente outra aba ou outra competição."
          />
        )}

        {grupos.map((grupo) => (
          <section key={grupo.chave} aria-labelledby={`dia-${grupo.chave}`} className="mb-6">
            <h2 id={`dia-${grupo.chave}`} className="mb-3 text-sm font-semibold text-texto">
              {grupo.titulo}
            </h2>
            <ul className="flex flex-col gap-3">
              {grupo.jogos.map((jogo) => (
                <li key={jogo.id}>
                  <JogoCard jogo={jogo} agora={agora} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
