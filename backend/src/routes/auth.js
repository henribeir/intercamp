// ============================================================
// ROTAS de autenticação  (/api/auth)
// ============================================================
import { Router } from 'express';
import { limiteLogin } from '../middlewares/limites.js';
import { validar } from '../middlewares/validar.js';
import { loginSchema } from '../schemas/auth.js';
import * as auth from '../controllers/authController.js';

export const rotasAuth = Router();

// O limite vem antes da validação: toda tentativa conta
rotasAuth.post('/login', limiteLogin, validar({ body: loginSchema }), auth.login);
