// ============================================================
// SERVICE do ranking: busca os dados no banco e entrega
// para as funções puras de ranking.js fazerem a conta.
// ============================================================
import { query } from '../db/pool.js';
import { ErroHttp } from '../utils/ErroHttp.js';
import { calcularRanking, PONTUACAO_PADRAO } from './ranking.js';

/** GET /api/ranking?competicao=slug  (sem competição = ranking geral) */
export async function obterRanking(slugCompeticao) {
  const { rows: torneio } = await query('SELECT pontuacao FROM torneio WHERE id = 1');
  const pontuacao = { ...PONTUACAO_PADRAO, ...(torneio[0]?.pontuacao || {}) };

  const { rows: competicoes } = slugCompeticao
    ? await query('SELECT id, slug, nome, cor, formato_placar, campeao_id FROM competicoes WHERE slug = $1', [slugCompeticao])
    : await query('SELECT id, slug, nome, cor, formato_placar, campeao_id FROM competicoes ORDER BY ordem');

  if (slugCompeticao && competicoes.length === 0) {
    throw new ErroHttp(404, 'Competição não encontrada');
  }

  const { rows: jogos } = await query(
    `SELECT competicao_id, status, equipe_a_id, equipe_b_id, placar_a, placar_b, vencedor_id
       FROM jogos WHERE competicao_id = ANY($1::int[])`,
    [competicoes.map((c) => c.id)],
  );
  const { rows: equipes } = await query('SELECT id, nome, slug, cor, escudo_url FROM equipes');

  const classificacao = calcularRanking({
    equipes,
    competicoes,
    jogos,
    pontuacao,
    porCompeticao: Boolean(slugCompeticao),
  });

  const competicao = slugCompeticao
    ? { slug: competicoes[0].slug, nome: competicoes[0].nome, cor: competicoes[0].cor, formato_placar: competicoes[0].formato_placar }
    : null;

  return { competicao, pontuacao, classificacao };
}
