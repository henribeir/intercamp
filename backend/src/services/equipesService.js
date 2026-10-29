// ============================================================
// SERVICE das equipes (turmas)
// ============================================================
import { query } from '../db/pool.js';
import { ErroHttp } from '../utils/ErroHttp.js';
import { gerarSlug } from '../utils/slug.js';
import { montarSet } from '../utils/sql.js';

const COLUNAS = 'id, nome, slug, serie, curso, cor, escudo_url';

export async function listarEquipes() {
  const { rows } = await query(`SELECT ${COLUNAS} FROM equipes ORDER BY serie, nome`);
  return rows;
}

export async function criarEquipe(dados) {
  const slug = dados.slug ?? gerarSlug(dados.nome);
  const { rows } = await query(
    `INSERT INTO equipes (nome, slug, serie, curso, cor, escudo_url)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUNAS}`,
    [dados.nome, slug, dados.serie, dados.curso, dados.cor, dados.escudo_url],
  );
  return rows[0];
}

/** Altera só os campos enviados. O slug não muda sozinho, para não quebrar links. */
export async function editarEquipe(id, dados) {
  const { trecho, valores } = montarSet(dados, 2);
  const { rows } = await query(
    `UPDATE equipes SET ${trecho} WHERE id = $1 RETURNING ${COLUNAS}`,
    [id, ...valores],
  );
  if (rows.length === 0) throw new ErroHttp(404, 'Equipe não encontrada');
  return rows[0];
}

/**
 * Exclui uma turma, mas só se ela não estiver em nenhum jogo ou pódio.
 * (O banco apagaria as referências sozinho com SET NULL; preferimos avisar.)
 */
export async function excluirEquipe(id) {
  const { rows: uso } = await query(
    `SELECT
       (SELECT count(*)::int FROM jogos
         WHERE equipe_a_id = $1 OR equipe_b_id = $1 OR vencedor_id = $1) AS jogos,
       (SELECT count(*)::int FROM competicoes
         WHERE campeao_id = $1 OR vice_id = $1) AS podios`,
    [id],
  );
  const { jogos, podios } = uso[0];
  if (jogos > 0 || podios > 0) {
    throw new ErroHttp(409, `Esta turma não pode ser excluída: está em ${jogos} jogo(s) e ${podios} pódio(s).`);
  }

  const { rowCount } = await query('DELETE FROM equipes WHERE id = $1', [id]);
  if (rowCount === 0) throw new ErroHttp(404, 'Equipe não encontrada');
}
