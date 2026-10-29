// ============================================================
// SERVICE das competições (modalidade + naipe) e do chaveamento
// ============================================================
import { query } from '../db/pool.js';
import { ErroHttp } from '../utils/ErroHttp.js';
import { jsonEquipe } from '../utils/sql.js';
import { listarJogos } from './jogosService.js';

const COLUNAS_COMPETICAO = `
  c.id, c.slug, c.nome, c.esporte, c.naipe, c.formato_placar,
  c.sets_para_vencer, c.pontos_por_set, c.pontos_set_decisivo,
  c.cor, c.ordem,
  ${jsonEquipe('campeao')} AS campeao,
  ${jsonEquipe('vice')} AS vice`;

const JOINS_PODIO = `
  LEFT JOIN equipes campeao ON campeao.id = c.campeao_id
  LEFT JOIN equipes vice ON vice.id = c.vice_id`;

/** Lista as competições na ordem de exibição, com campeão, vice e contagem de jogos. */
export async function listarCompeticoes() {
  const { rows } = await query(`
    SELECT ${COLUNAS_COMPETICAO},
           (SELECT count(*)::int FROM jogos j WHERE j.competicao_id = c.id) AS total_jogos,
           (SELECT count(*)::int FROM jogos j WHERE j.competicao_id = c.id AND j.status = 'encerrado') AS jogos_encerrados
      FROM competicoes c
      ${JOINS_PODIO}
     ORDER BY c.ordem, c.id
  `);
  return rows;
}

/**
 * Agrupa os jogos em rodadas (uma por fase_ordem), em ordem.
 * Função pura: recebe a lista de jogos já formatada.
 */
export function montarRodadas(jogos) {
  // id -> número, para mostrar "Vencedor do jogo 2" com o número certo
  const numeroPorId = new Map(jogos.map((jogo) => [jogo.id, jogo.numero]));
  const rodadas = new Map();

  const ordenados = [...jogos].sort((x, y) => x.fase_ordem - y.fase_ordem || x.numero - y.numero);
  for (const jogo of ordenados) {
    if (!rodadas.has(jogo.fase_ordem)) {
      rodadas.set(jogo.fase_ordem, { fase_ordem: jogo.fase_ordem, rotulo: jogo.fase_rotulo, jogos: [] });
    }
    rodadas.get(jogo.fase_ordem).jogos.push({
      id: jogo.id,
      numero: jogo.numero,
      eh_final: jogo.eh_final,
      status: jogo.status,
      equipe_a: jogo.equipe_a,
      equipe_b: jogo.equipe_b,
      rotulo_a: jogo.rotulo_a,
      rotulo_b: jogo.rotulo_b,
      placar_a: jogo.placar_a,
      placar_b: jogo.placar_b,
      vencedor_id: jogo.vencedor_id,
      origem_a_jogo_id: jogo.origem_a_jogo_id,
      origem_b_jogo_id: jogo.origem_b_jogo_id,
      origem_a_numero: numeroPorId.get(jogo.origem_a_jogo_id) ?? null,
      origem_b_numero: numeroPorId.get(jogo.origem_b_jogo_id) ?? null,
      data: jogo.data,
      horario: jogo.horario,
      local: jogo.local,
    });
  }

  return [...rodadas.values()];
}

/** GET /api/competicoes/:slug/chaveamento */
export async function obterChaveamento(slug) {
  const { rows } = await query(`SELECT ${COLUNAS_COMPETICAO} FROM competicoes c ${JOINS_PODIO} WHERE c.slug = $1`, [slug]);
  if (rows.length === 0) throw new ErroHttp(404, 'Competição não encontrada');

  const { campeao, vice, ...competicao } = rows[0];
  const jogos = await listarJogos({ competicao: slug });

  return { competicao, campeao, vice, rodadas: montarRodadas(jogos) };
}
