// ============================================================
// MIDDLEWARE de autenticação do mestre.
// Exige o cabeçalho:  Authorization: Bearer <token JWT>
// Coloque-o antes das rotas que alteram dados.
// ============================================================
import { ErroHttp } from '../utils/ErroHttp.js';
import { verificarToken } from '../services/authService.js';

export function exigirMestre(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new ErroHttp(401, 'Acesso restrito ao mestre. Faça login e envie o cabeçalho "Authorization: Bearer <token>".');
  }

  let dados;
  try {
    dados = verificarToken(token);
  } catch (erro) {
    const mensagem = erro.name === 'TokenExpiredError'
      ? 'Sua sessão expirou. Faça login novamente.'
      : 'Token inválido. Faça login novamente.';
    throw new ErroHttp(401, mensagem);
  }

  if (dados.papel !== 'mestre') {
    throw new ErroHttp(401, 'Token sem permissão de mestre.');
  }

  // Disponível para os próximos middlewares/controllers
  req.usuario = { email: dados.sub, papel: dados.papel };
  next();
}
