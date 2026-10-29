// ============================================================
// Configuração central: lê o arquivo .env uma única vez e
// expõe os valores para o resto do sistema.
// Assim, nenhum outro arquivo precisa usar process.env direto.
// ============================================================
import 'dotenv/config';

export const config = {
  porta: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || '',

  // FRONTEND_URL pode ter várias origens separadas por vírgula
  origensPermitidas: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean),

  jwtSecret: process.env.JWT_SECRET || '',
  mestreEmail: process.env.MESTRE_EMAIL || '',
  mestreSenhaHash: process.env.MESTRE_SENHA_HASH || '',

  emProducao: process.env.NODE_ENV === 'production',

  // DB_DRIVER=memoria troca o PostgreSQL de verdade por um PostgreSQL
  // em memória (PGlite). Usado SÓ nos testes (veja tests/setup.js).
  bancoEmMemoria: process.env.DB_DRIVER === 'memoria',
};
