// ============================================================
// MODO DEMONSTRAÇÃO: liga a API SEM banco de dados de verdade.
//
// Usa o mesmo PostgreSQL em memória dos testes (PGlite), já
// carregado com os dados reais da tabela oficial (carga.js).
// Não precisa de Neon, de .env nem de internet.
//
// Como rodar:   npm run demo
// Login mestre: mestre@intercamp.com  /  intercamp123
//
// ATENÇÃO: tudo fica só na memória. Ao fechar (Ctrl+C), os
// placares e notícias criados se perdem e, ao ligar de novo,
// a tabela volta ao começo. Use só para testar, nunca no evento!
// ============================================================
import bcrypt from 'bcryptjs';

const MESTRE_DEMO = { email: 'mestre@intercamp.com', senha: 'intercamp123' };

// Estas variáveis precisam existir ANTES de importar o app,
// porque o config.js lê tudo uma única vez.
process.env.DB_DRIVER = 'memoria';
process.env.JWT_SECRET = 'segredo-so-para-a-demonstracao';
process.env.MESTRE_EMAIL = MESTRE_DEMO.email;
process.env.MESTRE_SENHA_HASH = bcrypt.hashSync(MESTRE_DEMO.senha, 10);

// Import dinâmico: só agora, com as variáveis já definidas
const { comTransacao } = await import('../src/db/pool.js');
const { recriarBanco } = await import('../src/db/carga.js');

console.log('Criando o banco em memória com os dados da tabela oficial...');
await comTransacao((cliente) => recriarBanco(cliente));

// Liga o servidor (o mesmo do "npm start")
await import('../src/server.js');

console.log('');
console.log('=== MODO DEMONSTRAÇÃO (dados só na memória) ===');
console.log(`Login do mestre: ${MESTRE_DEMO.email} / ${MESTRE_DEMO.senha}`);
console.log('Agora rode o front-end em outro terminal: cd frontend && npm run dev');
