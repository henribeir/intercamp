// ============================================================
// ROTAS de notícias  (/api/noticias)
// ============================================================
import { Router } from 'express';
import { exigirMestre } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';
import { paramsId } from '../schemas/comuns.js';
import { criarNoticiaSchema, editarNoticiaSchema } from '../schemas/noticias.js';
import * as noticias from '../controllers/noticiasController.js';

export const rotasNoticias = Router();

// Públicas
rotasNoticias.get('/', noticias.listar);
rotasNoticias.get('/:id', validar({ params: paramsId }), noticias.obter);

// Mestre
rotasNoticias.post('/', exigirMestre, validar({ body: criarNoticiaSchema }), noticias.criar);
rotasNoticias.patch('/:id', exigirMestre, validar({ params: paramsId, body: editarNoticiaSchema }), noticias.editar);
rotasNoticias.delete('/:id', exigirMestre, validar({ params: paramsId }), noticias.excluir);
