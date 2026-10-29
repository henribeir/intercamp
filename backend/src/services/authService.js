// ============================================================
// SERVICE de autenticação: confere e-mail/senha do mestre
// e emite/verifica o token JWT.
// ============================================================
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { ErroHttp } from '../utils/ErroHttp.js';

const VALIDADE_DO_TOKEN = '12h';

// Hash de uma senha qualquer, usado quando o e-mail está errado.
// Assim a resposta demora o mesmo tempo nos dois casos e ninguém
// descobre pelo tempo de resposta se o e-mail existe.
let hashFalso;
function obterHashFalso() {
  hashFalso ??= bcrypt.hashSync('senha-que-nao-existe', 10);
  return hashFalso;
}

/** Confere as credenciais e devolve { token, tipo, expira_em }. */
export async function autenticar(email, senha) {
  if (!config.jwtSecret || !config.mestreEmail || !config.mestreSenhaHash) {
    // Erro de configuração do servidor: vai para o log, e o usuário recebe "Erro interno"
    throw new Error('Login do mestre não configurado: defina JWT_SECRET, MESTRE_EMAIL e MESTRE_SENHA_HASH no .env');
  }

  const emailConfere = email.toLowerCase() === config.mestreEmail.toLowerCase();
  const hashParaComparar = emailConfere ? config.mestreSenhaHash : obterHashFalso();
  const senhaConfere = await bcrypt.compare(senha, hashParaComparar);

  if (!emailConfere || !senhaConfere) {
    throw new ErroHttp(401, 'E-mail ou senha incorretos');
  }

  const token = jwt.sign({ papel: 'mestre' }, config.jwtSecret, {
    subject: config.mestreEmail,
    expiresIn: VALIDADE_DO_TOKEN,
    algorithm: 'HS256',
  });
  const { exp } = jwt.decode(token);

  return { token, tipo: 'Bearer', expira_em: new Date(exp * 1000).toISOString() };
}

/** Verifica o token; lança erro se for inválido ou estiver expirado. */
export function verificarToken(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
}
