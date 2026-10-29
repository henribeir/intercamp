// ============================================================
// Gera o hash bcrypt da senha do mestre para o .env.
// Guardamos só o hash: nem quem lê o .env descobre a senha.
//
// Uso:  npm run hash-senha
//       (o script pergunta a senha no terminal)
// ============================================================
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcryptjs';

const TAMANHO_MINIMO = 8;
const CUSTO_BCRYPT = 10; // quanto maior, mais lento (e mais difícil de quebrar)

const leitor = createInterface({ input: stdin, output: stdout });
const senha = await leitor.question('Digite a senha do mestre: ');
leitor.close();

if (senha.length < TAMANHO_MINIMO) {
  console.error(`A senha precisa ter pelo menos ${TAMANHO_MINIMO} caracteres.`);
  process.exit(1);
}

const hash = await bcrypt.hash(senha, CUSTO_BCRYPT);

console.log('\nCopie a linha abaixo para o seu arquivo .env:\n');
console.log(`MESTRE_SENHA_HASH=${hash}\n`);
