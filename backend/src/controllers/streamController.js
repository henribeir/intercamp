// ============================================================
// CONTROLLER do tempo real (SSE)
// ============================================================
import { conectarCliente } from '../services/tempoReal.js';

/** GET /api/stream — conexão que fica aberta recebendo avisos */
export function abrir(req, res) {
  conectarCliente(req, res);
}
