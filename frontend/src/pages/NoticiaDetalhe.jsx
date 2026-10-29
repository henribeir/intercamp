// ============================================================
// TELA DE LEITURA DA NOTÍCIA (/noticias/:id)
// ============================================================
import { useParams } from 'react-router-dom';
import { useNoticia } from '../hooks/consultas';
import TituloPagina from '../components/TituloPagina';
import ImagemNoticia from '../components/ImagemNoticia';
import { Carregando, Erro } from '../components/Estados';
import { dataPorExtenso } from '../utils/formatos';

export default function NoticiaDetalhe() {
  const { id } = useParams();
  const { data: noticia, isPending, isError, error, refetch } = useNoticia(id);

  return (
    <>
      <TituloPagina titulo="Notícias" voltar />
      {isPending && <Carregando quantidade={1} texto="Carregando notícia…" />}
      {isError && <Erro erro={error} tentarDeNovo={error?.status === 404 ? null : refetch} />}

      {noticia && (
        <article>
          <ImagemNoticia url={noticia.imagem_url} className="h-52 w-full rounded-3xl" />
          {noticia.destaque && (
            <span className="mt-4 inline-block rounded-md bg-primaria px-2 py-0.5 text-[11px] font-bold text-white uppercase">
              Destaque
            </span>
          )}
          <h2 className="mt-2 font-display text-[30px] leading-tight font-bold">{noticia.titulo}</h2>
          <p className="mt-1 text-xs text-texto-2">
            <time dateTime={noticia.publicada_em}>{dataPorExtenso(noticia.publicada_em)}</time>
          </p>
          {noticia.resumo && <p className="mt-4 text-base font-medium">{noticia.resumo}</p>}
          {noticia.corpo &&
            noticia.corpo
              .split(/\n{2,}|\n/)
              .filter(Boolean)
              .map((paragrafo, indice) => (
                <p key={indice} className="mt-3 text-[15px] leading-relaxed text-texto/90">
                  {paragrafo}
                </p>
              ))}
        </article>
      )}
    </>
  );
}
