// ============================================================
// SELETOR DE COMPETIÇÃO: chips roláveis na horizontal, cada um
// com o ícone do esporte e a cor da competição.
// O primeiro chip é a opção "todas" (ex.: "Todas" ou "Geral");
// use comTodas={false} quando sempre há uma competição escolhida
// (ex.: Chaveamento).
// valor = slug da competição, ou null para "todas".
// ============================================================
import { useCompeticoes } from '../hooks/consultas';
import { IconeEsporte, IconeTrofeu } from './Icones';
import { nomeCurtoCompeticao } from '../utils/formatos';

function Chip({ ativo, cor, aoClicar, children }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={aoClicar}
      style={{ '--cor': cor }}
      className={`flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
        ativo
          ? 'border-transparent bg-[var(--cor)] text-white'
          : 'border-borda bg-superficie text-texto-2 hover:text-texto'
      }`}
    >
      {children}
    </button>
  );
}

export default function SeletorCompeticao({
  valor,
  aoMudar,
  rotuloTodas = 'Todas',
  rotulo = 'Filtrar por competição',
  comTodas = true,
}) {
  const { data: competicoes, isPending, isError } = useCompeticoes();

  if (isError) return null; // sem a lista, a tela continua funcionando sem o filtro

  return (
    <div role="group" aria-label={rotulo} className="rolagem-horizontal -mx-4 flex gap-2 px-4 py-1">
      {comTodas && (
        <Chip ativo={!valor} cor="#2563EB" aoClicar={() => aoMudar(null)}>
          <IconeTrofeu tamanho={18} />
          {rotuloTodas}
        </Chip>
      )}

      {isPending &&
        [1, 2, 3].map((n) => (
          <span key={n} className="h-11 w-32 shrink-0 rounded-full bg-superficie motion-safe:animate-pulse" aria-hidden="true" />
        ))}

      {competicoes?.map((competicao) => {
        const ativo = valor === competicao.slug;
        return (
          <Chip key={competicao.slug} ativo={ativo} cor={competicao.cor} aoClicar={() => aoMudar(competicao.slug)}>
            <span className={ativo ? '' : 'texto-cor'}>
              <IconeEsporte esporte={competicao.esporte} tamanho={18} />
            </span>
            {nomeCurtoCompeticao(competicao)}
          </Chip>
        );
      })}
    </div>
  );
}
