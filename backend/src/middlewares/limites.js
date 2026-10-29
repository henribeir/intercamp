// ============================================================
// Limite de requisições (proteção contra "chutar" senhas).
// ============================================================
import { rateLimit } from 'express-rate-limit';

// Login: no máximo 10 tentativas a cada 15 minutos por endereço IP
export const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7', // envia o cabeçalho RateLimit com o que resta
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Aguarde 15 minutos e tente de novo.' },
});
