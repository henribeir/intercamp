// ============================================================
// CONTROLLER das competições
// ============================================================
import { listarCompeticoes, obterChaveamento } from '../services/competicoesService.js';

/** GET /api/competicoes */
export async function listar(req, res) {
  res.json(await listarCompeticoes());
}

/** GET /api/competicoes/:slug/chaveamento */
export async function chaveamento(req, res) {
  res.json(await obterChaveamento(req.validado.params.slug));
}
