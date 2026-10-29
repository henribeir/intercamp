// ============================================================
// CONTROLE DE UM JOGO (/mestre/jogos/:id)
// Escolhe o controle certo: gols (futsal/handebol) ou vôlei.
// ============================================================
import { Link, useParams } from 'react-router-dom';
import { useJogo } from '../../hooks/consultas';
import TituloPagina from '../../components/TituloPagina';
import ControleGols from '../../components/mestre/ControleGols';
import ControleVolei from '../../components/mestre/ControleVolei';
import { Carregando, Erro } from '../../components/Estados';
import { descricaoJogo } from '../../utils/formatos';

export default function MestreJogo() {
  const { id } = useParams();
  const { data: jogo, isPending, isError, error, refetch } = useJogo(id);

  if (isPending) return <Carregando quantidade={2} texto="Carregando jogo…" />;
  if (isError) return <Erro erro={error} tentarDeNovo={error?.status === 404 ? null : refetch} />;

  return (
    <>
      <TituloPagina titulo="Controle do jogo" subtitulo={`${descricaoJogo(jogo)}${jogo.local ? ` · ${jogo.local}` : ''}`} voltar />

      {jogo.competicao.formato_placar === 'sets' ? <ControleVolei jogo={jogo} /> : <ControleGols jogo={jogo} />}

      <Link to={`/jogos/${jogo.id}`} className="mt-6 flex min-h-11 items-center justify-center text-sm font-semibold text-primaria-clara">
        Ver como o público vê
      </Link>
    </>
  );
}
