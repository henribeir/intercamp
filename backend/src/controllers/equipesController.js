// ============================================================
// CONTROLLER das equipes (turmas)
// Mudou uma turma? Nome e cor aparecem em jogos, chaveamento e ranking.
// ============================================================
import * as equipesService from '../services/equipesService.js';
import { notificar } from '../services/tempoReal.js';

const ESCOPOS_EQUIPE = ['jogos', 'chaveamento', 'ranking'];

/** GET /api/equipes */
export async function listar(req, res) {
  res.json(await equipesService.listarEquipes());
}

/** POST /api/equipes (mestre) */
export async function criar(req, res) {
  const equipe = await equipesService.criarEquipe(req.validado.body);
  notificar(ESCOPOS_EQUIPE);
  res.status(201).json(equipe);
}

/** PATCH /api/equipes/:id (mestre) */
export async function editar(req, res) {
  const equipe = await equipesService.editarEquipe(req.validado.params.id, req.validado.body);
  notificar(ESCOPOS_EQUIPE);
  res.json(equipe);
}

/** DELETE /api/equipes/:id (mestre) */
export async function excluir(req, res) {
  await equipesService.excluirEquipe(req.validado.params.id);
  notificar(ESCOPOS_EQUIPE);
  res.status(204).end();
}
