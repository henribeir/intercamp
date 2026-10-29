// ============================================================
// CONTROLLER dos jogos (consulta e cadastro)
// Toda alteração de cadastro avisa jogos, chaveamento e ranking.
// ============================================================
import * as jogosService from '../services/jogosService.js';
import { notificar } from '../services/tempoReal.js';

const ESCOPOS_CADASTRO = ['jogos', 'chaveamento', 'ranking'];

/** GET /api/jogos?competicao=&status=&data= */
export async function listar(req, res) {
  res.json(await jogosService.listarJogos(req.validado.query));
}

/** GET /api/jogos/:id */
export async function obter(req, res) {
  res.json(await jogosService.obterJogo(req.validado.params.id));
}

/** POST /api/jogos (mestre) */
export async function criar(req, res) {
  const jogo = await jogosService.criarJogo(req.validado.body);
  notificar(ESCOPOS_CADASTRO, jogo.id);
  res.status(201).json(jogo);
}

/** PATCH /api/jogos/:id (mestre) */
export async function editar(req, res) {
  const jogo = await jogosService.editarJogo(req.validado.params.id, req.validado.body);
  notificar(ESCOPOS_CADASTRO, jogo.id);
  res.json(jogo);
}

/** DELETE /api/jogos/:id (mestre) */
export async function excluir(req, res) {
  const { id } = req.validado.params;
  await jogosService.excluirJogo(id);
  notificar(ESCOPOS_CADASTRO, id);
  res.status(204).end();
}

/** PATCH /api/jogos/:id/confronto (mestre) */
export async function confronto(req, res) {
  const jogo = await jogosService.definirConfronto(req.validado.params.id, req.validado.body);
  notificar(ESCOPOS_CADASTRO, jogo.id);
  res.json(jogo);
}
