// ============================================================
// ROTAS de equipes  (/api/equipes)
// ============================================================
import { Router } from 'express';
import { exigirMestre } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';
import { paramsId } from '../schemas/comuns.js';
import { criarEquipeSchema, editarEquipeSchema } from '../schemas/equipes.js';
import * as equipes from '../controllers/equipesController.js';

export const rotasEquipes = Router();

// Pública
rotasEquipes.get('/', equipes.listar);

// Mestre
rotasEquipes.post('/', exigirMestre, validar({ body: criarEquipeSchema }), equipes.criar);
rotasEquipes.patch('/:id', exigirMestre, validar({ params: paramsId, body: editarEquipeSchema }), equipes.editar);
rotasEquipes.delete('/:id', exigirMestre, validar({ params: paramsId }), equipes.excluir);
