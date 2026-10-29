// ============================================================
// SERVICE de saúde: regra de negócio de "a API está de pé?".
// Services conversam com o banco; controllers não.
// ============================================================
import { query } from '../db/pool.js';

/** Verifica se o banco responde. Nunca lança erro: devolve 'ok' ou 'indisponivel'. */
export async function verificarBanco() {
  try {
    await query('SELECT 1');
    return 'ok';
  } catch {
    return 'indisponivel';
  }
}
