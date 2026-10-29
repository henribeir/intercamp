// ============================================================
// ROTAS de jogos  (/api/jogos)
// ============================================================
import { Router } from 'express';
import { exigirMestre } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';
import { paramsId } from '../schemas/comuns.js';
import {
  listarJogosQuery, criarJogoSchema, editarJogoSchema, confrontoSchema,
  statusSchema, eventoSchema, paramsEvento, pontoSchema,
} from '../schemas/jogos.js';
import * as jogos from '../controllers/jogosController.js';
import * as partida from '../controllers/partidaController.js';

export const rotasJogos = Router();

// ---------- Públicas ----------
rotasJogos.get('/', validar({ query: listarJogosQuery }), jogos.listar);
rotasJogos.get('/:id', validar({ params: paramsId }), jogos.obter);

// ---------- Mestre: cadastro ----------
rotasJogos.post('/', exigirMestre, validar({ body: criarJogoSchema }), jogos.criar);
rotasJogos.patch('/:id', exigirMestre, validar({ params: paramsId, body: editarJogoSchema }), jogos.editar);
rotasJogos.delete('/:id', exigirMestre, validar({ params: paramsId }), jogos.excluir);
rotasJogos.patch('/:id/confronto', exigirMestre, validar({ params: paramsId, body: confrontoSchema }), jogos.confronto);

// ---------- Mestre: andamento da partida ----------
rotasJogos.patch('/:id/status', exigirMestre, validar({ params: paramsId, body: statusSchema }), partida.status);
rotasJogos.post('/:id/eventos', exigirMestre, validar({ params: paramsId, body: eventoSchema }), partida.criarEvento);
rotasJogos.delete('/:id/eventos/:eventoId', exigirMestre, validar({ params: paramsEvento }), partida.excluirEvento);
rotasJogos.post('/:id/pontos', exigirMestre, validar({ params: paramsId, body: pontoSchema }), partida.ponto);
