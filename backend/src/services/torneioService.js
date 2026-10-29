// ============================================================
// SERVICE do torneio (dados gerais do evento)
// ============================================================
import { query } from '../db/pool.js';
import { ErroHttp } from '../utils/ErroHttp.js';

export async function obterTorneio() {
  const { rows } = await query(
    'SELECT nome, subtitulo, organizacao, lemas, pontuacao FROM torneio WHERE id = 1',
  );
  if (rows.length === 0) {
    throw new ErroHttp(404, 'Torneio não cadastrado. Rode "npm run seed".');
  }
  return rows[0];
}
