// ============================================================
// APP: monta o Express com segurança, CORS, JSON e rotas.
// Fica separado do server.js para poder ser testado (supertest)
// sem abrir uma porta de verdade.
// ============================================================
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config.js';
import { rotas } from './routes/index.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/erros.js';

export const app = express();

// No Render a API fica atrás de um proxy. Isto faz o Express enxergar
// o IP real de quem chama (necessário para o limite de tentativas de login).
app.set('trust proxy', 1);

// Cabeçalhos HTTP de segurança
app.use(helmet());

// CORS: só o front-end autorizado (FRONTEND_URL) pode chamar a API pelo navegador
app.use(
  cors({
    origin(origem, callback) {
      // Sem "origin" = chamada fora do navegador (curl, Render, testes): liberada
      if (!origem || config.origensPermitidas.includes(origem)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  }),
);

// Lê corpo JSON das requisições (limite pequeno: só precisamos de textos curtos)
app.use(express.json({ limit: '100kb' }));

// Todas as rotas da API começam com /api
app.use('/api', rotas);

// Tratamento de 404 e de erros (sempre por último)
app.use(rotaNaoEncontrada);
app.use(tratarErros);
