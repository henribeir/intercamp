// ============================================================
// CONTROLLER de saúde: recebe a requisição, chama o service
// e monta a resposta HTTP.
// ============================================================
import { verificarBanco } from '../services/saudeService.js';

/** GET /api/health */
export async function obterSaude(req, res) {
  const banco = await verificarBanco();

  res.json({
    status: 'ok',
    servico: 'InterCamp API',
    banco,
    horario: new Date().toISOString(),
  });
}
