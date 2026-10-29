// ============================================================
// ASSISTENTE DE CONFIGURAÇÃO (para colocar o InterCamp no ar)
//
// Pergunta, em português, o que precisa e faz sozinho:
//   1. Gera o JWT_SECRET (texto aleatório)
//   2. Gera o hash da senha do mestre
//   3. Grava o arquivo backend/.env
//   4. Cria as tabelas e os jogos no Neon (seed)
//   5. Mostra as variáveis para colar no Render
//
// Como rodar:  npm run configurar   (dentro da pasta backend)
//   ou dois cliques em CONFIGURAR.command (Mac) / CONFIGURAR.bat (Windows)
// ============================================================
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const PASTA_BACKEND = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARQUIVO_ENV = join(PASTA_BACKEND, '.env');
const TAMANHO_MINIMO_SENHA = 8;
const CUSTO_BCRYPT = 10;

const leitor = createInterface({ input: stdin, output: stdout });

/** Pergunta até a resposta passar na validação */
async function perguntar(texto, validar = () => null) {
  for (;;) {
    const resposta = (await leitor.question(texto)).trim();
    const erro = validar(resposta);
    if (!erro) return resposta;
    console.log(`   ⚠️  ${erro}`);
  }
}

async function confirmar(texto) {
  const resposta = await perguntar(`${texto} (s/n): `, (r) =>
    /^[sn]/i.test(r) ? null : 'Responda s (sim) ou n (não).',
  );
  return /^s/i.test(resposta);
}

try {
  console.log('\n=== InterCamp: configuração para colocar no ar ===\n');
  console.log('Tenha em mãos: a connection string do Neon e o seu usuário do GitHub.\n');

  // Já configurado antes? Dá para só zerar os jogos (ex.: depois dos testes, antes do evento)
  if (existsSync(ARQUIVO_ENV)) {
    console.log('O InterCamp já foi configurado neste computador. O que você quer fazer?');
    console.log('  1 - Zerar os jogos no Neon (volta a tabela oficial ao começo; APAGA placares e notícias)');
    console.log('  2 - Configurar tudo de novo (novo banco, nova senha do mestre...)');
    console.log('  3 - Sair sem mudar nada');
    const opcao = await perguntar('Digite 1, 2 ou 3: ', (r) => (/^[123]$/.test(r) ? null : 'Digite 1, 2 ou 3.'));
    if (opcao === '3') {
      console.log('\nNada foi alterado.');
      process.exit(0);
    }
    if (opcao === '1') {
      if (await confirmar('Tem certeza? Todos os placares e notícias serão apagados')) {
        const seed = spawnSync(process.execPath, ['src/db/seed.js'], { cwd: PASTA_BACKEND, stdio: 'inherit' });
        process.exitCode = seed.status === 0 ? 0 : 1;
      } else {
        console.log('\nNada foi alterado.');
      }
      process.exit();
    }
  }

  // 1. Banco (Neon)
  const databaseUrl = await perguntar(
    '1) Cole a connection string do Neon (começa com postgresql://):\n   ',
    (r) => (/^postgres(ql)?:\/\/.+@.+/.test(r) ? null : 'Não parece uma connection string. Copie de novo no Neon (botão Connect).'),
  );

  // 2. Site (GitHub Pages) -> FRONTEND_URL (só a origem, sem o nome do repositório)
  const usuarioGithub = await perguntar(
    '\n2) Seu usuário do GitHub (o que aparece em github.com/USUARIO):\n   ',
    (r) => (/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(r) ? null : 'Use só o nome de usuário, sem https:// e sem barras.'),
  );
  const frontendUrl = `https://${usuarioGithub.toLowerCase()}.github.io,http://localhost:5173`;

  // 3. Login do mestre
  const mestreEmail = await perguntar('\n3) E-mail do login do mestre (ex.: mestre@intercamp.com):\n   ', (r) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r) ? null : 'E-mail inválido.',
  );
  const senha = await perguntar(
    `\n4) Senha do mestre (mínimo ${TAMANHO_MINIMO_SENHA} caracteres; anote num lugar seguro!):\n   `,
    (r) => (r.length >= TAMANHO_MINIMO_SENHA ? null : `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`),
  );
  await perguntar('   Digite a senha de novo para conferir:\n   ', (r) =>
    r === senha ? null : 'As senhas não são iguais. Digite de novo.',
  );

  const jwtSecret = randomBytes(48).toString('hex');
  const mestreSenhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);

  // 4. Grava o .env (usado pelo seed e para rodar no computador)
  writeFileSync(
    ARQUIVO_ENV,
    [
      '# Gerado por "npm run configurar". NUNCA envie este arquivo para o GitHub!',
      'PORT=3000',
      `DATABASE_URL=${databaseUrl}`,
      `FRONTEND_URL=${frontendUrl}`,
      `JWT_SECRET=${jwtSecret}`,
      `MESTRE_EMAIL=${mestreEmail}`,
      `MESTRE_SENHA_HASH=${mestreSenhaHash}`,
      '',
    ].join('\n'),
  );
  console.log('\n✅ Arquivo backend/.env criado.');

  // 5. Seed no Neon
  console.log('\n5) Criar as tabelas e carregar os jogos da tabela oficial no Neon.');
  console.log('   ATENÇÃO: isso APAGA tudo o que já estiver no banco. Faça antes do evento, nunca durante.');
  if (await confirmar('   Criar agora?')) {
    const seed = spawnSync(process.execPath, ['src/db/seed.js'], { cwd: PASTA_BACKEND, stdio: 'inherit' });
    if (seed.status !== 0) {
      throw new Error('O seed falhou. Confira a connection string do Neon e rode de novo.');
    }
  } else {
    console.log('   Ok. Quando quiser, rode este assistente de novo ou "npm run seed" na pasta backend.');
  }

  // 6. Variáveis para o Render
  console.log('\n================================================================');
  console.log(' Agora, no Render: Environment > Add Environment Variable');
  console.log(' Crie uma variável para cada linha (NOME à esquerda, valor à direita):');
  console.log('================================================================\n');
  const variaveis = {
    NODE_VERSION: '22',
    NODE_ENV: 'production',
    DATABASE_URL: databaseUrl,
    FRONTEND_URL: frontendUrl,
    JWT_SECRET: jwtSecret,
    MESTRE_EMAIL: mestreEmail,
    MESTRE_SENHA_HASH: mestreSenhaHash,
  };
  for (const [nome, valor] of Object.entries(variaveis)) {
    console.log(`${nome}\n    ${valor}\n`);
  }
  console.log('Dica: no Render, "Add from .env" aceita colar tudo de uma vez neste formato:\n');
  for (const [nome, valor] of Object.entries(variaveis)) {
    console.log(`${nome}=${valor}`);
  }
  console.log('\n🔒 Não mande estes valores para ninguém: com eles dá para mexer no placar.\n');
} catch (erro) {
  console.error(`\nERRO: ${erro.message}\n`);
  process.exitCode = 1;
} finally {
  leitor.close();
}
