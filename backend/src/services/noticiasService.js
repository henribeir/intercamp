// ============================================================
// SERVICE das notícias
// ============================================================
import { query } from '../db/pool.js';
import { ErroHttp } from '../utils/ErroHttp.js';
import { montarSet } from '../utils/sql.js';

const COLUNAS = 'id, titulo, resumo, corpo, imagem_url, destaque, publicada_em';

/** Mais recentes primeiro. */
export async function listarNoticias() {
  const { rows } = await query(`SELECT ${COLUNAS} FROM noticias ORDER BY publicada_em DESC, id DESC`);
  return rows;
}

export async function obterNoticia(id) {
  const { rows } = await query(`SELECT ${COLUNAS} FROM noticias WHERE id = $1`, [id]);
  if (rows.length === 0) throw new ErroHttp(404, 'Notícia não encontrada');
  return rows[0];
}

/** Se publicada_em não vier, usa o momento atual. */
export async function criarNoticia(dados) {
  const { rows } = await query(
    `INSERT INTO noticias (titulo, resumo, corpo, imagem_url, destaque, publicada_em)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, now()))
     RETURNING ${COLUNAS}`,
    [dados.titulo, dados.resumo, dados.corpo, dados.imagem_url, dados.destaque, dados.publicada_em],
  );
  return rows[0];
}

export async function editarNoticia(id, dados) {
  const { trecho, valores } = montarSet(dados, 2);
  const { rows } = await query(`UPDATE noticias SET ${trecho} WHERE id = $1 RETURNING ${COLUNAS}`, [id, ...valores]);
  if (rows.length === 0) throw new ErroHttp(404, 'Notícia não encontrada');
  return rows[0];
}

export async function excluirNoticia(id) {
  const { rowCount } = await query('DELETE FROM noticias WHERE id = $1', [id]);
  if (rowCount === 0) throw new ErroHttp(404, 'Notícia não encontrada');
}
