// ============================================================
// TELA NOTÍCIAS: uma notícia em destaque (grande) e a lista
// das demais com miniaturas, como no mockup.
// ============================================================
import { Link } from 'react-router-dom';
import { useNoticias } from '../hooks/consultas';
import TituloPagina from '../components/TituloPagina';
import ImagemNoticia from '../components/ImagemNoticia';
import { Carregando, Erro, Vazio } from '../components/Estados';
import { dataPorExtenso } from '../utils/formatos';

function Destaque({ noticia }) {
  return (
    <Link to={`/noticias/${noticia.id}`} className="block overflow-hidden rounded-3xl border border-borda bg-superficie">
      <ImagemNoticia url={noticia.imagem_url} className="h-48 w-full" />
      <div className="p-4">
        <span className="rounded-md bg-primaria px-2 py-0.5 text-[11px] font-bold text-white uppercase">Destaque</span>
        <h2 className="mt-2 font-display text-2xl leading-tight font-bold">{noticia.titulo}</h2>
        {noticia.resumo && <p className="mt-1 text-sm text-texto-2">{noticia.resumo}</p>}
        <p className="mt-2 text-xs text-texto-2">{dataPorExtenso(noticia.publicada_em)}</p>
      </div>
    </Link>
  );
}

function ItemNoticia({ noticia }) {
  return (
    <Link to={`/noticias/${noticia.id}`} className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-superficie">
      <ImagemNoticia url={noticia.imagem_url} className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold">{noticia.titulo}</h3>
        <p className="mt-0.5 text-xs text-texto-2">{dataPorExtenso(noticia.publicada_em)}</p>
      </div>
    </Link>
  );
}

export default function Noticias() {
  const { data: noticias, isPending, isError, error, refetch } = useNoticias();

  // Destaque: a mais recente marcada como destaque (ou a mais recente de todas)
  const destaque = noticias?.find((n) => n.destaque) ?? noticias?.[0];
  const demais = noticias?.filter((n) => n.id !== destaque?.id) ?? [];

  return (
    <>
      <TituloPagina titulo="Notícias" voltar />
      {isPending && <Carregando quantidade={2} texto="Carregando notícias…" />}
      {isError && <Erro erro={error} tentarDeNovo={refetch} />}
      {noticias && noticias.length === 0 && <Vazio titulo="Nenhuma notícia publicada ainda" />}

      {destaque && <Destaque noticia={destaque} />}
      {demais.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1">
          {demais.map((noticia) => (
            <li key={noticia.id}>
              <ItemNoticia noticia={noticia} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
