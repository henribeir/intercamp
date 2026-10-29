// ============================================================
// CONTROLLER de autenticação
// ============================================================
import { autenticar } from '../services/authService.js';

/** POST /api/auth/login  { email, senha } */
export async function login(req, res) {
  const { email, senha } = req.validado.body;
  const resultado = await autenticar(email, senha);
  res.json(resultado);
}
