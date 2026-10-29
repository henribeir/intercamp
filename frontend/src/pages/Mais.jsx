// ============================================================
// TELA MAIS: perfil do app, menu (itens do mockup + Tabela
// oficial) e o banner com a logo. No fim, a entrada do mestre.
// ============================================================
import { Link } from 'react-router-dom';
import TituloPagina from '../components/TituloPagina';
import {
  IconeApito, IconeCalendario, IconeChaveamento, IconeEquipes, IconeImagem,
  IconeInfo, IconeJornal, IconeLista, IconeRanking, IconeSeta,
} from '../components/Icones';

const LOGO = `${import.meta.env.BASE_URL}brand/logo.png`;

const ITENS = [
  { para: '/calendario', rotulo: 'Tabela de jogos', Icone: IconeCalendario },
  { para: '/tabela', rotulo: 'Tabela oficial', Icone: IconeImagem },
  { para: '/classificacao', rotulo: 'Classificação', Icone: IconeRanking },
  { para: '/chaveamento', rotulo: 'Chaveamento', Icone: IconeChaveamento },
  { para: '/equipes', rotulo: 'Equipes', Icone: IconeEquipes },
  { para: '/noticias', rotulo: 'Notícias', Icone: IconeJornal },
  { para: '/regras', rotulo: 'Regras do torneio', Icone: IconeLista },
  { para: '/sobre', rotulo: 'Sobre o InterCamp', Icone: IconeInfo },
];

export default function Mais() {
  return (
    <>
      <TituloPagina titulo="Mais" />

      {/* Perfil */}
      <Link to="/sobre" className="flex items-center gap-3 rounded-2xl border border-borda bg-superficie p-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-borda bg-fundo">
          <img src={LOGO} alt="" className="h-12 w-auto mix-blend-screen" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-xl font-bold">InterCamp</span>
          <span className="block text-sm text-texto-2">By 301 INT</span>
        </span>
        <IconeSeta tamanho={20} className="text-texto-2" />
      </Link>

      {/* Menu */}
      <nav aria-label="Mais opções" className="mt-4">
        <ul className="overflow-hidden rounded-2xl border border-borda bg-superficie">
          {ITENS.map(({ para, rotulo, Icone }) => (
            <li key={para} className="border-b border-borda/60 last:border-0">
              <Link to={para} className="flex min-h-13 items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2">
                <Icone tamanho={22} className="text-texto" />
                <span className="flex-1 text-[15px]">{rotulo}</span>
                <IconeSeta tamanho={18} className="text-texto-2" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Banner */}
      <section
        aria-label="InterCamp"
        className="mt-5 flex items-center justify-between gap-3 overflow-hidden rounded-3xl border border-borda bg-[radial-gradient(120%_100%_at_100%_0%,#1E4FD8_0%,#0B1C45_50%,#070B14_100%)] px-5 py-4"
      >
        <div>
          <p className="font-display text-2xl leading-none font-bold">InterCamp</p>
          <p className="mt-1 text-xs text-texto-2">Esporte, união, respeito e grandes conquistas!</p>
        </div>
        <img src={LOGO} alt="" className="h-20 w-auto mix-blend-screen" />
      </section>

      {/* Entrada discreta do mestre */}
      <Link
        to="/mestre"
        className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-texto-2 hover:text-texto"
      >
        <IconeApito tamanho={18} />
        Área do mestre
      </Link>
    </>
  );
}
