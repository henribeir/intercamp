// ============================================================
// Conexão com o PostgreSQL (Neon na nuvem, ou um banco local).
// Usamos um "pool": um conjunto de conexões reaproveitadas,
// para não abrir uma conexão nova a cada requisição.
//
// Nos testes (DB_DRIVER=memoria) o pool é trocado por um
// PostgreSQL em memória com a MESMA interface (veja poolMemoria.js).
// O resto do sistema nem percebe a diferença.
// ============================================================
import pg from 'pg';
import { config } from '../config.js';

const { Pool, types } = pg;

// Por padrão o pg converte colunas DATE em objetos Date do JavaScript,
// o que pode "voltar um dia" por causa do fuso horário.
// Aqui pedimos para manter a data como texto: '2026-05-20'.
const TIPO_DATE = 1082;
types.setTypeParser(TIPO_DATE, (valor) => valor);

function criarPoolPostgres() {
  if (!config.databaseUrl) {
    console.warn('[db] Atenção: DATABASE_URL não definida no .env');
  }

  // Banco local (localhost) normalmente não usa SSL; o Neon exige SSL.
  const bancoLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(config.databaseUrl);

  const novoPool = new Pool({
    connectionString: config.databaseUrl,
    ssl: bancoLocal ? false : { rejectUnauthorized: true },
    max: 10, // no máximo 10 conexões ao mesmo tempo (plano gratuito)
    connectionTimeoutMillis: 5000, // desiste após 5 s tentando conectar
    idleTimeoutMillis: 30000, // fecha conexões paradas há 30 s
  });

  // Se uma conexão parada cair (o Neon "dorme" quando ocioso),
  // apenas registramos o erro em vez de derrubar o servidor.
  novoPool.on('error', (erro) => {
    console.error('[db] Erro em conexão ociosa:', erro.message);
  });

  return novoPool;
}

async function criarPool() {
  if (config.bancoEmMemoria) {
    // Import dinâmico: o PGlite é dependência de desenvolvimento
    // e nem é instalado no servidor de produção.
    const { criarPoolEmMemoria } = await import('./poolMemoria.js');
    return criarPoolEmMemoria();
  }
  return criarPoolPostgres();
}

export const pool = await criarPool();

/**
 * Executa uma consulta SQL simples.
 * Use sempre parâmetros ($1, $2...) para evitar SQL Injection.
 * Ex.: query('SELECT * FROM equipes WHERE id = $1', [id])
 */
export function query(texto, parametros) {
  return pool.query(texto, parametros);
}

/**
 * Executa várias consultas como uma única transação:
 * ou tudo dá certo (COMMIT), ou nada é gravado (ROLLBACK).
 * Ex.: await comTransacao(async (cliente) => { await cliente.query(...) })
 */
export async function comTransacao(funcao) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await funcao(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release(); // devolve a conexão para o pool
  }
}
