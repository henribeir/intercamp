// ============================================================
// SEED: apaga o banco, recria as tabelas e carrega os dados
// REAIS da tabela oficial do Interclasse (dados em carga.js).
//
// Como rodar:   npm run seed
// Em produção:  npm run seed -- --forcar   (apaga TUDO!)
// ============================================================
import { pool, comTransacao } from './pool.js';
import { recriarBanco } from './carga.js';
import { config } from '../config.js';

try {
  // Proteção: em produção o seed só roda com --forcar, pois apaga tudo
  if (config.emProducao && !process.argv.includes('--forcar')) {
    throw new Error('Em produção, use "npm run seed -- --forcar" (isso APAGA todos os dados).');
  }

  await comTransacao((cliente) => recriarBanco(cliente, console.log));
  console.log('Seed concluído com sucesso!');
} catch (erro) {
  console.error('Falha no seed:', erro.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
