// ============================================================
// BARRA INFERIOR fixa com 5 abas (como no mockup).
// A aba ativa fica azul. Respeita a "safe-area" do iPhone.
// ============================================================
import { Link, useLocation } from 'react-router-dom';
import { IconeInicio, IconeBola, IconeRanking, IconeChaveamento, IconeMais } from './Icones';

const ABAS = [
  { para: '/', rotulo: 'Início', Icone: IconeInicio, ativa: (caminho) => caminho === '/' },
  {
    para: '/jogos',
    rotulo: 'Jogos',
    Icone: IconeBola,
    ativa: (caminho) => caminho.startsWith('/jogos') || caminho.startsWith('/calendario'),
  },
  { para: '/classificacao', rotulo: 'Classificação', Icone: IconeRanking, ativa: (caminho) => caminho.startsWith('/classificacao') },
  { para: '/chaveamento', rotulo: 'Chaveamento', Icone: IconeChaveamento, ativa: (caminho) => caminho.startsWith('/chaveamento') },
];

// "Mais" fica ativa em todas as telas que não pertencem às outras abas
const ABA_MAIS = { para: '/mais', rotulo: 'Mais', Icone: IconeMais };

export default function BarraInferior() {
  const { pathname } = useLocation();
  const algumaAtiva = ABAS.some((aba) => aba.ativa(pathname));
  const itens = [...ABAS.map((aba) => ({ ...aba, estaAtiva: aba.ativa(pathname) })), { ...ABA_MAIS, estaAtiva: !algumaAtiva }];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-[#0A101C]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <ul className="mx-auto flex max-w-md">
        {itens.map(({ para, rotulo, Icone, estaAtiva }) => (
          <li key={para} className="flex-1">
            <Link
              to={para}
              aria-current={estaAtiva ? 'page' : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                estaAtiva ? 'text-primaria-clara' : 'text-texto-2 hover:text-texto'
              }`}
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-xl transition-colors ${
                  estaAtiva ? 'bg-primaria text-white' : ''
                }`}
              >
                <Icone tamanho={22} />
              </span>
              {rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
