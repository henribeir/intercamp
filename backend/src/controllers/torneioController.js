// ============================================================
// CONTROLLER do torneio
// ============================================================
import { obterTorneio } from '../services/torneioService.js';

/** GET /api/torneio */
export async function obter(req, res) {
  res.json(await obterTorneio());
}
