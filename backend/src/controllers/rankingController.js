// ============================================================
// CONTROLLER do ranking das turmas
// ============================================================
import { obterRanking } from '../services/rankingService.js';

/** GET /api/ranking?competicao= */
export async function obter(req, res) {
  res.json(await obterRanking(req.validado.query.competicao));
}
