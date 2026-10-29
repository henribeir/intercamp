// ============================================================
// Validação do login do mestre
// ============================================================
import { z } from './comuns.js';

export const loginSchema = z
  .object({
    email: z.string().trim().email(),
    senha: z.string().min(1).max(200),
  })
  .strict();
