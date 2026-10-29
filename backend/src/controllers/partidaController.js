// ============================================================
// CONTROLLER do andamento da partida (todas as rotas são do mestre)
// Cada resposta devolve o jogo completo já atualizado, e os
// clientes conectados no SSE recebem um aviso do que mudou.
// ============================================================
import * as partidaService from '../services/partidaService.js';
import { notificar } from '../services/tempoReal.js';

// Placar muda o card do jogo e o chaveamento
const ESCOPOS_PLACAR = ['jogos', 'chaveamento'];
// Mudar o status (sobretudo encerrar/reabrir) também mexe no ranking
const ESCOPOS_STATUS = ['jogos', 'chaveamento', 'ranking'];

/** PATCH /api/jogos/:id/status  { acao, vencedor_id? } */
export async function status(req, res) {
  const jogo = await partidaService.alterarStatus(req.validado.params.id, req.validado.body);
  notificar(ESCOPOS_STATUS, jogo.id);
  res.json(jogo);
}

/** POST /api/jogos/:id/eventos  { tipo, equipe_id, minuto?, jogador? } */
export async function criarEvento(req, res) {
  const jogo = await partidaService.registrarEvento(req.validado.params.id, req.validado.body);
  notificar(ESCOPOS_PLACAR, jogo.id);
  res.status(201).json(jogo);
}

/** DELETE /api/jogos/:id/eventos/:eventoId */
export async function excluirEvento(req, res) {
  const { id, eventoId } = req.validado.params;
  const jogo = await partidaService.desfazerEvento(id, eventoId);
  notificar(ESCOPOS_PLACAR, jogo.id);
  res.json(jogo);
}

/** POST /api/jogos/:id/pontos  { time: 'A'|'B', delta: 1|-1 } */
export async function ponto(req, res) {
  const jogo = await partidaService.registrarPonto(req.validado.params.id, req.validado.body);
  notificar(ESCOPOS_PLACAR, jogo.id);
  res.json(jogo);
}
