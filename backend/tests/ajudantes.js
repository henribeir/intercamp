// ============================================================
// Funções de apoio para os testes de API
// ============================================================
import request from 'supertest';
import { app } from '../src/app.js';
import { pool, query, comTransacao } from '../src/db/pool.js';
import { recriarBanco } from '../src/db/carga.js';
import { MESTRE_TESTE } from './constantes.js';

export { app, query };

/** Cliente HTTP de teste (não abre porta: chama o app direto) */
export const api = () => request(app);

/** Banco em memória volta ao estado do seed (tabela oficial) */
export function reiniciarBanco() {
  return comTransacao((cliente) => recriarBanco(cliente));
}

/** Desliga o banco em memória no fim do arquivo de teste */
export function encerrarBanco() {
  return pool.end();
}

/** Faz login como mestre e devolve o token JWT */
export async function entrarComoMestre() {
  const resposta = await api().post('/api/auth/login').send(MESTRE_TESTE);
  if (resposta.status !== 200) throw new Error(`Login de teste falhou: ${resposta.status}`);
  return resposta.body.token;
}

/** id de um jogo pelo slug da competição e número na tabela oficial */
export async function idDoJogo(slugCompeticao, numero) {
  const { rows } = await query(
    `SELECT j.id FROM jogos j JOIN competicoes c ON c.id = j.competicao_id
      WHERE c.slug = $1 AND j.numero = $2`,
    [slugCompeticao, numero],
  );
  return rows[0].id;
}

/** id de uma turma pelo nome ("301 INT") */
export async function idDaEquipe(nome) {
  const { rows } = await query('SELECT id FROM equipes WHERE nome = $1', [nome]);
  return rows[0].id;
}

/**
 * Atalhos para chamadas do mestre já com o token.
 * Ex.: const mestre = comoMestre(token);  await mestre.status(id, 'iniciar')
 */
export function comoMestre(token) {
  const auth = (req) => req.set('Authorization', `Bearer ${token}`);
  return {
    patch: (url, corpo) => auth(api().patch(url)).send(corpo),
    post: (url, corpo) => auth(api().post(url)).send(corpo),
    delete: (url) => auth(api().delete(url)),
    status: (jogoId, acao, extra = {}) => auth(api().patch(`/api/jogos/${jogoId}/status`)).send({ acao, ...extra }),
    gol: (jogoId, equipeId) => auth(api().post(`/api/jogos/${jogoId}/eventos`)).send({ tipo: 'gol', equipe_id: equipeId }),
  };
}
