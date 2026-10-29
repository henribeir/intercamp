// ============================================================
// NOTÍCIAS DO MESTRE (/mestre/noticias): criar, editar e excluir.
// ============================================================
import { useState } from 'react';
import { api } from '../../api/client';
import { useNoticias } from '../../hooks/consultas';
import { useAcaoMestre, vibrar } from '../../hooks/useAcaoMestre';
import TituloPagina from '../../components/TituloPagina';
import BotaoMestre from '../../components/mestre/BotaoMestre';
import Dialogo from '../../components/mestre/Dialogo';
import { Campo } from '../../components/mestre/Campos';
import AvisoRapido, { useAvisoRapido, textoDoErro } from '../../components/mestre/AvisoRapido';
import ImagemNoticia from '../../components/ImagemNoticia';
import { Carregando, Erro, Vazio } from '../../components/Estados';
import { dataPorExtenso } from '../../utils/formatos';

const VAZIA = { titulo: '', resumo: '', corpo: '', imagem_url: '', destaque: false };

/** Campos de texto vazios viram null (a API aceita null) */
function paraApi(valores) {
  const vazioViraNulo = (texto) => (texto.trim() === '' ? null : texto.trim());
  return {
    titulo: valores.titulo.trim(),
    resumo: vazioViraNulo(valores.resumo),
    corpo: vazioViraNulo(valores.corpo),
    imagem_url: vazioViraNulo(valores.imagem_url),
    destaque: valores.destaque,
  };
}

function FormNoticia({ noticia, aoTerminar, avisar }) {
  const acao = useAcaoMestre();
  const [valores, setValores] = useState(
    noticia
      ? { titulo: noticia.titulo, resumo: noticia.resumo ?? '', corpo: noticia.corpo ?? '', imagem_url: noticia.imagem_url ?? '', destaque: noticia.destaque }
      : VAZIA,
  );
  const mudar = (campo) => (evento) =>
    setValores((atual) => ({ ...atual, [campo]: evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value }));

  function salvar(evento) {
    evento.preventDefault();
    vibrar();
    const dados = paraApi(valores);
    acao.mutate(() => (noticia ? api.editarNoticia(noticia.id, dados) : api.criarNoticia(dados)), {
      onSuccess: () => {
        avisar(noticia ? 'Notícia atualizada' : 'Notícia publicada');
        aoTerminar();
      },
      onError: (erro) => avisar(textoDoErro(erro), 'erro'),
    });
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-3 rounded-2xl border border-primaria/50 bg-superficie p-4">
      <h2 className="font-display text-xl font-bold">{noticia ? 'Editar notícia' : 'Nova notícia'}</h2>
      <Campo rotulo="Título *" value={valores.titulo} onChange={mudar('titulo')} maxLength={120} required />
      <Campo rotulo="Resumo" value={valores.resumo} onChange={mudar('resumo')} maxLength={300} />
      <Campo rotulo="Texto" multilinha value={valores.corpo} onChange={mudar('corpo')} maxLength={10000} />
      <Campo
        rotulo="Link da imagem"
        type="url"
        inputMode="url"
        value={valores.imagem_url}
        onChange={mudar('imagem_url')}
        placeholder="https://..."
        dica="Opcional. Sem imagem, aparece a logo do InterCamp."
      />
      <label className="flex min-h-11 items-center gap-3 text-base">
        <input type="checkbox" checked={valores.destaque} onChange={mudar('destaque')} className="h-6 w-6 accent-primaria" />
        Mostrar como destaque
      </label>
      <div className="grid grid-cols-2 gap-2">
        <BotaoMestre variante="contorno" onClick={aoTerminar}>
          Cancelar
        </BotaoMestre>
        <BotaoMestre type="submit" variante="primaria" carregando={acao.isPending} disabled={!valores.titulo.trim()}>
          {noticia ? 'Salvar' : 'Publicar'}
        </BotaoMestre>
      </div>
    </form>
  );
}

export default function MestreNoticias() {
  const { data: noticias, isPending, isError, error, refetch } = useNoticias();
  const acao = useAcaoMestre();
  const { aviso, avisar } = useAvisoRapido();
  const [editando, setEditando] = useState(null); // null | 'nova' | notícia
  const [excluindo, setExcluindo] = useState(null);

  function excluir() {
    vibrar();
    acao.mutate(() => api.excluirNoticia(excluindo.id), {
      onSuccess: () => {
        avisar('Notícia excluída');
        setExcluindo(null);
      },
      onError: (erro) => avisar(textoDoErro(erro), 'erro'),
    });
  }

  return (
    <>
      <TituloPagina titulo="Notícias" voltar />

      {editando ? (
        <FormNoticia
          key={editando === 'nova' ? 'nova' : editando.id}
          noticia={editando === 'nova' ? null : editando}
          aoTerminar={() => setEditando(null)}
          avisar={avisar}
        />
      ) : (
        <BotaoMestre variante="primaria" className="min-h-14 w-full" onClick={() => setEditando('nova')}>
          + Nova notícia
        </BotaoMestre>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {isPending && <Carregando tipo="linhas" quantidade={3} />}
        {isError && <Erro erro={error} tentarDeNovo={refetch} />}
        {noticias && noticias.length === 0 && <Vazio titulo="Nenhuma notícia ainda" />}
        {noticias?.map((noticia) => (
          <article key={noticia.id} className="flex gap-3 rounded-2xl border border-borda bg-superficie p-3">
            <ImagemNoticia url={noticia.imagem_url} className="h-16 w-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold">{noticia.titulo}</h3>
              <p className="text-xs text-texto-2">
                {dataPorExtenso(noticia.publicada_em)}
                {noticia.destaque && <span className="ml-2 font-semibold text-primaria-clara">· Destaque</span>}
              </p>
              <div className="mt-2 flex gap-2">
                <BotaoMestre variante="neutro" className="min-h-11 px-4 text-sm" onClick={() => setEditando(noticia)}>
                  Editar
                </BotaoMestre>
                <BotaoMestre variante="contorno" className="min-h-11 px-4 text-sm text-ao-vivo" onClick={() => setExcluindo(noticia)}>
                  Excluir
                </BotaoMestre>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialogo aberto={excluindo !== null} aoFechar={() => setExcluindo(null)} titulo="Excluir notícia?">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-texto-2">"{excluindo?.titulo}" será apagada para todos. Não dá para desfazer.</p>
          <BotaoMestre variante="perigo" carregando={acao.isPending} onClick={excluir}>
            Excluir
          </BotaoMestre>
          <BotaoMestre variante="contorno" className="min-h-12" onClick={() => setExcluindo(null)}>
            Cancelar
          </BotaoMestre>
        </div>
      </Dialogo>

      <AvisoRapido aviso={aviso} />
    </>
  );
}
