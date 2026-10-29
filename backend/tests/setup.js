// ============================================================
// PREPARAÇÃO DOS TESTES (roda antes de cada arquivo de teste)
//
// Estratégia para NÃO depender do banco real:
//   DB_DRIVER=memoria faz o src/db/pool.js usar o PGlite, um PostgreSQL
//   de verdade compilado para WebAssembly, que roda dentro do Node.
//   - Mesmo SQL do Neon (CHECKs, FOR UPDATE, json_build_object...).
//   - Cada arquivo de teste ganha um banco novo e vazio, só dele.
//   - Nada sai da máquina: o .env e o Neon nunca são tocados.
//
// Estas variáveis precisam existir ANTES de o app ser importado,
// porque o config.js lê tudo uma única vez.
// ============================================================
import bcrypt from 'bcryptjs';
import { MESTRE_TESTE, SEGREDO_JWT_TESTE } from './constantes.js';

process.env.DB_DRIVER = 'memoria';
process.env.JWT_SECRET = SEGREDO_JWT_TESTE;
process.env.MESTRE_EMAIL = MESTRE_TESTE.email;
// Custo 4 no bcrypt: rápido para testes (em produção usamos 10)
process.env.MESTRE_SENHA_HASH = bcrypt.hashSync(MESTRE_TESTE.senha, 4);
