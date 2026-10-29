// ============================================================
// ROTAS: liga cada endereço (URL + método) ao seu controller.
// Todas ficam abaixo de /api (definido no app.js).
// ============================================================
import { Router } from 'express';
import { validar } from '../middlewares/validar.js';
import { rankingQuery } from '../schemas/competicoes.js';
import { obterSaude } from '../controllers/saudeController.js';
import * as torneio from '../controllers/torneioController.js';
import * as ranking from '../controllers/rankingController.js';
import * as stream from '../controllers/streamController.js';
import { rotasAuth } from './auth.js';
import { rotasCompeticoes } from './competicoes.js';
import { rotasEquipes } from './equipes.js';
import { rotasJogos } from './jogos.js';
import { rotasNoticias } from './noticias.js';

export const rotas = Router();

// Saúde da API (usado pelo Render e para testes rápidos)
rotas.get('/health', obterSaude);

// Login do mestre
rotas.use('/auth', rotasAuth);

// Consultas públicas
rotas.get('/torneio', torneio.obter);
rotas.get('/ranking', validar({ query: rankingQuery }), ranking.obter);
rotas.use('/competicoes', rotasCompeticoes);

// Cadastros (leitura pública, escrita só do mestre)
rotas.use('/equipes', rotasEquipes);
rotas.use('/jogos', rotasJogos);
rotas.use('/noticias', rotasNoticias);

// Tempo real (Server-Sent Events)
rotas.get('/stream', stream.abrir);
