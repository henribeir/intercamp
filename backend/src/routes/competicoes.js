// ============================================================
// ROTAS de competições  (/api/competicoes) — públicas
// ============================================================
import { Router } from 'express';
import { validar } from '../middlewares/validar.js';
import { paramsSlug } from '../schemas/competicoes.js';
import * as competicoes from '../controllers/competicoesController.js';

export const rotasCompeticoes = Router();

rotasCompeticoes.get('/', competicoes.listar);
rotasCompeticoes.get('/:slug/chaveamento', validar({ params: paramsSlug }), competicoes.chaveamento);
